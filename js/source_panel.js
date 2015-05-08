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

HotUI.SourcePanel = BaseObject.extend({
    create: function (templates, $container) {
        var self = this.extend({
                _$container: $container,
                _templates: templates,
                _visible: ko.observable(false),
                _expanded: ko.observable(false),
                _lastWidth: this._normalWidth
            }),
            updateYAML = self._updateYAML.bind(self),
            $textarea = $('<textarea></textarea>');

        $container.append($textarea,
            '<div class="hb_side_buttons" ' +
                 'data-bind="css: {hb_invisible: !_visible()}">' +
                '<div class="hb_expand" data-bind="text: _getExpandText(), ' +
                                            'click: toggleExpand"></div>' +
                '<div class="hb_save" data-bind="click: updateTemplate">' +
                    'Update Topology</div>' +
                '<div class="hb_showhide" ' +
                     'data-bind="text: _getShowText(), ' +
                                'click: toggleVisible"></div>' +
            '</div>');

        self._cm = CodeMirror.fromTextArea($textarea[0], {
            lineNumbers: true,
            lineWrapping: true,
            mode: "yaml",
            theme: "tomorrow-night-eighties",
            tabindex: -1,
        });

        templates.on('change', function (type, index, newTemp, oldTemp) {
            if (type === 'set' && index === 0) {
                oldTemp.off('change', updateYAML);
                oldTemp.off('childChange', updateYAML);
                newTemp.on('change', updateYAML);
                newTemp.on('childChange', updateYAML);
                updateYAML();
            }
        });

        ko.applyBindings(self, $container[0]);
        return self;
    },
    _normalWidth: 450,
    _updateYAML: function () {
        $.ajax({
            type: 'POST',
            url: ENDPOINTS.jsonToYAML,
            data: {json: JSON.stringify(this.template().toJSON(true))},
            success: function (data) {
                this._cm.setValue(data);
            }.bind(this)
        });
    },
    _getExpandText: function () {
        return this._expanded() ? 'Collapse' : 'Expand';
    },
    _getShowText: function () {
        return this._visible() ? 'Hide Template' : 'Show Template';
    },
    template: function () {
        return this._templates.get(0);
    },
    updateTemplate: function () {
        $.ajax({
            type: 'POST',
            url: ENDPOINTS.yamlToJSON,
            data: {yaml: this._cm.getValue()},
            success: function (data) {
                this._templates.set(0, data);
            }.bind(this)
        });
    },
    toggleVisible: function () {
        if(this._visible()) { this.hide(); } else { this.show(); }
    },
    hide: function () {
        this._visible(false);
        this._$container
            .css({
                left: 'auto',
                width: this._lastWidth
            })
            .animate({width: 0}, 500)
            .addClass('hb_invisible')
            .removeClass('hb_visible')
            .css('overflow', 'visible');
    },
    show: function () {
        this._$container
            .animate({width: this._lastWidth}, 500, function () {
                if (this._expanded()) {
                    this._$container.css({
                        left: 400,
                        width: 'auto'
                    });
                }
                this._visible(true);
            }.bind(this))
            .addClass('hb_visible')
            .removeClass('hb_invisible')
            .css('overflow', 'visible');
    },
    toggleExpand: function () {
        if(this._expanded()) { this.collapse(); } else { this.expand(); }
    },
    collapse: function () {
        this._expanded(false);
        this._$container.css({
            left: 'auto',
            width: this._$container.parent().width() - 400
        }).animate({
            width: this._normalWidth
        }, {
            duration: 400,
            complete: function () {
                this._lastWidth = this._normalWidth;
            }.bind(this)
        });
    },
    expand: function () {
        this._expanded(true);
        this._$container.animate({
            width: this._$container.parent().width() - 400
        }, {
            duration: 400,
            complete: function () {
                this._lastWidth = this._$container.width();
                this._$container.css({
                    left: 400,
                    width: 'auto'
                });
            }.bind(this)
        });
    }
});
