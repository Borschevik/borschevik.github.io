document.getElementById("default_tab").click();

var fenway = new google.maps.LatLng(51.52, -0.11);

var panoramaOptions = {
    position: fenway,
    pov: {
        heading: 34,
        pitch: 10
    }
};

var panorama = new  google.maps.StreetViewPanorama(document.getElementById('pano'),panoramaOptions);
panorama.setPosition(new google.maps.LatLng(60, 30));

var map = new L.Map('map', {center: new L.LatLng(60, 30), zoom: 9, zoomControl:false});
L.esri.basemapLayer('DarkGray').addTo(map);

function whenClicked(e){
    panorama.setPosition(new google.maps.LatLng(e.latlng.lat, e.latlng.lng));
}

var heat_points = {max: 2,data:[]};
var cfg = {"radius":0.001, "maxOpacity":0.7, "scaleRadius": true, "useLocalExtrema": true, latField: 'lat', lngField: 'lng',valueField: 'v'};
var heatmapLayer = new HeatmapOverlay(cfg);
heatmapLayer.addTo(map);

var geojsonOptions = {
    radius: 20,
    fillColor: "rgb(255,120,120)",
    color: "#000",
    weight: 0.5,
    opacity: 0.1,
    fillOpacity: 0.8
};

function onEachFeature(feature, layer) {
    if (feature) {
        heat_points.data.push({lat: feature.geometry.coordinates[1],lng: feature.geometry.coordinates[0],v: 1})
           layer.bindPopup(feature.properties.DTP_V.toString()+'<br>'+
           'Участников ДТП: '+feature.properties.K_UCH.toString()+'<br>'+
           'Пострадало: ' +feature.properties.RAN.toString());
           layer.on({'click': whenClicked});
       }
   };
var pointlayer = L.geoJSON(geojsonFeature,{onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.circle(latlng,geojsonOptions);
    }
    });
pointlayer.addTo(map);

var slider_ran = document.getElementById('slider_ran');
var sliderEventListener_ran = noUiSlider.create(slider_ran, {
    start: [4, 8],
    connect: true,
    range: {
        'min': 0,
        'max': 11
    }
});

var slider_k_uch = document.getElementById('slider_k_uch');
var sliderEventListener_k_uch = noUiSlider.create(slider_k_uch, {
    start: [2, 8],
    connect: true,
    range: {
       'min': 1,
       'max': 13
    }
});

function filter(feature) {
    if ((feature.properties.RAN >= slider_ran.noUiSlider.get()[0] & feature.properties.RAN <= slider_ran.noUiSlider.get()[1])
        & (feature.properties.RAN >= slider_k_uch.noUiSlider.get()[0] & feature.properties.RAN <= slider_k_uch.noUiSlider.get()[1])
        & true) return true
};

function redraw(){
    map.removeLayer(pointlayer);
    pointlayer = L.geoJSON(geojsonFeature,{onEachFeature: onEachFeature, filter: filter,
        pointToLayer: function (feature, latlng) {
            return L.circle(latlng,geojsonOptions);
        }

    });
    pointlayer.addTo(map);
    heatmapLayer.setData(heat_points);
    heat_points.data = [];
};

sliderEventListener_ran.on('update', redraw);
sliderEventListener_k_uch.on('update', redraw);


var geojsonOptions_problems = {
    radius: 20,
    fillColor: "rgb(234,121,35)",
    color: "#000",
    weight: 0.5,
    opacity: 0.1,
    fillOpacity: 0.8
};

function onEachFeature_problems(feature, layer) {
    if (feature) {
           layer.bindPopup(feature.properties.ndu.toString());
           layer.on({'click': whenClicked});
       }
   };
var problemlayer = L.geoJSON(problems,{onEachFeature: onEachFeature_problems,
    pointToLayer: function (feature, latlng) {
        return L.circle(latlng,geojsonOptions_problems);
    }
    });


var imageUrl = 'images/16_17.png',
    imageBounds = [[58.9123694976576, 29.36036435415397], [60.45592138561606, 31.1743859185214]];
var image16_17 = L.imageOverlay(imageUrl, imageBounds);

var imageUrl2 = 'images/2017.png',
    imageBounds2 = [[58.924421202774816, 29.32040344916218], [60.463747648579535, 31.20346252624953]];
var image17 = L.imageOverlay(imageUrl2, imageBounds2);

var imageUrl = 'images/2016.png',
    imageBounds = [[58.912369497646026, 29.360364354183307], [60.45592138565219, 31.174385918458775]];
var image16 = L.imageOverlay(imageUrl, imageBounds);

var imageUrl = 'images/summer.png',
    imageBounds = [[58.92117934202727, 29.360968400171142], [60.44382889224289, 31.173219892545326]];
var image_summer = L.imageOverlay(imageUrl, imageBounds);

var imageUrl = 'images/winter.png',
    imageBounds = [[58.92117934202727, 29.360968400171142], [60.44382889224289, 31.173219892545326]];
var image_winter = L.imageOverlay(imageUrl, imageBounds);


L.control.layers({},{"Места ДТП": pointlayer,"Распределение ДТП":heatmapLayer,"ДТП с выявленными проблемами\n на дорогах":problemlayer},{position: 'topleft',collapsed: false}).addTo(map);

var maps = {"ДТП 2016-2017": image16_17,"ДТП за 2017 год": image17,"ДТП за 2016 год": image16,"ДТП преимущественно летом": image_summer,"ДТП преимущественно зимой": image_winter};
L.control.layers({},maps,{position: 'topleft',collapsed: false}).addTo(map);
