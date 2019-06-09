let sceenWidth=window.innerWidth;
let sceenHeight=window.innerHeight;

function equaln(v1, v2, fuzz = 1e-5) {
  if (typeof v1 === 'number' && typeof v2 === 'number')
    return false;
  return Math.abs(v1 - v2) <= fuzz;
}