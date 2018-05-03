/**
 * Using rays to perform reflections, transform the fragment around a fractal
 * kaleidoscope.
 */


// Compile-time inputs.

/** @todo Somehow select these via uniforms, without needing to recompile? */
#define depthFirst 0
#define breadthFirst 1

// Inserted in the shader construction.

// #define maxBranches 6
// #define maxDepth 25
// #define initRay initCenterRay
// #define nextRay nextRecursiveRay
// #define map mapKaleidoscope
// #define iteration depthFirst
// #define wrap wrapMirrorRepeat


// Run-time inputs.

uniform int branches;
uniform int depth;

uniform float refraction;

uniform mat3 imageTransform;
uniform mat3 patternTransform;
uniform mat3 designTransform;

uniform vec2 patternPoint;
uniform vec2 patternVector;

uniform sampler2D image;
uniform vec2 imageSize;

uniform vec2 resolution;

// In ms.
uniform float time;

// varying vec2 vUV;


// #define debug

#ifdef debug
    #define debugCircleSize 0.003
    #define debugLineWidth 0.001
    #define debugLineLength 0.15
#endif


// Libs.

/**
 * @requires constants
 * @requires wrap
 * @requires matrix-transform
 * @requires trigonometry
 * @requires ray
 * @-requires noise
 */

/**
 * Ray init.
 */

Ray initCenterRay(vec2 pos, vec2 vec) {
    return Ray(pos, normalize(vec-pos));
}

Ray initCenterPerpRay(vec2 pos, vec2 vec) {
    return Ray(pos, perp(normalize(vec-pos)));
}

Ray initOffsetRay(vec2 pos, vec2 vec) {
    return Ray(vec, normalize(vec-pos));
}

Ray initOffsetPerpRay(vec2 pos, vec2 vec) {
    return Ray(vec, perp(normalize(vec-pos)));
}

/*Ray initOrbitRay(vec2 pos, vec2 vec) {
    vec2 toVec = vec-pos,
        vecOrbit = normalize(toVec)*orbit,
        //orbitOffset = ((length2(vecOrbit) > length2(toVec))? vecOrbit : toVec);
        orbitOffset = mix(vecOrbit, toVec,
            step(length2(vecOrbit), length2(toVec)));

    return Ray(pos+orbitOffset, normalize(vec));
}

Ray initOrbitPerpRay(vec2 pos, vec2 vec) {
    vec2 toVec = vec-pos,
        vecOrbit = normalize(toVec)*orbit,
        //orbitOffset = ((length2(vecOrbit) > length2(toVec))? vecOrbit : toVec);
        orbitOffset = mix(vecOrbit, toVec,
            step(length2(vecOrbit), length2(toVec)));

    return Ray(pos+orbitOffset, normalize(perp(vec)));
}*/


/**
 * Ray iteration.
 */

// Travel along the ray and rotate by the same direction.
Ray nextConstantRay(Ray ray, float size, mat3 transformation, float i) {
    return Ray(ray.point+(ray.direction*size),
               normalize(transform(transformation, ray.direction)));
}

Ray nextConstantPerpRay(Ray ray, float size, mat3 transformation, float i) {
    return Ray(ray.point+perp(ray.direction*size),
               normalize(transform(transformation, ray.direction)));
}

Ray nextRecursiveRay(Ray ray, float size, mat3 transformation, float i) {
    size = pow(size, i);

    return Ray(ray.point+(ray.direction*size),
               normalize(transform(transformation, ray.direction)));
}


/**
 * Map position through pattern rays.
 */

vec2 mapKaleidoscope(vec2 pos, Ray ray) {
    vec2 fromRay = pos-ray.point;

    float offset = dot(fromRay, ray.direction);

    if(offset < 0.0) {
        pos -= 2.0*offset*ray.direction;
    }

    return pos;
}

vec2 mapRefract(vec2 pos, Ray ray) {
    vec2 fromRay = pos-ray.point;

    float offset = dot(fromRay, ray.direction);

    if(offset < 0.0) {
        pos -= refract(fromRay, ray.direction, refraction);
    }

    return pos;
}

vec2 mapMulti(vec2 pos, Ray ray) {
    vec2 fromRay = pos-ray.point;

    float offset = dot(fromRay, ray.direction);

    if(offset < 0.0) {
        pos += refract(fromRay, ray.direction, refraction)-
                2.0*offset*ray.direction;
    }

    return pos;
}

void main() {
    float size = min(resolution.x, resolution.y),
        invSize = 1.0/size;

    vec2 basePoint = patternPoint*invSize,
        baseVector = patternVector*invSize,
        pos = transform(designTransform, gl_FragCoord.xy)*invSize;

    #ifdef debug
        if(distance(pos, basePoint) < debugCircleSize) {
            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
            return;
        }
        if(distance(pos, baseVector) < debugCircleSize) {
            gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
            return;
        }
    #endif

    // Transform the pattern by transforming the base ray.
    Ray ray = transformRay(patternTransform, initRay(basePoint, baseVector));

    float stepSize = length2(baseVector),
        breadth = min(float(branches), float(maxBranches));

    // float foldColor = 0.0,
    //     foldSpread = 0.001;

    mat3 depthTransform = rotation(ray.direction),
        // Offset the starting angle/position by 360/breadth.
        breadthTransform = rotation(tau/breadth);


    // This looks messy as hell, but lets us easily switch between depth- and
    // breadth-first iteration. The single `#` on a line indicate we're breaking
    // from our usual indentation (this is because the nested for loops with
    // an if/else inside them greatly increase indentation just to allow dynamic
    // looping).
    #
    #if iteration == depthFirst
        for(int b = 0; b < maxBranches; ++b) {
            if(b >= branches) {
    #else
        for(int d = 0; d < maxDepth; ++d) {
            if(d >= depth) {
    #endif
                break;
            }
            else {
        #

        Ray iterRay = Ray(ray.point, ray.direction);

        #
        #if iteration == depthFirst
            for(int d = 0; d < maxDepth; ++d) {
                if(d >= depth) {
        #else
            for(int b = 0; b < maxBranches; ++b) {
                if(b >= branches) {
        #endif
                    break;
                }
                else {
            #

            pos = map(pos, iterRay);

            vec2 fromRay = pos-iterRay.point;
            float offset = dot(fromRay, iterRay.direction);

            // foldColor = 1.0-pow(min(abs(offset)/foldSpread, 1.0), 0.5);

            #ifdef debug
                float dist = length(fromRay);

                if(dist <= debugLineLength &&
                   offset > 0.0 &&
                   abs(dot(fromRay, perp(iterRay.direction)))*length(iterRay.direction) < debugLineWidth) {
                    gl_FragColor.rgb = vec3(1, 0, 0);
                    return;
                }
                else if(abs(offset) < debugLineWidth) {
                    gl_FragColor.rgb = vec3(1, 1, 1);
                    return;
                }
            #endif

            #if iteration == depthFirst
                iterRay = nextRay(iterRay, stepSize, depthTransform, float(d));
            #else
                iterRay = initRay(iterRay.point,
                        transform(breadthTransform, iterRay.direction));
            #endif

            #
                }
            }
        #

        #if iteration == depthFirst
            ray = initRay(ray.point,
                    transform(breadthTransform, ray.direction));
        #else
            ray = nextRay(ray, stepSize, depthTransform, float(d));
        #endif

        #
        }
    }
    #

    vec2 transformed = transform(imageTransform, pos*size);

    gl_FragColor.rgb = texture2D(image,
            wrap(transformed, imageSize)).xyz;
}
