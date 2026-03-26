let uuid = "";
let isListeux = false;

const playerContainer = document.querySelector('.player-container');
const grid = document.getElementById("productsGrid");
const pgrid = document.getElementById("pgrid");

const LIMIT = 20;

let days = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
let posts = [];
let offset_loaded = [];

let currentPost = -1;

let img, ratio, d, n, pre, suf;
let cardWidth;
let timedout = false;

let mutedState = false;

let isLoading = false;

const rowHeight = 10;
const gap = 10;

let j;

function load_ins()
{
    if (localStorage.getItem("uuid") == null)
        back();
    
    uuid = localStorage.getItem("uuid");

    load_new(0);

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?isListeux=${uuid}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                if (parseInt(httpRequest.responseText) == 1)
                    document.getElementById('post').style.display = "block";
            }
        }
    }
}

function load_new(offset)
{
    isLoading = true;
    if (timedout) return;
    timedout = true;
    setTimeout(() => timedout = false, 500);
    if (offset_loaded.includes(offset)) return;
    else offset_loaded.push(offset);
    console.log(`Loading from offset ${offset}`);
	var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?get_posts=${uuid}&offset=${offset}&limit=${LIMIT}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                posts = posts.concat(JSON.parse(httpRequest.responseText));
                load_img(offset);
            }
        }
    }
}

function parseDate(rd)
{
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

let fromShared = -1;

async function load_img(offset)
{
    window.parent.postMessage(
        {
            action: "exec",
            func: "hideLoader",
            args: []
        },
        "https://krorion.wysigot.com"
    );
    
    if (window.location.href.includes('ins/?'))
        fromShared = window.location.href.split('ins/?')[1].length ? parseInt(window.location.href.split('ins/?')[1]) : -1;

    loop(0);
}

async function loop(i)//for (let i = offset; i < posts.length; i++)
{
    j = i;
    let image;
    const card = document.createElement('article');
    card.id = String(posts[i].id);
    card.className = 'card';
    card.setAttribute('role','listitem');
    let mediaSrc;
    if (posts[i].ext == "mp4") mediaSrc =
    `
        <video src="photos/${posts[i].id}.mp4" loop onclick="mute(this)" playsinline></video>
        <div class="sound" style="opacity: 0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M10.94 17.72 C12.94 19.5 15.39 20.72 16.55 20.33 C18.65 19.55 19 15.33 19 12.41 C19 11.6 19 10.68 18.89 9.77" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.13 6.28 C18 5.89 17.8 5.53 17.52 5.23 C17.25 4.92 16.92 4.67 16.55 4.5 C15.32 4.04 12.71 5.5 10.55 7.41 H8.95 C7.89 7.41 6.87 7.83 6.12 8.58 C5.37 9.33 4.95 10.35 4.95 11.41 V13.41 C4.95 14.18 5.17 14.94 5.59 15.58 C6.01 16.23 6.61 16.74 7.31 17.06" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 2.42L2 22.42" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>                
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M12.55 4.5C11.32 4.04 8.71 5.5 6.55 7.41H4.95 C3.89 7.41 2.87 7.83 2.12 8.58 C1.37 9.33 0.95 10.35 0.95 11.41 V13.41 C0.95 14.47 1.37 15.49 2.12 16.24 C2.87 16.99 3.89 17.41 4.95 17.41 H6.55 C8.66 19.35 11.27 20.78 12.55 20.33 C14.65 19.55 15 15.33 15 12.41 C15 9.49 14.65 5.28 12.55 4.5Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20.66 6.72 C22.16 8.22 23 10.25 23 12.38 C23 14.5 22.16 16.53 20.66 18.03" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.54 15.95 C19.48 15.01 20 13.74 20 12.41 C20 11.09 19.48 9.82 18.54 8.88" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
    `;
    else mediaSrc = `<img src="photos/${posts[i].id}.${posts[i].ext}">`;
    card.innerHTML = `
        <div class="thumb">${mediaSrc}</div>
        <div class="meta">
            <div class="name">${posts[i].desc}</div>
            <div class="date">${parseDate(posts[i].date)}</div>
        </div>
        <div class="controls">
            <div class="svg-container">
                <svg onclick="like(${posts[i].id})" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill="#8b0000"
                        stroke="#8b0000"
                        stroke-width="1.5"
                        fill-rule="evenodd"
                        d="M5.62436 4.4241C3.96537 5.18243 2.75 6.98614 2.75 9.13701C2.75 11.3344 3.64922 13.0281 4.93829 14.4797C6.00072 15.676 7.28684 16.6675 8.54113 17.6345C8.83904 17.8642 9.13515 18.0925 9.42605 18.3218C9.95208 18.7365 10.4213 19.1004 10.8736 19.3647C11.3261 19.6292 11.6904 19.7499 12 19.7499C12.3096 19.7499 12.6739 19.6292 13.1264 19.3647C13.5787 19.1004 14.0479 18.7365 14.574 18.3218C14.8649 18.0925 15.161 17.8642 15.4589 17.6345C16.7132 16.6675 17.9993 15.676 19.0617 14.4797C20.3508 13.0281 21.25 11.3344 21.25 9.13701C21.25 6.98614 20.0346 5.18243 18.3756 4.4241C16.7639 3.68739 14.5983 3.88249 12.5404 6.02065C12.399 6.16754 12.2039 6.25054 12 6.25054C11.7961 6.25054 11.601 6.16754 11.4596 6.02065C9.40166 3.88249 7.23607 3.68739 5.62436 4.4241ZM12 4.45873C9.68795 2.39015 7.09896 2.10078 5.00076 3.05987C2.78471 4.07283 1.25 6.42494 1.25 9.13701C1.25 11.8025 2.3605 13.836 3.81672 15.4757C4.98287 16.7888 6.41022 17.8879 7.67083 18.8585C7.95659 19.0785 8.23378 19.292 8.49742 19.4998C9.00965 19.9036 9.55954 20.3342 10.1168 20.6598C10.6739 20.9853 11.3096 21.2499 12 21.2499C12.6904 21.2499 13.3261 20.9853 13.8832 20.6598C14.4405 20.3342 14.9903 19.9036 15.5026 19.4998C15.7662 19.292 16.0434 19.0785 16.3292 18.8585C17.5898 17.8879 19.0171 16.7888 20.1833 15.4757C21.6395 13.836 22.75 11.8025 22.75 9.13701C22.75 6.42494 21.2153 4.07283 18.9992 3.05987C16.901 2.10078 14.3121 2.39015 12 4.45873Z"
                    />
                </svg>
                <label>${(posts[i].likes)*3+2}</label>
            </div>
            <div class="svg-container">
                <svg onclick="comment(${posts[i].id})" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <path
                        fill="#8b0000"
                        stroke="#8b0000"
                        stroke-width="1.5"
                        fill-rule="evenodd"
                        d="M22.75 12C22.75 6.06294 17.9371 1.25 12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 13.7183 1.65371 15.3445 2.37213 16.7869C2.47933 17.0021 2.50208 17.2219 2.4526 17.4068L1.857 19.6328C1.44927 21.1566 2.84337 22.5507 4.3672 22.143L6.59324 21.5474C6.77814 21.4979 6.99791 21.5207 7.21315 21.6279C8.65553 22.3463 10.2817 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12ZM12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C10.5189 21.25 9.12121 20.9025 7.88191 20.2852C7.38451 20.0375 6.78973 19.9421 6.20553 20.0984L3.97949 20.694C3.57066 20.8034 3.19663 20.4293 3.30602 20.0205L3.90163 17.7945C4.05794 17.2103 3.96254 16.6155 3.7148 16.1181C3.09752 14.8788 2.75 13.4811 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75Z"
                    />
                </svg>
                <label>${posts[i].comms}</label>
            </div>
            <div class="svg-container">
                <svg onclick="share(${posts[i].id})" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <path
                        fill="#8b0000"
                        stroke="#8b0000"
                        stroke-width="1.5"
                        fill-rule="evenodd"
                        d="M18.1437 3.63083C16.9737 3.83896 15.3964 4.36262 13.1827 5.10051L8.17141 6.77094C6.39139 7.36428 5.1021 7.79468 4.19146 8.182C3.23939 8.58693 2.90071 8.86919 2.79071 9.0584C2.45191 9.64118 2.45191 10.361 2.79071 10.9437C2.90071 11.1329 3.23939 11.4152 4.19146 11.8201C5.1021 12.2075 6.39139 12.6379 8.17141 13.2312C8.19952 13.2406 8.22727 13.2498 8.25468 13.2589C8.63431 13.3852 8.94795 13.4895 9.22198 13.6328L14.5454 8.36811C14.8471 8.06974 15.3335 8.07243 15.6319 8.37413C15.9303 8.67583 15.9276 9.16229 15.6259 9.46067L10.3259 14.7022C10.4912 14.994 10.603 15.3302 10.7411 15.7453C10.7502 15.7727 10.7594 15.8005 10.7688 15.8286C11.3621 17.6086 11.7925 18.8979 12.1799 19.8085C12.5848 20.7606 12.867 21.0993 13.0563 21.2093C13.639 21.5481 14.3588 21.5481 14.9416 21.2093C15.1308 21.0993 15.4131 20.7606 15.818 19.8085C16.2053 18.8979 16.6357 17.6086 17.2291 15.8286L18.8995 10.8173C19.6374 8.60363 20.161 7.02627 20.3692 5.85629C20.5783 4.68074 20.4185 4.1814 20.1185 3.88146C19.8186 3.58152 19.3193 3.42171 18.1437 3.63083ZM17.8746 2.11797C19.1768 1.88632 20.3496 1.93941 21.2051 2.79491C22.0606 3.65041 22.1137 4.82322 21.882 6.12542C21.6518 7.41975 21.0903 9.10415 20.3794 11.2367L18.6745 16.3515C18.096 18.0869 17.6465 19.4354 17.232 20.41C16.8322 21.35 16.3882 22.1457 15.7139 22.5377C14.6537 23.1541 13.3442 23.1541 12.284 22.5377C11.6096 22.1457 11.1657 21.35 10.7658 20.41C10.3513 19.4354 9.90184 18.0869 9.32338 16.3515L9.31105 16.3145C9.10838 15.7065 9.04661 15.5416 8.95909 15.4109C8.86114 15.2646 8.73545 15.1389 8.58913 15.0409C8.4584 14.9534 8.29348 14.8916 7.68549 14.689L7.64845 14.6766C5.91306 14.0982 4.56463 13.6487 3.59005 13.2342C2.64996 12.8343 1.85431 12.3904 1.46228 11.716C0.845907 10.6558 0.845908 9.34634 1.46228 8.28611C1.85431 7.61177 2.64996 7.16781 3.59005 6.76797C4.56464 6.35345 5.91309 5.90397 7.64852 5.3255L12.7633 3.62057C14.8959 2.9097 16.5803 2.34822 17.8746 2.11797Z"
                    />
                </svg>
            </div>
        </div>
    `;

    grid.appendChild(card);
    if (card.clientWidth) cardWidth = card.clientWidth;

    if (posts[i].liked) grid.children[i].children[2].children[0].children[0].children[0].style.fillRule = "nonzero";

    let ext = posts[i].ext;
    if (ext == "mp4") ext = "webp";

    const pcard = document.createElement('div');
    pcard.classList.add("pgrid-item");
    pcard.addEventListener('click', () => showFeed(posts[i].id));
    image = document.createElement('img');
    image.id = `i${posts[i].id}`;
    image.style.opacity = 0;
    image.src = `photos/${posts[i].id}.${ext}`;
    image.alt = "";
    pcard.appendChild(image);
    pgrid.appendChild(pcard);

    document.getElementById(posts[i].id).children[0].style.height = 'auto';//`${cardWidth*posts[i].ratio}px`;

    image.onload = async function ()
    {
        console.log(`Loaded image ${i+1}/${posts.length}`);
        if (parseInt(image.id.slice(1)) == fromShared) showFeed(fromShared);
        image.loaded = true;

        let rowSpan = Math.ceil((image.getBoundingClientRect().height + gap) / (rowHeight + gap));
        image.parentElement.style.setProperty('--span', rowSpan);
        image.style.opacity = 1;
        if (i < posts.length-1)
        {
            if (i == 0 || i%10 || 1)
                loop(i+1);
        }
        else loaded();
    }
}

function loaded()
{
    console.log("LOADED");

    isLoading = false;

    if (!window.location.href.includes('ins/?')) return;
    if (window.location.href.split('ins/?')[1].length)
        showFeed(parseInt(window.location.href.split('ins/?')[1]));
}

function waitForCondition(conditionFn, interval = 100)
{
    return new Promise((resolve) =>
    {
        const check = () =>
        {
            if (conditionFn())
                resolve();
            else
                setTimeout(check, interval);
        };
        check();
    });
}

function getVideoMostlyVisible()
{
    const videos = document.querySelectorAll('video');
    const viewportHeight = window.innerHeight;

    for (let video of videos)
    {
        const rect = video.getBoundingClientRect();
        const videoHeight = rect.height;

        const visibleTop = Math.max(rect.top, 0);
        const visibleBottom = Math.min(rect.bottom, viewportHeight);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        if (visibleHeight >= videoHeight / 2)
            return video;
    }

    return null;
}

function showLabel(s)
{
	const label = document.getElementById('label');
	label.innerHTML = s;

	label.classList.add('visible');
	label.style.display = "block";

	setTimeout(() =>
	{
		label.classList.remove('visible');
		label.style.display = "none";
	}, 2000);
}

function mute(el)
{
    mutedState = !mutedState;
    for (video of document.querySelectorAll('video'))
        video.muted = mutedState;

    svgMute = el.nextElementSibling.children[0];
    svgUnmute = el.nextElementSibling.children[1];

    if (mutedState)
    {
        svgMute.style.display = "block";
        svgUnmute.style.display = "none";
    }
    else
    {
        svgMute.style.display = "none";
        svgUnmute.style.display = "block";
    }
    svgMute.parentElement.style.opacity = 0.6;
    setTimeout(() => svgMute.parentElement.style.opacity = 0, 500);

}

function showFeed(i)
{
    console.log("showFeed");
    grid.style.display = "grid";
    pgrid.style.opacity = 0;
    document.getElementById(i).scrollIntoView({ block: "center" });    
    window.parent.postMessage(
        {
            action: "backFunc",
            func: "showMain"
        },
        "https://krorion.wysigot.com"
    );

    let fVid = getVideoMostlyVisible();
    for (let video of document.querySelectorAll("video"))
        if (video != fVid) video.pause();

    if (fVid && grid.style.display != "none")
        fVid.play();
}

function showMain()
{
    console.log("showMain")
    for (let video of document.querySelectorAll("video")) video.muted = true;
    idx = Array.from(document.getElementsByClassName("card")).indexOf(getFocusedEl());    
    grid.style.display = "none";
    pgrid.style.opacity = 1;
    document.getElementsByClassName("pgrid-item")[idx].scrollIntoView({ block: "center" });
}

function getFocusedEl()
{
    const elements = document.querySelectorAll('.card');

    const middle = window.innerHeight / 2;

    let nearbyEl = null;
    let distanceMin = Infinity;

    elements.forEach(el =>
    {
        const rect = el.getBoundingClientRect();

        const middleEl = rect.top + rect.height / 2;
        const distance = Math.abs(middle - middleEl);

        if (distance < distanceMin) {
            distanceMin = distance;
            nearbyEl = el;
        }
    });

    return nearbyEl;
}

function like(i)
{
    let heart = document.getElementById(i).children[2].children[0].children[0];
    let label = document.getElementById(i).children[2].children[0].children[1];
    heart.style.transform = 'scale(1.3)';
    setTimeout(() => heart.style.transform = 'scale(1)', 200);

    let likes = label.innerHTML;

    if (heart.children[0].style.fillRule == "evenodd" || heart.children[0].style.fillRule == "")
    {
        heart.children[0].style.fillRule = "nonzero";
        label.innerHTML = String(parseInt(label.innerHTML)+1);        
    }
    else
    {
        heart.children[0].style.fillRule = "evenodd";
        label.innerHTML = String(parseInt(label.innerHTML)-1);        
    }

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?like=${i}&uuid=${uuid}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                if (parseInt(httpRequest.responseText) == 0) // unliked
                {
                    heart.children[0].style.fillRule = "evenodd";
                    label.innerHTML = String(parseInt(likes)-1);
                }
                else // liked
                {
                    heart.children[0].style.fillRule = "nonzero";
                    label.innerHTML = String(parseInt(likes)+1);
                }
            }
        }
    }    
}

let lastTap = 0;

document.addEventListener('touchend', function(event)
{
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    if (tapLength < 300 && tapLength > 0)
    {
        const tappedElement = event.target;
        
        if (tappedElement.src != undefined)
            like(parseInt(tappedElement.src.split('photos/')[1].split('.')[0]));
    }

    lastTap = currentTime;
});

function comment(i)
{
    currentPost = i;

    Array.from(document.getElementById('comments').children).slice(2).forEach(msg => msg.remove());

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?get_comms=${i}&uuid=${uuid}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                comms = JSON.parse(httpRequest.responseText);

                comms.forEach(comm =>
                {
                    msg = document.createElement('div');
                    msg.classList.add('message');
                    if (comm.name == "Moi") msg.classList.add('sent'); else msg.classList.add('received');

                    author = document.createElement('div');
                    author.classList.add('author');
                    author.innerHTML = comm.name;

                    bubble = document.createElement('div');
                    bubble.classList.add('bubble');
                    bubble.innerHTML = decodeURIComponent(comm.content);

                    msg.appendChild(author);
                    msg.appendChild(bubble);

                    document.getElementById('comments').appendChild(msg);
                });

                document.getElementById('comments').style.height = '80%';
                document.getElementsByClassName("chat-input")[0].style.display = "flex";
                try
                {
                    document.getElementsByClassName("message")[document.getElementsByClassName("message").length-1].scrollIntoView({ block: "start" });
                }
                catch {console.log("no comments")}
            }
        }
    }
}

function close_comments()
{
    document.getElementById('comments').style.height = '0'
    document.getElementsByClassName("chat-input")[0].style.display = "none";
}

function send()
{
    msgContent = document.getElementById("messageInput").value;
    if (!msgContent.trim().length) return;
    document.getElementById("messageInput").value = "";

    msg = document.createElement('div');
    msg.classList.add('message');
    msg.classList.add('sent');

    author = document.createElement('div');
    author.classList.add('author');
    author.innerHTML = "Moi";

    bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.innerHTML = msgContent;

    msg.appendChild(author);
    msg.appendChild(bubble);

    document.getElementById('comments').appendChild(msg);

    document.getElementById(currentPost).children[2].children[1].children[1].innerHTML = `${parseInt(document.getElementById(currentPost).children[2].children[1].children[1].innerHTML)+1}`;

    msg.scrollIntoView({ block: "start" });

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?comment=${encodeURIComponent(msgContent)}&uuid=${uuid}&post=${currentPost}`, true);
    httpRequest.send();
}

async function share(i)
{
    if (navigator.share)
    {
        try
        {
            await navigator.share({
                title: 'Krorion Photos',
                text: `Regarde "${posts.find(p => p.id == i).desc}" sur Krorion Photos`,
                url: `https://krorion.wysigot.com?ins/?${i}`
            });
        }
        catch (err)
        {
            console.error('Erreur de partage :', err);
        }
    }
    else
    {
        alert('Votre navigateur ne supporte pas le partage');
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

async function upload()
{
    document.getElementsByClassName('login-container')[0].style.display = "none";
    const fileInput = document.getElementById('fileInput');
    const desc = document.getElementById('descInput');
    const file = fileInput.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('media', file);
    formData.append('uuid', uuid);
    formData.append('desc', desc.value);

    fileInput.value = "";
    desc.value = "";

    let url;

    showLabel("Upload en cours...");

    if (file.type.startsWith('video/')) url = "convert.php";
    else url = "upload.php";
    const response = await fetch(url,
    {
        method: 'POST',
        body: formData
    });

    if (response.ok) showLabel("Upload terminé");
}

function post()
{
    document.getElementsByClassName('login-container')[0].style.display = "flex";
}

window.addEventListener('scroll', () =>
{
    let fVid = getVideoMostlyVisible();
    for (let video of document.querySelectorAll("video"))
        if (video != fVid) video.pause();

    if (fVid && grid.style.display != "none")
        fVid.play();
});