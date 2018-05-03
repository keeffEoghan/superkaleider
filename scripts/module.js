// Set up some basic module/namespacing to avoid cluttering window
var module = {
        _: _.noConflict(),
        three: THREE,

        glMatrix: glMatrix,
        mat2: mat2,
        mat2d: mat2d,
        mat3: mat3,
        mat4: mat4,
        quat: quat,
        vec2: vec2,
        vec3: vec3,
        vec4: vec4,

        // Doesn't really do what I want at the moment, maybe later.
        // ShaderGraph: ShaderGraph,
        BezierEasing: BezierEasing,
        dat: dat
    };
