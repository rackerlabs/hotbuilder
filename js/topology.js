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

HotUI.TopologyNode.factory = function (resource, properties) {
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
            return self.Helper.create(resource, properties);
        } else if (type.indexOf(patterns[index]) > -1) {
            return types[patterns[index]].create(resource, properties);
        } else {
            return getInstance(patterns, index + 1);
        }
    }

    return getInstance(Object.keys(types), 0);
};

HotUI.TopologyNode.Base = BaseObject.extend({
    create: function (resource, properties) {
        if (!properties) {
            properties = {};
        }

        properties.data = resource;
        properties.svg = {};

        return this.extend(properties);
    },
    _iconBaseURL: '/static/hotui/img/',
    focus: {x: 0, y: 0},
    focusForce: {x: 0.5, y: 0.5},
    getIconURL: function () {
        return this._iconBaseURL + this.iconFile;
    },
    iconFile: 'icon-orchestration.svg',
    setNode: function ($g) {
        this.svg.node = $g;
        this.decorateNode();
    },
    decorateNode: function () {
        var self = this,
            $g = this.svg.node,
            $label,
            $textContainer,
            $linkCreator,
            $linkCreatorLine,
            dragLinkCreator;

        dragLinkCreator = d3.behavior.drag()
            .on('dragstart', function () {
                d3.event.sourceEvent.stopPropagation();
            })
            .on('drag', function () {
                $linkCreator.attr('cx', d3.event.x)
                            .attr('cy', d3.event.y);
                $linkCreatorLine.attr('x2', d3.event.x)
                                .attr('y2', d3.event.y);
            })
            .on('dragend', function (d) {
                var creatorX = +$linkCreator.attr('cx'),
                    creatorY = +$linkCreator.attr('cy');

                $linkCreator.attr('cx', '7')
                            .attr('cy', '10');
                $linkCreatorLine.attr('x2', '0')
                                .attr('y2', '0');
                self._onLinkCreatorDrop(creatorX + d.x,
                                        creatorY + d.y,
                                        self);
            });

        $linkCreatorLine = $g.append('line')
            .attr('x1', '0')
            .attr('y1', '0')
            .attr('x2', '0')
            .attr('y2', '0')
            .attr('stroke-width', '1px')
            .attr('stroke', 'grey');

        $linkCreator = $g.append('circle')
            .attr('r', '5')
            .attr('cx', '7')
            .attr('cy', '10')
            .attr('fill', 'white')
            .attr('stroke', '#3480C2')
            .on('mouseenter', function () {
                $linkCreator.attr('fill', '#3480C2');
            })
            .on('mouseleave', function () {
                $linkCreator.attr('fill', 'white');
            })
            .call(dragLinkCreator);

        $label = $g.append('g')
                   .attr('class', 'label')
                   .attr('transform', 'translate(16, 0)');

        $textContainer = $label.append('g')
                               .attr('class', 'text_container');

        $g.append('circle')
            .attr('r', '14')
            .attr('cx', '0')
            .attr('cy', '0')
            .attr('fill', 'white')
            .attr('stroke', '#3480C2')
            .attr('stroke-width', '1');

        $g.append('image')
            .attr('class', 'resource_image')
            .attr('height', '20')
            .attr('width', '20')
            .attr('x', '-10')
            .attr('y', '-10')
            .attr('xlink:href', this.getIconURL());

        $label.insert('rect', '.text_container')
              .attr('class', 'background')
              .attr('rx', 5)
              .attr('ry', 5);

        $textContainer.append('text')
                       .attr('class', 'resource_name')
                       .attr('x', 0)
                       .attr('y', -2);

        $textContainer.append('text')
                       .attr('class', 'resource_type')
                       .attr('x', 0)
                       .attr('y', 5);

        this.updateNode();
    },
    updateNode: function () {
        var $g = this.svg.node,
            pad = 5,
            $label = $g.selectAll('.label'),
            $labelBg = $label.selectAll('.background'),
            $textContainer = $label.selectAll('.text_container');

        $g.selectAll(".resource_name")
            .text(this.data.getID());

        $g.selectAll(".resource_type")
            .text(this.data.getType().split("::")[2]);

        window.setTimeout(function () {
            var textBBox = $textContainer[0][0].getBBox();
            $labelBg.attr('x', textBBox.x - pad)
                     .attr('y', textBBox.y - pad)
                     .attr('width', textBBox.width + 2 * pad)
                     .attr('height', textBBox.height + 2 * pad);
        }, 0);
    },
    setOnLinkCreatorDrop: function (callback) {
        this._onLinkCreatorDrop = callback;
    },
    _onLinkCreatorDrop: function () { }
});

// Represents a main infrastructure component
HotUI.TopologyNode.Core = HotUI.TopologyNode.Base.extend({
    charge: -400,
    focusForce: {x: 0.05, y: 0.35}
});

HotUI.TopologyNode.Helper = HotUI.TopologyNode.Base.extend({
    charge: -200,
    focus: {x: -300, y: 0},
    focusForce: {x: 0.05, y: 0.01}
});

HotUI.TopologyNode.DNS = HotUI.TopologyNode.Core.extend({
    focus: {x: 0, y: -140},
    iconFile: 'icon-dns.svg'
});

HotUI.TopologyNode.LoadBalancer = HotUI.TopologyNode.Core.extend({
    focus: {x: 0, y: -70},
    iconFile: 'icon-load-balancers.svg'
});

HotUI.TopologyNode.Server = HotUI.TopologyNode.Core.extend({
    focus: {x: 0, y: 0},
    iconFile: 'icon-servers.svg'
});

HotUI.TopologyNode.Database = HotUI.TopologyNode.Core.extend({
    focus: {x: 0, y: 70},
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
                _width: $container.width(),
                _height: $container.height(),
                _onResourceClickCallback: function () {},
                _nodes: []
            }),
            centerX = 3 * self._width / 4,
            centerY = self._height / 2,
            zoom = d3.behavior.zoom()
                              .translate([centerX, centerY])
                              .on("zoom", function () { self._onZoom(); });

        self._svg = d3.select($container[0]).append("svg")
                .attr("width", self._width)
                .attr("height", self._height)
                .call(zoom);

        self._topG = self._svg.append("g")
                         .attr('transform', 'translate(' + centerX + ',' +
                                                           centerY + ')');

        self._force = d3.layout.force()
                               .size([self._width, self._height])
                               .on("tick", function (e) { self._tick(e); })
                               .start();

        self._node = self._topG.selectAll(".node");
        self._link = self._topG.selectAll(".link");
        self._updatedResourceCB = function () { self.updatedResource(); };

        self._topG.append('circle')
             .attr('r', '1')
             .attr('fill', '#808080')
             .attr('cx', '0')
             .attr('cy', '0');

        self.setTieredLayout();

        $(window).unload(function () {
            var positions = {};
            self._nodes.forEach(function (n) {
                positions[n.data.getID()] = {
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
                     return 70;
                 } else if (d.source.instanceof(HotUI.TopologyNode.Helper) &&
                         d.target.instanceof(HotUI.TopologyNode.Helper)) {
                     return 70;
                 } else {
                     return 200;
                 }
             })
             .linkStrength(function (d) {
                 return d.source.instanceof(HotUI.TopologyNode.Core) &&
                        d.target.instanceof(HotUI.TopologyNode.Core) ?
                            0.5 :
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
            newG = nodesIn.append("g")
                .attr("class", "node")
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })
                .call(this._force.drag)
                .on("mousedown", function () {
                    d3.event.stopPropagation();
                })
                .on("click", function (d) {
                    if (!d3.event.defaultPrevented) {
                        self._onResourceClickCallback(d.data);
                    }
                })
                .on("mouseenter", function () {
                    this.parentNode.appendChild(this);
                });

        newG.each(function (d) {
            d.setNode(d3.select(this));
            d.setOnLinkCreatorDrop(function (x, y, srcNode) {
                self._onLinkCreatorDrop(x, y, srcNode);
            });
        });
    },
    _updateNodes: function (nodesIn) {
        d3.selection(nodesIn).selectAll("g.node").each(function (d) {
            d.updateNode();
        });
    },
    _decorateLinks: function (linksIn) {
        // Insert links underneath nodes
        var linksG = linksIn.insert('g', '.node'),
            linksLine = linksG.append('polyline'),
            linksArrow = linksG.append('path');

        linksG.attr("class", function (d) {
            return "link " + d.type;
        });

        linksArrow.attr('d', 'M3,0 L-3,-2 L-3,2 Z');
    },
    _onZoom: function () {
        this._topG.attr("transform", "translate(" + d3.event.translate + ")" +
                        "scale(" + d3.event.scale + ")");

        // updates label backgrounds because text changes size
        this._nodes.forEach(function (n) { n.updateNode(); });
    },
    _tick: function (e) {
        this._layoutSpecificTick(e);
        this._normalTick(e);
    },
    _normalTick: function (e) {
        function toDegrees(angle) {
            return angle * (180 / Math.PI);
        }

        this._node.attr("transform", function (d) {
            return "translate(" + d.x + ", " + d.y + ")";
        });

        this._link.attr('transform', function (d) {
            return 'translate(' + (d.source.x + d.target.x) / 2 + ', ' +
                (d.source.y + d.target.y) / 2 + ')';
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
            return 'rotate(' + toDegrees(Math.atan2(d.target.y - d.source.y,
                                             d.target.x - d.source.x)) + ')';
        });
    },
    _tieredTick: function (e) {
        this._nodes.forEach(function (d) {
            // light gravity towards x = 0
            d.x += (d.focus.x - d.x) * e.alpha * d.focusForce.x;
            d.y += (d.focus.y - d.y) * e.alpha * d.focusForce.y;
        });
    },
    _webTick: function () {},
    _onLinkCreatorDrop: function (x, y, srcNode) {
        var self = this;

        this._nodes.forEach(function (n) {
            var dist = Math.sqrt((x - n.x) * (x - n.x) +
                                 (y - n.y) * (y - n.y));

            if (dist <= 15 && n !== srcNode) {
                self._onLinkCreatorCreate(srcNode.data, n.data);
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
                mapOut[curNode.data.getID()] = curNode;
                return mapOut;
            }, {});
    },
    _updateNodesArray: function () {
        var self = this,
            nodeMap = this._getNodeMap(),
            positions = this._getSavedPositions(),
            droppedNode;

        this._nodes = this._resources.toArray().map(function (resource) {
            var oldNode = nodeMap[resource.getID()],
                newNode;

            if (oldNode) {
                oldNode.data = resource;
                return oldNode;
            } else if (self._nextResourcePt) {
                newNode = HotUI.TopologyNode.factory(resource, {
                    x: self._nextResourcePt.x,
                    y: self._nextResourcePt.y
                });

                self._nextResourcePt = null;
                droppedNode = newNode;
                return newNode;
            } else if (positions.hasOwnProperty(resource.getID())) {
                return HotUI.TopologyNode.factory(resource, {
                    x: positions[resource.getID()].x,
                    y: positions[resource.getID()].y
                });
            } else {
                return HotUI.TopologyNode.factory(resource, {
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
                        node.data.connectTo(droppedNode.data);
                    }
                }
            });
        }
    },
    _getNode: function (resource) {
        var i;

        for (i = 0; i < this._nodes.length; i++) {
            if (this._nodes[i].data === resource) {
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
                    console.error("else statement hit when adding links");
                }
            }
        }

        function addDependsOnLinks(nodeIn) {
            nodeIn.data.get('depends_on').each(function (i, resourceID) {
                var target = self._resources.getByID(resourceID.get());

                if (target) {
                    addLink(nodeIn, target, "depends_on");
                }
            });
        }

        function addAttributeLinks(nodeIn) {
            nodeIn.data.getIntrinsicFunctions()
                  .filter(function (intrinsic) {
                      return intrinsic.instanceof(HotUI.HOT.GetAttribute);
                  })
                  .forEach(function (value) {
                      addLink(nodeIn, value.get('get_attr').get('resource'),
                              "attribute");
                  });
        }

        function addResourceLinks(nodeIn) {
            nodeIn.data.getIntrinsicFunctions()
                  .filter(function (intrinsic) {
                      return intrinsic.instanceof(HotUI.HOT.GetResource);
                  })
                  .forEach(function (value) {
                      addLink(nodeIn, value.get('get_resource'),
                              "resource");
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
        this._node = this._node.data(this._nodes,
                                     function (d) { return d.data.getID(); });
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
