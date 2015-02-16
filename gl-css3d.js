'use strict';

var matrixToCSS = require('matrix-to-css');
var mat4 = require('gl-mat4');

module.exports = function(element, opts) {
  return new GLCSS3D(element, opts);
};

function GLCSS3D(element, opts) {
  if (!element) throw new Error('gl-css3d requires element');

  var domElement = document.createElement('div');
  domElement.style.transformStyle = domElement.style.webkitTransformStyle = 'preserve-3d';
  domElement.style.overflow = 'hidden';
  domElement.style.pointerEvents = 'none';
  domElement.style.position = 'absolute';
  domElement.style.zIndex = '-1'; // below WebGL canvas
  domElement.style.top = '0';
  domElement.style.left = '0';
  domElement.style.margin = '0';
  domElement.style.padding = '0';

  var cameraElement = document.createElement('div');
  cameraElement.style.position = 'absolute';
  cameraElement.style.transformStyle = cameraElement.style.webkitTransformStyle = 'preserve-3d';
  //cameraElement.style.display = 'none';
  cameraElement.style.pointerEvents = 'auto'; // allow mouse interaction

  cameraElement.appendChild(element);

  domElement.appendChild(cameraElement);
  document.body.appendChild(domElement);

  this.domElement = domElement;
  this.cameraElement = cameraElement;

  opts = opts || {};

  this.planeWidth = opts.planeWidth || 2; // assume -1 to +1
  this.planeHeight = opts.planeHeight || 2;
}

GLCSS3D.prototype.updatePerspective = function(cameraFOVradians, width, height) {
  // CSS world perspective - only needs to change on gl-resize (not each rendering tick)
  var fovPx = 0.5 / Math.tan(cameraFOVradians / 2) * height;
  this.domElement.style.perspective = this.domElement.style.webkitPerspective = fovPx + 'px';
  //domElement.style.perspectiveOrigin = '50% 50%'; // already is the default
  this.domElement.style.width = width + 'px';
  this.domElement.style.height = height + 'px';

  this.fovPx = fovPx;

  // CSS camera element child
  this.cameraElement.style.width = width + 'px';
  this.cameraElement.style.height = height + 'px';

  this.width = width;
  this.height = height;
};

var cssMatrix = mat4.create();

GLCSS3D.prototype.updateView = function(view) {
  var scaleX = -this.planeWidth / this.width;
  var scaleY = -this.planeHeight / this.height;
  var scaleZ = 1;
  mat4.scale(cssMatrix, view, [scaleX, scaleY, scaleZ]);

  //mat4.scale(cssMatrix, view, [1/width * 2, 1/height * 2, 1])
  // three.js CSS3Renderer getCameraCSSMatrix inverts these to fix flipped rotation orientation
  // TODO: matrix transformation instead?
  cssMatrix[1] = -cssMatrix[1];
  cssMatrix[5] = -cssMatrix[5];
  cssMatrix[9] = -cssMatrix[9];
  cssMatrix[13] = -cssMatrix[13];

  this.cameraElement.style.transform = this.cameraElement.style.webkitTransform = 'translateZ('+this.fovPx+'px) ' + matrixToCSS(cssMatrix);
};

