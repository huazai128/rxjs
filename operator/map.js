/**
 * Rx.DOM:提供了事件绑定，Ajax请求、web套接字、WebWorker、服务器发送事件、地理位置等
 * API：https://github.com/Reactive-Extensions/RxJS-DOM/tree/master/doc
 */
var QUAKE_URL = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojsonp';

/**
 * 地图数据
 * @param url
 */
// function loadJSONP(url) {
//     var script = document.createElement("script");
//     script.src = url;
//     var head = document.getElementsByTagName("head")[0];
//     head.appendChild(script)
// }
//
// var quakes =Rx.Observable.create(function(observer){
//     window.eqfeed_callback = function(response){
//         console.log(response);
//         observer.onNext(response);  //next():传递至
//         observer.onCompleted();
//     }
//     loadJSONP(QUAKE_URL);
// }).flatMap(function(dataset){  //flatMap：就是一个Observable它的结果嵌套许多的Observable
//     return Rx.Observable.from(dataset.features);//from:数组值转换单个Observable值返回
// })
//
// //subscribe():获取每次next的值
// quakes.subscribe(function(data){
//     console.log(data);
//     var coords = data.geometry.coordinates;
//     var size = data.properties.mag * 10000;
//     L.circle([coords[1], coords[0]], size).addTo(map)
// })



/**
 * interval(5000):异步,每5秒发出一个Observable，distinct():去重，仅仅发送以前没有发射过的元素
 *
 */
var quakes = Rx.Observable.interval(5000)  //
.flatMap(function(){
    return Rx.DOM.jsonpRequest({ //使用DOM的Ajax请求
        url:QUAKE_URL,  //url
        jsonpCallback:"eqfeed_callback" //设置回调函数名称
    }).retry(3);// retry():用于捕获错误，当Observable错误超过3次不会重新订阅Observable
}).flatMap(function(result){
    console.log(result)
    return Rx.Observable.from(result.response.features)
}).distinct(function(quake){return quake.properties.code});  //distinct()：抑制Observable发出重复请求

quakes.subscribe(function(quake){
    var coords = quake.geometry.coordinates;
    var size = quake.properties.mag * 10000;
    L.circle([coords[1], coords[0]], size).addTo(map);
})




