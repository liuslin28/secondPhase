function initDisChart(data) {
    let myChart = echarts.init(document.getElementById('chartWrapper'));

    let originalLen = data.originalDis.length;
    let modifiedLen = data.modifiedDis.length;
    let yAxisData;
    let seriesData = [];
    let maxLen = Math.max(originalLen, modifiedLen);
    if (originalLen > 0 && modifiedLen > 0) {
        yAxisData = ['调整前', '调整后'];
        for (let i = 0; i < maxLen; i++) {
            let originalItem = data.originalDis[i] ? data.originalDis[i] : null;
            let modifiedItem = data.modifiedDis[i] ? data.modifiedDis[i] : null;
            let seriesItem = {
                name: i + 1,
                type: 'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'insideRight',
                        fontSize: 8
                    }
                },
                tooltip: {
                    formatter: '第{a}站: {c}km'
                },
                barMaxWidth: 25,
                data: [originalItem, modifiedItem]
            };
            seriesData.push(seriesItem);
        }
    } else {
        if (originalLen === 0) {
            yAxisData = ['调整后'];
            let i = 0;
            data.modifiedDis.forEach(function (item) {
                i += 1;
                let seriesItem = {
                    name: i + 1,
                    type: 'bar',
                    stack: '总量',
                    label: {
                        normal: {
                            show: true,
                            position: 'insideRight'
                        }
                    },
                    tooltip: {
                        formatter: '第{a}站: {c}km'
                    },
                    barMaxWidth: 25,
                    data: [item]
                };
                seriesData.push(seriesItem);
            })
        } else {
            yAxisData = ['调整前'];
            let i = 0;
            data.originalDis.forEach(function (item) {
                i += 1;
                let seriesItem = {
                    name: i + 1,
                    type: 'bar',
                    stack: '总量',
                    label: {
                        normal: {
                            show: true,
                            position: 'insideRight'
                        }
                    },
                    tooltip: {
                        formatter: '第{a}站: {c}km'
                    },
                    barMaxWidth: 25,
                    data: [item]
                };
                seriesData.push(seriesItem);
            })
        }
    }

    // 指定图表的配置项和数据
    let option = {
        grid: {
            left: '5%',
            right: '3%',
            bottom: '20%',
            top: '20%'
        },
        tooltip: {
            show: true,
            trigger: 'item'
        },
        xAxis: {
            type: 'value',
            max: function (value) {
                return value.max;
            },
            axisLabel: {
                show: true,
                textStyle: {
                    color: '#dcdcdc'
                },
                formatter: function (v) {
                    return Math.ceil(v)//表示整数。其他数值类型以此类推
                }
            }
        },
        yAxis: {
            type: 'category',
            data: yAxisData,
            // y轴的字体样式
            axisLabel: {
                show: true,
                textStyle: {
                    color: '#dcdcdc'
                }
            }
        },
        series: seriesData
    };

// 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
}
