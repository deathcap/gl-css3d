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

var cssWorld = document.createElement('div')
cssWorld.style.transformStyle = 'preserve-3d'
cssWorld.style.overflow = 'hidden'
cssWorld.style.pointerEvents = 'none'
cssWorld.style.position = 'absolute'
cssWorld.style.zIndex = '1' // above WebGL canvas

var element = document.createElement('iframe')
//element.src = 'http://browserify.org'
element.src = 'data:text/html,<body bgcolor=purple>'
element.style.width = 256 + 'px'
element.style.height = 256 + 'px'
element.style.position = 'absolute'
element.style.transformStyle = 'preserve-3d'
//element.style.display = 'none'
//element.style.pointerEvents = 'auto' // allow mouse interaction

cssWorld.appendChild(element)
document.body.appendChild(cssWorld)

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
  vColor = vec4(gl_Position.x, gl_Position.y, gl_Position.z, 1.0);\
}",

  fragment: "/* voxel-decals fragment shader */\
precision highp float;\
varying vec4 vColor;\
\
void main() {\
  gl_FragColor = vColor;\
}"})(gl)

})

var model = mat4.create()
var s=1/3
mat4.scale(model, model, [s,s,s])

var projViewModel = mat4.create()

var cameraFOVdegrees = 45

var scratch0 = new Float32Array(16)
var scratch1 = new Float32Array(16)

// based on orbit-camera
function simpleCameraView(out) {
  return [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, -1, 1]
}

shell.on("gl-render", function() {
  var proj = mat4.perspective(mat4.create(), cameraFOVdegrees * Math.PI / 180, shell.width/shell.height, 0.1, 1000.0)
  //var view = camera.view()
  var view = simpleCameraView()

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
  var fovPx = 0.5 / Math.tan(cameraFOVdegrees * Math.PI / 360) * screenHeight
  cssWorld.style.perspective = fovPx + 'px'
  cssWorld.style.width = shell.width + 'px'
  cssWorld.style.height = shell.height + 'px'

  // CSS element
  //element.style.transform = 'translateZ(' + fovPx + 'px) ' + matrixToCSS(view) + ' translate3d(' + (shell.width/2) + 'px, ' + (shell.height/2) + 'px, 0)'
  //var matrixWorldInverse = mat4.create()
  //mat4.invert(matrixWorldInverse, view)
  //mat4.transpose(matrixWorldInverse, matrixWorldInverse)
  element.style.transform = matrixToCSS(view)
})
