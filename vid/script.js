const video = document.getElementById('video');
const playerContainer = document.querySelector('.player-container');
const grid = document.getElementById("productsGrid");
const container = document.getElementsByClassName("container")[0];

let pauseTimeOut;

let currentGroup, firstEP, labelMoving = false;

const groups =
[
    {
        name: "La Cavale",
        thumbnail: "thu/T4.png",
        vids:
        [
            {
                name: "&Eacute;pisode 4",
                thumbnail: "thu/T4.png",
                src: "vids/trailer.mp4",
                timecode: 250,
            },
            {
                name: "&Eacute;pisode 3",
                thumbnail: "thu/T3.png",
                src: "vids/trailer.mp4",
                timecode: 167
            },
            {
                name: "&Eacute;pisode 2",
                thumbnail: "thu/T2.png",
                src: "vids/trailer.mp4",
                timecode: 68
            },
            {   
                name: "&Eacute;pisode 1",
                thumbnail: "thu/T1.png",
                src: "vids/trailer.mp4",
                timecode: 0
            }
        ]
    }
]

document.getElementById('playpause').addEventListener('click', (e) =>
{
    if (e.target != document.getElementById('playpause')) return;
    if (document.getElementById('playpause').style.opacity == 1) document.getElementById('playpause').style.opacity = 0;
    else document.getElementById('playpause').style.opacity = 1;
    clearTimeout(pauseTimeOut);
    pauseTimeOut = setTimeout(() => document.getElementById('playpause').style.opacity = 0, 1000);
});

function playpause()
{
    if (video.paused)
        video.play();
    else
        video.pause();
}

function userplay()
{
    document.getElementById('playpause').style.opacity = 0;
    document.getElementById('playpause').children[0].style.display = "none";
    document.getElementById('playpause').children[1].style.display = "block";
    video.play();
}

function userpause()
{
    clearTimeout(pauseTimeOut);
    document.getElementById('playpause').style.opacity = 1;
    document.getElementById('playpause').children[0].style.display = "block";
    document.getElementById('playpause').children[1].style.display = "none";
    video.pause();
}

document.getElementById("fullscreen-exit").addEventListener('click', () =>
{
    window.parent.postMessage(
        {
            action: "set-back-style",
            display: "block",
            args: []
        },
        "https://krorion.wysigot.com"
    );
    playerContainer.style.display = "none";
    container.style.display = "";
    video.pause();
});

function slidebegin()
{
    clearTimeout(pauseTimeOut);
    document.getElementById('playpause').style.opacity = 1;
    video.pause();
}

function slide(val)
{
    video.currentTime = video.duration*val/1000;
}

function slideend()
{
    userplay();
}

video.addEventListener('timeupdate', () =>
{
    if (parseInt(video.currentTime) != 0 || firstEP)
    {
        document.getElementById('tvslider').value = 1000*video.currentTime/video.duration;
        const vid = groups[currentGroup].vids.find(v => v.timecode == parseInt(video.currentTime));
        if (vid && !labelMoving)
        {
            labelMoving = true;
            const trailerLabel = document.getElementById('trailern');
            trailerLabel.innerHTML = vid.name;
            trailerLabel.style.bottom = "50px";
            setTimeout(() =>
            {
                trailerLabel.style.bottom = "-100px";
                labelMoving = false;
            }, 1300);
        }
    }
/*    if (video.currentTime == video.duration) document.getElementById('overlay-end').style.opacity = 1;
    else document.getElementById('overlay-end').style.opacity = 0;*/
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession)
    {
        if (video.duration)
        {
            navigator.mediaSession.setPositionState(
            {
                duration: video.duration,
                playbackRate: video.playbackRate,
                position: video.currentTime
            });
        }
    }
});

video.addEventListener('ended', () =>
{

});

function load_vid()
{
    grid.innerHTML = "";
    if ('mediaSession' in navigator)
    {
        navigator.mediaSession.metadata = new MediaMetadata(
        {
            title: "Krorion TV",
            artist: "Fugitliste",
            album: "Krorion TV",
            artwork:
            [
                { src: "../assets/menu/vid-min.png", sizes: '512x512', type: 'image/jpeg' },
            ]
        });
    }

    groups.forEach((group, id) =>
    {
        const card = document.createElement('article');
        card.className = 'card';
        card.setAttribute('role','listitem');
        card.innerHTML = `
            <div class="thumb" style="background-image: url('${group.thumbnail}')"></div>
            <div class="meta">
                <div class="name">${group.name}</div>
            </div>
        `;
        card.addEventListener('click', () =>
        {
            showGroup(id);
        });
        grid.appendChild(card);
    });
}

function showGroup(id)
{
    currentGroup = id;
    window.parent.postMessage(
        {
            action: "backFunc",
            func: "load_vid",
            args: []
        },
        "https://krorion.wysigot.com"
    );    
    grid.innerHTML = '';
    groups[id].vids.forEach((vid, idx) =>
    {
        const card = document.createElement('article');
        card.className = 'card';
        card.setAttribute('role','listitem');
        card.innerHTML = `
            <div class="thumb" style="background-image: url('${vid.thumbnail}')"></div>
            <div class="meta">
                <div class="name">${vid.name}</div>
            </div>
        `;
        card.addEventListener('click', () =>
        {
            if (idx == 0) firstEP = true;
            else firstEP = false;
            video.src = vid.src;
            video.preload = "auto";
            window.parent.postMessage(
                {action: "load", page: "vid"},
                "https://krorion.wysigot.com"
            );

            video.addEventListener("loadedmetadata", () =>
            {
                video.currentTime = vid.timecode;
                video.addEventListener("seeked", () =>
                {
                    window.parent.postMessage(
                        {action: "loaded"},
                        "https://krorion.wysigot.com"
                    );
                    window.parent.postMessage(
                        {
                            action: "set-back-style",
                            display: "none",
                            args: []
                        },
                        "https://krorion.wysigot.com"
                    );
                    
                    playerContainer.style.display = "flex";
                    container.style.display = "none";
                    window.parent.postMessage(
                        {action: "pause"},
                        "https://krorion.wysigot.com"
                    );
                    video.play();
                }, { once: true });
            }, { once: true });
        });
        grid.appendChild(card);
    });
}