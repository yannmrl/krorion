let container;
let img;
let target;

let imgWidth = 0;
let imgHeight = 0;

let scale = 1;
let minScale = 1;
let maxScale = 6;

let offsetX = 0;
let offsetY = 0;

let lastX = 0, lastY = 0;
let lastDist = 0;

let targetPos = null;

let touchStart = [];

let places;

function load_cha()
{
    if (localStorage.getItem("uuid") == null)
        back();
    
    uuid = localStorage.getItem("uuid");

    /*fetch('pos2.json')
        .then(res => { if (res.ok) return res.json() })
        .then(data => { places = data });*/

    var httpRequest0 = getHttpRequest();
    httpRequest0.open('GET', `db.php?getpos`, true);
    httpRequest0.send();
    httpRequest0.onreadystatechange = function ()
    {
        if (httpRequest0.readyState === 4)
        {
            if (httpRequest0.status === 200)
            {
                console.log("places set");
                places = JSON.parse(httpRequest0.responseText);
            }
        }
    }    

    container = document.getElementById("container");
    img = document.getElementById("img");
    target = document.getElementById("target");

    if (img.complete) imgLoaded();
    else img.onload = imgLoaded;

    container.addEventListener("pointerdown", e =>
    {
        lastX = e.clientX;
        lastY = e.clientY;
        container.setPointerCapture(e.pointerId);
    });

    container.addEventListener("pointermove", e =>
    {
        if (!container.hasPointerCapture(e.pointerId)) return;

        offsetX += e.clientX - lastX;
        offsetY += e.clientY - lastY;

        lastX = e.clientX;
        lastY = e.clientY;

        applyTransform();
    });

    container.addEventListener("touchstart", e =>
    {
        if (e.touches.length === 2)
        {
            touchStart = [...e.touches];
            lastDist = Math.hypot(
                touchStart[0].clientX - touchStart[1].clientX,
                touchStart[0].clientY - touchStart[1].clientY
            );
        }
    });

    container.addEventListener("touchmove", e =>
    {
        if (e.touches.length === 2)
        {
            e.preventDefault();

            const t1 = e.touches[0];
            const t2 = e.touches[1];

            const dist = Math.hypot(
                t1.clientX - t2.clientX,
                t1.clientY - t2.clientY
            );

            let factor = dist / lastDist;
            lastDist = dist;

            const oldScale = scale;
            scale *= factor;
            scale = Math.min(maxScale, Math.max(minScale, scale));

            const midX = (t1.clientX + t2.clientX) / 2;
            const midY = (t1.clientY + t2.clientY) / 2;

            offsetX = midX - (midX - offsetX) * (scale / oldScale);
            offsetY = midY - (midY - offsetY) * (scale / oldScale);

            applyTransform();
        }
    }, { passive: false });

    container.addEventListener("click", e =>
    {
        const x = (e.clientX - offsetX) / scale;
        const y = (e.clientY - offsetY) / scale;

        targetPos = { x, y };

        const tolerance = 20;
        const match = places.find(el =>
            Math.abs(el.x - targetPos.x) <= tolerance &&
            Math.abs(el.y - targetPos.y) <= tolerance
        );

        if (match)
        {
            document.getElementById('olist').children[match.id-1].children[1].style.display = "";
            var httpRequest = getHttpRequest();
            httpRequest.open('GET', `db.php?found=${match.id}&uuid=${uuid}`, true);
            httpRequest.send();
        }

        console.log(targetPos);

        target.style.display = "block";

        applyTransform();
    });

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?get_found=${uuid}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                if (!parseInt(httpRequest.responseText)) return;
                for (i = 0; i < httpRequest.responseText.length; i++)
                    document.getElementById('olist').children[parseInt(httpRequest.responseText[i])-1].children[1].style.display = "";
            }
        }
    }
}

function imgLoaded()
{
    imgWidth = img.naturalWidth;
    imgHeight = img.naturalHeight;

    const sX = container.clientWidth / imgWidth;
    const sY = container.clientHeight / imgHeight;
    minScale = Math.max(sX, sY);
    scale = minScale;

    centerImage();
    applyTransform();
}

function clampOffsets()
{
    const w = imgWidth * scale;
    const h = imgHeight * scale;

    if (w <= container.clientWidth)
        offsetX = (container.clientWidth - w) / 2;
    else
        offsetX = Math.min(0, Math.max(offsetX, container.clientWidth - w));

    if (h <= container.clientHeight)
        offsetY = (container.clientHeight - h) / 2;
    else
        offsetY = Math.min(0, Math.max(offsetY, container.clientHeight - h));
}

function centerImage()
{
    offsetX = (container.clientWidth - imgWidth * scale) / 2;
    offsetY = (container.clientHeight - imgHeight * scale) / 2;
}

function applyTransform()
{
    clampOffsets();
    img.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

    if (targetPos)
    {
        const screenX = targetPos.x * scale + offsetX;
        const screenY = targetPos.y * scale + offsetY;
        target.style.left = screenX + "px";
        target.style.top = screenY + "px";
    }
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