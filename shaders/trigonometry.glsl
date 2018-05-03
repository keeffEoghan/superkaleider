/**
 * Some trigonometry utilities.
 */

/** @public */
float length2(vec2 v) {
    return dot(v, v);
}

/** @public */
float distance2(vec2 a, vec2 b) {
    return length2(a-b);
}

/** @public */
vec2 perp(vec2 v) {
    return vec2(v.y, -v.x);
}
