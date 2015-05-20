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
    create: function (templates, $container, $content, $collapse) {
        var self = this.extend({
                _templates: templates,
                _isHidden: ko.observable(false),
                _width: $container.width(),
                _$container: $container,
                _$content: $content,
                _$collapse: $collapse
            });

        $collapse.click(function () {
            if (self._isHidden()) {
                self.show();
            } else {
                self.hide();
            }
        });
        ko.applyBindings(self, $container[0]);
        return self;
    },
    _changeContent: function ($html) {
        this._$content.scrollTop(0);
        this._$content.empty();
        this._$content.append($html);
    },
    _displayPanel: function (panel, shouldAnimate) {
        if (shouldAnimate !== false) {
            this.hide(function () {
                this._changeContent(panel.html());
                this._$container.delay(100);
                this.show();
            }.bind(this));
        } else {
            this._changeContent(panel.html());
        }
    },
    _onResourceDrop: function () {},
    hide: function (onComplete) {
        onComplete = onComplete || function () {};

        if (this._isHidden()) {
            onComplete();
            return;
        }

        this._$container.animate({
            left: -this._width,
            opacity: 0
        }, {
            duration: 300,
            easing: 'linear',
            complete: function () {
                this._$container.css({
                    opacity: 1
                });
                this._isHidden(true);
                onComplete();
            }.bind(this)
        });
    },
    setTemplate: function (newTemplate) {
        this._template = newTemplate;
    },
    setOnResourceDrop: function (callback) {
        this._onResourceDrop = callback;
        return this;
    },
    show: function () {
        this._$container.animate({left: 0}, {duration: 500});
        this._isHidden(false);
    },
    showHome: function () {
        var self = this,
            panel = HotUI.Panel.Home.create(
                this._templates, function () {
                    return self._onResourceDrop.apply(self, arguments);
                });
        this._displayPanel(panel);

    },
    showTemplate: function () {
        this._displayPanel(HotUI.Panel.Template.create(this._templates));
    },
    showResource: function (resource) {
        var panel = HotUI.Panel.ResourceDetail.create(resource, this._template);
        this._displayPanel(panel);
    },
    showLinkCreatePanel: function (sourceResource, targetResource) {
        var panel = HotUI.Panel.LinkCreate.create(sourceResource,
                                                  targetResource);
        this._displayPanel(panel);
    }
});
