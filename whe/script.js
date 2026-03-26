const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const torchBtn = document.getElementById('torchBtn');
let stream = null;
let scanning = false;
let rafId = null;
let track = null;
let torchOn = false;

const constraints =
{
    video:
    {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
    },
    audio: false
};

//URL FORMAT : https://krorion.wysigot.com/?whe/then?code=xxxxxx

function received(url)
{
    if (!url.length) return;
    if (!(url.includes('.com/?') && url.includes('?code=')))
    {
        showLabel("Ce n'est pas le bon QR code");
        return;
    }
    window.parent.postMessage(
        {action: "redirect", url: url.split('.com/?')[1]},
        "https://krorion.wysigot.com"
    );
}

async function startCamera()
{
    if (scanning) return;
    try
    {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;

        track = stream.getVideoTracks()[0];
        scanning = true;
        video.play();
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        tick();
    }
    catch (err)
    {
        showLabel("Impossible d'accéder à la caméra : " + (err && err.message ? err.message : err));
        console.error(err);
    } 
}

function stopCamera()
{
    scanning = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (stream)
    {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
        track = null;
    }
}

function tick()
{
    if (!scanning) return;

    if (video.videoWidth && video.videoHeight)
    {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });

    if (code)
    {
        drawLine(ctx, code.location.topLeftCorner, code.location.topRightCorner);
        drawLine(ctx, code.location.topRightCorner, code.location.bottomRightCorner);
        drawLine(ctx, code.location.bottomRightCorner, code.location.bottomLeftCorner);
        drawLine(ctx, code.location.bottomLeftCorner, code.location.topLeftCorner);

        received(code.data);
    }
    else
    {
        // hide result if nothing
        // showMessage(""); // keep previous until replaced if you prefer
    }

    rafId = requestAnimationFrame(tick);
}

function drawLine(ctx, begin, end)
{
    ctx.strokeStyle = "rgba(255,77,77,0.9)";
    ctx.lineWidth = 40;
    ctx.beginPath();
    ctx.moveTo(begin.x, begin.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}

function showLabel(s)
{
	const label = document.getElementById('label');
	label.innerHTML = s;

	label.classList.add('visible');

	setTimeout(() =>
	{
		label.classList.remove('visible');
	}, 2000);
}

torchBtn.addEventListener('click', async () =>
{
    if (!track) return showLabel("Active la caméra d'abord");
    const capabilities = track.getCapabilities();
    if (!capabilities.torch)
    {
        showLabel("Torch non supportée par cet appareil/cette caméra");
        return;
    }
    try
    {
        torchOn = !torchOn;
        if (torchOn) torchBtn.classList.add("on");
        else torchBtn.classList.remove("on");
        await track.applyConstraints({ advanced: [{ torch: torchOn }] });
    }
    catch (err)
    {
        showLabel("Impossible d'activer la torche: " + err.message);
    }
});

window.addEventListener('pagehide', stopCamera);
window.addEventListener('beforeunload', stopCamera);

startCamera();

function load_whe()
{
    startCamera();
}