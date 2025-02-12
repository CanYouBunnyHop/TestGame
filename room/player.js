import { Graphics, Sprite, Assets, Point, Container} from "../pixi.mjs"
import Vector2 from "../modules/Vector2.js";
import ColliderCtx from "./pixiCollider.js";

//const player = new Container();

export const playerCollider = ColliderCtx.createCircularCollider(100, 6);
export const rayCollider = ColliderCtx.createRay(0, 500);
//ColliderCtx.createRectCollider(-100, -100, 200, 200)
//ColliderCtx.createRay(0,500);
//DEBUG COLLIDER
export const player = playerCollider.draw().stroke({color : 'red', width : 3});
export default player;
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

