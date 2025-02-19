import { ColliderGraphics } from "../room/pixiCollider.js";
import { Bounds as pixiBounds, Point} from "../pixi.mjs";
import Vector2 from "./Vector2.js";

//for debugging
import {debugLine} from "../room/collisionTest.js"

//const baseNode = new QuadTreeNode(0,100, 0,100);
export class Bounds{
    constructor(_minX, _maxX, _minY, _maxY){
        this.minX = _minX;
        this.maxX = _maxX;
        this.minY = _minY;
        this.maxY = _maxY;

        this.midX = _minX + (_maxX - _minX)/2
        this.midY = _minY + (_maxY - _minY)/2 //0 + (200 - 0)/2 = 0 + 100
    }
}
export default class QuadTreeNode{
    constructor(_bounds, _parentNode = null, _colliders = []){
        this.bounds = _bounds;
        this._parentNode = _parentNode;
        this.colliders = _colliders; //stores ColliderGraphics
        
        this.isLeaf = true; //isLeaf means there are no splits

        //calculate bounds for each child quad
        this.midX = this.bounds.midX//_bounds.minX + (_bounds.maxX-_bounds.minX)/2
        this.midY = this.bounds.midY//_bounds.minY + (_bounds.maxY-_bounds.minY)/2
    }
    //change this to take in polygon
    //check if some vertex is in which quad, add polygon to those quad
    /**@param {ColliderGraphics} _collider */
    insert(_collider, _curNode = this){
        //need the reference ColliderGraphics object in scene
        //need the points, so i can use toGlobal(p)
        //const globalVerts = _collider.getGlobalVertices()
        
        //get collider's global bounds
        const colBounds = _collider.getBounds(); //this returns minx maxx miny maxy
        //sub divide until the maximum amount of polygon is 5 in a quadrant
        const maxCount = 3; 
        //add collider to current node if count is not exceeded
        if (_curNode.colliders.length < maxCount){
            _curNode.colliders.push(_collider);
            console.log('added');
            return;
        }
        if(_curNode.isLeaf)
            _curNode.splitQuad();
        let minXisLeft = colBounds.minX < _curNode.midX;
        let minYisTop = colBounds.minY < _curNode.midY;
        let maxXisLeft = !minXisLeft ? false : colBounds.maxX < _curNode.midX;
        let maxYisTop = !minYisTop ? false : colBounds.maxY < _curNode.midY;

        let topL = minXisLeft && minYisTop;
        let topR = !maxXisLeft && minYisTop; //maxX has to be right
        let botL = minXisLeft && !maxYisTop;
        let botR = !maxXisLeft && !maxYisTop;

        //recursion
        if(topL){
            this.topL.insert(_collider, this.topL);
            console.log("topl")
        }
            
        if(topR){
            this.topR.insert(_collider, this.topR);
            console.log("topr")
        }
            
        if(botL){
            this.botL.insert(_collider, this.botL);
            console.log("botl")
        }
           
        if(botR){
            this.botR.insert(_collider, this.botR);
            console.log("botr")
        }
        console.log(minXisLeft, maxXisLeft, minYisTop, maxYisTop);
        //go back up and re-insert old colliders
    }
    //only split quad if each vertex is in the same quad
    splitQuad(){
        let north = [this.bounds.minY, this.midY];
        let south = [this.midY, this.bounds.maxY];
        let west = [this.bounds.minX, this.midX];
        let east = [this.midX, this.bounds.maxX];

        let nw = new Bounds(...west, ...north);
        let ne = new Bounds(...east, ...north);
        let sw = new Bounds(...west, ...south);
        let se = new Bounds(...east, ...south);
        
        //create new node
        this.topL = new QuadTreeNode(nw, this);
        this.topR = new QuadTreeNode(ne, this);
        this.botL = new QuadTreeNode(sw, this);
        this.botR = new QuadTreeNode(se, this);
        this.isLeaf = false;

        //for debugging
        debugLine(new Point(this.midX, this.bounds.minY), new Point(this.midX, this.bounds.maxY));//mid vertical
        debugLine(new Point(this.bounds.minX, this.midY), new Point(this.bounds.maxX, this.midY));//mid horizontal
    }
}
