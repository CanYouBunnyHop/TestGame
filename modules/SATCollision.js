import Vector2 from "./Vector2.js";
/**
* @param {Vector2[]} polygonA 
* @param {Vector2[]} polygonB
**/
export function satCollision(polygonA, polygonB){ //array of vertices of 2 object 
    let mtv = new Vector2(0,0);
    let minOverlap = Infinity;
    const polygons = [polygonA, polygonB];
    let isColliding = true;
    //filter out duplicate axes ? for optimization
    for (let p = 0; p < 2; p++){
        const vertices = polygons[p]; 
        for (let i = 0; i < vertices.length; i++){
            const current = vertices[i];
            const next = i !== vertices.length-1 ? vertices[i + 1] : vertices[0];
            // Calculate the edge vector and its perpendicular (normal)
            const edge = next.subtract(current);
            const axis = getNormal(edge).normalized();
            // Project both polygons onto the axis
            const a = getProjection(polygonA, axis);
            const b = getProjection(polygonB, axis);

            let smallerMax = Math.min(a.max, b.max);
            let largerMin = Math.max(a.min, b.min);
            let overlap = smallerMax - largerMin;

            if(overlap <= 0){
                //return new collisionInfo(false, new Vector2(0,0));
                isColliding = false;
                break;
            }
            
            if (overlap < minOverlap) {
                minOverlap = overlap;
                const projectionCenterA = (a.min + a.max) / 2;
                const projectionCenterB = (b.min + b.max) / 2;
                const direction = projectionCenterB < projectionCenterA ?  axis : axis.negate();
                mtv = direction.scale(minOverlap);
            }
        }
    }
    
    if(!isColliding) mtv = new Vector2(0,0);
    return new collisionInfo(isColliding, mtv);
}
class collisionInfo{
    constructor(_hit, _mtv){
        this.hit = _hit;
        this.mtv = _mtv;
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
function getNormal(v){ //the current edge, 2 vetices //edge normal
    return new Vector2(v.y, -v.x) //x=y, y=-x 
}