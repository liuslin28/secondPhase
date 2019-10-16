let map; //地图Map
let stationPopup; //站点信息弹出框
let polyData = [];

/**
 * 基本地图加载
 * 地图缩放级别限制
 */

$(document).ready(function () {
    initSelect();

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
        pitch: 0, /*地图俯仰角度*/
        maxZoom: 17, /*地图最大缩放等级*/
        minZoom: 3, /*地图最小缩放等级*/
        trackResize: true, /*地图会自动匹配浏览器窗口大小*/
        logoControl: false  /*logo控件是否显示，不加该参数时默认显示*/
    });

    stationPopup = new minemap.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: [0, 0]
    });

    map.on("load", function () {
        let t = setInterval(function () {
            //if (map && 其它业务判断) {
            if (map) {
                if (map.isStyleLoaded()) {
                    //加载成功后 loading 隐藏 , 加载其它数据
                    clearInterval(t);
                    $('.waitWrapper-backgroud').hide();
                    $('.waitWrapper').hide();

                    addMapIcon();
                }
            } else {
                clearInterval(t);
            }
        }, 1000);
    });
});


function getData(params) {
    // 缺少清空给所有图层数据功能
    removeAllLayer();
    setLayerNoSelect();

    originalEmptyHtml();
    modifiedEmptyHtml();
    let originalIs = false; //原始数据是否有值返回
    let modifiedIs = false; //修改后数据是否有值返回
    //
    axios.get('./dataSample/data.json', {params: params})
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
            if (response.status === 200) {

                // 若果无数据，直接返回，显示提示框
                if (response.data === [] || response.data.features.length === 0) {
                    $('.chartWrapper').hide();
                    return;
                }

                response.data.features.forEach(function (value) {
                    let dataType = value.geometry.properties.type;
                    if (dataType === '1' && originalIs === false) {
                        orginalData.features.push(value);
                        originalIs = true;
                    } else if (dataType === '2' && modifiedIs === false) {
                        modifiedData.features.push(value);
                        modifiedIs = true;
                    } else {
                        return;
                    }
                });
                // console.log(orginalData);
                // console.log(modifiedData);

                if (originalIs && modifiedIs) {
                    // 2个都有数据
                    originalLoadingHtml();
                    modifiedLoadingHtml();
                    calDistoChart(orginalData, modifiedData);


                    axios.get('./dataSample/geoRoute1011.json')
                        .then(function (response) {
                            if (response.status === 200) {
                                let oldData = {
                                    "type": "FeatureCollection",
                                    "features": []
                                };
                                let newData = {
                                    "type": "FeatureCollection",
                                    "features": []
                                };
                                response.data.features.forEach(function (value) {
                                    oldData.features.push(value);
                                    newData.features.push(value);

                                });
                                oldData.features.push(orginalData.features);
                                newData.features.push(modifiedData.features);
                                calDoubleBuffer(oldData, newData);
                            }
                        });

                    orginalDataGet(orginalData);
                    modifiedDataGet(modifiedData);


                } else if (originalIs || modifiedIs) {
                    // 1个有数据
                    if (originalIs) {
                        originalLoadingHtml();
                        calDistoChart(orginalData, null);

                        axios.get('./dataSample/geoRoute1011.json')
                            .then(function (response) {
                                if (response.status === 200) {
                                    let oldData = {
                                        "type": "FeatureCollection",
                                        "features": []
                                    };
                                    response.data.features.forEach(function (value) {
                                        oldData.features.push(value);
                                    });
                                    oldData.features.push(orginalData.features);
                                    calDoubleBuffer(oldData, response.data);
                                }
                            });
                        orginalDataGet(orginalData);

                    } else {
                        modifiedLoadingHtml();
                        calDistoChart(null, modifiedData);

                        axios.get('./dataSample/geoRoute1011.json')
                            .then(function (response) {
                                if (response.status === 200) {
                                    let newData = {
                                        "type": "FeatureCollection",
                                        "features": []
                                    };
                                    response.data.features.forEach(function (value) {
                                        newData.features.push(value);

                                    });
                                    newData.features.push(modifiedData.features);
                                    calDoubleBuffer(response.data, newData);
                                }
                            });
                        modifiedDataGet(modifiedData);

                    }
                } else {
                    //都没有数据
                }
                $('.layerWrapper').show();
                $('.lineResultWrapper').show();
                map.on("mousemove", infoPopup)
            } else {
                alert(response.status);
            }
        })
        .catch(function (error) {
            console.log(error);
        });

    axios.get('./dataSample/warningPoint.json', {params: params})
        .then(function (response) {
            if (response.status === 200) {
                let stationList = response.data;
                stationList.features.forEach(function (item) {
                    switch (item.properties.stationType) {
                        case "normal":
                            item.properties.iconType = "normal";
                            break;
                        case "addOD":
                            item.properties.iconType = "add";
                            break;
                        case "removeOD":
                            item.properties.iconType = "remove";
                            break;
                        case "addConnect":
                            item.properties.iconType = "add";
                            break;
                        case "removeConnect":
                            item.properties.iconType = "remove";
                            break;
                        case "pass":
                            item.properties.iconType = "warning";
                            break;
                        default:
                            item.properties.iconType = "normal";


                    }
                });
                addMapLayer(stationList, 'stationLayer', 'stationSource');
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function orginalDataGet(data) {
    let orData = data;
    let originalResult = calculateData(data);
    originalHtml(originalResult);
    addMapLayer(orData, 'originalRouteLayer', 'originalSource');
}

function modifiedDataGet(data) {
    let orData = data;
    let modifiedResult = calculateData(data);
    modifiedHtml(modifiedResult);
    addMapLayer(orData, 'modifiedRouteLayer', 'modifiedSource');
}

// -----------------------------------

// 加载图标
function addMapIcon() {
    icon_config.forEach(function (value) {
        map.loadImage(value.icon_path, function (error, image) {
            if (error) throw error;
            map.addImage(value.icon_id, image);
        });
    });
}


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


// 移除所有图层
function removeAllLayer() {
    map_layer_config.forEach(function (value) {
        if (map.getLayer(value.layer_id)) {
            map.removeLayer(value.layer_id);
            map.removeSource(value.source_id);
        }
    })
}

// 添加图层
function addMapLayer(data, LayerId, SourceId) {
    let gcjData = wgsToGcj(data);

    // 缩放至公交线路范围
    if (LayerId === "originalRouteLayer" || LayerId === "modifiedRouteLayer") {
        setBoundry(gcjData);
    }

    if (map.getLayer(LayerId)) {
        map.getSource(SourceId).setData(gcjData);
        layerVisibilityToggle(LayerId, 'visible');
    } else {
        map.addSource(SourceId, {
            'type': 'geojson',
            'data': gcjData
        });
        setMapLayer(SourceId);
    }

    // 将站点图层置顶
    if (map.getLayer('stationLayer')) {
        map.moveLayer('stationLayer');
    }
}

// 设置图层样式
function setMapLayer(sourceId) {
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
            setLayerSelect(value.layer_id);
        } else {
            return false;
        }
    })
}

// 缩放至要素所在区域
function setBoundry(data) {
    map.setPitch(0);
    map.setZoom(13);
    let bbox = turf.bbox(data);
    let minX = bbox[0];
    let minY = bbox[1];
    let maxX = bbox[2];
    let maxY = bbox[3];
    let center = turf.center(data);
    let centerPoint = turf.getCoord(center);
    let arr = [[minX - 0.015, minY - 0.015], [maxX + 0.015, maxY + 0.015]];
    map.fitBounds(minemap.LngLatBounds.convert(arr));
    map.flyTo({
        center: [centerPoint[0] + 0.01, centerPoint[1]]
    })
}

// 站点弹出框
function infoPopup(e) {
    if (e) {

        let features = map.queryRenderedFeatures([[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]], {layers: ['stationLayer']});
        if (features.length === 0) {
            stationPopup.remove();
        } else {
            let feature = features[0];
            let popupLatLng = [Number(feature.geometry.coordinates[0]), Number(feature.geometry.coordinates[1])];
            let infoHtml = setInfoHtml(feature.properties);
            stationPopup.setLngLat(popupLatLng)
                .setHTML(infoHtml)
                .addTo(map);
        }
    }
}

// 设置弹出框内容
function setInfoHtml(data) {
    let dataTypeName;  //站点类型
    let dataInfo;
    let stationInfoHtml;
    console.log(data.stationType);

    switch (data.stationType) {
        case "addOD":
            dataTypeName = "新增站点";
            dataInfo = "承担大客流站点。";
            stationInfoHtml = "<span class='popup-station-type popup-station-add'>" + dataTypeName + "</span>" + "<span class='popup-station-header'>" + data.StationName + "</span>" + "<span class='popup-station-info'>" + dataInfo + "</span>";
            break;
        case "removeOD":
            dataTypeName = "移除站点";
            dataInfo = "承担大客流站点。";
            stationInfoHtml = "<span class='popup-station-type popup-station-remove'>" + dataTypeName + "</span>" + "<span class='popup-station-header'>" + data.StationName + "</span>" + "<span class='popup-station-info'>" + dataInfo + "</span>";
            break;
        case "addConnect":
            dataTypeName = "新增站点";
            dataInfo = "接驳轨道站点。";
            let dataDetal = "接驳客流前5的线路：" + data.connectRoute;
            stationInfoHtml = "<span class='popup-station-type popup-station-add'>" + dataTypeName + "</span>" + "<span class='popup-station-header'>" + data.StationName + "</span>" + "<span class='popup-station-info'>" + dataInfo + dataDetal + "</span>";
            break;
        case "removeConnect":
            dataTypeName = "移除站点";
            dataInfo = "接驳轨道站点。";
            stationInfoHtml = "<span class='popup-station-type popup-station-remove'>" + dataTypeName + "</span>" + "<span class='popup-station-header'>" + data.StationName + "</span>" + "<span class='popup-station-info'>" + dataInfo + "</span>";
            break;
        case "pass":
            dataTypeName = "预警站点";
            dataInfo = "超过10条公交线路停靠站点。";
            stationInfoHtml = "<span class='popup-station-type popup-station-pass'>" + dataTypeName + "</span>" + "<span class='popup-station-header'>" + data.StationName + "</span>" + "<span class='popup-station-info'>" + dataInfo + "</span>";
            break;
        default:
            dataTypeName = "普通站点";
            stationInfoHtml = "<span class='popup-station-type popup-station-normal'>" + dataTypeName + "</span>" + "<span class='popup-station-header'>" + data.StationName + "</span>";
    }

    return stationInfoHtml;
}

// -----------------------------------
// 计算
function calculateData(data) {
    let routeLength; //线路长度 km
    let nonlinear; //非直线系数
    let stationDistance; //平均站间距 km
    let routeRepetition; //与其它线路的重复比例

    let routeData = data['features'];
    let routeCoordinate = routeData[0].geometry.coordinates; //线路坐标
    let routeTurf = turf.lineString(routeCoordinate);
    routeLength = routeData[0].geometry.properties.routeLength;
    let nonlinearIs = routeData[0].geometry.properties.isLoop; //是否环线
    let stationCount = routeData[0].geometry.properties.stationNum; //公交站点数量
    let routeStationList = routeData[0].geometry.properties.stationList; //公交站点坐标
    let routeDataType = routeData[0].geometry.properties.type; //数据类型
    let repetitonList = routeData[0].geometry.properties.repetitonList; //数据类型

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

    // 公交站300米覆盖率
    // calPointWithin(routeStationList, routeDataType);
    calPointWithin2(routeStationList, routeDataType);

    // 公交专用道 和 路段重复系数
    if (routeDataType === '1') {
        calLaneLength(routeCoordinate);
        let routeOriginal = calFrequency(routeCoordinate, repetitonList);
        addMapLayer(routeOriginal, 'originalFreLayer', 'originalFreSource');
    } else {
        calLaneLength2(routeCoordinate);
        let routeModified = calFrequency(routeCoordinate, repetitonList);
        addMapLayer(routeModified, 'modifiedFreLayer', 'modifiedFreSource');
    }

    let calResult = {
        "routeLength": routeLength,
        "nonlinear": nonlinear,
        "routeRepetition": routeRepetition,
        "stationDistance": stationDistance
    };

    return calResult;
}

// 站间距数据展示，调用图表功能
function calDistoChart(originalData, modifiedData) {
    $('.chartWrapper').show();
    let originalDisList =[];
    let modifiedDisList = [];
    if(originalData) {
        originalDisList = calDis(originalData);
    }
    if(modifiedData) {
        modifiedDisList =  calDis(modifiedData);
    }

    let disChartData = {
        "originalDis": originalDisList,
        "modifiedDis": modifiedDisList
    };
    initDisChart(disChartData);
}

// 站间距计算
function calDis(data) {
    let stationDistanceList = []; //站间距 km

    let routeData = data['features'];
    let routeCoordinate = routeData[0].geometry.coordinates; //线路坐标
    let routeTurf = turf.lineString(routeCoordinate);
    let routeStationList = routeData[0].geometry.properties.stationList; //公交站点坐标

    // 站间距计算
    for (let i = 0; i < routeStationList.length - 2; i++) {
        let startCoordinate = routeStationList[i];
        let endCoordinate = routeStationList[i + 1];
        let start = turf.point(startCoordinate);
        let stop = turf.point(endCoordinate);
        let sliced = turf.lineSlice(start, stop, routeTurf);
        let length = Number(turf.length(sliced, {units: 'kilometers'}).toFixed(2));
        stationDistanceList.push(length);
    }
    return stationDistanceList;
}

// 路段重复系数
function calFrequency(route, repetitonList) {
    let routeFeature = turf.lineString(route);
    let lineFeature = {
        "type":
            "FeatureCollection",
        "features":
            []
    };
    repetitonList.forEach(function (value) {
        let start = turf.point(value[0]);
        let stop = turf.point(value[1]);
        let sliced = turf.lineSlice(start, stop, routeFeature);
        lineFeature.features.push(sliced);
    });
    return lineFeature;
}

//轨道交通接驳能力计算
function calPointWithin(pointData, type) {
    let ptsWithin = turf.points(pointData);
    let insideData = ptsWithin;
    let insideDataList = [];
    let searchWithin;
    let connectRatio;

    axios.get('./dataSample/gusu.json')
        .then(function (response) {
            if (response.status === 200) {
                response.data.features.forEach(function (value) {
                    if (value.geometry.type === "MultiPolygon") {
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
                // console.log(insidePointList);

                connectRatio = ((insidePointList.length / pointData.length) * 100).toFixed(2);
                // console.log(connectRatio);

                if (type === '1') {
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

//轨道交通接驳能力计算2
function calPointWithin2(pointData, type) {
    let searchWithin;
    let connectRatio;
    let count = 0;

    axios.get('./dataSample/gusu.json')
        .then(function (response) {
            if (response.status === 200) {
                response.data.features.forEach(function (value) {
                    if (value.geometry.type === "MultiPolygon") {
                        searchWithin = turf.multiPolygon(value.geometry.coordinates);
                    } else {
                        searchWithin = turf.polygon(value.geometry.coordinates);
                    }
                    pointData.forEach(function (value) {
                        let pt = turf.point(value);
                        let isInside = turf.booleanPointInPolygon(pt, searchWithin);
                        if (isInside) {
                            count += 1;
                        }
                    })
                });
                connectRatio = ((count / pointData.length) * 100).toFixed(2);
                // console.log(connectRatio);
                if (type === '1') {
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

// 调整前，计算中赋值
function originalLoadingHtml() {
    $('#original-length').empty().text("计算中...");
    $('#original-nonlinear').empty().text("计算中...");
    $('#original-repetition').empty().text("计算中...");
    $('#original-dis').empty().text("计算中...");
    $('#original-connect').empty().text("计算中...");
    $('#original-lane').empty().text("计算中...");
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

// 调整后，计算中赋值
function modifiedLoadingHtml() {
    $('#modify-length').empty().text("计算中...");
    $('#modify-nonlinear').empty().text("计算中...");
    $('#modify-repetition').empty().text("计算中...");
    $('#modify-dis').empty().text("计算中...");
    $('#modify-connect').empty().text("计算中...");
    $('#modify-lane').empty().text("计算中...");
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

// ----------------GP服务-------------------
// 计算公交专用道长度
function calLaneLength(data) {
    require(["esri/SpatialReference", "esri/graphic", "esri/tasks/Geoprocessor"], function (SpatialReference, Graphic, Geoprocessor) {
        let lineFeature = {
            "displayFieldName": "",
            "fieldAliases": {
                "FID": "FID"
            },
            "geometryType": "esriGeometryPolyline",
            "spatialReference": {
                "wkid": 4326,
                "latestWkid": 4326
            },
            "fields": [
                {
                    "name": "FID",
                    "type": "esriFieldTypeOID",
                    "alias": "FID"
                }
            ],
            "features": [
                {
                    "attributes": {
                        "FID": 0
                    },
                    "geometry": {
                        "paths": [
                            data
                        ]
                    }
                }
            ]
        };

        let Dis1 = {
            "distance": 20,
            "units": "esriMeters"
        };

        let busRouteFeatureSet = new esri.tasks.FeatureSet(lineFeature);
        busRouteFeatureSet.spatialReference = new SpatialReference({wkid: 4326});

        let gptask = new Geoprocessor("https://192.168.207.165:6443/arcgis/rest/services/GPTool/laneLength2/GPServer/laneLength2");
        let gpParams = {
            "Dis1": Dis1,
            "line": busRouteFeatureSet
        };

        gptask.submitJob(gpParams, completeCallback, statusCallback);

        // 结果图加载
        function completeCallback(jobInfo) {
            // 长度求算
            gptask.getResultData(jobInfo.jobId, "output_length").then(function (value) {
                if ((value.value.features).length > 0) {
                    let laneLength = (((value.value.features)[0].attributes.SUM_Shape_Length) / 1000).toFixed(2);
                    $('#original-lane').empty().text(laneLength + "km");
                } else {
                    $('#original-lane').empty().text("/");
                }
            });

            gptask.getResultData(jobInfo.jobId, "output_json").then(function (value) {
                // console.log(value);
                let outUrl = value.value.url;
                // console.log(outUrl);
                axios.get(outUrl)
                    .then(function (response) {
                        if (response.status === 200) {
                            let outputData = ArcgisToGeojsonUtils.arcgisToGeoJSON(response.data);
                            addMapLayer(outputData, 'originalLaneLayer', 'originalLaneSource');

                        } else {
                            console.log(response.status);
                        }
                    })
            });
        }

    });
}


function calLaneLength2(data) {
    require(["esri/SpatialReference", "esri/graphic", "esri/tasks/Geoprocessor"], function (SpatialReference, Graphic, Geoprocessor) {
        let lineFeature = {
            "displayFieldName": "",
            "fieldAliases": {
                "FID": "FID"
            },
            "geometryType": "esriGeometryPolyline",
            "spatialReference": {
                "wkid": 4326,
                "latestWkid": 4326
            },
            "fields": [
                {
                    "name": "FID",
                    "type": "esriFieldTypeOID",
                    "alias": "FID"
                }
            ],
            "features": [
                {
                    "attributes": {
                        "FID": 0
                    },
                    "geometry": {
                        "paths": [
                            data
                        ]
                    }
                }
            ]
        };

        let Dis1 = {
            "distance": 20,
            "units": "esriMeters"
        };

        let Dis2 = {
            "distance": 30,
            "units": "esriMeters"
        };
        let busRouteFeatureSet = new esri.tasks.FeatureSet(lineFeature);
        busRouteFeatureSet.spatialReference = new SpatialReference({wkid: 4326});
        let gptask = new Geoprocessor("https://192.168.207.165:6443/arcgis/rest/services/GPTool/laneLength2/GPServer/laneLength2");
        let gpParams = {
            "Dis1": Dis1,
            "Dis2": Dis2,
            "line": busRouteFeatureSet
        };

        gptask.submitJob(gpParams, completeCallback, statusCallback);

        // 结果图加载
        function completeCallback(jobInfo) {
            // 长度求算
            gptask.getResultData(jobInfo.jobId, "output_length").then(function (value) {
                if ((value.value.features).length > 0) {
                    let laneLength = (((value.value.features)[0].attributes.SUM_Shape_Length) / 1000).toFixed(2);
                    $('#modify-lane').empty().text(laneLength + "km");
                } else {
                    $('#modify-lane').empty().text("/");
                }
            });
            gptask.getResultData(jobInfo.jobId, "output_json").then(function (value) {
                // console.log(value);
                let outUrl = value.value.url;
                // console.log(outUrl);
                axios.get(outUrl)
                    .then(function (response) {
                        if (response.status === 200) {
                            let outputData = ArcgisToGeojsonUtils.arcgisToGeoJSON(response.data);
                            addMapLayer(outputData, 'modifiedLaneLayer', 'modifiedLaneSource');

                        } else {
                            console.log(response.status);
                        }
                    })
            });
        }
    });
}

// 计算两条线路的缓冲区
function calDoubleBuffer(data1, data2) {
    let oldData = ArcgisToGeojsonUtils.geojsonToArcGIS(data1);
    let newData = ArcgisToGeojsonUtils.geojsonToArcGIS(data2);
    require(["esri/SpatialReference", "esri/graphic", "esri/tasks/Geoprocessor"], function (SpatialReference, Graphic, Geoprocessor) {

        let routesFeature1 = {
            "displayFieldName": "",
            "fieldAliases": {
                "FID": "FID",
                "routeId": "routeId"
            },
            "geometryType": "esriGeometryPolyline",
            "spatialReference": {
                "wkid": 4326,
                "latestWkid": 4326
            },
            "fields": [
                {
                    "name": "FID",
                    "type": "esriFieldTypeOID",
                    "alias": "FID"
                },
                {
                    "name": "routeId",
                    "type": "esriFieldTypeString",
                    "alias": "routeId",
                    "length": 254
                }
            ],
            "features": oldData
        };

        let routesFeature2 = {
            "displayFieldName": "",
            "fieldAliases": {
                "FID": "FID",
                "routeId": "routeId"
            },
            "geometryType": "esriGeometryPolyline",
            "spatialReference": {
                "wkid": 4326,
                "latestWkid": 4326
            },
            "fields": [
                {
                    "name": "FID",
                    "type": "esriFieldTypeOID",
                    "alias": "FID"
                },
                {
                    "name": "routeId",
                    "type": "esriFieldTypeString",
                    "alias": "routeId",
                    "length": 254
                }
            ],
            "features": newData
        };

        let Dis = {
            "distance": 500,
            "units": "esriMeters"
        };
        let routesFeatureSet1 = new esri.tasks.FeatureSet(routesFeature1);
        routesFeatureSet1.spatialReference = new SpatialReference({wkid: 4326});
        let routesFeatureSet2 = new esri.tasks.FeatureSet(routesFeature2);
        routesFeatureSet2.spatialReference = new SpatialReference({wkid: 4326});
        let gptask = new Geoprocessor("https://192.168.207.165:6443/arcgis/rest/services/GPTool/lineDoubleBuffer/GPServer/lineDoubleBuffer");
        let gpParams = {
            "Dis": Dis,
            "routesOld": routesFeatureSet1,
            "routesNew": routesFeatureSet2
        };
        gptask.submitJob(gpParams, completeCallback, statusCallback);

        // 结果图加载
        function completeCallback(jobInfo) {
            // 未覆盖区域
            gptask.getResultData(jobInfo.jobId, "output_min_Select").then(function (value) {
                console.log(value);
                let outputData = ArcgisToGeojsonUtils.arcgisToGeoJSON(value.value);
                addMapLayer(outputData, 'doubleMinLayer', 'doubleMinSource');
            });
            // 覆盖区域
            gptask.getResultData(jobInfo.jobId, "output_add_Select").then(function (value) {
                console.log(value);
                let outputData = ArcgisToGeojsonUtils.arcgisToGeoJSON(value.value);
                addMapLayer(outputData, 'doubleAddLayer', 'doubleAddSource');
            });

        }
    });
}


// 运行状态显示
function statusCallback(jobInfo) {
    console.log(jobInfo.jobStatus);
}
