/**
 * Some pseudo-random functions.
 */

/** @public */
float rand(vec2 n) {
    return fract(sin(dot(n.xy, vec2(12.9898, 78.233)))*43758.5453);
}
