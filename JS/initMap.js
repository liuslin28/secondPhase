let map; //地图Map

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
        pitch: 0, /*地图俯仰角度*/
        maxZoom: 17, /*地图最大缩放等级*/
        minZoom: 3, /*地图最小缩放等级*/
        trackResize: true, /*地图会自动匹配浏览器窗口大小*/
        logoControl: false  /*logo控件是否显示，不加该参数时默认显示*/
    });


    map.on("load", function () {
        // calSingleBuffer();
        let params = {
            routeId1: "aaaaa-01",
            routeId2: "bbbbb-01"
        };
        getData(params);
        // aaa();
    });

});

function test() {
    let params = {
        routeId1: "aaaaa-01",
        routeId2: "bbbbb-01"
    };
    getData(params);
}


function getData(params) {
    // 缺少清空给所有图层数据功能
    removeAllLayer();
    originalEmptyHtml();
    modifiedEmptyHtml();
    let originalIs = false; //原始数据是否有值返回
    let modifiedIs = false; //修改后数据是否有值返回

    axios.get('./dataSample/data.json', {params:params})
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
                if(response.data.features.length === 0) {
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
                    orginalDataGet(orginalData);
                    modifiedDataGet(modifiedData);

                    axios.get('./dataSample/geoRoute1011.json')
                        .then(function (response) {
                            if(response.status === 200) {
                                let oldData  = {
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
                        })


                } else if (originalIs || modifiedIs) {
                    // 1个有数据
                    if (originalIs) {
                        orginalDataGet(orginalData);

                        axios.get('./dataSample/geoRoute1011.json')
                            .then(function (response) {
                                if(response.status === 200) {
                                    let oldData  = {
                                        "type": "FeatureCollection",
                                        "features": []
                                    };
                                    response.data.features.forEach(function (value) {
                                        oldData.features.push(value);

                                    });
                                    oldData.features.push(orginalData.features);
                                    calSingleBuffer(oldData);
                                }
                            })

                    } else {
                        modifiedDataGet(modifiedData);
                        axios.get('./dataSample/geoRoute1011.json')
                            .then(function (response) {
                                if(response.status === 200) {
                                    let newData = {
                                        "type": "FeatureCollection",
                                        "features": []
                                    };
                                    response.data.features.forEach(function (value) {
                                        newData.features.push(value);

                                    });
                                    newData.features.push(modifiedData.features);
                                    calSingleBuffer(newData);
                                }
                            })
                    }

                } else {
                    //都没有数据

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

function removeAllLayer() {
    map_layer_config.forEach(function (value) {
        if(map.getLayer(value.layer_id)) {
            map.removeLayer(value.layer_id);
            map.removeSource(value.source_id);
        }
    })
}


function addMapLayer(data, LayerId, SourceId) {
    let gcjData = wgsToGcj(data);

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
}

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

    calPointWithin(routeStationList, routeDataType);

    if (routeDataType === '1') {
        calLaneLength(routeCoordinate);
    } else {
        calLaneLength2(routeCoordinate);
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

//轨道交通接驳能力计算
function calPointWithin(pointData, type) {
    let ptsWithin = turf.points(pointData);
    let insideData = ptsWithin;
    let insideDataList = [];
    let searchWithin;
    let connectRatio;

    axios.get('./dataSample/suzhouDistrict.json')
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
        // gptask.on("get-result-data-complete", displayResults);

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
                        if(response.status === 200) {
                            let outputData = ArcgisToGeojsonUtils.arcgisToGeoJSON(response.data);
                            // let outputData = transData(response.data.features);
                            addMapLayer(outputData, 'originalLaneLayer', 'originalLaneSource');
                            map.moveLayer('originalLaneLayer');

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
        // gptask.on("get-result-data-complete", displayResults);

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
                        if(response.status === 200) {
                            let outputData = ArcgisToGeojsonUtils.arcgisToGeoJSON(response.data);
                            addMapLayer(outputData, 'modifiedLaneLayer', 'modifiedLaneSource');
                            map.moveLayer('modifiedLaneLayer');

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
    let oldData =  ArcgisToGeojsonUtils.geojsonToArcGIS(data1);
    let newData =  ArcgisToGeojsonUtils.geojsonToArcGIS(data2);
    require(["esri/SpatialReference", "esri/graphic", "esri/tasks/Geoprocessor"], function (SpatialReference, Graphic, Geoprocessor) {

        let routesFeature1 = {
            "displayFieldName" : "",
            "fieldAliases" : {
                "FID" : "FID",
                "route_id" : "route_id"
            },
            "geometryType" : "esriGeometryPolyline",
            "spatialReference" : {
                "wkid" : 4326,
                "latestWkid" : 4326
            },
            "fields" : [
                {
                    "name" : "FID",
                    "type" : "esriFieldTypeOID",
                    "alias" : "FID"
                },
                {
                    "name" : "route_id",
                    "type" : "esriFieldTypeString",
                    "alias" : "route_id",
                    "length" : 254
                }
            ],
            "features" :oldData
        };

        let routesFeature2 = {
            "displayFieldName" : "",
            "fieldAliases" : {
                "FID" : "FID",
                "route_id" : "route_id"
            },
            "geometryType" : "esriGeometryPolyline",
            "spatialReference" : {
                "wkid" : 4326,
                "latestWkid" : 4326
            },
            "fields" : [
                {
                    "name" : "FID",
                    "type" : "esriFieldTypeOID",
                    "alias" : "FID"
                },
                {
                    "name" : "route_id",
                    "type" : "esriFieldTypeString",
                    "alias" : "route_id",
                    "length" : 254
                }
            ],
            "features" :newData
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
                map.moveLayer('doubleMinLayer');
            });
            // 覆盖区域
            gptask.getResultData(jobInfo.jobId, "output_add_Select").then(function (value) {
                console.log(value);
                let outputData = ArcgisToGeojsonUtils.arcgisToGeoJSON(value.value);
                addMapLayer(outputData, 'doubleAddLayer', 'doubleAddSource');
                map.moveLayer('doubleAddLayer');
            });

        }
    });
}


// 计算单条线路的缓冲区
function calSingleBuffer(data) {
    let newData =  ArcgisToGeojsonUtils.geojsonToArcGIS(data);
    require(["esri/SpatialReference", "esri/graphic", "esri/tasks/Geoprocessor"], function (SpatialReference, Graphic, Geoprocessor) {

        let routesFeature = {
            "displayFieldName" : "",
            "fieldAliases" : {
                "FID" : "FID",
                "route_id" : "route_id"
            },
            "geometryType" : "esriGeometryPolyline",
            "spatialReference" : {
                "wkid" : 4326,
                "latestWkid" : 4326
            },
            "fields" : [
                {
                    "name" : "FID",
                    "type" : "esriFieldTypeOID",
                    "alias" : "FID"
                },
                {
                    "name" : "route_id",
                    "type" : "esriFieldTypeString",
                    "alias" : "route_id",
                    "length" : 254
                }
            ],
            "features" :newData
        };

        let Dis = {
            "distance": 500,
            "units": "esriMeters"
        };
        let busRouteFeatureSet = new esri.tasks.FeatureSet(routesFeature);
        busRouteFeatureSet.spatialReference = new SpatialReference({wkid: 4326});
        let gptask = new Geoprocessor("https://192.168.207.165:6443/arcgis/rest/services/GPTool/lineSingleBuffer/GPServer/lineSingleBuffer");
        let gpParams = {
            "Dis": Dis,
            "routes": busRouteFeatureSet
        };
        gptask.submitJob(gpParams, completeCallback, statusCallback);
        // 结果图加载
        function completeCallback(jobInfo) {
            // 未覆盖区域
            gptask.getResultData(jobInfo.jobId, "output_cover").then(function (value) {
                let outputData = ArcgisToGeojsonUtils.arcgisToGeoJSON(value.value);
                addMapLayer(outputData, 'singleCoverLayer', 'singleCoverSource');
                map.moveLayer('singleCoverLayer');
            });
            // 覆盖区域
            gptask.getResultData(jobInfo.jobId, "output_uncover").then(function (value) {
                let outputData = ArcgisToGeojsonUtils.arcgisToGeoJSON(value.value);
                addMapLayer(outputData, 'singleUnCoverLayer', 'singleUnCoverSource');
                map.moveLayer('singleUnCoverLayer');
            });

        }
    });
}



// 运行状态显示
function statusCallback(jobInfo) {
    console.log(jobInfo.jobStatus);
    // statusModel(jobInfo.jobStatus);
}
