class OrbitControls {

    constructor(camera, domElement) {
        this.camera = camera;
        this.container = domElement;

        this._width = domElement.clientWidth;
        this._height = domElement.clientHeight;

        this.regiterEvent();
        this._startRotate = false;
        this._startPoint = {
            x: 0, y: 0,
        };
        this._endPoint = {
            x: 0, y: 0,
        };
        this.dir = {
            x: 0, y: 0
        };
        this.target = {
            x: 1, y: 0, z: 0
        };
        this.camera.lookAt(this.target.x, this.target.y, this.target.z);
        this.rotationX = 0;
        this.rotationY = 0;
        this.enabled = true;
    }
    regiterEvent() {
        this.container.addEventListener("mousedown", event => {
            if (!this.enabled)
                return;
            this._startPoint.x = event.clientX;
            this._startPoint.y = event.clientY;
            this._startRotate = true;
            event.stopPropagation();
        });
        this.container.addEventListener("mousemove", event => {
            if (!this._startRotate)
                return;

            Object.assign(this._endPoint, { x: event.clientX, y: event.clientY });
            Object.assign(this.dir, { x: this._endPoint.x - this._startPoint.x, y: this._endPoint.y - this._startPoint.y });

            Object.assign(this._startPoint, this._endPoint);

            this.turn();

            event.stopPropagation();
        });
        this.container.addEventListener("mouseup", event => {
            this._startRotate = false;
            event.stopPropagation();
        });
        this.container.addEventListener("wheel", event => {
            event.preventDefault();
            event.stopPropagation();
            if (event.deltaY > 0) {
                //放大
                this.camera.fov += 1;
                if (this.camera.fov > 120) {
                    this.camera.fov = 120;
                    return;
                }
                this.camera.updateProjectionMatrix();

            }
            else {
                //缩小;
                this.camera.fov -= 1;
                if (this.camera.fov < 30) {
                    this.camera.fov = 30;
                    return;
                }
                this.camera.updateProjectionMatrix();
            }
            console.log(this.camera.fov);
        });

    }
    turn() {
        this.rotationX += this.dir.x / 100;
        this.rotationY += this.dir.y / 100;
        if (this.rotationY >= Math.PI / 2)
            this.rotationY = Math.PI / 2;
        if (this.rotationY < 0)
            this.rotationY = 0;
        this.updateTarget();
    }
    updateTarget() {
        this.target.x = Math.cos(this.rotationX);
        this.target.z = Math.sin(this.rotationX);
        this.target.y = Math.sin(this.rotationY);
        this.camera.lookAt(this.target.x, this.target.y, this.target.z);
    }
}