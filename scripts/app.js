(function(module) {
    'use strict';

    var _ = module._,
        three = module.three,
        mat3 = module.mat3,
        dat = module.dat,
        fetch = module.fetch;

    if(!('performance' in window)) {
        window.performance = Date;
    }

    function rotateByVec(out, a, vec2) {
        var a00 = a[0], a01 = a[1], a02 = a[2],
            a10 = a[3], a11 = a[4], a12 = a[5],
            a20 = a[6], a21 = a[7], a22 = a[8],

            s = vec2.y,
            c = vec2.x;

        out[0] = (c*a00)+(s*a10);
        out[1] = (c*a01)+(s*a11);
        out[2] = (c*a02)+(s*a12);

        out[3] = (c*a10)-(s*a00);
        out[4] = (c*a11)-(s*a01);
        out[5] = (c*a12)-(s*a02);

        out[6] = a20;
        out[7] = a21;
        out[8] = a22;

        return out;
    }

    var $log = document.createElement('div');

    document.body.appendChild($log);

    function log(s) {
        var $entry = document.createElement('p');

        $entry.innerHTML = s;
        $log.appendChild($entry);
    }

    function App(imageSource, canvas, shader) {
        /**
         * A URL or falsey - falsey values will result in the retrieval of a
         * random image URL instead.
         * @property {?String} imageSource
         */
        this.imageSource = (imageSource || '');

        /**
         * Derived from `imageSource` - the actual URL of the image.
         * @property {String} imageURL
         */
        this.imageURL = '';

        this.changePattern = true;
        this.translate = true;

        this.trackTransform = {
                image: false,
                pattern: false,
                design: false
            };

        this.dragRef = new three.Vector2();
        this.transformRef = {
                image: new three.Matrix3(),
                pattern: new three.Matrix3(),
                design: new three.Matrix3()
            };

        this.canvas = canvas;

        // Would like to separate the capture and live renderers, but would need
        // to decouple the scene from the info that goes into setting it up, as
        // the scene is coupled to the renderer in three.js.
        // Note that using `preserveDrawingBuffer: true` hits performance, so
        // this is not an ideal approach, aside from the obvious 'flash' that'd
        // result from capturing to an onscreen canvas.
        this.renderer = new three.WebGLRenderer({
                antialias: true,
                precision: 'highp',
                preserveDrawingBuffer: true,
                canvas: this.canvas
            });

        this.scene = new three.Scene();

        this.camera = new three.OrthographicCamera(-1, 1, 1, -1, 1, 1);
        this.camera.position.z = 0.5;
        this.scene.add(this.camera);

        this.shader = shader;

        this.plane = null;
        this.setupPlane();
        this.scene.add(this.plane);

        this.size = {
                live: new three.Vector2(1000, 1000),
                capture: new three.Vector2(2000, 2000)
            };

        this.gui = this.setupGUI();

        var windowResize = function() {
                    this.resize(this.size.live.x || window.innerWidth,
                        this.size.live.y || window.innerHeight);
                }
                .bind(this);

        this.listeners = {
                resize: _.debounce(windowResize, 1000/60),
                key: this.onKey.bind(this),
                onDragStart: this.onDragStart.bind(this),
                onDragMove: this.onDragMove.bind(this),
                onDragEnd: this.onDragEnd.bind(this)
            };

        window.addEventListener('resize', this.listeners.resize);

        window.addEventListener('keydown', this.listeners.key);
        window.addEventListener('keyup', this.listeners.key);

        this.canvas.addEventListener('mousedown',
            this.listeners.onDragStart);

        windowResize();
        this.loadImage(this.imageSource);
        this.loop();
    }

    _.extend(App.prototype, {
        loop: function() {
            this.update();
            this.render();

            requestAnimationFrame(this.loop.bind(this));
        },
        update: function() {
            this.plane.material.uniforms.time.value = Date.now();
        },
        render: function() {
            this.renderer.render(this.scene, this.camera);
        },
        resize: function(width, height) {
            // @todo: all of this resize stuff needs to be based on normalised
            // values, so that the scene scale be changed, rather than the
            // viewport.
            this.renderer.setSize(width, height);

            var uniforms = this.plane.material.uniforms;

            uniforms.resolution.value.set(width, height);

            var aspect = width/height;

            if(aspect < 1) {
                var hW = 0.5*width;

                uniforms.patternPoint.value.set(hW, hW/aspect);
            }
            else {
                var hH = 0.5*height;

                uniforms.patternPoint.value.set(hH*aspect, hH);
            }
        },
        setupPlane: function() {
            var geometry = new three.PlaneBufferGeometry(2, 2),
                material = new three.ShaderMaterial({
                        uniforms: {
                            branches: {
                                type: 'i',
                                value: 4
                            },
                            depth: {
                                type: 'i',
                                value: 6
                            },

                            refraction: {
                                type: 'f',
                                value: 0
                            },

                            imageTransform: {
                                type: 'm3',
                                value: (new three.Matrix3())
                                    .fromArray([0.7, 0, 0,
                                        0, 0.7, 0,
                                        167, 319, 1])
                            },
                            patternTransform: {
                                type: 'm3',
                                value: new three.Matrix3()
                            },
                            designTransform: {
                                type: 'm3',
                                value: (new three.Matrix3())
                                    .fromArray([3, 0, 0,
                                        0, 3, 0,
                                        150, 1152, 1])
                            },

                            patternPoint: {
                                type: 'v2',
                                value: new three.Vector2(500, 500)
                            },
                            patternVector: {
                                type: 'v2',
                                value: new three.Vector2(965, 805)
                            },

                            image: {
                                type: 't',
                                value: null
                            },
                            imageSize: {
                                type: 'v2',
                                value: new three.Vector2()
                            },

                            resolution: {
                                type: 'v2',
                                value: new three.Vector2()
                            },

                            // In ms.
                            time: {
                                type: 'f',
                                value: Date.now()
                            }
                        },
                        defines: {
                            debug: false,
                            maxDepth: 10,
                            maxBranches: 10,
                            initRay: 'initCenterRay',
                            nextRay: 'nextRecursiveRay',
                            map: 'mapKaleidoscope',
                            iteration: 'depthFirst',
                            wrap: 'wrapMirrorRepeat'
                        },
                        vertexShader: this.shader.vertex,
                        fragmentShader: this.shader.fragment
                });

            this.plane = new three.Mesh(geometry, material);

            this.setupImage();
        },
        setupImage: function() {
            var uniforms = this.plane.material.uniforms,
                texture = three.ImageUtils.loadTexture(this.imageURL,
                    undefined, function(texture) {
                        var image = texture.image;

                        uniforms.imageSize.value.set(image.width, image.height);
                    });

            texture.wrapS = texture.wrapT = three.MirroredRepeatWrapping;
            uniforms.image.value = texture;
        },
        setupGUI: function() {
            var gui = new dat.GUI(),
                material = this.plane.material,
                app = this;

            // Namespace to keep all the variables which need a proxy for
            // working in the DAT.GUI style.
            gui.appProxy = {};

            if(!_.isEmpty(material.defines)) {
                var defines = material.defines,
                    definesProxy = gui.appProxy.defines = {
                        options: {
                            iteration: [
                                'breadthFirst',
                                'depthFirst'
                            ],

                            // All these following could be done with a switch
                            // statement in GLSL, allowing them to be changed
                            // via uniforms without a recompile; but the running
                            // shader would be slower.
                            initRay: [
                                'initCenterRay',
                                'initCenterPerpRay',
                                'initOffsetRay',
                                'initOffsetPerpRay',
                                // 'initOrbitRay',
                                // 'initOrbitPerpRay'
                            ],
                            nextRay: [
                                'nextConstantRay',
                                'nextConstantPerpRay',
                                'nextRecursiveRay'
                            ],
                            map: [
                                'mapKaleidoscope',
                                'mapRefract',
                                'mapMulti'
                            ],
                            wrap: [
                                'wrapRepeat',
                                'wrapMirrorRepeat'
                            ]
                        },
                        undef: {
                            debug: 'debug' in defines
                        },
                        recompile: function() {
                            material.needsUpdate = true;
                        },

                        log: function() {
                            log(['Defines:'].concat(_.map(defines,
                                    function(d, n) {
                                        return n+': '+d;
                                    }))
                                .join('<br/>&nbsp; &nbsp; &nbsp; &nbsp;'));
                        },

                        folder: gui.addFolder('Constants')
                    },
                    definesGUI = definesProxy.folder;

                _(['maxBranches', 'maxDepth']).each(function(k) {
                        definesGUI.add(defines, k, 0, 50).step(1);
                    });

                _(definesProxy.options).each(function(v, k) {
                        definesGUI.add(defines, k, v);
                    });

                _(definesProxy.undef).each(function(v, k) {
                        definesGUI.add(definesProxy.undef, k)
                            .onChange(function(v) {
                                if(v) {
                                    defines[k] = true;
                                }
                                else {
                                    delete defines[k];
                                }
                            });
                    });

                definesGUI.add(definesProxy, 'recompile');

                definesGUI.add(definesProxy, 'log');

                definesGUI.close();
            }

            if(!_.isEmpty(material.uniforms)) {
                var uniforms = material.uniforms,
                    uniformsProxy = {
                        iteration: {
                            branches: uniforms.branches.value,
                            depth: uniforms.depth.value
                        },

                        refraction: 0,

                        transform: {
                            transformImage: this.trackTransform.image,
                            transformPattern: this.trackTransform.pattern,
                            transformDesign: this.trackTransform.design
                        },

                        log: function() {
                            log(['Uniforms:'].concat(_.map(uniforms,
                                    function(u, n) {
                                        return n+': '+
                                            ((u.value.toArray)? u.value.toArray()
                                            : ((u.value.toString)? u.value.toString()
                                            :   u.value));
                                    }))
                                .join('<br/>&nbsp; &nbsp; &nbsp; &nbsp;'));
                        },

                        folder: gui.addFolder('Variables')
                    },
                    uniformsGUI = uniformsProxy.folder;

                _(uniformsProxy.iteration).each(function(v, k, proxy) {
                        uniformsGUI.add(proxy, k, 0, 50).step(1)
                            .onChange(function(v) {
                                uniforms[k].value = v;
                            });
                    });

                uniformsGUI.add(this, 'changePattern');

                _(uniformsProxy.transform).each(function(v, k, proxy) {
                        var name = k.replace('transform', '').toLowerCase();

                        uniformsGUI.add(proxy, k).onChange(function(v) {
                                app.trackTransform[name] = v;
                            });
                    });

                uniformsGUI.add(this, 'imageSource').onFinishChange(function(v) {
                        app.loadImage();
                    });

                uniformsGUI.add(uniformsProxy, 'log');

                uniformsGUI.close();
            }

            var sizesFolder = gui.addFolder('Size');

            sizesFolder.appProxy = {};

            _(this.size).each(function(size, s) {
                    var sizeFolder = sizesFolder.addFolder(s);

                    sizesFolder.appProxy[s] = {
                            x: sizeFolder.add(size, 'x', 0, 3000).step(1),
                            y: sizeFolder.add(size, 'y', 0, 3000).step(1)
                        };

                    sizeFolder.close();
                });

            var updateLiveSize = function() {
                    app.resize(app.size.live.x || window.innerWidth,
                        app.size.live.y || window.innerHeight);
                };

            sizesFolder.appProxy.live.x.onChange(updateLiveSize);
            sizesFolder.appProxy.live.y.onChange(updateLiveSize);

            sizesFolder.close();


            var captureProxy = gui.appProxy.capture = {
                    blob: function() {
                            this.exportImage(this.size.capture.x || window.innerWidth,
                                this.size.capture.y || window.innerHeight,
                                'blob');
                        }
                        .bind(this),
                    dataURL: function() {
                            this.exportImage(this.size.capture.x || window.innerWidth,
                                this.size.capture.y || window.innerHeight,
                                'dataURL');
                        }
                        .bind(this),

                    blobImg: function() {
                            this.exportImage(this.size.capture.x || window.innerWidth,
                                this.size.capture.y || window.innerHeight,
                                'blobImg');
                        }
                        .bind(this),
                    dataURLImg: function() {
                            this.exportImage(this.size.capture.x || window.innerWidth,
                                this.size.capture.y || window.innerHeight,
                                'dataURLImg');
                        }
                        .bind(this)
                },
                captureFolder = gui.addFolder('Capture');

            _(captureProxy).each(function(func, name) {
                    captureFolder.add(captureProxy, name);
                });

            captureFolder.close();

            gui.open();
        },
        loadImage: function() {
            var imageLoad = ((this.imageSource)?
                    Promise.resolve(this.imageSource)
                :   fetch('http://phptest.rehabstudio.com/mika/1.php')
                        .then((function(response, url) {
                                var data = JSON.parse(response);

                                return url+'?url='+_.sample(data.images);
                            }),
                            function(request) {
                                if(request) {
                                    alert('Something went wrong with the '+
                                        'request for an image: '+
                                        request.status);
                                }
                                else {
                                    alert('Couldn\'t make an AJAX request');
                                }
                            }));

            return imageLoad.then(function(imageURL) {
                            this.imageURL = imageURL;
                            this.setupImage();
                        }
                        .bind(this));
        },

        onDragStart: function(e) {
            // this.updateDragRef(e.clientX/this.canvas.width,
            //     (this.canvas.height-e.clientY)/this.canvas.height);
            this.updateDragRef(e.clientX, (this.canvas.height-e.clientY));

            this.canvas.addEventListener('mousemove',
                this.listeners.onDragMove);
            this.canvas.addEventListener('mouseup',
                this.listeners.onDragEnd);

            e.preventDefault();
        },
        onDragMove: function(e) {
            this.updateDrag(e.clientX, (this.canvas.height-e.clientY));

            e.preventDefault();
        },
        onDragEnd: function(e) {
            this.updateTransformRefs();

            this.canvas.removeEventListener('mousemove',
                this.listeners.onDragMove);
            this.canvas.removeEventListener('mouseup',
                this.listeners.onDragEnd);

            e.preventDefault();
        },

        onKey: function(e) {
            this.translate = !e.shiftKey;
        },

        updateDragRef: function(x, y) {
            this.dragRef.set(x, y);
        },
        updateTransformRefs: function() {
            var uniforms = this.plane.material.uniforms;

            _(this.trackTransform).each(function(track, name) {
                    if(track) {
                        this.transformRef[name]
                            .copy(uniforms[name+'Transform'].value);
                    }
                }
                .bind(this));
        },
        updateDrag: function(x, y) {
            var vec = new three.Vector2(x, y),
                uniforms = this.plane.material.uniforms;

            if(this.changePattern) {
                uniforms.patternVector.value.copy(vec);
            }

            var toTransform = _.pick(this.trackTransform, function(track) {
                    return track;
                });

            if(!_.isEmpty(toTransform)) {
                if(this.translate) {
                    var translate = this.dragRef.clone().sub(vec).toArray();

                    _(toTransform).each(function(track, name) {
                            var transform = uniforms[name+'Transform'].value;

                            mat3.translate(transform.elements,
                                this.transformRef[name].toArray(),
                                translate);
                        }
                        .bind(this));
                }
                else {
                    var center = uniforms.patternPoint.value,

                        centerRef = center.clone().sub(this.dragRef),
                        lCenterRef = centerRef.length(),

                        rel = center.clone().sub(vec),
                        lRel = rel.length();

                    if(lCenterRef && lRel) {
                            // Nope, need to subtract (negate) the centerRef
                            // rotationfor the rel rotation to get the rotVec;
                            // with matrix transformation
                        var rotVec = centerRef.clone().sub(rel).normalize(),

                            scale = lRel/lCenterRef,
                            scaleVec = [scale, scale];

                        _(toTransform).each(function(track, name) {
                                var transform = uniforms[name+'Transform'].value,
                                    transformRef = this.transformRef[name]
                                        .toArray(),

                                // rotated = rotateByVec(transform.elements,
                                //             transformRef, rotVec);
                                rotated = transformRef;

                                mat3.scale(transform.elements, rotated,
                                    scaleVec);
                            }
                            .bind(this));
                    }
                }
            }
        },

        exportImage: function(width, height, type) {
            var t0 = performance.now();

            // @see the todo comment in `resize`
            // this.resize(width, height);
            this.renderer.setSize(width, height);
            this.renderer.render(this.scene, this.camera);

            switch(type) {
                case 'blob':
                    this.renderer.domElement.toBlob(function(blob) {
                            var url = URL.createObjectURL(blob),
                                win = window.open(url);

                            win.onload = function() {
                                    win.focus();
                                    URL.revokeObjectURL(url);

                                    log(type+': load took '+
                                        (performance.now()-t0)+'ms');
                                };

                            // Send it wherever...
                            var formData = new FormData();

                            formData.append('image', blob);

                            // var request = new XMLHttpRequest();
                            // request.open("POST", "http://some.where.else");
                            // request.send(formData);
                        },
                        'image/jpeg', 1);
                break;
                case 'dataURL':
                    (function() {
                        var url = this.renderer.domElement.toDataURL('image/jpeg',
                                1),
                            win = window.open(url);

                        win.onload = function() {
                                win.focus();

                                log(type+': load took '+
                                    (performance.now()-t0)+'ms');
                            };

                        // Send it wherever...

                        // var request = new XMLHttpRequest();
                        // request.open("POST", "http://some.where.else");
                        // request.send(url);
                    }
                    .bind(this))();
                break;
                case 'blobImg':
                    this.renderer.domElement.toBlob(function(blob) {
                            var url = URL.createObjectURL(blob),
                                img = document.createElement('img');

                            img.onload = function() {
                                    img.scrollIntoView(true);
                                    URL.revokeObjectURL(url);

                                    log(type+': load took '+
                                        (performance.now()-t0)+'ms');
                                };

                            img.src = url;
                            img.style.border = '20px solid rgba(0, 0, 255, 0.2)';
                            img.style.maxWidth = '100%';
                            document.body.appendChild(img);

                            // Send it wherever...
                            var formData = new FormData();

                            formData.append('image', blob);

                            // var request = new XMLHttpRequest();
                            // request.open("POST", "http://some.where.else");
                            // request.send(formData);
                        },
                        'image/jpeg', 1);
                break;
                case 'dataURLImg':
                    (function() {
                        var url = this.renderer.domElement.toDataURL('image/jpeg',
                                1),
                            img = document.createElement('img');

                        img.onload = function() {
                                img.scrollIntoView(true);

                                log(type+': load took '+
                                    (performance.now()-t0)+'ms');
                            };

                        img.src = url;
                        img.style.border = '20px solid rgba(0, 0, 255, 0.2)';
                        img.style.maxWidth = '100%';
                        document.body.appendChild(img);

                        // Send it wherever...

                        // var request = new XMLHttpRequest();
                        // request.open("POST", "http://some.where.else");
                        // request.send(url);
                    }
                    .bind(this))();
                break;
            }

            // Clean up for our continuing live renders
            this.resize(this.size.live.x || window.innerWidth,
                this.size.live.y || window.innerHeight);

            this.render();

            log(type+': capture took '+(performance.now()-t0)+'ms');
        }
    });

    module.App = App;
})(module);
