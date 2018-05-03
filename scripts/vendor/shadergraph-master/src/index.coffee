Block     = require './block'
Factory   = require './factory'
GLSL      = require './glsl'
Graph     = require './graph'
Linker    = require './linker'
Visualize = require './visualize'

library   = Factory.library
cache     = Factory.cache
visualize = Visualize.visualize

Snippet   = Linker.Snippet

merge = (a, b = {}) ->
  out = {}
  out[key] = b[key] ? a[key] for key, value of a
  out

class ShaderGraph
  constructor: (snippets, config) ->
    return new ShaderGraph snippets, config if @ !instanceof ShaderGraph

    defaults =
      globalUniforms:   false
      globalVaryings:   true
      globalAttributes: true
      globals:          []

    @config = merge defaults, config
    @fetch  = cache library GLSL, snippets, Snippet.load

  shader: (config = {}) ->
    _config = merge @config, config
    new Factory.Factory GLSL, @fetch, _config

  material: (config) ->
    new Factory.Material @shader(config), @shader(config)

  visualize: (shader) -> ShaderGraph.visualize shader

  # Expose class hierarchy
  @Block:     Block
  @Factory:   Factory
  @GLSL:      GLSL
  @Graph:     Graph
  @Linker:    Linker
  @Visualize: Visualize

  # Static visualization method
  @visualize = (shader) ->
    if shader instanceof Factory.Material
      visualize shader.vertex, shader.fragment
    else
      visualize shader

module.exports = ShaderGraph
window.ShaderGraph = ShaderGraph if typeof window != 'undefined'
