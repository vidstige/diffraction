const glMatrix = require('gl-matrix');
const vec3 = glMatrix.vec3;
const mat4 = glMatrix.mat4;

const dat = require('dat.gui');


const TAU = Math.PI * 2;

// Gaussian with mean 0 and variance 1 using using Box-Muller transform
function randn() {
  var u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

const dots = [];
const scatter = [];


const gui = new dat.GUI();
const settings = {
  'ω': 0.2,
  radius: 1,
  focus: 0.99,
  scatter_length: 20,
  scatter_spread: 200,
  alpha: 0.2
};
gui.add(settings, 'ω', -3, 3);
gui.add(settings, 'radius', 1, 20);
gui.add(settings, 'focus', 0.98, 1.02);
gui.add(settings, 'scatter_length', 1, 200);
gui.add(settings, 'scatter_spread', 0, 500);
gui.add(settings, 'alpha', 0, 1);


const _camera = mat4.create();
function camera(t) {
  const w = settings['ω'];
  //const w = 0;
  const r = 5;
  const eye = vec3.fromValues(
    r * Math.cos(t * w),
    r * Math.sin(t * w),
    0.2);
  const center = vec3.fromValues(0, 0, 0);
  const up = vec3.fromValues(0, 0, 1);
  return mat4.lookAt(_camera, eye, center, up);
}

function clear(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function withAlpha(color, alpha) {
  return color.replace(/[\d\.]+\)$/g, alpha + ')')
}

function draw(canvas, t) {
  var ctx = canvas.getContext('2d');
  const color = window.getComputedStyle(canvas).color;
  ctx.fillStyle = withAlpha(color, settings.alpha);

  const scale = Math.min(canvas.width, canvas.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(scale, -scale);
  ctx.translate(0.5, -0.5);

  const dot = vec3.create();
  const matrix = mat4.create();
  const projection = mat4.create();
  mat4.perspective(projection, TAU / 4, 1, 0.1, 5);
  mat4.multiply(matrix, projection, camera(t));

  const focus = settings.focus;
  for (var i = 0; i < dots.length; i++) {
    vec3.transformMat4(dot, dots[i], matrix);
    const sf = settings.scatter_spread * (dot[2] - focus) * (dot[2] - focus);
    //console.log(focus, dot[2]);
    //const sf  = 0;
    for (var j = 0; j < settings.scatter_length; j++) {
      const s = scatter[j];
      const radius = (dot[2] - 0.5) * settings.radius;
      ctx.beginPath();
      ctx.arc(dot[0] + sf * s[0], dot[1] + sf * s[1], radius/scale, 0, TAU);
      ctx.fill();
    }
  }
}

function animate(t) {
  if (t) {
    const canvas = document.getElementById('target');
    clear(canvas);
    draw(canvas, t / 1000);
  }
  requestAnimationFrame(animate);
}

function onResize() {
  const canvas = document.getElementById('target');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', onResize);
onResize();

for (var i = 0; i < 100; i++) {
  const r = vec3.fromValues(randn(), randn(), randn());
  dots.push(vec3.normalize(r, r));
}

for (var i = 0; i < 200; i++) {
  scatter.push(vec3.fromValues(randn(), randn()));
}

requestAnimationFrame(animate);


