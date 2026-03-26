let target =
{
    label: "Aucune cible",
    lat: -1,
    lng: -1,
    sd: false
}

let user =
{
    lat: undefined,
    lng: undefined
};

let deviceHeading = 0, direction = 0, bearing = 0;
let isTracked = false;
let _track;
let showDistance;

function load_bou()
{
    if (localStorage.getItem("uuid") == null)
        back();
    
    uuid = localStorage.getItem("uuid");

    window.parent.postMessage(
        { action: "register-compass-receiver" },
        "https://krorion.wysigot.com"
    );
	
    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `../db.php?isListeux=${uuid}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {    
                if (parseInt(httpRequest.responseText) == 1)
                    document.getElementById('newTrack').style.display = "";
            }
        }
    }
}

function start()
{
    if (parseInt(document.getElementById('pInput').value) != 1234)
    {
        document.getElementById('pInput').value = "";
        return;
    }
    requestPermission();
    document.getElementById('startDiv').style.display = "none";
}

function wantToStartSending()
{
    requestPermission();
    document.getElementsByClassName('login-container')[0].style.display = "flex";
}

function startSending()
{
    posInputVal = document.getElementById('posInput').value;
    document.getElementById('posInput').value = "";
    document.getElementsByClassName('login-container')[0].style.display = "none";
    target.label = document.getElementById('descInput').value;
    isTracked = true;
    showDistance = document.getElementById('distanceInput').checked;
    _track = document.getElementById('trackingInput').checked;
    while (user.lat == undefined && user.lng == undefined)
        navigator.geolocation.getCurrentPosition(pos =>
        {
            user.lat = pos.coords.latitude;
            user.lng = pos.coords.longitude;
        });
    if (posInputVal.length)
    {
        gps = parseGPS(posInputVal);
        window.parent.postMessage(
            {
                action: "register-compass-sender",
                label: document.getElementById('descInput').value,
                lat: gps.lat,
                lng: gps.lng,
                showDistance: showDistance
            },
            "https://krorion.wysigot.com"
        );
    }
    else
        window.parent.postMessage(
            {
                action: "register-compass-sender",
                label: document.getElementById('descInput').value,
                lat: user.lat,
                lng: user.lng,
                showDistance: showDistance
            },
            "https://krorion.wysigot.com"
        );
    document.getElementById('descInput').value = "";
}

function parseGPS(input)
{
    if (typeof input !== "string")
        throw new Error("Input must be a string");

    input = input.trim();

    const simple = input.match(/^\s*(-?\d+(\.\d+)?)\s*[ ,]\s*(-?\d+(\.\d+)?)\s*$/);

    if (simple)
        return { lat: +parseFloat(simple[1]).toFixed(6), lng: +parseFloat(simple[3]).toFixed(6) };


    input = input
        .toUpperCase()
        .replace(/,/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const parts = input.match(/(.+?[NS])\s+(.+?[EW])/);

    if (!parts)
        throw new Error("Invalid GPS format");

    return { lat: parseCoord(parts[1], "NS"), lng: parseCoord(parts[2], "EW") };
}

function parseCoord(coord, hemi)
{
    let sign = 1;

    if (coord.includes(hemi[1])) sign = -1;
    if (coord.includes("-")) sign = -1;

    coord = coord.replace(/[NSEW]/g, "").trim();

    const nums = coord.match(/-?\d+(\.\d+)?/g).map(Number);

    let value;
    if (nums.length === 3)
        value = nums[0] + nums[1] / 60 + nums[2] / 3600;
    else if (nums.length === 2)
        value = nums[0] + nums[1] / 60;
    else
        value = nums[0];

    return +(value * sign).toFixed(6);
}

function updateTarget(label, lat, lng, sd)
{
    console.log(`target ${label} moved to ${parseInt(lat*100000)/100000}, ${parseInt(lng*100000)/100000}`);
    document.getElementById("menu-container").innerHTML = label;
    target.label = label;
    target.lat = lat;
    target.lng = lng;
    target.sd = sd;
    updateCompass();
}

//iOS authorization
function requestPermission()
{
    if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission)
    {
        DeviceOrientationEvent.requestPermission()
        .then(response =>
        {
            if (response === "granted") startCompass();
        });
    }
    else startCompass();
}

function startCompass()
{
    window.addEventListener("deviceorientation", (ev) =>
    {
        handleOrientation(ev);
        if (ev.webkitCompassHeading !== undefined)
            deviceHeading = ev.webkitCompassHeading; // iOS
        else
            deviceHeading = 360 - ev.alpha; // Android
        updateCompass();
    });

    window.addEventListener("deviceorientationabsolute", handleOrientation, true);

    navigator.geolocation.getCurrentPosition(pos =>
    {
        user.lat = pos.coords.latitude;
        user.lng = pos.coords.longitude;
        updateCompass();
        if (isTracked)
            window.parent.postMessage(
                {
                    action: "update-compass",
                    lat: user.lat,
                    lng: user.lng,
                    showDistance: showDistance
                },
                "https://krorion.wysigot.com"
            );
    }, null, { enableHighAccuracy: true });

    navigator.geolocation.watchPosition(pos =>
    {
        user.lat = pos.coords.latitude;
        user.lng = pos.coords.longitude;
        if (isTracked && _track)
            window.parent.postMessage(
                {
                    action: "update-compass",
                    lat: user.lat,
                    lng: user.lng,
                    showDistance: showDistance
                },
                "https://krorion.wysigot.com"
            );
        updateCompass();
    },
    null,
    {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
    });
}

function handleOrientation(event)
{
    //console.log(event);
    let heading;

    // iOS (Safari)
    if (event.webkitCompassHeading !== undefined)
        heading = event.webkitCompassHeading;
    // Android / autres navigateurs
    else if (event.absolute && event.alpha !== null)
        heading = 360 - event.alpha;

    if (heading !== undefined)
    {
        //heading = (heading + 360) % 360;
        document.getElementById('compass-outline').style.transform = `rotate(${heading}deg)`;
    }
}

function updateCompass()
{
    document.getElementById("compass-img").style.transform = `rotate(${direction}deg)`;
    if (user.lat == null) return;

    bearing = computeBearing(user.lat, user.lng, target.lat, target.lng);
    const distance = distanceMeters(user.lat, user.lng, target.lat, target.lng);

    let textDistance;
    if (distance >= 1000) textDistance = `${parseInt(distance/100)/10}km`;
    else if (distance >= 1) textDistance = `${parseInt(distance)}m`;
    else textDistance = '< 1m';

    if (target.sd)
        document.getElementById("distance").style.display = "block";
    else document.getElementById("distance").style.display = "none";
    document.getElementById("distance").innerHTML = textDistance;

    direction = bearing - deviceHeading;
    //direction = (direction + 360) % 360;
    //direction = parseInt(direction*10)/10;

    if (direction == NaN) direction = 0;
    document.getElementById('heading-text').innerHTML = `${parseInt(((direction+360)%360)*10)/10}°`;
    document.getElementById("compass-img").style.transform = `rotate(${direction}deg)`;
}

function computeBearing(lat1, lng1, lat2, lng2)
{
    lat1 = lat1 * Math.PI/180;
    lng1 = lng1 * Math.PI/180;
    lat2 = lat2 * Math.PI/180;
    lng2 = lng2 * Math.PI/180;

    const dlng = lng2 - lng1;

    const y = Math.sin(dlng) * Math.cos(lat2);
    const x = Math.cos(lat1)*Math.sin(lat2) -
              Math.sin(lat1)*Math.cos(lat2)*Math.cos(dlng);

    let brng = Math.atan2(y, x) * 180/Math.PI;

    //return (brng + 360) % 360;
    return brng;
}

function distanceMeters(lat1, lng1, lat2, lng2)
{
    const R = 6371000;
    const phi1 = lat1*Math.PI/180;
    const phi2 = lat2*Math.PI/180;
    const Dphi = (lat2-lat1)*Math.PI/180;
    const Dlambda = (lng2-lng1)*Math.PI/180;

    const a =
        Math.sin(Dphi/2)**2 +
        Math.cos(phi1)*Math.cos(phi2)*Math.sin(Dlambda/2)**2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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