/**
 * Just render flat to the viewport.
 */

// Provided by three.js - [see](http://threejs.org/docs/#Reference/Renderers.WebGL/WebGLProgram)

// // Default vertex attributes provided by Geometry and BufferGeometry
// attribute vec3 position;
// attribute vec2 uv;

// varying vec2 vUV;

void main() {
    gl_Position = vec4(position, 1.0);
    // vUV = uv;
}
