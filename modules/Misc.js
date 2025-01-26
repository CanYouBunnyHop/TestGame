export function isCloseEnough(_subject, _target, _range){
    return Math.abs(_subject - _target) <= _range;
}

export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

export function getMinMax(_arr){
    var min = _arr[0];
    var max = _arr[0];

    _arr.forEach(number => {
        if(number < min)min = number;
        if(number > max)max = number;
    });
    return new minMaxPair(min, max);
}
export class minMaxPair{
    constructor(_min, _max) {this.min = _min; this.max = _max;}
}