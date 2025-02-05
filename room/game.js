import { 
    Application, Graphics, 
    Text, TextStyle, Sprite, Assets, 
    Ticker, 
    BlurFilter, Container, AlphaFilter, AlphaMask, Texture, RenderTexture,
    Geometry, Mesh, Shader, Point
} from "../pixi.mjs";
import Vector2 from "../modules/Vector2.js";
import Tween, { lerp } from "../modules/Tween.js";
import { isCloseEnough , clamp} from "../modules/Misc.js";
import { satCollision } from "../modules/SATCollision.js";
import physicsTicker from "./physics.js";
import player, {playerCollider} from "./player.js";
import pixiCollider from "./pixiCollider.js";

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

    const boxCollider = pixiCollider.createRectCollider(0,0, 100, 100);
    const box = new Graphics(boxCollider.graphicsCtx).fill();
    box.position.set(100, 200);
    
    box.rotation = Math.PI/6;
    staticColliders.addChild(box);
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
    //#endregion
    
    //#region Player
    //set player starting pos, 
    // need to account for screen and world pos
    player.position.x = app.screen.width/2;
    player.position.y = app.screen.height/2;
    player.eventMode = 'static';
    player.on('globalpointermove', rotatePlayer);
    player.scale.set(0.4, 0.4);
    
    
    

    //this is better for static textures, that don't get updated often; 
    //app.renderer.generateTexture({target: viewConeGraphics});
    //the texture where viewCone will be rendered on, needs to be bigger than the cone
    const vConeTexScale = 10;
    var viewConeTex = RenderTexture.create({
        width: app.screen.width * vConeTexScale, 
        height: app.screen.height * vConeTexScale,
        resolution : 0.034
    });
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
    //#endregion
    function moveCamera(_moveAccel, _deltaTime, _lookDist){
        const screenMid = new Vector2(app.screen.width/2, app.screen.height/2);
        let displacement = mouseUIPos.subtract(screenMid);
        let dir = displacement.normalized();
        let ratio = new Vector2(Math.abs(displacement.x)/screenMid.x, Math.abs(displacement.y)/screenMid.y);
        if(ratio > 1) ratio = 1;    //clamp ratio
        let lookPosX = dir.x * _lookDist* 9 * ratio.x;
        let lookPosY = dir.y * _lookDist* 16 * ratio.y;
        app.stage.pivot.x = lerp(app.stage.pivot.x, lookPosX, _deltaTime);
        app.stage.pivot.y = lerp(app.stage.pivot.y, lookPosY, _deltaTime);
        if(isCloseEnough(app.stage.pivot.x, lookPosX, 0.01))
            app.stage.pivot.x = lookPosX;
        if(isCloseEnough(app.stage.pivot.y, lookPosY, 0.01))
            app.stage.pivot.y = lookPosY;
        app.stage.position.x -= _moveAccel.x //+ lookMult.x;
        app.stage.position.y -= _moveAccel.y //+ lookMult.y;
    }
    //#region Physics/Game Variables
    //For Movements
    var wishDir=new Vector2(0,0);
    var fwdSpdMult = 1.2, bckSpdMult = 0.7;
    const moveSpd = 5;
    const friction = 4.5;
    const accelSpd = 7;
    var dirSpdMult = 1;
    var playerMoveAccel = new Vector2(0,0);
    

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
    //TEST
    physicsTicker.add((time)=>{
        const DeltaTime = (time.elapsedMS/1000);
        //player accel
        dirSpdMult = clamp(viewDir.dot(wishDir) + 1, bckSpdMult, fwdSpdMult);
        let wishAccel = wishDir.scale(moveSpd * dirSpdMult);
        
        var accelRateX = wishDir.x === 0 ? friction : accelSpd;
        var accelRateY = wishDir.y === 0 ? friction : accelSpd; 
        
        playerMoveAccel.x = lerp(playerMoveAccel.x, wishAccel.x, DeltaTime * accelRateX);
        playerMoveAccel.y = lerp(playerMoveAccel.y, wishAccel.y, DeltaTime * accelRateY);
        
        if(isCloseEnough(playerMoveAccel.x, wishAccel.x, 0.01))
             playerMoveAccel.x = wishAccel.x;
        if(isCloseEnough(playerMoveAccel.y, wishAccel.y, 0.01))
             playerMoveAccel.y = wishAccel.y;
        //TESTING COLLISION
        var boxVertexPos = [];
        boxCollider.points.forEach(p => {
            let gpos = box.toGlobal(p)
            boxVertexPos.push(pointToVector2(gpos))
        });
        //console.log(boxVertexPos);
        var playerVertexPos = [];
        playerCollider.points.forEach(p => {
            let gpos = player.toGlobal(p)
            playerVertexPos.push(pointToVector2(gpos))
        });
        
        let collisionResult = satCollision(playerVertexPos, boxVertexPos);
        let hit = collisionResult.hit;
        let mtv = collisionResult.mtv;
        let mtvDir = mtv.normalized();
        if(hit){ 
            //pushes player back out
            player.position.x += mtv.x
            player.position.y += mtv.y
            //camera still centers on player
            app.stage.position.x -= mtv.x
            app.stage.position.y -= mtv.y

            // let moveMag = wishAccel.magnitude();
            // let moveDir = wishAccel.normalized();
            // let realDir = moveDir.subtract(mtvDir).normalized();
            // let dot = moveDir.dot(realDir);
            // playerMoveAccel = realDir.scale(moveMag * dot);
            console.log('hit', mtv);
        }
        //console.log(playerMoveAccel);

        //player view
        tarViewRange = ads ? aimViewRange : defaultViewRange;
        tarFov = ads ? aimFov : defaultFov;
    })
    function pointToVector2(_p){
        return new Vector2(_p.x, _p.y);
    }
    //#endregion

    //#region Update Loop
    app.ticker.add((time) => {
        playerPos = new Vector2(player.position.x, player.position.y);
        const DeltaTime = (time.elapsedMS/1000);
        
        if(a && !d) wishDir.x = -1;
        else if(d && !a) wishDir.x = +1;
        else wishDir.x = 0;

        if(w && !s) wishDir.y = -1;
        else if(s && !w) wishDir.y = +1;
        else wishDir.y = 0;

        wishDir = wishDir.normalized();

        movePlayer(playerMoveAccel);
        moveCamera(playerMoveAccel, DeltaTime, lookDist);

        //Can use tween maybe
        curViewRange = lerp(curViewRange, tarViewRange, DeltaTime*aimSpd);
        curFov = lerp(curFov, tarFov, DeltaTime*aimSpd);
        if(isCloseEnough(curViewRange, tarViewRange, 0.01))
            curViewRange = tarViewRange;
        if(isCloseEnough(curFov, tarFov, 0.01))
            curFov = tarFov;
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

