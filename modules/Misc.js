export function isCloseEnough(_subject, _target, _range){
    return Math.abs(_subject - _target) <= _range;
}

export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

export function getMinMax(_arr){
    return _arr.reduce((pair, cur)=>{
        if(cur < pair.min) pair.min = cur;
        if(cur > pair.max) pair.max = cur;
    }, new minMaxPair(_arr[0], _arr[0]));
}
export class minMaxPair{
    constructor(_min, _max) {this.min = _min; this.max = _max;}
}