let uuid = "";

function load_par()
{
  if (localStorage.getItem("uuid") == null)
      back();
  
  uuid = localStorage.getItem("uuid");

  var httpRequest0 = getHttpRequest();
  httpRequest0.open('GET', `db.php?getpari=true`, true);
  httpRequest0.send();
  httpRequest0.onreadystatechange = function ()
  {
    if (httpRequest0.readyState === 4)
    {
      if (httpRequest0.status === 200)
      {
        texte = httpRequest0.responseText;
        console.log(texte);
        document.getElementById("pari-title").innerHTML = texte.split('/')[0];
        fermeture = texte.split('/')[1].trim();
        issues = texte.split('/')[2].trim().split('-');
        console.log(issues);
        document.getElementsByClassName("pari-options")[0].children[0].innerHTML = `${issues[0]}<br>${document.getElementsByClassName("pari-options")[0].children[0].innerHTML.split('<br>')[1]}`;
        document.getElementsByClassName("pari-options")[0].children[1].innerHTML = `${issues[1]}<br>${document.getElementsByClassName("pari-options")[0].children[1].innerHTML.split('<br>')[1]}`;
        if (!fermeture.length)
        {
          document.getElementById("time").innerHTML = `Pari fermé`;
          document.getElementsByClassName("yes")[0].style.background = "gray";
          document.getElementsByClassName("no")[0].style.background = "gray";

          document.getElementsByClassName("yes")[0].setAttribute('disabled', true);
          document.getElementsByClassName("no")[0].setAttribute('disabled', true);
        }
        else
          document.getElementById("time").innerHTML = fermeture;
      }
    }
  }

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?cotes=true`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
      if (httpRequest.readyState === 4)
      {
        if (httpRequest.status === 200)
        {
          let mises = httpRequest.responseText.split('|');
          let cote1 = Math.round(100*(1+mises[1]/mises[0]))/100;
          let cote2 = Math.round(100*(1+mises[0]/mises[1]))/100;

          document.getElementsByClassName('pari-btn')[0].children[1].innerHTML = cote1;
          document.getElementsByClassName('pari-btn')[1].children[1].innerHTML = cote2;

          document.getElementsByClassName('pari-options')[1].children[0].innerHTML = `K${mises[0]}`;
          document.getElementsByClassName('pari-options')[1].children[1].innerHTML = `K${mises[1]}`;
        }
      }
    }

    var httpRequest2 = getHttpRequest();
    httpRequest2.open('GET', `db.php?uuid=${uuid}&getmise=true`, true);
    httpRequest2.send();
    httpRequest2.onreadystatechange = function ()
    {
      if (httpRequest2.readyState === 4)
      {
        if (httpRequest2.status === 200)
        {
          let mise = parseInt(httpRequest2.responseText);

          if (mise != 0)
          {
            document.getElementsByClassName("mise-input")[0].children[0].value = Math.abs(mise);
            document.getElementsByClassName("yes")[0].onclick = "";
            document.getElementsByClassName("yes")[0].disabled = true;
            document.getElementsByClassName("no")[0].onclick = "";
            document.getElementsByClassName("no")[0].disabled = true;

            if (mise < 0)
              document.getElementsByClassName("yes")[0].style.background = "gray";
            else
              document.getElementsByClassName("no")[0].style.background = "gray";
          }
        }
      }
    }

    var httpRequest3 = getHttpRequest();
    httpRequest3.open('GET', `db.php?uuid=${uuid}&solde=true`, true);
    httpRequest3.send();
    httpRequest3.onreadystatechange = function ()
    {
      if (httpRequest3.readyState === 4)
      {
        if (httpRequest3.status === 200)
        {
          let solde = parseInt(httpRequest3.responseText);

          document.getElementById("solde").innerHTML = `Solde : K${solde}`;
          localStorage.setItem('balance', solde);
        }
      }
    }
  
    setTimeout(load_par, 5000);
}

function jourEnFrancais(date)
{
  const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
    let index = date.getDay();
    index = (index === 0) ? 6 : index - 1;
    return jours[index];
}

function bet(x)
{
  val = document.getElementsByClassName("mise-input")[0].children[0].value;

  if (val == "")
  {
    showLabel("Entre ta mise");
    return;
  }

  mise = x*val

  var httpRequest = getHttpRequest();
  httpRequest.open('GET', `db.php?uuid=${uuid}&mise=${mise}`, true);
  httpRequest.send();
  httpRequest.onreadystatechange = function ()
  {
    if (httpRequest.readyState === 4)
    {
      if (httpRequest.status === 200)
      {
        if (httpRequest.responseText == -1)
          showLabel("Solde insuffisant");
        else
        {
          showLabel("Pari placé !")
          load_par();
        }
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

var getHttpRequest = function () {
	var httpRequest = false;

	if (window.XMLHttpRequest) {
		httpRequest = new XMLHttpRequest();
		if (httpRequest.overrideMimeType) {
			httpRequest.overrideMimeType('text/xml');
		}
	}
	else if (window.ActiveXObject) {
		try {
			httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e) {
			try {
				httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e) {}
		}
	}
	if (!httpRequest) {
		return false;
	}
	return httpRequest;
}