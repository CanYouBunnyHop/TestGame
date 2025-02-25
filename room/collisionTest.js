import {Application, Graphics} from "../pixi.mjs"
import ColliderCtx, {ColliderGraphics} from "./pixiCollider.js"
import QuadTreeNode, {Bounds} from '../modules/QuadTree.js';

const app = new Application();
(async()=>{
    await app.init({
        resizeTo : window,
        backgroundAlpha : 1,
        backgroundColor : '2c2e39',
        antialias : false,
        useBackBuffer: true, //idk what this is, for webgl
    });
    const treeBounds = new Bounds(0, window.innerWidth, 0,window.innerHeight);
    const baseNode = new QuadTreeNode(treeBounds);

    document.body.addEventListener("pointerdown", (ev)=>{
        drawSquare(ev.clientX, ev.clientY);
    });
    console.log(app.stage.width, app.stage.height);
    document.body.appendChild(app.canvas);

    //setup on mouse click draw a collider graphics
    //setup drawing split quads?
    //setup satcollision and collision exit
    let mSquare = drawSquare(0, 0);
    mSquare.eventMode = 'static';
    mSquare.strokeStyle.color = 0xFFFFFF;
    mSquare.on('globalpointermove', (ev)=>{mSquare.position.set(ev.clientX, ev.clientY)});
    app.stage.addChild(mSquare);

    //draw a collider, it follows mouse, change color?
    function drawSquare(_x, _y){
        let square = ColliderCtx.createRectCollider(0, 0, 50, 50).draw();
        square.stroke({width : 2, color : 'blue'});
        square.position.set(_x, _y);
        app.stage.addChild(square);
        baseNode.insert(square);
        console.log(baseNode);
        return square;
    }
    // /**@param {ColliderGraphics} _graphics */
    // function reStroke(_graphics, _strokeStyle){
    //     let old = _graphics;
    //     let ctx = _graphics.strokeStyle;
    //     _graphics.clear();
    // }
})();

//FOR DEBUGGING //NEED SOME RESTRUCTURE TO CALL THIS FUNCTION
export function debugLine(_pointA, _pointB){
    let graphics = new Graphics()
        .moveTo(_pointA.x, _pointA.y)
        .lineTo(_pointB.x, _pointB.y)
        .stroke({width : 2, color : 'red'});
    app.stage.addChild(graphics);
}