let map; //地图Map
let stationPopup; //站点信息弹出框
let jobId = [];
let gpList = [];

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
    // 缺少清空给所有图层数据功能,停止未完成的GP服务
    removeAllLayer();
    setLayerNoSelect();
    removeGP();

    let originalIs = false; //原始数据是否有值返回
    let modifiedIs = false; //修改后数据是否有值返回
    //
    axios.get(url_get_route, {params: params})
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
                    $('.lineResultWrapper').hide();
                    $('.layerWrapper').hide();
                    $('.legendWrapper').hide();
                    $('#popupWrapper-return').show();
                    return;
                }

                response.data.features.forEach(function (item) {
                    let dataType = item.geometry.properties.type;
                    if (dataType === '1' && originalIs === false) {
                        if(item.geometry.coordinates) {
                            orginalData.features.push(item);
                            originalIs = true;
                        } else {
                        }

                    } else if (dataType === '2' && modifiedIs === false) {
                        if(item.geometry.coordinates) {
                            modifiedData.features.push(item);
                            modifiedIs = true;
                        } else {

                        }

                    } else {
                    }
                });

                // console.log(orginalData);
                // console.log(modifiedData);

                if (originalIs && modifiedIs) {
                    // 2个都有数据
                    originalLoadingHtml();
                    modifiedLoadingHtml();
                    calDistoChart(orginalData, modifiedData);
                    orginalDataGet(orginalData);
                    modifiedDataGet(modifiedData);

                    axios.get(url_get_all_routes)
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
                                response.data.features.forEach(function (item) {
                                    oldData.features.push(item);
                                    newData.features.push(item);
                                });
                                orginalData.features.forEach(function (item) {
                                    oldData.features.push(item)
                                });
                                modifiedData.features.forEach(function (item) {
                                    newData.features.push(item)
                                });
                                // console.log(oldData)
                                calDoubleBuffer(oldData, newData);
                            }
                        });

                } else if (originalIs || modifiedIs) {
                    // 1个有数据
                    if (originalIs) {
                        originalLoadingHtml();
                        calDistoChart(orginalData, null);
                        orginalDataGet(orginalData);

                        axios.get(url_get_all_routes)
                            .then(function (response) {
                                if (response.status === 200) {
                                    let oldData = {
                                        "type": "FeatureCollection",
                                        "features": []
                                    };
                                    response.data.features.forEach(function (item) {
                                        oldData.features.push(item);
                                    });
                                    orginalData.features.forEach(function (item) {
                                        oldData.features.push(item)
                                    });
                                    calDoubleBuffer(oldData, response.data);
                                }
                            });

                    } else {
                        modifiedLoadingHtml();
                        calDistoChart(null, modifiedData);
                        modifiedDataGet(modifiedData);

                        axios.get(url_get_all_routes)
                            .then(function (response) {
                                if (response.status === 200) {
                                    let newData = {
                                        "type": "FeatureCollection",
                                        "features": []
                                    };
                                    response.data.features.forEach(function (item) {
                                        newData.features.push(item);

                                    });
                                    modifiedData.features.forEach(function (item) {
                                        newData.features.push(item)
                                    });
                                    calDoubleBuffer(response.data, newData);
                                }
                            });
                    }
                } else {
                    $('.chartWrapper').hide();
                    $('.lineResultWrapper').hide();
                    $('.layerWrapper').hide();
                    $('.legendWrapper').hide();
                    $('#popupWrapper-return').show();
                    return;
                    //都没有数据
                }
                getStationData(params);

                $('.legendWrapper').show();
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
}

function getStationData(params) {
    axios.get(url_get_station, {params: params})
        .then(function (response) {
            if (response.status === 200) {
                let stationList = response.data;
                // console.log(stationList.features)
                stationList.features.forEach(function (item) {
                    let itemTypeList = item.properties.stationType.split(",");
                    // console.log(itemTypeList);
                    //取第一个属性赋样式
                    switch (itemTypeList[0]) {
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
    addMapLayer(orData, 'originalRouteLayer', 'originalSource');
    originalHtml(originalResult);
}

function modifiedDataGet(data) {
    let orData = data;
    let modifiedResult = calculateData(data);
    addMapLayer(orData, 'modifiedRouteLayer', 'modifiedSource');
    modifiedHtml(modifiedResult);
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

    // 按照 线路，重复路段，通过公交专用道长度，站点 顺序展示
    if(map.getLayer('originalFreLayer')) {
        map.moveLayer('originalFreLayer');
    }
    if(map.getLayer('modifiedFreLayer')) {
        map.moveLayer('modifiedFreLayer');
    }
    if(map.getLayer('originalLaneLayer')) {
        map.moveLayer('originalLaneLayer');
    }
    if(map.getLayer('modifiedLaneLayer')) {
        map.moveLayer('modifiedLaneLayer');
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
    let dataInfo = "详情:";
    let stationInfoHtml;
    let dataDetail = null;

    let itemTypeList = data.stationType.split(",");

    switch (data.iconType) {
        case "add":
            dataTypeName = "新增站点";
            stationInfoHtml = "<span class='popup-station-type popup-station-add'>" + dataTypeName + "</span>";
            break;
        case "remove":
            dataTypeName = "移除站点";
            stationInfoHtml = "<span class='popup-station-type popup-station-remove'>" + dataTypeName + "</span>";
            break;
        case "warning":
            dataTypeName = "预警站点";
            stationInfoHtml = "<span class='popup-station-type popup-station-pass'>" + dataTypeName + "</span>";
            break;
        default:
            dataTypeName = "普通站点";
            stationInfoHtml = "<span class='popup-station-type popup-station-normal'>" + dataTypeName + "</span>";
    }

    itemTypeList.forEach(function (item) {
        switch (item) {
            case "addOD":
                dataInfo += "承担大客流站点。";
                break;
            case "removeOD":
                dataInfo += "承担大客流站点。";
                break;
            case "addConnect":
                dataInfo += "接驳轨道站点。";
                dataDetail = "接驳客流前5的线路：" + data.connectRoute;
                break;
            case "removeConnect":
                dataInfo += "接驳轨道站点。";
                break;
            case "pass":
                dataInfo += "超过10条公交线路停靠站点。";
                break;
            default:
                dataInfo += '无。';
        }
    });

    if (dataDetail) {
        stationInfoHtml += "<span class='popup-station-header'>" + data.stationName + "</span>" + "<span class='popup-station-info'>" + dataInfo + dataDetail + "</span>";
    } else {
        stationInfoHtml += "<span class='popup-station-header'>" + data.stationName + "</span>" + "<span class='popup-station-info'>" + dataInfo + "</span>";
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
    routeLength = routeData[0].geometry.properties.routeLength;
    let nonlinearIs = routeData[0].geometry.properties.isLoop; //是否环线
    let stationCount = routeData[0].geometry.properties.stationNum; //公交站点数量
    let routeStationList = routeData[0].geometry.properties.stationList; //公交站点坐标
    let routeDataType = routeData[0].geometry.properties.type; //数据类型
    let repetitonList = routeData[0].geometry.properties.repetitonList; //数据类型
    let routeWaring = routeData[0].geometry.properties.routeWarning; //线路长度是否超限

    if (routeLength != null) {
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

    routeRepetition = (routeData[0].geometry.properties.repetition * 100).toFixed(2);

    // 平均站间距计算
    stationDistance = (routeLength / (stationCount-1)).toFixed(2);

    // 公交站300米覆盖率
    calPointWithin(routeStationList, routeDataType);

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
        "stationDistance": stationDistance,
        "routeWaring": routeWaring
    };

    return calResult;
}

// 站间距数据展示，调用图表功能
function calDistoChart(originalData, modifiedData) {
    $('.chartWrapper').show();
    let originalDisList = [];
    let modifiedDisList = [];
    if (originalData) {
        originalDisList = calDis(originalData);
    }
    if (modifiedData) {
        modifiedDisList = calDis(modifiedData);
    }

    let disChartData = {
        "originalDis": originalDisList,
        "modifiedDis": modifiedDisList
    };
    // console.log(disChartData);
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
    for (let i = 0; i < routeStationList.length - 1; i++) {
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
    let searchWithin;
    let connectRatio;
    let count = 0;

    axios.get(url_get_rail_station)
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
    if (data.routeWaring) {
        $('#original-length').empty().text(data.routeLength + "km").css({
            'color': 'red',
            'cursor': 'pointer'
        }).tooltip({title: '线路长度超阈值'});
    } else {
        $('#original-length').empty().text(data.routeLength + "km")
    }
    if (data.nonlinear === "None") {
        $('#original-nonlinear').empty().text("/(环线)");
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
    if (data.routeWaring) {
        $('#modify-length').empty().text(data.routeLength + "km").css({
            'color': 'red',
            'cursor': 'pointer'
        }).tooltip({title: '线路长度超阈值'});
    } else {
        $('#modify-length').empty().text(data.routeLength + "km")
    }
    if (data.nonlinear === "None") {
        $('#modify-nonlinear').empty().text("/(环线)");
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
            "distance": 5,
            "units": "esriMeters"
        };
        let Dis2 = {
            "distance": 5,
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
        gpList.push(gptask);

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
                let outUrl = value.value.url;
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
            "distance": 5,
            "units": "esriMeters"
        };

        let Dis2 = {
            "distance": 5,
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
        gpList.push(gptask);

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
                let outUrl = value.value.url;
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
                "routeId": "routeId"
            },
            "geometryType": "esriGeometryPolyline",
            "spatialReference": {
                "wkid": 4326,
                "latestWkid": 4326
            },
            "fields": [
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
                "routeId": "routeId"
            },
            "geometryType": "esriGeometryPolyline",
            "spatialReference": {
                "wkid": 4326,
                "latestWkid": 4326
            },
            "fields": [
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
        // console.log(gpParams);
        gptask.submitJob(gpParams, completeCallback, statusCallback);
        gpList.push(gptask);

        // 结果图加载
        function completeCallback(jobInfo) {
            // 未覆盖区域
            gptask.getResultData(jobInfo.jobId, "output_min_Select").then(function (value) {
                // console.log(value);
                let outputData = ArcgisToGeojsonUtils.arcgisToGeoJSON(value.value);
                addMapLayer(outputData, 'doubleMinLayer', 'doubleMinSource');
            });
            // 覆盖区域
            gptask.getResultData(jobInfo.jobId, "output_add_Select").then(function (value) {
                // console.log(value);
                let outputData = ArcgisToGeojsonUtils.arcgisToGeoJSON(value.value);
                addMapLayer(outputData, 'doubleAddLayer', 'doubleAddSource');
            });

        }
    });
}

// 运行状态显示
function statusCallback(jobInfo) {
    console.log(jobInfo.jobStatus);
    let jobIdIndex =  jobId.indexOf(jobInfo.jobId);
    if(jobIdIndex === -1) {
        jobId.push(jobInfo.jobId);
    }
}

// 停止正在进行的GP服务
// 先停止GP服务，后将HTML数据置空
function removeGP() {
    gpList.forEach(function (gpItem) {
        jobId.forEach(function (jobItem) {
            gpItem.cancelJob(jobItem)
        })

    });
    gpList = [];
    jobId = [];

    // 清空HTML
    originalEmptyHtml();
    modifiedEmptyHtml();
}
