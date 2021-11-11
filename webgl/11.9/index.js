const vertices = [
    0.0, 0.0, 0.0,
    0.5, 0.5, 0.0,
    -0.5, 0.5, 0.0,
    0.5, -0.5, 0.0,
    -0.5, -0.5, 0.0
];

window.onload = () => {
    main();
}


function main() {
    var canvas = document.getElementById("webgl");

    const width = canvas.width;
    console.log('width: ', width);
    const height = canvas.height;
    console.log('height: ', height);

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // 设置清空颜色缓冲区时的颜色
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // 清空颜色缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT);

    const VS_Shader = `
        attribute vec4 a_position;
        void main(){
            gl_Position=a_position;
            gl_PointSize = 5.0;
        }
    `;

    const FS_Shader = `
        void main(){
            gl_FragColor=vec4(0.0,1.0,0.0,1.0);
        }
    `;

    const program = initShaderProgram(gl, VS_Shader, FS_Shader);

    gl.useProgram(program);


    // 往a_position这个地址中传值
    // gl.vertexAttrib3f(a_position, 0.5, 0.5, 0.0);


    update(gl, program);

    canvas.addEventListener('click', e => {
        const cx = e.clientX;
        const cy = e.clientY;

        const halfWidth = width / 2;
        const xh = cx - halfWidth;

        const halfHeight = height / 2;
        const yh = cy - halfHeight;

        let x = xh / halfWidth;
        let y = -yh / halfHeight;

        vertices.push(x, y, 0.0);
        update(gl, program);
    })

}

function update(gl, program) {

    // 设置清空颜色缓冲区时的颜色
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // 清空颜色缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT);


    // 获取shader中a_position的地址
    const a_position = gl.getAttribLocation(program, "a_position");

    initBuffers(gl);

    // 采用vertexAttribPointer进行传值
    gl.vertexAttribPointer(
        a_position,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(a_position);

    gl.drawArrays(gl.POINTS, 0, vertices.length / 3);
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

    return positionBuffer
}