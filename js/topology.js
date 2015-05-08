// Copyright 2014 Rackspace
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

HotUI.TopologyNode = {};

HotUI.TopologyNode.factory = function (resource, resumeFunc, props) {
    var self = this,
        type = resource.getType().toLowerCase(),
        types = {
            autoscale: this.AutoScale,
            loadbalancer: this.LoadBalancer,
            volume: this.Database,
            container: this.Database,
            trove: this.Database,
            key: this.Key,
            dns: this.DNS,
            network: this.Network,
            server: this.Server,
            'ec2::instance': this.Server
        };

    function getInstance(patterns, index) {
        if (index === patterns.length) {
            return self.Helper.create(resource, resumeFunc, props);
        } else if (type.indexOf(patterns[index]) > -1) {
            return types[patterns[index]].create(resource, resumeFunc, props);
        } else {
            return getInstance(patterns, index + 1);
        }
    }

    return getInstance(Object.keys(types), 0);
};

HotUI.TopologyNode.Base = BaseObject.extend({
    create: function (resource, resumeFunc, properties) {
        var self;

        if (!properties) {
            properties = {};
        }

        properties._resumeFunc = resumeFunc;
        properties.resource = resource;
        properties.svg = {};

        self = this.extend(properties);
        Barricade.Observable.call(self);
        return self;
    },
    _iconBaseURL: '/static/hotui/img/',
    h: 110,
    w: 80,
    padding: 10,
    focus: {x: 0, y: 0},
    focusForce: {x: 0.5, y: 0.5},
    getIconURL: function () {
        return this._iconBaseURL + this.iconFile;
    },
    canConnectTo: function (d) {
        return this.resource.canConnectTo(d.resource);
    },
    containsPoint: function (p) {
        return Math.abs(p.x - this.x) < this.w / 2 &&
               Math.abs(p.y - this.y) < this.h / 2;
    },
    setNameOnElement: function ($el) {
        var name = this.resource.getID(),
            i = Math.floor(name.length / 2);

        $el.textContent = name;

        while ($el.getComputedTextLength() > this.w - 5) {
            $el.textContent = name.slice(0, i) + '...' + name.slice(-i);
            i--;
        }
    },
    setFixed: function (isFixed) {
        this.fixed = this._fixed = isFixed;
        this.svg.node.classed('hb_fixed', this.fixed);
        if(!isFixed) {
            this._resumeFunc();
        }
    },
    iconFile: 'icon-orchestration.svg',
    setNode: function ($g) {
        this.svg.node = $g;
        this.decorateNode();
    },
    decorateNode: function () {
        var self = this,
            resImgPad = 15,
            resImgWidth = self.w - resImgPad * 2,
            $g = this.svg.node,
            $label,
            $textContainer,
            $buttonContainer,
            $linkButton,
            $linkCreatorLine,
            dragLinkCreator;

        dragLinkCreator = d3.behavior.drag()
            .on('dragstart', function () {
                $g.classed('hb_linking', true);
                d3.event.sourceEvent.stopPropagation();
                self.emit('linkCreateDragStart', self);
            })
            .on('drag', function (d) {
                var pos = d3.mouse($linkButton[0][0]),
                    gPos = d3.mouse($g[0][0]);
                $linkCreatorLine.attr({x2: pos[0], y2: pos[1]});
                self.emit('linkCreateDrag', {
                    x: d.x + gPos[0],
                    y: d.y + gPos[1]
                });
            })
            .on('dragend', function (d) {
                var pos = d3.mouse($g[0][0]);
                $g.classed('hb_linking', false);
                $linkCreatorLine.attr({x2: 7.5, y2: 7.5});
                self.emit(
                    'linkCreateDragEnd', d.x + pos[0], d.y + pos[1], self);
            });

        $g.append('rect').attr({
            'class': 'hb_bg',
            height: this.h,
            rx: '5',
            width: this.w,
            x: -this.w / 2,
            y: -this.h / 2
        });

        $g.append('image').attr({
            'class': 'resource_image',
            height: resImgWidth,
            width: resImgWidth,
            x: -resImgWidth / 2,
            y: -this.h/2 + 25,
            'xlink:href': this.getIconURL()
        });

        $label = $g.append('g')
                   .attr('class', 'label');

        $textContainer = $label.append('g')
                               .attr('class', 'text_container');

        $buttonContainer = $g.append('g').attr({
            'class': 'hb_node_buttons',
            transform: Snippy('translate(${x}, ${y})')({
                    x: self.w / 2 - 5,
                    y: -self.h / 2 + 5
                })
        });

        $linkButton = $buttonContainer.append('g')
            .attr({
                'class': 'hb_link',
                transform: 'translate(-34, 0)'
            }).html(
                "<rect width='15' height='15' x='0' y='0' rx='3' />" +
                "<svg xmlns='http://www.w3.org/2000/svg' " +
                        "class='hb_link_icon' " +
                        "width='15' height='15' viewBox='0 0 100 100'>" +
                    "<g transform='translate(78, 0)rotate(60)'>" +
                        "<rect width='31' height='55' x='6' y='11' rx='15' />" +
                        "<rect width='31' height='55'" +
                              "x='20' y='34' rx='15' />" +
                    "</g>" +
                "</svg>"
            )
            .on('click', function () { d3.event.stopPropagation(); })
            .call(dragLinkCreator);

        $linkCreatorLine = $linkButton.append('line').attr({x1: 7.5, y1: 7.5});

        $buttonContainer.append('g')
            .attr({
                'class': 'hb_pin',
                transform: 'translate(-15, 0)',
            }).on('click', function () {
                self.setFixed(!self._fixed);
                d3.event.stopPropagation();
            }).html(
                "<rect width='15' height='15' x='0' y='0' rx='3' />" +
                "<svg xmlns='http://www.w3.org/2000/svg' class='hb_pin_icon' " +
                        "width='15' height='15' viewBox='0 0 100 100'>" +
                    "<rect width='26' height='45' x='37' y='15' />" +
                    "<path d='M 25 60 H 75 M 50 60 V 90 M 57 15 V 60'/>" +
                "</svg>");

        $textContainer.append('text').attr({
            'class': 'resource_name',
            'text-anchor': 'middle',
            x: 0,
            y: 35
        });

        $textContainer.append('text').attr({
            'class': 'resource_type',
            'text-anchor': 'middle',
            x: 0,
            y: 45
        });

        this.updateNode();
    },
    updateNode: function () {
        var $g = this.svg.node,
            pad = 5,
            $label = $g.selectAll('.label'),
            $textContainer = $label.selectAll('.text_container');

        this.setNameOnElement($g.selectAll('.resource_name')[0][0]);
        this.setFixed(this._fixed);

        $g.selectAll('.resource_type')
            .text(this.resource.getType().split('::')[2]);
    },
    setOnLinkCreatorDrop: function (callback) {
        this._onLinkCreatorDrop = callback;
    },
    _onLinkCreatorDrop: function () { }
});

// Represents a main infrastructure component
HotUI.TopologyNode.Core = HotUI.TopologyNode.Base.extend({
    charge: -800,
    fixToAxis: 'x',
    focusForce: {x: 0.05, y: 1}
});

HotUI.TopologyNode.Helper = HotUI.TopologyNode.Base.extend({
    charge: -200,
    fixToAxis: 'y',
    focus: {x: -300, y: 0},
    focusForce: {x: 0.05, y: 0.01}
});

HotUI.TopologyNode.DNS = HotUI.TopologyNode.Core.extend({
    focus: {x: 0, y: -300},
    iconFile: 'icon-dns.svg'
});

HotUI.TopologyNode.LoadBalancer = HotUI.TopologyNode.Core.extend({
    focus: {x: 0, y: -150},
    iconFile: 'icon-load-balancers.svg'
});

HotUI.TopologyNode.Server = HotUI.TopologyNode.Core.extend({
    focus: {x: 0, y: 0},
    iconFile: 'icon-servers.svg'
});

HotUI.TopologyNode.Database = HotUI.TopologyNode.Core.extend({
    focus: {x: 0, y: 150},
    iconFile: 'icon-block-storage.svg'
});

HotUI.TopologyNode.AutoScale = HotUI.TopologyNode.Helper.extend({
    iconFile: 'icon-auto-scale.svg'
});

HotUI.TopologyNode.Network = HotUI.TopologyNode.Helper.extend({
    iconFile: 'icon-networks.svg'
});

HotUI.TopologyNode.Key = HotUI.TopologyNode.Helper.extend({
    iconFile: 'icon-private-cloud.svg'
});

HotUI.Topology = BaseObject.extend({
    create: function ($container) {
        var self = this.extend({
                _$container: $container,
                _width: $container.width(),
                _height: $container.height(),
                _onResourceClickCallback: function () {},
                _nodes: []
            }),
            centerX = self._width / 2,
            centerY = self._height / 2,
            scale = 1,
            zoom = d3.behavior.zoom()
                     .translate([centerX, centerY])
                     .scale(scale)
                     .scaleExtent([0.3, 5])
                     .on('zoom', function () {
                         self._onZoom(d3.event.translate, d3.event.scale);
                     });

        self._svg = d3.select($container[0]).append('svg').attr({
                width: self._width,
                height: self._height
            })
            .call(zoom);

        self._topG = self._svg.append('g');

        self._onZoom([centerX, centerY], scale);

        self._force = d3.layout.force()
                               .size([self._width, self._height])
                               .on('tick', function (e) { self._tick(e); })
                               .start();

        self._force.drag().on('drag', function (d) { d.setFixed(true); });

        self._node = self._topG.selectAll('.node');
        self._link = self._topG.selectAll('.link');
        self._updatedResourceCB = function () { self.updatedResource(); };

        self.setTieredLayout();

        $(window).unload(function () {
            var positions = {};
            self._nodes.forEach(function (n) {
                positions[n.resource.getID()] = {
                    x: n.x,
                    y: n.y
                };
            });

            localStorage.setItem('resourcePositions',
                                 JSON.stringify(positions));
        });

        return self;
    },
    setWebLayout: function () {
        this._force.gravity(0.1)
             .charge(-200)
             .chargeDistance(Number.POSITIVE_INFINITY)
             .linkDistance(70)
             .linkStrength(1);

        this._layoutSpecificTick = this._webTick;
    },
    setTieredLayout: function () {
        this._force.gravity(0)
             .charge(function (d) {
                 return d.charge;
             })
             .linkDistance(function (d) {
                 if (d.source.instanceof(HotUI.TopologyNode.Core) &&
                         d.target.instanceof(HotUI.TopologyNode.Core)) {
                     return 200;
                 } else if (d.source.instanceof(HotUI.TopologyNode.Helper) &&
                         d.target.instanceof(HotUI.TopologyNode.Helper)) {
                     return 200;
                 } else {
                     return 300;
                 }
             })
             .linkStrength(function (d) {
                 return d.source.instanceof(HotUI.TopologyNode.Core) &&
                        d.target.instanceof(HotUI.TopologyNode.Core) ?
                            0.001 :
                        d.source.instanceof(HotUI.TopologyNode.Helper) &&
                        d.target.instanceof(HotUI.TopologyNode.Helper) ?
                            0.5 :
                        0.03;
             })
             .chargeDistance(150);

        this._layoutSpecificTick = this._tieredTick;
    },
    _decorateNodes: function (nodesIn) {
        var self = this,
            newG = nodesIn.append('g')
                .attr({
                    'class': 'node',
                    cx: function (d) { return d.x; },
                    cy: function (d) { return d.y; }
                })
                .on('dblclick', function (d) {
                    d.setFixed(false);
                    d3.event.stopPropagation();
                })
                .call(this._force.drag)
                .on('mousedown', function () {
                    d3.event.stopPropagation();
                })
                .on('click', function (d) {
                    if (!d3.event.defaultPrevented) {
                        self._onResourceClickCallback(d.resource);
                    }
                })
                .on('mouseenter', function () {
                    this.parentNode.appendChild(this); // Brings node to front
                });

        newG.each(function (d) {
            d.setNode(d3.select(this));
            d.on('linkCreateDragStart', function (srcNode) {
                self._node.classed('hb_can_connect_to_good', function (n) {
                    return n !== d && d.canConnectTo(n);
                });
            }).on('linkCreateDrag', function (p) {
                self._node.classed('hb_can_connect_to_hover', function (n) {
                    return n !== d && n.containsPoint(p);
                });
            }).on('linkCreateDragEnd', function (x, y, srcNode) {
                self._node.classed(
                    'hb_can_connect_to_good hb_can_connect_to_hover', false);
                self._onLinkCreatorDrop(x, y, srcNode);
            });
        });
    },
    _updateNodes: function (nodesIn) {
        d3.selection(nodesIn).selectAll('g.node').each(function (d) {
            d.updateNode();
        });
    },
    _decorateLinks: function (linksIn) {
        // Insert links underneath nodes
        var linksG = linksIn.insert('g', '.node'),
            linksLine = linksG.append('polyline'),
            linksArrow = linksG.append('path');

        linksG.attr('class', function (d) {
            return 'link ' + d.type;
        });

        linksArrow.attr('d', 'M3,0 L-3,-2 L-3,2 Z');
    },
    _onZoom: function (translate, scale) {
        this._topG.attr('transform', Snippy(
            'translate(${0})scale(${1})')([translate, scale]));

        this._$container.css({
            backgroundSize: 50 * scale,
            backgroundPosition: Snippy('${0}px ${1}px')(translate)
        });
    },
    _collide: function (nodes, alpha) {
        var quadtree = d3.geom.quadtree(nodes),
            maxH = Math.max.apply(null, nodes.map(function (d) {
                return d.h;
            })),
            maxW = Math.max.apply(null, nodes.map(function (d) {
                return d.w;
            })),
            maxPadding = Math.max.apply(null, nodes.map(function (d) {
                return d.padding;
            }));

        return function (d) {
            var xMin = (d.w + maxW) / 2 + maxPadding,
                yMin = (d.h + maxH) / 2 + maxPadding,
                nx1 = d.x - xMin,
                nx2 = d.x + xMin,
                ny1 = d.y - yMin,
                ny2 = d.y + yMin;

            quadtree.visit(function (quad, x1, y1, x2, y2) {
                if (quad.point && quad.point !== d) {
                    var pad = Math.max(d.padding, quad.point.padding),
                        xDelta = d.x - quad.point.x,
                        yDelta = d.y - quad.point.y,
                        xDist = Math.abs(xDelta),
                        yDist = Math.abs(yDelta),
                        xMin = (d.w + quad.point.w) / 2 + pad,
                        yMin = (d.h + quad.point.h) / 2 + pad,
                        xOverlapRatio,
                        yOverlapRatio;

                    if (xDist < xMin && yDist < yMin) { // Collision detected
                        xOverlapRatio = (xMin - xDist) / xDist;
                        yOverlapRatio = (yMin - yDist) / yDist;

                        if (xOverlapRatio < yOverlapRatio) {
                            xDelta *= xOverlapRatio * alpha;
                            d.x += xDelta;
                            quad.point.x -= xDelta;
                        } else {
                            yDelta *= yOverlapRatio * alpha;
                            d.y += yDelta;
                            quad.point.y -= yDelta;
                        }
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    },
    _tick: function (e) {
        this._layoutSpecificTick(e);
        this._normalTick(e);
    },
    _normalTick: function (e) {
        function toDegrees(angle) {
            return angle * (180 / Math.PI);
        }

        this._node.attr('transform', function (d) {
            return Snippy('translate(${x},${y})')({
                x: d.x.toFixed(10),
                y: d.y.toFixed(10)
            });
        });

        this._link.attr('transform', function (d) {
            return Snippy('translate(${0}, ${1})')([
                (d.source.x + d.target.x) / 2,
                (d.source.y + d.target.y) / 2
            ]);
        });

        this._link.selectAll('polyline')
            .attr('points', function (d) {
                var size = {
                        x: (d.source.x - d.target.x) / 2,
                        y: (d.source.y - d.target.y) / 2
                    };

                return -size.x + ',' + -size.y + ' 0,0 ' +
                        size.x + ',' + size.y;
            });

        this._link.selectAll('path').attr('transform', function (d) {
            return Snippy('rotate(${0})')([toDegrees(Math.atan2(
                d.target.y - d.source.y, d.target.x - d.source.x))]);
        });
    },
    _tieredTick: function (e) {
        var freeNodes = this._nodes.filter(function (d) { return !d.fixed; });

        freeNodes.forEach(function (d) {
            d.x += (d.focus.x - d.x) * e.alpha * d.focusForce.x;
            d.y += (d.focus.y - d.y) * e.alpha * d.focusForce.y;
        });

        freeNodes.forEach(function (d) {
            var scale = 1 - Math.min(1, e.alpha * 10),
                coord;

            if ('fixToAxis' in d) {
                coord = d.fixToAxis === 'x' ? 'y' : 'x';
                d[coord] += (d.focus[coord] - d[coord]) * scale * scale * scale;
            }
        });

        freeNodes.forEach(this._collide(freeNodes, 0.5));
    },
    _webTick: function () {},
    _onLinkCreatorDrop: function (x, y, srcNode) {
        var self = this;

        this._nodes.forEach(function (n) {
            if (n !== srcNode && n.containsPoint({x: x, y: y})) {
                self._onLinkCreatorCreate(srcNode.resource, n.resource);
            }
        });
    },
    aboutToAddResource: function (posX, posY) {
        this._nextResourcePt = {
            x: posX,
            y: posY
        };
    },
    updatedResource: function () {
        this._updateNodesArray();
        this._force.nodes(this._nodes);
        this._update();
    },
    documentToSVGCoords: function (docX, docY) {
        var pt = this._svg.node().createSVGPoint();
        var ctm = this._topG.node().getScreenCTM();

        pt.x = docX;
        pt.y = docY;

        ctm = ctm.inverse();

        if (ctm) {
            pt = pt.matrixTransform(ctm);
        }

        return {
            x: pt.x,
            y: pt.y
        };
    },
    setOnResourceClick: function (onClickCallback) {
        this._onResourceClickCallback = onClickCallback;
    },
    _onLinkCreatorCreate: function () {},
    setOnLinkCreatorCreate: function (callback) {
        this._onLinkCreatorCreate = callback;
    },
    setData: function (resourcesIn) {

        if (this._resources) {
            this._resources.off('change', this._updatedResourceCB);
            this._resources.off('childChange', this._updatedResourceCB);
        }

        this._resources = resourcesIn;

        this._resources.on('change', this._updatedResourceCB);
        this._resources.on('childChange', this._updatedResourceCB);

        this._updateNodesArray();

        this._force.nodes(this._nodes);
        this._update();
    },
    _getNodeMap: function () {
        return this._nodes.reduce(function (mapOut, curNode) {
                mapOut[curNode.resource.getID()] = curNode;
                return mapOut;
            }, {});
    },
    _updateNodesArray: function () {
        var self = this,
            nodeMap = this._getNodeMap(),
            positions = this._getSavedPositions(),
            droppedNode;

        function resumeFunc() {
            self._force.resume();
        }

        this._nodes = this._resources.toArray().map(function (resource) {
            var oldNode = nodeMap[resource.getID()],
                newNode;

            if (oldNode) {
                oldNode.resource = resource;
                return oldNode;
            } else if (self._nextResourcePt) {
                newNode = HotUI.TopologyNode.factory(resource, resumeFunc, {
                    x: self._nextResourcePt.x,
                    y: self._nextResourcePt.y
                });

                self._nextResourcePt = null;
                droppedNode = newNode;
                return newNode;
            } else if (positions.hasOwnProperty(resource.getID())) {
                return HotUI.TopologyNode.factory(resource, resumeFunc, {
                    x: positions[resource.getID()].x,
                    y: positions[resource.getID()].y
                });
            } else {
                return HotUI.TopologyNode.factory(resource, resumeFunc, {
                    x: (Math.random() - 0.5) * self._width,
                    y: (Math.random() - 0.5) * self._height,
                });
            }
        });

        if (droppedNode) {
            this._nodes.forEach(function (node) {
                var dx, dy;
                if (node !== droppedNode) {
                    dx = droppedNode.x - node.x;
                    dy = droppedNode.y - node.y;

                    if (dx * dx + dy * dy < 225) { // Within 15px (sqrt 225)
                        node.resource.connectTo(droppedNode.resource);
                    }
                }
            });
        }
    },
    _getNode: function (resource) {
        var i;

        for (i = 0; i < this._nodes.length; i++) {
            if (this._nodes[i].resource === resource) {
                return this._nodes[i];
            }
        }
    },
    _buildLinks: function () {
        var self = this;

        function addLink(sourceNode, targetResource, type) {
            // Skip unset resource values
            if (targetResource.getPrimitiveType() !== String) {
                if (self._getNode(targetResource)) {
                    self._links.push({
                        'source': sourceNode,
                        'target': self._getNode(targetResource),
                        'type': type
                    });
                } else {
                    console.error('else statement hit when adding links');
                }
            }
        }

        function addDependsOnLinks(nodeIn) {
            nodeIn.resource.get('depends_on').each(function (i, resourceID) {
                var target = self._resources.getByID(resourceID.get());

                if (target) {
                    addLink(nodeIn, target, 'depends_on');
                }
            });
        }

        function addAttributeLinks(nodeIn) {
            nodeIn.resource.getIntrinsicFunctions()
                  .filter(function (intrinsic) {
                      return intrinsic.instanceof(HotUI.HOT.GetAttribute);
                  })
                  .forEach(function (value) {
                      addLink(nodeIn, value.get('get_attr').get('resource'),
                              'attribute');
                  });
        }

        function addResourceLinks(nodeIn) {
            nodeIn.resource.getIntrinsicFunctions()
                  .filter(function (intrinsic) {
                      return intrinsic.instanceof(HotUI.HOT.GetResource);
                  })
                  .forEach(function (value) {
                      addLink(nodeIn, value.get('get_resource'),
                              'resource');
                  });
        }

        this._links = [];

        this._nodes.forEach(function (curNode) {
            addDependsOnLinks(curNode);
            addAttributeLinks(curNode);
            addResourceLinks(curNode);
        });
    },
    _getSavedPositions: function () {
        var positions =
                JSON.parse(localStorage.getItem('resourcePositions')) || {};

        localStorage.removeItem('resourcePositions');
        return positions;
    },
    _updateNodeData: function () {
        this._node = this._node.data(this._nodes, function (d) {
            return d.resource.getID();
        });
    },
    _update: function () {
        this._updateNodeData();
        this._decorateNodes(this._node.enter());
        this._updateNodes(this._node);
        this._node.exit().remove();

        this._buildLinks();
        this._link = this._link.data(this._links,
                                     function () { return Math.random(); });
        this._force.links(this._links);
        this._decorateLinks(this._link.enter());
        this._link.exit().remove();

        this._force.start();
    }
});
