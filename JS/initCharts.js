

function initDisChart(data) {
    // myChart.clear();
    let myChart = echarts.init(document.getElementById('chartWrapper'));

    let originalLen = data.originalDis.length;
    let modifiedLen = data.modifiedDis.length;
    let yAxisData;
    let seriesData = [];
    let maxLen = Math.max(originalLen, modifiedLen);
    if(originalLen>0 && modifiedLen>0) {
        yAxisData = ['调整前', '调整后'];
        for(let i=0; i<maxLen; i++) {
            let originalItem = data.originalDis[i]?data.originalDis[i]:null;
            let modifiedItem = data.modifiedDis[i]?data.modifiedDis[i]:null;
            let seriesItem = {
                name: i,
                type: 'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'insideRight'
                    }
                },
                data: [originalItem, modifiedItem]
            };
            seriesData.push(seriesItem);
        }
    } else {
        if(originalLen === 0) {
            yAxisData = ['调整后'];
            let i = 0;
            data.modifiedDis.forEach(function (item) {
                i += 1;
                let seriesItem = {
                    name: i,
                    type: 'bar',
                    stack: '总量',
                    label: {
                        normal: {
                            show: true,
                            position: 'insideRight'
                        }
                    },
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
                    name: i,
                    type: 'bar',
                    stack: '总量',
                    label: {
                        normal: {
                            show: true,
                            position: 'insideRight'
                        }
                    },
                    data: [item]
                };
                seriesData.push(seriesItem);
            })
        }
    }

    // 指定图表的配置项和数据
    let option = {

        grid: {
            left: '3%',
            right: '3%',
            bottom: '20%',
            top: '20%',
            height: '60%',
        },
        xAxis: {
            type: 'value'

        },
        yAxis: {
            type: 'category',
            data: yAxisData,
            boundaryGap: ['40%', '40%'],
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



