# gl-css3d

Synchronize CSS 3D transformations to a WebGL scene

![screenshot](http://i.imgur.com/OWTWvSQ.png "Screenshot")

Usage:

    var createCSS3D = require('gl-css3d');

    // pass an HTML DOM element node, such as an <iframe>
    var css3d = createCSS3D(htmlElement, opts);

    // when the GL scene is resized, update the perspective matrix:
    css3d.updatePerspective(cameraFOVradians, shell_width, shell_height);

    // when the GL scene is rendered, update the view matrix:
    css3d.updateView(view);

For an example embedding an iframe run `npm start`. Drag over
the scene not on the iframe or scroll to move the camera (uses
[game-shell-orbit-camera](https://github.com/mikolalysenko/game-shell-orbit-camera)).
The iframe accepts pointer events and can be interacted with as an ordinary
webpage.

## References

* [voxel-webview](https://github.com/deathcap/voxel-webview) - embed webpages in a voxel.js world using CSS 3D
* [W3C CSS Transforms Module Level 1: 3D Transforms](http://www.w3.org/TR/css3-3d-transforms/)
* [Mixing HTML Pages Inside Your WebGL](http://learningthreejs.com/blog/2013/04/30/closing-the-gap-between-html-and-webgl/)
* [stemkoski Three.js Examples: CSS3D](http://stemkoski.github.io/Three.js/CSS3D.html) ([source](https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/CSS3D.html))

## License

MIT

