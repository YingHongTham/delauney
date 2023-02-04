// elements are numbers, must be distinct
class CyclicSet {
  constructor(ls=null) {
    this.elem = {}; // elem[v] = [before,after]
    this.numElem = 0;
    if (ls === null) return;
    this.InsertEmpty(ls);
  }
  NextElem(x) {
    return this.elem[x][1];
  }
  PrevElem(x) {
    return this.elem[x][0];
  }
  DeleteElem(x) {
    if (this.numElem == 1) {
      delete this.elem[x];
      this.numElem = 0;
      return;
    }
    let [p,n] = this.elem[x];
    this.elem[p][1] = n;
    this.elem[n][0] = p;
    delete this.elem[x];
    --this.numElem;
  }
  InsertEmpty(val) {
    if (!Array.isArray(val)) {
      //val = [val];
      this.elem[val] = [val,val];
      this.numElem = 1;
      return;
    }
    let len = val.length;
    this.numElem = len;
    if (len == 0) return;
    if (len == 1) {
      this.elem[val[0]] = [val[0],val[0]];
      return;
    }

    for (let i = 1; i < len - 1; ++i) {
      this.elem[val[i]] = [val[i-1],val[i+1]];
    }
    this.elem[val[0]] = [val[len-1],val[1]];
    this.elem[val[len-1]] = [val[len-2],val[0]];
  }
  // val is value(s) to be inserted - arr or one val
  // x is value after which val should be inserted
  InsertAfter(x,val) {
    let y = this.elem[x][1];
    if (Array.isArray(val) && val.length == 1) {
      val = val[0];
    }
    if (!Array.isArray(val)) {
      this.elem[val] = [x,y];
      this.elem[x][1] = val;
      this.elem[y][0] = val;
      ++this.numElem;
      return;
    }
    let len = val.length;
    this.numElem += len;
    this.elem[val[0]] = [x,val[1]];
    this.elem[val[len-1]] = [val[len-2],y];
    for (let i = 1; i < len-1; ++i) {
      this.elem[val[i]] = [val[i-1],val[i+1]];
    }
    this.elem[x][1] = val[0];
    this.elem[y][0] = val[len-1];
  }
  InsertBefore(x,val) {
    let y = this.elem[x][0];
    this.InsertAfter(y,val);
  }
  IsEmpty() {
    return this.numElem == 0;
  }
  Print() {
    if (this.numElem == 0) {
      console.log('empty');
      return;
    }
    let x = parseInt(Object.keys(this.elem)[0]);
    let ls = [];
    for (let i = 0; i <= this.numElem; ++i) {
      ls.push(x);
      x = this.elem[x][1];
    }
    console.log('forward:', ls);
    x = this.elem[x][0];
    ls = [];
    for (let i = 0; i <= this.numElem; ++i) {
      ls.push(x);
      x = this.elem[x][0];
    }
    console.log('backward:', ls);
  }
  ToArray() {
    let x = parseInt(Object.keys(this.elem)[0]);
    if (this.elem[-1] !== undefined) {
      x = -1;
    }
    let ls = [];
    for (let i = 0; i < this.numElem; ++i) {
      ls.push(x);
      x = this.elem[x][1];
    }
    return ls;
  }
}


//let x = new CyclicSet([2,3]);
//x.Print();
//console.log("x.InsertAfter(3,[1,5,6])");
//x.InsertAfter(3,[1,5,6]);
//x.Print();
//console.log("x.InsertBefore(2,[4])");
//x.InsertBefore(2,[4]);
//x.Print();
//console.log("x.DeleteElem(3)");
//x.DeleteElem(3)
//x.Print();
//console.log("delete all (one by one)");
//let ls = Object.keys(x.elem);
//for (let y of ls) x.DeleteElem(y);
//x.Print();
