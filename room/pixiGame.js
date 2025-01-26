import {Graphics, Point} from "../pixi.mjs";

function createPolyCollider(...points){
    let graphics = new Graphics().poly(points)
    return graphics //do i need to return points?
}

// function readStaticMapJson(){

// }