"use strict"

var shell = require("gl-now")({clearColor: [0.2, 0.4, 0.8, 1.0]})
var camera = require("game-shell-orbit-camera")(shell)
var renderText = require("gl-render-text")
var mat4 = require("gl-mat4")
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
element.style.width = 256
element.style.height = 256
element.style.position = 'absolute'
element.style.transformStyle = 'preserve-3d'
element.style.pointerEvents = 'auto'

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
        [0, 0, 0],
        [0, 1, 0],
        [1, 0, 0],
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
mat4.translate(model, model, [0,0,10])
mat4.scale(model, model, [4,4,4])

var projViewModel = mat4.create()

shell.on("gl-render", function() {
  var proj = mat4.perspective(mat4.create(), Math.PI/4.0, shell.width/shell.height, 0.1, 1000.0)
  var view = camera.view()

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
  var fovPx = 0.5 / Math.tan(cameraFOV * Math.PI / 360) * screenHeight
  cssWorld.style.perspective = fovPx + 'px'
  cssWorld.style.width = shell.width + 'px'
  cssWorld.style.height = shell.height + 'px'

  // CSS element
})
