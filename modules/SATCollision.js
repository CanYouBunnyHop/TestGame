import Vector2 from "./Vector2.js";
import { getMinMax } from "./Misc.js";
/**
* @param {Vector2[]} polygonA 
* @param {Vector2[]} polygonB
**/
export function satCollision(polygonA, polygonB){ //array of vertices of 2 object 
    let mtv = new Vector2(0,0);
    let minOverlap = Infinity;
    const polygons = [polygonA, polygonB];
    
    //filter out duplicate axes ? for optimization
    
    for (let p = 0; p < 2; p++){
        const vertices = polygons[p]; 
        for (let i = 0; i < vertices.length; i++){
            const current = vertices[i];
            const next = i !== vertices.length-1 ? vertices[i + 1] : vertices[0];
            // Calculate the edge vector and its perpendicular (normal)
            const edge = next.subtract(current);
            const axis = perpendicularVector(edge.normalized());
            // Project both polygons onto the axis
            const a = getProjection(polygonA, axis);
            const b = getProjection(polygonB, axis);

            const overlap = Math.min(a.max, b.max) - Math.max(a.min, b.min);
            console.log(overlap, 'overlap');
            if(overlap <= 0){
                return new collisionInfo(false, new Vector2(0,0));
            }
                
            if (overlap < minOverlap) {
                minOverlap = overlap;
                const direction = axis.dot(current.subtract(next)) < 0 ? 
                    axis : new Vector2(-axis.x, -axis.y);
                mtv = new Vector2(direction.x * overlap, direction.y * overlap);
            }
        }
    }
    return new collisionInfo(true, mtv);
}
class collisionInfo{
    constructor(_hit, _mtv){
        this.hit = _hit;
        this.mtv = _mtv;
        //this.collisionPoints = _collisionPoints;
    }
}
function getProjection(vertices, axis){
    let min = vertices[0].dot(axis);
    let max = min;
    for(let i = 1; i < vertices.length; i++){
        const projection = vertices[i].dot(axis);
        min = Math.min(min, projection);
        max = Math.max(max, projection);
    }
    return {min, max};
}
/**
* @param {Vector2} vertA 
* @param {Vector2} vertB
**/
function unitVector(vertA, vertB){ //using v_a as origin find direction to v_b
    let x  = vertB.x - vertA.x;
    let y =  vertB.y - vertA.y;
    //console.log(vertA, vertB);
    let dir = new Vector2(x, y);
    
    return dir.normalized();
}

/** @param {Vector2} v */ 
function perpendicularVector(v){ //the current edge, 2 vetices //edge normal
    return new Vector2(v.y, -v.x) //x=y, y=-x 
}