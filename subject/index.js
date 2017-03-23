/**
 * Subject:通过订阅可以多路推送数据,订阅相同的数据；处理序列中的所有值仅是发射并缓存最后一个
 * AsyncSubject：处理序列中的所有值仅是发射并缓存最后一个，这个是异步;一个AsyncSubject只在原始Observable完成后，发射来自原始Observable的最后一个值
 * BehaviorSubject：它开始发射原始Observable最近发射的数据，然后继续发射其它任何来自原始Observable的数据；只能发送最近的一次Observable数据；如果原始的Observable因为发生了一个错误而终止，BehaviorSubject将不会发射任何数据
 * ReplaySubject(num)：会发射来自原始Observable所有数据，无论何时订阅都能接受所有数据，num:表示缓存的多少值，超过会知道删除之前的缓存数据，保存最近的Observable数据
 *
 * @type {Rx.Subject<T>}
 */


var subject = new Rx.Subject();//subject可以多路推送数据
var source = Rx.Observable.interval(300)
.map(function(x){
    return "Interval message # " + x; //这里只输出参数
}).take(5);  //限制5次，onCompleted():会覆盖take();

source.subscribe(subject);

var sub = subject.subscribe(
    function onNext(x) {console.log("onNext: " + x)},
    function onError(e) { console.log('onError: ' + e.message); },
    function onCompleted() { console.log('onCompleted'); }
);

subject.onNext("Our message #1");
subject.onNext("Our message #2");

setTimeout(function(){
    subject.onCompleted();//一旦这个被调用就会停止所有的发射
},1000);


// var obj = {name:"keke",password:"1111"};
// for(var key in obj){
//     console.log(key)
// }

/**
 * delay(time):延迟发射Observable对象
 */
var delayRange = Rx.Observable.range(0,5).delay(1000);
var subjects = new Rx.AsyncSubject();  //发射最后一个值为4，所有订阅者都是这个值
delayRange.subscribe(subjects);

subjects.subscribe(
    function onNext(x) {console.log("onNext: " + x)},  //4
    function onError(e) { console.log('onError: ' + e.message); },
    function onCompleted() { console.log('onCompleted'); }
);

/**
 * 返回一个Observable
 * @param url
 */
function getProducts(url){
    var subject;
    return Rx.Observable.create(function(observer){ //创建Observable
        if(!subject){ //判断subject是否存在
            subject = new Rx.AsyncSubject();  //Subject：对象可以多路推送信息；而AsyncSubject处理序列中的所有值仅是发射并缓存最后一个
            Rx.DOM.get(url).subscribe(subject);//DOM可以进行Ajax操作；
        }
        return subject.subscribe(observer);
    })
}

var products = getProducts("./products.json");

//订阅
products.subscribe(
    function onNext(result){console.log('Result 1:', result.response);},
    function onError(err) {console.log("Error ", err)}
);

//订阅，这次订阅没有向./products.json发出请求，
setTimeout(function(){
    products.subscribe(
        function onNext(result){console.log('Result 1:', result.response);},
        function onError(err) {console.log("Error ", err)}
    );
},5000);

/**
 * BehaviorSubject:发射一个原始的Observable数据，然后继续发射其它任何来自原始Observable的数据。只接受最近发射的数据进行缓存
 * @type {Rx.BehaviorSubject<T>}
 */
var beSubject = new Rx.BehaviorSubject("Waiting for content"); //发射一个原始的Observable数据，默认的数据
beSubject.subscribe(
    function(result){
        document.body.textContent = result.response || result;
    },
    function(err){
        document.body.textContent = "There was an error retrieving content"
    }
)

Rx.DOM.get("./products.json").subscribe(beSubject);



/**
 * ReplaySubject(num,times):它确保observer能获取Observable从开始发送的所有值,如果超过缓存的大小就删除最先发射Observable的数据
 * times:需要缓存存在的单位毫秒数。事件buffer
 * @type {Rx.ReplaySubject<T>}
 */
var reSubject = new Rx.ReplaySubject(2);//设置缓存大少；
reSubject.onNext(1);
reSubject.onNext(2);
reSubject.onNext(3);
reSubject.subscribe(
    function(x){
        console.log(x) ;//输出 2  3；输出最近发射Observable的数据
    }
);

/**
 * 订阅事件减去发射Observable事件，因为onNext(1),onNext(2)传值事件小于这个之间的差值，所以数据没有缓存下来
 * @type {Rx.ReplaySubjectStatic}
 */
var reSubject1 = new Rx.ReplaySubject(null,100);//每次发射Observable事件间隔为100
setTimeout(function(){reSubject1.onNext(1)},100);
setTimeout(function(){reSubject1.onNext(2)},200);
setTimeout(function(){reSubject1.onNext(3)},300);
setTimeout(function(){
    reSubject1.subscribe(function(n){
        console.log("value: ",n)// 输出3 4
    })
    reSubject1.onNext(4)
},350)//订阅事件
