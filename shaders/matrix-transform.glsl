/**
 * Some matrix transformation utilities.
 */

/**
 * @requires trigonometry
 */

float length2(vec2);


/** @public */
const mat2 identity2 = mat2(1.0);
/** @public */
const mat3 identity3 = mat3(1.0);
/** @public */
const mat4 identity4 = mat4(1.0);

// For just a rotation, a `mat2` is all we need; this can be easily consumed by
// the corresponding `mat3` transformation by doing:
//      `mat3Transform = mat3(mat2Transform);`
// `mat3Transform` will be equal to:
//      `mat3(mat2[0][0], mat2[0][1], 0.0,
//          mat2[1][0], mat2[1][1], 0.0,
//          0.0, 0.0, 1.0)`

/** @public */
mat3 rotation(vec2 vec) {
    if(length2(vec) != 1.0) {
        vec = normalize(vec);
    }

    return mat3(mat2(vec.x, -vec.y,
               vec.y, vec.x));
}

/** @public */
mat3 rotation(float angle) {
    float c = cos(angle),
        s = sin(angle);

    return mat3(mat2(c, -s,
            s, c));
}

/** @public */
mat3 translation(vec2 translate) {
    return mat3(1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            translate, 1.0);
}

/** @public */
vec2 transform(mat3 transformation, vec2 vec) {
    return (transformation*vec3(vec, 1.0)).xy;
}
