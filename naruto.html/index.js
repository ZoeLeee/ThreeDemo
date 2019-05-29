let renderer, camera, scene, gui, light, stats, controls, meshHelper, mixer, action, datGui;

function initRender() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xeeeeee);
    renderer.shadowMap.enabled = true;
    //告诉渲染器需要阴影效果
    document.getElementById('app').appendChild(renderer.domElement);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(100, 200, 300);
}

function initSceen() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);
    scene.background = new THREE.CubeTextureLoader().setPath("https://cdn.jsdelivr.net/gh/ZoeLeee/cdn/sky/").load([
        "lf.jpg", "rt.jpg", "up.jpg", "dn.jpg", "fr.jpg", "bk.jpg"
    ])
}
function initLight() {
    scene.add(new THREE.AmbientLight(0x444444));

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 200, 100);

    light.castShadow = true;
    light.shadow.camera.top = 180;
    light.shadow.camera.bottom = -100;
    light.shadow.camera.left = -120;
    light.shadow.camera.right = 120;

    //告诉平行光需要开启阴影投射
    light.castShadow = true;

    scene.add(light);
}
function loadModel() {
    //辅助工具
    let helper = new THREE.AxesHelper(50);
    scene.add(helper);

    // 地板
    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0xffffff, depthWrite: false }));
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    //添加地板割线
    var grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    //加载模型
    var loader = new THREE.FBXLoader();
    loader.load("../assets/fbx/Naruto.fbx", function (mesh) {
        console.log(mesh);

        //添加骨骼辅助
        meshHelper = new THREE.SkeletonHelper(mesh);
        scene.add(meshHelper);

        //设置模型的每个部位都可以投影
        mesh.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        //AnimationMixer是场景中特定对象的动画播放器。当场景中的多个对象独立动画时，可以为每个对象使用一个AnimationMixer
        mixer = mesh.mixer = new THREE.AnimationMixer(mesh);

        //mixer.clipAction 返回一个可以控制动画的AnimationAction对象  参数需要一个AnimationClip 对象
        //AnimationAction.setDuration 设置一个循环所需要的时间，当前设置了一秒
        //告诉AnimationAction启动该动作
        //action = mixer.clipAction(mesh.animations[0]);
        //action.play();

        var actions = []; //所有的动画数组

        for (var i = 0; i < mesh.animations.length; i++) {
            createAction(i);
        }

        function createAction(i) {
            actions[i] = mixer.clipAction(mesh.animations[i]);
        }

        mesh.position.y += 100;

        scene.add(mesh);
    });

}
//窗口变动触发的函数
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}


function init() {
    initRender();
    initCamera();
    initSceen();
    initLight();
    loadModel();
    window.addEventListener('resize', onWindowResize);
    animate();
}

init();