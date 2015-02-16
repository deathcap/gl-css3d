"use strict"

var createCSS3D = require('./');
var shell = require("gl-now")({clearColor: [0.2, 0.4, 0.8, 1.0]})
var camera = require("game-shell-orbit-camera")(shell)
var mat4 = require("gl-mat4")

var iframe = document.createElement('iframe');
iframe.src = 'http://browserify.org';
//iframe.src = 'data:text/html,<body bgcolor=purple>';
//iframe.style.backgroundColor = 'purple';
iframe.style.width = '100%';
iframe.style.height = '100%';

var css3d = createCSS3D(iframe);

var cameraFOVdegrees = 45
var cameraFOVradians = cameraFOVdegrees * Math.PI / 180

// eye, target, up
camera.lookAt([0,0,-3], [0,0,0], [0,1,0])
// a slight rotation for effect
camera.rotate([1/4,-1/4,0], [0,0,0])

shell.on('gl-init', function() {
  // allow pointer events to pass through canvas to CSS world behind
  shell.canvas.style.pointerEvents = 'none';
  shell.canvas.parentElement.style.pointerEvents = 'none';

  css3d.ginit(shell.gl);
});

var button = document.createElement('button');
button.style.zIndex = 1;
button.style.position = 'absolute';
button.style.top = '0px';
button.style.left = '0px';
button.textContent = 'toggle mouse (iframe/camera)';
button.addEventListener('click', function() {
  shell.canvas.style.pointerEvents = (shell.canvas.style.pointerEvents == 'none' ? '' : 'none');
  shell.canvas.parentElement.style.pointerEvents = (shell.canvas.parentElement.style.pointerEvents == 'none' ? '' : 'none');
});
document.body.appendChild(button);

shell.on('gl-resize', function(width, height) {
  css3d.updatePerspective(cameraFOVradians, shell.width, shell.height);
});

shell.on('gl-render', function() {
  var proj = mat4.perspective(mat4.create(), cameraFOVradians, shell.width/shell.height, 0.1, 1000.0)
  var view = camera.view()

  css3d.render(view, proj);
})
