let icon_config = [
    {
        "icon_path": './CSS/svg/add.png',
        "icon_id": 'add'
    },
    {
        "icon_path": './CSS/svg/remove.png',
        "icon_id": 'remove'
    },
    {
        "icon_path": './CSS/svg/warning.png',
        "icon_id": 'warning'
    },
    {
        "icon_path": './CSS/svg/station.png',
        "icon_id": 'normal'
    }
];

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
        "source_id": "originalFreSource",
        "source_title": "调整前的重复路段",
        "source_type": "geojson"
    },
    {
        "source_id": "modifiedFreSource",
        "source_title": "调整后的重复路段",
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
    },
    {
        "source_id": "stationSource",
        "source_title": "站点",
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
            "line-color": "#25A982",
            "line-opacity": 1,
            "line-width": 3
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
            "line-color": "#E2AF32",
            "line-opacity": 1,
            "line-width": 3
        },
        "layer_filter": null
    },
    {
        "layer_title": "调整前的重复路段",
        "layer_id": "originalFreLayer",
        "source_id": "originalFreSource",
        "layer_type": "line",
        "layer_layout": {
            "line-join": "round",
            "line-cap": "round",
            "visibility": "visible"
        },
        "layer_paint": {
            "line-color": "#d95159",
            "line-opacity": 1,
            "line-width": 3
        },
        "layer_filter": null
    },
    {
        "layer_title": "调整后的重复路段",
        "layer_id": "modifiedFreLayer",
        "source_id": "modifiedFreSource",
        "layer_type": "line",
        "layer_layout": {
            "line-join": "round",
            "line-cap": "round",
            "visibility": "visible"
        },
        "layer_paint": {
            "line-color": "#F2E5E7",
            "line-opacity": 1,
            "line-width": 3
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
            'fill-color': '#FF6F91',
            'fill-opacity': 0.8
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
            'fill-color': '#845EC2',
            'fill-opacity': 0.8
        },
        "layer_filter": null
    },
    {
        "layer_title": "站点",
        "layer_id": "stationLayer",
        "source_id": "stationSource",
        "layer_type": "symbol",
        "layer_layout": {
            "visibility": "visible",
            "icon-image": "{iconType}" ,
            "icon-size": 0.3,
        },
        "layer_paint": {
        },
        "layer_filter": null
    }
];

