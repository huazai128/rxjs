/**
 * observer:的三个方法,next(传值)，error(报错触发，之后的onNext调用将会无效),completed(完成所有的流触发，之后的onNext调用将会无效);这三个方法返回的全是observer对象；
 * subscribe():接受next()；传递过来的参数；
 */

/**
 * 使用可观察对象制作ajax,返回是一个observable对象
 * @param url
 */
function get(url) {
    return Rx.Observable.create(function (observer) {  //创建一个可观察者对象
        var req = new XMLHttpRequest();
        req.open("GET", url);
        req.onload = function () {
            if (req.status == 200) {
                observer.onNext(req.response);  //next():传递数据，通过subscribe()：订阅
                observer.onCompleted(); //完成流
            }else{
                observer.onError(new Error(req.statusText))
            }
        };
        req.onerror = function () {
            observer.onError(new Error("Unknown Error"));
        };
        req.send();
    })
}

var test = get("https://api.github.com/users");

//订阅
test.subscribe(
    function onNext(x){
        console.log("Result", x)
    },
    function onError(err){
        console.log("Error",err)
    },
    function onCompleted(){
        console.log('======')
    }
)



//

