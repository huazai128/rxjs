/**
 * Rxjs:Rx的操作符让你可以用声明式的风格组合异步操作序列，它拥有回调的所有效率优势，同时又避免了典型的异步系统中嵌套回调的缺点。
 * AsyncSubject:一个AsyncSubject只在原始Observable完成后，发射来自原始Observable的最后一个值。如果原始的Observable因为发生了错误而终止，AsyncSubject将不会发射任何数据，只是简单的向前传递这个错误通知。
 * BehaviorSubject:当观察者订阅BehaviorSubject时，它开始发射原始Observable最近发射的数据(如果此时还没有收到任何数据，它会发射一个默认值),然后继续发射其它任何来自原始Observable的数据
 *
 *
 * debounce(time):在一个时间跨度中，之发射这个跨度中最后一个Observable值，也就是防止在一个时间跨度中连续触发Observable，这样消耗资源
 * throttleWithTimeout(time):在一个时间跨度中，之发射这个跨度中最后一个Observable值，也就是防止在一个时间跨度中连续触发Observable，这样消耗资源
 * scan(fn(any?,obj),any?)：用于函数将每一项Observable按顺序并发出去每一个连续的值
 * skip(num)：从num开始发射Observable的值；
 * take(num):限制发射num个Observable值；
 *
 *
 *
 */

const button = document.querySelector("#button");
Rx.Observable.fromEvent(button,"click")
    .debounce(1000)
    .map((event) => event.clientX)
    .scan((count,clientX) => (count+clientX),0)
    .subscribe((count) => console.log(count));

function foo(){
    console.log("Hello");
    return 42;
}
const x = foo();
console.log(x);


var observable = Rx.Observable.create(function subscribe(observer) {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.next(4); // Is not delivered because it would violate the contract
});

observable.subscribe((x) => console.log(x));

Rx.Observable.range(1,20)
.skip(10)
.take(5)
.map((x) => x +"keke")
.subscribe((x) => {console.log(x)});