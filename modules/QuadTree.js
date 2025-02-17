import { ColliderGraphics } from "../room/pixiCollider.js";
import { Bounds as pixiBounds} from "../pixi.mjs";
import Vector2 from "./Vector2.js";
class Bounds{
    constructor(_minX, _maxX, _minY, _maxY){
        this.minX = _minX;
        this.maxX = _maxX;
        this.minY = _minY;
        this.maxY = _maxY;
    }
}
class QuadTreeNode{
    constructor(_bounds, _parentNode = null, _colliders = []){
        this.bounds = _bounds;
        this._parentNode = _parentNode;
        this.colliders = _colliders; //stores ColliderGraphics
        
        this.isLeaf = true; //isLeaf means there are no splits
        this.nw = null; this.ne = null;
        this.sw = null; this.se = null;

        //calculate bounds for each child quad
        this.midX = _bounds.minX + (_bounds.maxX-_bounds.minX)/2
        this.midY = _bounds.minY + (_bounds.maxY-_bounds.minY)/2
    }
    //change this to take in polygon
    //check if some vertex is in which quad, add polygon to those quad
    /**@param {ColliderGraphics} _collider */
    insert(_collider, _curNode = baseNode){
        //need the reference ColliderGraphics object in scene
        //need the points, so i can use toGlobal(p)
        //const globalVerts = _collider.getGlobalVertices()
        
        //get collider's global bounds
        const colBounds = _collider.getBounds(); //this returns minx maxx miny maxy
        //sub divide until the maximum amount of polygon is 5 in a quadrant
        const maxCount = 5; 
        //add collider to current node if count is not exceeded
        if (_curNode.colliders.length < maxCount){
            _curNode.colliders.push(_collider);
            return;
        }
        if(_curNode.isLeaf)
            _curNode.splitQuad();
        let minXisLeft = colBounds.minX < _curNode.midX;
        let minYisTop = colBounds.minY < _curNode.midY;
        let maxXisLeft = !minXisLeft ? false : colBounds.maxX >= _curNode.midX;
        let maxYisTop = !minYisTop ? false : colBounds.maxY >= _curNode.midY;

        let topL = minXisLeft && minYisTop;
        let topR = !maxXisLeft && minYisTop; //maxX has to be right
        let botL = minXisLeft && !maxYisTop;
        let botR = !maxXisLeft && !maxYisTop;

        if(topL) //recursion
            this.topL.insert(_collider, this.topL);
        if(topR)
            this.topR.insert(_collider, this.topR);
        if(botL)
            this.botL.insert(_collider, this.botL);
        if(botR)
            this.botR.insert(_collider, this.botR);
        
        //CHECK CURRENT NODE IS FULL
        //IF NOT FULL ADD TO CURRENT NODE, RETURN
        //IF FULL, CHECK IF CURNODE IS LEAF
        //IF IS LEAF, SUBDIVIDE FIRST

        //CHECK IF MINX, MAXX IS L OR R HALFS
        //CHECK IF MINY, MAXY IS T OR B HALFS
        //BOOLEANS L,R || T,B
        //DEPENDING ON BOOLEANS, SELECT SPECIFIED QUADRANTS

        //RECURSION
        //FOR EACH SPECIFIED QUADRANTS 
        //CHECK CURQUAD IS FULL
        //IF NOT FULL, ADD TO CURQUAD, CONTINUE 
        //IF FULL, CHECK IF CURQUAD IS LEAF
        //IF IS LEAF, SUBDIVIDE FIRST
        //...


        //corners //DONT NEED CORNERS
        //let topL = new Vector2(colBounds.minX, colBounds.minY);
        //let topR =  new Vector2(colBounds.maxX, colBounds.minY);
        //let botL = new Vector2(colBounds.minX, colBounds.maxY);
        //let botR = new Vector2(colBounds.maxX, colBounds.maxY);

        //this.value.push(_collider);
    }
    //only split quad if each vertex is in the same quad
    splitQuad(){
        let north = [this.bounds.minY, midY];
        let south = [midY, this.bounds.maxY];
        let west = [this.bounds.minX, midX];
        let east = [midX, this.bounds.maxX];

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
    }
}
const baseNode = new QuadTreeNode(new Bounds(0,100, 0,100));
//parse in each static polygons
// function growTree(_rectBound){
//     const maxCount = 5; //sub divide until the maximum amount of polygon is 5 in a quadrant
//     let curNode = baseNode;
//     //if every vertex is outside of bounds, return
//     //USE AABB, USING POLYGON MAKES IT SLOWER






//     // if(!_rectBound.every(vertex => isWithinBounds(vertex, curNode.bounds))) return;
//     // //find the deepest quadrant for the polygon
//     // for(let curDepth = 0; curDepth < maxDepth; curDepth++){
//     //     //if polygon is completely within a child bound
//     //     //if quad can be split further in child bound
//     //     if(_rectBound.every(vertex => isWithinBounds(vertex, curNode.nwb))){
//     //         if(curNode.isLeaf) curNode.splitQuad();
//     //         curNode = curNode.nw;
//     //     }
//     //     else if(_rectBound.every(vertex => isWithinBounds(vertex, curNode.neb))){
//     //         if(curNode.isLeaf) curNode.splitQuad();
//     //         curNode = curNode.ne;
//     //     }
//     //     else if(_rectBound.every(vertex => isWithinBounds(vertex, curNode.swb))){
//     //         if(curNode.isLeaf) curNode.splitQuad();
//     //         curNode = curNode.sw;
//     //     }
//     //     else if(_rectBound.every(vertex => isWithinBounds(vertex, curNode.seb))){
//     //         if(curNode.isLeaf) curNode.splitQuad();
//     //         curNode = curNode.se;
//     //     }
//     //     else break;
//     // }
//     // //Insert polygon at the deepest level, or when poly spans across multiple quadrant
//     // curNode.pushValue(_rectBounds);
// }
// // function getPotentialColliders(_polygon, _node = baseNode){
// //     const maxDepth = 8;
// //     let results = [];
// //     //if every vertex is outside of bounds, return
// //     if(!_polygon.every(vertex => isWithinBounds(vertex, _node.bounds))) return [];

// //     for(let curDepth = 0; curDepth < maxDepth; curDepth++){
// //         results.push(..._node.value)
// //         if(_node.isLeaf) break;

// //         if(_polygon.every(vertex => isWithinBounds(vertex, _node.nwb))){
// //             _node = _node.nw;
// //         }
// //         else if(_polygon.every(vertex => isWithinBounds(vertex, _node.neb))){
// //             _node = _node.ne;
// //         }
// //         else if(_polygon.every(vertex => isWithinBounds(vertex, _node.swb))){
// //             _node = _node.sw;
// //         }
// //         else if(_polygon.every(vertex => isWithinBounds(vertex, _node.seb))){
// //             _node = _node.se;
// //         }
// //         else break; //not every vertex are
// //     }
// //     if(!_node.isLeaf){
// //         for(let childNode of [_node.nw, _node.ne, _node.sw, _node.se]){
// //             results = results.concat(getPotentialColliders(_polygon, childNode));
// //         }
// //     }
// //     return results;//_node.value;
// // }
// function isWithinBounds(_vertex, _bounds){
//     if (_vertex.x < _bounds.x.min || _vertex.x > _bounds.x.max) return false;
//     if (_vertex.y < _bounds.y.min || _vertex.y > _bounds.y.max) return false;
//     return true;
// }