import { Graphics, Sprite, Assets, Point, Container} from "../pixi.mjs"
import Vector2 from "../modules/Vector2.js";
import pixiCollider from "./pixiCollider.js";

const player = new Container();
export default player;
export const playerCollider = pixiCollider.createCircularCollider(100, 6);
export const rayCollider = pixiCollider.createRay(0, 500);
//pixiCollider.createRectCollider(-100, -100, 200, 200)
//pixiCollider.createRay(0,500);
async function addPlayerSprite(){
    const texture = await Assets.load('../public/images/survivor-idle_shotgun_0.png');
    const sprite = Sprite.from(texture);
    sprite.anchor.set(0.5, 0.5);
    sprite.scale.set(1, 1);
    return sprite;
}
player.label = 'player'
const playerSprite  = await addPlayerSprite();
// const rayCastLine = new Graphics()
//         .lineTo(0, 600) //draw raycast path
//         .stroke({width : 3, color : 'red'});

// rayCastLine.rotation =  -Math.PI/2;
player.addChild(playerSprite);
//DEBUG COLLIDER
let playerColDebug = new Graphics(playerCollider.graphicsCtx).stroke({color : 'red', width : 3});
player.addChild(playerColDebug);
