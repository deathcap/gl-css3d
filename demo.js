"use strict"
// based on example from https://github.com/mikolalysenko/draw-billboard
var shell = require("gl-now")()
var camera = require("game-shell-orbit-camera")(shell)
var renderText = require("gl-render-text")
var mat4 = require("gl-mat4")
var drawBillboard = require("draw-billboard")

var texture
var positions = new Array(100)

shell.on("gl-init", function() {
  var gl = shell.gl
  texture = renderText(gl, "Billboard")

  for(var i=0; i<100; ++i) {
    positions[i] = [ 100 * (0.5 - Math.random()),
                     100 * (0.5 - Math.random()),
                     100 * (0.5 - Math.random()) ]
  }
})

shell.on("gl-render", function() {
  var proj = mat4.perspective(mat4.create(), Math.PI/4.0, shell.width/shell.height, 0.1, 1000.0)
  var view = camera.view()

  for(var i=0; i<100; ++i) {
    drawBillboard(shell.gl, positions[i], { texture: texture, projection: proj, view: view })
  }
})
