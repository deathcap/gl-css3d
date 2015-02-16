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
domElement.style.top = '0'
domElement.style.left = '0'
domElement.style.margin = '0'
domElement.style.padding = '0'

var cameraElement = document.createElement('div')
cameraElement.style.position = 'absolute'
cameraElement.style.transformStyle = 'preserve-3d'
//cameraElement.style.display = 'none'
cameraElement.style.pointerEvents = 'auto' // allow mouse interaction

var iframe = document.createElement('iframe')
iframe.src = 'http://browserify.org'
//iframe.src = 'data:text/html,<body bgcolor=purple>'
//iframe.style.backgroundColor = 'purple'
iframe.style.width = '100%'
iframe.style.height = '100%'
cameraElement.appendChild(iframe)

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
    vertex: "\
attribute vec3 position;\
\
uniform mat4 projection;\
uniform mat4 view;\
uniform mat4 model;\
varying vec4 vColor;\
\
void main() {\
  gl_Position = projection * view * model * vec4(position, 1.0);\
}",

  fragment: "\
precision highp float;\
varying vec4 vColor;\
\
void main() {\
  gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);\
}"})(gl)

})

var model = mat4.create()
var cssMatrix = mat4.create()

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

/* // for testing, toggle CSS visibility (useful as it overlaps)
window.setInterval(function() {
  cameraElement.style.display = (cameraElement.style.display === 'none' ? '' : 'none')
}, 500)
*/

shell.on("gl-render", function() {
  var proj = mat4.perspective(mat4.create(), cameraFOVradians, shell.width/shell.height, 0.1, 1000.0)
  var view = camera.view()
  //var view = simpleCameraView()

  shader.bind()
  shader.attributes.position.location = 0

  shader.uniforms.projection = proj
  shader.uniforms.view = view
  shader.uniforms.model = model

  mesh.bind(shader)
  mesh.draw()
  mesh.unbind()

  // CSS world perspective TODO: only on gl-resize -- this doesn't change often
  var fovPx = 0.5 / Math.tan(cameraFOVradians / 2) * shell.height
  domElement.style.perspective = fovPx + 'px'
  //domElement.style.perspectiveOrigin = '50% 50%' // already is the default
  domElement.style.width = shell.width + 'px'
  domElement.style.height = shell.height + 'px'

  // CSS cameraElement
  cameraElement.style.width = shell.width + 'px'
  cameraElement.style.height = shell.height + 'px'

  var planeWidth = 2
  var planeHeight = 2
  var scaleX = -planeWidth / shell.width
  var scaleY = -planeHeight / shell.height
  var scaleZ = 1
  mat4.scale(cssMatrix, view, [scaleX, scaleY, scaleZ])

  //mat4.scale(cssMatrix, view, [1/shell.width * 2, 1/shell.height * 2, 1])
  // three.js CSS3Renderer getCameraCSSMatrix inverts these to fix flipped rotation orientation
  // TODO: matrix transformation instead?
  cssMatrix[1] = -cssMatrix[1]
  cssMatrix[5] = -cssMatrix[5]
  cssMatrix[9] = -cssMatrix[9]
  cssMatrix[13] = -cssMatrix[13]


  cameraElement.style.transform = 'translateZ('+fovPx+'px) ' + matrixToCSS(cssMatrix) //+ ' translate3d('+(shell.width/2)+'px, '+(shell.height/2)+'px, 0)'
})
