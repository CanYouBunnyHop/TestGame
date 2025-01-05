import { Application, Graphics, Text, TextStyle, Sprite, Assets, Ticker, BlurFilter, Container, AlphaFilter, AlphaMask, Texture, RenderTexture} from "../pixi.mjs";
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
        antialias : true,
        useBackBuffer: true, //idk what this is, for webgl
    });

    //TESTING MAP
    const bgTex = await Assets.load('../public/images/testFloor.png');
    const bgSprite = Sprite.from(bgTex);
    bgSprite.scale.set(2, 2);
    const bg = new Container()
    bg.addChild(bgSprite);

    //for testing view blocking
    const box = new Graphics().rect(100, 200, 100, 100).fill();
    bg.addChild(box);
    

    // Create a render texture to capture the background container
    const renderTexture = RenderTexture.create({ width: app.screen.width, height: app.screen.height });
    app.renderer.render(bg, { renderTexture });
    const blurredBg = Sprite.from(renderTexture);
    blurredBg.filters = [new BlurFilter({strength : 5})];
    app.stage.addChild(blurredBg);

    const darkOverlaySpr = new Sprite(Texture.WHITE);
    darkOverlaySpr.width = app.screen.width;
    darkOverlaySpr.height = app.screen.height;
    darkOverlaySpr.tint = '2c2e39';
    darkOverlaySpr.alpha = 0.5;
    const darkOverlay = new Container().addChild(darkOverlaySpr);

    //Variables
    var mousePos = new Vector2(0,0);
    var mouseUIPos = new Vector2(0,0)
    var playerPos = new Vector2(0,0);
    var viewDir = new Vector2(0,0);

    async function addPlayer(){
        const texture = await Assets.load('../public/images/survivor-idle_shotgun_0.png');
        const sprite = Sprite.from(texture); // new Sprite(texture)
        const offset = new Vector2(app.screen.width/2, app.screen.height/2);
        sprite.position.set(offset.x, offset.y); //set to middle of screen
        sprite.anchor.set(0.5, 0.5);
        sprite.scale.set(0.5, 0.5);
        sprite.eventMode = 'static';
        sprite.on('globalpointermove', rotatePlayer);
        return sprite;
    }
    const playerSprite = await addPlayer();
    const player = new Container().addChild(playerSprite);
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
    darkOverlay.setMask({
        mask: viewConeSprite,
        inverse : true
    });
    bg.setMask({
        mask: viewConeSprite,
        inverse : false
    })

    player.addChild(viewConeSprite);
    viewConeSprite.position.x = -40;
    viewConeSprite.position.y = 15;
    viewConeSprite.rotation = -1.5;
    viewConeSprite.anchor.set(0.5, 0);

    function rotatePlayer(ev){
        mouseUIPos = new Vector2(ev.x, ev.y);
        let mp = ev.getLocalPosition(app.stage);
        mousePos = new Vector2(mp.x, mp.y);
        viewDir = mousePos.subtract(playerPos).normalized();
        let rotDir = Math.atan2(viewDir.x, viewDir.y);
        player.rotation = -rotDir + 1.5;
    }
    function movePlayer(_moveAccel){
        player.position.x += _moveAccel.x;
        player.position.y += _moveAccel.y;
    };
    function moveCamera(_moveAccel, _deltaTime, _lookDist){
        const screenMid = new Vector2(app.screen.width/2, app.screen.height/2);
        let displacement = mouseUIPos.subtract(screenMid);
        let dir = displacement.normalized();
        let ratio = new Vector2(Math.abs(displacement.x)/screenMid.x, Math.abs(displacement.y)/screenMid.y);

        app.stage.pivot.x = lerp(app.stage.pivot.x, dir.x * _lookDist* 9 * ratio.x, _deltaTime);
        app.stage.pivot.y = lerp(app.stage.pivot.y, dir.y * _lookDist* 16 * ratio.y, _deltaTime);

        app.stage.position.x -= _moveAccel.x //+ lookMult.x;
        app.stage.position.y -= _moveAccel.y //+ lookMult.y;
    }
    // function lookOffset(_lookFactor){
    //     return viewDir.normalized().scale(_lookFactor);
    // }
    
    var wishDir = new Vector2(0,0);
    var moveDir = new Vector2(0,0);
    var moveAccel = new Vector2(0,0);

    //DEBUG
    var text = new Text({ text : `${viewDir.dot(moveDir)}, ${mousePos}, ${playerPos}`})
    app.stage.addChildAt(text, 1);
    text.position.set(300,100);

    let a = false, d = false, w = false, s = false;
    app.ticker.add((time) => {
        playerPos = new Vector2(player.position.x, player.position.y);
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
        text.text = `${Math.round(mousePos.x)}:${Math.round(mousePos.y)}, ${Math.round(viewDir.x)}:${Math.round(viewDir.y)}`;//DEBUG
        let playerAccel = moveAccel.scale(dirSpdMult * moveSpd);
        movePlayer(playerAccel);
        moveCamera(playerAccel, DeltaTime, 20);
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
    bg.label = 'bg';
    darkOverlay.label = 'darkOverlay';
    player.label = 'player';
    app.stage.addChild(bg, darkOverlay, player);
    document.body.appendChild(app.canvas);
    window.__PIXI_DEVTOOLS__ = { app }; //for debug extension on chromium
})();

