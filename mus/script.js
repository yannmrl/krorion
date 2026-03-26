// === Données ===
const playlists =
[
    {
        id: 0,
        name: "WANTED",
        description: "",
        color: "#000",
        n: 32,
        tracks: []
    },
    {
        id: 1,
        name: "Techno",
        description: "technoooo",
        color: "#8b0000",
        n: 54,
        tracks: []
    },
    {
        id: 2,
        name: "Rap FR",
        description: "rap fr",
        color: "#788575",
        n: 62,
        tracks: []
    },
    {
        id: 3,
        name: "Random",
        description: "random",
        color: "#74008B",
        n: 51,
        tracks: []
    },
    {
        id: 4,
        name: "House",
        description: "house",
        color: "#4A228A",
        n: 52,
        tracks: []
    },
    {
        id: 5,
        name: "Rap Inter",
        description: "rap inter",
        color: "#228A7A",
        n: 19,
        tracks: []
    },
    {
        id: 6,
        name: "Electro",
        description: "electro",
        color: "#000B3D",
        n: 25,
        tracks: []
    },
    {
        id: 7,
        name: "Kartel",
        description: "",
        color: "black",
        n: 1,
        tracks: []
    }
];

let played = [];
let played_favs = [];
let queue = [];
let fav = [];
let uuid = "";
let playingfavs = false;

let currentPlaylistIndex = -1;
let currentTrackIndex = -1;

// === Sélecteurs ===
const el =
{
    list: document.getElementById('playlistList'),
    audio: document.getElementById('audio'),
    playBtn: document.getElementById('playBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    coverArt: document.getElementById('coverArt'),
    trackTitle: document.getElementById('trackTitle'),
    trackArtist: document.getElementById('trackArtist'),
    progress: document.getElementById('progress'),
    search: document.getElementById('searchInput')
};

// Vues
const mainView = document.getElementById('content');
const playlistView = document.getElementById('playlistView');
const playlistList = document.getElementById('playlistList');
const trackList = document.getElementById('trackList');
const playlistTitle = document.getElementById('playlistTitle');

el.playBtn.addEventListener('click', () =>
{
    click_playBtn();
});

el.prevBtn.addEventListener('click', async () =>
{
    click_prevBtn();
});

el.nextBtn.addEventListener('click', async () =>
{
    click_nextBtn();
});


const progress = document.getElementById('progress');

if (!progress)
{
    const progressWrap = document.createElement('div');
    progressWrap.className = 'progress-wrap';
    progressWrap.innerHTML = `<input id="progress" type="range" min="0" max="100" value="0" />`;
    document.querySelector('.player-right').appendChild(progressWrap);
}

// === Recherche de playlists ===

el.search.addEventListener('input', async e =>
{
    const q = e.target.value.toLowerCase();
    if (!q.length) {showPlaylists(); return}

    mainView.classList.add('hidden');
    playlistView.classList.remove('hidden');

    playlistTitle.textContent = `Résultats pour ${q}`;

    trackList.innerHTML = '';

    const results = playlists.slice(1)
        .map(playlist =>
        {
            if (Array.isArray(playlist.tracks))
            {
                const filteredTracks = playlist.tracks.filter(track =>
                    track
                    &&
                    (
                        (
                            track.title.toLowerCase().includes(q)
                            ||
                            (new Levenshtein(track.artist.toLowerCase(), q).distance < q.length/3)
                        )
                        ||
                        (
                            !playlist.tracks.some(str => str.title.toLowerCase().includes(q))
                            &&
                            track.artist.toLowerCase().includes(q)
                        )
                    )
                );

                return { ...playlist, tracks: filteredTracks };
            }
            else return { ...playlist, tracks: [] };
        })
        .filter(playlist => playlist.tracks.length > 0);
    
    results.forEach((filtered) =>
    {
        const h2 = document.createElement('h2');
        h2.className = "section-title";
        h2.innerHTML = filtered.name;
        trackList.appendChild(h2);
        filtered.tracks.forEach((song) =>
        {
            queueColor = "#323232";
            favColor = "#323232";

            if (containsOrderedPair(queue, [filtered.id, song.index])) queueColor = "#8b0000";
            if (containsOrderedPair(fav, [filtered.id, song.index])) favColor = "#8b0000";

            const li = document.createElement('li');
            li.className = 'playlist-item X';
            li.id = `${filtered.id}-${song.index}`;
            li.innerHTML =
            `
                <div class="thumb" style="background: ${filtered.color}">
                    <img src="mus/images/${filtered.id}-${song.index}.jpeg" alt="cover" class="thumb-img" />
                </div>
                <div class="play-info">
                    <div class="pl-title">${song.title}</div>
                    <div class="pl-sub">${song.artist}</div>
                </div>
                <div style="width: 25%; display: flex">
                    <svg class="queue" onclick="addToQueue(${filtered.id}, ${song.index})" style="width: 60%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-labelledby="addToListIconTitle" stroke="${queueColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" color="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title id="addToListIconTitle">Add To List</title> <path d="M6 10H18"></path> <path d="M6 6H18"></path> <path d="M6 14H10"></path> <path d="M14 16H18"></path> <path d="M16 14L16 18"></path> <path d="M6 18H10"></path> </g></svg>
                    <svg class="fav" onclick="addToFav(${filtered.id}, ${song.index})" style="width: 55%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4.8824 12.9557L10.5021 19.3071C11.2981 20.2067 12.7019 20.2067 13.4979 19.3071L19.1176 12.9557C20.7905 11.0649 21.6596 8.6871 20.4027 6.41967C18.9505 3.79992 16.2895 3.26448 13.9771 5.02375C13.182 5.62861 12.5294 6.31934 12.2107 6.67771C12.1 6.80224 11.9 6.80224 11.7893 6.67771C11.4706 6.31934 10.818 5.62861 10.0229 5.02375C7.71053 3.26448 5.04945 3.79992 3.59728 6.41967C2.3404 8.6871 3.20947 11.0649 4.8824 12.9557Z" stroke="${favColor}" fill="${favColor}" stroke-width="2" stroke-linejoin="round"></path> </g></svg>
                    <svg class="download" onclick="showMusicMenu(${filtered.id}, ${song.index})" style="width: 60%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#323232" stroke="#323232"><path d="M12.5 6.25C12.9142 6.25 13.25 5.91421 13.25 5.5C13.25 5.08579 12.9142 4.75 12.5 4.75V6.25ZM20.25 12.5C20.25 12.0858 19.9142 11.75 19.5 11.75C19.0858 11.75 18.75 12.0858 18.75 12.5H20.25ZM19.5 6.25C19.9142 6.25 20.25 5.91421 20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75V6.25ZM15.412 4.75C14.9978 4.75 14.662 5.08579 14.662 5.5C14.662 5.91421 14.9978 6.25 15.412 6.25V4.75ZM20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75C19.0858 4.75 18.75 5.08579 18.75 5.5H20.25ZM18.75 9.641C18.75 10.0552 19.0858 10.391 19.5 10.391C19.9142 10.391 20.25 10.0552 20.25 9.641H18.75ZM20.0303 6.03033C20.3232 5.73744 20.3232 5.26256 20.0303 4.96967C19.7374 4.67678 19.2626 4.67678 18.9697 4.96967L20.0303 6.03033ZM11.9697 11.9697C11.6768 12.2626 11.6768 12.7374 11.9697 13.0303C12.2626 13.3232 12.7374 13.3232 13.0303 13.0303L11.9697 11.9697ZM12.5 4.75H9.5V6.25H12.5V4.75ZM9.5 4.75C6.87665 4.75 4.75 6.87665 4.75 9.5H6.25C6.25 7.70507 7.70507 6.25 9.5 6.25V4.75ZM4.75 9.5V15.5H6.25V9.5H4.75ZM4.75 15.5C4.75 18.1234 6.87665 20.25 9.5 20.25V18.75C7.70507 18.75 6.25 17.2949 6.25 15.5H4.75ZM9.5 20.25H15.5V18.75H9.5V20.25ZM15.5 20.25C18.1234 20.25 20.25 18.1234 20.25 15.5H18.75C18.75 17.2949 17.2949 18.75 15.5 18.75V20.25ZM20.25 15.5V12.5H18.75V15.5H20.25ZM19.5 4.75H15.412V6.25H19.5V4.75ZM18.75 5.5V9.641H20.25V5.5H18.75ZM18.9697 4.96967L11.9697 11.9697L13.0303 13.0303L20.0303 6.03033L18.9697 4.96967Z" /></svg>
                </div>
            `;

            li.addEventListener('click', async (e) =>
            {
                if (e.target.closest('svg'))
                    return;

                currentPlaylistIndex = filtered.id;
                loadTrack(getTrack(filtered.id, song.index));
                play();
            });
            trackList.appendChild(li);
        });
    });
});

document.addEventListener('input', (e) =>
{
    if (e.target && e.target.id === 'progress')
        el.audio.currentTime = e.target.value;
});

el.audio = document.getElementById("audio");

// === Synchronisation lecture ===
el.audio.addEventListener('play', () =>
{
    el.playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="#fff"><path d="M5.92 24.096q0 0.832 0.576 1.408t1.44 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.44 0.576t-0.576 1.44v16.16zM18.016 24.096q0 0.832 0.608 1.408t1.408 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.408 0.576t-0.608 1.44v16.16z"/></svg>`;
});

el.audio.addEventListener('pause', () =>
{
    el.playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="#fff"><path d="M5.92 24.096q0 1.088 0.928 1.728 0.512 0.288 1.088 0.288 0.448 0 0.896-0.224l16.16-8.064q0.48-0.256 0.8-0.736t0.288-1.088-0.288-1.056-0.8-0.736l-16.16-8.064q-0.448-0.224-0.896-0.224-0.544 0-1.088 0.288-0.928 0.608-0.928 1.728v16.16z"/></svg>`;
});

el.audio.addEventListener('ended', () =>
{
    el.nextBtn.click();
});

el.audio.addEventListener('loadedmetadata', () =>
{
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession)
    {
        if (el.audio.duration)
        {
            navigator.mediaSession.setPositionState(
            {
                duration: el.audio.duration,
                playbackRate: el.audio.playbackRate,
                position: el.audio.currentTime
            });
        }
    }

    total_seconds = Math.floor(el.audio.currentTime);
    seconds = total_seconds%60;
    minutes = Math.floor(total_seconds/60);
    if (String(seconds).length == 1) seconds = `0${seconds}`;
    if (String(minutes).length == 1) minutes = `0${minutes}`;
    if (document.getElementsByClassName("time").length)
        document.getElementsByClassName("time")[0].children[0].innerHTML = `${minutes}:${seconds}`;

    total_seconds = Math.floor(el.audio.duration);
    seconds = total_seconds%60;
    minutes = Math.floor(total_seconds/60);
    if (String(seconds).length == 1) seconds = `0${seconds}`;
    if (String(minutes).length == 1) minutes = `0${minutes}`;
    if (document.getElementsByClassName("time").length && seconds && minutes) document.getElementsByClassName("time")[0].children[1].innerHTML = `${minutes}:${seconds}`;  
});

el.audio.addEventListener('timeupdate', () =>
{
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession)
    {
        if (el.audio.duration)
        {
            navigator.mediaSession.setPositionState(
            {
                duration: el.audio.duration,
                playbackRate: el.audio.playbackRate,
                position: el.audio.currentTime
            });
        }
    }

    const p = document.getElementById('progress');
    if (p && el.audio.duration)
    {
        p.max = el.audio.duration;
        p.value = el.audio.currentTime;
    }

    total_seconds = Math.floor(el.audio.currentTime);
    seconds = total_seconds%60;
    minutes = Math.floor(total_seconds/60);
    if (String(seconds).length == 1) seconds = `0${seconds}`;
    if (String(minutes).length == 1) minutes = `0${minutes}`;
    if (document.getElementsByClassName("time").length)
        document.getElementsByClassName("time")[0].children[0].innerHTML = `${minutes}:${seconds}`;

    total_seconds = Math.floor(el.audio.duration);
    seconds = total_seconds%60;
    minutes = Math.floor(total_seconds/60);
    if (String(seconds).length == 1) seconds = `0${seconds}`;
    if (String(minutes).length == 1) minutes = `0${minutes}`;
    if (document.getElementsByClassName("time").length && seconds && minutes) document.getElementsByClassName("time")[0].children[1].innerHTML = `${minutes}:${seconds}`;  
});

/*async function download(x)
{
    i1 = parseInt(document.getElementById("musicMenu").className.split('-')[0]);
    i2 = parseInt(document.getElementById("musicMenu").className.split('-')[1].split(' ')[0]);
    title = `${playlists[i1].tracks[i2].title} ${playlists[i1].tracks[i2].artist}`;
    console.log(title);
    switch (x)
    {
        case 0: //spotify
            url = (await searchSpotify(title, token))[0].external_urls.spotify;
            window.open(url, '_blank');
            break;
        case 1: //deezer
            url = `https://www.deezer.com/search/${title}`;
            window.open(url, '_blank');
            break;
        case 2: //apple
            url = `https://music.apple.com/us/search?term=${title}`;
            window.open(url, '_blank');
            break;
        case 3: //youtube
            url = `https://music.youtube.com/search?q=${title}`;
            window.open(url, '_blank');
            break;
        case 4: //download
            url = `mus/playlists/${i1}/${i2}.mp3`;
            filename = `${playlists[i1].tracks[i2].title}-${playlists[i1].tracks[i2].artist}.mp3`;
            showLabel("Téléchargement lancé...");
            fetch(url)
                .then(response =>
                {
                    if (!response.ok) throw new Error("Network response was not ok");
                    return response.blob(); // Convertit la réponse en blob
                })
                .then(blob =>
                {
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = filename || "download";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(link.href);
                })
                .catch(error => showLabel("Erreur lors du téléchargement"));
            break;
    }
}*/

// === Affichage des playlists ===
function showPlaylists()
{
    Array.from(document.getElementById("menuFooter").children[0].children[2].children).forEach((child) => child.style.stroke = "#F54927");
    document.getElementById("menuFooter").children[1].querySelector("path").style.stroke = "#000000";
    document.getElementById("menuFooter").children[1].querySelector("path").style.fill = "none";
    document.getElementById("menuFooter").children[2].querySelector("path").style.stroke = "#000000";

    playlistView.classList.add('hidden');
    mainView.classList.remove('hidden');
    playlistList.innerHTML = '';
    playlists.forEach(async (p, idx) =>
    {
        if (idx != 0) // 0 -> WAN
        {
            const li = document.createElement('li');
            li.className = 'playlist-item';
            li.innerHTML =
            `
                <div class="thumb">
                    <img src="mus/assets/${p.name}.png" class="thumb-img" alter="cover">
                </div>
                <div class="play-info">
                    <div class="pl-title">${p.name}</div>
                    <div class="pl-sub">${p.n} titres</div>
                </div>
            `;
            li.addEventListener('click', () => showPlaylistDetail(idx));
            playlistList.appendChild(li);
        }
    });

    li = document.createElement('li');
    li.className = 'playlist-item X';
    li.id = `7-0`;
    li.innerHTML =
    `
        <div class="thumb" style="background: black"><img src="mus/kartel.png" alt="cover" class="thumb-img" /></div>
        <div class="play-info">
            <div class="pl-title">Kartel</div>
            <div class="pl-sub">Kartel Red</div>
        </div>
        <div style="width: 25%; display: flex">
            <svg class="queue" onclick="addToQueue(7, 0)" style="width: 60%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-labelledby="addToListIconTitle" stroke="" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" color="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title id="addToListIconTitle">Add To List</title> <path d="M6 10H18"></path> <path d="M6 6H18"></path> <path d="M6 14H10"></path> <path d="M14 16H18"></path> <path d="M16 14L16 18"></path> <path d="M6 18H10"></path> </g></svg>
            <svg class="fav" onclick="addToFav(7, 0)" style="width: 55%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4.8824 12.9557L10.5021 19.3071C11.2981 20.2067 12.7019 20.2067 13.4979 19.3071L19.1176 12.9557C20.7905 11.0649 21.6596 8.6871 20.4027 6.41967C18.9505 3.79992 16.2895 3.26448 13.9771 5.02375C13.182 5.62861 12.5294 6.31934 12.2107 6.67771C12.1 6.80224 11.9 6.80224 11.7893 6.67771C11.4706 6.31934 10.818 5.62861 10.0229 5.02375C7.71053 3.26448 5.04945 3.79992 3.59728 6.41967C2.3404 8.6871 3.20947 11.0649 4.8824 12.9557Z" stroke="" fill="" stroke-width="2" stroke-linejoin="round"></path> </g></svg>
            <svg class="download" onclick="showMusicMenu(7, 0)" style="width: 60%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#323232" stroke="#323232"><path d="M12.5 6.25C12.9142 6.25 13.25 5.91421 13.25 5.5C13.25 5.08579 12.9142 4.75 12.5 4.75V6.25ZM20.25 12.5C20.25 12.0858 19.9142 11.75 19.5 11.75C19.0858 11.75 18.75 12.0858 18.75 12.5H20.25ZM19.5 6.25C19.9142 6.25 20.25 5.91421 20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75V6.25ZM15.412 4.75C14.9978 4.75 14.662 5.08579 14.662 5.5C14.662 5.91421 14.9978 6.25 15.412 6.25V4.75ZM20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75C19.0858 4.75 18.75 5.08579 18.75 5.5H20.25ZM18.75 9.641C18.75 10.0552 19.0858 10.391 19.5 10.391C19.9142 10.391 20.25 10.0552 20.25 9.641H18.75ZM20.0303 6.03033C20.3232 5.73744 20.3232 5.26256 20.0303 4.96967C19.7374 4.67678 19.2626 4.67678 18.9697 4.96967L20.0303 6.03033ZM11.9697 11.9697C11.6768 12.2626 11.6768 12.7374 11.9697 13.0303C12.2626 13.3232 12.7374 13.3232 13.0303 13.0303L11.9697 11.9697ZM12.5 4.75H9.5V6.25H12.5V4.75ZM9.5 4.75C6.87665 4.75 4.75 6.87665 4.75 9.5H6.25C6.25 7.70507 7.70507 6.25 9.5 6.25V4.75ZM4.75 9.5V15.5H6.25V9.5H4.75ZM4.75 15.5C4.75 18.1234 6.87665 20.25 9.5 20.25V18.75C7.70507 18.75 6.25 17.2949 6.25 15.5H4.75ZM9.5 20.25H15.5V18.75H9.5V20.25ZM15.5 20.25C18.1234 20.25 20.25 18.1234 20.25 15.5H18.75C18.75 17.2949 17.2949 18.75 15.5 18.75V20.25ZM20.25 15.5V12.5H18.75V15.5H20.25ZM19.5 4.75H15.412V6.25H19.5V4.75ZM18.75 5.5V9.641H20.25V5.5H18.75ZM18.9697 4.96967L11.9697 11.9697L13.0303 13.0303L20.0303 6.03033L18.9697 4.96967Z" /></svg>
        </div>
    `;

    li.addEventListener('click', (e) =>
    {
        if (e.target.closest('svg'))
            return;

        playingfavs = false;

        loadTrack(getTrack(7, 0));
        play();
    });

    playlistList.prepend(li);
}

// === Détail d'une playlist ===
function showPlaylistDetail(index)
{
    window.parent.postMessage(
        {
            action: "backFunc",
            func: "showPlaylists",
            args: []
        },
        "https://krorion.wysigot.com"
    );
    const playlist = playlists[index];
    currentPlaylistIndex = index;
    playlistTitle.textContent = playlist.name;
    trackList.innerHTML = '';

    for (let i = 0; i < playlist.n; i++)
    {
        queueColor = "#323232";
        favColor = "#323232";

        if (containsOrderedPair(queue, [currentPlaylistIndex, i])) queueColor = "#8b0000";
        if (containsOrderedPair(fav, [currentPlaylistIndex, i])) favColor = "#8b0000";

        /*cons*/ li = document.createElement('li');
        li.className = 'playlist-item X';
        li.id = `${currentPlaylistIndex}-${i}`;
        li.innerHTML =
        `
            <div class="thumb" style="background:${playlist.color}"><img src="mus/${playlist.tracks[i].image}" alt="cover" class="thumb-img" /></div>
            <div class="play-info">
                <div class="pl-title">${playlist.tracks[i].title}</div>
                <div class="pl-sub">${playlist.tracks[i].artist}</div>
            </div>
            <div style="width: 25%; display: flex">
                <svg class="queue" onclick="addToQueue(${index}, ${i})" style="width: 60%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-labelledby="addToListIconTitle" stroke="${queueColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" color="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title id="addToListIconTitle">Add To List</title> <path d="M6 10H18"></path> <path d="M6 6H18"></path> <path d="M6 14H10"></path> <path d="M14 16H18"></path> <path d="M16 14L16 18"></path> <path d="M6 18H10"></path> </g></svg>
                <svg class="fav" onclick="addToFav(${index}, ${i})" style="width: 55%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4.8824 12.9557L10.5021 19.3071C11.2981 20.2067 12.7019 20.2067 13.4979 19.3071L19.1176 12.9557C20.7905 11.0649 21.6596 8.6871 20.4027 6.41967C18.9505 3.79992 16.2895 3.26448 13.9771 5.02375C13.182 5.62861 12.5294 6.31934 12.2107 6.67771C12.1 6.80224 11.9 6.80224 11.7893 6.67771C11.4706 6.31934 10.818 5.62861 10.0229 5.02375C7.71053 3.26448 5.04945 3.79992 3.59728 6.41967C2.3404 8.6871 3.20947 11.0649 4.8824 12.9557Z" stroke="${favColor}" fill="${favColor}" stroke-width="2" stroke-linejoin="round"></path> </g></svg>
                <svg class="download" onclick="showMusicMenu(${index}, ${i})" style="width: 60%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#323232" stroke="#323232"><path d="M12.5 6.25C12.9142 6.25 13.25 5.91421 13.25 5.5C13.25 5.08579 12.9142 4.75 12.5 4.75V6.25ZM20.25 12.5C20.25 12.0858 19.9142 11.75 19.5 11.75C19.0858 11.75 18.75 12.0858 18.75 12.5H20.25ZM19.5 6.25C19.9142 6.25 20.25 5.91421 20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75V6.25ZM15.412 4.75C14.9978 4.75 14.662 5.08579 14.662 5.5C14.662 5.91421 14.9978 6.25 15.412 6.25V4.75ZM20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75C19.0858 4.75 18.75 5.08579 18.75 5.5H20.25ZM18.75 9.641C18.75 10.0552 19.0858 10.391 19.5 10.391C19.9142 10.391 20.25 10.0552 20.25 9.641H18.75ZM20.0303 6.03033C20.3232 5.73744 20.3232 5.26256 20.0303 4.96967C19.7374 4.67678 19.2626 4.67678 18.9697 4.96967L20.0303 6.03033ZM11.9697 11.9697C11.6768 12.2626 11.6768 12.7374 11.9697 13.0303C12.2626 13.3232 12.7374 13.3232 13.0303 13.0303L11.9697 11.9697ZM12.5 4.75H9.5V6.25H12.5V4.75ZM9.5 4.75C6.87665 4.75 4.75 6.87665 4.75 9.5H6.25C6.25 7.70507 7.70507 6.25 9.5 6.25V4.75ZM4.75 9.5V15.5H6.25V9.5H4.75ZM4.75 15.5C4.75 18.1234 6.87665 20.25 9.5 20.25V18.75C7.70507 18.75 6.25 17.2949 6.25 15.5H4.75ZM9.5 20.25H15.5V18.75H9.5V20.25ZM15.5 20.25C18.1234 20.25 20.25 18.1234 20.25 15.5H18.75C18.75 17.2949 17.2949 18.75 15.5 18.75V20.25ZM20.25 15.5V12.5H18.75V15.5H20.25ZM19.5 4.75H15.412V6.25H19.5V4.75ZM18.75 5.5V9.641H20.25V5.5H18.75ZM18.9697 4.96967L11.9697 11.9697L13.0303 13.0303L20.0303 6.03033L18.9697 4.96967Z" /></svg>
            </div>
        `;

        //applyTagsToListItem(li, getTrack(currentPlaylistIndex, i));

        li.addEventListener('click', (e) =>
        {
            if (e.target.closest('svg'))
                return;

            playingfavs = false;

            loadTrack(getTrack(index, i));
            play();
        });
        trackList.appendChild(li);
    };

    mainView.classList.add('hidden');
    playlistView.classList.remove('hidden');
}

function showQueue()
{
    window.parent.postMessage(
        {
            action: "backFunc",
            func: "showPlaylists",
            args: []
        },
        "https://krorion.wysigot.com"
    );    
    Array.from(document.getElementById("menuFooter").children[0].children[2].children).forEach((child) => child.style.stroke = "#000000");
    document.getElementById("menuFooter").children[1].querySelector("path").style.stroke = "#000000";
    document.getElementById("menuFooter").children[1].querySelector("path").style.fill = "none";
    document.getElementById("menuFooter").children[2].querySelector("path").style.stroke = "#F54927";

    playlistTitle.textContent = "File d'attente";
    trackList.innerHTML = '';
    
    for (let i = 0; i < queue.length; i++)
    {
        favColor = "#323232";

        if (containsOrderedPair(fav, [queue[i][0], queue[i][1]])) favColor = "#8b0000";

        const li = document.createElement('li');
        li.className = 'playlist-item X';
        li.id = `${queue[i][0]}-${queue[i][1]}`;
        li.innerHTML =
        `
            <div class="thumb" style="background: ${playlists[queue[i][0]].color}">
                <img src="mus/images/${queue[i][0]}-${queue[i][1]}.jpeg" alt="cover" class="thumb-img" />
            </div>
            <div class="play-info">
                <div class="pl-title">${playlists[queue[i][0]].tracks[queue[i][1]].title}</div>
                <div class="pl-sub">${playlists[queue[i][0]].tracks[queue[i][1]].artist}</div>
            </div>
            <div style="width: 25%; display: flex">
                <svg class="queue" onclick="addToQueue(${queue[i][0]}, ${queue[i][1]})" style="width: 60%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-labelledby="addToListIconTitle" stroke="#8b0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" color="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title id="addToListIconTitle">Add To List</title> <path d="M6 10H18"></path> <path d="M6 6H18"></path> <path d="M6 14H10"></path> <path d="M14 16H18"></path> <path d="M16 14L16 18"></path> <path d="M6 18H10"></path> </g></svg>
                <svg class="fav" onclick="addToFav(${queue[i][0]}, ${queue[i][1]})" style="width: 55%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4.8824 12.9557L10.5021 19.3071C11.2981 20.2067 12.7019 20.2067 13.4979 19.3071L19.1176 12.9557C20.7905 11.0649 21.6596 8.6871 20.4027 6.41967C18.9505 3.79992 16.2895 3.26448 13.9771 5.02375C13.182 5.62861 12.5294 6.31934 12.2107 6.67771C12.1 6.80224 11.9 6.80224 11.7893 6.67771C11.4706 6.31934 10.818 5.62861 10.0229 5.02375C7.71053 3.26448 5.04945 3.79992 3.59728 6.41967C2.3404 8.6871 3.20947 11.0649 4.8824 12.9557Z" stroke="${favColor}" fill="${favColor}" stroke-width="2" stroke-linejoin="round"></path> </g></svg>
                <svg class="download" onclick="showMusicMenu(${queue[i][0]}, ${queue[i][1]})" style="width: 60%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#323232" stroke="#323232"><path d="M12.5 6.25C12.9142 6.25 13.25 5.91421 13.25 5.5C13.25 5.08579 12.9142 4.75 12.5 4.75V6.25ZM20.25 12.5C20.25 12.0858 19.9142 11.75 19.5 11.75C19.0858 11.75 18.75 12.0858 18.75 12.5H20.25ZM19.5 6.25C19.9142 6.25 20.25 5.91421 20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75V6.25ZM15.412 4.75C14.9978 4.75 14.662 5.08579 14.662 5.5C14.662 5.91421 14.9978 6.25 15.412 6.25V4.75ZM20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75C19.0858 4.75 18.75 5.08579 18.75 5.5H20.25ZM18.75 9.641C18.75 10.0552 19.0858 10.391 19.5 10.391C19.9142 10.391 20.25 10.0552 20.25 9.641H18.75ZM20.0303 6.03033C20.3232 5.73744 20.3232 5.26256 20.0303 4.96967C19.7374 4.67678 19.2626 4.67678 18.9697 4.96967L20.0303 6.03033ZM11.9697 11.9697C11.6768 12.2626 11.6768 12.7374 11.9697 13.0303C12.2626 13.3232 12.7374 13.3232 13.0303 13.0303L11.9697 11.9697ZM12.5 4.75H9.5V6.25H12.5V4.75ZM9.5 4.75C6.87665 4.75 4.75 6.87665 4.75 9.5H6.25C6.25 7.70507 7.70507 6.25 9.5 6.25V4.75ZM4.75 9.5V15.5H6.25V9.5H4.75ZM4.75 15.5C4.75 18.1234 6.87665 20.25 9.5 20.25V18.75C7.70507 18.75 6.25 17.2949 6.25 15.5H4.75ZM9.5 20.25H15.5V18.75H9.5V20.25ZM15.5 20.25C18.1234 20.25 20.25 18.1234 20.25 15.5H18.75C18.75 17.2949 17.2949 18.75 15.5 18.75V20.25ZM20.25 15.5V12.5H18.75V15.5H20.25ZM19.5 4.75H15.412V6.25H19.5V4.75ZM18.75 5.5V9.641H20.25V5.5H18.75ZM18.9697 4.96967L11.9697 11.9697L13.0303 13.0303L20.0303 6.03033L18.9697 4.96967Z" /></svg>
            </div>
        `;

        li.addEventListener('click', async (e) =>
        {
            if (e.target.closest('svg'))
                return;

            playingfavs = false;

            loadTrack(getTrack(queue[i][0], queue[i][1]));
            play();
        });
        trackList.appendChild(li);
    };

    mainView.classList.add('hidden');
    playlistView.classList.remove('hidden');
}

function showFavs()
{
    window.parent.postMessage(
        {
            action: "backFunc",
            func: "showPlaylists",
            args: []
        },
        "https://krorion.wysigot.com"
    );    
    Array.from(document.getElementById("menuFooter").children[0].children[2].children).forEach((child) => child.style.stroke = "#000000");
    document.getElementById("menuFooter").children[1].querySelector("path").style.stroke = "#F54927";
    document.getElementById("menuFooter").children[1].querySelector("path").style.fill = "#F54927";
    document.getElementById("menuFooter").children[2].querySelector("path").style.stroke = "#000000";

    playlistTitle.textContent = "Titres likés";
    trackList.innerHTML = '';
    

    for (let i = 0; i < fav.length; i++)
    {
        queueColor = "#323232";

        if (containsOrderedPair(queue, [fav[i][0], fav[i][1]])) queueColor = "#8b0000";

        const li = document.createElement('li');
        li.className = 'playlist-item X';
        li.id = `${fav[i][0]}-${fav[i][1]}`;
        li.innerHTML =
        `
            <div class="thumb" style="background: ${playlists[fav[i][0]].color}">
                <img src="mus/images/${fav[i][0]}-${fav[i][1]}.jpeg" alt="cover" class="thumb-img" />
            </div>
            <div class="play-info">
                <div class="pl-title">${playlists[fav[i][0]].tracks[fav[i][1]].title}</div>
                <div class="pl-sub">${playlists[fav[i][0]].tracks[fav[i][1]].artist}</div>
            </div>
            <div style="width: 25%; display: flex">
                <svg class="queue" onclick="addToQueue(${fav[i][0]}, ${fav[i][1]})" style="width: 60%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-labelledby="addToListIconTitle" stroke="${queueColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" color="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title id="addToListIconTitle">Add To List</title> <path d="M6 10H18"></path> <path d="M6 6H18"></path> <path d="M6 14H10"></path> <path d="M14 16H18"></path> <path d="M16 14L16 18"></path> <path d="M6 18H10"></path> </g></svg>
                <svg class="fav" onclick="addToFav(${fav[i][0]}, ${fav[i][1]})" style="width: 55%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4.8824 12.9557L10.5021 19.3071C11.2981 20.2067 12.7019 20.2067 13.4979 19.3071L19.1176 12.9557C20.7905 11.0649 21.6596 8.6871 20.4027 6.41967C18.9505 3.79992 16.2895 3.26448 13.9771 5.02375C13.182 5.62861 12.5294 6.31934 12.2107 6.67771C12.1 6.80224 11.9 6.80224 11.7893 6.67771C11.4706 6.31934 10.818 5.62861 10.0229 5.02375C7.71053 3.26448 5.04945 3.79992 3.59728 6.41967C2.3404 8.6871 3.20947 11.0649 4.8824 12.9557Z" stroke="#8b0000" fill="#8b0000" stroke-width="2" stroke-linejoin="round"></path> </g></svg>
                <svg class="download" style="width: 60%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#323232" stroke="#323232"><path d="M12.5 6.25C12.9142 6.25 13.25 5.91421 13.25 5.5C13.25 5.08579 12.9142 4.75 12.5 4.75V6.25ZM20.25 12.5C20.25 12.0858 19.9142 11.75 19.5 11.75C19.0858 11.75 18.75 12.0858 18.75 12.5H20.25ZM19.5 6.25C19.9142 6.25 20.25 5.91421 20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75V6.25ZM15.412 4.75C14.9978 4.75 14.662 5.08579 14.662 5.5C14.662 5.91421 14.9978 6.25 15.412 6.25V4.75ZM20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75C19.0858 4.75 18.75 5.08579 18.75 5.5H20.25ZM18.75 9.641C18.75 10.0552 19.0858 10.391 19.5 10.391C19.9142 10.391 20.25 10.0552 20.25 9.641H18.75ZM20.0303 6.03033C20.3232 5.73744 20.3232 5.26256 20.0303 4.96967C19.7374 4.67678 19.2626 4.67678 18.9697 4.96967L20.0303 6.03033ZM11.9697 11.9697C11.6768 12.2626 11.6768 12.7374 11.9697 13.0303C12.2626 13.3232 12.7374 13.3232 13.0303 13.0303L11.9697 11.9697ZM12.5 4.75H9.5V6.25H12.5V4.75ZM9.5 4.75C6.87665 4.75 4.75 6.87665 4.75 9.5H6.25C6.25 7.70507 7.70507 6.25 9.5 6.25V4.75ZM4.75 9.5V15.5H6.25V9.5H4.75ZM4.75 15.5C4.75 18.1234 6.87665 20.25 9.5 20.25V18.75C7.70507 18.75 6.25 17.2949 6.25 15.5H4.75ZM9.5 20.25H15.5V18.75H9.5V20.25ZM15.5 20.25C18.1234 20.25 20.25 18.1234 20.25 15.5H18.75C18.75 17.2949 17.2949 18.75 15.5 18.75V20.25ZM20.25 15.5V12.5H18.75V15.5H20.25ZM19.5 4.75H15.412V6.25H19.5V4.75ZM18.75 5.5V9.641H20.25V5.5H18.75ZM18.9697 4.96967L11.9697 11.9697L13.0303 13.0303L20.0303 6.03033L18.9697 4.96967Z" /></svg>
            </div>
        `;

        li.addEventListener('click', async (e) =>
        {
            if (e.target.closest('svg'))
                return;

            playingfavs = true;
            loadTrack(getTrack(fav[i][0], fav[i][1]));
            play();
        });
        trackList.appendChild(li);
        document.getElementsByClassName("download")[document.getElementsByClassName("download").length-1].addEventListener("click", () => showMusicMenu(fav[i][0], fav[i][1]));
    };

    mainView.classList.add('hidden');
    playlistView.classList.remove('hidden');
}

function getTrack(i1, i2)
{
    currentPlaylistIndex = i1;
    return playlists[i1].tracks[i2];
}

async function makeTrack(playlistIndex, index)
{
    const playlist = playlists[playlistIndex];
    if (!playlist) return null;

    const src = `mus/playlists/${playlistIndex}/${index}.mp3`;

    const err_t = { index: -1, src: "", title: "erreur", artist: "erreur", image: "" };

    try
    {
        const response = await fetch(src);
        if (!response.ok) throw new Error('Fetch failed: ' + response.status);

        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });

        const tag = await new Promise((resolve, reject) =>
        {
            jsmediatags.read(blob,
            {
                onSuccess: resolve,
                onError: reject
            });
        });

        const track =
        {
            index: index,
            src: src,
            title: tag.tags.title || `Track ${index}`,
            artist: tag.tags.artist || 'Unknown',
            image: tag.tags.picture || null
        };

        return track;
    } 
    catch (err)
    {
        console.warn('Impossible de charger les métadonnées pour', src, err);
        return err_t;
    }
}


// === Lecture ===
function loadTrack(track)
{
    if (!played.some(pair => (pair[0] === currentPlaylistIndex && pair[1] === track.index) || (pair[0] === track.index && pair[1] === currentPlaylistIndex))) played.push([currentPlaylistIndex, track.index]);
    currentTrackIndex = track.index;
    picture = track.image;
    el.audio.src = track.src;
    el.trackTitle.textContent = track.title;
    el.trackArtist.textContent = track.artist;
    let imageSrc = `mus/images/${currentPlaylistIndex}-${currentTrackIndex}.jpeg`;
    el.coverArt.innerHTML = `<img src="${imageSrc}" alt="cover" class="thumb-img" />`;
    document.getElementById("like").onclick = function ()
    {
        addToFav(currentPlaylistIndex, currentTrackIndex);
        if (!document.getElementById("like").children[0].style.fill.length)
        {
            document.getElementById("like").children[0].style.fill = "#F54927";
            document.getElementById("like").children[0].children[2].children[0].style.stroke = "#F54927";
        }
        else
        {
            document.getElementById("like").children[0].style.fill = "";
            document.getElementById("like").children[0].children[2].children[0].style.stroke = "#000000";
        }
    }
    if (containsOrderedPair(fav, [currentPlaylistIndex, currentTrackIndex])) {document.getElementById("like").children[0].style.fill = "#F54927"; document.getElementById("like").children[0].children[2].children[0].style.stroke = "#F54927"}
    else {document.getElementById("like").children[0].style.fill = ""; document.getElementById("like").children[0].children[2].children[0].style.stroke = "#000000"}

    el.audio.load();
    const p = document.getElementById('progress');
    if (p && el.audio.duration)
    {
        p.max = el.audio.duration;
        p.value = el.audio.currentTime;
    }

    if ('mediaSession' in navigator)
    {
        navigator.mediaSession.metadata = new MediaMetadata(
        {
            title: track.title,
            artist: track.artist,
            album: "Krorion Music",
            artwork:
            [
                { src: imageSrc, sizes: '512x512', type: 'image/jpeg' },
            ]
        });
    }
}

function play()
{
    if (!el.audio.src)
    {
        if (queue.length)
        {
            nextTrack = queue.shift();
            if (getQueueSvg(nextTrack[0], nextTrack[1])) getQueueSvg(nextTrack[0], nextTrack[1]).style.stroke = "#323232";
            loadTrack(getTrack(nextTrack[0], nextTrack[1]));
        }
        else
        {
            if (playingfavs)
            {
                not_played = fav.filter(pair => !containsPair(played_favs, pair));

                if (!not_played.length)
                {
                    played_favs = [];
                    nextfav = fav[Math.floor(Math.random() * fav.length)];
                }
                else
                    nextfav = not_played[Math.floor(Math.random() * not_played.length)];

                played_favs.push(nextfav);
                loadTrack(getTrack(nextfav[0], nextfav[1]));
            }
            else loadTrack(getTrack(currentPlaylistIndex, Math.floor(Math.random() * playlists[currentPlaylistIndex].n)));
        }
    }
    el.audio.play();
}

function pause()
{
    el.audio.pause();
}

// === Contrôles ===

function click_playBtn()
{
    if (el.audio.paused) play();
    else pause();
}

function click_prevBtn()
{
    const playlist = playlists[currentPlaylistIndex];
    if (!playlist) return;
    if (el.audio.currentTime < 1) played.pop()
    [currentPlaylistIndex, currentTrackIndex] = played[played.length - 1];
    loadTrack(getTrack(played[played.length - 1][0], played[played.length - 1][1]));
    play();
}

function click_nextBtn()
{
    if (queue.length)
    {
        nextTrack = queue.shift();
        if (getQueueSvg(nextTrack[0], nextTrack[1])) getQueueSvg(nextTrack[0], nextTrack[1]).style.stroke = "#323232";
        loadTrack(getTrack(nextTrack[0], nextTrack[1]));
    }
    else
    {
        if (playingfavs)
        {
            not_played = fav.filter(pair => !containsPair(played_favs, pair));

            if (!not_played.length)
            {
                played_favs = [];
                nextfav = fav[Math.floor(Math.random() * fav.length)];                
            }
            else
                nextfav = not_played[Math.floor(Math.random() * not_played.length)];

            played_favs.push(nextfav);
            loadTrack(getTrack(nextfav[0], nextfav[1]));
        }
        else
        {
            const playlist = playlists[currentPlaylistIndex];
            if (!playlist) return;
            currentTrackIndex = getRandomExcluding(currentPlaylistIndex, playlist.n);
            loadTrack(getTrack(currentPlaylistIndex, currentTrackIndex));
        }
    }
    play();
}

function getRandomExcluding(i1, x)
{
    if (played.length >= x) played = [];
    let n;
    do n = Math.floor(Math.random() * x);
    while (played.some(pair => (pair[0] === i1 && pair[1] === n) || (pair[0] === n && pair[1] === i1)));

    return n;
}

// === Initialization ===

async function load_mus()
{
    if (localStorage.getItem("uuid") == null)
        back();
    
    uuid = localStorage.getItem("uuid");

    document.getElementById("playlistView").style.height = `${window.innerHeight-48}px`;
    document.getElementById("content").style.height = `${window.innerHeight-48}px`;

    if (audio.src.length)
    {
        [i1, i2] = audio.src.split('mus/playlists/')[1].split('.mp3')[0].split('/')
        trackTitle.innerHTML = playlists[i1].tracks[i2].title;
        trackArtist.innerHTML = playlists[i1].tracks[i2].artist;
        coverArt.innerHTML = `<img src="${playlists[i1].tracks[i2].image}" alt="cover" class="thumb-img" />`;
        if (!audio.paused && !audio.ended && audio.readyState > 2)
            el.playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="#fff"><path d="M5.92 24.096q0 0.832 0.576 1.408t1.44 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.44 0.576t-0.576 1.44v16.16zM18.016 24.096q0 0.832 0.608 1.408t1.408 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.408 0.576t-0.608 1.44v16.16z"/></svg>`;
    }

    if ('mediaSession' in navigator)
    {
        // Gère les actions de contrôle
        navigator.mediaSession.setActionHandler('play', () =>
        {
            click_playBtn();
        });

        navigator.mediaSession.setActionHandler('pause', () =>
        {
            click_playBtn();
        });

        navigator.mediaSession.setActionHandler('previoustrack', () =>
        {
            click_prevBtn();
        });

        navigator.mediaSession.setActionHandler('nexttrack', () =>
        {
            click_nextBtn();
        });

        navigator.mediaSession.setActionHandler('seekto', (details) =>
        {
            if (details.fastSeek && 'fastSeek' in el.audio)
                el.audio.fastSeek(details.seekTime);
            else
                el.audio.currentTime = details.seekTime;
            navigator.mediaSession.setPositionState(
            {
                duration: el.audio.duration,
                playbackRate: el.audio.playbackRate,
                position: el.audio.currentTime
            });
        });
    }
    
    playlistView.classList.add('hidden');
    mainView.classList.remove('hidden');

    fetch('mus/playlists_v6.txt')
    .then(response => response.text())
    .then(text =>
    {
        text.split("===").slice(1).forEach((pl, idx1) =>
        {
            pl.trim('').split('\n').forEach((song, idx2) =>
            {
                [title, artist] = song.split('||');
                playlists[idx1].tracks[idx2] = {index: idx2, src: `mus/playlists/${idx1}/${idx2}.mp3`, title: title, artist: artist, image: `images/${idx1}-${idx2}.jpeg`};
            });
        });

        //loading favs
        var httpRequest = getHttpRequest();
        httpRequest.open('GET', `mus/db.php?getfavs=${uuid}`, true);
        httpRequest.send();
        httpRequest.onreadystatechange = function ()
        {
            if (httpRequest.readyState === 4)
            {
                if (httpRequest.status === 200)
                {
                    if (httpRequest.responseText.length)
                        fav = httpRequest.responseText.split("|").map(pair => pair.split("-").map(Number));

                    //loading first song

                    if (currentPlaylistIndex == -1)
                    {
                        if (fav.length)            
                        {
                            playingfavs = true;
                            t = fav[Math.floor(Math.random()*fav.length)];
                            loadTrack(getTrack(t[0], t[1]));
                        }
                        else
                        {
                            rpl = 1+Math.floor(Math.random()*(playlists.length-1));
                            rtr = Math.floor(Math.random()*playlists[rpl].tracks.length);
                            loadTrack(getTrack(rpl, rtr));
                        }
                    }
                }
            }
        }
    })
    .catch(err => console.error("Erreur lecture fichier :", err));

    showPlaylists();
}

function addToQueue(i1, i2)
{
    if (getQueueSvg(i1, i2).style.stroke == hexToRgb("#8b0000") || getQueueSvg(i1, i2).style.stroke == "#8b0000") // remove from favorites
    {
        getQueueSvg(i1, i2).style.stroke = "#323232";
        queue = queue.filter(item => !(item[0] == i1 && item[1] == i2) && !(item[0] == i2 && item[1] == i1)); //de morgan
    }
    else // add to favorites
    {
        getQueueSvg(i1, i2).style.stroke = "#8b0000";
        if (!containsOrderedPair(queue, [i1, i2])) queue.push([i1, i2]);
    }
}

function addToFav(i1, i2)
{
    if (getFavSvg(i1, i2).style.stroke == hexToRgb("#8b0000") || getFavSvg(i1, i2).style.stroke == "#8b0000") // remove from favorites
    {
        getFavSvg(i1, i2).style.stroke = "#323232";
        getFavSvg(i1, i2).style.fill = "#323232";
        fav = fav.filter(item => !(item[0] == i1 && item[1] == i2) && !(item[0] == i2 && item[1] == i1)); //de morgan
        fav_string = fav.map(pair => pair.join("-")).join("|");
        var httpRequest = getHttpRequest();
        httpRequest.open('GET', `mus/db.php?setfavs=${fav_string}&uuid=${uuid}`, true);
        httpRequest.send();
    }
    else // add to favorites
    {
        getFavSvg(i1, i2).style.stroke = "#8b0000";
        getFavSvg(i1, i2).style.fill = "#8b0000";
        if (!containsOrderedPair(fav, [i1, i2])) fav.push([i1, i2]);
        fav_string = fav.map(pair => pair.join("-")).join("|");
        var httpRequest = getHttpRequest();
        httpRequest.open('GET', `mus/db.php?setfavs=${fav_string}&uuid=${uuid}`, true);
        httpRequest.send();
    }
}

function getQueueSvg(i1, i2)
{
    if (document.getElementById(`${i1}-${i2}`))
        return document.getElementById(`${i1}-${i2}`).children[2].children[0];
    else return null
}

function getFavSvg(i1, i2)
{
    if (document.getElementById(`${i1}-${i2}`))
        return document.getElementById(`${i1}-${i2}`).children[2].children[1].querySelector("path");
    else return null;
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

function hexToRgb(hex)
{
    hex = hex.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgb(${r}, ${g}, ${b})`;
}

function containsPair(arr, pair)
{
    return arr.some(item => (item[0] === pair[0] && item[1] === pair[1]) || (item[0] === pair[1] && item[1] === pair[0]));
}

function containsOrderedPair(arr, pair)
{
    return arr.some(item => (item[0] === pair[0] && item[1] === pair[1]));
}

function _back()
{
    document.getElementById("overlay").style.display = "flex";
}

/*function showMusicMenu(i1, i2)
{
    setTimeout(() =>
    {
        console.log("noclick");
        document.getElementById('noclick').style.display = "block";
        document.getElementById("musicMenu").className = `${i1}-${i2} visible`;
    }, 50);
}*/

async function generatePlaylistFile(folder = -1)
{
    let totalFolders;
    let folderFiles = [];
    if (folder == -1)
    {
        totalFolders = playlists.length;
        folderFiles = [];
        playlists.forEach((pl, idx) => folderFiles[idx] = pl.n);
    }
    else
    {
        totalFolders = 1;
        folderFiles[folder] = playlists[folder].n;
    }

    let output = "";

    for (let folderIndex = 0; folderIndex < totalFolders; folderIndex++)
    {
        output += `===\n`;

        if (folder != -1) folderIndex = folder;

        for (let fileIndex = 0; fileIndex < folderFiles[folderIndex]; fileIndex++)
        {
            const url = `mus/playlists/${folderIndex}/${fileIndex}.mp3`;

            try
            {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Fetch failed: ' + response.status);

                const arrayBuffer = await response.arrayBuffer();
                const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });

                const tag = await new Promise((resolve, reject) =>
                {
                    jsmediatags.read(blob,
                    {
                        onSuccess: resolve,
                        onError: reject
                    });
                });

                const title = tag.tags.title;
                const artist = tag.tags.artist;
                const image = tag.tags.picture;
                
                output += `${title}||${artist}\n`;

                const blobImage = new Blob([new Uint8Array(image.data)], { type: image.format });

                const link = document.createElement("a");
                link.href = URL.createObjectURL(blobImage);
                link.download = `${folderIndex}-${fileIndex}.jpeg`;
                document.body.appendChild(link);
                link.click();
                link.remove();

                URL.revokeObjectURL(link.href);
            } 
            catch (err)
            {
                console.warn('Impossible de charger les métadonnées pour', url, err);
                return err;
            }
        }

        output += "\n";
    }

    const blob = new Blob([output], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "playlists_v6.txt";
    link.click();
}