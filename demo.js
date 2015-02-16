"use strict"

var createCSS3D = require('./');
var shell = require("gl-now")({clearColor: [0.2, 0.4, 0.8, 1.0]})
var camera = require("game-shell-orbit-camera")(shell)
var mat4 = require("gl-mat4")
var createMesh = require("gl-mesh")
var glslify = require("glslify")

// render a yellow plane using WebGL behind the CSS3D element, for debugging
var SHOW_GL_PLANE = true

var mesh
var shader

var css3d = createCSS3D();

if (SHOW_GL_PLANE)
shell.on("gl-init", function() {
  var gl = shell.gl

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
varying vec4 vColor;\
\
void main() {\
  gl_Position = projection * view * vec4(position, 1.0);\
}",

  fragment: "\
precision highp float;\
varying vec4 vColor;\
\
void main() {\
  gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);\
}"})(gl)

})

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

// eye, target, up
camera.lookAt([0,0,-3], [0,0,0], [0,1,0])
// a slight rotation for effect
camera.rotate([1/4,-1/4,0], [0,0,0])

shell.on("gl-render", function() {
  var proj = mat4.perspective(mat4.create(), cameraFOVradians, shell.width/shell.height, 0.1, 1000.0)
  var view = camera.view()
  //var view = simpleCameraView()

  if (SHOW_GL_PLANE) {
    shader.bind()
    shader.attributes.position.location = 0

    shader.uniforms.projection = proj
    shader.uniforms.view = view

    mesh.bind(shader)
    mesh.draw()
    mesh.unbind()
  }

  css3d.update(view, cameraFOVradians, shell.width, shell.height);
})
