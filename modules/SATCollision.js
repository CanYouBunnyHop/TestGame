import Vector2 from "./Vector2.js";
import { getMinMax } from "./Misc.js";
/**
* @param {Vector2[]} polygonA 
* @param {Vector2[]} polygonB
**/
export function satCollision(polygonA, polygonB){ //array of vertices of 2 object 
    //find perpendiculars of polygonA and polygonB 
    //if one projection is not colliding, then they are not colliding
    let normalsA = getEdgeNormals(polygonA);
    let normalsB = getEdgeNormals(polygonB);
    let normals = normalsA.concat(normalsB);
    //console.log(polygonA);
    //filter out duplicate normals
    normals = normals.filter((item, index)=>normals.indexOf(item)===index);
    //console.log(normals);
    //let collide = true;
    let smallestNorm = Vector2.zero;
    let smallestO = Infinity;
    //project each vertex to the normal
    for(const norm of normals){
        let projsA = getProjections(polygonA, norm);
        let projsB = getProjections(polygonB, norm);
        //find min and max
        let a = getMinMax(projsA);
        let b = getMinMax(projsB);
        //console.log(a, b)

        //calc if these proj are overlapping
        let noOverlap = 
            (a.min < b.min && a.max < b.min) ||
            (b.min < a.min && b.max < a.min);
        if(noOverlap) return new collisionInfo(false, Vector2.zero);
        //to determine minimum translation vector
        //find smallest overlapping section
        //get the current normal
        //mtv direction = currentNormal
        //mtv magnitude = overlap

        //GET OVERLAP
        //determin first line and second line
        let frstL = a.min <= b.min ? a : b;
        let scndL = a.min <= b.min ? b : a;
        let omin = scndL.min;
        let omax = frstL.max > scndL.max ? scndL.max : frstL.max;
        let oLength = omax - omin;
        
        if(oLength < smallestO) {
            smallestO = oLength;
            smallestNorm = norm;
        }
    }
    //min Translation Vector
    let mtv = smallestNorm.scale(smallestO);
    console.log(mtv);
    return new collisionInfo(true, mtv);
}
class collisionInfo{
    constructor(_hit, _mtv ,_collisionPoints){
        this.hit = _hit;
        this.mtv = _mtv;
        this.collisionPoints = _collisionPoints;
    }
}
function getProjections(polygon, norm){
    let projections = []
    polygon.forEach(vert=>{
        projections.push(vert.dot(norm));
    });
    return projections;
}
function getEdgeNormals(polygon){
    let normals = [];
    for(let i = 0; i < polygon.length-1 ; i++){
        let vertA = polygon[i];
        let vertB = i === polygon.length-1 ? polygon[0] : polygon[i+1];
        //console.log(vertB);
        let direction = unitVector(vertA, vertB);
        normals.push(perpendicularVector(direction));
    }
    return normals;
}

/**
* @param {Vector2} vertA 
* @param {Vector2} vertB
**/
function unitVector(vertA, vertB){ //using v_a as origin find direction to v_b
    let x  = vertB.x - vertA.x;
    let y = vertB.y - vertA.y;
    //console.log(vertA, vertB);
    let dir = new Vector2(x, y);
    //console.log(dir)
    return dir.normalized();
}

/** @param {Vector2} v */ 
function perpendicularVector(v){ //the current edge, 2 vetices //edge normal
    return new Vector2(v.y, -v.x) //x=y, y=-x 
}