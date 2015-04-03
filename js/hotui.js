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
    var topology = HotUI.Topology.create($("#hotui_topology"));
    var template = HotUI.HOT.Template.create(
                       JSON.parse(localStorage.getItem('template')));

    var sidePanelController = HotUI.SidePanelController.create(
                                    $("#hotui_side_panel"),
                                    $("#hotui_side_panel_content"),
                                    $("#hotui_side_panel > .close_button"));

    var untitledResources = 0;

    var $overlay = $("#hotui_overlay");
    var $sidePanel = $("#hotui_side_panel");
    var $sidePanelContent = $("#hotui_side_panel_content");

    var addResourceText = (function () {
            var html = "";

            html += '<h2>Add Resource</h2>';

            HotUI.HOT.resourceTypes.each(function (i, value) {
                html += "<div class='resource_draggable' type='" + 
                    value.getID() + "'>" +
                        '<div></div>' +
                        value.getID() +
                    "</div>";
            }, function (el1, el2) {
                return el1.getID().localeCompare(el2.getID());
            });

            return html;
    }());
    
    var curActive = addResourceText;
    var curHovering = null;

    var $navUl = $("#hotui_nav > ul");

    $(window).unload(function () {
        localStorage.setItem('template', JSON.stringify(template.toJSON()));
    });

    $("#hotui_nav > ul > li").on("click", function () {
        var $li = $(this);
        var selection = $li.children().html();

        if (selection === "Add Resource") {
            curActive = addResourceText;
            update();
        } else if (selection === "Parameters") {
            sidePanelController.showParameters(template.get('parameters'));
        } else if (selection === "Outputs") {
            sidePanelController.showOutputs(template.get('outputs'),
                                               template);
        } else if (selection === "Template Options") {
            sidePanelController.showTemplateOptions(
                template.get('heat_template_version'),
                template.get('description'));
        }

        $navUl.children(".active").removeClass("active");
        $li.addClass("active");
    });

    function update() {
        if (curHovering) {
            sidePanelController.displayContent(curHovering);
        } else {
            sidePanelController.displayContent(curActive);
        }

        d3.selectAll(".resource_draggable")
            .call(drag); // DELETE EVENTUALLY
    }

    function setTemplate(newTemplate) {
        template = newTemplate;
        TEMP = template; // DELETE THIS LINE
        topology.setData(template.get('resources'));
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
        $navUl.children(".active").removeClass("active");
        sidePanelController.showResource(resource, template);
    }

    var drag = d3.behavior.drag()
            .on("dragstart", function () {
                var $target = $(this),
                    $replacement = $target.clone(),
                    targetOffset = $target.offset(),
                    overlayOffset = $overlay.offset(),
                    targetLeft = targetOffset.left - overlayOffset.left,
                    targetTop = targetOffset.top - overlayOffset.top,
                    posDoc = d3.mouse($('body')[0]),
                    pos = d3.mouse($overlay[0]);

                d3.select($replacement[0]).call(drag); // Attach handler

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
            })
            .on("drag", function () {
                var $target = $(this);
                var pos = d3.mouse($overlay[0]);
                
                $target.css({
                    'left': pos[0] - 15,
                    'top': pos[1] - 15
                });
            })
            .on("dragend", function () {
                var $target = $(this),
                    posDoc = d3.mouse($('body')[0]);

                function outsideSidePanel() {
                    var pos = d3.mouse($sidePanel[0]);
                    return pos[0] < 0 || pos[0] > $sidePanel.width() ||
                           pos[1] < 0 || pos[1] > $sidePanel.height();
                }

                function didNotMove() {
                    return posDoc[0] === +$target.attr("dragStartX") &&
                           posDoc[1] === +$target.attr("dragStartY");
                }

                $sidePanelContent.children(".replacement")
                                   .animate({ opacity: 1 }, 500)
                                   .removeClass("replacement");

                $overlay.children(".resource_draggable").remove();

                if (outsideSidePanel() || didNotMove()) {
                    addResource(posDoc[0], posDoc[1], $target.attr("type"));
                }

            });

    update();

    // initialization
    topology.setData(template.get('resources'));
    topology.setOnResourceClick(onResourceClick);
    topology.setOnLinkCreatorCreate(function (source, target) {
        sidePanelController.showLinkCreatePanel(source, target);
    });

    var $jsonButton = $("#hotui_overlay > .get_json");

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

    var $loadFromURLButton = $("#hotui_overlay > .load_from_url");
    
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

    var $downloadTemplateButton = $("#hotui_overlay > .download_template");

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
