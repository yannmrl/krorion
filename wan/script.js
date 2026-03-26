const membres =
[   
    {"prenom": "Amaury", "nom": "Taurand", "section": "BDA", "position": "SECRETARY", "age": "x"},
    {"prenom": "Antonin", "nom": "Laforgue", "section": "BDS", "position": "VICE PREZ", "age": "22"},
    {"prenom": "Arsene", "nom": "Kamla", "section": "BDS", "position": "COACH", "age": "21"},
    {"prenom": "Augustin", "nom": "Boullenger", "section": "BDE", "position": "VICE TREZ", "age": "22"},
    {"prenom": "Bouba", "nom": "Diallo", "section": "ANIM", "position": "MEMBER", "age": "21"}, //DONE
    {"prenom": "Camille", "nom": "Normier", "section": "SKI", "position": "TREZ", "age": "21"},
    {"prenom": "Celeste", "nom": "Cordier", "section": "SKI", "position": "SECRETARY", "age": "21"},
    {"prenom": "Cerine", "nom": "Yahiaoui", "section": "GALA", "position": "SECRETARY", "age": "21"},
    {"prenom": "Corentin", "nom": "Degliame", "section": "GALA", "position": "RESPO", "age": "22"},
    {"prenom": "Darius", "nom": "Noble", "section": "BDS", "position": "SECRETARY", "age": "22"},
    {"prenom": "Elouan", "nom": "Dumas-Nouvel", "section": "SKI", "position": "RESPO", "age": "21"},
    {"prenom": "Evan", "nom": "Mainguy", "section": "BDS", "position": "TREZ", "age": "23"},
    {"prenom": "Jehanne", "nom": "Domin-Rilly", "section": "BDE", "position": "MEMBER", "age": "21"},
    {"prenom": "JT", "nom": "Gabriel-Regis", "section": "COMM", "position": "MEMBER", "age": "27"},
    {"prenom": "Jules", "nom": "Auer", "section": "WEI", "position": "RESPO", "age": "x"},
    {"prenom": "Jules", "nom": "Marchasson", "section": "BDE", "position": "PREZ", "age": "21"},
    {"prenom": "Laurine", "nom": "Rey", "section": "BDE", "position": "SECRETARY", "age": "21"},
    {"prenom": "Louane", "nom": "Nemoz", "section": "BDE", "position": "VICE PREZ", "age": "21"},
    {"prenom": "Mael", "nom": "Rodier", "section": "BDA", "position": "VICE PREZ", "age": "21"}, //DONE
    {"prenom": "Matteo", "nom": "Fournier", "section": "WEI", "position": "APPRO", "age": "21"},
    {"prenom": "Natan", "nom": "Eauclere", "section": "GALA", "position": "APPRO", "age": "22"},
    {"prenom": "Paul", "nom": "Courtot", "section": "BDE", "position": "TREZ", "age": "22"},
    {"prenom": "Quentin", "nom": "Auvray", "section": "WEI", "position": "MEMBER", "age": "21"},
    {"prenom": "Sacha", "nom": "Buys", "section": "ANIM", "position": "MEMBER", "age": "22"},
    {"prenom": "Sheymaa", "nom": "Atmani", "section": "BDA", "position": "PREZ", "age": "21"},
    {"prenom": "Sindbad", "nom": "Brachet", "section": "ANIM", "position": "RESPO", "age": "x"},
    {"prenom": "Theo", "nom": "Cabrit", "section": "BDE", "position": "APPRO", "age": "22"}, //DONE
    {"prenom": "Thomas", "nom": "Blonski", "section": "BDA", "position": "TREZ", "age": "21"},
    {"prenom": "Thomas", "nom": "Fournier", "section": "ANIM", "position": "MEMBER", "age": "20"},
    {"prenom": "Valentine", "nom": "Moll", "section": "COMM", "position": "RESPO", "age": "21"},
    {"prenom": "Victor", "nom": "Hourmand", "section": "BDS", "position": "PREZ", "age": "21"}, //DONE
    {"prenom": "Yann", "nom": "Morelle", "section": "COMM", "position": "MEMBER", "age": "20"},
];

const shuffle = [7, 0, 28, 6, 27, 16, 18, 31, 19, 23, 22, 24, 1, 2, 20, 12, 5, 10, 14, 21, 17, 13, 25, 29, 4, 9, 15, 11, 26, 30, 3, 8];

let match = 
{
    filiere: "X",
    respo: "X",
    citation: "X",
    musique: "X"
};

const photoZone = document.getElementById('photoZone');
const images = photoZone.querySelectorAll('img');
let current = 0;
let currentMatch = -1;

let currentIMG = 1;
const N = membres.length;

let startX = 0;
let currentX = 0;
let isDragging = false;
let isPlaying = false;
let confirmed = false;
let uuid;

photoZone.addEventListener('mousedown', startDrag);
photoZone.addEventListener('touchstart', startDrag);

photoZone.addEventListener('mousemove', moveDrag);
photoZone.addEventListener('touchmove', moveDrag);

photoZone.addEventListener('mouseup', endDrag);
photoZone.addEventListener('touchend', endDrag);

function getRandomInt(max)
{
    return Math.ceil(Math.random() * max);
}

function load_wan()
{
    if (localStorage.getItem("uuid") == null)
        back();
    
    uuid = localStorage.getItem("uuid");

    let currentMatch;

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?is_confirmed=true&uuid=${uuid}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                let res = parseInt(httpRequest.responseText.split('|')[0]);
                match.filiere = httpRequest.responseText.split('|')[1];
                match.respo = httpRequest.responseText.split('|')[2];
                match.citation = httpRequest.responseText.split('|')[3];
                match.musique = httpRequest.responseText.split('|')[4];
                //currentMatch = parseInt(httpRequest.responseText.split('|')[1]);
                if (res != -1)
                {
                    currentIMG = res;
                    document.getElementById("photoZone").style.border = "2px solid red";
                    document.getElementsByClassName("info")[0].style.border = "2px solid red";
                    document.getElementsByClassName("info")[1].style.border = "2px solid red";
                    document.getElementById("confirm").innerHTML = "CONFIRMED";
                    confirmed = true;
                }
                else currentIMG = getRandomInt(N);

                document.getElementsByClassName("active")[0].src = `img/${currentIMG}.jpg`;

                document.getElementsByClassName("info")[0].children[0].children[1].innerHTML = membres[currentIMG-1].prenom;
                document.getElementsByClassName("info")[0].children[1].children[1].innerHTML = membres[currentIMG-1].nom;
                document.getElementsByClassName("info")[0].children[2].children[1].innerHTML = membres[currentIMG-1].section;
                document.getElementsByClassName("info")[0].children[3].children[1].innerHTML = membres[currentIMG-1].position;
                document.getElementsByClassName("info")[0].children[4].children[1].innerHTML = membres[currentIMG-1].age;

                document.getElementsByClassName("inactive")[0].src = `img/${++currentIMG}.jpg`;

                document.getElementsByClassName("info")[1].children[0].children[1].innerHTML = match.filiere;//match[currentMatch].filiere;
                document.getElementsByClassName("info")[1].children[1].children[1].innerHTML = match.respo;//match[currentMatch].respo;
                document.getElementsByClassName("info")[1].children[2].children[1].innerHTML = match.citation;//match[currentMatch].citation;

                document.getElementById("player").children[1].innerHTML = match.musique;//match[currentMatch].musique;

            }
        }
    }
}

function play()
{
    if (isPlaying)
    {
        document.getElementById("player").children[0].innerHTML = `<svg style="margin-right: 10px" onclick="play()" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 32 32" fill="#fff"><path d="M5.92 24.096q0 1.088 0.928 1.728 0.512 0.288 1.088 0.288 0.448 0 0.896-0.224l16.16-8.064q0.48-0.256 0.8-0.736t0.288-1.088-0.288-1.056-0.8-0.736l-16.16-8.064q-0.448-0.224-0.896-0.224-0.544 0-1.088 0.288-0.928 0.608-0.928 1.728v16.16z"/></svg>`;
        window.parent.postMessage(
            {action: "pause"},
            "https://krorion.wysigot.com"
        );
    }
    else
    {
        document.getElementById("player").children[0].innerHTML = `<svg style="margin-right: 10px" onclick="play()" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 32 32" fill="#fff"><path d="M5.92 24.096q0 0.832 0.576 1.408t1.44 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.44 0.576t-0.576 1.44v16.16zM18.016 24.096q0 0.832 0.608 1.408t1.408 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.408 0.576t-0.608 1.44v16.16z"/></svg>`;
        window.parent.postMessage(
            {action: "play", trackId: currentMatch},
            "https://krorion.wysigot.com"
        );        
    }

    isPlaying = !isPlaying;
}

function startDrag(e)
{
    if (confirmed) return;
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    images[current].classList.add('swiping');
}

function moveDrag(e)
{
    if (confirmed) return;
    if (!isDragging) return;
    currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = currentX - startX;
    images[current].style.transform = `translateX(${dx}px) rotate(${dx / 20}deg)`;
}

function endDrag(e)
{
    if (confirmed) return;
    if (!isDragging) return;
    isDragging = false;
    images[current].classList.remove('swiping');

    const dx = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) - startX;

    if (dx > 100) changeImage(1);
    else if (dx < -100) changeImage(-1);
    else images[current].style.transform = '';
}

function changeImage(direction)
{
    images[current].style.transition = "transform 0.3s ease, opacity 0.3s ease";
    images[current].style.transform = `translateX(${direction * 400}px) rotate(${direction * 15}deg)`;
    images[current].style.opacity = "0";

    document.getElementsByClassName("info")[0].children[0].children[1].innerHTML = membres[currentIMG-1].prenom;
    document.getElementsByClassName("info")[0].children[1].children[1].innerHTML = membres[currentIMG-1].nom;
    document.getElementsByClassName("info")[0].children[2].children[1].innerHTML = membres[currentIMG-1].section;
    document.getElementsByClassName("info")[0].children[3].children[1].innerHTML = membres[currentIMG-1].position;    
    document.getElementsByClassName("info")[0].children[4].children[1].innerHTML = membres[currentIMG-1].age;

    setTimeout(() =>
    {
        images[current].classList.add('inactive');
        images[current].style.transform = '';
        images[current].style.opacity = '';

        current = 1 - current;

        images[current].classList.remove('inactive');
        images[current].style.transform = 'translateX(0)';

        direction = -direction;

        if (direction == 1 && currentIMG == N) currentIMG = 1;
        else if (direction == -1 && currentIMG == 1) currentIMG = N;
        else currentIMG += direction;

        document.getElementsByClassName("inactive")[0].src = `img/${currentIMG}.jpg`;
    }, 300);
}

function confirm()
{
    document.getElementById("photoZone").style.border = "2px solid red";
    document.getElementsByClassName("info")[0].style.border = "2px solid red";
    document.getElementsByClassName("info")[1].style.border = "2px solid red";
    document.getElementById("confirm").innerHTML = "CONFIRMED";
    confirmed = true;

    let currentCard;
    if (photoZone.children[0].classList.contains('inactive')) currentCard = photoZone.children[1].src.split('img/')[1].split('.')[0];
    else currentCard = photoZone.children[0].src.split('img/')[1].split('.')[0];

    console.log(currentCard);

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?confirm=${currentCard}&uuid=${uuid}`, true);
    httpRequest.send();
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