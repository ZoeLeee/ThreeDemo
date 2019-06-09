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

const MAX_VIEW_HEIGHT = 2000;

class CameraControl {
  constructor(camera) {
    this._camera = camera;
    this._target = new Vector3();
    this._dir = new Vector3(0, 0, -1);
    this._position = camera.position;
    this._scale = 1;
    this._orbit = new Orbit();
    this._viewHeight = MAX_VIEW_HEIGHT;
    this.registerEvent();
  }
  registerEvent() {
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('wheel', this.handleMouseWheel,{passive:false});
  }
  get Camera() {
    return this._camera;
  }
  set Camera(camera) {
    this._camera = camera;
  }
  get ViewHeight() {
    return this._viewHeight;
  }
  set ViewHeight(height) {
    this._viewHeight = THREE.Math.clamp(height, 0.1, MAX_VIEW_HEIGHT);
  }
  onMouseDown(e) {
    switch (e.button) {
      case MOUSE_KEY.Left:
        isMouseLeft = true;
        break;
      case MOUSE_KEY.Mid:
        isMouseMid = true;
        break;
      case MOUSE_KEY.Right:
        isMouseRight = true;
      default:
        break;
    }
  }
  onMouseMove = (e) => {
    event.preventDefault();
    let changeVec = new Vector3(event.movementX, event.movementY);
    if (isMouseLeft) {
      this.rotate(changeVec);
    }
  }
  rotate(vec) {
    this._orbit.RoX = this._orbit.RoX - vec.y * 0.003;
    this._orbit.RoZ = this._orbit.RoZ - vec.x * 0.003;

    //
    let oldTarget = this._target.clone().applyMatrix4(this._camera.matrixWorldInverse);

    this._orbit.updateDirection(this._dir);
    this.updateUp();
    this.update();

    //-----还原观察点
    //得到新的观察点相对于相机的位置
    let newTargetFormCameraSpace = this._target.clone().applyMatrix4(this._camera.matrixWorldInverse);
    //减去原先的位置. 得到观测点在相机内移动的向量
    newTargetFormCameraSpace.sub(oldTarget);
    //乘以相机的矩阵. 得到向量在世界坐标系的位置
    newTargetFormCameraSpace.applyMatrix4(this._camera.matrix);
    //因为使用的是点变换,所以减去基点,得到向量
    newTargetFormCameraSpace.sub(this._camera.position);
    //加上移动的向量. 使得观察点时钟在相机的某个位置
    this._target.add(newTargetFormCameraSpace);

    this.update();

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
    e.preventDefault();
    let pt = new THREE.Vector3(event.offsetX, event.offsetY, 0);

    // this.m_Viewer.ScreenToWorld(pt, new Vector3().setFromMatrixColumn(this.m_Viewer.Camera.matrixWorld, 2));

    if (e.deltaY > 0) {
      this.zoom(0.6, pt);
    }
    else{
      this.zoom(1.4, pt);
    }
    this.update();
  }
  zoom(scale, scaleCenter) {
    if (this._camera.isOrthographicCamera) {
      this.ViewHeight =this.ViewHeight*scale;
    }
    else if (this._camera.isPerspectiveCamera) {
      let add = scale > 1 ? 1 : -1;
      add *= this._camera.position.distanceTo(this._target) / 10;
      this._target.add(this._dir.clone().multiplyScalar(-add));
    }
  }
  getZoomScale() {
    return Math.pow(0.95, 1);
  }
  updateUp() {
    Orbit.computUpDirection(this._dir, this._camera.up);
  }
  update() {
    this._camera.position.copy(this._target);

    if (this._camera.isPerspectiveCamera) {
      let distens = (1000 / 2) / (Math.tan(THREE.Math.degToRad(this._camera.fov) / 2));
      this._camera.position.copy(this._target).add(this._dir.clone().multiplyScalar(distens));
    }
    else if (this._camera.isOrthographicCamera) {
      let aspect=sceenWidth/sceenHeight;
      this._camera.left = aspect * this._viewHeight / -2;
      this._camera.right = aspect * this._viewHeight / 2;
      this._camera.bottom = this._viewHeight / -2;
      this._camera.top = this._viewHeight / 2;
      this._camera.position.sub(this._dir);
    }
    else
      return;

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