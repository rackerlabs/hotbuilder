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

var APP;

HotUI.App = BaseObject.extend({
    create: function ($container) {
        var self = this.extend({}),
            templates = (Barricade.create({
                '@type': Array,
                '*': {'@class': HotUI.HOT.Template}
            }).create([{}])),
            navbar,
            topology = HotUI.Topology.create($("#hotui_topology")),
            sidePanel = HotUI.SidePanel.create(
                                        templates,
                                        $("#hotui_side_panel"),
                                        $("#hotui_side_panel_content"),
                                        $("#hotui_side_panel > .close_button")),
            sourcePanel = HotUI.SourcePanel.create(templates,
                                                   $("#hotui_source_panel")),
            untitledResources = 0;

        function loadTemplateFromURL(startingURL) {
            var url = ko.observable(startingURL || '');

            function doLoad() {
                $.ajax({
                    type: 'GET',
                    url: ENDPOINTS.urlToJSON,
                    data: {url: url()},
                    success: function (data) {
                        if (typeof data === 'string') {
                            HotUI.UI.Modal.create({
                                title: 'Error Loading Template',
                                content: data,
                                buttons: [
                                    {
                                        label: 'Try Again',
                                        cssClass: 'hb_green',
                                        action: function () {
                                            loadTemplateFromURL(url());
                                        }
                                    }, {
                                        label: 'Give Up'
                                    }
                                ]
                            }).display();
                        } else {
                            templates.set(0, data);
                        }
                    }
                });
            }

            HotUI.UI.Modal.create({
                title: 'Load Template',
                content:
                    '<p>This will overwrite your current template!</p>' +
                    '<p>Enter the URL of a <strong>plain text</strong> ' +
                    'template file:</p>' +
                    '<input class="hb_load_from_url" type="text" ' +
                           'data-bind="value: _options.url">',
                buttons: [
                    {
                        label: 'Load',
                        cssClass: 'hb_red',
                        action: doLoad
                    }, {
                        label: 'Cancel'
                    }
                ],
                url: url
            }).display();
        }

        function validateTemplate() {
            $.ajax({
                type: 'POST',
                url: ENDPOINTS.templateValidate,
                data: {
                    'endpoint': STACK_ENDPOINT,
                    'template': JSON.stringify(template().toJSON(true))
                },
                success: function (data) {
                    var passed = typeof data !== 'string';
                    HotUI.UI.Modal.create({
                        title: 'Validation',
                        content: (passed
                            ? '<p>Passed!</p>'
                            : '<p>Failed:</p><p>' + data + '</p>')
                    }).display();
                }
            });
        }

        function downloadTemplate() {
            var templateJSON = JSON.stringify(template().toJSON(true))
                                   .replace(/\"/g, '&quot;'),
                $form = $(Snippy(
                    '<form method="POST" action="${action}">' +
                        '<input type="hidden" name="json" value="${json}">' +
                        '<input type="hidden" name="csrfmiddlewaretoken" ' +
                                'value="${csrf}">')({
                            action: ENDPOINTS.downloadTemplate,
                            json: templateJSON,
                            csrf: $("meta[name='csrftoken']").attr('content')
                        }));
            $form.appendTo('body')
                 .submit()
                 .remove();
        }

        function resetTemplate() {
            HotUI.UI.Modal.create({
                title: 'Warning',
                content: 'This will clear your current template!',
                buttons: [
                    {
                        label: 'Reset',
                        cssClass: 'hb_red',
                        action: function () {
                            self._templates.set(0, undefined);
                        }
                    }, {
                        label: 'Cancel'
                    }
                ]
            }).display();
        }

        navbar = HotUI.Navbar.create(
            templates,
            $("#hotui_navbar"), [
                {label: 'Home',
                 action: function () { sidePanel.showHome(); }},
                {label: 'Template',
                 action: function () { sidePanel.showTemplate(); }}
            ], [
                {label: 'Load', action: loadTemplateFromURL},
                {label: 'Validate', action: validateTemplate},
                {label: 'Download', action: downloadTemplate},
                {label: 'Reset', action: resetTemplate},
            ]);


        self._navbar = navbar;
        self._topology = topology;
        self._templates = templates;
        self._sidePanel = sidePanel;
        self._sourcePanel = sourcePanel;

        function template() {
            return templates.get(0);
        }

        function addResource(x, y, typeIn) {
            var pt = topology.documentToSVGCoords(x, y);

            untitledResources++;

            topology.aboutToAddResource(pt.x, pt.y);
            template().get('resources').push({type: typeIn},
                                           {id: typeIn.replace(/::/g, '') +
                                                untitledResources});
        }

        function onResourceClick(resource) {
            sidePanel.showResource(resource);
            navbar.clearActiveTab();
        }

        templates.on('change', function (type, index, newTemp, oldTemp) {
            if (type === 'set' && index === 0) {
                topology.setData(newTemp.get('resources'));
                sidePanel.setTemplate(newTemp);
            }
        });

        $(window).unload(function () {
            localStorage.setItem('template',
                                 JSON.stringify(template().toJSON()));
        });

        // initialization
        templates.set(0, JSON.parse(localStorage.getItem('template') || {}));
        sidePanel.setOnResourceDrop(addResource);

        topology.setData(template().get('resources'));
        topology.setOnResourceClick(onResourceClick);
        topology.setOnLinkCreatorCreate(function (source, target) {
            if (source.canConnectTo(target)) {
                source.connectTo(target);
            } else {
                sidePanel.showLinkCreatePanel(source, target);
                navbar.clearActiveTab();
            }
        });
        navbar.clickTab(0);

        return self;
    },
    getSidePanel: function () {
        return this._sidePanel;
    },
    getSourcePanel: function () {
        return this._sourcePanel;
    },
    getTopology: function () {
        return this._topology;
    },
    getTemplate: function () {
        return this._template;
    }
});

$(function () {
    var resourceTypeObj,
        neededResources = [];

    function main() {
        createHOT(resourceTypeObj);
        APP = HotUI.App.create();
    }

    try {
        resourceTypeObj = JSON.parse(localStorage.getItem('resourceTypes'));
        if (resourceTypeObj === null || typeof resourceTypeObj !== 'object' ||
                resourceTypeObj instanceof Array) {
            resourceTypeObj = {};
        }
    } catch (e) {
        resourceTypeObj = {};
    }

    HOTUI_RESOURCE_NAMES.forEach(function (type) {
        if (!resourceTypeObj.hasOwnProperty(type)) {
            neededResources.push(type);
        }
    });

    if (neededResources.length > 0) {
        $.ajax({
            url: ENDPOINTS.resourceTypeShow + STACK_REGION + '/' +
                neededResources.join(','),
            success: function(data) {
                Object.keys(data).forEach(function (type) {
                    resourceTypeObj[type] = data[type];
                });

                localStorage.setItem('resourceTypes',
                                     JSON.stringify(resourceTypeObj));
                main();
            }
        });
    } else {
        main();
    }
});
