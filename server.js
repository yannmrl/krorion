import express from "express";
import fs from "fs";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import https from "https";
import cron from "node-cron";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { fileURLToPath } from "url";
import { AccessToken } from "livekit-server-sdk";

import fetch from 'node-fetch';
import webpush from 'web-push';

import { WebSocketServer } from "ws";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ dest: path.join(__dirname, "uploads/") });

const sslOptions =
{
	key: fs.readFileSync('/etc/letsencrypt/live/echo.wysigot.com/privkey.pem'),
	cert: fs.readFileSync('/etc/letsencrypt/live/echo.wysigot.com/fullchain.pem')
};

const PUBLIC_VAPID_KEY = 'XXX';
const PRIVATE_VAPID_KEY = 'XXX';

const LIVEKIT_API_KEY = "XXX";
const LIVEKIT_API_SECRET = "XXX";

webpush.setVapidDetails(
	'mailto:none@none.com',
	PUBLIC_VAPID_KEY,
	PRIVATE_VAPID_KEY
);

app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));

async function sendNotifications(payload, php="subscribe")
{
	try
	{
		let url;
		if (php == "lsdj") url = 'https://lsdj.wysigot.com/lsdj.php?type=get_subscriptions';
		else url = 'https://krorion.wysigot.com/subscribe.php';
		const response = await fetch(url);
		if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
		const subscriptions = await response.json();

		let success = 0;

		for (const sub of subscriptions)
		{
			try
			{
				await webpush.sendNotification(sub, payload);
				success++;
			}
			catch (err)
			{
				//console.error("❌ Erreur envoi notification :", err);
			}
		}
		console.log(`🔔 ${success} notifications envoyées sur ${subscriptions.length}`);
	}
	catch (err)
	{
		console.error("Erreur globale :", err);
	}

	return 1;
}

cron.schedule('0 7 * * *', () =>
{
	console.log('Reviving all');
	axios.get('https://krorion.wysigot.com/lab/db.php?revive=true&uuid=0');
});

cron.schedule('1 19 * * *', lsdj);

let lastbod = "";

async function lsdj()
{
	console.log("LSDJ");
	fs.readFile('../lsdj/data.json', 'utf-8', (err, data) =>
	{
		if (err) return 0;
		try
		{
			const json = JSON.parse(data);
			console.log(json);
			if (!json.newData)
			{
				console.log("No new article");
				return;
			}
			const payload = JSON.stringify(
			{
				title: "Nouvelle selection",
				body: json.title,
				image: `https://laselectiondujour.com/${json.image}`,
				url: `https://laselectiondujour.com/${json.link}`
			});
			if (lastbod != payload.body)
			{
				sendNotifications(payload, "lsdj");
				lastbod = payload.body;
			}
		}
		catch { return 0; }
	});
}

app.get("/token", async (req, res) =>
{
	try
	{
		const identity = req.query.identity;
		const uuid = req.query.uuid;
		const room = req.query.room || "main";

		let canPublish_ = false;
		if (identity == "streamer" && (await isListeux(uuid))) canPublish_ = true;

//    if (canPublish_) console.log(`publish token given to ${uuid}`);
//    else console.log(`${identity} ${uuid} unauthorized to publish`);

    // Crée un AccessToken avec identity
		const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, { identity });

		// Ajoute les permissions (grant) au token
		at.addGrant(
		{
			roomJoin: true,
			room: room,
			canPublish: canPublish_,
			canSubscribe: true
		});

		// Génère le token JWT
		const token = await at.toJwt();

		// Si token invalide, renvoie une erreur
		if (!token)
			return res.status(500).json({ error: "Impossible de générer le token" });

		return res.json({ token, room, identity });
  	}
	catch (err)
	{
		console.error("Erreur /token:", err);
		res.status(500).json({ error: "Erreur serveur" });
	}
});

app.post('/convert', upload.single("video"), (req, res) =>
{
	console.log("conversion called");
	if (!req.file) return res.status(400).send("Aucun fichier reçu");

	const inputPath = req.file.path;
	const outputPath = path.join(__dirname, "output", `${Date.now()}_converted.mp4`);

	console.log("Compression video");

	ffmpeg(inputPath)
	.videoFilters("scale=540:960:force_original_aspect_ratio=decrease")
	.output(outputPath)
	.on("end", () =>
	{
		console.log("Compression terminée");
		const fileStream = fs.createReadStream(outputPath);
		res.setHeader("Content-Type", "video/mp4");
		res.setHeader("Content-Disposition", `attachment; filename="converted.mp4"`);

		fileStream.pipe(res).on("finish", () =>
		{
			fs.unlinkSync(inputPath);
			fs.unlinkSync(outputPath);
		});
	})
	.on("error", (err) =>
	{
		console.log(err);
		fs.unlinkSync(inputPath);
		res.status(500).json({ error: err.message });
	})
	.run();
});

app.post('/thumbnail', upload.single('video'), (req, res) =>
{
    const inputPath = req.file.path;
    const thumbPath = path.join(__dirname, "temp", `${Date.now()}.png`);

    console.log("Acquisition miniature...");

    ffmpeg(inputPath)
        .screenshots(
	{
	    timestamps: ["1"],
	    filename: path.basename(thumbPath),
	    folder: path.dirname(thumbPath),
	    size: "540x?"
	})
	.on("end", () =>
	{
	    console.log("Acquisition terminée");

	    res.sendFile(thumbPath, () =>
	    {
		fs.unlinkSync(inputPath);
		fs.unlinkSync(thumbPath);
	    });
	})
	.on("error", err =>
	{
	    fs.unlinkSync(inputPath);
	    res.status(500).json({ error: err.message });
	});
});

app.post("/convert-webp", upload.single("video"), (req, res) =>
{
    const inputPath = req.file.path;
    const outputPath = path.join("output", `${Date.now()}_animation.webp`);

    if (!fs.existsSync("output")) fs.mkdirSync("output", { recursive: true });

    console.log("Conversion webp...");

    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Content-Disposition", 'inline; filename="animation.webp"');

    ffmpeg(inputPath)
    .outputOptions(
    [
        "-vf scale=540:-1:flags=lanczos,fps=10",
        "-loop 0"
    ])
    .output(outputPath)
    .on("end", () =>
    {
        const fileStream = fs.createReadStream(outputPath);
	console.log("Conversion terminée");
        fileStream.pipe(res).on("finish", () =>
	{
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        });
    })
    .on("error", err =>
    {
        fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        if (!res.headersSent) res.status(500).json({ error: err.message });
    })
    .run();
});

app.get('/notify', async (req, res) =>
{
    if (req.query.password != "XXX") return;

    const payload = JSON.stringify(
    {
        title: req.query.title,
        body: "",/*req.query.body,*/
        image: "",/*req.query.image,*/
        url: "",/*req.query.url*/
    });

    axios.get(`https://krorion.wysigot.com/mes/db.php?password=XXX&push=${req.query.title}%0A${req.query.body}`);

    await sendNotifications(payload);
    return res.status(400).json({ ok: true });
});

app.get('/notifyKro', async (req, res) =>
{
    const url = "https://krorion.wysigot.com/notifykro.php";
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
    const subscriptions = await response.json();

    let payload;

    for (const sub of subscriptions)
    {
        try
	{
	    payload = JSON.stringify(
	    {
		title: "Virement du Kartel",
		body: `Tu as reçu ${sub[0]} Krollars de la part du Kartel`
	    });
	    await webpush.sendNotification(sub[1], payload);
//	    console.log(sub[0]);
//	    console.log(sub[1]);
//	    console.log(payload);
	    console.log("Virement envoyé");
	}
	catch (err)
	{
	    console.error("❌ Erreur envoi notification :", err);
	}
    }
});

const server = https.createServer(sslOptions, app);

// WebSocket Server
const wss = new WebSocketServer({ server });

let streamerSocket = null;
const viewers = new Map(); // key: viewerId, value: socket
let viewersNames = [];
let liveTitle = "";
let totalDonation = 0;
let streamType = 0;
let streamer = "";
let streamerUUID = "";

let compass =
{
	uuid: "",
	label: "",
	showDistance: false,
	lat: undefined,
	lng: undefined,
	socket: undefined
};
let compassSockets = [];

async function isListeux(uuid)
{
    const response = await fetch(`https://krorion.wysigot.com/db.php?isListeux=${uuid}`);
    return parseInt(await response.text());
}

wss.on("connection", (socket) =>
{
    let currentViewerId = null;

    socket.on("message", async (message) =>
    {
        const data = JSON.parse(message);
	console.log(data.type);

        switch (data.type)
 		{
            case "streamer":
				if (await isListeux(data.uuid) == 0) return;
				streamerUUID = data.uuid;
				streamerSocket = socket;
				liveTitle = data.liveTitle;
				viewersNames = [];
				totalDonation = 0;
				console.log(`streamtype received : ${data.streamType}`);
				streamType = parseInt(data.streamType);
				streamer = data.name;
                console.log(`Streamer ${streamer} connecté`);
				if (viewers.has(streamerUUID)) return;
	            viewers.set(streamerUUID, socket);
				viewersNames.push([streamerUUID, data.name]);
				if (data.notify)
				{
	            	const payload = JSON.stringify(
		    		{
		        		title: `${streamer} est en live !`,
		        		body: liveTitle,
		        		url: "https://krorion.wysigot.com"
		    		});

		    		axios.get(`https://krorion.wysigot.com/mes/db.php?password=XXX&push=${streamer} est en live%0A${liveTitle}}`);

   		    		sendNotifications(payload);
				}
                break;

            case "viewer":
                currentViewerId = data.uuid;
				if (viewers.has(currentViewerId)) return;
                viewers.set(currentViewerId, socket);
				viewersNames.push([currentViewerId, data.name]);
                console.log("Viewer connecté :", data.name);
				console.log(`streamtype ${streamType}`);
				socket.send(JSON.stringify(
				{
		    		type: "live-info",
		    		liveTitle: liveTitle,
		    		viewers: viewersNames,
		    		streamType: streamType
				}));
				viewers.forEach(vws =>
				{
		    		vws.send(JSON.stringify(
		    		{
						type: "viewer-connect",
						viewerName: data.name
		    		}));
				});
                break;

            case "disconnect":
                if (currentViewerId && viewers.has(currentViewerId))
				{
                    viewers.delete(currentViewerId);
		    		let name;
		    		try
		    		{
						name = viewersNames.find(v => v[0] == currentViewerId)[1];
		    		}
		    		catch { name = "Unknown X."; }
                    console.log("Viewer déconnecté :", name);
		    		viewersNames = viewersNames.filter(v => v[0] != currentViewerId);
		    		viewers.forEach(vws =>
		    		{
						vws.send(JSON.stringify(
						{
		            		type: "viewer-disconnect",
			    			viewerName: name
		        		}));
		    		});
                }
                break;

	    	case "message":
				let _name;
				try
				{
		    		_name = viewersNames.find(v => v[0] == currentViewerId)[1];
				}
				catch { _name = "Unknown X."; }
				console.log(`${_name} : ${data.val}`);
				viewers.forEach(vws =>
				{
		    		vws.send(JSON.stringify(
		    		{
						type: "message-received",
						message: data.val,
		 				name: _name
		    		}));
				});
				break;

	    	case "donation":
				let __name;
				try
				{
		    		__name = viewersNames.find(v => v[0] == currentViewerId)[1];
				}
				catch { __name = "Unknown X."; }
				const url = `https://krorion.wysigot.com/db.php?donate=${data.donation}&uuid=${data.uuid}&streameruuid=${streamerUUID}`;
				console.log(url);
	        	const _response = await fetch(url);
				const _responseText = await _response.text();
	        	if (parseInt(_responseText) == 1)
				{
		    		totalDonation += parseInt(data.donation);
		    		viewers.forEach(vws =>
		    		{
						vws.send(JSON.stringify(
						{
			    			type: "donation",
			    			viewerName: __name,
			    			amount: data.donation,
			    			message: data.message,
			    			totalDonation: totalDonation
						}));
		    		});
				}
				break;

	    	case "camera-switch":
				if (socket != streamerSocket) return;
				viewers.forEach(vws =>
				{
		    		vws.send(JSON.stringify(
		    		{
						type: "camera-switch",
						scaleOrientation: data.scaleOrientation
		    		}));
				});
				break;

	    	case "compass-push":
				if (await isListeux(data.uuid) == 0) return;
				console.log(`pushing ${data.label}`);
				compass.socket = socket;
				compass.uuid = data.uuid;
				compass.label = data.label;
				compass.lat = data.lat;
				compass.lng = data.lng;
				compass.showDistance = data.showDistance;
				updateCompass();
				break;

	    	case "compass-receiver":
				console.log(`new receiver (${compassSockets.length+1})`);
				compassSockets.push(socket);
				socket.send(JSON.stringify(
				{
					type: "compass-update",
					label: compass.label,
					lat: compass.lat,
					lng: compass.lng,
					showDistance: compass.showDistance
				}));
				break;

	    	case "compass-update":
				if (compass.uuid != data.uuid) return;
				console.log(`updating compass ${data.lat} ${data.lng}`);
				compass.lat = data.lat;
				compass.lng = data.lng;

				updateCompass();
				break;

            default:
                console.log("Message inconnu :", data.type);
        }
    });

    socket.on("close", async () =>
    {
		if (compassSockets.includes(socket)) compassSockets = compassSockets.filter(s => s != socket);
        if (socket === streamerSocket)
		{
            console.log("Streamer déconnecté");
            streamerSocket = null;
	    	viewers.forEach(vws => vws.send(JSON.stringify({ type: "stream-end" })));
	    	viewers.clear();
	    	viewersNames = [];
        }
        if (currentViewerId && viewers.has(currentViewerId))
		{
            viewers.delete(currentViewerId);
	    	let name;
	    	try
	    	{
				name = viewersNames.find(v => v[0] == currentViewerId)[1];
	    	}
	    	catch { name = "Unknown X."; }
	    	viewersNames = viewersNames.filter(v => v[0] != currentViewerId);
	    	viewers.forEach(vws =>
	    	{
				vws.send(JSON.stringify(
				{
		            type: "viewer-disconnect",
	//	            viewerId: currentViewerId,
		    		viewerName: name
	        	}));
	    	});
        }
    });
});

function updateCompass()
{
	compassSockets.forEach(compassSocket =>
	{
		compassSocket.send(JSON.stringify(
		{
			type: "compass-update",
			label: compass.label,
			lat: compass.lat,
			lng: compass.lng,
			showDistance: compass.showDistance
		}));
	});
}

server.listen(443, () =>
{
    console.log('HTTPS server running on port 443');
//      lsdj();
});
