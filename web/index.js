/**
 * 操作符：
 * distinct():用于销毁重复发出的Observable；
 * from():用于将数组、类数组、Promise、可迭代对象、类观察者对象转换成Observable
 * pluck():用于获取对象中某个属性，并把这个属性的值转换成Observable发出
 * share():
 * retry(num):允许num次的链接错误，num次过后还没有连接成功，就推出
 * distinctUntilChanged():比较上一次Observable的值和这一次Observable值是否一致，如果一致限制发射
 * distinct():在发射队列中，只要存在相同的Observable值，抑制发射；
 * pairwise():上一次发射的Observable值和当前发射的Observable值组成一个数组返回；
 *
 */


//jsonp数据
var QUAKE_URL = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojsonp';
//地图
var map = L.map('map').setView([33.858631, -118.279602], 7);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
var codeLayers = [];
var quakeLayer = L.layerGroup([]).addTo(map);//显示当前的位置
var table = document.getElementById("quakes_info");

//初始化
function initialize(){
    var socket = Rx.DOM.fromWebSocket("ws://localhost:8080");
    var quakes = Rx.Observable.interval(5000).flatMap(function(){
        return Rx.DOM.jsonpRequest({  //jsonp请求
            url:QUAKE_URL, //路径
            jsonpCallback:"eqfeed_callback"//回调函数名称
        });
    }).flatMap(function(result){//用于每一个元素的操作，返回 ||
        return Rx.Observable.from(result.response.features || result.features); //from():将对象和数据类型转换成Observable
    }).distinct(function(quake){ //distinct():限制相同Observable请求
        return quake.properties.code;
    }).share();
    quakes.subscribe(function(quake){ //订阅
        var coords =  quake.geometry.coordinates;
        var size = quake.properties.mag * 10000;
        //console.log(coords,size);
        var circle = L.circle([coords[1],coords[0]],size).addTo(map);
        quakeLayer.addLayer(circle);
        codeLayers[quake.id] = quakeLayer.getLayerId(circle);
    });

    quakes.bufferWithCount(100)
        .subscribe(function(quakes){  //quakes:本身就是一个Observable
            console.log(quakes);
            var quakersData = quakes.map(function(quake){
                return {
                    id:quake.properties.net + quake.properties.code,
                    let:quake.geometry.coordinates[1],
                    lng:quake.geometry.coordinates[0],
                    mag:quake.properties.msg
                }
            })
            socket.onNext(JSON.stringify({quakes:quakersData}));
        })
    socket.subscribe(
        function (message) {
            console.log(JSON.parse(message.data));
        }
    )
    quakes.pluck("properties")//pluck():用于获取对象中某个属性，并把这个属性的值转换成Observable发出
        .map(makeRow)
        .bufferWithTime(500)  //bufferWithTime：在这个时间段中缓存所有Observable，并发射这段时间内的Observable
        .filter(function(rows){  //过滤
            return rows.length > 0;
        })
        .map(function(rows){
            var fragment = document.createDocumentFragment();  //createDocumentFragment:创建一个文档片段
            rows.forEach(function(row){
                fragment.appendChild(row);
            });
            return fragment;
        })
        .subscribe(function(fragment){
            var row = fragment.firstChild;
            var circle = quakeLayer.getLayer(codeLayers[row.id]);
            isHovering(row).subscribe(function(hovering){
                circle.setStyle({color: hovering?"#ff0000":"#0000ff"})
            });
            Rx.DOM.click(row).subscribe(function(){
                map.panTo(circle.getLatLng())
            });
            table.appendChild(fragment);
        })
}

function makeRow(props){
    var row = document.createElement("tr");
    row.id = props.net + props.code;
    var date = new Date(props.time);
    //console.log(date);
    var time = date.toString();
    [props.place,props.mag,time].forEach(function(text){
        var cell = document.createElement("td");
        cell.textContent = text;
        row.appendChild(cell);
    });
    return row;
}

Rx.DOM.ready().subscribe(initialize);//加载后执行

var identity = Rx.helpers.identity;//s

function isHovering(el) {
    var over = Rx.DOM.mouseover(el).map(identity(true));//发射一个true
    var out = Rx.DOM.mouseout(el).map(identity(false));//发射一个false
    return over.merge(out);//将多个Observable组合成一个新的Observable发射出去
}

function getRowFromEvent(event){
    return Rx.Observable.fromEvent(table,event)
        .filter(function(event){
            var el = event.target;
            return el.tagName ===  "TD" && el.parentNode.id.length;
        })
        .pluck("target","parentNode")  //pluck():用于对象中某一个属性的值；
        .distinctUntilChanged();
}

//鼠标滑动事件
getRowFromEvent("mouseover")
    .pairwise()   //上一次Observable的值和当前的Observable值组成数组发射；其他的过滤掉
    .subscribe(
        function (rows) {
            //console.log(rows); //rows:数组；鼠标上一次tr和这一次tr
            var prevCricle = quakeLayer.getLayer(codeLayers[rows[0].id]);
            var currCricle = quakeLayer.getLayer(codeLayers[rows[1].id]);
            prevCricle.setStyle({color: "#0000ff"});
            currCricle.setStyle({color: "#ff0000"});
        }
    )


//鼠标点击事件
getRowFromEvent("click")
    .subscribe(function(row){
        console.log(row)
        var circle= quakeLayer.getLayer(codeLayers[row.id]);
        map.panTo(circle.getLatLng());
    });



$(document).scroll(function(){
    var scrollTop = $(this).scrollTop;
    var scrollHeight = $(document).height();
    var winHeight = $(this).height();
    console.log(scrollTop);

})

