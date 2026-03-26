const missions = [];

let uuid = "";
let currentMissionID = -1;

function load_mis()
{
  if (localStorage.getItem("uuid") == null)
    back();
  
  uuid = localStorage.getItem("uuid");

  var httpRequest = getHttpRequest();
  httpRequest.open('GET', `db.php`, true);
  httpRequest.send();
  httpRequest.onreadystatechange = function ()
  {
    if (httpRequest.readyState === 4)
    {
      if (httpRequest.status === 200)
      {
        JSON.parse(httpRequest.responseText).forEach(m =>
        {
          missions.push(m);
        });

        missions.sort((a, b) =>
        {
          const aDone = a.current >= a.max;
          const bDone = b.current >= b.max;

          if (aDone !== bDone)
            return aDone ? 1 : -1; // a va après s’il est terminé

          return b.id - a.id;
        });

        renderMissions();
      }
    }
  }

  document.addEventListener("click", (e) =>
  {
    if (!document.getElementsByClassName("login-form")[0].contains(e.target))
      document.getElementsByClassName("login-container")[0].style.display = "none";
  });
}

async function send()
{
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('media', file);
  formData.append('uuid', uuid);
  formData.append('id', currentMissionID);
  formData.append('repost', document.getElementById('repost').checked);

  fileInput.value = "";
  showLabel("Ta preuve est en train de s'envoyer, attends un peu");

  try
  {
    document.getElementsByClassName("loader")[0].style.display = "inline-grid";
    document.getElementsByClassName("login-container")[0].style.display = "none";
    const response = await fetch('upload.php',
    {
      method: 'POST',
      body: formData
    });

    document.getElementsByClassName("loader")[0].style.display = "none";

    const result = await response.json();

    if (result.status == 1)
      showLabel("Preuve envoyée, en attente de confirmation");
    else if (result.status == 0)
      showLabel("Fichier trop lourd (>50Mo)");
    else
      showLabel("Erreur lors de l'envoi du fichier")
  }
  catch (error)
  {
    console.error(error);
  }
}

function renderMissions()
{
  const container = document.getElementById("missionsList");
  container.innerHTML = "";

  missions.forEach(mission =>
  {
    completed = parseInt(mission.currentCompletions) >= parseInt(mission.maxCompletions) || mission.maxCompletions == 999 || mission.maxCompletions == 500;
    const div = document.createElement("div");
    div.className = "mission";

    const h2 = document.createElement("h2");
    h2.textContent = mission.title;
    
    div.appendChild(h2);

    const info = document.createElement("div");
    info.className = "mission-info";
    if (parseInt(mission.maxCompletions) == 999)
      info.innerHTML = 
      `
        <strong>${mission.description}</strong>
        <span>Completions : ${mission.currentCompletions}</span>
        <span>Récompense : ${mission.rewardAmount}pts</span>    
        <span>Bonus : jusqu'à ${mission.bonus}pts</span>
      `;
    else if (parseInt(mission.maxCompletions) == 500)
      info.innerHTML = 
      `
        <strong>${mission.description}</strong>
        <span>Completions : ${mission.currentCompletions}</span>
      `;    
    else
      info.innerHTML = 
      `
        <strong>${mission.description}</strong>
        <span>Completions : ${mission.currentCompletions} / ${mission.maxCompletions}</span>
        <span>Récompense : K${mission.rewardAmount}</span>
        <span>Bonus : jusqu'à K${mission.bonus}</span>
      `;      
    div.appendChild(info);

    const rewardDiv = document.createElement("div");
    rewardDiv.className = "reward-list";

    if (mission.maxCompletions == 999 || mission.maxCompletions == 500)
      rewardDiv.style.width = `${100*mission.currentCompletions/50}%`;
    else rewardDiv.style.width = `${100*mission.currentCompletions/mission.maxCompletions}%`;
    //rewardDiv.style.width = `${100*mission.currentCompletions/mission.maxCompletions}%`;
    div.appendChild(rewardDiv);

    const button = document.createElement("button");
    button.className = "complete-button";
    button.textContent = "Compléter la mission";
    button.disabled = parseInt(mission.currentCompletions) >= parseInt(mission.maxCompletions) || parseInt(mission.maxCompletions) == 999;
      
    button.addEventListener("click", () =>
    {
      completeMission(mission.id);
    });
    div.appendChild(button);

    if (completed)
    {
      div.style.boxShadow = "0 0 12px rgba(255,255,255,0.35)";
      h2.style.color = "gray";
      rewardDiv.style.background = "gray";
      button.style.background = "gray";
    }

    container.appendChild(div);
  });
}

function completeMission(id)
{
  currentMissionID = id;
  setTimeout(() =>
  {
    document.getElementsByClassName("login-container")[0].style.display = "flex";
    renderMissions();
  }, 100);
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