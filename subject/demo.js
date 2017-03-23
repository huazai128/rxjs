var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var speed = 30;
var star_number = 250;
var startStream = Rx.Observable.range(1,star_number)//发射1-259的Observable数据;
    .map(function(){ //在每一个Observable中定义一个对象，并发射每一个Observable
        return { //处理每一个星星的坐标及大小,初始化时的坐标
            x:parseInt(Math.random() * canvas.width),
            y:parseInt(Math.random() * canvas.height),
            size: Math.random() * 3 + 1
        }
    })
    .toArray()  //把所有的Observable转换成一个数组
    .flatMap(function(arr){  //对每一个Observable进行处理
        return Rx.Observable.interval(speed)  //每个30ms调用一次，来时星星移动；每次发射的数据是上一次发射的Observable数据
            .map(function(){
                arr.forEach(function(star){   //star:是上一次发射Observable是的数据
                    if(star.y >= canvas.height){  //如果star.y > canvas.height重新初始化
                        star.y = 0
                    }
                    star.y += 3;
                });
                return arr
            })
    });

//绘制星星
function pintStars(stars){
    //console.log("==")
    ctx.fillStyle = "#000";//填充颜色
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#fff";
    stars.forEach(function(star){
        ctx.fillRect(star.x,star.y,star.size,star.size)
    })
}

//英雄初始化坐标和每30ms变化的坐标
var hero_y = canvas.height - 30;//英雄的Y坐标
var mouserMove = Rx.Observable.fromEvent(canvas,"mousemove");//添加鼠标移动事件
var spaceShip = mouserMove.map(function(event){ //获取当前鼠标的位置，鼠标滑动后的位置
    return {
        x:event.clientX,
        y:hero_y
    }
}).startWith({  //在源Observable发出之前，发出这个参数，在没有订阅时，startWith就发射一次值
    x:canvas.width / 2, //初始化英雄的位置
    y:hero_y
    });

//绘制英雄，敌人
function drawTriangle(x,y,width,color,direction){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo((x - width),y);
    ctx.lineTo(x,direction === 'up' ? y - width : y + width);
    ctx.lineTo(x + width,y);
    ctx.lineTo(x - width,y);
    ctx.fill();
}

//绘制英雄
function paintSpaceShip(x,y){
    drawTriangle(x,y,20,"#ff0000","up");
}

function renderScene(actors){
    pintStars(actors.stars);//每30ms发射一次
    paintSpaceShip(actors.spaceship.x, actors.spaceship.y);//鼠标移动时发射
    pointEnemies(actors.enemies);
    paintHeroShots(actors.heroShots);
}


//定义敌人Observable
var ENEMY_FREQ = 1500;
var Enemies = Rx.Observable.interval(ENEMY_FREQ)
.scan(function(enemyArray){//scan():将一个函数应用于由Observable发出的每个项，顺序地，并发出每个连续的值
    var enemy = {
        x:parseInt(Math.random() * canvas.width),
        y: -30
    }
    enemyArray.push(enemy);
    return enemyArray;
},[]);


function getRandomInt(min,max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//对每一个敌人
function pointEnemies(enemies) {
    enemies.forEach(function(enemie){
        enemie.y += 5;
        enemie.x += getRandomInt(-15,15);
        drawTriangle(enemie.x,enemie.y,20,"00ff00",'down');
    })
}

/**
 * merge:用于合并多个Observable，返回一个新的Observable；
 * sample():过滤，不在这个时间基数上的所有Observable过滤掉
 * timestamp:设置一个时间戳
 */
var playerFiring = Rx.Observable.merge( //监听这两个事件来发射子弹
    Rx.Observable.fromEvent(canvas,"click"),
    Rx.Observable.fromEvent(canvas,"keydown").filter(function(event){return event.keycode === 32;})
).sample(200)  //sample(time):过滤，不在这个时间基数上的所有Observable过滤掉；
    .timestamp();  //timestamp()；设置一个时间戳；

//英雄子弹
var HeroShots = Rx.Observable.combineLatest(  //combineLatest():当一个项目由两个Observable中的任一个发出时，通过指定的函数组合每个Observable发出的最新项目，一旦他们中的任何一个发射了新项就会立即更新
    playerFiring,//监听事件
    spaceShip,   //鼠标移动,发射子弹
    function(shotEvents,space){
        return {
            timestamp: shotEvents.timestamp,
            x:space.x  //获取鼠标移动后X坐标
        };
    }
).distinctUntilChanged(function(shot){return shot.timestamp;})//distinctUntilChanged():抑制发出重复Observable
    .scan(function(shotArray,shot){
    shotArray.push({x:shot.x,y:hero_y});//
    return shotArray;
},[]);

//
var shotSpeed = 15;//子弹速度
function paintHeroShots(items) {
    items.forEach(function(item){
        item.y -= shotSpeed;  //子弹射出的轨迹
        drawTriangle(item.x,item.y,5,"#ffff00","up")
    })
}
/**
 * 是英雄和背景同事出现，combineLatest：他需要两个及以上的Observable并发送每个Observable上一次最后发射的结果，一旦他们中的任何一个发射了新项就会立即更新
 * @type {Rx.Observable<TResult>}
 * sample(time):在周期性时间间隔呢发射的Observable,不是在time下产生的Observable全部过滤掉；
 *
 */
var Game = Rx.Observable.combineLatest( //当一个项目由两个Observable中的任一个发出时，通过指定的函数组合每个Observable发出的最新项目，一旦他们中的任何一个发射Observable就会立即更新
    startStream,spaceShip,Enemies,HeroShots,
    function(stars,spaceship,enemies,heroShots){
        return {
            stars:stars,
            spaceship:spaceship,
            enemies:enemies,
            heroShots:heroShots
        }
    }
).sample(speed);//没有这个，当鼠标滑动时，敌人会移动很快

Game.subscribe(renderScene); //游戏订阅
