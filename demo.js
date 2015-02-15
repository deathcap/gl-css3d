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

shell.on("gl-init", function() {
  var gl = shell.gl
  texture = renderText(gl, "Billboard")

  mesh = createMesh(gl, require("bunny"))

  shader = glslify({
    inline: true,
    vertex: "/* voxel-decals vertex shader */\
attribute vec3 position;\
\
uniform mat4 projection;\
uniform mat4 view;\
uniform mat4 model;\
\
void main() {\
  gl_Position = projection * view * model * vec4(position, 1.0);\
}",

  fragment: "/* voxel-decals fragment shader */\
precision highp float;\
\
void main() {\
  gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\
}"})(gl)

})

var model = mat4.create()
mat4.translate(model, model, [0,-5,20])

shell.on("gl-render", function() {
  var proj = mat4.perspective(mat4.create(), Math.PI/4.0, shell.width/shell.height, 0.1, 1000.0)
  var view = camera.view()

  shader.bind()
  shader.attributes.position.location = 0
  shader.uniforms.projection = proj
  shader.uniforms.view = view
  shader.uniforms.model = model

  mesh.bind(shader)
  mesh.draw()
  mesh.unbind()
})
