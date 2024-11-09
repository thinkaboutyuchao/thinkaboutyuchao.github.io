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
            <label><input type="checkbox" id="PolyToggle" onchange="toggleLayer('polygons', this.checked)" checked> Polygons</label><br>
            <label><input type="checkbox" id="heatmapToggle" onchange="toggleHeatmap('REQI',this.checked)"> REQI</label><br>
            <label><input type="checkbox" id="heatmapToggle1" onchange="toggleHeatmap('Sentiment',this.checked)"> Sentiment</label><br>
        </div>
    `;
    // map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(layerControl);
    document.getElementById('map').appendChild(layerControl); // 直接添加到地图容器


    // 加载点数据
    loadPointData();
    // 加载面数据
    loadPolygonData();

    // 添加REQI图例
    addREQILegend();
    // 添加Semtiment图例
    addHeatmapLegend();

    //给图层添加点击事件
    const togglePoints = document.getElementById('layerManager');
    togglePoints.addEventListener('click', toggleLayerControl);
    
    // 监听缩放事件
    map.addListener('zoom_changed', () => {
        const currentZoom = map.getZoom();
        toggleLayers(currentZoom);
    });

}

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
    }
    // Add similar logic for polygons if implemented
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
                });

            });
        });
}
function toggleMarkers(isChecked) {
    pointLayer.forEach(marker => {
        marker.setMap(isChecked ? map : null);
    });
}
//Polygon
function loadPolygonData() {
    fetch('data/Parks_polygons.geojson')
        .then(response => response.json())
        .then(data => {
            data.features.forEach(feature => {
                const geometryType = feature.geometry.type;
                if (geometryType === "Polygon") {
                    // 单个多边形处理
                    const coordinates = feature.geometry.coordinates[0].map(coord => {
                        return { lat: coord[1], lng: coord[0] };
                    });
                    createPolygon(coordinates, feature,12);
                } else if (geometryType === "MultiPolygon") {
                    // 多重多边形处理
                    feature.geometry.coordinates.forEach(polygonCoords => {
                        const coordinates = polygonCoords[0].map(coord => {
                            return { lat: coord[1], lng: coord[0] };
                        });
                        createPolygon(coordinates, feature,12);
                    });
                }
            });
        })
        .catch(error => console.error("Error loading GeoJSON:", error));
}
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
            fetch('data/REQI_366Parks__FeaturesToJSO(1).geojson')
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
            fetch('data/Sentiment_JSON.geojson')
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
    fetch('data/parks_ReqiSentiments_REV(1).csv')
        .then(response => response.text())
        .then(reqiText => {
            const reqiRows = reqiText.split('\n').map(row => row.split(','));
            const reqiHeader = reqiRows[0];
            const nameIndex = reqiHeader.indexOf("name_1");
            const googleRatingIndex = reqiHeader.indexOf("Google Rating");
            const reqiHaveLSTIndex = reqiHeader.indexOf("REQI_haveLST");
            const sentimentScoreIndex = reqiHeader.indexOf("SentimentScore");

            // 筛选第一个CSV的数据
            const matchingReqiRows = reqiRows.slice(1).filter(row => row[nameIndex] === parkName);
            const parkDetailsContainer = document.getElementById('parkDetails');
            parkDetailsContainer.innerHTML = ""; // 清空上次内容

            if (matchingReqiRows.length > 0) {
                // 显示 name_1, Google Rating, REQI_haveLST 和 SentimentScore
                const parkNameItem = document.createElement('p');
                parkNameItem.innerHTML = `<strong>Park Name:</strong> ${matchingReqiRows[0][nameIndex]}`;
                parkDetailsContainer.appendChild(parkNameItem);

                const ratingItem = document.createElement('p');
                ratingItem.innerHTML = `<strong>Rating:</strong> ${matchingReqiRows[0][googleRatingIndex]}`;
                parkDetailsContainer.appendChild(ratingItem);

                const reqiItem = document.createElement('p');
                reqiItem.innerHTML = `<strong>REQI:</strong> ${matchingReqiRows[0][reqiHaveLSTIndex]}`;
                parkDetailsContainer.appendChild(reqiItem);

                const sentimentScoreItem = document.createElement('p');
                sentimentScoreItem.innerHTML = `<strong>Sentiment Score:</strong> ${matchingReqiRows[0][sentimentScoreIndex]}`;
                parkDetailsContainer.appendChild(sentimentScoreItem);
            } else {
                parkDetailsContainer.innerText = "No REQI information available.";
                return; // 如果没有REIQ信息，返回
            }

            // 加载第二个CSV文件
            fetch('data/parks_reviews_sentiment.csv')
                .then(response => response.text())
                .then(reviewText => {
                    const reviewRows = reviewText.split('\n').map(row => row.split(','));
                    const reviewHeader = reviewRows[0];
                    const reviewNameIndex = reviewHeader.indexOf("place_name");
                    const reviewsIndex = reviewHeader.indexOf("review_text");

                    // 筛选第二个CSV的数据
                    const matchingReviewRows = reviewRows.slice(1).filter(row => row[reviewNameIndex] === parkName);

                    if (matchingReviewRows.length > 0) {
                        // 显示所有的 review_text
                        const reviewTextItem = document.createElement('p');
                        reviewTextItem.innerHTML = `<strong>Reviews:</strong>`;
                        matchingReviewRows.forEach(row => {
                            // 根据 '|+' 分割评论并移除多余空白
                            const individualReviews = row[reviewsIndex].split('|+').map(r => r.trim()).filter(r => r);
                            individualReviews.forEach(individualReview => {
                                // 去掉前后的引号，如果有的话
                                individualReview = individualReview.replace(/^"|"$/g, '').trim();
                                // 确保只有非空评论被添加
                                if (individualReview) {
                                    const reviewParagraph = document.createElement('p');
                                    reviewParagraph.textContent = individualReview; // 每条评论放在单独的段落中
                                    reviewTextItem.appendChild(reviewParagraph);
                                }
                            });
                        });
                        parkDetailsContainer.appendChild(reviewTextItem);
                    } else {
                        const reviewTextItem = document.createElement('p');
                        reviewTextItem.innerText = "No reviews available.";
                        parkDetailsContainer.appendChild(reviewTextItem);
                    }
                });
        });
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
        <div><div class="legend-color" style="background: #1f4b4b;"></div> > 0.395</div>
        <div><div class="legend-color" style="background: #3e9a7d;"></div> 0.283 - 0.395 </div>
        <div><div class="legend-color" style="background: #65c2b1;"></div> 0.187 - 0.283 </div>
        <div><div class="legend-color" style="background: #88e1d5;"></div> 0.09 - 0.187 </div>
        <div><div class="legend-color" style="background: #e3f7f5;"></div> <= 0.09 </div>
    `;
    legendReqi.innerHTML = legendContent;
    document.getElementById('map').appendChild(legendReqi);

    // 初始时显示图例
    document.getElementById('REQILegend').style.display = 'block';
}
// 添加热力图图例
function addHeatmapLegend() {
    const legendHeatmap = document.createElement('div');
    legendHeatmap.id = 'heatmapLegend';
    legendHeatmap.classList.add('legend');

    // 添加顶部标签
    const highLabel = document.createElement('div');
    highLabel.classList.add('legend-label', 'high-label');
    highLabel.innerText = '10';
    legendHeatmap.appendChild(highLabel);

    // 添加渐变色条
    const colorBar = document.createElement('div');
    colorBar.classList.add('legend-color-bar');
    legendHeatmap.appendChild(colorBar);

    // 添加底部标签
    const lowLabel = document.createElement('div');
    lowLabel.classList.add('legend-label', 'low-label');
    lowLabel.innerText = '0';
    legendHeatmap.appendChild(lowLabel);

    // 将图例添加到地图的右上角
    document.getElementById('map').appendChild(legendHeatmap);
    document.getElementById('heatmapLegend').style.display = 'none';
}




  


