import { Graphics, Sprite, Assets, Point, Container} from "../pixi.mjs"
import Vector2 from "../modules/Vector2.js";

const player = new Container();
export default player;
export const playerPoints = [
    new Point(-100, -100),
    new Point(-100, 100),
    new Point(100, 100),
    new Point(100, -100),
    
    
]
async function addPlayerSprite(){
    const texture = await Assets.load('../public/images/survivor-idle_shotgun_0.png');
    const sprite = Sprite.from(texture);
    sprite.anchor.set(0.5, 0.5);
    sprite.scale.set(1, 1);
    return sprite;
}
function addPlayerCollider(_playerPoints){
    const graphics = new Graphics()
        .poly(playerPoints)
        .stroke({width : 3, color : 'red'});
    return graphics;
}

player.label = 'player'

const playerSprite  = await addPlayerSprite();
const playerCollider = addPlayerCollider();
const rayCastLine = new Graphics()
        .lineTo(0, 600) //draw raycast path
        .stroke({width : 3, color : 'red'});
rayCastLine.rotation =  -Math.PI/2;
player.addChild(playerSprite, playerCollider, rayCastLine);

