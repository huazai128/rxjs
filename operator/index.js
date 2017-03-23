/**
 * Operator:操作符；
 * sequence():用于改变或者查询序列
 * from(arr):用于将一些对象或者数组装换为Observable对象
 * fromEvent(el,eventName):用于事件
 * filter():用于过滤满足要求的Observable对象返回
 * range(n,m):创建一个发射特定范围的连续整数的Observable;
 * merge():用于合并多个Observable对象，返回一个新的Observable对象
 * interval(times):在设置的时间内增加Observable对象
 * map():对每个项应用函数来转换Observable发出,此时发出的都是Observable值；
 * flatMap():和map的引用差不多，不过flatMap可以异步操作，返回Observable，这样数据可以交错发出，就是一个Observable它的结果嵌套许多的Observable
 * reduce(x,y):值累加;指向外来参数，y:有上层Object传递的数据,每次累加都返回一个Observable对象，接受上一次Observable的值
 * contcatAll();是需要一个数组的数组函数，并且返回一个平坦的单一的数组，这个数组包含所有子数组的值，而不是这些子数组本身
 * dispose():用于去掉订阅；停止从Observable中接受通知；
 * catch():用语捕获异常
 * retry(num):用于处理错误，如果过Observable发生错误，重新开启Observable对象,num:当Observable连续发生错误次数超过num，将会终止，如果没有num，会重复订阅
 * distinct()：抑制Observable发出重复请求
 * scan(callback(acc,y),x):acc：是上一次Observable返回的值；
 * take(index):index:只发射前index个项的Observable值，
 * sample(time):在这个时间周期时间间隔内发出的Observable，过滤掉已在时间周期内所有Observable
 * distinctUntilChanged():限制发出重复Observable；
 * skip(numb):抑制numb之前Observable发射，从numb开始发射Observable
 * pluck(key):获取对象中某一个属性，并把这些值转换成Observable发出；
 * delay(time):延迟发射Observable；
 * share():从源Observable发射之前发射
 * do():对注册各种Observable生命周期事件进行操作
 *
 *
 *
 *
 */


var aBtn = document.querySelector("#btn");

//fromEvent定义事件
var mouseStream = Rx.Observable.fromEvent(document,"mousemove");
mouseStream.subscribe(
    function(e){
        //console.log(e.clientX)
    }
)
//filter:过滤
var movesOnThisRight = mouseStream.filter(function(e){
    return e.clientX > window.innerWidth / 2
})

var movesOnThisLeft = mouseStream.filter(function(e){
    return e.clientX < window.innerWidth / 2;
})

//本身是一个事件流，订阅获取的参数也是事件
movesOnThisRight.subscribe(function(e){
    //console.log('Mouse is on the right:', e.clientX)
})

movesOnThisLeft.subscribe(function(e){
    //console.log('Mouse is on the left:', e.clientX)
})


//range:在特定的范围内连续输出整数
var rangStream = Rx.Observable.range(1,4);

rangStream.subscribe(
    //function(x){console.log(x)},  //输出 0,1,2,3
    //function(err){console.log(err)}
)


/**
 * interval(times):在设置的时间内增加Observable对象
 * merge():用于合并两个Observable对象，返回一个新的Observable对象
 */
var aStream = Rx.Observable.interval(200).map(function(i){
    return "A" + i; //这个数值每次都用都会累加
})
var bStream = Rx.Observable.interval(100).map(function(i){
    return "B" + i;
})

Rx.Observable.merge(aStream,bStream).subscribe(function(x){
    //console.log(x);//B0, A0, B1, B2, A1, B3, B4,.....
})


//reduce(x,y):值累加;指向外来参数，y:有上层Object传递的数据
var source = Rx.Observable.range(1,3)//输出：0,1,2
    .reduce(function(acc,x){ //reduce(x,y):累加 retuen x + y
        return acc * x;
    },1)

source.subscribe(
    function(x){console.log("Result",x)},  // 0
    function(err){console.log("Error",err)},
    function () {
        console.log("Completed");
    }
)
var reduce1 = Rx.Observable.range(0,5)
    .reduce(function(prev,cur){
        console.log(prev) // 是对象
        return {
            sum:prev.sum + cur,
            count: prev.count + 1
        }
    },{sum:0,count:0})
    .map(function(obj){
        return obj.sum / obj.count;
    })

reduce1.subscribe(function (x) {
    console.log(x)
})

//dispose():去掉订阅；
var counter = Rx.Observable.interval(1000);
var sub1 = counter.subscribe(function(i){
    //console.log("Sub 1:",i);
})
var sub2 = counter.subscribe(function(i){
    console.log("Sub 2:",i);
})

setTimeout(function(){
    console.log("Sub 2 关闭");
    sub2.dispose(); //处在推送数据
},2000);


//from(),把数组对象成员转成Observable值，
function getJSON(arr){
    return Rx.Observable.from(arr).map(function(str){
        return JSON.parse(str); //parse()：转换成JSON对象
    })
}

getJSON(['{"a":1,"c":2}','{"success":true}']).subscribe(function(data){
    console.log(data)
})

//catch():用于捕获异常
var catchT = getJSON(['{"a":1,"b":2}','{"1":1}']).catch(
    Rx.Observable.return({
        error:"JOSN数据格式错误"
    })
)
catchT.subscribe(function(data){
    console.log(data)
},function(err){
    console.log("Error:",err.message)
})


/**
 * sample(time):设置一个时间周期间隔，过滤掉不在时间周期间隔内的所有Observable
 */
var sou = Rx.Observable.interval(1000)
    .sample(5000)//处理那些不在times时间下的Observable，
    .take(5);
sou.subscribe(
    function(x){console.log("Next: ",x)},// 4  9
    function(err){console.log("Errro: ",err)},
    function(){console.log("Completed")}
)

/**
 * timeStamp():为每一个Observable设置时间戳；
 * timer():传建一个延时发射的Observable
 */

var timeStamp = Rx.Observable.timer(0,1000)
    .timestamp() //设置时间戳，在每一个时间戳中发射一个Observable,间隔为1
    .map(function(x){
        return x.value + ": " + x.timestamp
    })
    .take(5);  //只发射5次Observable就Completed
timeStamp.subscribe(
    function(x){console.log("Next: " + x)},
    function(err){console.log("Errro: ",err)},
    function(){console.log("Completed")}
)


/**
 * skip(numb):抑制numb之前的Observable发射
 */
var skipStream = Rx.Observable.range(0,5)
    .skip(3); //
skipStream.subscribe(
    function(x){console.log("Skip:",x)}  //输出3 4
);

//pluck():这些元素中提取一个命名的属性并在其位置发出该属性值
var pluckStream = Rx.Observable.fromArray([ //
    {value:0},
    {value:1},
    {value:2}
]).pluck("value");
pluckStream.subscribe(
    function(x){console.log(x)},  //输出 0 1 2
    function(err){console.log(err)},
    function(){console.log("Completed")}
);


//热Observable:Observable 发射值无论Observable有没有被订阅,都会发射的所有值
var onMove = Rx.Observable.fromEvent(document,"mousemove");
onMove.subscribe(function(e){
   // console.log("Sub 1",e.clientX,e.clientY);
});
onMove.subscribe(function(e){
    //console.log("Sub 2",e.clientX,e.clientY);
});

//冷Observable：一个冷Observable仅当Observer订阅的时候才发射值；
function printValue(value){
    console.log(value);
}
var rangeToFive = Rx.Observable.range(1,5);
rangeToFive.subscribe(printValue);
// var sub1 = Rx.Observable.delay(2000)
//     .flatMap(function(){
//         return rangeToFive.subscribe(printValue)
//     });


/**
 * take(num):只发射num之前的Observable
 * do():对注册各种Observable生命周期事件进行操作
 * share():从源Observable发射之前发射
 */
var published = Rx.Observable.interval(1000).take(2).do(function(){
    console.log("Side effect");  //最先打印这个歌
}).share();
published.subscribe(createObserver("A"));
published.subscribe(createObserver("B"));
function createObserver(teg){
    return Rx.Observer.create(
        function(x){console.log("Next: "+ teg + x)},  //输出 0 1 2
        function(err){console.log(err)},
        function(){console.log("Completed")}
    )
}







