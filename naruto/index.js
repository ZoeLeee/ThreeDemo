let renderer,scene, light,meshHelper, mixer, action,control,helper;

let activeCamera,perspectiveCamera,orthographicCamera;

let helperPers,helperOrth,activeHelper;



function initRender() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xeeeeee);
    renderer.shadowMap.enabled = true;
    //告诉渲染器需要阴影效果
    document.getElementById('app').appendChild(renderer.domElement);
}

function initSceen() {
    scene = new THREE.Scene();
    window["scene"]=scene;
    scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);
    scene.background = new THREE.CubeTextureLoader().setPath("https://cdn.jsdelivr.net/gh/ZoeLeee/cdn/sky/").load([
        "lf.jpg", "rt.jpg", "up.jpg", "dn.jpg", "fr.jpg", "bk.jpg"
    ])
}
function initCamera() {
    //透视相机
    perspectiveCamera = new THREE.PerspectiveCamera(45,sceenWidth / sceenHeight, 0.1, 2000);
    perspectiveCamera.position.set(0,0,1000);
    //正交相机
    orthographicCamera = new THREE.OrthographicCamera( sceenWidth / - 2, sceenWidth / 2, sceenHeight / 2, sceenHeight / - 2, 0.1, 2000 );

    orthographicCamera.position.set(0,0,1000);


    //相机助手
    helperPers = new THREE.CameraHelper( perspectiveCamera );
    // scene.add( helperPers );
    helperOrth = new THREE.CameraHelper( orthographicCamera );
    // scene.add( helperOrth );

    //
    activeCamera = perspectiveCamera;
    activeHelper = helperPers;
    helperOrth.visible=false;

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
    // var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0xffffff, depthWrite: false }));
    // mesh.rotation.x = - Math.PI / 2;
    // mesh.receiveShadow = true;
    // scene.add(mesh);

    // //添加地板割线
    // var grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
    // grid.material.opacity = 0.2;
    // grid.material.transparent = true;
    // scene.add(grid);

    //http://cdn.dodream.top/haha.obj
    // //加载模型
    var loader = new THREE.FBXLoader();
    loader.load("../assets/fbx/Naruto.fbx", function (mesh) {
        //添加骨骼辅助
        // meshHelper = new THREE.SkeletonHelper(mesh);
        // scene.add(meshHelper);

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
            // action[i].play();
        }

        mesh.position.y += 100;

        scene.add(mesh);
    });
    var loader = new THREE.OBJLoader();

    // load a resource
    loader.load(
        // resource URL
        '../assets/fbx/haha.obj',
        // called when resource is loaded
        function ( object ) {
    
            // scene.add( object );
            console.log(object);
        },
        // called when loading is in progresses
        function ( xhr ) {
    
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        }
    );
}
//窗口变动触发的函数
function onWindowResize() {
    sceenWidth=window.innerWidth;
    sceenHeight=window.innerHeight;

    perspectiveCamera.aspect = sceenWidth / sceenHeight;
    perspectiveCamera.updateProjectionMatrix();
    orthographicCamera = new THREE.OrthographicCamera( sceenWidth / - 2, sceenWidth / 2, sceenHeight / 2, sceenHeight / - 2, 0.1, 2000 );

    orthographicCamera.left=sceenWidth / - 2;
    orthographicCamera.right=sceenWidth /  2;
    orthographicCamera.top=sceenHeight /  2;
    orthographicCamera.bottom=sceenHeight / - 2;

    renderer.setSize(sceenWidth,  sceenHeight);
}
function animate() {
    renderer.render(scene, activeCamera);
    requestAnimationFrame(animate);
}
function tabCamera(){
    if(activeCamera===orthographicCamera){
        activeCamera=perspectiveCamera;
        helperPers.visible=true;
        helperOrth.visible=false;
    }
    else{
        activeCamera=orthographicCamera;
        helperPers.visible=false;
        helperOrth.visible=true;
    }
    control.Camera=activeCamera;
}
function init() {
    initRender();
    initSceen();
    initCamera();
    control=new CameraControl(activeCamera);
    initLight();
    let geo=new THREE.BoxGeometry(100,100,100);
    let mesh=new THREE.Mesh(geo);
    scene.add(mesh);
    loadModel();
    document.addEventListener('keydown',e=>{
        if(e.code==="Tab"){
            e.preventDefault();
            tabCamera();
        }
    })
    window.addEventListener('resize', onWindowResize);
    document.oncontextmenu=function(ev){
        return false;    //屏蔽右键菜单
     }
    animate();
}

init();