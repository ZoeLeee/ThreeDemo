let canvas = document.getElementById('canvas');
let gl = canvas.getContext("webgl");
start();
function start() {

  let r = 0.0;
  let y = 0.0;
  let g = 0.0;

  gl.clearColor(r, y, g, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const AVertexPosition = "aVertexPostion";
  const UModelViewMatrix = "uModelViewMatrix";
  const UProjectionMatrix = "uProjectionMatrix";

  if (!gl)
    return;
  //${UProjectionMatrix}*${UModelViewMatrix}*${AVertexPosition};
  const VS_Shader = `
    attribute vec4 ${AVertexPosition};

    uniform mat4 ${UModelViewMatrix};
    uniform mat4 ${UProjectionMatrix};
    void main (){
      gl_Position=${AVertexPosition};
      gl_PointSize=5.0;
    }
  `;
  const VFragColor = "u_FragColor";
  const FS_Shader = `
    precision mediump float;
    uniform vec4 ${VFragColor};
    void main(){
      gl_FragColor=${VFragColor};
    }
  `;
  let program = initShaderProgram(gl, VS_Shader, FS_Shader);

  if (!program) return;
  gl.useProgram(program);

  let a_Position = gl.getAttribLocation(program, AVertexPosition);
  console.log('a_Position: ', a_Position);
  if (a_Position < 0) return;

  gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
  gl.drawArrays(gl.POINTS, 0, 1);

  gl.vertexAttrib3f(a_Position, 0.5, 0.5, 0.0);
  gl.drawArrays(gl.POINTS, 0, 1);


  let u_FragColor = gl.getUniformLocation(program, VFragColor);

  if (u_FragColor < 0) return;

  let ponits = [];
  document.onclick = (e) => {
    gl.clear(gl.COLOR_BUFFER_BIT);

    let mx = e.clientX;
    let my = e.clientY;
    const { width, height } = canvas.getBoundingClientRect();
    let x = (mx - width / 2) / (width / 2);
    let y = -(my - height / 2) / (height / 2);
    ponits.push(x, y);

    for (let i = 0; i < ponits.length; i += 2) {
      gl.vertexAttrib2f(a_Position, ponits[i], ponits[i + 1]);
      gl.uniform4f(u_FragColor,Math.abs(Number(ponits[i].toFixed(1))), Math.abs(Number(ponits[i + 1].toFixed(1))),0.0,1.0);
      gl.drawArrays(gl.POINTS, 0, 1);
    }
  }
  document.onkeydown = e => {
    if (e.keyCode === 27) {
      ponits.length = 0;
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }
}