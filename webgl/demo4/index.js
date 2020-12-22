let canvas = document.getElementById('canvas');
let gl = canvas.getContext("webgl");
start();
function start() {

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const AVertexPosition = "aVertexPostion";
  const UModelViewMatrix = "uModelViewMatrix";
  const UProjectionMatrix = "uProjectionMatrix";

  const UTRAN = "u_translate";

  if (!gl)
    return;
  //${UProjectionMatrix}*${UModelViewMatrix}*${AVertexPosition};
  const VS_Shader = `
    attribute vec4 ${AVertexPosition};
    uniform vec4 ${UTRAN};
    uniform mat4 ${UModelViewMatrix};
    uniform mat4 ${UProjectionMatrix};
    void main (){
      gl_Position=${AVertexPosition}+${UTRAN};
    }
  `;
  const UFragColor = "u_FragColor";
  const FS_Shader = `
    precision mediump float;
    uniform vec4 ${UFragColor};
    void main(){
      gl_FragColor=${UFragColor};
    }
  `;
  let program = initShaderProgram(gl, VS_Shader, FS_Shader);

  if (!program) return;
  gl.useProgram(program);


  let pos32 = new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5]);

  initBuffers(gl, pos32);

  const u_FragColor = gl.getUniformLocation(program, UFragColor);

  gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);


  const a_Position = gl.getAttribLocation(program, AVertexPosition);
  const u_translate = gl.getUniformLocation(program, UTRAN);

  gl.uniform4f(u_translate, 0.5, 0.5, 0.5, 0.0);

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);


  gl.clear(gl.COLOR_BUFFER_BIT);
  // gl.drawArrays(gl.POINTS, 0, 3);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  gl.uniform4f(u_FragColor, 1.0, 0.0, 1.0, 1.0);
  let pos322 = new Float32Array([-1.0, 0.0, 1.0, 0.0]);
  initBuffers(gl, pos322);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.LINES, 0, 2);

  gl.uniform4f(u_FragColor, 0.0, 1.0, 1.0, 1.0);
  pos322 = new Float32Array([0.0, 1.0, 0.0, -1.0]);
  initBuffers(gl, pos322);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.LINES, 0, 2);

}