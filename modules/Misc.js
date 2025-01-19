export function isCloseEnough(_subject, _target, _range){
    return Math.abs(_subject - _target) <= _range;
}

export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

export function getMinMax(_arr){
    var min = _arr[0];
    var max = _arr[0];
    _arr.reduce((pair, cur)=>{
        if(cur < min)min = cur;
        if(cur > max)max = cur;
    });
    return new minMaxPair(min, max);
}
export class minMaxPair{
    constructor(_min, _max) {this.min = _min; this.max = _max;}
}