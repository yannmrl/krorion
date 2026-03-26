let uuid = "";

let rewards = [];
let currentID = -1;

const productsGrid = document.getElementById('productsGrid');

function load_rec()
{
    if (localStorage.getItem("uuid") == null)
        back();
    
    uuid = localStorage.getItem("uuid");

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?list=true&uuid=${uuid}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                rewards = JSON.parse(httpRequest.responseText);
                renderProducts(rewards);
            }
        }
    }
}

function renderProducts(list)
{
    productsGrid.innerHTML = '';
    list.forEach((p)=>
    {
        if (parseInt(p[2])) html = `style = "background: gray" disabled>Réclamé`; else html = '>Réclamer';
        const card = document.createElement('article');
        card.className = 'card';
        card.setAttribute('role','listitem');
        card.innerHTML = `
            <div class="thumb" style="background-image: url('../sho/assets/${p[1].toLowerCase()}.png')"></div>
            <div class="meta">
                <div class="name">${p[1]}</div>
            </div>
            <div class="actions">
                <button onclick='claim(${parseInt(p[0])})' class="btn primary" ${html}</button>
            </div>
        `;
        productsGrid.appendChild(card);
    });

    if (!list.length)
    {
        console.log('H');
        productsGrid.remove();
        document.getElementsByClassName("products")[0].append("Tu n'as gagné aucune conso pour l'instant");
    }
}

function closeDetail()
{
    document.getElementById("detailModal").classList.remove("show");
}

function claim(i)
{
    currentID = i;
    p = rewards.find(el => parseInt(el[0]) === i);
    document.getElementById("detailName").innerText = p[1];
    document.getElementById('priceInput').value = '';
    if (rewards.find(item => parseInt(item[0]) === i)[1].toLowerCase() == "conso baaar") document.getElementById("priceInput").style.display = "block"; else document.getElementById("priceInput").style.display = "none";
    document.getElementById("detailDesc").innerText = "Montre cette page à un BaAaRman pour récupérer ta conso";
    document.getElementById("detailModal").classList.add("show");
    document.getElementsByClassName("detail-thumb")[0].style.backgroundImage = `url("../sho/assets/${p[1].toLowerCase()}.png"`;
}

function priceInput(el)
{
    el.value = el.value.replace(',', '.');
    el.value = el.value.replace(/[^0-9.,]/g, "");
    if (el.value.length > 4) el.value = el.value.slice(0, 4);
    if (parseFloat(el.value) > 2.5) el.value = '2.50';
}

function confirm()
{
    let price;
    let conso = rewards.find(el => parseInt(el[0]) === currentID)[1];
    
    if (conso.toLowerCase() == "ptit dej") price = 1;
    else if (conso.toLowerCase() == "conso glabar") price = 3;
    else if (conso.toLowerCase() == "conso baaar") price = parseInt(document.getElementById('priceInput').value);

    if (price == NaN) return;

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?uuid=${uuid}&claim=${currentID}&price=${price}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                if (parseInt(httpRequest.responseText) == 0) showLabel('Echec');
                else showLabel('Récompense réclamée');
                idx = rewards.findIndex(el => parseInt(el[0]) === currentID)+1;
                document.querySelector(`#productsGrid > article:nth-child(${idx}) > div.actions > button`).setAttribute("disabled", "true");
                document.querySelector(`#productsGrid > article:nth-child(${idx}) > div.actions > button`).style.background = "gray";
                closeDetail();
            }
        }
    }
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