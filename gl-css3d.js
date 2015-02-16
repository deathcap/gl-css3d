'use strict';

var matrixToCSS = require('matrix-to-css');
var mat4 = require('gl-mat4');

var domElement;
var cameraElement;

var createCSS3D = function() {
  domElement = document.createElement('div');
  domElement.style.transformStyle = 'preserve-3d';
  domElement.style.overflow = 'hidden';
  domElement.style.pointerEvents = 'none';
  domElement.style.position = 'absolute';
  domElement.style.zIndex = '1'; // above WebGL canvas
  domElement.style.top = '0';
  domElement.style.left = '0';
  domElement.style.margin = '0';
  domElement.style.padding = '0';

  cameraElement = document.createElement('div');
  cameraElement.style.position = 'absolute';
  cameraElement.style.transformStyle = 'preserve-3d';
  //cameraElement.style.display = 'none';
  cameraElement.style.pointerEvents = 'auto'; // allow mouse interaction

  var iframe = document.createElement('iframe');
  iframe.src = 'http://browserify.org';
  //iframe.src = 'data:text/html,<body bgcolor=purple>';
  //iframe.style.backgroundColor = 'purple';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  cameraElement.appendChild(iframe);

  domElement.appendChild(cameraElement);
  document.body.appendChild(domElement);
};

var cssMatrix = mat4.create();

var updateCSS3D = function(view, cameraFOVradians, width, height) {

  // CSS world perspective TODO: only on gl-resize -- this doesn't change often
  var fovPx = 0.5 / Math.tan(cameraFOVradians / 2) * height;
  domElement.style.perspective = fovPx + 'px';
  //domElement.style.perspectiveOrigin = '50% 50%'; // already is the default
  domElement.style.width = width + 'px';
  domElement.style.height = height + 'px';

  // CSS cameraElement
  cameraElement.style.width = width + 'px';
  cameraElement.style.height = height + 'px';

  var planeWidth = 2; // assume -1 to +1
  var planeHeight = 2;
  var scaleX = -planeWidth / width;
  var scaleY = -planeHeight / height;
  var scaleZ = 1;
  mat4.scale(cssMatrix, view, [scaleX, scaleY, scaleZ]);

  //mat4.scale(cssMatrix, view, [1/width * 2, 1/height * 2, 1])
  // three.js CSS3Renderer getCameraCSSMatrix inverts these to fix flipped rotation orientation
  // TODO: matrix transformation instead?
  cssMatrix[1] = -cssMatrix[1];
  cssMatrix[5] = -cssMatrix[5];
  cssMatrix[9] = -cssMatrix[9];
  cssMatrix[13] = -cssMatrix[13];

  cameraElement.style.transform = 'translateZ('+fovPx+'px) ' + matrixToCSS(cssMatrix);
};

module.exports = {
  createCSS3D: createCSS3D,
  updateCSS3D: updateCSS3D
};
