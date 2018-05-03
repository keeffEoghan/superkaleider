/**
 * Ray definition.
 */

// Libs.
/** @requires matrix-transform */
vec2 transform(mat3, vec2);


/** @public */
struct Ray {
    vec2 point;
    vec2 direction;
};

/** @public */
Ray transformRay(mat3 transformation, Ray ray) {
    return Ray(transform(transformation, ray.point),
        // Transforming about the point `-ray.point`; [see](http://www.iquilezles.org/www/articles/noacos/noacos.htm)
        // for possibly a better way to do this.
        normalize(transform(transformation, ray.point+ray.direction)-
                ray.point));
}
