---
title: Google map功能开发总结
date: 2020-07-12
tags: google
---
### 效果预览
![image](/img/articleimg/map.png)

<!--more-->

### 具体实现

#### 申请api key
https://developers.google.com/maps/documentation/javascript/get-api-key ，然后页面引入。
```js
<script src="https://maps.googleapis.com/maps/api/js?key=xxxxx"></script>
```

#### 代码拆解
实例化
```js
let mapConfig = {
  defaultIcon: "https://example.com/images/map-marker.png",
  activeIcon: "https://example.com/images/map-marker-active.png",
  zIndex: 1000,
};
const mapElem = document.getElementById("google-map");
const googleMap = new google.maps.Map(mapElem, {
    zoom: 6, //缩放系数
    disableDefaultUI: true, //隐藏左上角的按钮
    gestureHandling: "greedy", //不用按住Ctrl+鼠标滚轮，只需滚轮就可以缩放地图
    center: { lat: -34.397, lng: 150.644 },//中心点
});
```
获取当前位置。浏览器左上方会出现一个会话框，询问是否同意获取，成功则可获取到当前的经纬度坐标。
```js
navigator.geolocation.getCurrentPosition(position=> {
  console.log("getCurrentPosition:success", position)
}, error=> {
  console.log("getCurrentPosition:error", error)
}, { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true });

```
位置的解析与反解析。传递`location`参数，可以获得address；传递`address`参数，可以获得经纬度。
```js
const getAddressByGoogle = callback => {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'location': this.map.getCenter() },  (results, status)=> {
    if (status == google.maps.GeocoderStatus.OK) {
      console.log('解析结果：', results[0].formatted_address);
      callback && callback(results);
    } else {
      console.log('Geocode was not successful for the following reason: ' + status);
    }
  });
}
```
添加marker
```js
//假如从接口获取的数据是
let dataList = [
    {   
        "phone":"13434325325",
        "address": "test",
        "longitude": "120.3684595",
        "latitude": "19.1183964"
    },
    ...
]

let arrMarkers = [];
let { defaultIcon, activeIcon, zIndex } = mapConfig;

const bounds = new google.maps.LatLngBounds();
const infowindow = new google.maps.InfoWindow({
    maxWidth: 320,
});

for (let i = 0; i < dataList.length; i++) {
    let { latitude , longitude } = dataList[i];
    if(latitude && longitude){
        const latLng = new google.maps.LatLng(latitude, longitude);
        const marker = new google.maps.Marker({
            position: latLng,
            map: googleMap,
            infowindow: infowindow,
            icon: defaultIcon,
        });
        (function (marker, data) {
            marker.addListener("click", () => {
                hideAllInfoWindows();
                marker.setIcon(activeIcon);
                marker.setZIndex(zIndex);
                infowindow.setContent(markerPop(data));
            });
        })(marker, data);
        arrMarkers[i] = marker;
        //Extends this bounds to contain the given point.(扩展这个边界以包含给定的点。)
        bounds.extend(latLng); 
    }
}
//fitBounds这里的作用是，让所有的marker都出现在地图可视区。如果不加这步骤，一开始可能看不到所有的marker。在有些marker离得比较远的情况，比如它是定在南极，而其它点都相对集中，假设是在北半球。那么我们需要拖动地图才能看到全部marker。
if(dataList.length > 1){
    //Sets the viewport to contain the given bounds.(设置视口，使其包含给定的边界。)
    googleMap.fitBounds(bounds);
}
/**
 * @todo 关闭所有弹窗
 */
const hideAllInfoWindows = () => {
    arrMarkers.forEach(marker=> {
        marker.setIcon(mapConfig.defaultIcon);
        marker.setZIndex(null);
        marker.infowindow.close(googleMap, marker);
    });
}
/**
 * @todo 点击marker的弹窗的内容
 * @return {String} 返回dom string
 */
const markerPop = data =>{
    let html = "";
    ...
    return html
}
```

（上述效果图）点击左侧列表，定位到当前的目标，并且让其处在地图正中心。
```js
const setMarkerCenter = index =>{
  let curMarker = arrMarkers[index];
  googleMap.setCenter(curMarker.getPosition());
}
```

点击跳转到指定地点
```js
/**@todo 点击跳转目的地
 * @param saddr 出发点地址
 * @param daddr 目标地址
 * @param hl 语言设置
 * @param dirflg 路线类型，d代表自驾，r代表公共交通路线，w代表步行
 */
mapElem.addEventListener('click', function (e) {
    let currentLanguage =  navigator.language || 'en';
    if (e.target.className == "map-direction") {
        let daddr = e.target.dataset.addr;
        let googleMapUrl = "https://maps.google.com/maps?daddr=" + daddr + "&hl="+ currentLanguage + "&dirflg=d";
        window.open(googleMapUrl);
    }
}, false)
```


### 参考
官方文档：https://developers.google.com/maps/documentation/javascript/overview