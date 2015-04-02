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

HotUI.Topology = (function () {
    var TopologyNode = {},
        imgsURL = '/static/hotui/img/';

    function TO_DEG(angle) {
        return angle * (180 / Math.PI);
    }

    TopologyNode.create = function (resource, properties) {
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

    TopologyNode.Base = BaseObject.extend({
        create: function (resource, properties) {
            if (!properties) {
                properties = {};
            }

            properties.data = resource;
            properties.svg = {};

            return this.extend(properties);
        },
        focus: {x: 0, y: 0},
        focusForce: {x: 0.5, y: 0.5},
        getIconURL: function () {
            return imgsURL + this.iconFile;
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
                                    .attr('y2', d3.event.y)
                })
                .on('dragend', function (d) {
                    var creatorX = +$linkCreator.attr('cx'),
                        creatorY = +$linkCreator.attr('cy');

                    $linkCreator.attr('cx', '7')
                                .attr('cy', '10');
                    $linkCreatorLine.attr('x2', '0')
                                    .attr('y2', '0')
                    self._onLinkCreatorDrop(creatorX + d.x,
                                            creatorY + d.y);
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
    TopologyNode.Core = TopologyNode.Base.extend({
        charge: -400,
        focusForce: {x: 0.05, y: 0.35}
    });

    TopologyNode.Helper = TopologyNode.Base.extend({
        charge: -200,
        focus: {x: -300, y: 0},
        focusForce: {x: 0.05, y: 0.01}
    });

    TopologyNode.DNS = TopologyNode.Core.extend({
        focus: {x: 0, y: -140},
        iconFile: 'icon-dns.svg'
    });

    TopologyNode.LoadBalancer = TopologyNode.Core.extend({
        focus: {x: 0, y: -70},
        iconFile: 'icon-load-balancers.svg'
    });

    TopologyNode.Server = TopologyNode.Core.extend({
        focus: {x: 0, y: 0},
        iconFile: 'icon-servers.svg'
    });

    TopologyNode.Database = TopologyNode.Core.extend({
        focus: {x: 0, y: 70},
        iconFile: 'icon-block-storage.svg'
    });

    TopologyNode.AutoScale = TopologyNode.Helper.extend({
        iconFile: 'icon-auto-scale.svg'
    });

    TopologyNode.Network = TopologyNode.Helper.extend({
        iconFile: 'icon-networks.svg'
    });

    TopologyNode.Key = TopologyNode.Helper.extend({
        iconFile: 'icon-private-cloud.svg'
    });

    function constructor($container) {
        if (!(this instanceof HotUI.Topology)) {
            return new HotUI.Topology($container);
        }
        
        var that = this;
        var width = $container.width();
        var height = $container.height();

        var zoom = d3.behavior.zoom()
                              .translate([3 * width / 4, height / 2])
                              .on("zoom", onZoom);

        var svg = d3.select($container[0]).append("svg")
                .attr("width", width)
                .attr("height", height)
                .call(zoom);

        var topG = svg.append("g")
                       .attr('transform', 'translate(' + 3 * width / 4 + ',' +
                                                         height / 2 + ')');

        var force = d3.layout.force()
                .size([width, height])
                .on("tick", tick)
                .start();

        var onResourceClickCallback = function () {};

        var resources;
        var nodes = [];
        var links;

        var node = topG.selectAll(".node");
        var link = topG.selectAll(".link");

        var nextResourcePt;

        var layoutSpecificTick;

        function setWebLayout() {
            force.gravity(0.1)
                 .charge(-200)
                 .linkDistance(70)
                 .linkStrength(1);

            layoutSpecificTick = webTick;
        }

        function setTieredLayout() {
            force.gravity(0)
                 .charge(function (d) {
                     return d.charge;
                 })
                 .linkDistance(function (d) {
                     if (d.source.instanceof(TopologyNode.Core) &&
                             d.target.instanceof(TopologyNode.Core)) {
                         return 70;
                     } else if (d.source.instanceof(TopologyNode.Helper) &&
                             d.target.instanceof(TopologyNode.Helper)) {
                         return 70;
                     } else {
                         return 200;
                     }
                 })
                 .linkStrength(function (d) {
                     return d.source.instanceof(TopologyNode.Core) &&
                            d.target.instanceof(TopologyNode.Core) ? 
                                0.5 : 
                            d.source.instanceof(TopologyNode.Helper) &&
                            d.target.instanceof(TopologyNode.Helper) ? 
                                0.5 :
                            0.03;
                 });

            layoutSpecificTick = tieredTick;
        }

        function decorateNodes(nodesIn) {
            var newG = nodesIn.append("g")
                    .attr("class", "node")
                    .attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; })
                    .call(force.drag)
                    .on("mousedown", function () { 
                        d3.event.stopPropagation();
                    })
                    .on("click", function (d) {
                        if (!d3.event.defaultPrevented) {
                            onResourceClickCallback(d.data);
                        }
                    })
                    .on("mouseenter", function () {
                        this.parentNode.appendChild(this);
                    });

            newG.each(function (d) {
                d.setNode(d3.select(this));
                d.setOnLinkCreatorDrop(onLinkCreatorDrop);
            });
        }

        function updateNodes(nodesIn) {
            d3.selection(nodesIn).selectAll("g.node").each(function (d) {
                d.updateNode();
            });
        }

        function decorateLinks(linksIn) {
            // Insert links underneath nodes
            var linksG = linksIn.insert('g', '.node'),
                linksLine = linksG.append('polyline'),
                linksArrow = linksG.append('path');

            linksG.attr("class", function (d) {
                return "link " + d.type;
            });
            
            linksArrow.attr('d', 'M3,0 L-3,-2 L-3,2 Z');
        }

        function onZoom() {
            topG.attr("transform", "translate(" + d3.event.translate + ")" + 
                       "scale(" + d3.event.scale + ")");

            // updates label backgrounds because text changes size
            nodes.forEach(function (n) { n.updateNode(); });
        }

        function tick(e) {
            layoutSpecificTick(e);
            normalTick(e);
        }

        function normalTick(e) {
            node.attr("transform", function (d) {
                return "translate(" + d.x + ", " + d.y + ")";
            });

            link.attr('transform', function (d) {
                return 'translate(' + (d.source.x + d.target.x) / 2 + ', ' +
                    (d.source.y + d.target.y) / 2 + ')';
            });

            link.selectAll('polyline')
                .attr('points', function (d) {
                    var size = {
                            x: (d.source.x - d.target.x) / 2,
                            y: (d.source.y - d.target.y) / 2
                        };

                    return -size.x + ',' + -size.y + ' 0,0 ' +
                            size.x + ',' + size.y;
                });

            link.selectAll('path').attr('transform', function (d) {
                return 'rotate(' + TO_DEG(Math.atan2(d.target.y - d.source.y,
                                             d.target.x - d.source.x)) + ')';
            });
        }

        function tieredTick(e) {
            nodes.forEach(function (d) {
                // light gravity towards x = 0
                d.x += (d.focus.x - d.x) * e.alpha * d.focusForce.x; 
                d.y += (d.focus.y - d.y) * e.alpha * d.focusForce.y;
            });
        }

        function webTick(e) {

        }

        function callOnLinkCreate(source, target) {
            that._onLinkCreatorCreate(source, target);
        }

        function onLinkCreatorDrop(x, y) {
            var self = this;

            nodes.forEach(function (n) {
                var dist = Math.sqrt((x - n.x) * (x - n.x) +
                                     (y - n.y) * (y - n.y));

                if (dist <= 15 && n !== self) {
                    callOnLinkCreate(self.data, n.data);
                }
            });
        }

        this.aboutToAddResource = function (posX, posY) {
            nextResourcePt = {
                x: posX,
                y: posY
            };
        };

        this.updatedResource = function () {
            updateNodesArray();
            force.nodes(nodes);
            update();
        };

        this.documentToSVGCoords = function (docX, docY) {
            var pt = svg.node().createSVGPoint();
            var ctm = topG.node().getScreenCTM();

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
        };

        this.setOnResourceClick = function (onClickCallback) {
            onResourceClickCallback = onClickCallback;
        };

        this._onLinkCreatorCreate = function () {};

        this.setOnLinkCreatorCreate = function (callback) {
            this._onLinkCreatorCreate = callback;
        }

        this.setData = function (resourcesIn) {
            if (resources) {
                resources.off('change', that.updatedResource);
                resources.off('childChange', that.updatedResource);
            }

            resources = resourcesIn;

            resources.on('change', that.updatedResource);
            resources.on('childChange', that.updatedResource);

            updateNodesArray();

            force.nodes(nodes);
            update();
        };

        function getNodeMap() {
            return nodes.reduce(function (mapOut, curNode) {
                    mapOut[curNode.data.getID()] = curNode;
                    return mapOut;
                }, {});
        }

        function updateNodesArray() {
            var nodeMap = getNodeMap(),
                positions = getSavedPositions(),
                droppedNode;

            nodes = resources.toArray().map(function (resource) {
                var oldNode = nodeMap[resource.getID()],
                    newNode;

                if (oldNode) {
                    oldNode.data = resource;
                    return oldNode;
                } else if (nextResourcePt) {
                    newNode = TopologyNode.create(resource, {
                        x: nextResourcePt.x,
                        y: nextResourcePt.y
                    });

                    droppedNode = newNode;
                    nextResourcePt = null;
                    return newNode;
                } else if (positions.hasOwnProperty(resource.getID())) {
                    return TopologyNode.create(resource, {
                        x: positions[resource.getID()].x,
                        y: positions[resource.getID()].y
                    });
                } else {
                    return TopologyNode.create(resource, {
                        x: (Math.random() - 0.5) * width,
                        y: (Math.random() - 0.5) * height,
                    });
                }
            });

            if (droppedNode) {
                nodes.forEach(function (node) {
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
        }

        function getNode(resource) {
            var i;

            for (i = 0; i < nodes.length; i++) {
                if (nodes[i].data === resource) {
                    return nodes[i];
                }
            }
        }

        function buildLinks() {
            function addLink(sourceNode, targetResource, type) {
                // Skip unset resource values
                if (targetResource.getPrimitiveType() !== String) {
                    if (getNode(targetResource)) {
                        links.push({
                            'source': sourceNode,
                            'target': getNode(targetResource),
                            'type': type
                        });
                    } else {
                        debugger;
                    }
                }
            }

            function addDependsOnLinks(nodeIn) {
                nodeIn.data.get('depends_on').each(function (i, resourceID) {
                    var target = resources.getByID(resourceID.get());

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

            links = [];

            nodes.forEach(function (curNode) {
                addDependsOnLinks(curNode);
                addAttributeLinks(curNode);
                addResourceLinks(curNode);
            });
        }

        function getSavedPositions() {
            var positions =
                    JSON.parse(localStorage.getItem('resourcePositions')) || {};

            localStorage.removeItem('resourcePositions');
            return positions;
        }
            
        function updateNodeData() {
            node = node.data(nodes, function (d) { return d.data.getID(); });
        }

        function update() {
            updateNodeData();
            decorateNodes(node.enter());
            updateNodes(node);
            node.exit().remove();

            buildLinks();
            link = link.data(links, function (d) { return Math.random(); });
            force.links(links);
            decorateLinks(link.enter());
            link.exit().remove();

            force.start();
        }

        topG.append('circle')
             .attr('r', '1')
             .attr('fill', '#808080')
             .attr('cx', '0')
             .attr('cy', '0');

        //setWebLayout();
        setTieredLayout();

        $(window).unload(function () {
            var positions = {};
            nodes.forEach(function (n) {
                positions[n.data.getID()] = {
                    x: n.x,
                    y: n.y
                };
            });

            localStorage.setItem('resourcePositions',
                                 JSON.stringify(positions));
        });

        this.SET_WEB = setWebLayout;
        this.SET_TIERED = setTieredLayout;
        this.FORCE = function () { return force; };
    }

    return constructor;
}());
