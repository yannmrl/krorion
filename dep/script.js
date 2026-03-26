let uuid = "";

function load_dep()
{
    if (localStorage.getItem("uuid") == null)
        back();
    
    uuid = localStorage.getItem("uuid");
}

function deposit()
{
	numero = parseInt(`${document.getElementById("numero1").value}${document.getElementById("numero2").value}${document.getElementById("numero3").value}`)

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `kro.php?deposit=true&uuid=${uuid}&numero=${numero}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                let res = httpRequest.responseText;
				if (parseInt(res) == 0) showLabel("× Numero de série invalide ×");
				else if (parseInt(res) == -1) showLabel("× Trop de tentatives erronées ×");
				else
				{
					showLabel(`K${parseInt(res)} ont été déposés sur son compte !`);
					localStorage.setItem('balance', localStorage.getItem('balance')+res);
					for (i = 1; i <= 3; i++)
						document.getElementById(`numero${i}`).value = "";
				}
			}
		}
	}
}

function verify()
{
	numero = parseInt(`${document.getElementById("numero1").value}${document.getElementById("numero2").value}${document.getElementById("numero3").value}`)

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `kro.php?verify=true&uuid=${uuid}&numero=${numero}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                let res = parseInt(httpRequest.responseText);
				if (!res) showLabel("× Numero de série invalide ×");
				else showLabel(`✓ Billet de K${res} valide ✓`);
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

function kup(el, ev, first=false)
{
	if (!el.value.length && !first && ev.key == "Backspace") el.previousElementSibling.focus();
	else if (el.value.length > 2)
	{
		el.value = el.value.slice(0, 3)
		if (el.nextElementSibling != undefined) el.nextElementSibling.focus();
		else document.getElementsByClassName("btn primary")[0].focus();
	}
}

function kdown(ev)
{
	if (ev.key.length > 1) return;
	if (ev.key != parseInt(ev.key)) ev.preventDefault();
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