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
        $(this).prop("checked",false);
     })
}

// 添加图层选择
function setLayerSelect(layerId) {
    let inputs = document.getElementsByName(layerId);
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].checked = true;
    }
}
