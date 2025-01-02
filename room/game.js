import { Application, Graphics, Text, TextStyle, Sprite, Assets, Ticker, BlurFilter, Container, AlphaFilter, AlphaMask} from "../pixi.mjs";
import Vector2 from "../modules/Vector2.js";
import Tween, { lerp } from "../modules/Tween.js";
import { isCloseEnough , clamp} from "../modules/Misc.js";
(async ()=>{
    const app = new Application();
    await app.init({
        //width : window.innerWidth,
        //height : window.innerHeight
        resizeTo : window,
        backgroundAlpha : 1,
        backgroundColor : '2c2e39',
        antialias : true 
    });
    //TESTING
    const floorTex = await Assets.load('../public/images/testFloor.png');
    const floorSprite = Sprite.from(floorTex);
    floorSprite.scale.set(2, 2);
    const floor = new Container().addChild(floorSprite);
    
    //Variables
    var mousePos = new Vector2(0,0);
    var playerPos = new Vector2(0,0);
    var viewDir = new Vector2(0,0);

    async function addPlayer(){
        const texture = await Assets.load('../public/images/survivor-idle_shotgun_0.png');
        const sprite = Sprite.from(texture); // new Sprite(texture)
        sprite.position.set(700, 400);
        sprite.anchor.set(0.5, 0.5);
        sprite.scale.set(0.5, 0.5);
        sprite.eventMode = 'static';
        sprite.on('globalpointermove', (ev)=>{
            mousePos = new Vector2(ev.clientX, ev.clientY);
            playerPos = new Vector2(sprite.position.x, sprite.position.y);

            viewDir = mousePos.subtract(playerPos).normalized();
            let rotDir = Math.atan2(viewDir.x, viewDir.y);
            sprite.rotation = -rotDir + 1.5;
        });
        return sprite;
    }
    const playerSprite = await addPlayer();
    const player = new Container().addChild(playerSprite);
    //player.rotation = 1.5;
    //can use graphics context
    var viewConeGraphics = new Graphics()
        .lineTo(25, 0)
        .lineTo(500, 1000)
        .bezierCurveTo(250,1350, -250,1350, -500,1000)
        .lineTo(-25, 0)
        .stroke({width : 50, alpha : 0})
        .fill({alpha : 1})
    const viewCone = new Container().addChild(viewConeGraphics);
    viewCone.filters = [new BlurFilter({ 
        strength: 75 ,
        quality: 12, 
        //resolution, 
        //kernelSize : 9 
    })];
    
    const rayCastLine = new Graphics()
        .lineTo(0, 600) //draw raycast path
        .stroke({width : 3, color : 'red'});
    player.addChild(rayCastLine);
    rayCastLine.rotation =  -1.5;

    const viewConeTex = app.renderer.generateTexture({target: viewCone});
    const viewConeSprite = Sprite.from(viewConeTex);
    floor.setMask({
        mask: viewConeSprite,
        inverse : false
    }) //= viewConeSprite;

    player.addChild(viewConeSprite);
    viewConeSprite.position.x = -40;
    viewConeSprite.position.y = 15;
    viewConeSprite.rotation = -1.5;
    viewConeSprite.anchor.set(0.5, 0);


    //for testing view blocking
    const box = new Graphics().rect(100, 200, 60, 60).fill();
    //const boxTex = app.renderer.generateTexture({target: box});
    //const boxSprite = Sprite.from(boxTex);
    
    
    floor.addChild(box);
    
    
    //app.stage.addChild(box);

    function movePlayer(_moveAccel){
        player.position.x += _moveAccel.x;
        player.position.y += _moveAccel.y;
    };
    var wishDir = new Vector2(0,0);
    var moveDir = new Vector2(0,0);
    var moveAccel = new Vector2(0,0);

    //DEBUG
    var text = new Text({
        text : viewDir.dot(moveDir),
    })
    //app.stage.addChild(text);
    text.position.set(300,100);

    let a = false, d = false, w = false, s = false;
    app.ticker.add((time) => {
        const DeltaTime = (time.elapsedMS/1000);
        //time.lastTime = total time elapsed in ms
        if(a && !d) wishDir.x = -1;
        else if(d && !a) wishDir.x = +1;
        else wishDir.x = 0;

        if(w && !s) wishDir.y = -1;
        else if(s && !w) wishDir.y = +1;
        else wishDir.y = 0;

        wishDir = wishDir.normalized();
        if(wishDir.x !== 0)
            moveDir.x = lerp(moveDir.x, wishDir.x, DeltaTime * 5);
        else 
            moveDir.x = lerp(moveDir.x, 0, DeltaTime * 5);

        if(wishDir.y !== 0)
            moveDir.y = lerp(moveDir.y, wishDir.y, DeltaTime * 5);
        else 
            moveDir.y = lerp(moveDir.y, 0, DeltaTime * 5);
        
        moveAccel = Vector2.lerp(moveAccel, wishDir, DeltaTime * 7);
        
        //player moves faster forward, slower backwards
        let fwdSpdMult = 1.2
        let bckSpdMult = 0.7
        let dirSpdMult = clamp(viewDir.dot(moveDir) + 1, bckSpdMult, fwdSpdMult);
        let moveSpd = 5;
        text.text = dirSpdMult;//DEBUG
        movePlayer(moveAccel.scale(dirSpdMult * moveSpd));
    });

    document.addEventListener('keydown', (ev)=>{
        if(ev.key === ('a'||'A')) a = true; //moveDir.x -= -1;
        if(ev.key === ('d'||'D')) d = true; //moveDir.x += 1;
        if(ev.key === ('w'||'W')) w = true; //moveDir.y -= 1;
        if(ev.key === ('s'||'S')) s = true; //moveDir.y += 1;
    });
    document.addEventListener('keyup', (ev)=>{
        if(ev.key === ('a'||'A')) a = false; //moveDir.x += -1;
        if(ev.key === ('d'||'D')) d = false; //moveDir.x -= 1;
        if(ev.key === ('w'||'W')) w = false; //moveDir.y += 1;
        if(ev.key === ('s'||'S')) s = false; //moveDir.y -= 1;
    });

    //Add to Stage
    app.stage.addChild(floor, player);
    document.body.appendChild(app.canvas);
    window.__PIXI_DEVTOOLS__ = { app };
})();

