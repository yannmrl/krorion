const LIVEKIT_URL = "wss://krorion-live-a5oy7539.livekit.cloud";
const remoteVideo = document.getElementById('remoteVideo');
let token, room, isStreamer, livews, streamType, cameraStream;
let viewerList = [];
let voices = [];
let voicesReady = false;

function load_live()
{
    if (localStorage.getItem("uuid") == null)
		document.getElementsByClassName("login-container")[0].style.display = "flex";
	else
	{
		uuid = localStorage.getItem("uuid");
		var httpRequest = getHttpRequest();
		httpRequest.open('GET', `../db.php?check=${uuid}`, true);
		httpRequest.send();
		httpRequest.onreadystatechange = function ()
		{
			if (httpRequest.readyState === 4)
			{
				if (httpRequest.status === 200)
				{
					if (parseInt(httpRequest.responseText) == -1)
						document.getElementsByClassName("login-container")[0].style.display = "flex";
					else loggedin();
				}
			}
		}
	}
}

async function loggedin()
{
    console.log(`Logged in under uuid ${uuid}`);
	token = await getToken(false);
    if (!token.length)
	{
		showLabel("Le Fugitif n'est pas en streaming !");
		return;
	}

    room = new LivekitClient.Room();
    await room.connect(LIVEKIT_URL, token, { autoSubscribe: true });

	console.log('#');
	console.log(room);

	const streamer = room.remoteParticipants.get("streamer") != null;
    if (streamer) startViewing();
    else showLabel("Le Fugitif n'est pas en streaming !");
}

function log()
{
    username = document.getElementById("username").value
		.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z]/g, '');
    password = document.getElementById("password").value;
    if (!username || !password) return;

	var httpRequest0 = getHttpRequest();
    httpRequest0.open('GET', `../db.php?log_from_aurion=true&username=${username}&password=${password}`, true);
    httpRequest0.send();
    httpRequest0.onreadystatechange = function ()
    {
        if (httpRequest0.readyState === 4)
        {
            if (httpRequest0.status === 200)
            {
				if (httpRequest0.responseText.length > 2)
				{
					console.log(`Logged in as ${username}`);
					uuid = httpRequest0.responseText;
					localStorage.setItem("uuid", uuid);
					document.getElementsByClassName("login-container")[0].remove();
					showLabel(`Connecté`);
					loggedin();
				}
				else
				{
					document.getElementById("password").value = ""
					showLabel(`Identifiants incorrects`);
				}
			}
		}
	}
}

async function getToken(isStreamer = false)
{
	try
	{
    	const identity = isStreamer ? "streamer" : uuid;

    	const response = await fetch(`https://echo.wysigot.com/token?identity=${identity}&uuid=${uuid}`);
    	const data = await response.json();

    	return data.token;
	}
	catch { return ""; }
}

function showLabel(s)
{
	const label = document.getElementById('label');
	label.innerHTML = s;

	label.classList.add('visible');
	label.style.display = "block";

	setTimeout(() =>
	{
		label.classList.remove('visible');
		label.style.display = "none";
	}, 2000);
}

var getHttpRequest = function ()
{
	var httpRequest = false;

	if (window.XMLHttpRequest)
    {
		httpRequest = new XMLHttpRequest();
		if (httpRequest.overrideMimeType)
			httpRequest.overrideMimeType('text/xml');
	}
	else if (window.ActiveXObject)
    {
		try
        {
			httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e)
        {
			try
            {
				httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e) {}
		}
	}
	if (!httpRequest)
		return false;
	return httpRequest;
}

async function startViewing()
{
    document.getElementById('joinlive').style.display = "none";
	startWS(false);

	speechSynthesis.onvoiceschanged = () =>
	{
	    loadVoices();
	};

	loadVoices();	

	try
	{
    	console.log(room);

    	// Attacher les vidéos déjà publiées par les autres participants
    	participant = room.remoteParticipants.get("streamer")
    	Array.from(participant.trackPublications).forEach(pub =>
		{
			console.log(pub[1]);
			if (pub[1].source == "camera")
			{
				let camEmbed;
				if (document.getElementById('camEmbed') === null) 
					camEmbed = document.createElement('video');
				else camEmbed = document.getElementById('camEmbed');
			
				camEmbed.id = "camEmbed";
				pub[1].track.attach(camEmbed);
				document.body.appendChild(camEmbed);

				camEmbed.onloadeddata = async () =>
				{
					try
					{
						await camEmbed.play();
					}
					catch (err)
					{
						console.warn("cam embed play() échoué, retry:", err);
						setTimeout(() => camEmbed.play().catch(e => console.warn("cam embed retry fail:", e)), 500);
					}
				};
			}
			else
			{
				pub[1].track.attach(remoteVideo);
				console.log("not camera");
			}
			
			document.getElementById('chatMessages').innerHTML = '';
		});

    	console.log("Rejoint la room !");
  	}
	catch (err)
	{
    	console.error("Erreur rejoindre la room :", err);
	}
}

function startWS()
{
	let name;

	var httpRequest = getHttpRequest();
	httpRequest.open('GET', `../db.php?getPrenom=${uuid}`, true);
	httpRequest.send();
	httpRequest.onreadystatechange = async function ()
	{
		if (httpRequest.readyState === 4)
		{
			if (httpRequest.status === 200)
			{
				name = httpRequest.responseText;

				livews = new WebSocket("wss://echo.wysigot.com:443");
				livews.onopen = () =>
				{
        			livews.send(JSON.stringify({ uuid, type: "viewer", name}));
    			};

				livews.onmessage = async (msg) =>
				{
        			const data = JSON.parse(msg.data);
					console.log(`Incoming message`);
					console.log(data);
					if (data.type === "message-received")
					{
						message = document.createElement('div');
						author = document.createElement('label');
						author.innerHTML = data.name;
						content = document.createElement('label');
						content.innerHTML = data.message;
						message.appendChild(author);
						message.appendChild(content);
						document.getElementById('chatMessages').appendChild(message);
						document.getElementById("chatMessages").scrollTop = document.getElementById("chatMessages").scrollHeight;
					}
					else if (data.type === "live-info")
					{
						document.getElementById('liveTitle').innerHTML = data.liveTitle;
						viewerList = data.viewers.map(item => item[1]);
						document.getElementById("people").children[1].innerHTML = viewerList.length;
/*						if (data.streamType == 2 || data.streamType == 3)
						{
							remoteVideo.style.transform = "translateX(-50%) scaleX(1)";
							remoteVideo.style.width = "100vw";
						}
						else
						{
							remoteVideo.style.transform = "translateX(-50%) scaleX(-1)";
							remoteVideo.style.width = "";
						}*/
					}
					else if (data.type === "viewer-connect")
					{
						if (!viewerList.includes(data.viewerName))
							viewerList.push(data.viewerName);
						connectionLog = document.createElement('label');
						connectionLog.innerHTML = `${data.viewerName} a rejoint le live`;
						document.getElementById('chatMessages').appendChild(connectionLog);
						document.getElementById("chatMessages").scrollTop = document.getElementById("chatMessages").scrollHeight;
						document.getElementById("people").children[1].innerHTML = viewerList.length;
					}
					else if (data.type === "viewer-disconnect")
					{
						viewerList = viewerList.filter(v => v !== data.viewerName);
						connectionLog = document.createElement('label');
						connectionLog.innerHTML = `${data.viewerName} a quitté le live`;
						document.getElementById('chatMessages').appendChild(connectionLog);
						document.getElementById("chatMessages").scrollTop = document.getElementById("chatMessages").scrollHeight;
						document.getElementById("people").children[1].innerHTML = viewerList.length;
					}
					else if (data.type === "stream-end")
					{
						closeLive();
						showLabel("Merci d'avoir suivi ce live !");
                    }
				}
			}
		}
	}
}

async function checkLive()
{
	token = await getToken(false);
	if (!token.length)
	{
		showLabel("Le Fugitif n'est pas en streaming !");
        document.getElementById('loaderDiv').style.display = "none";
		document.body.style.overflow = 'auto';

		return;
	}
    room = new LivekitClient.Room();
    await room.connect(LIVEKIT_URL, token, { autoSubscribe: true });

	console.log('#');
	console.log(room);

	const streamer = room.remoteParticipants.get("streamer") != null;
	if (!streamer)
	{
		var httpRequest = getHttpRequest();
		httpRequest.open('GET', `db.php?isListeux=${uuid}`, true);
		httpRequest.send();
		httpRequest.onreadystatechange = function ()
		{
			if (httpRequest.readyState === 4)
			{
				if (httpRequest.status === 200)
				{
					if (parseInt(httpRequest.responseText) == 1)
						wantToStartStreaming()
					else 
					{
						showLabel("Le Fugitif n'est pas en streaming !");
            			document.getElementById('loaderDiv').style.display = "none";
						document.body.style.overflow = 'auto'
					}
				}
			}
		}
	}
	else
	{
		var httpRequest = getHttpRequest();
		httpRequest.open('GET', `db.php?isListeuxAll=${uuid}`, true);
		httpRequest.send();
		httpRequest.onreadystatechange = function ()
		{
			if (httpRequest.readyState === 4)
			{
				if (httpRequest.status === 200)
				{
					if (parseInt(httpRequest.responseText) == 1)
						startViewing();
					else
					{
						showLabel("Le Fugitif n'est pas en streaming !");
            			document.getElementById('loaderDiv').style.display = "none";
						document.body.style.overflow = 'auto'
					}
				}
			}
		}
	}
}

function loadVoices()
{
    voices = speechSynthesis.getVoices();
    if (voices.length > 0) voicesReady = true;
}

function speak(text)
{
    if (text.length > 250) return;

    if (!voicesReady)
	{
        setTimeout(() => speak(text), 200);
        return;
    }

    const u = new SpeechSynthesisUtterance(text);

    u.rate = 1;
    u.pitch = 1;
    u.volume = 0.7;

    let french = voices.find(v => v.lang.startsWith("fr"));
    if (!french) french = voices[0]; // fallback

    u.voice = french;

    speechSynthesis.speak(u);
}

async function closeLive()
{
	if (livews) livews.close();
	const local = room.localParticipant;

	local.getTrackPublications().forEach(async pub =>
	{
		if (pub?.track)
		{
			pub.track.stop();
			await local.unpublishTrack(pub.track);
		}
	});

	room.disconnect();

	viewerList = [];
	isStreamer = false;
	totalDonation = 0;
	document.getElementById('live').style.display = "none";
	document.getElementById('people').children[1].innerHTML = 'K0';
	document.getElementById('viewerList').style.display = "none";
	document.getElementById('overlay').style.display = 'none';
	document.getElementById('donation-overlay').style.display = "none";
    const video = document.getElementById('remoteVideo');

    if (ws && ws.readyState === WebSocket.OPEN)
	{
        ws.close(1000, `${viewerId} a quitté le live`);
        console.log("WebSocket fermé");
    }

    if (video.srcObject)
	{
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        console.log("Flux vidéo arrêté");
    }

    document.getElementById('live').style.display = "none";
	document.getElementById('main').style.display = "block";
	if (document.getElementById('camEmbed') !== null) document.getElementById('camEmbed').remove();
    document.getElementById('people').children[1].innerHTML = "0";

	showLabel("Merci d'avoir suivi ce live !");
}

function send()
{
	val = document.getElementById('messageInput').value;
	document.getElementById('messageInput').value = '';
	if (!val.trim().length) return;
	livews.send(JSON.stringify({ type: "message", uuid, val }));
}

function displayViewers()
{
	document.getElementById('viewerList').innerHTML = "";
	exit = document.createElement('span');
	exit.innerHTML = "✕";
	exit.addEventListener('click', () => document.getElementById('viewerList').style.display = 'none');
	document.getElementById('viewerList').appendChild(exit);
	if (!parseInt(document.getElementById('people').children[1].innerHTML) && viewerList.length < 1)
	{
		vb = document.createElement('label');
		vb.innerHTML = "Tu bides";
		document.getElementById('viewerList').appendChild(vb);
	}
	else
	{
		viewerList.forEach((viewer, index) =>
		{
			vl = document.createElement('label');
			vl.innerHTML = viewer;
/*			if (isStreamer) vl.addEventListener('click', () =>
			{
				inviteViewer(viewer[0]);
				document.getElementById('viewerList').style.display = 'none';
				showLabel(`${viewer[1]} a été invité`);
			});*/
			document.getElementById('viewerList').appendChild(vl);
		});
	}
	document.getElementById('viewerList').style.display = 'flex';
}