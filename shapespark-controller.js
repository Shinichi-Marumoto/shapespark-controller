"use strict";
class get_scriptParams {
  constructor() {
    const parameters = document.currentScript.src.substring( document.currentScript.src.indexOf('?') + 1 ).split('&');
    for (let i = 0; i < parameters.length; i++) {
      const element = parameters[ i ].split('='),
            paramName = decodeURIComponent(element[0]),
            paramValue = decodeURIComponent(element[1]);
      this[paramName] = paramValue;
    }
  }
}
class Camera {
  constructor(camera_X, camera_Y, camera_Z, camera_Yaw, camera_YD, camera_PD) {
    this.x = camera_X;
    this.y = camera_Y;
    this.z = camera_Z;
    this.yaw = camera_Yaw;
    this.yawDeg = camera_YD;
    this.pitchDeg = camera_PD;
  }
  getCam() {
    cameraX = this.x;
    cameraY = this.y;
    cameraZ = this.z;
    cameraYaw = this.yaw;
    cameraYD = this.yawDeg;
    cameraPD = this.pitchDeg;
  }
  setCam() {
    let view = new WALK.View();
    view.position.x = this.x;
    view.position.y = this.y;
    view.position.z = this.z;
    view.rotation.yaw = this.yaw;
    view.rotation.yawDeg = this.yawDeg;
    view.rotation.pitchDeg = this.pitchDeg;
    viewer.switchToView(view, 0);
  }
}
class Key {
  constructor(keys){
    this.keys = keys;
  }
  down() {
    for (let i=0; i<this.keys.length; i++) {
      wCanvas.dispatchEvent(new KeyboardEvent('keydown', {keyCode:this.keys[i],bubbles:true,cancelable:true}));
    }
  }
  up() {
    for (let i=0; i<this.keys.length; i++) {
      wCanvas.dispatchEvent(new KeyboardEvent('keyup', {keyCode:this.keys[i],bubbles:true,cancelable:true}));
    }
  }
  reset() {
    wCanvas.focus();
    this.up();
  }
}

const wCanvas = document.getElementById('walk-canvas'),
      leftStick = document.createElement('div'),
      rightStick = document.createElement('div'),
      touchable = 'ontouchstart' in window || 'createTouch' in document || navigator.msPointerEnabled,
      cameraSpeed = 2000,
      drawInterval = 1000/30,
      _joystick = new get_scriptParams()['joystick'] == 'true' ? true : false,
      _sab = new get_scriptParams()['sab'] == 'true' ? 'env(safe-area-inset-bottom)' : '0px',
      _flipMouse = window.location.hash.indexOf('flipmouse') != -1 ? 1 : -1;

let ls_canvas, rs_canvas, ls_c2d, rs_c2d,
    lsTouchID = -1, rsTouchID = -2,
    lsStartX, lsStartY, rsStartX, rsStartY,
    lsTouchX = 0, lsTouchY = 0, rsTouchX = 0, rsTouchY = 0,
    mouseStartX, mouseStartY,
    touches = [],
    isDrawing = false,
    cameraX, cameraY, cameraZ, cameraYaw, cameraYD, cameraPD;

if ( typeof viewer == 'undefined' ) { var viewer = WALK.getViewer(); }
createStick();
setInterval(draw, drawInterval);

function _preventDefault(e) { e.preventDefault(); }
function createStick() {
  leftStick.id = 'left_stick';
  leftStick.style.position = 'absolute';
  leftStick.style.bottom = 'calc(10px + ' + _sab + ')';
  leftStick.style.left = '50%';
  leftStick.style.transform = 'translateX(-50%) translateY(0)';
  leftStick.style.width = '40px';
  leftStick.style.height = '40px';
  leftStick.style.opacity = 0.6;
  leftStick.style.transition = 'opacity 0.5s';
  leftStick.style.cursor = 'pointer';
  rightStick.id = 'right_stick';
  rightStick.style.position = 'absolute';
  rightStick.style.bottom = '-100px';
  rightStick.style.right = '-100px';
  rightStick.style.width = '40px';
  rightStick.style.height = '40px';
  rightStick.style.opacity = 0.6;
  rightStick.style.transition = 'opacity 0.5s';
  rightStick.style.display = 'none';

  const mediaQuery = window.matchMedia('(orientation:landscape) and (hover:none) and (pointer:coarse)');
  mediaQuery.addListener(mediaQueryChange);
  mediaQueryChange(mediaQuery);
  function mediaQueryChange(e) {
    if (e.matches) {
      leftStick.style.bottom = '100px';
      leftStick.style.left = '100px';
      leftStick.style.transform = 'translateX(0) translateY(50%)';
      rightStick.style.bottom = '100px';
      rightStick.style.right = '100px';
      rightStick.style.transform = 'translateX(0) translateY(50%)';
      rightStick.style.display = 'block';
    } else {
      leftStick.style.bottom = 'calc(10px + ' + _sab + ')';
      leftStick.style.left = '50%';
      leftStick.style.transform = 'translateX(-50%) translateY(0)';
      rightStick.style.bottom = '-100px';
      rightStick.style.right = '-100px';
      rightStick.style.transform = 'inherit';
      rightStick.style.display = 'none';
    }
  }
  
  ls_canvas = document.createElement('canvas');
  ls_canvas.width = 40;
  ls_canvas.height = 40;
  ls_c2d = ls_canvas.getContext('2d');
  ls_c2d.clearRect(0,0,ls_canvas.width, ls_canvas.height);
  ls_c2d.beginPath();
  ls_c2d.strokeStyle = '#fff';
  ls_c2d.lineWidth = 2;
  ls_c2d.arc(20, 20, 10,0,Math.PI*2,true);
  ls_c2d.stroke();
  ls_c2d.beginPath();
  ls_c2d.strokeStyle = '#fff'; 
  ls_c2d.lineWidth = 1;
  ls_c2d.arc(20, 20, 15,0,Math.PI*2,true);
  ls_c2d.stroke();
  rs_canvas = document.createElement('canvas');
  rs_canvas.width = 40;
  rs_canvas.height = 40;
  rs_c2d = rs_canvas.getContext('2d');
  rs_c2d.clearRect(0,0,rs_canvas.width, rs_canvas.height);
  rs_c2d.beginPath();
  rs_c2d.strokeStyle = '#fff';
  rs_c2d.lineWidth = 2;
  rs_c2d.arc(20, 20, 10,0,Math.PI*2,true);
  rs_c2d.stroke();
  rs_c2d.beginPath();
  rs_c2d.strokeStyle = '#fff'; 
  rs_c2d.lineWidth = 1;
  rs_c2d.arc(20, 20, 15,0,Math.PI*2,true);
  rs_c2d.stroke();

  wCanvas.parentNode.insertBefore(leftStick, wCanvas);
  wCanvas.parentNode.insertBefore(rightStick, wCanvas);
  leftStick.appendChild(ls_canvas);
  rightStick.appendChild(rs_canvas);
}

if (touchable) {
  document.addEventListener('dblclick', _preventDefault, false); 
  document.addEventListener('touchend', function() {
    rightStick.dispatchEvent(new TouchEvent('touchend', { bubbles:false, cancelable:true }));
  }, false );
  leftStick.addEventListener('touchstart', onLsStart, false);
  leftStick.addEventListener('touchmove', onTouchMove, false);
  leftStick.addEventListener('touchend', onLsEnd, false);
  rightStick.addEventListener('touchstart', onRsStart, false);
  rightStick.addEventListener('touchmove', onTouchMove, false);
  rightStick.addEventListener('touchend', onRsEnd, false);
} else {
  leftStick.addEventListener('mousedown', onMouseDown, false);
  document.addEventListener('mousemove', onMouseMove, false);
  document.addEventListener('mouseup', onMouseUp, false);
  document.addEventListener('mouseleave', onMouseUp, false);
}

function onLsStart(e) {
  const cameraPos = viewer.getCameraPosition(),
        cameraRot = viewer.getCameraRotation();
  new Camera(cameraPos.x, cameraPos.y, cameraPos.z, cameraRot.yaw, cameraRot.yawDeg, cameraRot.pitchDeg).getCam();
  leftStick.style.opacity = 1;
  for (let i=0; i<e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    lsTouchID = touch.identifier;
    lsStartX = touch.clientX;
    lsStartY = touch.clientY;
  }
  touches = e.touches;
}
function onRsStart(e) {
  const cameraPos = viewer.getCameraPosition(),
        cameraRot = viewer.getCameraRotation();
  new Camera(cameraPos.x, cameraPos.y, cameraPos.z, cameraRot.yaw, cameraRot.yawDeg, cameraRot.pitchDeg).getCam();
  rightStick.style.opacity = 1;
  for (let i = 0; i<e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    rsTouchID = touch.identifier;
    rsStartX = touch.clientX;
    rsStartY = touch.clientY;
  }
  touches = e.touches; 
}
function onTouchMove(e) {
  _preventDefault(e);
  touches = e.touches;
}
function onLsEnd(e) {
  if (e.changedTouches.length != 0) {
    leftStick.style.opacity = 0.6;
    for (let i = 0; i<e.changedTouches.length; i++){
      const touch =e.changedTouches[i];
      if (lsTouchID == touch.identifier) {
        lsTouchX = lsTouchY = 0;
        lsTouchID = -1;
        break;
      }
    }
    if (!_joystick) { new Key([87,65,83,68]).reset(); }
  }
  touches = e.touches;
}
function onRsEnd(e) {
  if (e.changedTouches.length != 0) {
    rightStick.style.opacity = 0.6;
    for (let i = 0; i<e.changedTouches.length; i++){
      const touch =e.changedTouches[i];
      if (rsTouchID == touch.identifier) {
        rsTouchX = rsTouchY = 0;
        rsTouchID = -2;
        break;
      }
    }
    if (!_joystick) { new Key([37,39]).reset(); }
  }
  touches = e.touches;
}

function onMouseDown(e) {
  const cameraPos = viewer.getCameraPosition(),
        cameraRot = viewer.getCameraRotation();
  new Camera(cameraPos.x, cameraPos.y, cameraPos.z, cameraRot.yaw, cameraRot.yawDeg, cameraRot.pitchDeg).getCam();
  lsTouchX = lsTouchY = 0;
  lsStartX = e.clientX;
  lsStartY = e.clientY;
  isDrawing = true;
  leftStick.style.opacity = 0.6;
  wCanvas.style.pointerEvents = 'none';
}
function onMouseMove(e) {
  if (isDrawing) {
    lsTouchX = e.clientX - lsStartX;
    lsTouchY = lsStartY - e.clientY;
  }
}
function onMouseUp() {
  if (isDrawing) {
    isDrawing = false;
    leftStick.style.opacity = 0.6;
    wCanvas.style.pointerEvents = 'auto';
    if (!_joystick) { new Key([87,65,83,68]).reset(); }
  }
}

function calcStickMove() {
  cameraX += ( ((Math.abs(cameraYaw) - Math.PI/2) * (-1)) * (lsTouchX/cameraSpeed) ) + ( (Math.abs(Math.abs(Math.abs(cameraYaw) - Math.PI/2) - Math.PI/2) * (Math.abs(cameraYaw)/cameraYaw * (-1))) * (lsTouchY/cameraSpeed) );
  cameraY -= ( ((Math.abs(Math.abs(cameraYaw) - Math.PI/2) - Math.PI/2) * ( Math.abs(cameraYaw)/cameraYaw )) * (lsTouchX/cameraSpeed) ) - ( ((Math.abs(cameraYaw) - Math.PI/2) * (-1)) * (lsTouchY/cameraSpeed) );
}
function calcStickAngle() {
  cameraYD += rsTouchX*20/cameraSpeed*_flipMouse;
  cameraPD -= rsTouchY*20/cameraSpeed*_flipMouse;
}
function calcKeyMove() {
  const _theta = Math.atan(lsTouchY/lsTouchX);
  lsTouchY > 0 && Math.abs(_theta) > Math.PI/16 ? new Key([87]).down() : new Key([87]).up();
  lsTouchX < 0 && Math.abs(_theta) < Math.PI*3/16 ? new Key([65]).down() : new Key([65]).up();
  lsTouchY < 0 && Math.abs(_theta) > Math.PI/16 ? new Key([83]).down() : new Key([83]).up();
  lsTouchX > 0 && Math.abs(_theta) < Math.PI*3/16 ? new Key([68]).down() : new Key([68]).up();
}
function calcKeyAngle() {
  const _theta = Math.atan(rsTouchY/rsTouchX);
  if (_flipMouse != 1) {
    rsTouchX < 0 && Math.abs(_theta) < Math.PI/4 ? new Key([37]).down() : new Key([37]).up();
    rsTouchX > 0 && Math.abs(_theta) < Math.PI/4 ? new Key([39]).down() : new Key([39]).up();
  } else {
    rsTouchX < 0 && Math.abs(_theta) < Math.PI/4 ? new Key([39]).down() : new Key([30]).up();
    rsTouchX > 0 && Math.abs(_theta) < Math.PI/4 ? new Key([37]).down() : new Key([37]).up();
  }
}

function draw() {
  if (touchable) {
    for (let i=0; i<touches.length; i++) {
      const touch = touches[i];
      if (touch.identifier == lsTouchID) {
        lsTouchX = touch.clientX - lsStartX;
        lsTouchY = lsStartY - touch.clientY;
        !_joystick ? calcKeyMove() : calcStickMove();
      } else if (touch.identifier == rsTouchID) {
        rsTouchX = touch.clientX - rsStartX;
        rsTouchY = rsStartY - touch.clientY;
        !_joystick ? calcKeyAngle() : calcStickAngle();
      }
      if (_joystick) { new Camera(cameraX, cameraY, cameraZ, cameraYaw, cameraYD, cameraPD).setCam(); }
    }
  } else {
    if (isDrawing) {
      if (!_joystick) {
        calcKeyMove();
      } else {
        calcStickMove();
        calcStickAngle();
        new Camera(cameraX, cameraY, cameraZ, cameraYaw, cameraYD, cameraPD).setCam();
      }
    }
  }
}
