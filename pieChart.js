    //动态饼状图
    const ctx = document.getElementById('myPieChart').getContext('2d');

    // 初始数据
    const initialData = {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
            data: [0.80, 0.13, 0.07], // 初始饼图数据
            backgroundColor: ['#9be6d2','#55b6a3', '#2c5351'],
        }]
    };

    // 数据集 - 各种状态下的饼图数据
    const pieChartsData = {
        positive: {
            data: [0.20, 0.24, 0.24,0.09,0.23],
            backgroundColor: ['#c2e1d1', '#9be6d2', '#55b6a3', '#2c5351', '#1f3e3b'],
            labels: ['Outdoor Activity', 'Scenery', 'Nature', 'Food', 'Children Activity'],
        },
        neutral: {
            data: [0.15, 0.16, 0.29,0.18,0.22],
            backgroundColor: ['#c2e1d1', '#9be6d2', '#55b6a3', '#2c5351', '#1f3e3b'],
            labels: ['Outdoor Activity', 'Scenery', 'Nature', 'Food', 'Children Activity'],
        },
        negative: {
            data: [0.12, 0.12, 0.45,0.11,0.20],
            backgroundColor: ['#c2e1d1', '#9be6d2', '#55b6a3', '#2c5351', '#1f3e3b'],
            labels: ['Outdoor Activity', 'Scenery', 'Nature', 'Food', 'Children Activity'],
        }
    };

    // 创建饼状图
    const sentimentPieChart = new Chart(ctx, {
        type: 'pie',
        data: JSON.parse(JSON.stringify(initialData)), //Deep Copy
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
            },
        }
    });
    // 添加点击事件处理函数
    function handleChartClick(event, elements) {
        if (elements.length > 0) {
            const clickedIndex = elements[0].index;
            const clickedLabel = sentimentPieChart.data.labels[clickedIndex];

            // 切换数据集
            let selectedDataset;
            if (clickedLabel === 'Positive') {
                selectedDataset = pieChartsData.positive;
            } else if (clickedLabel === 'Neutral') {
                selectedDataset = pieChartsData.neutral;
            } else if (clickedLabel === 'Negative') {
                selectedDataset = pieChartsData.negative;
            }

            // 更新饼图数据
            sentimentPieChart.data.datasets[0].data = selectedDataset.data;
            sentimentPieChart.data.datasets[0].backgroundColor = selectedDataset.backgroundColor;
            sentimentPieChart.data.labels = selectedDataset.labels;
            sentimentPieChart.update();

            // 显示详细信息
            const detailsDiv = document.getElementById('details');
            const detailsContent = document.getElementById('detailsContent');
            detailsDiv.style.display = 'block';
            detailsContent.innerHTML = `<strong>${clickedLabel} Details:</strong><br>${sentimentData[clickedLabel.toLowerCase()].join('<br>')}`;

            // 显示重置按钮
            const resetButton = document.getElementById('resetButton');
            resetButton.style.display = 'inline-block'; // 显示重置按钮
        }
    }
    // 在图表上绑定点击事件
    function addClickListener(chart) {
        // 清除旧的点击事件监听器
        chart.canvas.removeEventListener('click', chart.clickListener);

        chart.canvas.addEventListener('click', function (event) {
            const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
            handleChartClick(event, elements);
        });
        //装新的事件监听
        chart.canvas.addEventListener('click', chart.clickListener);
    };
    addClickListener(sentimentPieChart);

    // 重置按钮点击事件
    document.getElementById('resetButton').addEventListener('click', () => {
        // 更新图表数据而不是销毁
        sentimentPieChart.data = JSON.parse(JSON.stringify(initialData));  // 直接将数据重置为初始数据
        sentimentPieChart.update();  // 更新图表

        // 隐藏详细信息和重置按钮
        const detailsDiv = document.getElementById('details');
        const resetButton = document.getElementById('resetButton');
        detailsDiv.style.display = 'none';
        resetButton.style.display = 'none';

        // 重新绑定点击事件
        addClickListener(sentimentPieChart);  // 确保点击事件重新绑定
    })