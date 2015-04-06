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

$(function () {
    var topology = HotUI.Topology.create($("#hotui_topology")),
        template,
        sidePanelController = HotUI.SidePanelController.create(
                                    $("#hotui_side_panel"),
                                    $("#hotui_side_panel_content"),
                                    $("#hotui_side_panel > .close_button")),
        untitledResources = 0,
        $jsonButton = $("#hotui_overlay > .get_json"),
        $downloadTemplateButton = $("#hotui_overlay > .download_template"),
        $loadFromURLButton = $("#hotui_overlay > .load_from_url");

    function setTemplate(newTemplate) {
        template = newTemplate;
        TEMP = template; // DELETE THIS LINE
        topology.setData(template.get('resources'));
        sidePanelController.setTemplate(template);
    }

    function addResource(x, y, typeIn) {
        var pt = topology.documentToSVGCoords(x, y);

        untitledResources++;

        topology.aboutToAddResource(pt.x, pt.y);
        template.get('resources').push({type: typeIn},
                                       {id: typeIn.replace(/::/g, '') +
                                            untitledResources});
    }

    function onResourceClick(resource) {
        sidePanelController.showResource(resource);
    }

    $(window).unload(function () {
        localStorage.setItem('template', JSON.stringify(template.toJSON()));
    });

    // initialization
    setTemplate(HotUI.HOT.Template.create(
                       JSON.parse(localStorage.getItem('template'))));
    sidePanelController.setOnResourceDrop(addResource);
    sidePanelController.showAddResourcePanel();

    topology.setData(template.get('resources'));
    topology.setOnResourceClick(onResourceClick);
    topology.setOnLinkCreatorCreate(function (source, target) {
        sidePanelController.showLinkCreatePanel(source, target);
    });

    $jsonButton.click(function () {
        $.ajax({
            type: 'POST',
            url: ENDPOINTS.jsonToYAML,
            data: {
                'json': JSON.stringify(template.toJSON(true))
            },
            success: function (data) {
                var box = $('<div id="hotui_json_box"><textarea class="json">' +
                                data.replace(/  /g, '&nbsp;&nbsp;') +
                            '</textarea>' +
                            '<div class="json_close_button">X</div>' +
                            '<div class="validate_button">Validate Template ' +
                                '(after updating template)</div>' +
                            '<div class="update_button">Update Template</div>' +
                            '</div>');

                box.click(function (e) {
                    e.stopPropagation();
                });

                box.children('.json_close_button').click(function (e) {
                    box.remove();
                    e.stopPropagation();
                });

                box.children('.validate_button').click(function (e) {
                    var yaml = box.children('textarea')
                                   .val()
                                   .replace(/\xA0/g, ' '); // Replaces &nbsp;

                    e.stopPropagation();

                    $.ajax({
                        type: 'POST',
                        url: ENDPOINTS.templateValidate,
                        data: {
                            'endpoint': STACK_ENDPOINT,
                            'template': JSON.stringify(template.toJSON(true))
                        },
                        success: function (data) {
                            if (typeof data === 'string') {
                                alert('Validation Failed:\n\n' + data);
                            } else {
                                alert('Validation Passed');
                            }
                        }
                    });
                });

                box.children('.update_button').click(function (e) {
                    var yaml = box.children('textarea')
                                   .val()
                                   .replace(/\xA0/g, ' '); // Replaces &nbsp;

                    e.stopPropagation();

                    $.ajax({
                        type: 'POST',
                        url: ENDPOINTS.yamlToJSON,
                        data: {
                            'yaml': yaml
                        },
                        success: function (data) {
                            setTemplate(HotUI.HOT.Template.create(data));
                            // Update textbox by closing and opening it again
                            // (this also re-retrieves the YAML)
                            box.children('.json_close_button').click();
                            $jsonButton.click();
                        }
                    });
                });

                $jsonButton.append(box);
            }
        });
    });

    $loadFromURLButton.click(function () {
        var $urlInput = $('<div class="load_from_url_input">' +
                '<input type="text">' +
                '<div class="load_button">Load</div>' +
                '<div class="close_button">X</div>' +
                '</div>');

        $urlInput.click(function (e) {
            e.stopPropagation();
        });

        $urlInput.children('.load_button').click(function () {
            $.ajax({
                type: 'GET',
                url: ENDPOINTS.urlToJSON,
                data: {
                    url: $urlInput.children('input').val()
                },
                success: function (data) {
                    console.log(data);

                    if (typeof data === 'string') {
                        alert(data);
                    } else {
                        setTemplate(HotUI.HOT.Template.create(data));
                        $urlInput.children('.close_button').click();
                    }
                }
            });
        });

        $urlInput.children('.close_button').click(function (e) {
            e.stopPropagation();
            $urlInput.remove();
        });

        $loadFromURLButton.append($urlInput);
    });

    $downloadTemplateButton.click(function () {
        var templateJSON = JSON.stringify(template.toJSON(true))
                               .replace(/\"/g, '&quot;'),
            csrf = $("meta[name='csrftoken']").attr('content'),
            $form = $('<form method="POST" action="' + 
                          ENDPOINTS.downloadTemplate + '">' +
                          '<input type="hidden" name="json" ' +
                              'value="' + templateJSON + '">' +
                          '<input type="hidden" name="csrfmiddlewaretoken" ' +
                              'value="' + csrf + '">');
        $form.appendTo('body')
             .submit()
             .remove();
    });
});
