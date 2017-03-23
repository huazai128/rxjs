
/**
 * flatMap:这个函数可以将枝干的流的值发射到主干流之上
 * map()，flatMap()都是Rx处理异步请求工具中的一部分
 * 如果流A中包含了若干其他流，在流A上调用flatMap()函数，将会发射其他流的值，并将发射的所有值组合生成新的流。
 * 通过订阅(subscribe)获取响应流数据；渲染到浏览器上
 *
 *
 *
 */
//创建一个请求流
var requestStream = Rx.Observable.just("https://api.github.com/users");

//响应流
var responseStream = requestStream.flatMap(function(requestUrl){  //flatMap：用于处理
    return Rx.Observable.fromPromise($.getJSON(requestUrl)); //调用fromPromise，使将请求的URL设置为Promise对象
});

//订阅
responseStream.subscribe(function(response){
    console.log(response)
},function(err){
    console.log(err)
});


/**
 * fromEvent(el,eventName):事件流;
 * merge():当存在两个或两个以上的流是就使用merge()；来合并多个流，返回一个新的流
 * startWith(x):作用也是用于多个流合并，返回一个新的流;把x作为这个流的启示输入并发射出来
 * combineLatest()需要结合传入的两个流，如果其中一个流从未发射过任何值，combineLatest()将不会输入任何新的流
 */
var demoBtn = document.querySelector("#btn");
//创建一个click事件流
var clickStream = Rx.Observable.fromEvent(demoBtn,"click"); //
//
var requestStreamOne = clickStream.map(function(){
    var randomOffset = Math.floor(Math.random() * 500); //随机请求
    return 'https://api.github.com/users?since=' + randomOffset;
});

var requestStreamOut = Rx.Observable.merge(requestStreamOne,requestStream);

requestStreamOut.subscribe(function(res){
    console.log(res);
});


//简写
var requestStreamLiu = clickStream.map(function(res){
    var random = Math.floor(Math.random() * 500);
    return 'https://api.github.com/users?since=' + randomOffset;
}).startWith("https://api.github.com/users");



