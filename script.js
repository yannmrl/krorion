let isLoaded_mus = false;
let backFunc = "";
let args = [];

function back()
{
	document.getElementById('loaderDiv').style.display = "none";
	redirect('');
}

window.addEventListener("popstate", (event) =>
{
	redirect(event.state.page);
});

async function redirect(f)
{
	console.log(`Redirecting to ${f}`);
	if (f.slice(0, 2) == "fb") f = ""
	//if (Notification.permission !== 'granted') await Notification.requestPermission();
	try {await Notification.requestPermission()} catch {console.log("denied")}
	if (ws) {ws.close(); ws = null}
	if (backFunc.length)
	{
		if (document.getElementById('iframe') != null)
			iframe.contentWindow[backFunc].apply(null, args);
		else window[backFunc].apply(null, args);
		backFunc = "";
		return;
	}
	if (f != 'twi') history.pushState({ page: f }, "", `https://krorion.wysigot.com?${f}`);
	if (f == 'wan' && !isLoaded_mus)  {isLoaded_mus = true; load_mus();}
	if (f == '')
	{
		document.getElementById('main').style.display = "block";
		document.getElementById('music').style.display = "none";
		document.getElementById('back').style.display = "none";
		try {document.getElementById('iframe').remove();} catch {}
	}
	else if (f == 'mus')
	{
		if (!isLoaded_mus) {isLoaded_mus = true; load_mus();}
		document.getElementById('loaderDiv').style.display = "flex";
		document.getElementById('loaderDiv').children[0].src = `assets/menu/mus-min.png`
		setTimeout(() =>
		{
			document.getElementById('main').style.display = "none";
			document.getElementById('music').style.display = "block";
			document.getElementById('back').style.display = "block";
			try {document.getElementById('iframe').remove();} catch {}
	    	document.getElementById("trackList").style.paddingBottom = `${document.getElementById("miniPlayer").offsetHeight + document.getElementById("menuFooter").offsetHeight + 10 + 12*3}px`;
			document.getElementById("playlistList").style.paddingBottom = `${document.getElementById("miniPlayer").offsetHeight + document.getElementById("menuFooter").offsetHeight + 10 + 12*3}px`;
    		document.getElementById("miniPlayer").style.marginBottom = `${document.getElementById("menuFooter").offsetHeight+10}px`;
			document.getElementById('loaderDiv').style.display = "none";
		}, 700);
	}
	else if (f == "visit")
	{
		redirect('');
	}
	else if (f == "twi")
	{
		checkLive();
		document.getElementById('loaderDiv').style.display = "flex";
		document.getElementById('loaderDiv').children[0].src = `assets/menu/twi-min.png`;
		document.getElementById('loaderDiv').children[0].style.width = "100%";
	}
	else if (1)//["lab", "geo", "cha", "mis", "cla", "mus", "ins", "vid", "twi", "whe", "rec", "mes"].includes(f) || f.includes("then"))
	{
		try
		{
			document.getElementById('loaderDiv').style.display = "flex";
			if (f.includes('ins')) document.getElementById('loaderDiv').children[0].src = `assets/menu/ins-min.png`;
			else document.getElementById('loaderDiv').children[0].src = `assets/menu/${f}-min.png`;
			if (f == "mes") document.getElementById('loaderDiv').children[0].style.width = "70%";
			else document.getElementById('loaderDiv').children[0].style.width = "100%";
		}
		catch {}

		if (document.getElementById("iframe")) iframe = document.getElementById("iframe");
		else
		{
			iframe = document.createElement('iframe');
			iframe.id = "iframe";
		}
		iframe.style.display = "none";
		iframe.src = `https://krorion.wysigot.com/${f}`;
		if (!f.includes('ins')) iframe.onload = () => {hideLoader(); iframe.contentWindow[`load_${f}`]()};
		else iframe.onload = () => {iframe.contentWindow[`load_ins`](); iframe.style.display = ""}
		document.body.appendChild(iframe);
		document.body.style.overflowY = 'hidden';
	}
	if (f.includes('then')) document.getElementById('loaderDiv').children[0].src = `assets/menu/whe-min.png`;
	if (f == 'mes') notifBtn.classList.remove("has-unread");
}

function hideLoader()
{
	document.getElementById('main').style.display = "none";
	document.getElementById('music').style.display = "none";
	document.getElementById('iframe').style.display = "block";
	document.getElementById('back').style.display = "block";
	document.body.style.overflowY = 'scroll';
	document.getElementById('loaderDiv').style.display = "none";			
	try {document.getElementsByName(f)[0].classList.remove('img-loading');} catch {}
}

async function load()
{
	if (!/Mobi|Android|iPhone/i.test(navigator.userAgent) || 0) window.location.href = "desktop-blocked.html";
	if (!window.location.href.includes("https")) window.location.href = window.location.href.replace("http", "https");

	if (window.location.href.includes('??'))
		localStorage.setItem('uuid', window.location.href.split('??')[1]);

	document.getElementById("main-loader").style.display = "none";

	if (localStorage.getItem("uuid") == null)
		document.getElementsByClassName("login-container")[0].style.display = "flex";
	else
	{
		uuid = localStorage.getItem("uuid");
		var httpRequest = getHttpRequest();
		httpRequest.open('GET', `db.php?check=${uuid}`, true);
		httpRequest.send();
		httpRequest.onreadystatechange = function ()
		{
			if (httpRequest.readyState === 4)
			{
				if (httpRequest.status === 200)
				{
					hrep = httpRequest.responseText.split('|');
					document.getElementsByClassName("menu-item")[3].href = `tel:+33${hrep[1]}`;
					if (parseInt(hrep[0]) == -1)
						document.getElementsByClassName("login-container")[0].style.display = "flex";
					else loggedin();
				}
			}
		}
	}
}

async function loggedin()
{
	token = await getToken(false);
	var httpRequest0 = getHttpRequest();
	httpRequest0.open('GET', `db.php?isListeux=${uuid}`, true);
	httpRequest0.send();
	httpRequest0.onreadystatechange = function ()
	{
		if (httpRequest0.readyState === 4)
		{
			if (httpRequest0.status === 200)
			{
				if (parseInt(httpRequest0.responseText) == 1)
					try {document.getElementById('cre').style.display = "flex"} catch {}
			}
		}
	}

	try
	{
		if (Notification.permission !== 'granted') { document.getElementById("notifyDiv").style.display = "flex"; document.body.style.overflow = "hidden"; }
		else showGain();

		if ('serviceWorker' in navigator)
		{
	  		navigator.serviceWorker.register('sw.js')
    			.then(reg => console.log('Service Worker enregistré ✅', reg))
    			.catch(err => console.error('Erreur SW ❌', err));
		}

		subscribe();

		var httpRequest = getHttpRequest();
		httpRequest.open('GET', `db.php?check_notif=${uuid}`, true);
		httpRequest.send();
		httpRequest.onreadystatechange = function ()
		{
			if (httpRequest.readyState === 4)
			{
				if (httpRequest.status === 200)
				{
					if (parseInt(httpRequest.responseText) == 1) notifBtn.classList.add("has-unread");
				}
			}
		}
	}
	catch {console.log("fucking ios")}
	if (!window.location.href.includes('??') && window.location.href.includes('?'))
		redirect(window.location.href.split('?').slice(1).join('?'));
}

function showGain()
{
	oldBalance = localStorage.getItem('balance');

	var httpRequest = getHttpRequest();
	httpRequest.open('GET', `db.php?solde=${uuid}`, true);
	httpRequest.send();
	httpRequest.onreadystatechange = function ()
	{
		if (httpRequest.readyState === 4)
		{
			if (httpRequest.status === 200)
			{
				newBalance = parseInt(httpRequest.responseText);
				localStorage.setItem('balance', newBalance);
				diff = newBalance - oldBalance;
				if (diff > 0)
					showLabel(`Tu as gagné K${diff} depuis ta dernière connexion`);
			}
		}
	}
}

function uuidv4()
{
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c=>
	{
	    const r = crypto.getRandomValues(new Uint8Array(1))[0] & 15;
	    const v = c === 'x' ? r : (r & 0x3 | 0x8);
	    return v.toString(16);
  	});
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
    httpRequest0.open('GET', `db.php?log_from_aurion=true&username=${username}&password=${password}`, true);
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

function disconnect()
{
	localStorage.removeItem("uuid");
	location.reload();
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

let deferredPrompt;
const installDiv = document.getElementById('installDiv');

window.addEventListener('beforeinstallprompt', (e) =>
{
	try
	{
		e.preventDefault();
		deferredPrompt = e;
		installDiv.style.display = 'flex';
		document.body.style.overflow = "auto";


		installDiv.addEventListener('click', install);

		install();	
	}
	catch
	{}
});

async function install()
{
	try
	{
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		console.log('Résultat :', outcome);
		deferredPrompt = null;
		//installDiv.style.display = 'none';
	}
	catch
	{}
}

const VAPID_PUBLIC_KEY = "BP1-hy-O-H0oRVWa638W8S0szIf1eTG_1V3Qiuei10OcS8IjmzOvV3z_AukjPD4ZwzXyFqkxXI6OUN_G_qVKEb0";

function urlBase64ToUint8Array(base64String)
{
  	const padding = "=".repeat((4 - base64String.length % 4) % 4);
  	const base64 = (base64String + padding)
	    .replace(/-/g, "+")
	    .replace(/_/g, "/");
  	const rawData = atob(base64);

  	return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function subscribe()
{
  	//const permission = await Notification.requestPermission();
	//if (permission !== "granted") return;// alert("Notifications refusées");

	await Notification.requestPermission();

	document.getElementById("notifyDiv").style.display = "none";
	document.body.style.overflow = "auto";

  	const registration = await navigator.serviceWorker.ready;

  	const subscription = JSON.parse(JSON.stringify(await registration.pushManager.subscribe(
	{
	    userVisibleOnly: true,
	    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  	})));

	endpoint = subscription.endpoint;
	p256dh = subscription.keys.p256dh,
	auth = subscription.keys.auth;

	var httpRequest = getHttpRequest();
	httpRequest.open('GET', `subscribe.php?uuid=${uuid}&endpoint=${endpoint}&p256dh=${p256dh}&auth=${auth}`, true);
	httpRequest.send();
}

navigator.serviceWorker.addEventListener('message', event =>
{
  	const data = event.data;
  	if (!data) return;

  	if (data.type === 'GET_UUID')
	{
    	const uuid = localStorage.getItem('uuid');
    	event.source.postMessage({ type: 'UUID_VALUE', uuid });
  	}
	else if (data.type === 'GET_BALANCE')
	{
		const balance = localStorage.getItem('balance');
		event.source.postMessage({ type: 'BALANCE_VALUE', balance});
	}
	else if (data.type === 'SET_UUID' && data.uuid)
    	localStorage.setItem('uuid', data.uuid);
	else if (data.type === 'SET_BALANCE' && data.balance)
		localStorage.setItem('balance', data.balance);

});

function showPopup()
{
    document.getElementById('popup-overlay').classList.add('active');
}

function closePopup()
{
    document.getElementById('popup-overlay').classList.remove('active');
}

let ws;

window.addEventListener("message", (event) =>
{
    if (event.origin !== "https://krorion.wysigot.com") return;

    const data = event.data;
	console.log(data);

    if (data.action === "play")
	{
		i1 = currentPlaylistIndex;
		i2 = currentTrackIndex;
		p = playingfavs;
        loadTrack(getTrack(0, data.trackId));
		play();
		function reset(_i1, _i2, _p)
		{
			if (currentPlaylistIndex != 0) {setTimeout(reset(_i1, _i2, _p), 500); console.log('looping');}
			else
			{
				currentPlaylistIndex = _i1;
				currentTrackIndex = _i2;
				playingfavs = _p;
			}
		}
		reset(i1, i2, p);
    }
	else if (data.action === "pause")
		pause();
	else if (data.action === "redirect")
		redirect(data.url);
	else if (data.action === "load")
	{
		document.getElementById("loaderDiv").style.display = "flex";
		document.getElementById("loaderDiv").children[0].src = `assets/menu/${data.page}-min.png`;
	}
	else if (data.action === "loaded")
		document.getElementById("loaderDiv").style.display = "none";
	else if (data.action === "backFunc")
	{
		backFunc = data.func;
		args = data.args;
	}
	else if (data.action == "exec") window[data.func].apply(null, data.args);
	else if (data.action == "register-compass-receiver")
	{
		ws = new WebSocket("wss://echo.wysigot.com:443");
    	ws.onopen = () => ws.send(JSON.stringify({ type: "compass-receiver"}));
		ws.onmessage = async (msg) =>
		{
		    const data = JSON.parse(msg.data);

			if (data.type == "compass-update")
			{
				if (iframe = document.getElementById('iframe'))
					iframe.contentWindow['updateTarget'].apply(null, [data.label, data.lat, data.lng, data.showDistance]);
				else ws.close();
			}
		}
	}
	else if (data.action == "register-compass-sender")
	{
		ws = new WebSocket("wss://echo.wysigot.com:443");
		ws.onopen = () =>
		{
			ws.send(JSON.stringify(
				{
					type: "compass-push",
					label: data.label,
					uuid: uuid,
					lat: data.lat,
					lng: data.lng,
					showDistance: data.showDistance
				}
			));
		}
	}
	else if (data.action == "update-compass")
	{
		ws.send(JSON.stringify(
			{
				type: "compass-update",
				uuid: uuid,
				lat: data.lat,
				lng: data.lng,
				showDistance: data.showDistance
			}
		));
	}
	else if (data.action == "set-back-style")
		document.getElementById('back').style.display = data.display;
	else console.log("Unknown iframe action", data);
});

// NEW LIVE

const LIVEKIT_URL = "wss://krorion-live-a5oy7539.livekit.cloud";
const remoteVideo = document.getElementById('remoteVideo');
let token, room, isStreamer, livews, streamType, cameraStream, jungle;
let viewerList = [];
let voices = [];
let voicesReady = false;

async function getMedia(v, a)
{
	try 
	{
		if (a) a =
		{
    		echoCancellation: true,
    		noiseSuppression: true,
    		autoGainControl: false
  		};
        const stream = await navigator.mediaDevices.getUserMedia({ video: v, audio: a });
        return stream;
    }
	catch (err) 
	{
        console.error("Impossible d'accéder à la caméra/micro :", err);
        if (err.name === "NotAllowedError")
            alert("Autorisation refusée ! Vérifie les permissions du navigateur.");
        else if (err.name === "NotFoundError")
            alert("Pas de caméra ou micro disponible !");
		else alert(err.name);
    }
}

function createVoiceNoiseGate(actx)
{
  	const input = actx.createGain();
  	const output = actx.createGain();

  	const detector = actx.createAnalyser();
  	detector.fftSize = 1024;

  	input.connect(output);

  	const data = new Uint8Array(detector.fftSize);

  	const THRESHOLD = 0.007; // très sensible
  	const ATTACK = 0.02;    // 20 ms
  	const RELEASE = 0.3;    // 300 ms

  	function update()
	{
	    detector.getByteTimeDomainData(data);

    	let sum = 0;
    	for (let i = 0; i < data.length; i++)
		{
      		const v = (data[i] - 128) / 128;
      		sum += v * v;
	    }

    	const rms = Math.sqrt(sum / data.length);
    	const now = actx.currentTime;

    	output.gain.cancelScheduledValues(now);

    	if (rms > THRESHOLD)
      		output.gain.linearRampToValueAtTime(1, now + ATTACK);
    	else
      		output.gain.linearRampToValueAtTime(0, now + RELEASE);

    	requestAnimationFrame(update);
  	}

  	output.gain.value = 0;
  	update();

  	return {
    	input,
    	output,
    	detector
  	};
}
function createJungle(actx, destination, stream)
{
	const micSource = actx.createMediaStreamSource(stream);

  	const highpass = actx.createBiquadFilter();
  	highpass.type = "highpass";
  	highpass.frequency.value = 120;

  	const lowpass = actx.createBiquadFilter();
  	lowpass.type = "lowpass";
  	lowpass.frequency.value = 6000;

  	const gate = createVoiceNoiseGate(actx);

  	const compressor = actx.createDynamicsCompressor();
  	compressor.threshold.value = -18;
  	compressor.knee.value = 8;
  	compressor.ratio.value = 3;
  	compressor.attack.value = 0.005;
  	compressor.release.value = 0.15;

  	jungle = new Jungle(actx);

  /* =======================
     CHAÎNE AUDIO PRINCIPALE
     ======================= */
  	micSource
	    .connect(highpass)
	    .connect(lowpass)
	    .connect(gate.input);

  	gate.output
	    .connect(compressor)
	    .connect(jungle.input);

  	jungle.output.connect(destination);

  /* =======================
     CHAÎNE DE DÉTECTION VOCALE
     ======================= */
  	const detectorBandpass = actx.createBiquadFilter();
  	detectorBandpass.type = "bandpass";
  	detectorBandpass.frequency.value = 250; // cœur de la voix
  	detectorBandpass.Q.value = 1.2;

  	micSource
	    .connect(detectorBandpass)
	    .connect(gate.detector);
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

function wantToStartStreaming()
{
	document.getElementById('overlay').style.display = "flex";
}

async function startStreaming()
{
	liveTitle = document.getElementById('liveTitleInput').value.trim();
	if (!liveTitle.length) return;
	document.getElementById('liveTitle').innerHTML = liveTitle;
	document.getElementById('chatMessages').innerHTML = '';

	token = await getToken(true);
	if (!token.length)
	{
		showLabel("Tu n'es pas autorisé à lancer un live");
		return;
	}
	viewerList = [];
	isStreamer = true;
	document.body.style.overflow = "hidden";
	document.getElementById('main').style.display = "none";
	document.getElementById('liveTitleInput').value = '';

	document.getElementById('overlay').style.display = "none";

	streamType = 0; // camera + micro
	if (document.getElementById('check1').children[1].checked)
		streamType = 1; // camera + micro + son système
	else if (document.getElementById('check2').children[1].checked && !document.getElementById('check3').children[1].checked)
		streamType = 2; // ecran + son systeme
	else if (document.getElementById('check2').children[1].checked && document.getElementById('check3').children[1].checked)
		streamType = 3; // camera + ecran + son systeme

	console.log(`streamType: ${streamType}`);

	startWS(true, document.getElementById("check0").children[1].checked, liveTitle, document.getElementById('check').children[1].checked);

    try
	{
		if (streamType == 0)
		{
			remoteVideo.style.transform = "translateX(-50%) scaleX(-1)";
			cameraStream = await getMedia(true, true);
			const audioContext = new AudioContext();

			const processedDestination = audioContext.createMediaStreamDestination();
			
			createJungle(audioContext, processedDestination, cameraStream);

			localStream = new MediaStream();

			cameraStream.getVideoTracks().forEach(track => localStream.addTrack(track));

			processedDestination.stream.getAudioTracks().forEach(track => localStream.addTrack(track));
		}
		else if (streamType == 1)
		{
			remoteVideo.style.transform = "translateX(-50%) scaleX(-1)";
			const micro = await getMedia(false, true);

			const systemCapture = await navigator.mediaDevices.getDisplayMedia(
			{
  				video:
				{
    				width: 640,
    				height: 360,
    				frameRate: 25
  				},
				audio: true
			});

			cameraStream = await getMedia(true, false);

			const audioContext = new AudioContext();

			const processedDestination = audioContext.createMediaStreamDestination();
		
			createJungle(audioContext, processedDestination, micro);

			if (systemCapture.getAudioTracks().length > 0)
			{
				const systemSource = audioContext.createMediaStreamSource(systemCapture);
				systemSource.connect(processedDestination);
			}

			localStream = new MediaStream(
			[
				...cameraStream.getVideoTracks(),
				...processedDestination.stream.getAudioTracks()
			]);
		}
		else if (streamType == 2)
		{
			remoteVideo.style.transform = "translateX(-50%) scaleX(1)";
   			const micro = await getMedia(false, true);

    		const screen = await navigator.mediaDevices.getDisplayMedia(
			{
  				video:
				{
    				width: 640,
    				height: 360,
    				frameRate: 25
  				},
        		audio: true
    		});

		    const audioContext = new AudioContext();

			const processedDestination = audioContext.createMediaStreamDestination();

			createJungle(audioContext, processedDestination, micro);

    		if (screen.getAudioTracks().length > 0)
			{
        		const systemSource = audioContext.createMediaStreamSource(screen);
        		systemSource.connect(processedDestination);
    		}
			else
        		console.warn("⚠️ Aucun son système capturé");

		    localStream = new MediaStream(
			[
		        ...screen.getVideoTracks(),
		        ...processedDestination.stream.getAudioTracks()
    		]);

			const _audioStream = localStream.getTracks().find(t => t.kind == "audio");
			const _screenStream = localStream.getTracks().find(t => t.kind == "video");

			const screenStream = new MediaStream([_audioStream, _screenStream]);

			remoteVideo.srcObject = screenStream;
		}
		else if (streamType == 3)
		{
			cameraStream = await getMedia(true, true);

			const screen = await navigator.mediaDevices.getDisplayMedia(
			{
  				video:
				{
    				width: 640,
    				height: 360,
    				frameRate: 25
  				},
    			audio: true
			});

			const audioContext = new AudioContext();

			const processedDestination = audioContext.createMediaStreamDestination();
			createJungle(audioContext, processedDestination, cameraStream);

			if (screen.getAudioTracks().length > 0)
			{
    			const systemSource = audioContext.createMediaStreamSource(screen);
    			systemSource.connect(processedDestination);
			}

			localStream = new MediaStream(
			[
    			...cameraStream.getVideoTracks(),
    			...screen.getVideoTracks(),
    			...processedDestination.stream.getAudioTracks()
			]);

			const _audioStream = localStream.getTracks().find(t => t.kind == "audio");
			const [_camStream, _screenStream] = localStream.getTracks().filter(t => t.kind == "video");

			const camStream = new MediaStream([_camStream]);
			const screenStream = new MediaStream([_audioStream, _screenStream]);

			remoteVideo.srcObject = screenStream;

			let camEmbed;
			if (document.getElementById('camEmbed') === null) 
				camEmbed = document.createElement('video');
			else camEmbed = document.getElementById('camEmbed');
			
			camEmbed.id = "camEmbed";
			camEmbed.srcObject = camStream;
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

		/*if (document.getElementById('check0').children[1].checked) ws.send(JSON.stringify({ type: "streamer", liveTitle, notify, uuid: viewerId, streamType, anonyme: true}));
		else ws.send(JSON.stringify({ type: "streamer", liveTitle, notify, uuid: viewerId, streamType }));
	    console.log("WebSocket ouvert en mode streamer");*/

		remoteVideo.muted = true;

		if (document.getElementById('check4').children[1].checked)
			jungle.setPitchOffset(-0.3);
		else jungle.setPitchOffset(0);		


		if (streamType == 2 || streamType == 3)
		{
			remoteVideo.style.transform = "translateX(-50%) scaleX(1)";
			remoteVideo.style.width = "100vw";			
		}
		else
		{
			remoteVideo.style.transform = "translateX(-50%) scaleX(-1)";
			remoteVideo.style.width = "";
		}

        document.getElementById("live").style.display = "block";
        document.getElementById('loaderDiv').style.display = "none";
        document.getElementsByClassName("back-btn")[0].style.display = "grid";
        document.getElementsByClassName("back-btn")[0].addEventListener('click', closeLive, {once: true});
        document.getElementById('people').children[1].innerHTML = "0";
        console.log("Flux local prêt :", localStream.getTracks());

		//document.getElementById('switch').style.display = "block";
		speechSynthesis.onvoiceschanged = () =>
		{
	    	loadVoices();
		};

		loadVoices();
    }
	catch (err)
	{
        console.error("Erreur getUserMedia :", err);
        return;
    }

    // Crée et connecte la room
    room = new LivekitClient.Room();
    await room.connect(LIVEKIT_URL, token, { autoSubscribe: true });

    // Crée la piste vidéo locale et publie
    const videoTrack = new LivekitClient.LocalVideoTrack(localStream.getVideoTracks()[0]);
    const audioTrack = new LivekitClient.LocalAudioTrack(localStream.getAudioTracks()[0]);

	//screen track ?
	if (localStream.getVideoTracks().length > 1)
	{
		const screenTrack = new LivekitClient.LocalVideoTrack(localStream.getVideoTracks()[1]);
		room.localParticipant.publishTrack(audioTrack);
		room.localParticipant.publishTrack(videoTrack, { source: LivekitClient.Track.Source.Camera });
		room.localParticipant.publishTrack(screenTrack, { source: LivekitClient.Track.Source.ScreenShare });
	}
	else
	{
		room.localParticipant.publishTrack(audioTrack);
		room.localParticipant.publishTrack(videoTrack);
		remoteVideo.srcObject = localStream;
	}
}

async function startViewing()
{
	startWS(false);

	//document.getElementById('switch').style.display = "block";
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
			
			document.getElementById("live").style.display = "block";
			document.getElementById("main").style.display = "none";
			document.getElementById('loaderDiv').style.display = "none";
			document.getElementsByClassName("back-btn")[0].style.display = "grid";
			document.getElementsByClassName("back-btn")[0].addEventListener('click', closeLive, {once: true});             
			document.getElementById('chatMessages').innerHTML = '';
		});

    	// Écouter les nouvelles pistes publiées
    	/*room.on("trackPublished", (publication, participant) => publication.on("subscribed", (track) =>
		{
			console.log("New Track");
			console.log(track);
			track.attach(remoteVideo);
		}));*/

/*		room.on("trackUnsubscribed", (track, publication, participant) =>
		{
  			if (participant.identity === "streamer" && track.kind === "video")
    			closeLive();
  		});

		room.on("participantDisconnected", participant =>
		{
  			if (participant.identity === "streamer")
    			closeLive();
  		});*/

    	console.log("Rejoint la room !");
  	}
	catch (err)
	{
    	console.error("Erreur rejoindre la room :", err);
	}
}

function startWS(streamer, anonymous = false, liveTitle = "", notify = false)
{
	console.log(`anonymous ?`, anonymous);

	let name;

	var httpRequest = getHttpRequest();
	httpRequest.open('GET', `db.php?getPrenom=${uuid}`, true);
	httpRequest.send();
	httpRequest.onreadystatechange = async function ()
	{
		if (httpRequest.readyState === 4)
		{
			if (httpRequest.status === 200)
			{
				name = httpRequest.responseText;
				if (anonymous) name = "Le Fugitif";

				livews = new WebSocket("wss://echo.wysigot.com:443");
				livews.onopen = () =>
				{
        			console.log(`${streamer} ws open`);
					if (streamer)
        				livews.send(JSON.stringify({ uuid, type: "streamer", name, liveTitle, streamType, notify}));
					else
						livews.send(JSON.stringify({ uuid, type: "viewer", name }));
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
						if (data.streamType == 2 || data.streamType == 3)
						{
							remoteVideo.style.transform = "translateX(-50%) scaleX(1)";
							remoteVideo.style.width = "100vw";
						}
						else
						{
							remoteVideo.style.transform = "translateX(-50%) scaleX(-1)";
							remoteVideo.style.width = "";
						}
					}
					else if (data.type === "viewer-connect")
					{
						if (!viewerList.includes(data.viewerName))
							viewerList.push(data.viewerName);
						if (!streamer) return;
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
						if (!streamer) return;
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
					else if (data.type === "donation")
					{
						donationLog = document.createElement('label');
						donationLog.innerHTML = `${data.viewerName} a donné K${data.amount}`;
						donationLog.style = "font-weight: bolder; color: goldenrod";
						document.getElementById('chatMessages').appendChild(donationLog);
						document.getElementById('donationGoal').innerHTML = `K${data.totalDonation}`;
					
						if (data.message.trim().length)
						{
							donationMessage = document.createElement('label');
							donationMessage.innerHTML = data.message;
							if (data.amount >= 20) speak(data.message);
							donationMessage.style = "font-weight: bold; font-style: normal";
							document.getElementById('chatMessages').appendChild(donationMessage);
						}
					
						document.getElementById("chatMessages").scrollTop = document.getElementById("chatMessages").scrollHeight;
					}
					else if (data.type === "invitation")
					{
						console.log('invited to live');
						startGuestStreaming();
					}
			/*		else if (data.type === "already-connected")
					{
						closeLive();
						showLabel('Tu regardes déjà le live depuis un autre appareil');
					}*/
					else if (data.type === "camera-switch")
						document.getElementById('remoteVideo').style.transform = `translateX(-50%) scaleX(${data.scaleOrientation})`;

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
		showLabel("Le Kartel n'est pas en streaming ! (0)");
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
						showLabel("Le Kartel n'est pas en streaming ! (1)");
            			document.getElementById('loaderDiv').style.display = "none";
						document.body.style.overflow = 'auto'
					}
				}
			}
		}
	}
	else
	{
		startViewing();
/*		var httpRequest = getHttpRequest();
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
						showLabel("Le Kartel n'est pas en streaming ! (2)");
            			document.getElementById('loaderDiv').style.display = "none";
						document.body.style.overflow = 'auto'
					}
				}
			}
		}*/
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

function radio(x)
{
	c1 = document.getElementById('check1').children[1];
	c2 = document.getElementById('check2').children[1];
	c3P = document.getElementById('check3');

	if (x == 1 && c1.checked) c2.checked = false;
	else if (x == 2 && c2.checked) c1.checked = false;

	if (c2.checked) c3P.style.display = "block";
	else {c3P.style.display = "none"; c3P.children[1].checked = false;}
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
	document.body.style.overflow = "auto";
	document.getElementById('loaderDiv').style.display = "none";
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

function showDonationMenu()
{
	var httpRequest = getHttpRequest();
	httpRequest.open('GET', `db.php?solde=${uuid}`, true);
	httpRequest.send();
	httpRequest.onreadystatechange = function ()
	{
		if (httpRequest.readyState === 4)
		{
			if (httpRequest.status === 200)
			{
				document.getElementById('donation').children[1].innerHTML = `Ton solde : K${httpRequest.responseText}`;
				document.getElementById('donation-overlay').style.display = "flex";
			}
		}
	}
}

function closeDonationMenu()
{
	document.getElementById('donation-overlay').style.display = "none";
}

function donate()
{
	donation = document.getElementById('donationAmount').value;
	if (donation < 5)
	{
		showLabel('Tu dois donner au moins K5');
		return;
	}
	else if (donation > parseInt(document.getElementById('donation').children[1].innerHTML.split('K')[1]))
	{
		showLabel('Solde insuffisant');
		return;
	}
	else
	{
		document.getElementById('donationAmount').value = '';
		message = document.getElementById('donationMessage').value;
		document.getElementById('donationMessage').value = '';
		closeDonationMenu();
		if (livews === undefined)
		{
			showLabel('ws undefined');
			return;
		}
		console.log("sending donation");
		livews.send(JSON.stringify({ type: "donation", uuid, donation, message }));
	}
}

function showCagnotte()
{
	var httpRequest = getHttpRequest();
	httpRequest.open('GET', `db.php?donationCagnotte=true`, true);
	httpRequest.send();
	httpRequest.onreadystatechange = function ()
	{
		if (httpRequest.readyState === 4)
		{
			if (httpRequest.status === 200)
			{	
				document.getElementById('viewerList').innerHTML = "";
				exit = document.createElement('span');
				exit.innerHTML = "✕";
				exit.addEventListener('click', () => document.getElementById('viewerList').style.display = 'none');
				document.getElementById('viewerList').appendChild(exit);				
				l = document.createElement('label');
				l.innerHTML = `K${httpRequest.responseText}`;
				document.getElementById('viewerList').appendChild(l);
				document.getElementById('viewerList').style.display = "flex";
			}
		}
	}
}

async function switchCamera()
{
	return;
	let currentVideoTrack = cameraStream.getVideoTracks()[0];
    const newFacing = currentVideoTrack.getSettings().facingMode === "user"
        ? "environment"
        : "user";

    console.log("Switch to:", newFacing);
	if (newFacing == "environment")
	{
		livews.send(JSON.stringify({ type: "camera-switch", scaleOrientation: 1 }));
		document.getElementById('remoteVideo').style.transform = "translateX(-50%) scaleX(1)";
	}
	else
	{
		livews.send(JSON.stringify({ type: "camera-switch", scaleOrientation: -1 }));
		document.getElementById('remoteVideo').style.transform = "translateX(-50%) scaleX(-1)";
	}

    const newStream = await getCamera(newFacing);
    const newTrack = newStream.getVideoTracks()[0];

	const videoTrack = new LivekitClient.LocalVideoTrack(newTrack);

	room.localParticipant.unpublishTrack([...room.localParticipant.videoTrackPublications.values()][0].track);

    await room.localParticipant.publishTrack(videoTrack);

	[...room.localParticipant.videoTrackPublications.values()][0].track.attach(remoteVideo);
	cameraStream = newStream;
}

async function getCamera(facingMode = "user")
{
    return await navigator.mediaDevices.getUserMedia(
	{
        video: { facingMode },
        audio: false
    });
}