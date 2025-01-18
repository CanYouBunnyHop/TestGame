import { 
    Application, Graphics, 
    Text, TextStyle, Sprite, Assets, 
    Ticker, 
    BlurFilter, Container, AlphaFilter, AlphaMask, Texture, RenderTexture
} from "../pixi.mjs";
import Vector2 from "../modules/Vector2.js";
import Tween, { lerp } from "../modules/Tween.js";
import { isCloseEnough , clamp} from "../modules/Misc.js";
//import { satCollision } from "../modules/SATCollision.js";
(async ()=>{
    const app = new Application();
    await app.init({
        //width : window.innerWidth,
        //height : window.innerHeight
        resizeTo : window,
        backgroundAlpha : 1,
        backgroundColor : '2c2e39',
        antialias : false,
        useBackBuffer: true, //idk what this is, for webgl
    });
    
    //#region global variables
    var mousePos = new Vector2(0,0);
    var mouseUIPos = new Vector2(0,0)
    var playerPos = new Vector2(0,0);
    var viewDir = new Vector2(0,0);
    //#endregion

    //#region Map Related
    //TESTING MAP
    const bgTex = await Assets.load('../public/images/testFloor.png');
    const bgSprite = Sprite.from(bgTex);
    bgSprite.scale.set(1, 1);
    const bg = new Container()
    bg.addChild(bgSprite);
    bg.scale.set(2,2);
    //for testing view blocking
    const staticColliders = new Container();
    bg.addChild(staticColliders);

    //#region //USE GEOMETRY INSTEAD
    const box = new Graphics().rect(0, 0, 100, 100).fill();
    box.position.set(100, 200);
    box.rotation = Math.PI/4;
    staticColliders.addChild(box);
    console.log(await box.geometry);
    //#endregion

    //#region DarkOverlay
    // Create a render texture to capture the background container
    const renderTexture = RenderTexture.create({ width: bg.width*bg.scale.x, height: bg.height*bg.scale.y });
    app.renderer.render(bg, { renderTexture });
    const blurredBg = Sprite.from(renderTexture);
    blurredBg.label = 'blurredBgMask'
    blurredBg.filters = [new BlurFilter({strength : 5})];
    app.stage.addChild(blurredBg);

    const darkOverlay = new Sprite(Texture.WHITE);
    darkOverlay.width = bg.width*bg.scale.x;
    darkOverlay.height = bg.height*bg.scale.y;
    darkOverlay.tint = '2c2e39';
    darkOverlay.alpha = 0.5;
    darkOverlay.label = 'darkOverlay'
    //const darkOverlay = new Container().addChild(darkOverlaySpr);
    //#endregion
    
    //#region Player Sprite
    async function addPlayer(){
        const texture = await Assets.load('../public/images/survivor-idle_shotgun_0.png');
        const sprite = Sprite.from(texture); // new Sprite(texture)
        //const offset = new Vector2(app.screen.width/2, app.screen.height/2);
        //sprite.position.set(offset.x, offset.y); //set to middle of screen
        sprite.anchor.set(0.5, 0.5);
        sprite.scale.set(1, 1);
        sprite.eventMode = 'static';
        sprite.on('globalpointermove', rotatePlayer);
        return sprite;
    }
    const playerSprite  = await addPlayer();
    const player = new Container();
    player.label = 'player'
    player.addChild(playerSprite);
    const offset = new Vector2(app.screen.width/2, app.screen.height/2);
    player.position.set(offset.x, offset.y);
    //#endregion

    const rayCastLine = new Graphics()
        .lineTo(0, 600) //draw raycast path
        .stroke({width : 3, color : 'red'});
    player.addChild(rayCastLine);
    rayCastLine.rotation =  -Math.PI/2;

    //this is better for static textures, that don't get updated often; 
    //app.renderer.generateTexture({target: viewConeGraphics});
    //the texture where viewCone will be rendered on, needs to be bigger than the cone
    const vConeTexScale = 10;
    var viewConeTex = RenderTexture.create({
        width: app.screen.width * vConeTexScale, 
        height: app.screen.height * vConeTexScale,
        resolution : 0.034
    });
    //viewConeTex.defaultAnchor = {x:0.5, y:0.5};
    const vConeTexMid = new Vector2(viewConeTex.width/2, viewConeTex.height/2);
    var viewConeGraphics = new Graphics();
    var playerViewCone = Sprite.from(viewConeTex, true);
    function drawViewCone(_visionRange, _fov){
        let fovRad = _fov * (Math.PI/180);
        viewConeGraphics
            .clear()
            .arc(vConeTexMid.x, vConeTexMid.y, _visionRange, 0, fovRad, false)
            .lineTo(vConeTexMid.x, vConeTexMid.y)
            .fill({alpha : 1});
        viewConeGraphics.filters = [new BlurFilter({ 
            strength: 75 ,
            quality: 12, resolution: 0.034, //kernelSize : '1' 
        })];
        app.renderer.render(viewConeGraphics, { renderTexture: viewConeTex });
        darkOverlay.setMask({
            mask: playerViewCone,
            inverse : true
        });
        bg.setMask({
            mask: playerViewCone,
            inverse : false
        })
        playerViewCone.anchor.set(0.5,0.5);
        playerViewCone.rotation = -fovRad/2;
        playerViewCone.label = 'viewCone';
    }
    player.addChild(playerViewCone);
    player.scale.set(0.4, 0.4);

    function rotatePlayer(ev){
        mouseUIPos = new Vector2(ev.x, ev.y);
        let mp = ev.getLocalPosition(app.stage);
        mousePos = new Vector2(mp.x, mp.y);
        viewDir = mousePos.subtract(playerPos).normalized();
        let rotDir = Math.atan2(viewDir.x, viewDir.y);
        player.rotation = -rotDir + Math.PI/2;
    }
    function movePlayer(_moveAccel){
        player.position.x += _moveAccel.x;
        player.position.y += _moveAccel.y;
    }
    function moveCamera(_moveAccel, _deltaTime, _lookDist){
        const screenMid = new Vector2(app.screen.width/2, app.screen.height/2);
        let displacement = mouseUIPos.subtract(screenMid);
        let dir = displacement.normalized();
        let ratio = new Vector2(Math.abs(displacement.x)/screenMid.x, Math.abs(displacement.y)/screenMid.y);
        if(ratio > 1) ratio = 1;    //clamp ratio
    
        app.stage.pivot.x = lerp(app.stage.pivot.x, dir.x * _lookDist* 9 * ratio.x, _deltaTime);
        app.stage.pivot.y = lerp(app.stage.pivot.y, dir.y * _lookDist* 16 * ratio.y, _deltaTime);

        app.stage.position.x -= _moveAccel.x //+ lookMult.x;
        app.stage.position.y -= _moveAccel.y //+ lookMult.y;
    }
    //#region Physics/Game Variables
    //For Movements
    var wishDir=new Vector2(0,0),moveDir=new Vector2(0,0),moveAccel=new Vector2(0,0);
    var fwdSpdMult = 1.2, bckSpdMult = 0.7;
    const moveSpd = 5;
    const friction = 4.5;
    const accelSpd = 7;
    var dirSpdMult = 1;
    var playerAccel = Vector2.zero;

    //For Vision
    var ads = false
    const defaultFov = 90;
    const defaultViewRange = 1000;
    const aimFov = 45;
    const aimViewRange = 1500;
    const aimSpd = 8;
    var curFov = defaultFov;
    var curViewRange = defaultViewRange;
    var lookDist = 20;
    var tarViewRange = defaultViewRange;
    var tarFov = defaultFov;
    //#endregion

    //DEBUG
    // var text = new Text({ text : `${viewDir.dot(moveDir)}, ${mousePos}, ${playerPos}`})
    // app.stage.addChildAt(text, 1);
    // text.position.set(300,100);

    //#region Inputs
    let a = false, d = false, w = false, s = false;
    document.addEventListener('keydown', (ev)=>{
        if(ev.key === ('a'||'A')) a = true; 
        if(ev.key === ('d'||'D')) d = true; 
        if(ev.key === ('w'||'W')) w = true; 
        if(ev.key === ('s'||'S')) s = true; 
    });
    document.addEventListener('keyup', (ev)=>{
        if(ev.key === ('a'||'A')) a = false;
        if(ev.key === ('d'||'D')) d = false;
        if(ev.key === ('w'||'W')) w = false;
        if(ev.key === ('s'||'S')) s = false;
    });
    //Temporary AimDownSights
    document.addEventListener('contextmenu', (ev) => {
        ev.preventDefault(); //prevents rightClick menu
        ads  = !ads;
    });
    //#endregion

    //#region PhysicsTicker
    const PhysicsTicker = new Ticker();
    PhysicsTicker.autoStart = true;
    //this ticker ticks 25 times a second
    PhysicsTicker.maxFPS = 25; PhysicsTicker.minFPS = 25;
    PhysicsTicker.add((time)=>{
        const DeltaTime = (time.elapsedMS/1000);
        //player accel
        var accelRateX = wishDir.x === 0 ? friction : accelSpd;
        var accelRateY = wishDir.y === 0 ? friction : accelSpd; 
        moveAccel.x = lerp(moveAccel.x, wishDir.x, DeltaTime * accelRateX);
        moveAccel.y = lerp(moveAccel.y, wishDir.y, DeltaTime * accelRateY);
        dirSpdMult = clamp(viewDir.dot(wishDir) + 1, bckSpdMult, fwdSpdMult);
        playerAccel = moveAccel.scale(dirSpdMult * moveSpd);
        
        //player view
        tarViewRange = ads ? aimViewRange : defaultViewRange;
        tarFov = ads ? aimFov : defaultFov;
        //console.log('fixed');

        //when box collides with player change color?
        //console.log(box);
    })
    //#endregion

    //#region Update Loop
    app.ticker.add((time) => {
        //console.log('update');

        playerPos = new Vector2(player.position.x, player.position.y);
        const DeltaTime = (time.elapsedMS/1000);
        
        if(a && !d) wishDir.x = -1;
        else if(d && !a) wishDir.x = +1;
        else wishDir.x = 0;

        if(w && !s) wishDir.y = -1;
        else if(s && !w) wishDir.y = +1;
        else wishDir.y = 0;

        wishDir = wishDir.normalized();
        
        movePlayer(playerAccel);
        moveCamera(playerAccel, DeltaTime, lookDist);

        //Can use tween maybe
        curViewRange = lerp(curViewRange, tarViewRange, DeltaTime*aimSpd);
        curFov = lerp(curFov, tarFov, DeltaTime*aimSpd);
        if(!isCloseEnough(curFov, tarFov, 0.01) && !isCloseEnough(curViewRange, tarViewRange, 0.01))
            drawViewCone(curViewRange, curFov);
    });
    //#endregion
    drawViewCone(curViewRange, curFov);
    

    

    //Add to Stage
    bg.label = 'bg';
    darkOverlay.label = 'darkOverlay';
    player.label = 'player';
    app.stage.addChild(bg, darkOverlay, player);
    document.body.appendChild(app.canvas);

    //for sending to peers
    //var canvas = app.view

    window.__PIXI_DEVTOOLS__ = { app }; //for debug extension on chromium
})();

