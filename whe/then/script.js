const prizes = [];

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
let W = canvas.width, H = canvas.height;
const center = {x: W/2, y: H/2};
let radius = Math.min(W, H)/2 - 12;

let currentAngle = 0;
let spinning = false;

const spinBtn = document.getElementById('spinBtn');
const resTxt = document.getElementById('resTxt');
const resImg = document.getElementById('resImg');

let images = [];

let uuid, code;

function loadImages(list)
{
    return Promise.all(list.map(p => new Promise((resolve) =>
    {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () =>
        {
            const dummy = document.createElement('canvas');
            dummy.width = dummy.height = 200;
            const dctx = dummy.getContext('2d');
            dctx.fillStyle = '#ddd';
            dctx.fillRect(0,0,200,200);
            dctx.fillStyle = '#333';
            dctx.fillText('?',90,110);
            const im = new Image();
            im.src = dummy.toDataURL();
            im.onload = () => resolve(im);
        };
        img.src = p.img;
    })));
}

function resize()
{
    const px = Math.min(window.innerWidth - 48, 720);
    const s = 0.9*Math.floor(px);
    canvas.width = s;
    canvas.height = s;
    W = canvas.width; H = canvas.height;
    center.x = W/2; center.y = H/2;
    radius = Math.min(W,H)/2 - 12;
    drawWheel();
}

window.addEventListener('resize', resize);

function drawWheel()
{
    ctx.clearRect(0,0,W,H);
    const n = prizes.length;
    const slice = (Math.PI*2)/n;

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(currentAngle);
    for(let i=0;i<n;i++)
    {
        const start = i*slice;
        const end = start + slice;

        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.arc(0,0,radius,start,end);
        ctx.closePath();
        ctx.fillStyle = i%2 ? '#18212b' : '#0e1620';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 2;
        ctx.stroke();

        const mid = (start+end)/2;
        ctx.save();
        ctx.rotate(mid);
        const img = images[i];
        if (img)
        {
            const imgSize = radius * 0.38;
            const x = radius*0.55;
            const y = -imgSize/2;
            roundImage(ctx, img, x, y, imgSize, imgSize, 12);
        }
        else
        {
            ctx.fillStyle = '#fff';
            ctx.font = `${Math.max(12, Math.floor(radius*0.06))}px sans-serif`;
            ctx.fillText(prizes[i].label, radius*0.4, 0);
        }
        ctx.restore();
    }
    ctx.restore();

    ctx.beginPath();
    ctx.arc(center.x, center.y, radius*0.18, 0, Math.PI*2);
    ctx.fillStyle = '#08101a';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center.x, center.y, radius*0.08, 0, Math.PI*2);
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.stroke();
}

function roundImage(ctx, img, x, y, w, h, r)
{
    ctx.save();
    ctx.beginPath();
    roundedRect(ctx, x, y, w, h, r);
    ctx.clip();
    const aspect = img.width / img.height;
    let dw = w, dh = h, sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (aspect > 1)
    {
        sh = img.height;
        sw = img.height * (w / h);
        sx = (img.width - sw) / 2;
    }
    else if (aspect < 1)
    {
        sw = img.width;
        sh = img.width * (h / w);
        sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();

    ctx.beginPath();
    roundedRect(ctx, x, y, w, h, r);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function roundedRect(ctx,x,y,w,h,r)
{
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function randomInt(min,max) {return Math.floor(Math.random()*(max-min+1))+min;}

function spinToRandom(opts={fast:false})
{
    if (spinning) return;
    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?uncover=true`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = async function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                [id, nom] = httpRequest.responseText.split('|');

                id = parseInt(id);
                prizes[id].label = nom;
                prizes[id].img = `assets/${nom}.png`;

                const targetIndex = parseInt(id);

                spinning = true;
                spinBtn.disabled = true;
                resTxt.textContent = 'Rotation en cours...';

                const n = prizes.length;
                const slice = (Math.PI*2)/n;

                const sliceMid = (targetIndex + 0.5) * slice;
                const extra = opts.fast ? randomInt(3,5) : randomInt(6,10);
                const targetRotation = -Math.PI/2 - sliceMid + extra * Math.PI * 2;

                const startRotation = currentAngle % (Math.PI*2);
                const delta = targetRotation - startRotation;

                const duration = opts.fast ? 1600 : 4200;
                const start = performance.now();

                function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

                (function animate(now)
                {
                    const t = Math.min(1, (now - start) / duration);
                    const eased = easeOutCubic(t);
                    currentAngle = startRotation + delta * eased;
                    drawWheel();
                    if (t < 1) requestAnimationFrame(animate);
                    else
                    {
                        spinning = false;
                        spinBtn.disabled = false;

                        const finalAngle = (currentAngle + Math.PI*2*1000) % (Math.PI*2);

                        const nSlice = (Math.PI*2)/n;

                        const pointerAngle = (-Math.PI/2 - currentAngle) % (Math.PI*2);

                        let pa = pointerAngle;
                        while(pa < 0) pa += Math.PI*2;
                        const landed = Math.floor(pa / nSlice);
                        announceWinner(landed);
                    }
                })(start);
            }
        }
    }
}

function announceWinner(index)
{
    loadImages(prizes);
    const p = prizes[index];
    resTxt.textContent = `Tu as gagné un.e ${p.label}`;
    resImg.src = p.img;
    resImg.style.display = '';
    resImg.animate([{transform:'scale(.9)'},{transform:'scale(1)'}],{duration:400,easing:'cubic-bezier(.2,.9,.3,1)'});
    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?mail=${uuid}&price=${p.label}&codeX=${code}`);
    httpRequest.send();
}

function load_whe_then()
{
    if (localStorage.getItem("uuid") == null)
        back();

    uuid = localStorage.getItem("uuid");

    code = window.location.href.split('code=')[1];
    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?uncovered=true`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = async function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                [n, arr] = httpRequest.responseText.split('||');
                arr = JSON.parse(arr);

                for (i = 0; i < n; i++) 
                    prizes.push({label: '?', img: 'https://placehold.co/250x150/14151c/ff4d4d?text=?'});

                arr.forEach(el =>
                {
                    prizes[el[0]].label = el[1];
                    prizes[el[0]].img = `assets/${el[1]}.png`;
                });

                images = await loadImages(prizes);

                resize();
                drawWheel();

                httpRequest.open('GET', `db.php?code=${code}`, true);
                httpRequest.send();
                httpRequest.onreadystatechange = async function ()
                {
                    if (httpRequest.readyState === 4)
                    {
                        if (httpRequest.status === 200)
                        {
                            let res = httpRequest.responseText;
                            if (res == 1)
                                spinBtn.addEventListener('click', ()=> spinToRandom({fast:false}));
                            else if (res == 0)
                                document.getElementById("resTxt").innerHTML = 'Ce code est invalide';
                            else
                                document.getElementById("resTxt").innerHTML = `Ce code a déjà été récupéré par ${res}`;
                        }
                    }
                }
            }
        }
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