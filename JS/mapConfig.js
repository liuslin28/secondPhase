let source_layer_config = [
    {
        "source_id": "originalSource",
        "source_title": "原始的公交线路",
        "source_type": "geojson"
    },
    {
        "source_id": "modifiedSource",
        "source_title": "修改的公交线路",
        "source_type": "geojson"
    },
    {
        "source_id": "originalLaneSource",
        "source_title": "原始的公交专用道",
        "source_type": "geojson"
    },
    {
        "source_id": "modifiedLaneSource",
        "source_title": "修改的公交专用道",
        "source_type": "geojson"
    },
    {
        "source_id": "singleCoverSource",
        "source_title": "单线路的覆盖",
        "source_type": "geojson"
    },
    {
        "source_id": "singleUnCoverSource",
        "source_title": "单线路的未覆盖",
        "source_type": "geojson"
    },
    {
        "source_id": "bothCoverSource",
        "source_title": "双线路的覆盖",
        "source_type": "geojson"
    },
    {
        "source_id": "bothUnCoverSource",
        "source_title": "双线路的未覆盖",
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
            "line-color": "#34a4ff",
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
            "line-color": "#e95db5",
            "line-opacity": 1,
            "line-width": 2
        },
        "layer_filter": null
    },
    {
        "layer_title": "原始的公交专用道",
        "layer_id": "originalLaneLayer",
        "source_id": "originalLaneSource",
        "layer_type": "line",
        "layer_layout": {
            "line-join": "round",
            "line-cap": "round",
            "visibility": "visible"
        },
        "layer_paint": {
            "line-color": "#d8d90e",
            "line-opacity": 1,
            "line-width": 2
        },
        "layer_filter": null
    },
    {
        "layer_title": "修改的公交专用道",
        "layer_id": "modifiedLaneLayer",
        "source_id": "modifiedLaneSource",
        "layer_type": "line",
        "layer_layout": {
            "line-join": "round",
            "line-cap": "round",
            "visibility": "visible"
        },
        "layer_paint": {
            "line-color": "#e9701c",
            "line-opacity": 1,
            "line-width": 2
        },
        "layer_filter": null
    },
    {
        "layer_title": "单线路的覆盖",
        "layer_id": "singleCoverLayer",
        "source_id": "singleCoverSource",
        "layer_type": "fill",
        "layer_layout": {
            "visibility": "visible"
        },
        "layer_paint": {
            'fill-color': '#79ada9',
            'fill-opacity': 0.2
        },
        "layer_filter": null
    },
    {
        "layer_title": "单线路的未覆盖",
        "layer_id": "singleUnCoverLayer",
        "source_id": "singleUnCoverSource",
        "layer_type": "fill",
        "layer_layout": {
            "visibility": "visible"
        },
        "layer_paint": {
            'fill-color': '#8ead59',
            'fill-opacity': 0.2
        },
        "layer_filter": null
    },
    {
        "layer_title": "双线路的覆盖",
        "layer_id": "bothCoverLayer",
        "source_id": "bothCoverSource",
        "layer_type": "fill",
        "layer_layout": {
            "visibility": "visible"
        },
        "layer_paint": {
            'fill-color': '#79ada9',
            'fill-opacity': 0.2
        },
        "layer_filter": null
    },
    {
        "layer_title": "双线路的未覆盖",
        "layer_id": "bothUnCoverLayer",
        "source_id": "bothUnCoverSource",
        "layer_type": "fill",
        "layer_layout": {
            "visibility": "visible"
        },
        "layer_paint": {
            'fill-color': '#8ead59',
            'fill-opacity': 0.2
        },
        "layer_filter": null
    }
];

