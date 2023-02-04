// for drawing triangulation, handles animation
class triangulationDraw {
  constructor() {
    this.Vcoord = [];
    this.F = [];
    this.Ftmp = [];
    this.animQueue = [];
  }
  AddFace(f,vls) {
    while (f >= this.F.length) {
      this.F.push(null);
    }
    // make hard copy
    this.F[f] = [vls[0],vls[1],vls[2]];
  }
  AddVert(v,pos) {
    while (v >= this.Vcoord.length) {
      this.Vcoord.push(null);
    }
    this.Vcoord[v] = {
      x: pos.x,
      y: pos.y,
    };
  }
  /*
   * fields in obj:
   * -f: face to highlight
   * -color: text, corresponding RGB given above
   * -startTime: null if want set to now
   * -duration: in milliseconds
   */
  HighlightFace(obj) {
    let anim = {};

    if (obj.startTime === null || obj.startTime === undefined) {
      anim.startTime = Date.now();
    }
    else {
      anim.startTime = obj.startTime;
    }
    anim.endTime = anim.startTime + obj.duration;

    anim.f = obj.f;
    anim.color = this.colorNameToRGB(obj.color);

    // TODO
  }

  colorNameToRGB(name) {
    if (name == 'green')
      return '#00FF00';
  }
}
