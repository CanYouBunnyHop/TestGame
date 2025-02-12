import Vector2 from "../modules/Vector2.js";
import {GraphicsContext, Graphics, Point} from "../pixi.mjs";
export class ColliderGraphics extends Graphics {
    /**  @param {ColliderCtx} _colliderCtx */
    constructor(_colliderCtx){
        super(_colliderCtx.ctx);
        this.points = _colliderCtx.points;
    }
    /**@returns {Vector2[]} */
    getGlobalVertices() {
        //convert points to vector2
        return this.points.map(p => new Vector2(...Object.values(super.toGlobal(p))));
    }
}
export default class ColliderCtx {
    constructor(_points, _ctx){
        this.points = _points;
        this.ctx = _ctx;
    }
    draw(){
        return new ColliderGraphics(this);
    }
    static createPolygonCollider(..._points){
        let ctx = new GraphicsContext().poly(_points);
        return new ColliderCtx(_points, ctx);
    }
    static createRay(_angle, _magnitude){
        let points = [ 
            new Point(0, 0), 
            new Point(_magnitude*Math.cos(_angle), _magnitude*Math.sin(_angle)),
        ]
        let ctx = new GraphicsContext().poly(points);
        return new ColliderCtx(points, ctx);
    }
    static createRectCollider(_x, _y, _width, _height){
        let origin = new Point(_x, _y);
        let width = _x + _width;
        let height = _y + _height;
        let points = [
            origin, //top-left
            new Point(width, origin.y), //top-right
            new Point(width, height), //bottom-right
            new Point(origin.x, height) //bottom-left
        ];
        let ctx = new GraphicsContext().poly(points);
        return new ColliderCtx(points, ctx);
    }
    static createCircularCollider(_radius, _vertexCount = 12){
        let points = [];
        for(let i = 0; i < _vertexCount; i++){
            let segment = (2*Math.PI)/(_vertexCount);
            let x = _radius * Math.cos(segment * i);
            let y = _radius * Math.sin(segment * i);
            let point = new Point(x, y);
            points.push(point);
        }
        let ctx = new GraphicsContext().poly(points);
        return new ColliderCtx(points, ctx);
    }
}