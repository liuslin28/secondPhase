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
