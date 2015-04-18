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

HotUI.Panel = {};

HotUI.Panel.Base = HotUI.UI.Base.extend({
    create: function () {
        return this.extend({});
    }
});

HotUI.Panel.ResourceDetail = HotUI.Panel.Base.extend({
    create: function (resource, template) {
        var self = this.extend({
                _resource: resource,
                _template: template
            });
        return self;
    },
    _doHTML: function () {
        this._$html = $('<div></div>');
        return this._$html;
    },
    _finishHTML: function () {
        var self = this,
            resource = this._resource,
            $html = this._$html,
            backingType = resource.get('properties').getBackingType(),
            attributesHTML = this._getAttributesHTML(resource.getAttributes()),
            resourceControl = HotUI.UI.FormControl(resource, {
                'template': this._template
            }),
            $resourceID = $(Snippy(
                '<input class="resource_id" type="text" value="${0}">')([
                    resource.getID()])),
            $deleteResourceButton = $('<a class="delete_resource">Delete</a>');

        $resourceID.on('blur', function () {
            resource.setID($resourceID.val());
        });

        $deleteResourceButton.click(function () {
            var i,
                resources = self._template.get('resources');

            for (i = 0; i < resources.length(); i++) {
                if (resources.get(i).getID() === resource.getID()) {
                    resources.remove(i);
                }
            }
            $html.empty();
        });

        $html.append(
            $('<h2></h2>').append($resourceID),
            $(Snippy('<br><a href="${0}" target="_blank">Docs</a><br>')
                 ([resource.getDocsLink()])),
            $deleteResourceButton,
            '<hr>',
            'Attributes:<br>' + (attributesHTML || 'None<br>'),
            '<hr>',
            resourceControl.html());
    },
    _getAttributesHTML: function (attributes) {
        return attributes.sort(function (attr1, attr2) {
                return attr1.getID().localeCompare(attr2.getID());
            }).map(function (attribute) {
                return '<b>' + attribute.getID() + '</b> - ' +
                       attribute.get('description').get();
            }).join("<br>");
    },
});
