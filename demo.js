"use strict"

var matrixToCSS = require("matrix-to-css")
var shell = require("gl-now")({clearColor: [0.2, 0.4, 0.8, 1.0]})
var camera = require("game-shell-orbit-camera")(shell)
var renderText = require("gl-render-text")
var mat4 = require("gl-mat4")
var mat3 = require("gl-mat3")
var vec3 = require("gl-vec3")
var quat = require("gl-matrix-quat")
var createMesh = require("gl-mesh")
var glslify = require("glslify")

var texture
var positions = new Array(100)
var mesh
var shader

var domElement = document.createElement('div')
domElement.style.transformStyle = 'preserve-3d'
domElement.style.overflow = 'hidden'
domElement.style.pointerEvents = 'none'
domElement.style.position = 'absolute'
domElement.style.zIndex = '1' // above WebGL canvas

var cameraElement = document.createElement('iframe')
//cameraElement.src = 'http://browserify.org'
cameraElement.src = 'data:text/html,<body bgcolor=purple>'
cameraElement.style.position = 'absolute'
cameraElement.style.transformStyle = 'preserve-3d'
//cameraElement.style.display = 'none'
//cameraElement.style.pointerEvents = 'auto' // allow mouse interaction

domElement.appendChild(cameraElement)
document.body.appendChild(domElement)

shell.on("gl-init", function() {
  var gl = shell.gl
  texture = renderText(gl, "Billboard")

  mesh = createMesh(gl,
      [
      [0, 1, 2],
      [3, 1, 2]
       ],
      { "position": [
        [-1, -1, 0],
        [-1, 1, 0],
        [1, -1, 0],
        [1, 1, 0]] })

  shader = glslify({
    inline: true,
    vertex: "/* voxel-decals vertex shader */\
attribute vec3 position;\
\
uniform mat4 projViewModel;\
varying vec4 vColor;\
\
void main() {\
  gl_Position = projViewModel * vec4(position, 1.0);\
}",

  fragment: "/* voxel-decals fragment shader */\
precision highp float;\
varying vec4 vColor;\
\
void main() {\
  gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);\
}"})(gl)

})

var model = mat4.create()

var projViewModel = mat4.create()

var scratch0 = new Float32Array(16)
var scratch1 = new Float32Array(16)

// based on orbit-camera
function simpleCameraView(out) {
  if (!out) out = mat4.create()

  var quaternion = [0,1,0,0]
  var translation = [0,0,-1]
  mat4.fromRotationTranslation(out, quaternion, translation)

  return out
}

var cameraFOVdegrees = 45
var cameraFOVradians = cameraFOVdegrees * Math.PI / 180

window.setInterval(function() {
  cameraElement.style.display = (cameraElement.style.display === 'none' ? '' : 'none')
}, 500)

shell.on("gl-render", function() {
  var proj = mat4.perspective(mat4.create(), cameraFOVradians, shell.width/shell.height, 0.1, 1000.0)
  var view = camera.view()
  //var view = simpleCameraView()

  shader.bind()
  shader.attributes.position.location = 0

  mat4.multiply(projViewModel, proj, view)
  mat4.multiply(projViewModel, projViewModel, model)

  shader.uniforms.projViewModel = projViewModel

  mesh.bind(shader)
  mesh.draw()
  mesh.unbind()

  // CSS world perspective TODO: only on gl-resize -- this doesn't change often
  var cameraFOV = 45
  var screenHeight = shell.height
  var fovPx = 0.5 / Math.tan(cameraFOVradians / 2) * screenHeight
  domElement.style.perspective = fovPx + 'px'
  //domElement.style.perspectiveOrigin = '50% 50%' // already is the default
  domElement.style.width = shell.width + 'px'
  domElement.style.height = shell.height + 'px'

  // CSS cameraElement
  //cameraElement.style.transform = 'translateZ(' + fovPx + 'px) ' + matrixToCSS(view) + ' translate3d(' + (shell.width/2) + 'px, ' + (shell.height/2) + 'px, 0)'
  //var matrixWorldInverse = mat4.create()
  //mat4.invert(matrixWorldInverse, view)
  //mat4.transpose(matrixWorldInverse, matrixWorldInverse)
  cameraElement.style.width = shell.width + 'px'
  cameraElement.style.height = shell.height + 'px'
 
  // three.js CSS3Renderer getCameraCSSMatrix inverts these to fix flipped rotation orientation
  // TODO: matrix transformation instead?
  var cssMatrix = mat4.clone(view)
  cssMatrix[1] = -cssMatrix[1]
  cssMatrix[5] = -cssMatrix[5]
  cssMatrix[9] = -cssMatrix[9]
  cssMatrix[13] = -cssMatrix[13]

  cameraElement.style.transform = 'translate3d(0,0,'+fovPx+'px) ' + matrixToCSS(cssMatrix) + ' translate3d('+(shell.width/2)+'px, '+(shell.height/2)+'px, 0)'
})
