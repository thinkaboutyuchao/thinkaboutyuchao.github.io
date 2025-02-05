// 自定义地图样式
const mapStyle = [
    {
        "featureType": "poi",
        "elementType": "labels.icon",
        "stylers": [{"visibility": "off"}]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text",
        "stylers": [{"visibility": "off"}]
    },
    {
        "featureType": "poi.business",
        "stylers": [{"visibility": "off"}]
    },
    {
        "featureType": "poi.medical",
        "stylers": [{"visibility": "off"}]
    },
    {
        "featureType": "poi.school",
        "stylers": [{"visibility": "off"}]
    },
    {
        "featureType": "poi.sports_complex",
        "stylers": [{"visibility": "off"}]
    },
    {
        "featureType": "transit",
        "stylers": [{"visibility": "off"}]
    },
    {
        "featureType": "all",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#e0e0e0"}]  // 全局浅灰色背景，稍微加深
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#b0c4c6"}]  // 浅灰蓝色水体，稍微加深
    },
    {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#d0d0d0"}]  // 灰白色地形，稍微加深
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#d3e0e7"}]  // 浅绿色调的公园区域，稍微加深
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{"color": "#f0f0f0"}]  // 道路白色，稍微加深
    },
    {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [{"visibility": "off"}]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{"color": "#888888"}]  // 道路标签灰色，加深
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [{"color": "#b0b0b0"}]  // 行政边界淡灰色，稍微加深
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {"color": "#6b3e3e"},  // 深红色
            {"weight": 4}         // 边界线宽度
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "geometry.stroke",
        "stylers": [
            {"color": "#6b3e3e"},  // 深红色
            {"weight": 4},        // 边界线宽度
            {"visibility": "on"}  // 确保可见性
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.icon",
        "stylers": [{"visibility": "off"}]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{"color": "#8a8a8a"}]  // 标签文本灰色，加深
    },
];

// 初始变量
let pointLayer = [];
let polygonLayer = [];
const zoomThreshold = 14; // 定义切换数据的缩放阈值
// 定义 Sentiment 多边形图层数组
let sentimentPolygonLayer = [];
// 全局声明热力图变量
let heatmapREQI;
let heatmapSS;
//heatmap color
const gradientHeat = [
    'rgba(0, 255, 255, 0)', 'rgba(0, 255, 255, 1)', 'rgba(0, 191, 255, 1)', 
    'rgba(0, 127, 255, 1)', 'rgba(0, 63, 255, 1)', 'rgba(0, 0, 255, 1)', 
    'rgba(63, 0, 255, 1)', 'rgba(127, 0, 255, 1)', 'rgba(191, 0, 255, 1)', 
    'rgba(255, 0, 255, 1)', 'rgba(255, 0, 191, 1)', 'rgba(255, 0, 127, 1)', 
    'rgba(255, 0, 63, 1)', 'rgba(255, 0, 0, 1)' // 红色
];

// 时间标签配置
const timeLabels = {
    0: 'Pre-2020',
    1: '2020',
    2: '2021',
    3: '2022',
    4: '2023',
    5: '2024'
};
// 初始化滑块
const slider = document.getElementById('slider');
noUiSlider.create(slider, {
    start: 0,
    snap: true,
    connect: 'lower',
    range: {
        'min': [0],
        '20%': [1],
        '40%': [2],
        '60%': [3],
        '80%': [4],
        'max': [5]
    }
});
// 创建节点标记和连接线
const points = [0, 1, 2, 3, 4, 5];
const sliderTrack = slider.querySelector('.noUi-base');

points.forEach((point, index) => {
    // 创建连接线（在节点之前创建）
    if (index < points.length - 1) {
        const connector = document.createElement('div');
        connector.className = 'point-connector';
        connector.style.left = index === 0 ? '0%' : (index * 20) + '%';
        sliderTrack.appendChild(connector);
    }

    // 创建节点
    const dot = document.createElement('div');
    dot.className = 'slider-point';
    
    // 调整第一个和最后一个节点的位置
    if (index === 0) {
        dot.style.left = '0%';
    } else if (index === points.length - 1) {
        dot.style.left = '100%';
    } else {
        dot.style.left = (index * 20) + '%';
    }

    // 创建标签
    const label = document.createElement('div');
    label.className = 'slider-label';
    
    // 为第一个和最后一个标签添加特殊类
    if (index === 0) {
        label.classList.add('first-label');
    } else if (index === points.length - 1) {
        label.classList.add('last-label');
    }
    
    label.textContent = timeLabels[point];
    dot.appendChild(label);
    sliderTrack.appendChild(dot);
});

//sentimentdata配置
const sentimentProperties = {
    0: "Sentiment <2020",
    1: "Sentiment 2020",
    2: "Sentiment 2021",
    3: "Sentiment 2022",
    4: "Sentiment 2023",
    5: "Sentiment 2024"
};
//全局变量，用于解决updatesentimentdata作用域问题
let globalReqiHeader = []; 
let globalMatchingReqiRows = [];



//加载数据
function initMap() {
    const singapore = { lat: 1.3521, lng: 103.8198 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: singapore,
        styles: mapStyle
    });

    // 添加图层控制面板
    const layerControl = document.createElement('div');
    layerControl.className = 'layer-control';
    layerControl.innerHTML = `
        <img src="images/Layer.jpg" class="layer-icon" id="layerManager" title="Layer Manager" onclick="togglePointLayer()">
        <div id="layerPanel" style="display: none;">
            <label><input type="checkbox" onchange="toggleLayer('points', this.checked)" checked> Points</label><br>
            <label><input type="checkbox" id="PolyToggle" onchange="toggleLayer('polygons', this.checked)" checked>ReqiPoly</label><br>
            <label><input type="checkbox" id="SentimentPolyToggle" onchange="toggleLayer('sentiment', this.checked)">SentPoly</label><br>
            <label><input type="checkbox" id="heatmapToggle" onchange="toggleHeatmap('REQI',this.checked)"> REQI</label><br>
            <label><input type="checkbox" id="heatmapToggle1" onchange="toggleHeatmap('Sentiment',this.checked)"> Sentiment</label><br>
        </div>
    `;
    // map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(layerControl);
    document.getElementById('map').appendChild(layerControl); // 直接添加到地图容器


    // 加载点数据
    loadPointData();
    // 加载REQI面数据
    loadPolygonData();

    // 添加REQI图例
    addREQILegend();
    // 添加Semtiment图例
    addSentimentLegend()
    //给图层添加点击事件
    const togglePoints = document.getElementById('layerManager');
    togglePoints.addEventListener('click', toggleLayerControl);
    
    // 监听缩放事件
    map.addListener('zoom_changed', () => {
        const currentZoom = map.getZoom();
        toggleLayers(currentZoom);
    });

}

// 添加滑块监听事件
slider.noUiSlider.on('update', function(values, handle) {
    const selectedValue = Math.round(parseFloat(values[handle]));
    
    // 更新评论显示
    displayReviews(selectedValue);
    
    // 更新滑块下方显示的年份标签
    const sliderValue = document.getElementById('slider-value');
    if (sliderValue) {
        sliderValue.textContent = timeLabels[selectedValue];
    }

    // 更新 Sentiment 多边形颜色
    updateSentimentPolygons(selectedValue);

    // 根据滑块值更新 Sentiment 数据
    updateSentimentData(selectedValue); 
});

function toggleLayerControl() {
    console.log('Layer control toggled'); // 调试信息
    const layerPanel = document.getElementById('layerPanel');
    layerPanel.style.display = layerPanel.style.display === 'none' ? 'block' : 'none';
}

//toggleLayer
function toggleLayer(layerType, isChecked) {
    if (layerType === 'points') {
        toggleMarkers(isChecked);
    }else if(layerType === 'polygons'){
        togglePolygons(isChecked);
        // 控制图例显示或隐藏
        toggleREQILegend(isChecked);
    }else if (layerType === 'sentiment') {  // 处理 sentiment 多边形
        if (isChecked) {
            // 如果还未加载数据，则加载
            if (sentimentPolygonLayer.length === 0) {
                loadSentimentData();
            } else {
                toggleSentimentPolygons(true);
            }
            //控制sentiment图例的显隐
            toggleSentimentLegend(isChecked);
        } else {
            toggleSentimentPolygons(false);
            toggleSentimentLegend(false);  // 隐藏图例
        }
    }
}

//Point
function loadPointData() {
    fetch('data/Parks_points.geojson')
        .then(response => response.json())
        .then(data => {
            data.features.forEach(feature => {
                const latlng = { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] };
                const marker = new google.maps.Marker({
                    position: latlng,
                    map: map,
                    title: feature.properties.name_1,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE, // 使用内置符号（例如圆形）
                        scale: 9, // 设置符号的大小
                        fillColor: 'red', // 设置填充颜色
                        fillOpacity: 0.6, // 设置填充透明度
                        strokeColor: 'white', // 设置边框颜色
                        strokeWeight: 2 // 设置边框宽度
                    },
                    zIndex: 16
                });
                pointLayer.push(marker); // 保存标记以便于后续操作

                // 每个marker的点击事件：显示详细信息
                marker.addListener('click', () => {
                    displayParkDetails(feature.properties.name_1);
                    // 将地图中心设置为marker位置，并调整缩放级别
                    map.setCenter(marker.getPosition());
                    map.setZoom(14); // 设置合适的缩放级别
                    //将slider回归0索引
                    slider.noUiSlider.set(0);
                });

            });
        });
}

function toggleMarkers(isChecked) {
    pointLayer.forEach(marker => {
        marker.setMap(isChecked ? map : null);
    });
}

// 加载REQI多边形数据
function loadPolygonData() {
    fetch('data/Parks_polygons.geojson')
        .then(response => response.json())
        .then(data => {
            data.features.forEach(feature => {
                const geometryType = feature.geometry.type;
                if (geometryType === "Polygon") {
                    const coordinates = feature.geometry.coordinates[0].map(coord => {
                        return { lat: coord[1], lng: coord[0] };
                    });
                    createPolygon(coordinates, feature, 12, 'reqi'); // 指定图层类型为'reqi'
                } else if (geometryType === "MultiPolygon") {
                    feature.geometry.coordinates.forEach(polygonCoords => {
                        const coordinates = polygonCoords[0].map(coord => {
                            return { lat: coord[1], lng: coord[0] };
                        });
                        createPolygon(coordinates, feature, 12, 'reqi'); // 指定图层类型为'reqi'
                    });
                }
            });
        })
        .catch(error => console.error("Error loading GeoJSON:", error));
}
// 切换REQI多边形显示
function togglePolygons(isChecked) {
    polygonLayer.forEach(polygon => {
        polygon.setMap(isChecked ? map : null);
    });
}
// 创建和显示多边形的函数
function createPolygon(coordinates, feature) {
    const polygon = new google.maps.Polygon({
        paths: coordinates,
        strokeColor: 'green',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: getColor(feature.properties.REQI_HaveLST),
        fillOpacity: 0.9,
        map: map
    });
    polygonLayer.push(polygon); // 保存多边形以便于后续操作

    // 每个marker的点击事件：显示详细信息
    polygon.addListener('click', () => {
        displayParkDetails(feature.properties.name_1);
    });
}
function getColor(reqi) {
    return reqi > 0.395 ? '#1f4b4b' :  // 更深的绿色偏暖
            reqi > 0.283 ? '#3e9a7d' :  // 中等绿色偏暖
            reqi > 0.187 ? '#65c2b1' :  // 更浅的绿色偏暖
            reqi > 0.09 ?  '#88e1d5' :  // 更浅的绿色偏暖
                            '#e3f7f5';    // 极浅的柔和蓝绿色
}

// 加载 Sentiment 多边形数据
function loadSentimentData() {
    fetch('data/Parks_polygons_sentiment.geojson')
        .then(response => response.json())
        .then(data => {
            data.features.forEach(feature => {
                const geometryType = feature.geometry.type;
                if (geometryType === "Polygon") {
                    const coordinates = feature.geometry.coordinates[0].map(coord => ({
                        lat: coord[1], lng: coord[0]
                    }));
                    const polygon = createSentimentPolygon(coordinates, feature);
                    sentimentPolygonLayer.push(polygon);  // 存入数组
                } else if (geometryType === "MultiPolygon") {
                    feature.geometry.coordinates.forEach(polygonCoords => {
                        const coordinates = polygonCoords[0].map(coord => ({
                            lat: coord[1], lng: coord[0]
                        }));
                        const polygon = createSentimentPolygon(coordinates, feature);
                        sentimentPolygonLayer.push(polygon);  // 存入数组
                    });
                }
            });

            // 添加所有多边形到地图
            sentimentPolygonLayer.forEach(polygon => {
                polygon.setMap(map);  // 显示在地图上
            });
        })
        .catch(error => console.error("Error loading GeoJSON:", error));
}

// 切换 Sentiment 多边形显示
function toggleSentimentPolygons(isChecked) {
    sentimentPolygonLayer.forEach(polygon => {
        polygon.setMap(isChecked ? map : null);  // 根据勾选状态控制可见性
    });
}
// 获取 Sentiment 多边形颜色
function getSentimentColor(sentiment) {
    const sentimentValue = parseFloat(sentiment);
    if (sentimentValue === -999) return '#F08080'; // 无数据时显示灰色
    
    return sentimentValue > 7 ? '#8B0000' :  // 最高情感分数：深红
           sentimentValue > 4 ? '#B22222' :  // 较高情感分数：火砖红
           sentimentValue > 0 ? '#DC143C' :  // 中等情感分数：胭脂红
                                  '#F08080';   // 较低情感分数：浅红
}
// 创建并绘制情感多边形的函数
function createSentimentPolygon(coordinates, feature) {
    // 获取当前滑块值（确保滑块已初始化）
    let currentIndex = Math.round(parseFloat(slider.noUiSlider.get()));
    let propertyName = sentimentProperties[currentIndex];
    let sentimentValue = feature.properties[propertyName];
    const color = getSentimentColor(sentimentValue);  // 根据情感值获取颜色

    // 创建多边形
    const polygon = new google.maps.Polygon({
        paths: coordinates,
        strokeColor: '#F08080',  // 边框颜色
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,  // 填充颜色
        fillOpacity: 0.7,
        clickable: false,
        map: map  // 初始显示在地图上
    });

    // 存储整个属性对象，便于后续更新时使用
    polygon.set('data', feature.properties);

    return polygon;
}
//根据滑块滑动更改配色
function updateSentimentPolygons(selectedIndex) {
    const propertyName = sentimentProperties[selectedIndex];
    sentimentPolygonLayer.forEach(polygon => {
        // 从 polygon 存储的数据中获取当前属性值
        const properties = polygon.get('data');
        let sentimentValue = properties[propertyName];
        let newColor = getSentimentColor(sentimentValue);
        polygon.setOptions({
            fillColor: newColor
        });
    });
}


function toggleHeatmap(layerType, isChecked){
    if (layerType === 'REQI') {
        toggleHeatmapR(isChecked);
    }else if(layerType === 'Sentiment'){
        toggleHeatmapS(isChecked);
    }
    toggleHeatmapLegend();
};
// 控制热力图显示或隐藏
function toggleHeatmapR(isChecked) {
    if (isChecked) {
        if (!heatmapREQI) {
            // 如果热力图数据还没有加载，先加载
            fetch('data/REQI_HeatMap.geojson')
                .then(response => response.json())
                .then(data => {
                    const heatmapData = data.features.map(feature => {
                        const coords = feature.geometry.coordinates;
                        return {
                            location: new google.maps.LatLng(coords[1], coords[0]),
                            weight: feature.properties.REQI_HaveLST
                        };
                    });
                    heatmapREQI = new google.maps.visualization.HeatmapLayer({
                        data: heatmapData,
                        map: map,  // 显示在地图上
                        radius: 20,
                        gradient: gradientHeat,
                        zIndex: 20  // 设置较高的 zIndex 使热力图位于顶部
                    });
                })
                .catch(error => console.error('Error loading heatmap data:', error));
        } else {
            heatmapREQI.setMap(map);  // 显示热力图
            heatmapREQI.setOptions({ zIndex: 20 });
        }
    } else {
        if (heatmapREQI) {
            heatmapREQI.setMap(null);  // 隐藏热力图
        }
    }
}
function toggleHeatmapS(isChecked) {
    if (isChecked) {
        if (!heatmapSS) {
            // 如果热力图数据还没有加载，先加载
            fetch('data/Sentiment_HeatMap.geojson')
                .then(response => response.json())
                .then(data => {
                    const heatmapData1 = data.features.map(feature => {
                        const coords = feature.geometry.coordinates;
                        return {
                            location: new google.maps.LatLng(coords[1], coords[0]),
                            weight: feature.properties.SentimentScore
                        };
                    });
                    heatmapSS = new google.maps.visualization.HeatmapLayer({
                        data: heatmapData1,
                        map: map,  // 显示在地图上
                        radius: 20,
                        gradient: gradientHeat,
                        zIndex: 20  // 设置较高的 zIndex 使热力图位于顶部
                    });
                })
                .catch(error => console.error('Error loading heatmap data:', error));
        } else {
            heatmapSS.setMap(map);  // 显示热力图
            heatmapSS.setOptions({ zIndex: 20 });
        }
    } else {
        if (heatmapSS) {
            heatmapSS.setMap(null);  // 隐藏热力图
        }
    }
}

//缩放图层控制
function toggleLayers(currentZoom) {
    const showPoints = document.querySelector('input[type="checkbox"][onchange*="points"]').checked;
    const showPolygons = document.querySelector('input[type="checkbox"][onchange*="polygons"]').checked;

        // 处理点图层的显示状态
        if (showPoints) {
            pointLayer.forEach(marker => marker.setMap(map)); // 显示点层
        } else {
            pointLayer.forEach(marker => marker.setMap(null)); // 隐藏点层
        }

        // 处理多边形图层的显示状态
        if (currentZoom < zoomThreshold) {
            // 如果缩放级别低于阈值，强制隐藏多边形图层
            polygonLayer.forEach(polygon => polygon.setMap(null)); // 隐藏面层
        } else {
            // 如果缩放级别高于或等于阈值，根据复选框状态显示或隐藏多边形图层
            if (showPolygons) {
                polygonLayer.forEach(polygon => polygon.setMap(map)); // 显示面层
            } else {
                polygonLayer.forEach(polygon => polygon.setMap(null)); // 隐藏面层
            }
        }
}

// 加载CSV文件并显示对应公园信息
function displayParkDetails(parkName) {
    // 加载第一个CSV文件
    fetch('data/parks_ReqiSentiments.csv')
        .then(response => response.text())
        .then(reqiText => {
            const reqiRows = reqiText.split('\n').map(row => row.split(','));
            globalReqiHeader = reqiRows[0];  // 保存到全局变量
            const nameIndex = globalReqiHeader.indexOf("name_1");
            const googleRatingIndex = globalReqiHeader.indexOf("Google Rating");
            const reqiHaveLSTIndex = globalReqiHeader.indexOf("REQI_haveLST");

            // 筛选数据并保存到全局变量
            globalMatchingReqiRows = reqiRows.slice(1).filter(row => row[nameIndex] === parkName);
            const parkDetailsContainer = document.getElementById('parkDetails');
            parkDetailsContainer.innerHTML = ""; // 清空上次内容

            //sentimentscore变量
            let selectedYear = 0; // 默认选最新年份
            let sentimentColumn = sentimentProperties[selectedYear];
            let sentimentScoreIndex = globalReqiHeader.indexOf(sentimentColumn);

            if (globalMatchingReqiRows.length > 0) {
                // 显示基本信息
                const parkNameItem = document.createElement('p');
                parkNameItem.innerHTML = `<strong>Park Name:</strong> ${globalMatchingReqiRows[0][nameIndex]}`;
                parkDetailsContainer.appendChild(parkNameItem);

                const ratingItem = document.createElement('p');
                ratingItem.innerHTML = `<strong>Google Review Rating:</strong> ${globalMatchingReqiRows[0][googleRatingIndex]}`;
                parkDetailsContainer.appendChild(ratingItem);

                const reqiItem = document.createElement('p');
                reqiItem.innerHTML = `<strong>REQI:</strong> ${globalMatchingReqiRows[0][reqiHaveLSTIndex]}`;
                parkDetailsContainer.appendChild(reqiItem);

                const sentimentScoreItem = document.createElement('p');
                sentimentScoreItem.id = 'sentimentScoreItem';  // 添加ID
                const shortLabel = sentimentColumn.replace('Sentiment ', '');
                sentimentScoreItem.innerHTML = `<strong>Sentiment Score (${shortLabel}):</strong> ${globalMatchingReqiRows[0][sentimentScoreIndex] || "N/A"}`;
                parkDetailsContainer.appendChild(sentimentScoreItem);
            } else {
                parkDetailsContainer.innerText = "No REQI information available.";
                return;
            }

            // 加载第二个CSV文件
            fetch('data/parks_reviews.csv')
            .then(response => response.text())
            .then(reviewText => {
                const reviewRows = reviewText.split('\n').map(row => {
                    // 处理引号和逗号的问题
                    const matches = row.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
                    return matches ? matches.map(m => m.replace(/^"|"$/g, '').trim()) : [];
                });
                
                const reviewHeader = reviewRows[0].map(header => header.trim());
                const reviewNameIndex = reviewHeader.indexOf("place_name");
                const reviewsIndex = reviewHeader.indexOf("review_text");
                const sentimentScoreIndex = reviewHeader.indexOf("SentimentScore");
                const adjustedLabelIndex = reviewHeader.indexOf("AdjustedLabel");
                const publishedDateIndex = reviewHeader.indexOf("published_at_date");
                
                if (reviewNameIndex === -1 || reviewsIndex === -1 ||
                    sentimentScoreIndex === -1 || adjustedLabelIndex === -1 || 
                    publishedDateIndex === -1) {
                    console.error("CSV file is missing required columns.");
                    return;
                }

                // 获取特定公园的评论
                const matchingReviewRows = reviewRows.slice(1)
                    .filter(row => row[reviewNameIndex]?.trim() === parkName);

                // 存储匹配的评论数据用于年份筛选
                window.reviewData = {
                    matchingReviews: matchingReviewRows,
                    indices: {
                        reviewName: reviewNameIndex,
                        reviews: reviewsIndex,
                        sentimentScore: sentimentScoreIndex,
                        adjustedLabel: adjustedLabelIndex,
                        publishedDate: publishedDateIndex
                    }
                };

                // 初始显示所有评论
                displayReviews(0); // 默认显示 Pre-2020
            })
            .catch(error => console.error("Error fetching CSV file:", error));
        });
}

// 更新 Sentiment 数据的函数
function updateSentimentData(selectedYear) {
    if (!globalReqiHeader.length || !globalMatchingReqiRows.length) {
        console.error("REQI data is not available yet.");
        return;
    }

    const sentimentProperty = sentimentProperties[selectedYear]; // 获取对应年份的列名
    const sentimentScoreIndex = globalReqiHeader.indexOf(sentimentProperty);

    if (sentimentScoreIndex === -1) {
        console.error(`Sentiment score column not found for year: ${selectedYear}`);
        return;
    }

    const parkDetailsContainer = document.getElementById('parkDetails');
    
    // 查找已有的 Sentiment Score 项目
    let sentimentScoreItem = document.getElementById('sentimentScoreItem');

    // 处理标签名，去掉 "Sentiment "
    const shortLabel = sentimentProperty.replace('Sentiment ', '');

    if (sentimentScoreItem) {
        sentimentScoreItem.innerHTML = `<strong>Sentiment Score (${shortLabel}):</strong> ${globalMatchingReqiRows[0][sentimentScoreIndex] || "N/A"}`;
    } else {
        sentimentScoreItem = document.createElement('p');
        sentimentScoreItem.id = 'sentimentScoreItem';
        sentimentScoreItem.innerHTML = `<strong>Sentiment Score (${shortLabel}):</strong> ${globalMatchingReqiRows[0][sentimentScoreIndex] || "N/A"}`;
        parkDetailsContainer.appendChild(sentimentScoreItem);
    }
}


// 添加更新评论的函数
function displayReviews(selectedYear) {
    const parkDetails = document.getElementById('parkDetails');
    if (!parkDetails || !window.reviewData) return;

    // 移除现有的评论部分
    const existingReviews = parkDetails.querySelectorAll('.reviews-section');
    existingReviews.forEach(section => section.remove());

    const reviewSection = document.createElement('div');
    reviewSection.className = 'reviews-section';
    reviewSection.innerHTML = `<strong>Reviews:</strong>`;

    const { matchingReviews, indices } = window.reviewData;
    
    if (matchingReviews.length > 0) {
        matchingReviews.forEach(row => {
            let sentimentScore = row[indices.sentimentScore]?.trim();
            let sentimentLabel = row[indices.adjustedLabel]?.trim() || "Neutral";
            let review = row[indices.reviews]?.trim();
            let publishedDate = row[indices.publishedDate]?.trim();

            // 修改年份筛选逻辑
            const reviewYear = new Date(publishedDate).getFullYear();
            let showReview = false;

            switch(selectedYear) {
                case 0: // Pre-2020
                    showReview = reviewYear < 2020;
                    break;
                case 1: // 2020
                    showReview = reviewYear === 2020;
                    break;
                case 2: // 2021
                    showReview = reviewYear === 2021;
                    break;
                case 3: // 2022
                    showReview = reviewYear === 2022;
                    break;
                case 4: // 2023
                    showReview = reviewYear === 2023;
                    break;
                case 5: // 2024
                    showReview = reviewYear === 2024;
                    break;
            }

            if (showReview) {
                // 过滤异常格式评论
                if (review && !/^\(\d+\.?\d*\)$/.test(review) &&
                    !/^\(\d+\.?\d*\) /.test(review) && !/\) \(/.test(review)) {
                    const reviewParagraph = document.createElement('p');
                    reviewParagraph.textContent = sentimentScore && !isNaN(parseFloat(sentimentScore))
                        ? `(${sentimentLabel}) (${parseFloat(sentimentScore).toFixed(2)}) ${review}`
                        : `(${sentimentLabel}) ${review}`;
                    reviewSection.appendChild(reviewParagraph);
                }
            }
        });

        // 如果该年份没有评论，显示提示信息
        if (!reviewSection.querySelectorAll('p').length) {
            reviewSection.innerHTML += `<p>No reviews available for ${timeLabels[selectedYear]}.</p>`;
        }
    } else {
        reviewSection.innerHTML += "<p>No reviews available.</p>";
    }

    parkDetails.appendChild(reviewSection);
}


//切换隐藏图例
// 切换REQI图例显示/隐藏
function toggleREQILegend(isChecked) {
    const reqiLegend = document.getElementById('REQILegend'); // 获取图例元素
    
    // 只要 PolyToggle 被选中，显示图例；否则，隐藏
    if (isChecked) {
        reqiLegend.style.display = 'block';
    } else {
        reqiLegend.style.display = 'none';
    }
}
//切换隐藏sentiment图层图例
function toggleSentimentLegend(isChecked) {
    const sentimentLegend  = document.getElementById('SentimentLegend'); // 获取图例元素
    
    // 只要 PolyToggle 被选中，显示图例；否则，隐藏
    if (isChecked) {
        sentimentLegend.style.display = 'block';
    } else {
        sentimentLegend.style.display = 'none';
    }
}
// 切换热力图图例显示/隐藏
function toggleHeatmapLegend() {
    const legend = document.getElementById('heatmapLegend');
    
    // 检查热力图复选框的状态
    const heatmapChecked = document.getElementById('heatmapToggle').checked || document.getElementById('heatmapToggle1').checked;

    // 如果任一热力图复选框被选中，显示图例；否则隐藏
    legend.style.display = heatmapChecked ? 'block' : 'none';   
}

//添加图例
//添加REQI图例
function addREQILegend() {
    const legendReqi = document.createElement('div');
    legendReqi.id = 'REQILegend';  // 设置ID以便控制显示隐藏
    legendReqi.className = 'legend legend-reqi';

    const legendContent = `
        <h3>REQI Index</h3>
        <div><div class="legend-color" style="background: #1f4b4b;"></div>   >  =  0.395</div>
        <div><div class="legend-color" style="background: #3e9a7d;"></div> 0.283 - 0.395 </div>
        <div><div class="legend-color" style="background: #65c2b1;"></div> 0.187 - 0.283 </div>
        <div><div class="legend-color" style="background: #88e1d5;"></div> 0.09  - 0.187 </div>
        <div><div class="legend-color" style="background: #e3f7f5;"></div>   <  =  0.09 </div>
    `;
    legendReqi.innerHTML = legendContent;
    document.getElementById('map').appendChild(legendReqi);

    // 初始时显示图例
    document.getElementById('REQILegend').style.display = 'block';
}
//添加Sentiment图例
function addSentimentLegend() {
    const legendSentiment = document.createElement('div');
    legendSentiment.id = 'SentimentLegend';  // 设置ID以便控制显示隐藏
    legendSentiment.className = 'legend legend-sentiment';

    const legendContent = `
        <h3>Sentiment Index</h3>
        <div><div class="legend-color" style="background: #8B0000;"></div> >=7 </div>
        <div><div class="legend-color" style="background: #B22222;"></div> 4 - 7 </div>
        <div><div class="legend-color" style="background: #DC143C;"></div> 0 - 4 </div>
        <div><div class="legend-color" style="background: #F08080;"></div> ==0 </div>
    `;
    legendSentiment.innerHTML = legendContent;
    document.getElementById('map').appendChild(legendSentiment);

    // 初始时隐藏示图例
    document.getElementById('SentimentLegend').style.display = 'none';
}
// 添加热力图图例
function addHeatmapLegend() {
    const legendHeatmap = document.createElement('div');
    legendHeatmap.id = 'heatmapLegend';
    legendHeatmap.classList.add('legend');

    // 添加顶部标签
    const highLabel = document.createElement('div');
    highLabel.classList.add('legend-label', 'high-label');
    highLabel.innerText = 'High';
    legendHeatmap.appendChild(highLabel);

    // 添加渐变色条
    const colorBar = document.createElement('div');
    colorBar.classList.add('legend-color-bar');
    legendHeatmap.appendChild(colorBar);

    // 添加底部标签
    const lowLabel = document.createElement('div');
    lowLabel.classList.add('legend-label', 'low-label');
    lowLabel.innerText = 'Low';
    legendHeatmap.appendChild(lowLabel);

    // 将图例添加到地图的右上角
    document.getElementById('map').appendChild(legendHeatmap);
    document.getElementById('heatmapLegend').style.display = 'none';
}






  


