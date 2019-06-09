class Orbit {
  constructor() {
    this._rox = 0;
    this._roz = 0;
  }
  get RoX() {
    return this._rox;
  }
  set RoX(v) {
    this._rox = THREE.Math.clamp(v, Math.PI * -0.49, Math.PI * 0.49);
  }
  get RoZ() {
    return this._roz;
  }
  set RoZ(v) {
    this._roz=v;
  }
  updateDirection(dir=new THREE.Vector3()){
    let d=Math.abs(Math.cos(this._rox));

    dir.set(
      Math.cos(this._roz) * d,
      Math.sin(this._roz) * d,
      Math.sin(this._rox)
      );
    return dir;
  }
  updateRotation(dir){
    dir.normalize();
    this._rox=Math.asin(dir.z);
    if (equaln(dir.x, 0) && equaln(dir.y, 0))
            if (dir.z > 0)
                this._roz = Math.PI * -0.5;
            else
                this._roz = Math.PI * 0.5;
        else
            this._roz = Math.atan2(dir.y, dir.x);
  }
  static computUpDirection(n, ay = new THREE.Vector3(), ax = new THREE.Vector3())
    {
        if (Math.abs(n.x) < 0.015625 && Math.abs(n.y) < 0.015625)
            ax.crossVectors(new THREE.Vector3(0,1), n);
        else
            ax.crossVectors(new THREE.Vector3(0,0,1), n);

        ay.crossVectors(n, ax);
        return ay;
    }
}