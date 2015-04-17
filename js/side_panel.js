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

HotUI.SidePanel = BaseObject.extend({
    create: function ($container, $content, $closeButton) {
        var self = this.extend({
                _isHidden: false,
                _$container: $container,
                _$content: $content,
                _$navbar: $container.children('.hotui_side_panel_nav')
            });

        self._setupDrag();

        $closeButton.on("click", function () {
            if (!self._isHidden) {
                self._$container.hide();
                self._isHidden = true;
            }
        });

        self._$navbar.append(
            '<div class="nav_button" name="resources">Resources</div>' +
            '<div class="nav_button" name="parameters">Parameters</div>' +
            '<div class="nav_button" name="outputs">Outputs</div>' +
            '<div class="nav_button" name="options">Template Options</div>');

        self._$navbar.children('.nav_button').on('click', function () {
            var $button = $(this),
                selection = $button.attr('name');

            if (selection === 'resources') {
                self.showAddResourcePanel();
            } else if (selection === 'parameters') {
                self.showParameters();
            } else if (selection === 'outputs') {
                self.showOutputs();
            } else if (selection === 'options') {
                self.showTemplateOptions();
            }

            $button.siblings('.active').removeClass('active');
            $button.addClass('active');
        });

        return self;
    },
    displayContent: function (content) {
        if (this._isHidden) {
            this._$container.show();
            this._isHidden = false;
        }

        this._$content.scrollTop(0);

        if (typeof content === 'string') {
            this._$content.html(content);
        } else {
            this._$content.empty();
            this._$content.append(content);
        }
    },
    _setupDrag: function () {
        var self = this,
            $overlay = $("#hotui_overlay");

        function onDragStart() {
            var $target = $(this),
                $replacement = $target.clone(),
                targetOffset = $target.offset(),
                overlayOffset = $overlay.offset(),
                targetLeft = targetOffset.left - overlayOffset.left,
                targetTop = targetOffset.top - overlayOffset.top,
                posDoc = d3.mouse($('body')[0]),
                pos = d3.mouse($overlay[0]);

            d3.select($replacement[0]).call(self._drag); // Attach handler

            $replacement.addClass("replacement")
                .css("opacity", "0")
                .insertAfter($target);

            $target.width($target.width()) // Prevent auto-resizing on drag
                .appendTo($overlay)
                .css({
                    'left': targetLeft,
                    position: "absolute",
                    'top': targetTop
                })
                .attr({
                    dragStartX: posDoc[0],
                    dragStartY: posDoc[1]
                });
        }

        function onDrag() {
            var $target = $(this),
                pos = d3.mouse($overlay[0]);

            $target.css({
                'left': pos[0] - 15,
                'top': pos[1] - 15
            });
        }

        function onDragEnd() {
            var $target = $(this),
                posDoc = d3.mouse($('body')[0]);

            function outsideSidePanel() {
                var pos = d3.mouse(self._$container[0]);
                return pos[0] < 0 || pos[0] > self._$container.width() ||
                       pos[1] < 0 || pos[1] > self._$container.height();
            }

            function didNotMove() {
                return posDoc[0] === +$target.attr("dragStartX") &&
                       posDoc[1] === +$target.attr("dragStartY");
            }

            self._$content.children(".replacement")
                          .animate({ opacity: 1 }, 500)
                          .removeClass("replacement");

            $overlay.children(".resource_draggable").remove();

            if (outsideSidePanel() || didNotMove()) {
                self._onResourceDrop(posDoc[0], posDoc[1],
                                     $target.attr("type"));
            }
        }

        this._drag = d3.behavior.drag()
                                .on("dragstart", onDragStart)
                                .on("drag", onDrag)
                                .on("dragend", onDragEnd);
    },
    _onResourceDrop: function () {},
    setTemplate: function (newTemplate) {
        this._template = newTemplate;
    },
    setOnResourceDrop: function (callback) {
        this._onResourceDrop = callback;
        return this;
    },
    showAddResourcePanel: function () {
        var html = "";

        function safePush(obj, key, val) {
            obj[key] = obj[key] || [];
            obj[key].push(val);
        }

        function getSection(resourceType, sectionNum) {
            return resourceType.getID().split('::')[sectionNum];
        }

        function mapSectionFactory(sectionNum) {
            return function (objOut, resType) {
                safePush(objOut, getSection(resType, sectionNum), resType);
                return objOut;
            };
        }

        html += '<h2>Add Resource</h2>';

        var resMap = HotUI.HOT.resourceTypes.toArray()
                                            .reduce(mapSectionFactory(0), {});

        Object.keys(resMap).forEach(function (key) {
            resMap[key] = resMap[key].reduce(mapSectionFactory(1), {});
        });

        console.log(resMap);

        Object.keys(resMap).sort().forEach(function (sec0) {
            html += '<hr>';
            html += Snippy('<h3 class="resource_org">${0}</h3>')([sec0]);

            Object.keys(resMap[sec0]).sort().forEach(function (sec1) {
                html += '<h4 class="resource_class">' + sec1 + '</h4>';

                resMap[sec0][sec1].sort(function (el1, el2) {
                    return getSection(el1, 2).localeCompare(getSection(el2, 2));
                }).forEach(function (resType) {
                    html += Snippy(
                        '<div class="resource_draggable" type="${type}">' +
                        '<div></div>${sec}</div>')({
                            type: resType.getID(),
                            sec: getSection(resType, 2)
                        });
                });
            });
        });

        this.displayContent(html);

        d3.selectAll(".resource_draggable")
            .call(this._drag);
    },
    showResource: function (resource) {
        var panel = HotUI.Panel.ResourceDetail.create(resource, this._template);
        this.displayContent(panel.html());
        this._$navbar.children('.nav_button.active')
                     .removeClass('active');
    },
    showParameters: function () {
        this.displayContent([
            '<h2>Parameters</h2>',
            '<br>',
            HotUI.FormControl(this._template.get('parameters')).html(),
        ]);
    },
    showOutputs: function () {
        this.displayContent([
            '<h2>Outputs</h2>',
            '<br>',
            HotUI.FormControl(this._template.get('outputs'), {
                'template': this._template
            }).html()
        ]);
    },
    showTemplateOptions: function () {
        var $html = $('<div></div>'),
            versionControl = HotUI.UI.String.create(
                                 this._template.get('heat_template_version'),
                                 'Heat Template Version'),
            descriptionControl = HotUI.UI.String.create(
                                     this._template.get('description'),
                                     'Description');

        $html.append('<h2>Template Options</h2>Heat Template Version:<br>',
                    versionControl.html(), '<br><br>',
                    'Description:<br>',
                    descriptionControl.html());

        this.displayContent($html);
    },
    showLinkCreatePanel: function (sourceResource, targetResource) {
        var getAttribute = HotUI.HOT.GetAttribute.create(),
            value = getAttribute.get('get_attr').get('value'),
            $html = $('<div></div>'),
            $dependencyTypeSelector = HotUI.UI.Selector.create(
                ['General', 'Resource', 'Attribute']),
            $sourceBox = HotUI.UI.Snippet.create(
                '<div data-bind="visible: showProps()"></div>',
                {showProps: showProps}),
            $destBox = HotUI.UI.Snippet.create(
                '<div data-bind="visible: showAttrs()"></div>',
                {showAttrs: showAttrs}),
            $createButton =
                $('<div class="create_dependency_button">Create</div>'),
            $attribute = HotUI.UI.ResAttributeSelector.create(targetResource),
            $value = HotUI.UI.SchemalessContainer.create(value),
            $selector = HotUI.UI.ResourcePropertyWrapperSelector
                             .create(sourceResource);

        function showProps() {
            return $dependencyTypeSelector.value() !== 'General';
        }

        function showAttrs() {
            return $dependencyTypeSelector.value() === 'Attribute';
        }

        function clickCreateDependency() {
            var path = $selector.getSelection(),
                dependencyType = $dependencyTypeSelector.value();

            function getNode(data, path) {
                if (path.length) {
                    if (data.instanceof(
                            HotUI.HOT.ResourcePropertyWrapper)) {
                        data = data.getValue();
                    }

                    return getNode(data.get(path[0]), path.slice(1));
                } else {
                    return data;
                }
            }

            if (dependencyType === "General") {
                sourceResource.get('depends_on')
                              .push(targetResource.getID());
            } else if (!path.length) {
                return;
            } else if (dependencyType === "Resource") {
                getNode(sourceResource.get('properties'), path)
                    .setValue(HotUI.HOT.GetResource.create());
                getNode(sourceResource.get('properties'), path)
                    .getValue().set('get_resource', targetResource);
            } else {
                getAttribute.get('get_attr')
                    .set('attribute', $attribute.getSelection());
                getNode(sourceResource.get('properties'), path)
                    .setValue(getAttribute);
            }
        }

        getAttribute.get('get_attr').set('resource', targetResource);

        $createButton.click(clickCreateDependency);

        $html.append("<h2>Create Resource Dependency</h2>",
                     $dependencyTypeSelector.html(),
                     '<br>',
                     sourceResource.getID(),
                     '<br>',
                     $sourceBox.html().append($selector.html()),
                     '<br>',
                     'depends on <br>' + targetResource.getID(),
                     '<br>',
                     $destBox.html().append($attribute.html(),
                                            $value.html()),
                     '<br>',
                     $createButton);
        this.displayContent($html);
    }
});
