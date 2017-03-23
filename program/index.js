var sd = Rx.Observable.from([1,2,3,4,5,6,7,8])
.filter(function(x){return x % 2})
.map(function(x){ return x * 10});

sd.subscribe(function(v){
    console.log(v)
});

var evenTicks = 0;  //全局作用域
function updateDis(i) {
    if(i % 2 === 0){ //如果 i % 2 === 0 evenTicks增加一次，否则不变
        evenTicks += 1;
    }
    //console.log(evenTicks);
    return evenTicks;//这个Observer值是上一个Observable返回来的值，
}

var ticksStream = Rx.Observable.interval(1000).map(updateDis);
ticksStream.subscribe(function(){
    //console.log('Subscriber 1 - evenTicks: ' + evenTicks + ' so far');
});

ticksStream.subscribe(function(){
    //console.log('Subscriber 2 - evenTicks: ' + evenTicks + ' so far');
});


function updateList(index,i) {  //
    if(i % 2 ==0){
        index += 1;
    }
    return index
}

var ticksObservable =Rx.Observable.interval(1000)
.scan(updateList,0); //scan()：发出一个连续的值；

ticksObservable.subscribe(function(evenTicks){
    //console.log('Subscriber 1 - evenTicks: ' + evenTicks + ' so far');
})
ticksObservable.subscribe(function(evenTicks){
    //console.log('Subscriber 2 - evenTicks: ' + evenTicks + ' so far');
})



//

