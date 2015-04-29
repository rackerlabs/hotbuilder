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
                _visible: false,
                _lastWidth: this._normalWidth
            }),
            showText = 'Show Template',
            hideText = 'Hide Template',
            $textarea = $('<textarea></textarea>'),
            $sideButtons = $('<div class="hb_side_buttons"></div>'),
            $showHide = $('<div class="hb_show">' + showText + '</div>'),
            $save = $('<div class="hb_save">Update Topology</div>'),
            $validate = $('<div class="hb_validate">Validate</div>'),
            $download = $('<div class="hb_download">Download</div>');

        self._$save = $save;
        self._$validate = $validate;
        self._$download = $download;

        $container.append($textarea);

        self._cm = CodeMirror.fromTextArea($textarea[0], {
            lineNumbers: true,
            lineWrapping: true,
            mode: "yaml",
            theme: "tomorrow-night-eighties"
        });

        function updateYAML() {
            return self._updateYAML();
        }

        templates.on('change', function (type, index, newTemp, oldTemp) {
            if (type === 'set' && index === 0) {
                oldTemp.off('change', updateYAML);
                oldTemp.off('childChange', updateYAML);
                newTemp.on('change', updateYAML);
                newTemp.on('childChange', updateYAML);
                updateYAML();
            }
        });

        $showHide.click(function () {
            if (self._visible) {
                $showHide.text(showText);
                self.hide();
            } else {
                $showHide.text(hideText);
                self.show();
            }
        });

        $save.click(function () {
            $.ajax({
                type: 'POST',
                url: ENDPOINTS.yamlToJSON,
                data: {
                    'yaml': self._cm.getValue()
                },
                success: function (data) {
                    templates.set(0, data);
                }
            });
        });

        $download.click(function () {
            var templateJSON = JSON.stringify(self.template().toJSON(true))
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
        });

        $validate.click(function () {
            $.ajax({
                type: 'POST',
                url: ENDPOINTS.templateValidate,
                data: {
                    'endpoint': STACK_ENDPOINT,
                    'template': JSON.stringify(self.template().toJSON(true))
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

        $container.append($sideButtons.append($showHide, $save, $validate,
                                              $download));

        return self;
    },
    _normalWidth: 450,
    _updateYAML: function () {
        var self = this;
        $.ajax({
            type: 'POST',
            url: ENDPOINTS.jsonToYAML,
            data: {
                'json': JSON.stringify(this.template().toJSON(true))
            },
            success: function (data) {
                self._cm.setValue(data);
            }
        });
    },
    template: function () {
        return this._templates.get(0);
    },
    hide: function () {
        var self = this;
        this._$save.fadeOut(250);
        this._$validate.fadeOut(250);
        this._$download.fadeOut(250);
        this._$container
            .animate({width: 0}, 500, function () {
                self._visible = false;
            })
            .addClass('hb_invisible')
            .removeClass('hb_visible')
            .css('overflow', 'visible');
    },
    show: function () {
        var self = this;
        this._$save.fadeIn(250);
        this._$validate.fadeIn(250);
        this._$download.fadeIn(250);
        this._$container
            .animate({width: this._lastWidth}, 500, function () {
                self._visible = true;
            })
            .addClass('hb_visible')
            .removeClass('hb_invisible')
            .css('overflow', 'visible');
    }
});
