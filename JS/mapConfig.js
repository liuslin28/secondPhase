let source_layer_config = [
    {
        "source_id": "originalSource",
        // "source_path": "./geojsonData/stopsPoint2.json",
        "source_title": "原始的公交线路",
        "source_type": "geojson"
    },
    {
        "source_id": "modifiedSource",
        // "source_path": "./geojsonData/centerPolygon.json",
        "source_title": "修改的公交线路",
        "source_type": "geojson"
    }
];


let map_layer_config = [

    {
        "layer_title": "原始的公交线路",
        "layer_id": "originalRouteLayer",
        "source_id": "originalSource",
        "layer_type": "line",
        "layer_layout": {
            "line-join": "round",
            "line-cap": "round",
            "visibility": "visible"
        },
        "layer_paint": {
            "line-color": "#e97f4c",
            "line-opacity": 1,
            "line-width": 2
        },
        "layer_filter": null
    },
    {
        "layer_title": "修改的公交线路",
        "layer_id": "modifiedRouteLayer",
        "source_id": "modifiedSource",
        "layer_type": "line",
        "layer_layout": {
            "line-join": "round",
            "line-cap": "round",
            "visibility": "visible"
        },
        "layer_paint": {
            "line-color": "#e952c9",
            "line-opacity": 1,
            "line-width": 2
        },
        "layer_filter": null
    }
];

