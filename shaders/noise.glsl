/**
 * Some noise functions.
 */

// Libs.

/** @requires random */
float rand(vec2);


float noise(vec2 n) {
    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n),
        f = smoothstep(vec2(0.0), vec2(1.0), fract(n));

    return mix(mix(rand(b), rand(b+d.yx), f.x),
                mix(rand(b+d.xy), rand(b+d.yy), f.x),
            f.y);
}


/** @public */
vec2 noise2(vec2 n) {
    return vec2(noise(vec2(n.x+0.2, n.y-0.6)), noise(vec2(n.y+3.0, n.x-4.0)));
}
