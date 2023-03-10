/*
 *
 * areas for improvement:
 * -InsertVertSlow: uses the flips, potentially creating and
 *  destroying many triangles unnecessarily
 *  should be able to just remove those triangles all at once
 *  then perform a star operation
 * -FindFaceContainPoint could be made faster,
 *    e.g. draw line towards point and travel along triangles
 *    that intersect the line
 */

class Triangulation {
  constructor() {
    this.V = []; // value at v is faces around v
    this.Vcoord = [];
    this.F = []; // value at f is cyclic list of vert of f

    this.numVert = 0;
    this.numFace = 0;

    this.deletedVert = [];
    this.deletedFace = [];

    // initialize with giant triangle
    this.AddFace(0,1,2);
    // -1 makes CyclicSet an ordered set
    this.AddVert({x:0,y:0},[-1,0]);
    this.AddVert({x:50,y:0},[-1,0]);
    this.AddVert({x:25,y:50},[-1,0]);
  }

  AddFace(v1,v2,v3) {
    ++this.numFace;
    let f = this.NextFaceIndPop();
    if (f == this.F.length)
      this.F.push(null);
    this.F[f] = [v1,v2,v3];
    return f;
  }
  // clean up only (assumes vertices already forgot about f)
  DeleteFace(f) {
    --this.numFace;
    this.deletedFace.push(f);
    this.F[f] = null;
  }
  // returns next vertex index to use
  // returns same value if called again immediately
  NextVertInd() {
    return this.deletedVert.length > 0 ?
      this.deletedVert[this.deletedVert.length-1] : this.V.length;
  }
  // same, expects user to create vertex with it
  NextVertIndPop() {
    return this.deletedVert.length > 0 ?
      this.deletedVert.pop() : this.V.length;
  }
  // returns next face index to use
  // returns same value if called again immediately
  NextFaceInd() {
    return this.deletedFace.length > 0 ?
      this.deletedFace[this.deletedFace.length-1] : this.F.length;
  }
  // same, but expects user to create new face with it
  NextFaceIndPop() {
    return this.deletedFace.length > 0 ?
      this.deletedFace.pop() : this.F.length;
  }
  // f: arr of face indices
  // v: manually set index of new vertex to be created
  AddVert(pos,f,v=null) {
    if (v === null) {
      v = this.NextVertIndPop();
      if (v == this.V.length) {
        this.V.push(null);
        this.Vcoord.push(null);
      }
    }
    this.V[v] = new CyclicSet(f);
    this.Vcoord[v] = {x:pos.x,y:pos.y};
    ++this.numVert;
    return v;
  }

  // adds new vertex, then repeatedly performs flips
  // (can be improved by recording triangles to remove
  // then remove all at once, then take the star)
  InsertVertSlow(pos) {
    let f0 = this.FindFaceContainPoint(pos);
    if (f0 == -1)
      return;
    let {v:vn, f:faceStack} = this.InsertVertInFace(pos,f0);
    while (faceStack.length > 0) {
      let f = faceStack.pop();
      let fp = this.FaceOppositeVert(f,vn);
      if (fp == -1) continue;
      if (this.VertInCircumcircle(vn,fp) <= 0) continue;
      let [f3,f4] = this.FaceFlip(f,fp);
      faceStack.push(f3);
      faceStack.push(f4);
    }
    return vn;
  }

  InsertVertStarOnly(pos) {
    let f0 = this.FindFaceContainPoint(pos);
    if (f0 == -1)
      return;
    this.InsertVertInFace(pos,f0);
  }

  // still in progress, DONT USE
  InsertVert(pos) {
    let f0 = this.FindFaceContainPoint(pos);
    if (f0 == -1)
      return;
    let facesToRemove = [[f0,-1]];
    for (let v of this.F[f0]) {
      let fp = this.FaceOppositeVert(f0,v);
      if (fp == -1) continue;
      let vp = this.VertOppositeEdge(fp,f0);
      let faceStack = [[fp,vp]];
      while (faceStack.length > 0) {
        // vp is vert of fp that is furthest away from v
        [fp,vp] = faceStack.pop();
        if (this.PointInCircumcircle(pos,fp) >= 0)
          continue;
        facesToRemove.push([fp,vp]);
        // get triangles adj to fp, but not across vp
        let v1 = this.VertNextInFace(vp,fp);
        let v2 = this.VertNextInFace(v1,fp);
        let f1 = this.FaceOppositeVert(fp,v1);
        let f2 = this.FaceOppositeVert(fp,v2);
        let v1p = tihs.VertOppositeEdge(f1,fp);
        let v2p = tihs.VertOppositeEdge(f2,fp);
        faceStack.push([f1,v1p]);
        faceStack.push([f2,v2p]);
      }
    }
  }

  // pos: coord of new vert, f: index of face
  // returns the new vertex and faces
  InsertVertInFace(pos,f) {
    let [v1,v2,v3] = this.F[f];
    this.DeleteFace(f);

    let vn = this.NextVertIndPop(); // new vertex index
    let f1 = this.AddFace(v2,v3,vn);
    let f2 = this.AddFace(v3,v1,vn);
    let f3 = this.AddFace(v1,v2,vn);

    this.AddVert(pos,[f3,f1,f2]);
    this.VertSplitFace(v1,f,f3,f2);
    this.VertSplitFace(v2,f,f1,f3);
    this.VertSplitFace(v3,f,f2,f1);

    return {v:vn, f:[f3,f1,f2]};
  }

  VertNextInFace(v,f) {
    let i = this.F[f].indexOf(v);
    return this.F[f][(i+1)%3];
  }
  VertPrevInFace(v,f) {
    let i = this.F[f].indexOf(v);
    return this.F[f][(i+2)%3];
  }
  FaceNextOfVert(f,v) {
    return this.V[v].NextElem(f);
  }
  FacePrevOfVert(f,v) {
    return this.V[v].PrevElem(f);
  }
  FaceOppositeVert(f,v) {
    let vp = this.VertPrevInFace(v,f);
    return this.FaceNextOfVert(f,vp);
  }
  // vertex of f not in fp
  VertOppositeEdge(f,fp) {
    for (let v of this.F[f]) {
      if (this.F[fp].indexOf(v) == -1)
        return v;
    }
    return -1; // ??
  }

  // >0 if v inside circumcircle of f
  VertInCircumcircle(v,f) {
    return this.PointInCircumcircle(this.Vcoord[v],f);
  }
  // >0 if p0 inside circumcircle of f
  PointInCircumcircle(p0,f) {
    let [v1,v2,v3] = this.F[f];
    return this.PointInCircumcircleCoord(p0,
        this.Vcoord[v1],
        this.Vcoord[v2],
        this.Vcoord[v3]);
  }
  // >0 if p0 inside circumcircle of p1,p2,p3
  // assumes p1,p2,p3 are in counter-clockwise
  PointInCircumcircleCoord(p0,p1,p2,p3) {
    // a = p1-p0, b = p2-p0, c = p3-p0
    //  | ax  ay  ax^2+ay^2 |
    //  | bx  by  bx^2+by^2 |
    //  | cx  cy  cx^2+cy^2 |
    let ax = p1.x - p0.x;
    let ay = p1.y - p0.y;
    let bx = p2.x - p0.x;
    let by = p2.y - p0.y;
    let cx = p3.x - p0.x;
    let cy = p3.y - p0.y;
    return (ax*ax+ay*ay) * (bx*cy - cx*by)
         - (bx*bx+by*by) * (ax*cy - cx*ay)
         + (cx*cx+cy*cy) * (ax*by - bx*ay);
  }

  // replaces face of v by two faces f1,f2
  // (     this.V[v] = [..,f,..]
  // ====> this.V[v] = [..,f1,f2,..]
  VertSplitFace(v,f,f1,f2) {
    let fp = this.V[v].PrevElem(f);
    this.V[v].DeleteElem(f);
    if (this.V[v].IsEmpty()) {
      this.V[v].InsertEmpty([f1,f2]);
    }
    else {
      this.V[v].InsertAfter(fp,[f1,f2]);
    }
  }
  // opposite of VertSplitFace
  // no assumption on order of f1,f2
  VertMergeFace(v,f1,f2,f) {
    this.V[v].DeleteElem(f1);
    let fp = this.V[v].PrevElem(f2);
    this.V[v].DeleteElem(f2);
    if (this.V[v].IsEmpty()) {
      this.V[v].InsertEmpty(f);
    }
    else {
      this.V[v].InsertAfter(fp,f);
    }
  }

  // also returns the new faces
  FaceFlip(f1,f2) {
    // f1 = [v1p,e0,e1], f2 = [v2p,e1,e0]
    let v1p = this.VertOppositeEdge(f1,f2);
    let v2p = this.VertOppositeEdge(f2,f1);
    let e0 = this.VertNextInFace(v1p,f1);
    let e1 = this.VertNextInFace(e0,f1);

    // add/remvoe faces
    this.DeleteFace(f1);
    this.DeleteFace(f2);
    let f3 = this.AddFace(e0,v2p,v1p);
    let f4 = this.AddFace(e1,v1p,v2p);

    // update vertex face list
    this.VertSplitFace(v1p,f1,f3,f4);
    this.VertSplitFace(v2p,f2,f4,f3);
    this.VertMergeFace(e0,f2,f1,f3);
    this.VertMergeFace(e1,f1,f2,f4);

    return [f3,f4];
  }

  FindFaceContainPoint(pos) {
    // brute force for now
    for (let f = 0; f < this.F.length; ++f) {
      if (this.F[f] === null)
        continue;
      
      if (this.FaceContainsPoint(f,pos))
        return f;
    }
    return -1;
  }
  FindVertContainPoint(pos) {
    // brute force for now
    for (let v = 0; v < this.Vcoord.length; ++v) {
      if (this.Vcoord[v] === null)
        continue;
      
      let ax = this.Vcoord[v].x - pos.x;
      let ay = this.Vcoord[v].y - pos.y;
      if (ax*ax + ay*ay < 0.4)
        return v;
    }
    return -1;
  }

  FaceContainsPoint(f,pos) {
    let p0 = this.Vcoord[this.F[f][0]];
    let p1 = this.Vcoord[this.F[f][1]];
    let p2 = this.Vcoord[this.F[f][2]];

    if (signedA(pos,p1,p2) < 0 ||
        signedA(pos,p2,p0) < 0 ||
        signedA(pos,p0,p1) < 0) return false;

    return true;
  }
}


// double the area of triangle
function signedA(p1,p2,p3) {
  return (p2.x-p1.x)*(p3.y-p1.y) - (p3.x-p1.x)*(p2.y-p1.y);
}

