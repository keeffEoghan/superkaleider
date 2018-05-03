/**
 * Wrapping values to bounds - useful for textures etc.
 */

vec2 wrapRepeat(vec2 pos, vec2 size) {
    return mod(pos, size)/size;
}

vec2 wrapMirrorRepeat(vec2 pos, vec2 size) {
    vec2 even = mod(floor(pos/size), 2.0),
        mirror = mix(vec2(1.0), vec2(-1.0), even);

    return wrapRepeat(pos*mirror, size);
}
