hash = require '../factory/hash'

cssColor = (r, g, b, alpha) ->
  'rgba(' + [r, g, b, 1].join(', ') + ')'

hashColor = (string, alpha = 1) ->
  color = hash(string) ^ 0x123456

  r =  color & 0xFF
  g = (color >>> 8) & 0xFF
  b = (color >>> 16) & 0xFF

  max  = Math.max r, g, b
  norm = 140 / max
  min  = Math.round max / 3

  r = Math.min 255, Math.round norm * Math.max r, min
  g = Math.min 255, Math.round norm * Math.max g, min
  b = Math.min 255, Math.round norm * Math.max b, min

  cssColor r, g, b, alpha

escapeText = (string) ->
  string = string ? ""
  string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')

process = (data) ->
  links = []
  el = _markup  data, links
  el.update = () ->
    connect el, links
  el

_order = (data) ->
  nodeMap = {}
  linkMap = {}
  for node in data.nodes
    nodeMap[node.id] = node

  for link in data.links
    linkMap[link.from] ?= []
    linkMap[link.from].push(link);

  recurse = (node, depth = 0) ->
    node.depth = Math.max node.depth ? 0, depth
    if next = linkMap[node.id]
      recurse nodeMap[link.to], depth + 1 for link in next
    null

  for node in data.nodes
    recurse node if !node.depth?

  null

_markup = (data, links) ->
  _order data

  wrapper = document.createElement 'div'
  wrapper.classList.add 'shadergraph-graph'

  columns = []
  outlets = {}

  for node in data.nodes
    block = document.createElement 'div'
    block.classList.add "shadergraph-node"
    block.classList.add "shadergraph-node-#{node.type}"

    block.innerHTML = """
    <div class="shadergraph-header">#{escapeText node.name}</div>
    """

    addOutlet = (outlet, inout) ->
      color = hashColor outlet.type

      div = document.createElement 'div'
      div.classList.add 'shadergraph-outlet'
      div.classList.add "shadergraph-outlet-#{inout}"
      div.innerHTML = """
      <div class="shadergraph-point" style="background: #{color}"></div>
      <div class="shadergraph-type" style="color: #{color}">#{escapeText outlet.type}</div>
      <div class="shadergraph-name">#{escapeText outlet.name}</div>
      """
      block.appendChild div

      outlets[outlet.id] = div.querySelector '.shadergraph-point'

    addOutlet outlet, 'in'  for outlet in node.inputs
    addOutlet outlet, 'out' for outlet in node.outputs

    if node.graph?
      block.appendChild _markup node.graph, links
    else
      clear = document.createElement 'div'
      clear.classList.add 'shadergraph-clear'
      block.appendChild clear

    column = columns[node.depth]
    if !column?
      column = document.createElement 'div'
      column.classList.add 'shadergraph-column'
      columns[node.depth] = column
    column.appendChild block

  wrapper.appendChild column for column in columns when column?

  for link in data.links
    color = hashColor(link.type)

    links.push
      color: color,
      out: outlets[link.out]
      in:  outlets[link.in]

  wrapper

sqr    = (x) -> x * x

path   = (x1, y1, x2, y2) ->
  dx = x2 - x1
  dy = y2 - y1
  d = Math.sqrt sqr(dx) + sqr(dy)

  vert = Math.abs(dy) > Math.abs(dx)
  if vert
    mx = (x1 + x2) / 2
    my = (y1 + y2) / 2

    f = if dy > 0 then .3 else -.3
    h = Math.min Math.abs(dx) / 2, 20 + d / 8

    return [
      'M', x1, y1,
      'C', x1 + h, y1 + ',',
           mx, my - d * f,
           mx, my,
      'C', mx, my + d * f,
           x2 - h, y2 + ',',
           x2, y2,
    ].join ' '
  else
    h = Math.min Math.abs(dx) / 2.5, 20 + d / 4

    return [
      'M', x1, y1,
      'C', x1 + h, y1 + ',',
           x2 - h, y2 + ',',
           x2, y2,
    ].join ' '

makeSVG = (tag = 'svg') ->
  document.createElementNS 'http://www.w3.org/2000/svg', tag

connect = (element, links) ->
  return unless element.parentNode?

  ref = element.getBoundingClientRect()

  for link in links
    a = link.out.getBoundingClientRect()
    b = link.in .getBoundingClientRect()

    link.coords =
      x1: (a.left + a.right)  / 2 - ref.left
      y1: (a.top  + a.bottom) / 2 - ref.top
      x2: (b.left + b.right)  / 2 - ref.left
      y2: (b.top  + b.bottom) / 2 - ref.top

  svg = element.querySelector 'svg'
  element.removeChild svg if svg?

  svg = makeSVG()
  svg.setAttribute('width', element.offsetWidth)
  svg.setAttribute('height', element.offsetHeight)

  for link in links
    c = link.coords

    line = makeSVG 'path'
    line.setAttribute 'd', path c.x1, c.y1, c.x2, c.y2
    line.setAttribute 'stroke',       link.color
    line.setAttribute 'stroke-width', 3
    line.setAttribute 'fill',         'transparent'
    svg.appendChild line

  element.appendChild svg

merge = (markup) ->
  if markup.length != 1
    div = document.createElement 'div'
    div.appendChild el for el in markup
    div.update = () -> el.update() for el in markup
    return div
  else
    return markup[0]

exports.process = process
exports.merge   = merge