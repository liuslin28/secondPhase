let source_layer_config = [
    {
        "source_id": "originalSource",
        "source_title": "调整前的公交线路",
        "source_type": "geojson"
    },
    {
        "source_id": "modifiedSource",
        "source_title": "调整后的公交线路",
        "source_type": "geojson"
    },
    {
        "source_id": "originalLaneSource",
        "source_title": "调整前的公交专用道",
        "source_type": "geojson"
    },
    {
        "source_id": "modifiedLaneSource",
        "source_title": "调整后的公交专用道",
        "source_type": "geojson"
    },
    {
        "source_id": "doubleAddSource",
        "source_title": "增加的覆盖区域",
        "source_type": "geojson"
    },
    {
        "source_id": "doubleMinSource",
        "source_title": "减少的覆盖区域",
        "source_type": "geojson"
    }
];


let map_layer_config = [
    {
        "layer_title": "调整前的公交线路",
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
        "layer_title": "调整后的公交线路",
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
        "layer_title": "调整前的公交专用道",
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
        "layer_title": "调整后的公交专用道",
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
        "layer_title": "增加的覆盖区域",
        "layer_id": "doubleAddLayer",
        "source_id": "doubleAddSource",
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
        "layer_title": "减少的覆盖区域",
        "layer_id": "doubleMinLayer",
        "source_id": "doubleMinSource",
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

