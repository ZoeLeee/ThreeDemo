let canvas = document.getElementById('canvas');
let gl = canvas.getContext("webgl");
start();
function start() {

  let r = 0.0;
  let y = 0.0;
  let g = 0.0;

  gl.clearColor(r, y, g, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // let tid=setInterval(() => {
  //   r += 0.1;
  //   if (r >= 1) {
  //     y += 0.1;
  //     if (y >= 1)
  //       {
  //         g += 0.1
  //         if(g>=1){
  //           clearInterval(tid);
  //           gl.clear(gl.COLOR_BUFFER_BIT);
  //         }
  //       }
  //   }
  //   console.log(r,y,g);
  //   gl.clearColor(r, y, g, 1.0);
  //   gl.clear(gl.COLOR_BUFFER_BIT);
  // }, 500);

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

  const FS_Shader = `
    void main(){
      gl_FragColor=vec4(1.0,1.0,0.0,1.0);
    }
  `;
  let program = initShaderProgram(gl, VS_Shader, FS_Shader);

  if(!program) return;  


  let a_Position=gl.getAttribLocation(program,AVertexPosition);
  console.log('a_Position: ', a_Position);
  if(a_Position<0) return;

  gl.vertexAttrib3f(a_Position,0.9,0.5,0.0);



  gl.useProgram(program);
  gl.drawArrays(gl.POINTS, 0, 1);
}