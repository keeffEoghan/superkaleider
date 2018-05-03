(function(module, shader) {
    'use strict';

    
    // Shaders inlined instead below, for the purposes of hosting on Drive (XHR issues).
    /*var _ = module._,
        App = module.App,
        fetch = module.fetch,

        shaders = [
            'main.vert',
            'main.frag'
        ],
        snippets = [
            'constants',
            'random',
            'noise',
            'trigonometry',
            'matrix-transform',
            'ray',
            'wrap'
        ];

    Promise.all(_.map(shaders.concat(snippets), function(shader) {
            return fetch('./shaders/'+shader+'.glsl');
        }))
        .then(function(responses) {
                function extract(shader) {
                    var shaderDeps = [];

                    shader.replace(/\@requires\s*([^\s\*\@\,]*)/gi,
                        function(all, require) {
                            if(!_.contains(shaderDeps, require)) {
                                shaderDeps.push(require);
                            }
                        });

                    return shaderDeps;
                }

                function insert(sorted, shaderKey, shaderDeps) {
                    // Check if any of the shader deps are already
                    // included; if they are, we want to insert the
                    // shader before that point.
                    // If that point is before another shader/partial
                    // that depends on this shader, then we have a
                    // circular dependency (this could be even more
                    // complex).
                    var i = ((sorted.length > 0)?
                            _.findLastIndex(sorted,
                                function(require) {
                                    return _.contains(shaderDeps, require);
                                })
                        :   0);

                    return i;
                }

                // Resolve all the dependencies in the shaders, starting at the
                // `main` shaders, and sorting any `@require`d files to be
                // prepended to the files that depend on them.
                var mains = _.zipObject(shaders, responses.slice(0, 2)),
                    deps = _.zipObject(snippets, responses.slice(2)),
                    lib = _.extend({}, mains, deps);

                return _.map(mains, function(main, m) {
                        var included = [m];

                        for(var r = 0; r < included.length; ++r) {
                            var key = included[r],
                                shaderDeps = extract(lib[key]),
                                i = insert(included, key, shaderDeps);

                            // Move the shader before any of its existing deps.
                            if(i >= 0 && i < r) {
                                included.splice(i, 0, included.splice(r, 1)[0]);
                            }

                            // Don't duplicate any existing deps.
                            _.pull.apply(shaderDeps,
                                [shaderDeps].concat(included));

                            included.push.apply(included, shaderDeps);
                        }

                        return _.at(lib, included.reverse())
                                .join('\n\n\n\n//========================\n\n');
                    });
            },
            function(rejection) {
                alert('Couldn\'t load the shaders, because... '+rejection);
            })
        .then(function(shader) {
            var imageURL;

            document.location.search.replace(/(?:image=)([^\&]*)/gi,
                function(all, value) {
                    imageURL = value;
                });

            module.app = new App(imageURL,
                    document.getElementById('viewport'),
                    {
                        vertex: shader[0],
                        fragment: shader[1]
                    });
        });*/
        
    var _ = module._,
        App = module.App,
        imageURL = './images/Avencuni.jpg';

    document.location.search.replace(/(?:image=)([^\&]*)/gi,
        function(all, value) {
            imageURL = value;
        });

    module.app = new App(imageURL, document.getElementById('viewport'), {
                vertex: shader[0],
                fragment: shader[1]
            });
})(module,
    // Shaders inlined here, for the purposes of hosting on Drive (XHR issues).
    [
        // Vertex
        "/**\n"+
        " * Just render flat to the viewport.\n"+
        " */\n"+
        "\n"+
        "// Provided by three.js - [see](http://threejs.org/docs/#Reference/Renderers.WebGL/WebGLProgram)\n"+
        "\n"+
        "// // Default vertex attributes provided by Geometry and BufferGeometry\n"+
        "// attribute vec3 position;\n"+
        "// attribute vec2 uv;\n"+
        "\n"+
        "// varying vec2 vUV;\n"+
        "\n"+
        "void main() {\n"+
        "    gl_Position = vec4(position, 1.0);\n"+
        "    // vUV = uv;\n"+
        "}\n"+
        "",
                
        // Fragment
        "/**\n"+
        " * Some trigonometry utilities.\n"+
        " */\n"+
        "\n"+
        "/** @public */\n"+
        "float length2(vec2 v) {\n"+
        "    return dot(v, v);\n"+
        "}\n"+
        "\n"+
        "/** @public */\n"+
        "float distance2(vec2 a, vec2 b) {\n"+
        "    return length2(a-b);\n"+
        "}\n"+
        "\n"+
        "/** @public */\n"+
        "vec2 perp(vec2 v) {\n"+
        "    return vec2(v.y, -v.x);\n"+
        "}\n"+
        "\n"+
        "\n"+
        "\n"+
        "\n"+
        "//========================\n"+
        "\n"+
        "/**\n"+
        " * Some matrix transformation utilities.\n"+
        " */\n"+
        "\n"+
        "/**\n"+
        " * @requires trigonometry\n"+
        " */\n"+
        "\n"+
        "float length2(vec2);\n"+
        "\n"+
        "\n"+
        "/** @public */\n"+
        "const mat2 identity2 = mat2(1.0);\n"+
        "/** @public */\n"+
        "const mat3 identity3 = mat3(1.0);\n"+
        "/** @public */\n"+
        "const mat4 identity4 = mat4(1.0);\n"+
        "\n"+
        "// For just a rotation, a `mat2` is all we need; this can be easily consumed by\n"+
        "// the corresponding `mat3` transformation by doing:\n"+
        "//      `mat3Transform = mat3(mat2Transform);`\n"+
        "// `mat3Transform` will be equal to:\n"+
        "//      `mat3(mat2[0][0], mat2[0][1], 0.0,\n"+
        "//          mat2[1][0], mat2[1][1], 0.0,\n"+
        "//          0.0, 0.0, 1.0)`\n"+
        "\n"+
        "/** @public */\n"+
        "mat3 rotation(vec2 vec) {\n"+
        "    if(length2(vec) != 1.0) {\n"+
        "        vec = normalize(vec);\n"+
        "    }\n"+
        "\n"+
        "    return mat3(mat2(vec.x, -vec.y,\n"+
        "               vec.y, vec.x));\n"+
        "}\n"+
        "\n"+
        "/** @public */\n"+
        "mat3 rotation(float angle) {\n"+
        "    float c = cos(angle),\n"+
        "        s = sin(angle);\n"+
        "\n"+
        "    return mat3(mat2(c, -s,\n"+
        "            s, c));\n"+
        "}\n"+
        "\n"+
        "/** @public */\n"+
        "mat3 translation(vec2 translate) {\n"+
        "    return mat3(1.0, 0.0, 0.0,\n"+
        "            0.0, 1.0, 0.0,\n"+
        "            translate, 1.0);\n"+
        "}\n"+
        "\n"+
        "/** @public */\n"+
        "vec2 transform(mat3 transformation, vec2 vec) {\n"+
        "    return (transformation*vec3(vec, 1.0)).xy;\n"+
        "}\n"+
        "\n"+
        "\n"+
        "\n"+
        "\n"+
        "//========================\n"+
        "\n"+
        "/**\n"+
        " * Ray definition.\n"+
        " */\n"+
        "\n"+
        "// Libs.\n"+
        "/** @requires matrix-transform */\n"+
        "vec2 transform(mat3, vec2);\n"+
        "\n"+
        "\n"+
        "/** @public */\n"+
        "struct Ray {\n"+
        "    vec2 point;\n"+
        "    vec2 direction;\n"+
        "};\n"+
        "\n"+
        "/** @public */\n"+
        "Ray transformRay(mat3 transformation, Ray ray) {\n"+
        "    return Ray(transform(transformation, ray.point),\n"+
        "        // Transforming about the point `-ray.point`; [see](http://www.iquilezles.org/www/articles/noacos/noacos.htm)\n"+
        "        // for possibly a better way to do this.\n"+
        "        normalize(transform(transformation, ray.point+ray.direction)-\n"+
        "                ray.point));\n"+
        "}\n"+
        "\n"+
        "\n"+
        "\n"+
        "\n"+
        "//========================\n"+
        "\n"+
        "/**\n"+
        " * Wrapping values to bounds - useful for textures etc.\n"+
        " */\n"+
        "\n"+
        "vec2 wrapRepeat(vec2 pos, vec2 size) {\n"+
        "    return mod(pos, size)/size;\n"+
        "}\n"+
        "\n"+
        "vec2 wrapMirrorRepeat(vec2 pos, vec2 size) {\n"+
        "    vec2 even = mod(floor(pos/size), 2.0),\n"+
        "        mirror = mix(vec2(1.0), vec2(-1.0), even);\n"+
        "\n"+
        "    return wrapRepeat(pos*mirror, size);\n"+
        "}\n"+
        "\n"+
        "\n"+
        "\n"+
        "\n"+
        "//========================\n"+
        "\n"+
        "/**\n"+
        " * Some general constants.\n"+
        " */\n"+
        "\n"+
        "/** @public */\n"+
        "const float pi = 3.14159265358979323846;\n"+
        "\n"+
        "/** @public */\n"+
        "const float tau = 6.28318530717958647692;\n"+
        "\n"+
        "\n"+
        "\n"+
        "\n"+
        "//========================\n"+
        "\n"+
        "/**\n"+
        " * Using rays to perform reflections, transform the fragment around a fractal\n"+
        " * kaleidoscope.\n"+
        " */\n"+
        "\n"+
        "\n"+
        "// Compile-time inputs.\n"+
        "\n"+
        "/** @todo Somehow select these via uniforms, without needing to recompile? */\n"+
        "#define depthFirst 0\n"+
        "#define breadthFirst 1\n"+
        "\n"+
        "// Inserted in the shader construction.\n"+
        "\n"+
        "// #define maxBranches 6\n"+
        "// #define maxDepth 25\n"+
        "// #define initRay initCenterRay\n"+
        "// #define nextRay nextRecursiveRay\n"+
        "// #define map mapKaleidoscope\n"+
        "// #define iteration depthFirst\n"+
        "// #define wrap wrapMirrorRepeat\n"+
        "\n"+
        "\n"+
        "// Run-time inputs.\n"+
        "\n"+
        "uniform int branches;\n"+
        "uniform int depth;\n"+
        "\n"+
        "uniform float refraction;\n"+
        "\n"+
        "uniform mat3 imageTransform;\n"+
        "uniform mat3 patternTransform;\n"+
        "uniform mat3 designTransform;\n"+
        "\n"+
        "uniform vec2 patternPoint;\n"+
        "uniform vec2 patternVector;\n"+
        "\n"+
        "uniform sampler2D image;\n"+
        "uniform vec2 imageSize;\n"+
        "\n"+
        "uniform vec2 resolution;\n"+
        "\n"+
        "// In ms.\n"+
        "uniform float time;\n"+
        "\n"+
        "// varying vec2 vUV;\n"+
        "\n"+
        "\n"+
        "// #define debug\n"+
        "\n"+
        "#ifdef debug\n"+
        "    #define debugCircleSize 0.003\n"+
        "    #define debugLineWidth 0.001\n"+
        "    #define debugLineLength 0.15\n"+
        "#endif\n"+
        "\n"+
        "\n"+
        "// Libs.\n"+
        "\n"+
        "/**\n"+
        " * @requires constants\n"+
        " * @requires wrap\n"+
        " * @requires matrix-transform\n"+
        " * @requires trigonometry\n"+
        " * @requires ray\n"+
        " * @-requires noise\n"+
        " */\n"+
        "\n"+
        "/**\n"+
        " * Ray init.\n"+
        " */\n"+
        "\n"+
        "Ray initCenterRay(vec2 pos, vec2 vec) {\n"+
        "    return Ray(pos, normalize(vec-pos));\n"+
        "}\n"+
        "\n"+
        "Ray initCenterPerpRay(vec2 pos, vec2 vec) {\n"+
        "    return Ray(pos, perp(normalize(vec-pos)));\n"+
        "}\n"+
        "\n"+
        "Ray initOffsetRay(vec2 pos, vec2 vec) {\n"+
        "    return Ray(vec, normalize(vec-pos));\n"+
        "}\n"+
        "\n"+
        "Ray initOffsetPerpRay(vec2 pos, vec2 vec) {\n"+
        "    return Ray(vec, perp(normalize(vec-pos)));\n"+
        "}\n"+
        "\n"+
        "/*Ray initOrbitRay(vec2 pos, vec2 vec) {\n"+
        "    vec2 toVec = vec-pos,\n"+
        "        vecOrbit = normalize(toVec)*orbit,\n"+
        "        //orbitOffset = ((length2(vecOrbit) > length2(toVec))? vecOrbit : toVec);\n"+
        "        orbitOffset = mix(vecOrbit, toVec,\n"+
        "            step(length2(vecOrbit), length2(toVec)));\n"+
        "\n"+
        "    return Ray(pos+orbitOffset, normalize(vec));\n"+
        "}\n"+
        "\n"+
        "Ray initOrbitPerpRay(vec2 pos, vec2 vec) {\n"+
        "    vec2 toVec = vec-pos,\n"+
        "        vecOrbit = normalize(toVec)*orbit,\n"+
        "        //orbitOffset = ((length2(vecOrbit) > length2(toVec))? vecOrbit : toVec);\n"+
        "        orbitOffset = mix(vecOrbit, toVec,\n"+
        "            step(length2(vecOrbit), length2(toVec)));\n"+
        "\n"+
        "    return Ray(pos+orbitOffset, normalize(perp(vec)));\n"+
        "}*/\n"+
        "\n"+
        "\n"+
        "/**\n"+
        " * Ray iteration.\n"+
        " */\n"+
        "\n"+
        "// Travel along the ray and rotate by the same direction.\n"+
        "Ray nextConstantRay(Ray ray, float size, mat3 transformation, float i) {\n"+
        "    return Ray(ray.point+(ray.direction*size),\n"+
        "               normalize(transform(transformation, ray.direction)));\n"+
        "}\n"+
        "\n"+
        "Ray nextConstantPerpRay(Ray ray, float size, mat3 transformation, float i) {\n"+
        "    return Ray(ray.point+perp(ray.direction*size),\n"+
        "               normalize(transform(transformation, ray.direction)));\n"+
        "}\n"+
        "\n"+
        "Ray nextRecursiveRay(Ray ray, float size, mat3 transformation, float i) {\n"+
        "    size = pow(size, i);\n"+
        "\n"+
        "    return Ray(ray.point+(ray.direction*size),\n"+
        "               normalize(transform(transformation, ray.direction)));\n"+
        "}\n"+
        "\n"+
        "\n"+
        "/**\n"+
        " * Map position through pattern rays.\n"+
        " */\n"+
        "\n"+
        "vec2 mapKaleidoscope(vec2 pos, Ray ray) {\n"+
        "    vec2 fromRay = pos-ray.point;\n"+
        "\n"+
        "    float offset = dot(fromRay, ray.direction);\n"+
        "\n"+
        "    if(offset < 0.0) {\n"+
        "        pos -= 2.0*offset*ray.direction;\n"+
        "    }\n"+
        "\n"+
        "    return pos;\n"+
        "}\n"+
        "\n"+
        "vec2 mapRefract(vec2 pos, Ray ray) {\n"+
        "    vec2 fromRay = pos-ray.point;\n"+
        "\n"+
        "    float offset = dot(fromRay, ray.direction);\n"+
        "\n"+
        "    if(offset < 0.0) {\n"+
        "        pos -= refract(fromRay, ray.direction, refraction);\n"+
        "    }\n"+
        "\n"+
        "    return pos;\n"+
        "}\n"+
        "\n"+
        "vec2 mapMulti(vec2 pos, Ray ray) {\n"+
        "    vec2 fromRay = pos-ray.point;\n"+
        "\n"+
        "    float offset = dot(fromRay, ray.direction);\n"+
        "\n"+
        "    if(offset < 0.0) {\n"+
        "        pos += refract(fromRay, ray.direction, refraction)-\n"+
        "                2.0*offset*ray.direction;\n"+
        "    }\n"+
        "\n"+
        "    return pos;\n"+
        "}\n"+
        "\n"+
        "void main() {\n"+
        "    float size = min(resolution.x, resolution.y),\n"+
        "        invSize = 1.0/size;\n"+
        "\n"+
        "    vec2 basePoint = patternPoint*invSize,\n"+
        "        baseVector = patternVector*invSize,\n"+
        "        pos = transform(designTransform, gl_FragCoord.xy)*invSize;\n"+
        "\n"+
        "    #ifdef debug\n"+
        "        if(distance(pos, basePoint) < debugCircleSize) {\n"+
        "            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);\n"+
        "            return;\n"+
        "        }\n"+
        "        if(distance(pos, baseVector) < debugCircleSize) {\n"+
        "            gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\n"+
        "            return;\n"+
        "        }\n"+
        "    #endif\n"+
        "\n"+
        "    // Transform the pattern by transforming the base ray.\n"+
        "    Ray ray = transformRay(patternTransform, initRay(basePoint, baseVector));\n"+
        "\n"+
        "    float stepSize = length2(baseVector),\n"+
        "        breadth = min(float(branches), float(maxBranches));\n"+
        "\n"+
        "    // float foldColor = 0.0,\n"+
        "    //     foldSpread = 0.001;\n"+
        "\n"+
        "    mat3 depthTransform = rotation(ray.direction),\n"+
        "        // Offset the starting angle/position by 360/breadth.\n"+
        "        breadthTransform = rotation(tau/breadth);\n"+
        "\n"+
        "\n"+
        "    // This looks messy as hell, but lets us easily switch between depth- and\n"+
        "    // breadth-first iteration. The single `#` on a line indicate we're breaking\n"+
        "    // from our usual indentation (this is because the nested for loops with\n"+
        "    // an if/else inside them greatly increase indentation just to allow dynamic\n"+
        "    // looping).\n"+
        "    #\n"+
        "    #if iteration == depthFirst\n"+
        "        for(int b = 0; b < maxBranches; ++b) {\n"+
        "            if(b >= branches) {\n"+
        "    #else\n"+
        "        for(int d = 0; d < maxDepth; ++d) {\n"+
        "            if(d >= depth) {\n"+
        "    #endif\n"+
        "                break;\n"+
        "            }\n"+
        "            else {\n"+
        "        #\n"+
        "\n"+
        "        Ray iterRay = Ray(ray.point, ray.direction);\n"+
        "\n"+
        "        #\n"+
        "        #if iteration == depthFirst\n"+
        "            for(int d = 0; d < maxDepth; ++d) {\n"+
        "                if(d >= depth) {\n"+
        "        #else\n"+
        "            for(int b = 0; b < maxBranches; ++b) {\n"+
        "                if(b >= branches) {\n"+
        "        #endif\n"+
        "                    break;\n"+
        "                }\n"+
        "                else {\n"+
        "            #\n"+
        "\n"+
        "            pos = map(pos, iterRay);\n"+
        "\n"+
        "            vec2 fromRay = pos-iterRay.point;\n"+
        "            float offset = dot(fromRay, iterRay.direction);\n"+
        "\n"+
        "            // foldColor = 1.0-pow(min(abs(offset)/foldSpread, 1.0), 0.5);\n"+
        "\n"+
        "            #ifdef debug\n"+
        "                float dist = length(fromRay);\n"+
        "\n"+
        "                if(dist <= debugLineLength &&\n"+
        "                   offset > 0.0 &&\n"+
        "                   abs(dot(fromRay, perp(iterRay.direction)))*length(iterRay.direction) < debugLineWidth) {\n"+
        "                    gl_FragColor.rgb = vec3(1, 0, 0);\n"+
        "                    return;\n"+
        "                }\n"+
        "                else if(abs(offset) < debugLineWidth) {\n"+
        "                    gl_FragColor.rgb = vec3(1, 1, 1);\n"+
        "                    return;\n"+
        "                }\n"+
        "            #endif\n"+
        "\n"+
        "            #if iteration == depthFirst\n"+
        "                iterRay = nextRay(iterRay, stepSize, depthTransform, float(d));\n"+
        "            #else\n"+
        "                iterRay = initRay(iterRay.point,\n"+
        "                        transform(breadthTransform, iterRay.direction));\n"+
        "            #endif\n"+
        "\n"+
        "            #\n"+
        "                }\n"+
        "            }\n"+
        "        #\n"+
        "\n"+
        "        #if iteration == depthFirst\n"+
        "            ray = initRay(ray.point,\n"+
        "                    transform(breadthTransform, ray.direction));\n"+
        "        #else\n"+
        "            ray = nextRay(ray, stepSize, depthTransform, float(d));\n"+
        "        #endif\n"+
        "\n"+
        "        #\n"+
        "        }\n"+
        "    }\n"+
        "    #\n"+
        "\n"+
        "    vec2 transformed = transform(imageTransform, pos*size);\n"+
        "\n"+
        "    gl_FragColor.rgb = texture2D(image,\n"+
        "            wrap(transformed, imageSize)).xyz;\n"+
        "}"
    ]);
