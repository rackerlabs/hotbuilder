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
    create: function (templates, $container, $content, $closeButton) {
        var self = this.extend({
                _templates: templates,
                _isHidden: false,
                _$container: $container,
                _$content: $content,
                _$navbar: $container.children('.hotui_side_panel_nav')
            });

        self._setupNav();
        self._$navbar.children('.nav_button').eq(0).trigger('click');

        return self;
    },
    _displayPanel: function (panel) {
        this._$content.scrollTop(0);
        this._$content.empty();
        this._$content.append(panel.html());
    },
    _setupNav: function () {
        var self = this,
            panels = [
                {
                    label: 'Home',
                    panel: HotUI.Panel.Home.create(
                        this._templates, function () {
                            return self._onResourceDrop.apply(self, arguments);
                        })
                }, {
                    label: 'Template',
                    panel: HotUI.Panel.Template.create(this._templates)
                }
            ];

        this._$navbar.append(panels.map(function (p) {
            return $(Snippy('<div class="nav_button">${label}</div>')(p))
                .click(function () {
                    self._displayPanel(p.panel);
                    $(this).addClass('active')
                           .siblings('.active').removeClass('active');
                });
        }));
    },
    _onResourceDrop: function () {},
    setTemplate: function (newTemplate) {
        this._template = newTemplate;
    },
    setOnResourceDrop: function (callback) {
        this._onResourceDrop = callback;
        return this;
    },
    showResource: function (resource) {
        var panel = HotUI.Panel.ResourceDetail.create(resource, this._template);
        this._displayPanel(panel);
        this._$navbar.children('.nav_button.active')
                     .removeClass('active');
    },
    showLinkCreatePanel: function (sourceResource, targetResource) {
        var panel = HotUI.Panel.LinkCreate.create(sourceResource,
                                                  targetResource);
        this._displayPanel(panel);
        this._$navbar.children('.nav_button.active')
                     .removeClass('active');
    }
});
