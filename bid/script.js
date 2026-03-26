let uuid = "";
let currentBid = -1;
let bidsHistory = [];
let solde = 0;

function load_bid()
{
    if (localStorage.getItem("uuid") == null)
        back();
  
    uuid = localStorage.getItem("uuid");

    var httpRequest0 = getHttpRequest();
    httpRequest0.open('GET', `db.php?getbid=true`, true);
    httpRequest0.send();
    httpRequest0.onreadystatechange = function ()
    {
        if (httpRequest0.readyState === 4)
        {
            if (httpRequest0.status === 200)
            {
                let res = httpRequest0.responseText;
                document.getElementsByClassName("auction-container")[0].children[1].innerHTML = `Lot en cours : ${res.split('/')[0]}`;
                if (res.split('/')[1].length)
                    document.getElementById('fin').innerHTML = res.split('/')[1];
                else
                {
                    document.getElementById("placeBid").style.background = "gray";
                    document.getElementById("placeBid").setAttribute("disabled", true)

                    document.getElementById("fin").innerHTML = `Enchère terminée`;
                }
                document.getElementsByClassName("auction-container")[0].children[0].src = res.split('/')[2];
            }
        }
    }


/*    fetch('lot.txt')
    .then(response =>
    {   
        return response.text();
    })
    .then(rep =>
    {
        lot = rep.split('/')[0];
        date = new Date(rep.split('/')[1]);
        document.getElementsByClassName("auction-container")[0].children[0].src = `https://placehold.co/250x150/14151c/ff4d4d?text=${lot.replaceAll(" ", "+")}`;
        document.getElementsByClassName("auction-container")[0].children[1].innerHTML = `Lot en cours : ${lot}`;

        if (date < new Date()) //passée
        {
            document.getElementById("placeBid").style.background = "gray";
            document.getElementById("placeBid").setAttribute("disabled", true)

            document.getElementById("fin").innerHTML = `Enchère terminée`;
        }
        else
        {
            d = date.getDate();
            if (String(d).length == 1) d = `0${d}`;
                m = date.getMonth()+1;
            if (String(m).length == 1) m = `0${m}`;        
                document.getElementById("fin").innerHTML = `Fin : ${d}/${m}`;
        }
    });*/

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?getbids=true&uuid=${uuid}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                document.getElementById('bidsHistory').innerHTML = "";
                bidsHistory = [];
                tmp = httpRequest.responseText.split('-');
                for (i = 0; i < tmp.length-1; i++)
                    bidsHistory.push([tmp[i].split('|')[0], parseInt(tmp[i].split('|')[1])]);

                bidsHistory.reverse();

                solde = parseInt(tmp[tmp.length-1]);
                if (bidsHistory.length)
                    currentBid = bidsHistory[0][1];
                else currentBid = 0;

                document.getElementById("currentBid").textContent = `Enchère actuelle : K${currentBid}`;

                for (i = 0; i < bidsHistory.length; i++)
                {
                    li = document.createElement("li");
                    li.innerHTML = `<strong>${bidsHistory[i][0]}</strong> : K${bidsHistory[i][1]}`;
                    document.getElementById("bidsHistory").append(li);              
                }

                setTimeout(load_bid, 2000);
            }   
        }
    }
}

document.getElementById("placeBid").addEventListener("click", function()
{
    const amount = parseInt(document.getElementById("bidAmount").value, 10);

    if (isNaN(amount))
    {
        showLabel("Entre une offre valide");
        return;
    }

    if (amount < currentBid + 10)
    {
        showLabel("Tu dois surenchérir d'au moins K10");
        return;
    }

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?bid=${amount}&uuid=${uuid}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                if (parseInt(httpRequest.responseText.split("|")[0]) == 1)
                {
                    bidsHistory.unshift([httpRequest.responseText.split("|")[1], amount]);
                    currentBid = amount;

                    li = document.createElement("li");
                    li.innerHTML = `<strong>${bidsHistory[0][0]}</strong> : K${bidsHistory[0][1]}`;
                    document.getElementById("bidsHistory").prepend(li);         
                    
                    document.getElementById("currentBid").textContent = `Enchère actuelle : K${bidsHistory[0][1]}`;

                    document.getElementById("bidAmount").value = "";
                }
            }
        }
    }
});

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