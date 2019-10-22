let originalRouteList = []; //调整前的线路列表
let modifiedRouteList = []; //调整后的线路列表
let originalRouteId = null; //调整前获取到的线路ID
let modifiedRouteId = null; //调整后获取到的线路ID
let originalData; //调整前的线路原始数据
let modifiedData; //调整后的线路原始数据

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

//关闭提示框
$('.popupWrapper-header-close').click(function () {
    $('.popupWrapper').hide();
});

// 清空所有图层的选择
function setLayerNoSelect() {
    $('.layerWrapper-check-input').each(function () {
        $(this).prop("checked", false);
    })
}

// 添加图层控制框选择
function setLayerSelect(layerId) {
    let inputs = document.getElementsByName(layerId);
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].checked = true;
    }
}

// 获取线路数据,初始化线路选择框
function initSelect() {
    axios.get(url_get_original_list)
        .then(function (response) {
            if (response.status === 200) {
                originalData = response.data.Document.Data;
                // console.log(response.data.Document.Data);
                response.data.Document.Data.map(item => originalRouteList.push({
                    data: item.routeId,
                    value: `${item.routeName}（${item.routeDirection}）`
                }));
                // console.log(originalRouteList);
                getOriginalSearch();
            }
        });
    axios.get(url_get_modified_list)
        .then(function (response) {
            if (response.status === 200) {
                modifiedData = response.data.Document.Data;
                response.data.Document.Data.map(item => modifiedRouteList.push({
                    data: item.routeId,
                    value: `${item.routeName}（${item.routeDirection}）`
                }));
                // console.log(modifiedRouteList);
                getModifiedSearch();
            }
        });
}

// 调整前线路筛选
function getOriginalSearch() {
    $('#originalRoute').autocomplete({
        lookup: originalRouteList,
        width: 300,
        maxHeight: 300,
        autoSelectFirst: true,
        onHint: function () {
            let originalInputValue = $('#originalRoute').val();
            originalData.forEach(function (item) {
                if(item.routeName === originalInputValue) {
                    originalRouteId = item.routeId;
                    // console.log(item.routeName );
                } else {
                    originalRouteId = null;
                }
            });
        },
        onSelect: function (suggestion) {
            originalRouteId = suggestion.data;
            // console.log(originalRouteId);
        }
    });

}

// 调整后线路筛选
function getModifiedSearch() {
    $('#modifiedRoute').autocomplete({
        lookup: modifiedRouteList,
        width: 300,
        maxHeight: 300,
        autoSelectFirst: true,
        onHint: function () {
            let modifiedInputValue = $('#modifiedRoute').val();
            modifiedData.forEach(function (item) {
                if(item.routeName === modifiedInputValue) {
                    modifiedRouteId = item.routeId;
                    // console.log(item.routeName );
                } else {
                    modifiedRouteId = null;
                }
            });
        },
        onSelect: function (suggestion) {
            modifiedRouteId = suggestion.data;
            // console.log(modifiedRouteId);
        }

    });
}

// 获得选择线路数据,进行计算
function selectRoute() {
    let originalSelect = $('#originalRoute').val();
    // console.log(originalSelect);
    let modifiedSelect = $('#modifiedRoute').val();
    // console.log(modifiedSelect);

    if (originalSelect === "") {
        originalRouteId = null;
    } else {
    }

    if (modifiedSelect === "") {
        modifiedRouteId = null;
    } else {
    }

    if (originalRouteId === null && modifiedRouteId === null) {
        $('#popupWrapper-select').show();
    } else {
        let params = {
            routeId1: originalRouteId,
            routeId2: modifiedRouteId
        };
        console.log(params);
        getData(params);
    }
}
