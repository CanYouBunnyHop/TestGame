import {GraphicsContext, Graphics, Point} from "../pixi.mjs";
export default class pixiCollider{
    constructor(_points, _graphicsCtx){
        this.graphicsCtx = _graphicsCtx;
        this.points = _points;
    }
    static createPolygonCollider(..._points){
        let graphicsCtx = new GraphicsContext().poly(_points);
        return new pixiCollider(_points, graphicsCtx);
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
        let graphicsCtx = new GraphicsContext().poly(points);
        return new pixiCollider(points, graphicsCtx);
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
        console.log(points);
        let graphicsCtx = new GraphicsContext().poly(points);
        return new pixiCollider(points, graphicsCtx);
    }
}