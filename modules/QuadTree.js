import { ColliderGraphics } from "../room/pixiCollider.js";
import { Bounds as pixiBounds, Point} from "../pixi.mjs";
import Vector2 from "./Vector2.js";

//for debugging
import {debugLine} from "../room/collisionTest.js"

export class Bounds{
    constructor(_minX, _maxX, _minY, _maxY){
        this.minX = _minX; this.maxX = _maxX;
        this.minY = _minY; this.maxY = _maxY;

        this.midX = _minX + (_maxX - _minX)/2;
        this.midY = _minY + (_maxY - _minY)/2;
    }
    overlaps(_other){
        let xIsWithin = _other.minX < this.maxX && _other.maxX >= this.minX;
        let yIsWithin = _other.minY < this.maxY && _other.maxY >= this.minY;
        return xIsWithin && yIsWithin;
    }
    within(_point){
        let xIsWithin = _point.x < this.maxX && _point.x >= this.minX;
        let yIsWithin = _point.y < this.maxY && _point.y >= this.minY;
        return xIsWithin && yIsWithin;
    }
}
export default class QuadTreeNode{
    constructor(_bounds, _parentNode = null, _depth = 0, _colliders = []){
        this.bounds = _bounds;
        this.parentNode = _parentNode;
        this.depth = _depth;
        this.colliders = _colliders; //stores ColliderGraphics
        this.isLeaf = true; //isLeaf means there are no splits
    }
    getNode(_collider, _baseNode = this){
        //input collider, output node?
        //for each vertex, get the deepest quadrants
        const colBounds = _collider.getBounds();
        
        //pseudo coding?
        const topLeft = new Point(colBounds.minX, colBounds.minY);
        const topRight = new Point(colBounds.maxX, colBounds.minY);
        const botLeft = new Point(colBounds.minX, colBounds.maxY);
        const botRight = new Point(colBounds.maxX, colBounds.maxY);

        //get the node where topLeft is in
        //1) let innerNode = _baseNode
        //2) if innerNode is leaf, retrieve colliders
        //3) else go inwards till innerNode is leaf


        //get the node where topRight is in
        //get the node where botLeft is in
        //get the node where botRight is in

    }
    //change this to take in polygon
    //check if some vertex is in which quad, add polygon to those quad
    /**@param {ColliderGraphics} _collider */
    insert(_collider, _curNode = this){
        //need the reference ColliderGraphics object in scene
        //need the points, so i can use toGlobal(p)
        //const globalVerts = _collider.getGlobalVertices()
        
        //sub divide until the maximum amount of polygon is 5 in a quadrant
        const maxCount = 3; const maxDepth = 5; 

        //add collider to current node if count is not exceeded or maxDepth has been reached
        if (_curNode.colliders.length < maxCount || this.depth > maxDepth){ 
            _curNode.colliders.push(_collider);
            return;
        }
        if(_curNode.isLeaf && _curNode.colliders.length >= maxCount){
            _curNode.splitQuad();
        }

        //get collider's global bounds
        const colBounds = _collider.getBounds(); //this returns minx maxx miny maxy
        let minXisLeft = colBounds.minX < this.bounds.midX;
        let minYisTop = colBounds.minY < this.bounds.midY;
        let maxXisLeft = !minXisLeft ? false : colBounds.maxX < this.bounds.midX;
        let maxYisTop = !minYisTop ? false : colBounds.maxY < this.bounds.midY;

        let topL = minXisLeft && minYisTop;
        let topR = !maxXisLeft && minYisTop;
        let botL = minXisLeft && !maxYisTop;
        let botR = !maxXisLeft && !maxYisTop;
        //console.log(colBounds.minX, _curNode.bounds.midX);
        //recursion
        if(topL)
            this.topL.insert(_collider, this.topL);
        if(topR)
            this.topR.insert(_collider, this.topR);
        if(botL)
            this.botL.insert(_collider, this.botL);
        if(botR)
            this.botR.insert(_collider, this.botR);
    }
    //only split quad if each vertex is in the same quad
    splitQuad(){
        let north = [this.bounds.minY, this.bounds.midY];
        let south = [this.bounds.midY, this.bounds.maxY];
        let west = [this.bounds.minX, this.bounds.midX];
        let east = [this.bounds.midX, this.bounds.maxX];

        let nw = new Bounds(...west, ...north);
        let ne = new Bounds(...east, ...north);
        let sw = new Bounds(...west, ...south);
        let se = new Bounds(...east, ...south);
        
        //create new node
        this.topL = new QuadTreeNode(nw, this, this.depth+1);
        this.topR = new QuadTreeNode(ne, this, this.depth+1);
        this.botL = new QuadTreeNode(sw, this, this.depth+1);
        this.botR = new QuadTreeNode(se, this, this.depth+1);
        this.isLeaf = false;

        //move colliders into the new nodes
        for(let col of this.colliders){
            let colBounds = col.getBounds();
            if(this.topL.bounds.overlaps(colBounds)){
                this.topL.insert(col, this.topL);
            }
            if(this.topR.bounds.overlaps(colBounds)){
                this.topR.insert(col, this.topR);
            }
            if(this.botL.bounds.overlaps(colBounds)){
                this.botL.insert(col, this.botL);
            }
            if(this.botR.bounds.overlaps(colBounds)){
                this.botR.insert(col, this.botR);
            }
        }
        //for debugging
        debugLine(new Point(this.bounds.midX, this.bounds.minY), new Point(this.bounds.midX, this.bounds.maxY));//mid vertical
        debugLine(new Point(this.bounds.minX, this.bounds.midY), new Point(this.bounds.maxX, this.bounds.midY));//mid horizontal
    }
    //getNode(_currentBounds)
}
