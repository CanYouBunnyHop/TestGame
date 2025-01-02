export function lerp(_start, _end, _amt){
    return _start + _amt * (_end - _start);
}

export default class Tween{
    constructor(_subject, _properties, _duration, _easing) {
        this.subject = _subject;
        this.properties = _properties;
        this.duration = _duration;
        this.easing = _easing;
    }
    static linear(t) {return t;}
    static easeIn(t) {return t*t;}
    static easeOut(t) {return t*(2-t);} 
    static easeInOut(t) {return t<0.5? 2*t*t : (4-2*t)*t -1 ;}

    start(){requestAnimationFrame(this.update.bind(this.start));}

    update(time){
        if(time >= this.duration){ this.end(); return;}
        //update properties
        let progress = time/this.duration;
        for(const prop in this.properties){
            this.subject[prop] =  this.easing(progress) * this.properties[prop];
        }
        requestAnimationFrame(this.update);
    }
    end(){this.subject = {...this.subject, ..._properties};}
}