export default class Vector2 {
    constructor(_x, _y) { this.x = _x; this.y = _y; }
    add(other) { return new Vector2(this.x + other.x, this.y + other.y); }
    subtract(other) { return new Vector2(this.x - other.x, this.y - other.y); }
    scale(factor) { return new Vector2(this.x * factor, this.y * factor); }
    dot(other) { return this.x * other.x + this.y * other.y; }
    normalized(){ 
        let l = Math.sqrt(this.x*this.x + this.y*this.y);
        let x = Number.isNaN(this.x/l) ? 0 : this.x/l;
        let y = Number.isNaN(this.y/l) ? 0 : this.y/l;
        return new Vector2(x, y);
    }
    static lerp(_start, _end, _amt){ //amt is between 0-1
        let x = _start.x + _amt * (_end.x - _start.x);
        let y = _start.y + _amt * (_end.y - _start.y);
        return new Vector2(x,y);
    }
    static zero = new Vector2(0,0);
}
