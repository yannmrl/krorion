let users = [];
let uuid = "";
let prenom = "";
let nom = "";
let cl = 0; //0: kro, 1: boutique, 2: casino, 3: paris, 4: donations

function load_cla2()
{
    if (localStorage.getItem("uuid") == null)
        back();
    
    uuid = localStorage.getItem("uuid");

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?uuid=${uuid}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                let r = httpRequest.responseText;
                prenom = r.split("|")[0];
                nom = r.split("|")[1].split("/")[0];

                let res = JSON.parse(r.split("/")[1]);

                for (i = 0; i < res.length; i++)
                    users.push({prenom: res[i][0], nom: res[i][1], kro: [res[i][2], parseInt(res[i][3])+parseInt(res[i][5])+parseInt(res[i][7])+parseInt(res[i][8])], sho: res[i][3], cas: [res[i][4], res[i][5]], par: [res[i][6], res[i][7]], don: res[i][8], mis: res[i][9], wan: res[i][10]});

                order(0); // kro
                renderUsers(0);
            }
        }
    }
}

function renderUsers(x)
{
    let uidx = -1;
    const list = document.getElementById("userList");
    list.innerHTML = "";
    users.forEach((u, i) => {
        if (x == 0 && (!parseInt(u.kro[0]) && !parseInt(u.kro[1]))) return;
        if (x == 1 && !parseInt(u.sho)) return;
        if (x == 2 && ((!parseInt(u.cas[0]) && !parseInt(u.cas[1])) || !parseInt(u.cas[0]-u.cas[1]))) return;
        if (x == 3 && ((!parseInt(u.par[0]) && !parseInt(u.par[1])) || !parseInt(u.par[0]-u.par[1]))) return;
        if (x == 4 && (!parseInt(u.don))) return;
        if (x == 5 && !parseInt(u.wan)) return;

        let val = '';
        
        switch (x)
        {
            case 0:
                val = `K${u.kro[0].toLocaleString()}`;// (K${u.kro[1].toLocaleString()} dépensés)`;
                break;
            case 1:
                val = `-K${u.sho}`;
                break;
            case 2:
                diff = u.cas[0]-u.cas[1];
                if (diff >= 0)
                    val = `+K${diff.toLocaleString()}`;
                else val = `-K${(-diff).toLocaleString()}`;
                //val = `${val} (K${u.cas[1]} misés)`;
                break;
            case 3:
                diff = u.par[0]-u.par[1];
                if (diff > 0)
                    val = `+K${diff.toLocaleString()}`;
                else val = `-K${(-diff).toLocaleString()}`;
                val = `${val} (${u.par[1]} misés)`
                break;                
            case 4:
                val = `-K${u.don.toLocaleString()}`;
                break;
            case 5:
                val = `${u.wan.toLocaleString()}pts`;
            default:
                console.log("not handled2");
                break;           
        }

        const div = document.createElement("div");
        div.className = "user";
        if (u.prenom == prenom && u.nom == nom)
        {
            div.style.boxShadow = "0 0 12px rgba(255,77,77,1)";
            uidx = i;
        }

        div.innerHTML =
        `
            <div class="rank">#${i+1}</div>
            <div class="info">
                <h2>${u.prenom.slice(0,1).toUpperCase()}${u.prenom.slice(1)} ${u.nom.slice(0,1).toUpperCase()}</h2>
                <p>${val}</p>
            </div>
        `;

        list.appendChild(div);
    });

    if (uidx > -1)
        document.getElementsByClassName("user")[uidx].scrollIntoView({ behavior: "smooth", block: "center" });
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

function order(x)
{
    Array.from(document.getElementById("buttons").children).forEach(img => img.classList.remove("selected"));
    document.getElementById("buttons").children[x].classList.add("selected");
    switch (x)
    {
        case 0:
            users.sort((a, b) => b.kro[0] - a.kro[0]);
            break;
        case 1:
            users.sort((a, b) => b.sho - a.sho);
            break;
        case 2:
            users.sort((a, b) => (b.cas[0]-b.cas[1]) - (a.cas[0]-a.cas[1]));
            break;
        case 3:
            users.sort((a, b) => (b.par[0]-b.par[1]) - (a.par[0]-a.par[1]));
            break;            
        case 4:
            users.sort((a, b) => b.don - a.don);
            break;
        case 5:
            users.sort((a, b) => b.wan - a.wan);
            break;
        default:
            console.log("not handled1");
            break;        
    }

    renderUsers(x);
}