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

HotUI.Navbar = BaseObject.extend({
    create: function (templates, $container, tabs, buttons) {
        var self = this.extend({});

        self._tabs = tabs;
        self._buttons = buttons;
        self._activeTab = ko.observable();

        $container.append(
            '<div class="hb_left_side" data-bind="foreach2: _tabs">' +
                '<div class="nav_button" ' +
                     'data-bind="' +
                        'css: {active: $p._isActive.bind($p, $data)()}, ' +
                        'click: $p.clickTab.bind($p, $data), ' +
                        'text: label">' +
                '</div>' +
            '</div>',
            '<div class="hb_right_side" data-bind="foreach2: _buttons">' +
                '<div class="nav_button" ' +
                     'data-bind="' +
                        'click: $p.clickButton.bind($p, $data), ' +
                        'text: label">' +
                '</div>' +
            '</div>');

        ko.applyBindings(self, $container[0]);
        return self;
    },
    _isActive: function (tab) {
       return this._activeTab() === tab;
    },
    clickTab: function (tab) {
        if (typeof tab === 'number') {
            tab = this._tabs[tab];
        }
        this._activeTab(tab);
        tab.action();
    },
    clickButton: function (btn) {
        if (typeof btn === 'number') {
            btn = this._buttons[btn];
        }
        btn.action();
    },
    clearActiveTab: function () {
        this._activeTab(null);
    }
});
