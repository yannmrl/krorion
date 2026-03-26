function load_mes()
{
    uuid = localStorage.getItem('uuid');
    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?uuid=${uuid}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                msgs = JSON.parse(httpRequest.responseText);

                msgs.forEach(msg =>
                {
                    document.getElementsByClassName('chat-container')[0].innerHTML +=
                    `
                        <div class="message-left">
                            <div class="avatar"></div>
                            <div>
                                <div class="chat-left">${msg['msg']}</div>
                                <div class="timestamp">${parseDate(msg['timestamp'])}</div>
                            </div>
                        </div>
                    `;
                });

                document.getElementsByClassName("chat-container")[0].scrollTop = document.getElementsByClassName("chat-container")[0].scrollHeight
            }
        }
    }
}

function formatDateFR(datetimeStr)
{
    const mois = ["Jan.", "Fév.", "Mar.", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sep.", "Oct.", "Nov.", "Déc."];

    const [datePart, timePart] = datetimeStr.split(" ");
    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");

    const moisTxt = mois[parseInt(month, 10) - 1];
    return `${parseInt(day)} ${moisTxt} ${parseInt(hour)}h${minute}`;
}

function parseDate(rd)
{
    const days = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
    d = new Date(rd);
    n = new Date();

    if (d.getDate() == n.getDate() && d.getMonth() == n.getMonth())
        pre = "Auj."
    else if (d.getMonth() == n.getMonth() && d.getDate() > n.getDate()-7)
        pre = days[d.getDay()];
    else
    {
        if (String(d.getDate()).length == 1) pre = `0${d.getDate()}`;
        else pre = `${d.getDate()}`;
        if (String(d.getMonth()+1).length == 1) pre = `${pre}/0${d.getMonth()+1}`;
        else pre = `${pre}/${d.getMonth()+1}`;
    }

    if (String(d.getHours()).length == 1) suf = `0${d.getHours()}`;
    else suf = `${d.getHours()}`;

    if (String(d.getMinutes()).length == 1) suf = `${suf}h0${d.getMinutes()}`;
    else suf = `${suf}h${d.getMinutes()}`;

    return `${pre} ${suf}`;
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