/**
 * combineLatest()需要结合传入的两个流，如果其中一个流从未发射过任何值，combineLatest()将不会输入任何新的流，解决方法就是使用startWith()方法模拟一次关闭按钮的点击
 * flatMap(x):这个函数可以将枝干的流的值发射到主干流之上
 * merge():
 * @type {Element}
 */

var refreshButton = document.querySelector("#refresh");
var refreshClickStream =Rx.Observable.fromEvent(refreshButton,"click");//开启一个事件流

var closeButton = document.querySelector("#close");
var closeClickStream =Rx.Observable.fromEvent(closeButton,"click");//开启一个事件流

var requestStream = refreshClickStream.startWith("startup click") //
.map(function(){
    var randomOffset = Math.floor(Math.random() * 500);
    return 'https://api.github.com/users?since=' + randomOffset;
});

var responseStream = requestStream.flatMap(function(requestUrl){ //这个函数可以将枝干的流的值发射到主干流之上，组成新的流
    return Rx.Observable.fromPromise($.ajax({url:requestUrl}))
});
//关闭事件流
var suggestion1Stream = closeClickStream.startWith("startup click")
    .combineLatest(responseStream,function(click,listUsers){  //
        return listUsers[Math.floor(Math.random()*listUsers.length)];
    })
    .merge(refreshClickStream.map(function(){
        return null;
    }))
    .startWith(null)

refreshClickStream.subscribe(function(res){
    console.log(res)
})

