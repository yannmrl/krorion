const symbols = ["🍒","🍋","🔔","⭐","💎","7️⃣", "🐊"];
let credits = 0;

let uuid = "";

function load_cas()
{
    if (localStorage.getItem("uuid") == null)
        back();
  
    uuid = localStorage.getItem("uuid");
    
    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?solde=true&uuid=${uuid}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                credits = parseInt(httpRequest.responseText);
                updateCreditsDisplay();
            }
        }
    }

}

function updateCreditsDisplay()
{
    document.getElementById("credits").textContent = "Solde : K" + credits;
    localStorage.setItem('balance', credits);
}

function shuffle(array)
{
    for (let i = array.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function spinReels(bet) 
{
    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?uuid=${uuid}&mise=${bet}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                let res = httpRequest.responseText.split('|');
                gain = parseInt(res[1]);
                e = parseInt(res[0]);
                switch (e)
                {
                    case 0:
                        sym = shuffle([...symbols]).slice(0,3);
                        break;
                    case 1:
                    case 3:
                        twoDiff = shuffle([...symbols]).slice(0, 2);
                        repeatIndex = Math.floor(Math.random() * 2);
                        array2Diff = repeatIndex === 0 ? [twoDiff[0], twoDiff[0], twoDiff[1]] : [twoDiff[0], twoDiff[1], twoDiff[1]];
                        sym = shuffle(array2Diff);                        
                        break;
                    case 2:
                        const oneDiff = [symbols[Math.floor(Math.random() * symbols.length)]];
                        sym = [oneDiff[0], oneDiff[0], oneDiff[0]];
                        break;
                    default:
                        console.log("switch error");
                        break;
                }
                document.getElementById("reel1").textContent = sym[0];
                document.getElementById("reel2").textContent = sym[1];
                document.getElementById("reel3").textContent = sym[2];

                if (gain == 0)
                    resultText = "Perdu +K0";
                else if (gain/bet == 2)
                    resultText = `Petit gain +K${gain}`;
                else if (gain/bet == 3)
                    resultText = `Gros gain +K${gain}`;
                else if (gain/bet == 5)
                    resultText = `Jackpot ! +K${gain}`;

                credits += gain;

                updateCreditsDisplay();
                document.getElementById("result").textContent = resultText;
                document.getElementById("spin").disabled = false;
            }
        }
    }
}

document.getElementById("spin").addEventListener("click", () =>
{
    const bet = parseInt(document.getElementById("bet").value, 10);
    if (isNaN(bet) || bet < 1)
    {
        showLabel("Entrez une mise valide !");
        return;
    }
    if (bet > credits)
    {
        showLabel("Crédits insuffisants !");
        return;
    }
    if (credits > 10 && bet > credits*.1)
    {
        showLabel("Tu ne peux pas miser plus de 10% de ton solde");
        return;
    }

    credits -= bet;
    updateCreditsDisplay();

    document.getElementById("spin").disabled = true;

    const reel1 = document.getElementById("reel1");
    const reel2 = document.getElementById("reel2");
    const reel3 = document.getElementById("reel3");
    const spins = 10;
    let count = 0;

    const interval = setInterval(() =>
    {
        reel1.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        reel2.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        reel3.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        count++;
        if (count >= spins)
        {
            clearInterval(interval);
            spinReels(bet);
        }
    }, 100);
});

updateCreditsDisplay();

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