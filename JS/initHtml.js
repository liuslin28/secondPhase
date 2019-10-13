let originalRouteList = []; //调整前的线路列表
let modifiedRouteList = []; //调整后的线路列表
let originalRouteId = null; //调整前获取到的线路ID
let modifiedRouteId = null; //调整后获取到的线路ID

// 图层显示切换
$('.layerWrapper-check-input').click(function (e) {
    let inputTarget = e.target;
    let layerName = inputTarget.name;
    let checkValue = inputTarget.checked;
    let value;
    if (checkValue) {
        value = 'visible';
    } else {
        value = 'none';
    }
    layerVisibilityToggle(layerName, value)
});

// 清空所有图层的选择
function setLayerNoSelect() {
    $('.layerWrapper-check-input').each(function () {
        $(this).prop("checked", false);
    })
}

// 添加图层选择
function setLayerSelect(layerId) {
    let inputs = document.getElementsByName(layerId);
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].checked = true;
    }
}

// 获取线路数据,初始化线路选择框
function initSelect() {
    axios.get('./dataSample/routeData.json')
        .then(function (response) {
            if (response.status === 200) {
                response.data.data.map(item => originalRouteList.push({
                    data: item.routeId,
                    value: `${item.routeName}（${item.routeDirection}）`
                }));
                // console.log(originalRouteList);
                getOriginalSearch();
            }
        });
    axios.get('./dataSample/routeData.json')
        .then(function (response) {
            if (response.status === 200) {
                response.data.data.map(item => modifiedRouteList.push({
                    data: item.routeId,
                    value: `${item.routeName}（${item.routeDirection}）`
                }));
                // console.log(modifiedRouteList);
                getModifiedSearch();
            }
        });
}

function getOriginalSearch() {
    $('#originalRoute').autocomplete({
        lookup: originalRouteList,
        width: 300,
        onSelect: function (suggestion) {
            originalRouteId = suggestion.data;
            // console.log(originalRouteId);
        }
    });

}

function getModifiedSearch() {
    $('#modifiedRoute').autocomplete({
        lookup: modifiedRouteList,
        width: 300,
        onSelect: function (suggestion) {
            modifiedRouteId = suggestion.data;
            // console.log(modifiedRouteId);
        }

    });
}

// 获得选择线路数据,进行计算
function selectRoute() {
    if ($('#originalRoute').val() === "") {
        originalRouteId = null;
    } else {
    }

    if($('#modifiedRoute').val() === "") {
        modifiedRouteId = null;
    } else {
    }

    let params = {
        routeId1: originalRouteId,
        routeId2: modifiedRouteId
    };
    // console.log(params);
    getData(params);
}
