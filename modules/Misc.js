export function isCloseEnough(_subject, _target, _range){
    return Math.abs(_subject - _target) <= _range;
}

export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}
