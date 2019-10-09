let map; //地图Map
let originalIs = false; //原始数据是否有值返回
let modifiedIs = false; //修改后数据是否有值返回
let polyData = [];

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
        let params = {
            routeId1: "aaaaa-01",
            routeId2: "bbbbb-01"
        };
        getData(params);
    });

});

function test() {
    let params = {
        routeId1: "aaaaa-01",
        routeId2: "bbbbb-01"
    };
    getData(params);
}


function getData(data) {
    axios.get('./dataSample/data.json', {params: data})
        .then(function (response) {
            originalIs = false;
            modifiedIs = false;
            let orginalData = {
                "type": "FeatureCollection",
                "features": []
            };
            let modifiedData = {
                "type": "FeatureCollection",
                "features": []
            };
            if(response.status === 200) {
                response.data.features.forEach(function (value) {
                    let dataType = value.geometry.properties.type;
                    if(dataType === '1' && originalIs === false) {
                        orginalData.features.push(value);
                        originalIs = true;
                    } else if(dataType === '2' && modifiedIs === false) {
                        modifiedData.features.push(value);
                        modifiedIs = true;
                    } else {

                    }
                });
                // console.log(orginalData);
                // console.log(modifiedData);

                if(originalIs && modifiedData) {
                    // 2个都有数据
                    orginalDataGet(orginalData);
                    modifiedDataGet(modifiedData);
                } else if(originalIs || modifiedData) {
                    // 1个有数据
                    if(originalIs) {
                        orginalDataGet(orginalData);
                        modifiedEmptyHtml();
                    } else {
                        modifiedDataGet(modifiedData);
                        originalEmptyHtml();
                    }

                } else {
                    //都没有数据
                    originalEmptyHtml();
                    modifiedEmptyHtml();
                }
                $('.lineResultWrapper').show();

            } else {
                alert(response.status);
            }

        })
        .catch(function (error) {
        console.log(error);
    });
}


function orginalDataGet(data) {
    let gcjData = wgsToGcj(data);

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
    let originalResult = calculateData(data);
    originalHtml(originalResult);
}

function modifiedDataGet(data) {
    let gcjData = wgsToGcj(data);

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
    let modifiedResult = calculateData(data);
    modifiedHtml(modifiedResult);
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
// 计算
function calculateData(data) {
    let routeLength; //线路长度 km
    let nonlinear; //非直线系数
    let stationDistance; //平均站间距 km
    let stationDistanceList = []; //站间距 km
    let routeRepetition; //与其它线路的重复比例

    let routeData = data['features'];
    let routeCoordinate = routeData[0].geometry.coordinates; //线路坐标
    let routeTurf = turf.lineString(routeCoordinate);
    routeLength = routeData[0].geometry.properties.routeLength;
    let nonlinearIs = routeData[0].geometry.properties.isLoop; //是否环线
    let stationCount = routeData[0].geometry.properties.stationNum; //公交站点数量
    let routeStationList = routeData[0].geometry.properties.stationList; //公交站点坐标
    let routeDataType = routeData[0].geometry.properties.type;

    if (!routeLength) {
        routeLength = (turf.length(data, {units: 'kilometers'})).toFixed(2);
    }

    // 非直线系数计算
    if (nonlinearIs) {
        nonlinear = "None";
    } else {
        let firstStation = turf.point(routeCoordinate[0]);
        let endStation = turf.point(routeCoordinate[routeCoordinate.length - 1]);
        let terminalDistance = turf.distance(firstStation, endStation, {units: 'kilometers'});
        nonlinear = (routeLength / terminalDistance).toFixed(2);
    }

    routeRepetition = routeData[0].geometry.properties.repetition;

    // 平均站间距计算
    stationDistance = (routeLength / stationCount).toFixed(2);

    // 站间距计算
    for (let i = 0; i < routeStationList.length - 1; i++) {
        let startCoordinate = routeStationList[i];
        let endCoordinate = routeStationList[i + 1];
        let start = turf.point(startCoordinate);
        let stop = turf.point(endCoordinate);
        let sliced = turf.lineSlice(start, stop, routeTurf);
        let length = Number(turf.length(sliced, {units: 'kilometers'}).toFixed(2));
        stationDistanceList.push(length);
    }

    pointWithin(routeStationList,routeDataType);

    let calResult = {
        "routeLength": routeLength,
        "nonlinear": nonlinear,
        "routeRepetition": routeRepetition,
        "stationDistance": stationDistance,
        "stationDistanceList": stationDistanceList
    };

    return calResult;
}

//轨道交通接驳能力计算
function pointWithin(pointData, type) {
    let ptsWithin = turf.points(pointData);
    let insideData = ptsWithin;
    let insideDataList = [];
    let searchWithin;
    let connectRatio;

    axios.get('./dataSample/suzhouDistrict.json')
        .then(function (response) {
            if(response.status === 200) {
                response.data.features.forEach(function (value) {
                    if(value.geometry.type === "MultiPolygon") {
                        searchWithin = turf.multiPolygon(value.geometry.coordinates);
                        insideData = turf.pointsWithinPolygon(ptsWithin, searchWithin);
                        insideData.features.forEach(function (tempValue) {
                            insideDataList.push(tempValue.geometry.coordinates);

                        })
                        // console.log(insideData);
                    } else {
                        searchWithin = turf.polygon(value.geometry.coordinates);
                        insideData = turf.pointsWithinPolygon(ptsWithin, searchWithin);
                        insideData.features.forEach(function (tempValue) {
                            insideDataList.push(tempValue.geometry.coordinates);

                        })
                        // console.log(insideData);
                    }
                });
                let allPoint = turf.multiPoint(insideDataList);
                let insidePointList = turf.cleanCoords(allPoint).geometry.coordinates;  //无重复的站点数据
                console.log(insidePointList);

                connectRatio = ((insidePointList.length /pointData.length)*100).toFixed(2);
                // console.log(connectRatio);

                if(type === '1') {
                    $('#original-connect').empty().text(connectRatio + "%");
                } else {
                    $('#modify-connect').empty().text(connectRatio + "%");

                }
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}


// 调整前数据赋值
function originalHtml(data) {
    $('#original-length').empty().text(data.routeLength + "km");
    if (data.nonlinear === "None") {
        $('#original-nonlinear').empty().text("/");
    } else {
        $('#original-nonlinear').empty().text(data.nonlinear);
    }
    $('#original-repetition').empty().text(data.routeRepetition + "%");
    $('#original-dis').empty().text(data.stationDistance + "km");
}

// 调整前，无数据赋空值
function originalEmptyHtml() {
    $('#original-length').empty().text("/");
    $('#original-nonlinear').empty().text("/");
    $('#original-repetition').empty().text("/");
    $('#original-dis').empty().text("/");
    $('#original-connect').empty().text("/");
    $('#original-lane').empty().text("/");
}

// 调整后数据赋值
function modifiedHtml(data) {
    $('#modify-length').empty().text(data.routeLength + "km");
    if (data.nonlinear === "None") {
        $('#modify-nonlinear').empty().text("/");
    } else {
        $('#modify-nonlinear').empty().text(data.nonlinear);
    }
    $('#modify-repetition').empty().text(data.routeRepetition + "%");
    $('#modify-dis').empty().text(data.stationDistance + "km");
}

// 调整后，无数据赋空值
function modifiedEmptyHtml() {
    $('#modify-length').empty().text("/");
    $('#modify-nonlinear').empty().text("/");
    $('#modify-repetition').empty().text("/");
    $('#modify-dis').empty().text("/");
    $('#modify-connect').empty().text("/");
    $('#modify-lane').empty().text("/");
}
