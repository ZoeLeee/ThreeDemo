
const VS_Shader = `
    attribute vec4 a_position;
    attribute vec4 a_Color;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying vec4 v_Color;
    void main(){
        gl_Position=uProjectionMatrix * uModelViewMatrix * a_position;
        gl_PointSize = 10.0;
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

        update(gl, program, 0);

        // requestAnimationFrame(render);
    }


    render(0)

}

function update(gl, program, deltaTime) {
    // 设置清空颜色缓冲区时的颜色
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // 清空颜色缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.STENCIL_BUFFER_BIT);


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

    // gl.vertexAttrib4f(programInfo.attribLocations.a_color, 1.0, 0.0, 1.0, 1.0);

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

    // 获取shader中a_position的地址
    const a_position = gl.getAttribLocation(program, "a_position");
    const a_color = programInfo.attribLocations.a_color;

    gl.vertexAttrib4f(a_color, 1.0, 0.0, 0.0, 1.0);


    drawCircle([0.0, 0.0, 0.0], 1.0, gl);

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

    gl.drawArrays(gl.LINE_LOOP, 0, 36);
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

const Precision = 36;
function drawCircle(center, rad, gl) {
    const angle = Math.PI * 2 / Precision;
    const vertices = [];
    for (let i = 0; i <= 36; i++) {
        let x = center[0] + rad * Math.cos(angle * i);
        let y = center[1] + rad * Math.sin(angle * i);
        vertices.push(x, y, 0.0);
    }

    const circleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);

    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW);
}