import { Application, Graphics, Text, TextStyle, Sprite, Assets} from "../pixi.mjs";
(async ()=>{
    const app = new Application();
    await app.init({
        //width : window.innerWidth,
        //height : window.innerHeight
        resizeTo : window,
        backgroundAlpha : 1,
        //backgroundColor
        antialias : true 
    });
    document.body.appendChild(app.canvas);
    //app.canvas.style.position = 'absolute';
    const rectangle = new Graphics()
    .rect(200, 200, 100, 150) //(X, Y, WIDTH, HEIGHT)
    .fill({
        color : 'red',
        alpha : 0.9
    })
    .stroke({
        width : 2,
        color : 'white'
    })
    app.stage.addChild(rectangle);
    //rectangle.eventMode = 'static'

    const txtStyle = new TextStyle({
        fill : 'blue',
        fontSize : 72,
        fontFamily : 'Times'
    })

    const msg = new Text({
        text : 'hello pixi',
        style : txtStyle
    });
    app.stage.addChild(msg);
    //msg.position.x = 500;
    //msg.position.y = 500;
    msg.position.set(500, 500);

    const texture = await Assets.load('../public/images/survivor-idle_shotgun_0.png');
    const sprite = Sprite.from(texture); // new Sprite(texture)
    app.stage.addChild(sprite);
    //sprite.width = 200;
    //sprite.height = 300;
    //sprite.scale.x = 0.5;
    //sprite.scale.y = 2;
    sprite.position.set(700, 400);
    sprite.anchor.set(0.5, 0.5);
    sprite.scale.set(1, 1);
    sprite.eventMode = 'static';
    sprite.on('globalpointermove', (ev)=>{
        let mousePos = {x : ev.clientX, y : ev.clientY};
        let playerPos = {x : sprite.position.x, y : sprite.position.y};
        let dir = {x : mousePos.x - playerPos.x, y : mousePos.y - playerPos.y};
        let dirNorm = (()=>{
            let l = Math.sqrt(dir.x*dir.x + dir.y*dir.y);
            return {x : dir.x / l, y : dir.y / l};
        })();
        let rotDir = Math.atan2(dirNorm.x, dirNorm.y);
        //console.log(mousePos);
        sprite.rotation = -rotDir + 1.5;
    })
    //sprite.rotation = Math.PI / 5;


    

    window.__PIXI_DEVTOOLS__ = { app };
})();

// const app = new Application();
// document.body.appendChild(app.canvas);


// /**@type {HTMLCanvasElement|null} */
//  const canvas = document.getElementById('game-canvas');
//  const ctx = canvas.getContext('2d');