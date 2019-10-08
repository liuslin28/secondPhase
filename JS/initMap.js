var map, stationInfoPopup, stationPopup, frePopup, marker;//地图Map，地图POPUP框，地图中marker点
var edit;


/**
 * 基本地图加载
 * 地图缩放级别限制
 */

$(document).ready(function () {
    minemap.domainUrl = conf_domainUrl;
    minemap.dataDomainUrl = conf_dataDomainUrl;
    minemap.spriteUrl = conf_spriteUrl;
    minemap.serviceUrl = conf_serviceUrl;
    minemap.accessToken = conf_accessToken;
    minemap.solution = conf_solution;
    map = new minemap.Map({
        container: 'map',
        style: conf_style, /*底图样式*/
        center: conf_centerPoint, /*地图中心点*/
        zoom: 11, /*地图默认缩放等级*/
        pitch: 90, /*地图俯仰角度*/
        maxZoom: 17, /*地图最大缩放等级*/
        minZoom: 3, /*地图最小缩放等级*/
        trackResize: true, /*地图会自动匹配浏览器窗口大小*/
        logoControl: false  /*logo控件是否显示，不加该参数时默认显示*/
    });


    map.on("load", function () {
        getOriginalData();
        getModifiedlData();
    });

});


function getOriginalData() {
    axios.get('./dataSample/1.json', {})
        .then(function (response) {
            let originalData = response.data;
            let gcjData = wgsToGcj(originalData);

            if (map.getLayer("originalRouteLayer")) {
                map.getSource("originalSource").setData(gcjData);
                layerVisibilityToggle('originalRouteLayer', 'visible');
            } else {
                map.addSource('originalSource', {
                    'type': 'geojson',
                    'data': gcjData
                });
                addMapLayer("originalSource");
            }
            let originalResult = calculateData(originalData);
            originalHtml(originalResult);
            console.log(originalResult);

        })
        .catch(function (error) {
            console.log(error);
        });
}

function getModifiedlData() {
    axios.get('./dataSample/40.json', {})
        .then(function (response) {
            let modifiedData = response.data;
            let gcjData = wgsToGcj(modifiedData);

            if (map.getLayer("modifiedRouteLayer")) {
                map.getSource("modifiedSource").setData(gcjData);
                layerVisibilityToggle('modifiedRouteLayer', 'visible');
            } else {
                map.addSource('modifiedSource', {
                    'type': 'geojson',
                    'data': gcjData
                });
                addMapLayer("modifiedSource");
            }
            let modifiedResult = calculateData(modifiedData);
            modifiedHtml(modifiedResult);
            console.log(modifiedResult);
        })
        .catch(function (error) {
            console.log(error);
        });
}


// -----------------------------------
// 图层显示切换
function layerVisibilityToggle(layerName, checkValue) {
    if (map.getLayer(layerName)) {
        map.setLayoutProperty(layerName, 'visibility', checkValue);
    } else {
    }
}

// 地图遮罩图层
function maskLayer(checkValue) {
    if (map.getLayer('maskLayer')) {
        layerVisibilityToggle('maskLayer', checkValue);
    } else {
        map.addLayer({
            type: 'background',
            id: 'maskLayer',
            paint: {
                'background-color': '#000000',
                'background-opacity': 0.5
            }
        });
    }
}

function addMapLayer(sourceId) {
    map_layer_config.forEach(function (value) {
        if (value.source_id === sourceId) {
            if (map.getLayer(value.layer_id)) {
            } else {
                if (value.layer_filter) {
                    map.addLayer({
                        'id': value.layer_id,
                        'type': value.layer_type,
                        'source': value.source_id,
                        "layout": value.layer_layout,
                        "paint": value.layer_paint,
                        filter: value.layer_filter
                    });
                } else {
                    map.addLayer({
                        'id': value.layer_id,
                        'type': value.layer_type,
                        'source': value.source_id,
                        "layout": value.layer_layout,
                        "paint": value.layer_paint
                    });
                }
            }
        } else {
            return false;
        }
    })
}

// -----------------------------------
function calculateData(data) {
    let routeLength; //线路长度 km
    let nonlinear; //非直线系数
    let stationDistance; //平均站间距 km
    let stationDistanceList = []; //站间距 km
    let routeRepetition;

    let routeData = data['features'];
    let routeCoordinate = routeData[0].geometry.coordinates;
    let routeTurf = turf.lineString(routeCoordinate);
    routeLength = routeData[0].geometry.properties.lineLength;
    let nonlinearIs = routeData[0].geometry.properties.isLoop;
    let stationCount = routeData[0].geometry.properties.stationNum;
    let routeStationList = routeData[0].geometry.properties.stationList;

    if (!routeLength) {
        routeLength = (turf.length(data, {units: 'kilometers'})).toFixed(2);
    }

    if (nonlinearIs) {
        nonlinear = "None";
    } else {
        let firstStation = turf.point(routeCoordinate[0]);
        let endStation = turf.point(routeCoordinate[routeCoordinate.length - 1]);
        // let options = {units: 'kilometers'};
        let terminalDistance = turf.distance(firstStation, endStation, {units: 'kilometers'});
        nonlinear = (routeLength / terminalDistance).toFixed(2);
    }

    routeRepetition = routeData[0].geometry.properties.repetition;

    stationDistance = (routeLength/stationCount).toFixed(2);

    for (let i = 0; i < routeStationList.length - 1; i++) {
        let startCoordinate = routeStationList[i];
        let endCoordinate = routeStationList[i + 1];
        let start = turf.point(startCoordinate);
        let stop = turf.point(endCoordinate);
        let sliced = turf.lineSlice(start, stop, routeTurf);
        let length = Number(turf.length(sliced, {units: 'kilometers'}).toFixed(2));
        stationDistanceList.push(length);
    }

    let calResult = {
        "routeLength": routeLength,
        "nonlinear": nonlinear,
        "routeRepetition": routeRepetition,
        "stationDistance": stationDistance,
        "stationDistanceList": stationDistanceList
    };

    return calResult;
}

function originalHtml(data) {
    $('#original-length').empty().text(data.routeLength + "km");
    if(data.nonlinear === "None") {
        $('#original-nonlinear').empty().text("/");
    } else {
        $('#original-nonlinear').empty().text(data.nonlinear);
    }
    $('#original-repetition').empty().text(data.routeRepetition + "%");
    $('#original-dis').empty().text(data.stationDistance + "km");
}

function modifiedHtml(data) {
    $('#modify-length').empty().text(data.routeLength + "km");
    if(data.nonlinear === "None") {
        $('#modify-nonlinear').empty().text("/");
    } else {
        $('#modify-nonlinear').empty().text(data.nonlinear);
    }
    $('#modify-repetition').empty().text(data.routeRepetition + "%");
    $('#modify-dis').empty().text(data.stationDistance + "km");
}
