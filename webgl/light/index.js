const vertices = [
    // Front face
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,

    // Top face
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,

    // Right face
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0
];
const colors = [
    [1.0, 1.0, 1.0, 1.0],    // Front face: white
    [1.0, 0.0, 0.0, 1.0],    // Back face: red
    [0.0, 1.0, 0.0, 1.0],    // Top face: green
    [0.0, 0.0, 1.0, 1.0],    // Bottom face: blue
    [1.0, 1.0, 0.0, 1.0],    // Right face: yellow
    [1.0, 0.0, 1.0, 1.0]     // Left face: purple
];


const VS_Shader = `
    attribute vec4 a_position;
    attribute vec4 a_Color;
    attribute highp vec3 aVertexNormal;

    uniform highp mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying vec4 v_Color;
    varying highp vec3 vLighting;
    
    void main(){
        gl_Position=uProjectionMatrix * uModelViewMatrix * a_position;
        v_Color=vec4(1.0,0.0,0.0,1.0);

        // Apply lighting effect

        highp vec3 ambientLight = vec3(0.6, 0.6, 0.6);
        highp vec3 directionalLightColor = vec3(0.5, 0.5, 0.75);
        highp vec3 directionalVector = vec3(0.85, 0.8, 0.75);

        highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

        highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
        vLighting = ambientLight + (directionalLightColor * directional);

    }
`;

const FS_Shader = `
    precision mediump float;
    varying vec4 v_Color;
    varying highp vec3 vLighting;

    void main(){
        gl_FragColor=v_Color;
        gl_FragColor = vec4(v_Color.rgb * vLighting, 1.0);
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

    mat4.rotate(modelViewMatrix,  // destination matrix
        modelViewMatrix,  // matrix to rotate
        deltaTime,   // amount to rotate in radians
        [1, 1, 1]);       // axis to rotate around



    var normalMatrix = mat4.create();;
    mat4.invert(normalMatrix, modelViewMatrix);
    normalMatrix = mat4.transpose(normalMatrix, normalMatrix);

    var nUniform = gl.getUniformLocation(program, "uNormalMatrix");
    gl.uniformMatrix4fv(nUniform, false, new Float32Array(normalMatrix));

    // 获取shader中a_position的地址
    const a_position = gl.getAttribLocation(program, "a_position");
    const a_color = programInfo.attribLocations.a_color;
    const vertexNormalAttribute = gl.getAttribLocation(program, 'aVertexNormal')

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


    let generatedColors = [];

    for (let j = 0; j < 6; j++) {
        const c = colors[j];

        for (let i = 0; i < 4; i++) {
            generatedColors = generatedColors.concat(c);
        }
    }

    var cubeVerticesColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(generatedColors), gl.STATIC_DRAW);

    // 采用vertexAttribPointer进行传值
    gl.vertexAttribPointer(
        a_color,
        4,
        gl.FLOAT,
        false,
        Float32Array.BYTES_PER_ELEMENT * 4,
        0
    );

    gl.enableVertexAttribArray(a_color);


    var cubeVerticesIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

    var cubeVertexIndices = [
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // back
        8, 9, 10, 8, 10, 11,   // top
        12, 13, 14, 12, 14, 15,   // bottom
        16, 17, 18, 16, 18, 19,   // right
        20, 21, 22, 20, 22, 23    // left
    ];

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);

    //初始化法线

    initNormals(gl);
    gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexNormalAttribute);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);



    gl.drawElements(gl.TRIANGLES, cubeVertexIndices.length, gl.UNSIGNED_SHORT, 0);
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

    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW);

    return positionBuffer;
}



function initNormals(gl) {
    const cubeVerticesNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);

    var vertexNormals = [
        // Front
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // Back
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        // Top
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Bottom
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,

        // Right
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Left
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
}