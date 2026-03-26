let uuid = "";
let prenom = "";
let nom = "";
let done = 0;
let lat = 0.;
let lng = 0.;
let markers = [];

let display = 0;//0: map, 1: selfie

let mapOptions =
{
    center: [48.919675, 2.333273],
    zoom: 6,
    minZoom: 3
}

let map = new L.map('map', mapOptions);
var markerIcon = new L.icon
({
    iconUrl: 'assets/marker.png',
    iconSize: [1, 1],
    //shadowUrl: 'assets/marker-shadow.png',
    popupAnchor: [0, -45],
});

var markerIconSelf = new L.icon
({
    iconUrl: 'assets/loc.png',
    iconSize: [1, 1],
    popupAnchor: [0, -45]
})

var locIcon = new L.icon
({
    iconUrl: 'assets/loc.png',
    iconSize: [1, 1],
    //shadowUrl: 'assets/marker-shadow.png'
});


L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
}).addTo(map);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
}).addTo(map);

var southWest = L.latLng(-89.98155760646617, -180),
northEast = L.latLng(89.99346179538875, 180);
var bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds);
map.on('drag', function()
{
    map.panInsideBounds(bounds, { animate: false });
});

map.on('click', function(e)
{
    if (done) return;
    Array.from(document.getElementsByClassName("leaflet-marker-icon")).forEach(marker => marker.remove());
    Array.from(document.getElementsByClassName("leaflet-popup")).forEach(popup => popup.remove());

    lat = parseFloat(e.latlng.lat.toFixed(5));
    lng = parseFloat(e.latlng.lng.toFixed(5));

    L.marker(e.latlng, {icon: markerIcon}).addTo(map).bindPopup(`${prenom.slice(0,1).toUpperCase()}${prenom.slice(1)} ${nom.slice(0,1).toUpperCase()}.`).openPopup();

    document.getElementById("confirm").style.display = "flex";
});

function confirm()
{
    document.getElementById("confirm").style.display = "none";
    done = 1;
    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?confirm=true&uuid=${uuid}&lat=${lat}&lng=${lng}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                let res = httpRequest.responseText;
                //console.log(res);
                let arr = JSON.parse(res);
                for (i = 0; i < arr.length; i++)
                {
                    if (arr[i][2].length || arr[i][2] != '0')
                    {
                        if (arr[i][0] == prenom && arr[i][1] == nom)
                            markers.push(L.marker({'lat': arr[i][2], 'lng': arr[i][3]}, {icon: markerIconSelf}).addTo(map).bindPopup(`${arr[i][0].slice(0, 1).toUpperCase()}${arr[i][0].slice(1)} ${arr[i][1].slice(0, 1).toUpperCase()}.`));
                        else
                            markers.push(L.marker({'lat': arr[i][2], 'lng': arr[i][3]}, {icon: markerIcon}).addTo(map).bindPopup(`${arr[i][0].slice(0, 1).toUpperCase()}${arr[i][0].slice(1)} ${arr[i][1].slice(0, 1).toUpperCase()}.`));
                    }
                }

                check();
            }
        }
    }
}

function load_geo()
{
    if (localStorage.getItem("uuid") == null)
        back();
    
    uuid = localStorage.getItem("uuid");

    switch_();
    document.getElementsByClassName("leaflet-top leaflet-left")[0].remove()

    var httpRequest0 = getHttpRequest();
    httpRequest0.open('GET', `db.php?getname=true&uuid=${uuid}`, true);
    httpRequest0.send();
    httpRequest0.onreadystatechange = function ()
    {
        if (httpRequest0.readyState === 4)
        {
            if (httpRequest0.status === 200)
            {
                prenom = httpRequest0.responseText.split("|")[0];
                nom = httpRequest0.responseText.split("|")[1];
            }
        }
    }
    
    document.getElementsByClassName("leaflet-bottom leaflet-right")[0].remove();

    located = false
    let lLat;
    let lLng;

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?getloc=true`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                let res = httpRequest.responseText;
                if (res.includes("|"))
                {
                    lLat = parseFloat(res.split("|")[0]);
                    lLng = parseFloat(res.split("|")[1]);
                    located = true;
                }

                var httpRequest2 = getHttpRequest();
                httpRequest2.open('GET', `db.php?find=true&uuid=${uuid}`, true);
                httpRequest2.send();
                httpRequest2.onreadystatechange = function ()
                {
                    if (httpRequest2.readyState === 4)
                    {
                        if (httpRequest2.status === 200)
                        {
                            let res = httpRequest2.responseText;
                            //console.log(res);
                            if (res == 0) return;
                            done = 1;
                            let arr = JSON.parse(res);
                            for (i = 0; i < arr.length; i++)
                            {
                                if (located)
                                {
                                    let distanceS = distance({'lat': arr[i][2], 'lng': arr[i][3]}, {'lat': lLat, 'lng': lLng});
                                    if (distanceS >= 1) distanceS = `${parseInt(distanceS)}km`;
                                    else distanceS = `${parseInt(distanceS*1000)}m`;
                                    if (arr[i][0] == prenom && arr[i][1] == nom)
                                        markers.push(L.marker({'lat': arr[i][2], 'lng': arr[i][3]}, {icon: markerIconSelf}).addTo(map).bindPopup(`${arr[i][0].slice(0, 1).toUpperCase()}${arr[i][0].slice(1)} ${arr[i][1].slice(0, 1).toUpperCase()}.<br>${distanceS}`));
                                    else
                                        markers.push(L.marker({'lat': arr[i][2], 'lng': arr[i][3]}, {icon: markerIcon}).addTo(map).bindPopup(`${arr[i][0].slice(0, 1).toUpperCase()}${arr[i][0].slice(1)} ${arr[i][1].slice(0, 1).toUpperCase()}.<br>${distanceS}`));
                                }
                                else
                                {
                                    if (arr[i][0] == prenom && arr[i][1] == nom)
                                        markers.push(L.marker({'lat': arr[i][2], 'lng': arr[i][3]}, {icon: markerIconSelf}).addTo(map).bindPopup(`${arr[i][0].slice(0, 1).toUpperCase()}${arr[i][0].slice(1)} ${arr[i][1].slice(0, 1).toUpperCase()}.`));
                                    else
                                        markers.push(L.marker({'lat': arr[i][2], 'lng': arr[i][3]}, {icon: markerIcon}).addTo(map).bindPopup(`${arr[i][0].slice(0, 1).toUpperCase()}${arr[i][0].slice(1)} ${arr[i][1].slice(0, 1).toUpperCase()}.`));
                                }
                            }

                            if (located) connect(L.marker({'lat': lLat, 'lng': lLng}, {icon: locIcon}).addTo(map));
                        }
                    }
                }
            }
        }
    }
}

function check()
{
    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?getloc=true`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                let res = httpRequest.responseText;
                if (!res.includes("|")) return;
                lLat = parseFloat(res.split("|")[0]);
                lLng = parseFloat(res.split("|")[1]);
            }
        }
    }

}

function distance(latlng1, latlng2)
{
    lat1 = latlng1['lat']; lat2 = latlng2['lat'];
    lng1 = latlng1['lng']; lng2 = latlng2['lng'];
    var R = 6371;
    var dLat = deg2rad(lat2-lat1);
    var dlng = deg2rad(lng2-lng1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dlng/2) * Math.sin(dlng/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
}
  
function deg2rad(deg)
{
    return deg * (Math.PI/180)
}

function haversine(lat1, lon1, lat2, lon2)
{
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function sortByDistance(coords, ref)
{
  return coords
    .map(point => (
    {
        ...point,
        dist: haversine(ref.lat, ref.lng, point[0], point[1])
    }))
    .sort((a, b) => a.dist - b.dist)
    .map(({ dist, ...rest }) => rest);
}

function connect(loc)
{
/*    w = 0;
    m = distance(markers[0].getLatLng(), loc.getLatLng());

    for (i = 1; i < markers.length; i++)
    {
        nm = distance(markers[i].getLatLng(), loc.getLatLng());
        if (nm < m)
        {
            m = nm;
            w = i;
        }
    }

    console.log(w);
*/

    let coords = [];
    for (i = 0; i < markers.length; i++)
        coords.push([markers[i].getLatLng().lat, markers[i].getLatLng().lng, markers[i]._popup._content]);

    coords = sortByDistance(coords, loc.getLatLng());

    colors = gradientColors(coords.length);

    for (i = 0; i < coords.length; i++)
        map.fitBounds(L.polyline([loc.getLatLng(), {lat: coords[i][0], lng: coords[i][1]}], {color: colors[i], weight: 3}).addTo(map).getBounds());

    document.getElementById("podium").children[0].innerHTML = `#1 : ${coords[0][2]}`;
    document.getElementById("podium").children[1].innerHTML = `#2 : ${coords[1][2]}`;
    document.getElementById("podium").children[2].innerHTML = `#3 : ${coords[2][2]}`;

    document.getElementById("podium").style.display = "flex";
}

function gradientColors(steps)
{
    const start = { r: 0, g: 100, b: 0 };

    const end   = { r: 139, g: 0, b: 0 };

    const colors = [];

    for (let i = 0; i < steps; i++)
    {
        const ratio = i / (steps - 1);

        const r = Math.round(start.r + (end.r - start.r) * ratio);
        const g = Math.round(start.g + (end.g - start.g) * ratio);
        const b = Math.round(start.b + (end.b - start.b) * ratio);

        colors.push(`rgb(${r},${g},${b})`);
    }

    return colors;
}

function switch_()
{
    if (display)
    {
        document.getElementById("switch").innerHTML = "&#128248;";
        document.getElementById("selfie").style.display = "none";
    }
    else
    {
        document.getElementById("switch").innerHTML = "&#127757;";
        document.getElementById("selfie").style.display = "block";
    }
    display = 1-display;
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