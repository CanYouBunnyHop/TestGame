class Bounds{
    constructor(_minX, _maxX, _minY, _maxY){
        this.x = {min:_minX, max:_maxX};
        this.y = {min:_minY, max:_maxY};
    }
}
class QuadTreeNode{
    constructor(_bounds, _parentNode = null, _value = []){
        this.bounds = _bounds;
        this._parentNode = _parentNode;
        this.value = _value; //stores polygons
        
        this.isLeaf = true; //isLeaf means there are no splits
        this.nw = null; this.ne = null;
        this.sw = null; this.se = null;

        //calculate bounds for each child quad
        let midX = this.bounds.x.min + (this.bounds.x.max-this.bounds.x.min)/2
        let midY = this.bounds.y.min + (this.bounds.y.max-this.bounds.y.min)/2
        let north = [this.bounds.y.min, midY];
        let south = [midY, this.bounds.y.max];
        let west = [this.bounds.x.min, midX];
        let east = [midX, this.bounds.x.max];

        this.nwb = new Bounds(...west, ...north);
        this.neb = new Bounds(...east, ...north);
        this.swb = new Bounds(...west, ...south);
        this.seb = new Bounds(...east, ...south);
    }

    pushValue(_value){
        this.value.push(_value);
    }
    //only split quad if each vertex is in the same quad
    splitQuad(){
        if(this.isLeaf === false)return;
        //create new node
        this.nw = new QuadTreeNode(this.nwb, this);
        this.ne = new QuadTreeNode(this.neb, this);
        this.sw = new QuadTreeNode(this.swb, this);
        this.se = new QuadTreeNode(this.seb, this);
        this.isLeaf = false;
    }
    getAllValue(){
        let curNode = this;
        let values = [...this.value];
        if(curNode.isLeaf) return values;

        values.push(curNode.nw.value, curNode.ne.value, curNode.sw.value, curNode.se.value);

        curNode
        
    }
}
const baseNode = new QuadTreeNode(new Bounds(0,100, 0,100));
//parse in each static polygons
function growTree(_polygon){
    const maxDepth = 8;
    let curNode = baseNode;
    //if every vertex is outside of bounds, return
    if(!_polygon.every(vertex => isWithinBounds(vertex, curNode.bounds))) return;
    //find the deepest quadrant for the polygon
    for(let curDepth = 0; curDepth < maxDepth; curDepth++){
        //if polygon is completely within a child bound
        //if quad can be split further in child bound
        if(_polygon.every(vertex => isWithinBounds(vertex, curNode.nwb))){
            if(curNode.isLeaf) curNode.splitQuad();
            curNode = curNode.nw;
        }
        else if(_polygon.every(vertex => isWithinBounds(vertex, curNode.neb))){
            if(curNode.isLeaf) curNode.splitQuad();
            curNode = curNode.ne;
        }
        else if(_polygon.every(vertex => isWithinBounds(vertex, curNode.swb))){
            if(curNode.isLeaf) curNode.splitQuad();
            curNode = curNode.sw;
        }
        else if(_polygon.every(vertex => isWithinBounds(vertex, curNode.seb))){
            if(curNode.isLeaf) curNode.splitQuad();
            curNode = curNode.se;
        }
        else break;
    }
    //Insert polygon at the deepest level, or when poly spans across multiple quadrant
    curNode.pushValue(_polygon);
}
function getPotentialColliders(_polygon, _node = baseNode){
    const maxDepth = 8;
    let results = [];
    //if every vertex is outside of bounds, return
    if(!_polygon.every(vertex => isWithinBounds(vertex, _node.bounds))) return [];

    for(let curDepth = 0; curDepth < maxDepth; curDepth++){
        results.push(..._node.value)
        if(_node.isLeaf) break;

        if(_polygon.every(vertex => isWithinBounds(vertex, _node.nwb))){
            _node = _node.nw;
        }
        else if(_polygon.every(vertex => isWithinBounds(vertex, _node.neb))){
            _node = _node.ne;
        }
        else if(_polygon.every(vertex => isWithinBounds(vertex, _node.swb))){
            _node = _node.sw;
        }
        else if(_polygon.every(vertex => isWithinBounds(vertex, _node.seb))){
            _node = _node.se;
        }
        else break; //not every vertex are
    }
    if(!_node.isLeaf){
        for(let childNode of [_node.nw, _node.ne, _node.sw, _node.se]){
            results = results.concat(getPotentialColliders(_polygon, childNode));
        }
    }
    return results;//_node.value;
}
function isWithinBounds(_vertex, _bounds){
    if (_vertex.x < _bounds.x.min || _vertex.x > _bounds.x.max) return false;
    if (_vertex.y < _bounds.y.min || _vertex.y > _bounds.y.max) return false;
    return true;
}