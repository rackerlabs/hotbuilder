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

HotUI.SidePanelController = (function () {
    function constructor($container, $content, $closeButton) {
        if (!(this instanceof HotUI.SidePanelController)) {
            return new HotUI.SidePanelController($container,
                                                 $content, 
                                                 $closeButton);
        }

        var isHidden = false;

        function displayContent(content) {
            if (isHidden) {
                $container.show();
                isHidden = false;
            }

            $content.scrollTop(0);

            if (typeof content === 'string') {
                $content.html(content);
            } else {
                $content.empty();
                $content.append(content);
            }
        }

        function getAttributesHTML(attributes) {
            return attributes.sort(function (attr1, attr2) {
                    return attr1.getID().localeCompare(attr2.getID());
                }).map(function (attribute) {
                    return '<b>' + attribute.getID() + '</b> - ' + 
                           attribute.get('description').get();
                }).join("<br>");
        }

        this.showResource = function (resource, template) {
            var $html = $('<div></div>');
            var backingType = resource.get('properties').getBackingType();
            var attributesHTML = getAttributesHTML(resource.getAttributes());
            var resourceControl = HotUI.FormControl(resource, {
                    'template': template
                });

            var $resourceID;
            var $deleteResourceButton;

            $html.append($('<h2><input class="resource_id" type="text" ' + 
                      'value="' + resource.getID() + '"></h2>' +
                      '<br><a class="delete_resource">Delete</a>'));
            $html.append('<hr>');
            $html.append('Attributes:<br>' + (attributesHTML || 'None<br>'));
            $html.append('<hr>');
            $html.append(resourceControl.html());

            displayContent($html);

            //resourceControl.attach();

            $resourceID = $content.find('.resource_id');
            
            $resourceID.on('blur', function () {
                resource.setID($resourceID.val());
            });

            $deleteResourceButton = $content.find('.delete_resource');

            $deleteResourceButton.click(function () {
                var i,
                    resources = template.get('resources');

                for (i = 0; i < resources.length(); i++) {
                    if (resources.get(i).getID() === resource.getID()) {
                        resources.remove(i);
                    }
                }
                displayContent('');
            });
        };

        this.displayContent = displayContent;

        this.showParameters = function (parameters) {
            var myControl = HotUI.FormControl(parameters),
                myHTML = [];

            myHTML.push('<h2>Parameters</h2>');
            myHTML.push('<br>');
            myHTML.push(myControl.html());

            displayContent(myHTML);
        };

        this.showOutputs = function (outputs, template) {
            var myControl = HotUI.FormControl(outputs, {
                    'template': template
                }),
                myHTML = [];

            myHTML.push('<h2>Outputs</h2>');
            myHTML.push('<br');
            myHTML.push(myControl.html());

            displayContent(myHTML);
        };

        this.showTemplateOptions = function (heatTemplateVersion,
                                               description) {
            var $html = $('<div></div>'),
                versionControl = HotUI.StringControl.create(
                    heatTemplateVersion,
                    'Heat Template Version'),
                descriptionControl = HotUI.StringControl.create(
                    description,
                    'Description');

            $html.append('<h2>Template Options</h2>Heat Template Version:<br>',
                        versionControl.html(), '<br><br>',
                        'Description:<br>',
                        descriptionControl.html());

            displayContent($html);
        };

        $closeButton.on("click", function () {
            if (!isHidden) {
                $container.hide();
                isHidden = true;
            }
        });
    }

    return constructor;
}());
