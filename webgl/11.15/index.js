const vertices = [
    0.0, 0.0, 0.0,
    0.5, 0.5, 0.0,
    -0.5, 0.5, 0.0,
];
const colors = [
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
];


const VS_Shader = `
    attribute vec4 a_position;
    attribute vec4 a_Color;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying vec4 v_Color;
    void main(){
        gl_Position=uProjectionMatrix * uModelViewMatrix * a_position;
        v_Color=a_Color;
    }
`;

const FS_Shader = `
    precision mediump float;
    varying vec4 v_Color;
    void main(){
        gl_FragColor=v_Color;
    }
`;

window.onload = () => {
    main();
}

const cameraPosition = [0, 0, 0];

function main() {
    var canvas = document.getElementById("webgl");

    const gl = canvas.getContext('webgl');
    if (!gl) return;


    const program = initShaderProgram(gl, VS_Shader, FS_Shader);

    gl.useProgram(program);


    // 往a_position这个地址中传值
    // gl.vertexAttrib3f(a_position, 0.5, 0.5, 0.0);


    var then = 0;

    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        update(gl, program, then);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    canvas.addEventListener('wheel', e => {
        if (e.deltaY < 0) {
            //放大
            cameraPosition[2] += 0.1
        }
        else {
            //缩小
            cameraPosition[2] -= 0.1;
        }
    })
}

function update(gl, program, deltaTime) {
    // 设置清空颜色缓冲区时的颜色
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // 清空颜色缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT);


    const programInfo = {
        program: program,
        attribLocations: {
            a_position: gl.getAttribLocation(program, 'a_position'),
            a_color: gl.getAttribLocation(program, 'a_Color'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
        },
    };

    gl.vertexAttrib4f(programInfo.attribLocations.a_color, 1.0, 0.0, 1.0, 1.0);

    const fieldOfView = 60 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    const projectionMatrix = mat4.create();
    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    mat4.translate(projectionMatrix, projectionMatrix, cameraPosition)

    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix,     // destination matrix
        modelViewMatrix,     // matrix to translate
        [-0.0, 0.0, -5.0]);  // amount to translate

    mat4.rotate(modelViewMatrix,  // destination matrix
        modelViewMatrix,  // matrix to rotate
        deltaTime,   // amount to rotate in radians
        [0, 0, 1]);       // axis to rotate around

    // 获取shader中a_position的地址
    const a_position = gl.getAttribLocation(program, "a_position");

    initBuffers(gl);

    // 采用vertexAttribPointer进行传值
    gl.vertexAttribPointer(
        a_position,
        3,
        gl.FLOAT,
        false,
        Float32Array.BYTES_PER_ELEMENT * 3,
        0
    );

    gl.enableVertexAttribArray(a_position);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);



    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}


function random() {
    return Math.random();
}


function loaderShader(gl, type, source) {
    //创建Shader对象
    const shader = gl.createShader(type);
    //发送着色器代码到shader对象
    gl.shaderSource(shader, source)
    //编译着色器
    gl.compileShader(shader)

    //检测是否编译成功
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null
    }
    return shader;
}

function initShaderProgram(gl, vsSource, fsSource) {
    //顶点着色器
    const vsShader = loaderShader(gl, gl.VERTEX_SHADER, vsSource);
    //片元着色器
    const fsShader = loaderShader(gl, gl.FRAGMENT_SHADER, fsSource);

    //创建着色器程序
    const program = gl.createProgram();


    //绑定着色器对象添加到着色器程序
    gl.attachShader(program, vsShader)
    gl.attachShader(program, fsShader)

    //连接着色器程序,准备GPU渲染
    gl.linkProgram(program);

    // 创建失败， alert
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}

function initBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var vertices = [
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW);

    return positionBuffer;
}



