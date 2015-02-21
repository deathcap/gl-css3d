# gl-css3d

Synchronize CSS 3D transformations to a WebGL scene

![screenshot](http://i.imgur.com/OWTWvSQ.png "Screenshot")

Usage:

    var createCSS3D = require('gl-css3d');

    // pass an HTML DOM element node, such as an <iframe>
    var css3d = createCSS3D(htmlElement, opts);

    // assuming you are using stackgl gl-now/game-shell:

    // in the gl-init callback:
    css3d.ginit(gl)

    // in the gl-resize callback:
    css3d.updatePerspective(cameraFOVradians, shell_width, shell_height);

    // in the gl-render callback:
    css3d.render(view, proj);

For an example embedding an iframe run `npm start`, or try the
[live demo](http://deathcap.github.io/gl-css3d). The iframe accepts pointer events
and can be interacted with as an ordinary webpage. Click the button to toggle mouse
inputs to control the camera instead (drag to move, scroll to zoom; uses
[game-shell-orbit-camera](https://github.com/mikolalysenko/game-shell-orbit-camera)).

## Options

* `planeWidth` (2), `planeHeight` (2): size of the plane in world units

* `tint` (`[0,0,0,0]`): color to draw the WebGL object in front of the CSS3D element, defaults to fully transparent

* `blend` (false): whether to enable blending, defaults to false so `tint` is not influenced
by the colors of the WebGL scene behind it

* `flipX` (true), `flipY` (true): whether to invert the X and Y axes from WebGL to CSS3D

* `backface` (true): whether to include two extra triangles in the WebGL mesh for the rear side of the plane

## References

* [voxel-webview](https://github.com/deathcap/voxel-webview) - embed webpages in a voxel.js world using CSS 3D
* [W3C CSS Transforms Module Level 1: 3D Transforms](http://www.w3.org/TR/css3-3d-transforms/)
* [Mixing HTML Pages Inside Your WebGL](http://learningthreejs.com/blog/2013/04/30/closing-the-gap-between-html-and-webgl/)
* [stemkoski Three.js Examples: CSS3D](http://stemkoski.github.io/Three.js/CSS3D.html) ([source](https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/CSS3D.html))

## License

MIT

