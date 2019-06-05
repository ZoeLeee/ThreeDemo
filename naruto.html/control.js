const MOUSE_KEY = {
  Left: 0,
  Mid: 1,
  Right: 2,
}
const { Vector3 } = THREE;
let isMouseLeft = false, isMouseMid = false, isMouseRight = false;

const CameraState = {
  Move: 0,
  Rotate: 1,
  Zoom: 2
}
Object.freeze(CameraState);
Object.freeze(MOUSE_KEY);

class CameraControl {
  constructor(camera) {
    this._camera = camera;
    this._target = new Vector3();
    this._dir = new Vector3(0, 0,-1);
    this._position = camera.position;
    this._scale = 1;
    this._spherical = new THREE.Spherical();
    this.registerEvent();
  }
  registerEvent() {
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('wheel', this.handleMouseWheel);
  }
  get Camera(){
    return this._camera;
  }
  set Camera(camera){
    this._camera=camera;
  }
  onMouseDown(e) {

  }
  onMouseMove = (e) => {

  }
  onMouseUp = (e) => {
    switch (e.button) {
      case MOUSE_KEY.Left:
        isMouseLeft = false;
        break;
      case MOUSE_KEY.Mid:
        isMouseMid = false;
        break;
      case MOUSE_KEY.Right:
        isMouseRight = false;
      default:
        break;
    }
  }
  handleMouseWheel = (e) => {
    if (e.deltaY < 0) {
      //放大
      this.dollyOut();
    }
    else {
      this.dollyIn();
    }
    this.update();
  }
  dollyOut() {
    //如果是透视相机
    if (this._camera.isPerspectiveCamera) {
      let add = this._camera.position.distanceTo(this._target) / 10;
      this._target.add(this._dir.clone().multiplyScalar(-add));
    }
    else if (this._camera.isOrthographicCamera) {
      this._camera.zoom = Math.max(0, Math.min(Infinity, this._camera.zoom / 1.05))
    }
    else
      return;
  }
  dollyIn() {
    //如果是透视相机
    if (this._camera.isPerspectiveCamera) {
      let add =-this._camera.position.distanceTo(this._target) / 10;
      this._target.add(this._dir.clone().multiplyScalar(-add));
    }
    else if (this._camera.isOrthographicCamera) {
      this._camera.zoom = Math.max(0, Math.min(Infinity, this._camera.zoom * 0.95))
    }
    else
      return;
  }
  getZoomScale() {
    return Math.pow(0.95, 1);
  }
  update() {
    let distens = (1000 / 2) / (Math.tan(THREE.Math.degToRad(this._camera.fov) / 2));
    this._camera.position.copy(this._target).add(this._dir.clone().multiplyScalar(distens));
    this._camera.lookAt(this._target);
    this._camera.updateProjectionMatrix();
    this._camera.updateMatrixWorld(false);
  }
  destory() {
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('wheel', this.handleMouseWheel);
  }
}