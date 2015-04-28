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

HotUI.UI = (function (hot) {
    var ui = {};

    ui.FormControl = function (data, parameters) {
        if (typeof parameters === 'undefined') {
            parameters = {
                nestingLevel: 1,
                template: null
            };
        }

        if (!('template' in parameters)) {
            parameters.template = null;
        }

        if (data.instanceof(hot.ResourcePropertyWrapper)) {
            return ui.ResourceProperty.create(data, parameters);
        } else if (data.instanceof(hot.IntrinsicFunction)) {
            return ui.IntrinsicFunction.create(data, parameters);
        } else if (data.instanceof(hot.ParameterConstraint)) {
            return ui.ParameterConstraint.create(data, parameters);
        } else if (data.instanceof(hot.Primitive)) {
            return ui.PrimitiveSelector.create(data, parameters);
        } else {
            return ui.NormalFormControl(data, parameters);
        }
    };

    ui.NormalFormControl = function (data, parameters) {
        var type = data.getPrimitiveType();

        if (typeof parameters === 'undefined') {
            parameters = {
                nestingLevel: 1,
                template: null
            };
        }

        if (!('template' in parameters)) {
            parameters.template = null;
        }

        if (data.instanceof(Barricade.Container)) {
            if (data.instanceof(Barricade.Array)) {
                return ui.Array.create(data, parameters);

            } else if (data.instanceof(Barricade.MutableObject)) {
                return ui.MutableObject.create(data, parameters);

            } else if (data.instanceof(Barricade.ImmutableObject)) {
                return ui.ImmutableObject.create(data, parameters);
            }
        } else {
            if (type === String) {
                return ui.String.create(data);
            } else if (type === Boolean) {
                return ui.Boolean.create(data);
            } else if (type === Array || type === Object) {
                return ui.SchemalessContainer.create(data);
            } else if (type === Number) {
                return ui.Number.create(data);
            }
        }

        throw new Error('no suitable control found');
    };

    ui.Base = BaseObject.extend({
        create: function () {
            return this.extend({
                    _childControllers: []
                });
        },
        addChildController: function (c) {
            return this._childControllers.push(c) - 1;
        },
        _finishHTML: function () { },
        html: function (parentController) {
            var $domElement = this._doHTML(),
                controllerNum;

            this._finishHTML();

            if (parentController) {
                controllerNum = parentController.addChildController(this);
                return [
                    Snippy('<!-- ko with: _childControllers[${0}] -->')([
                        controllerNum]),
                    $domElement,
                    '<!-- /ko -->'
                ];
            } else {
                ko.applyBindings(this, $domElement[0]);
                return $domElement;
            }
        }
    });

    ui.Snippet = ui.Base.extend({
        create: function (htmlSnippet, observers) {
            var self = ui.Base.create.call(this);
            self._snippet = htmlSnippet;
            Object.keys(observers).forEach(function (key) {
                self[key] = observers[key];
            });
            return self;
        },
        _doHTML: function () {
            return $(this._snippet);
        }
    });

    ui.Selector = ui.Base.extend({
        create: function (options) {
            var self = ui.Base.create.call(this),
                dummy = ko.observable();

            self.value = ko.computed({
                read: function () {
                    dummy();
                    return self._val;
                },
                write: function (val) {
                    self._val = val;
                    dummy.notifySubscribers();
                }
            });

            self._options = options;
            self._val = options[0];

            return self;
        },
        _doHTML: function () {
            return $('<select data-bind="options: _options, value: value">' +
                     '</select>');
        }
    });

    ui.Accordion = ui.Base.extend({
        create: function (sections) {
            var self = ui.Base.create.call(this);
            self._sections = sections;
            self._activeSec = null;
            self._$sectionContents = [];
            return self;
        },
        _doHTML: function () {
            var self = this,
                $html = $('<div class="hb_accordion"></div>'),
                sections;

            sections = this._sections.map(function (s, i) {
                var $label = $(Snippy(
                        '<div class="hb_label">' +
                            '<div class="hb_collapsed_icon">&#9656;</div>' +
                            '<div class="hb_expanded_icon">&#9662;</div>' +
                            ' ${label}' +
                        '</div>')({label: s.label})),
                    $content = $('<div class="hb_content"></div>')
                        .append(s.element.html(self));

                $label.click(function () {
                    self.clickLabel(i);
                });

                self._$sectionContents.push($content);

                return $('<div class="hb_section hb_collapsed"></div>')
                    .append($label, $content);
            });
            return $html.append(sections);
        },
        closeSection: function (i) {
            if (i !== null) {
                this._$sectionContents[i].animate({
                    height: 'hide',
                    duration: 500
                })
                .parent().removeClass('hb_expanded')
                         .addClass('hb_collapsed');
                this._activeSec = null;
            }
        },
        openSection: function (i) {
            this._$sectionContents[i].animate({
                height: 'show',
                duration: 500
            })
            .parent().removeClass('hb_collapsed')
                     .addClass('hb_expanded');

            this._activeSec = i;
        },
        clickLabel: function (labelNum) {
            var shouldOpen = this._activeSec !== labelNum;

            this.closeSection(this._activeSec);

            if (shouldOpen) {
                this.openSection(labelNum);
            }
        }
    });

    ui.MultiControl = ui.Base.extend({
        create: function (data, parameters) {
            var self = ui.Base.create.call(this, data, parameters);

            self._data = data;
            self._parameters = parameters;

            self.value = ko.computed({
                read: function () {
                    var i;

                    for (i = 0; i < self._types.length; i++) {
                        if (data.instanceof(self._types[i].type)) {
                            return self._types[i].type;
                        }
                    }
                },
                write: function (newVal) {
                    data.emit('replace', newVal.create());
                }
            });

            return self;
        },
        _doHTML: function () {
            var self = this,
                data = this._data,
                parameters = this._parameters,
                innerControl,
                $element;

            function getSelect() {
                return '<select data-bind="options: _types, ' +
                                          'optionsText: \'label\', ' +
                                          'optionsValue: \'type\', ' +
                                          'value: value">' +
                       '</select>';
            }

            function getInnerControl() {
                var i;

                for (i = 0; i < self._types.length; i++) {
                    if (data.instanceof(self._types[i].type)) {
                        // REFACTOR EVENTUALLY, ONLY .CREATE SHOULD BE USED
                        if (typeof ui[self._types[i].control] ===
                                'function') {
                            return ui[self._types[i].control](data,
                                                                 parameters);
                        } else {
                            return ui[self._types[i].control]
                                       .create(data, parameters);
                        }
                    }
                }
            }

            this._finishHTML = function () {
                innerControl = getInnerControl();
                $element.append(innerControl.html(this));
            };

            $element = $('<div class="' + this._cssClass + '"></div>')
                           .append(getSelect(), '<br>');
            return $element;
        }
    });

    ui.Primitive = ui.Base.extend({
        create: function (data, writeFunc) {
            var self = ui.Base.create.call(this),
                dummy = ko.observable(),
                validDummy = ko.observable();

            self.value = ko.computed({
                read: function () {
                    dummy();
                    return data.get();
                },
                write: function (value) {
                    writeFunc.call(data, value);
                }
            });

            self.valid = ko.computed({
                read: function () {
                    validDummy();
                    return data.getError();
                }
            });

            data.on('change', function () {dummy.notifySubscribers();});
            data.on('validation', function () {
                validDummy.notifySubscribers();
            });

            return self;
        },
        _doHTML: function () {
            return $('<div><p class="hb_invalid" data-bind="text: valid">' +
                     '</p></div>');
        }
    });

    ui.String = ui.Primitive.extend({
        create: function (data) {
            var self = ui.Primitive.create.call(this, data, data.set);
            return self;
        },
        _doHTML: function () {
            return ui.Primitive._doHTML.call(this)
                .append('<input class="StringControl" type="text" ' +
                        'data-bind="value: value">');
        }
    });

    ui.Number = ui.Primitive.extend({
        create: function (data) {
            var self = ui.Primitive.create.call(this, data,
                                                          function (value) {
                                                              data.set(+value);
                                                          });
            return self;
        },
        _doHTML: function () {
            return ui.Primitive._doHTML.call(this)
                .append('<input type="number" data-bind="value: value">');
        }
    });

    ui.Boolean = ui.Primitive.extend({
        create: function (data) {
            var self = ui.Primitive.create.call(this, data, data.set);
            return self;
        },
        _doHTML: function () {
            return $('<input type="checkbox" class="BooleanControl" ' +
                     'data-bind="checked: value">');
        }
    });

    ui.Container = ui.Base.extend({
        create: function (data, parameters) {
            var self = ui.Base.create.call(this);

            self.level = parameters.nestingLevel || 1;
            self._elements = ko.observableArray();

            function getUIElement(key, value, startCollapsed) {
                var control = ui.FormControl(value, {
                        'template': parameters.template,
                        'nestingLevel': self.level + 1,
                    });
                
                ui.ContainerElement.call(control, value,
                                                   self._getKey(key), data, 
                                                   startCollapsed);
                return control;
            }

            self._doEach(data, function (key, val) {
                self._elements.push({
                    control: getUIElement(key, val),
                    value: val
                });
            });

            data.on('change', function (changeType, index) {
                if (changeType === 'remove') {
                    self._elements.splice(index, 1);
                } else if (changeType === 'add') {
                    self._elements.push({
                        control: getUIElement(index, data.get(index)),
                        value: data.get(index)
                    });
                }
            });

            data.on('change', function (changeType, key, newValue, oldValue) {
                var i;
                if (changeType === 'set') {
                    for (i = 0; i < self._elements().length; i++) {
                        if (self._elements()[i].value === oldValue) {

                            self._elements.splice(i, 1, {
                                control: getUIElement(key, newValue, false),
                                value: newValue
                            });
                        }
                    }
                }
            });

            return self;
        },
        _getKey: function (key) {
            return key;
        },
        _doReplace: function (domElement, arrayElement) {
            var $el = arrayElement.control.html();

            $(domElement).append($el);
        },
        _doEach: function (data, func) {
            data.each(func);
        },
        _doHTML: function () {
            return $('<div class="Container level' + this.level + '">' +
                         '<div class="elements" data-bind="foreach: { ' +
                             'data: _elements, afterRender: _doReplace }">' +
                                 '<div></div>' +
                         '</div>' +
                     '<div>');
        }
    });

    ui.ImmutableObject = ui.Container.extend({
        _doEach: function (data, func) {
            data.each(func, function (key1, key2) {
                var val1 = data.get(key1),
                    val2 = data.get(key2);

                if (val1.isRequired() !== val2.isRequired()) {
                    return val1.isRequired() ? -1 : 1;
                } else if (val1.isUsed() !== val2.isUsed()) {
                    return val1.isUsed() ? -1 : 1;
                } else {
                    return key1.localeCompare(key2);
                }
            });
        }
    });

    ui.MutableContainer = ui.Container.extend({
        _doHTML: function () {
            var $html = ui.Container._doHTML.call(this);

            $html.append('<div data-bind="click: addElement"><a>Add</a></div>');
            return $html;
        }
    });

    ui.MutableObject = ui.MutableContainer.extend({
        create: function (data, parameters) {
            var self = ui.MutableContainer
                            .create.call(this, data, parameters);
            self.addElement = function () {
                data.push(undefined, {id: 'Untitled'});
            };
            return self;
        }
    });

    ui.Array = ui.MutableContainer.extend({
        create: function (data, parameters) {
            var self = ui.MutableContainer
                            .create.call(this, data, parameters);
            self.addElement = function () {
                data.push();
            };
            return self;
        },
        _getKey: function (index) {
            return "#" + (index + 1);
        }
    });

    ui.ContainerElement = Barricade.Blueprint.create(
        function (data, label, _parent, startCollapsed) {
            var self = this,
                oldDoHTML = this._doHTML,
                $element,
                idDummy = ko.observable(),
                isFunctionTypeDummy = ko.observable(),
                isUsedDummy = ko.observable();

            function hasEditableTitle() {
                return data.hasID();
            }

            function prettify(s) {
                return s.replace(/_/g, ' ') // snake_case -> snake case
                        // camelCase -> camel Case
                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                        // ACRONYMWord -> ACRONYM Word
                        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
                        // word -> Word
                        .replace(/\b[a-z]/g, function (match) {
                            return match.toUpperCase();
                        })
                        // Capitalize common acronyms
                        .replace(/\b(uuid|id|ip|dns|ttl|url|ssl|vpc)\b/gi,
                                 function (match) {
                            return match.toUpperCase();
                        })
                        .replace(/\bips\b/gi, "IPs");
            }

            function getFunctionButton() {
                return '<span class="use_function_button" ' +
                               'data-bind="visible: isValue, css: { ' +
                                   'isFunction: isFunctionType ' +
                               '}">' +
                           '<span class="to_function" ' +
                                  'data-bind="visible: !isFunctionType(), ' +
                                              'click: clickToFunctionButton, ' +
                                              'clickBubble: false">' +
                                  'f&hellip;</span>' +
                           '<span class="to_normal" ' +
                                  'data-bind="visible: isFunctionType, ' +
                                              'click: clickToNormalButton, ' +
                                              'clickBubble: false">' +
                                  'f&hellip;</span>' +
                       '</span>';
            }

            function titleHTML() {
                var $title = $('<div class="title" ' +
                               'data-bind="click: toggleCollapsed">' +
                               '<div class="collapse_button">[-]</div>' +
                               '<div class="expand_button">[+]</div>' +
                               '</div>');

                if (!data.isRequired()) {
                    $title.append('<input type="checkbox" ' +
                                  'data-bind="checked: isUsed, ' +
                                  'click: clickIsUsed, clickBubble: false">');
                }

                if (hasEditableTitle()) {
                    $title.append(
                        '<span class="when_collapsed" data-bind="text: id">' +
                        '</span>' +
                        '<div class="when_expanded" ' +
                                'data-bind="visibility: !isCollapsed()">' +
                            '<input type="text" ' +
                                'data-bind="value: id, click: click, ' +
                                'clickBubble: false"></div>');
                } else {
                    $title.append('<span data-bind="text: id"></span>');
                }

                if (data.instanceof(hot.ResourcePropertyWrapper) &&
                        data.hasDescription()) {
                    $title.append('<sup><a href="#" ' +
                                  'title="' + data.getDescription() + '">' +
                                  '[?]</a></sup>');
                }

                $title.append(getFunctionButton());

                if (_parent.instanceof(Barricade.MutableObject) ||
                        _parent.instanceof(Barricade.Array)) {
                    $title.append('<div class="delete_button" ' +
                                  'data-bind="click: deleteSelf">x</div>');
                }

                return $title;
            }

            function bodyHTML() {
                return oldDoHTML.call(self).addClass('element_body');
            }

            this.isValue = ko.computed(function () {
                return data.instanceof(hot.ResourcePropertyWrapper);
            });

            this.isFunctionType = ko.computed(function () {
                isFunctionTypeDummy();
                return self.isValue() && 
                       data.getValue().instanceof(hot.IntrinsicFunction);
            });

            this.id = ko.computed({
                read: function () {
                    idDummy();
                    return hasEditableTitle() ? data.getID() : prettify(label);
                },
                write: function (value) {
                    if (hasEditableTitle()) {
                        data.setID(value);
                    }
                }
            });

            this.isUsed = ko.computed(function () {
                isUsedDummy();
                return data.isUsed();
            });

            data.on('change', function (type) {
                if (type === 'id') {
                    idDummy.notifySubscribers();
                }

                isUsedDummy.notifySubscribers();
                isFunctionTypeDummy.notifySubscribers();
            });

            // Starts collapsed unless specifically set to false
            this.isCollapsed = ko.observable(startCollapsed !== false);

            this.toggleCollapsed = function () {
                this.isCollapsed(!this.isCollapsed());
            };

            this.click = function () {
                console.log('click');
                return true;
            };

            this.clickIsUsed = function () {
                data.setIsUsed(!data.isUsed());
                isUsedDummy.notifySubscribers();
                console.log('isUsed is now ' + data.isUsed());
                return true;
            };

            this.clickToFunctionButton = function () {
                console.log('to function');
                data.toIntrinsicFunction();
                this.isCollapsed(false);
            };

            this.clickToNormalButton = function () {
                console.log('to normal');
                data.toNormal();
                this.isCollapsed(false);
            };

            this.deleteSelf = function () {
                _parent.toArray().forEach(function (val, i) {
                    if (data === val) {
                        _parent.remove(i);
                    }
                });
            };

            this._doHTML = function () {
                $element = $('<div class="ElementWrapper" data-bind="css: { ' +
                     'collapsed: isCollapsed(), unused: !isUsed() }"></div>');

                $element.append(titleHTML(), bodyHTML());

                return $element;
            };
        });

    ui.ResourceProperty = ui.Base.extend({
        create: function (data, parameters) {
            var self = ui.Base.create.call(this, data, parameters),
                $element,
                innerControl = ui.FormControl(data.getValue(), parameters);

            self._finishHTML = function () {
                $element.append(innerControl.html(this));
            };

            self._doHTML = function () {
                $element = $('<div class="ResourcePropertyControl">' +
                         '</div>');

                return $element;
            };

            data.on('change', function () {
                innerControl = ui.FormControl(data.getValue(), parameters);
                $element.empty().append(innerControl.html(this));
            });

            return self;
        }
    });

    ui.IntrinsicFunction = ui.Base.extend({
        create: function (data, parameters) {
            var self = ui.Base.create.call(this, data, parameters),
                innerControl = ui.FunctionSelect.create(data, parameters);

            self._doHTML = function () {
                var $innerControl = $('<div class="inner_control"></div>');

                self._finishHTML = function () {
                    $innerControl.append(innerControl.html(this));
                };

                return $('<div class="IntrinsicFunctionControl"></div>')
                           .append($innerControl);
            };

            return self;
        }
    });

    ui.PrimitiveSelector = ui.MultiControl.extend({
        _cssClass: 'PrimitiveSelector',
        _types: [
            {
                label: 'Boolean',
                type: hot.Primitive.bool,
                control: 'Boolean'
            }, {
                label: 'List',
                type: hot.Primitive.array,
                control: 'Array'
            }, {
                label: 'Map',
                type: hot.Primitive.object,
                control: 'MutableObject'
            }, {
                label: 'Number',
                type: hot.Primitive.number,
                control: 'Number'
            }, {
                label: 'String',
                type: hot.Primitive.string,
                control: 'String'
            }
        ]
    });

    ui.SchemalessContainer = ui.Base.extend({
        create: function (data, parameters) {
            var self = ui.Base.create.call(this, data, parameters),
                barricadeData = hot.Primitive.Factory(data.get()),
                innerControl = ui.NormalFormControl(barricadeData,
                                                       parameters);

            barricadeData.on('childChange', function () {
                data.set(barricadeData.toJSON());
            });

            barricadeData.on('change', function () {
                data.set(barricadeData.toJSON());
            });

            self._doHTML = function () {
                var $element = $('<div></div>');

                self._finishHTML = function () {
                    $element.append(innerControl.html(this));
                };

                return $element;
            };

            return self;
        }
    });

    ui.FunctionSelect = ui.MultiControl.extend({
        _cssClass: 'FunctionSelect',
        _types: [
            {
                label: 'Attribute',
                type: hot.GetAttribute,
                control: 'GetAttribute'
            }, {
                label: 'File',
                type: hot.GetFile,
                control: 'GetFile'
            }, {
                label: 'Parameter',
                type: hot.GetParameter,
                control: 'GetParameter'
            }, {
                label: 'Resource',
                type: hot.GetResource,
                control: 'GetResource'
            }, {
                label: 'Resource Facade',
                type: hot.ResourceFacade,
                control: 'ResourceFacade'
            }, {
                label: 'String Replace',
                type: hot.StringReplace,
                control: 'StringReplace'
            }, {
                label: 'Special Parameter',
                type: hot.GetParameterSpecial,
                control: 'GetParameterSpecial'
            }
        ]
    });

    ui.GetAttribute = ui.Base.extend({
        create: function (data, parameters) {
            var self = ui.Base.create.call(this),
                attr = data.get('get_attr'),
                resourceControl,
                valueControl,
                $element,
                $attributeSelect,
                $valueControl;
                
            resourceControl = ui.ResourceSelect.create(
                function () {
                    return attr.get('resource');
                },
                function (newVal) {
                    attr.set('resource', newVal);
                },
                parameters.template.get('resources'));

            function getAttributeSelect() {
                var resource = attr.get('resource'),
                    options;

                if (resource.getPrimitiveType() === String) {
                    return '';
                } else {
                    options = resource.getAttributeNames().sort();
                    options.unshift('Select Attribute...');
                    options = options.map(function (option) {
                                  return '<option value="' + option + '"' +
                                      (option === attr.get('attribute').get()
                                         ? ' selected'
                                         : '') +
                                      '>' + option + '</option>';
                              })
                              .join('');

                    return $('<select></select>').append(options);
                }
            }

            function getValueHTML() {
                if (attr.get('attribute').get() === '') {
                    valueControl = null;
                    return '';
                } else {
                    valueControl = ui.SchemalessContainer.create(
                                        attr.get('value'));
                    return valueControl.html(self);
                }
            }

            function getInnerHTML() {
                return [
                    resourceControl.html(self),
                    $('<div class="attribute_select"></div>')
                        .append(getAttributeSelect()),
                    $('<div class="value_control"><div>')
                        .append(getValueHTML())
                ];
            }

            self.attach = function ($el) {
                $element = $el;
                $attributeSelect = $element.children('.attribute_select');
                $valueControl = $element.children('.value_control');

                function attachAttributeSelect() {
                    var $select = $attributeSelect.children('select');

                    $select.on('change', function () {
                        if (attr.get('resource').getAttributeNames()
                                .indexOf($select.val()) > -1) {
                            attr.set('attribute', $select.val());
                        } else {
                            attr.set('attribute', '');
                            $attributeSelect.html(getAttributeSelect());
                            attachAttributeSelect();
                        }

                        $valueControl.html(getValueHTML());
                    });
                }

                $element.find('.ResourceSelectControl select')
                        .on('change', function () {
                            attr.set('attribute', '');
                            attr.set('value', []);

                            $attributeSelect.html(getAttributeSelect());
                            $valueControl.html(getValueHTML());
                            attachAttributeSelect();
                        });

                attachAttributeSelect();
            };

            self.html = function () {
                var $el = $('<div class="GetAttributeControl"></div>')
                           .append(getInnerHTML());
                this.attach($el);
                return $el;
            };

            return self;
        }
    });

    ui.GetFile = ui.String.extend({
        create: function (data, parameters) {
            return ui.String.create.call(
                this, data.get('get_file'), parameters);
        }
    });

    ui.GetParameter = ui.Base.extend({
        create: function (data, parametersIn) {
            var self = ui.Base.create.call(this),
                parameters = parametersIn.template.get('parameters'),
                $element,
                $select;

            function getResourceID() {
                var parameter = data.get('get_param');

                if (parameter.getPrimitiveType() === String) {
                    return '';
                } else {
                    return parameter.getID();
                }
            }

            function getSelect() {
                var options = parameters.getIDs()
                                  .sort(function (a, b) {
                                      return a.localeCompare(b);
                                  });

                options.unshift('Select Parameter...');

                options = options.reduce(function (prev, cur) {
                        return prev + '<option value="' + cur + '"' +
                            (cur === getResourceID() ? ' selected' : '') +
                            '>' + cur + '</option>';
                    }, '');

                return $('<select></select>').append(options);
            }

            function getInnerHTML() {
                return getSelect();
            }

            self.attach = function ($el) {
                $element = $el;
                $select = $element.children('select');

                $select.on('change', function () {
                    var parameter = parameters.getByID($select.val());

                    if (parameter) {
                        data.set('get_param', parameter);
                    } else {
                        data.set('get_param', '');
                        $element.html(getInnerHTML());
                    }
                });
            };

            self.html = function () {
                var $el = $('<div class="GetParameterControl"></div>')
                              .append(getInnerHTML());
                this.attach($el);
                return $el;
            };

            return self;
        }
    });

    ui.GetParameterSpecial = ui.String.extend({
        create: function (data, parameters) {
            return ui.String.create.call(this, data.get('get_param'),
                                         parameters);
        }
    });

    ui.ResourceSelect = ui.Base.extend({
        create: function (getter, setter, resources) {
            var self = ui.Base.create.call(this),
                $element,
                $select;

            function getResourceID() {
                var res = getter();

                if (res.getPrimitiveType() === String) {
                    return '';
                } else {
                    return res.getID();
                }
            }

            function getSelect() {
                var options = resources.getIDs()
                                  .sort(function (a, b) {
                                      return a.localeCompare(b);
                                  });

                options.unshift('Select Resource...');

                options = options.reduce(function (prev, cur) {
                        return prev + '<option value="' + cur + '"' +
                            (cur === getResourceID() ? ' selected' : '') +
                            '>' + cur + '</option>';
                    }, '');

                return $('<select></select>').append(options);
            }

            function getInnerHTML() {
                return getSelect();
            }

            self.attach = function ($el) {
                $element = $el;
                $select = $element.children('select');

                $select.on('change', function () {
                    var resource = resources.getByID($select.val());

                    if (resource) {
                        setter(resource);
                    } else {
                        setter('');
                        $element.html(getInnerHTML());
                    }
                });
            };

            self.html = function () {
                var $el = $('<div class="ResourceSelectControl"></div>')
                           .append(getInnerHTML());
                this.attach($el);
                return $el;
            };

            return self;
        }
    });

    ui.GetResource = ui.ResourceSelect.extend({
        create: function (data, parameters) {
            return ui.ResourceSelect.create.call(
                this,
                function () { return data.get('get_resource'); },
                function (newVal) { data.set('get_resource', newVal); },
                parameters.template.get('resources'));
        }
    });

    ui.ResourceFacade = ui.String.extend({
        create: function (data, parameters) {
            return ui.String.create.call(this, data.get('resource_facade'),
                                         parameters);
        }
    });

    ui.StringReplace = ui.ImmutableObject.extend({
        create: function (data, parameters) {
            return ui.ImmutableObject.create.call(
                this, data.get('str_replace'), parameters);
        }
    });

    ui.ParameterConstraint = ui.MultiControl.extend({
        _cssClass: 'ParameterConstraintControl',
        _types: [
            {
                label: 'Length',
                type: hot.LengthParameterConstraint,
                control: 'ImmutableObject'
            }, {
                label: 'Range',
                type: hot.RangeParameterConstraint,
                control: 'ImmutableObject'
            }, {
                label: 'Allowed Values',
                type: hot.AllowedValuesParameterConstraint,
                control: 'ImmutableObject'
            }, {
                label: 'Allowed Pattern',
                type: hot.AllowedPatternParameterConstraint,
                control: 'ImmutableObject'
            }, {
                label: 'Custom Constraint',
                type: hot.CustomParameterConstraint,
                control: 'ImmutableObject'
            }
        ]
    });

    ui.ResourcePropertyWrapperSelector = ui.Base.extend({
        create: function (resource) {
            var self = ui.Base.create.call(this);
            self._resource = resource;
            return self;
        },
        _doHTML: function () {
            var properties = this._resource.get('properties'),
                $html =
                    $('<div class="ResourcePropertyWrapperSelector"></div>');

            $html.delegate('p', 'click', function (e) {
                var $target = $(e.target);
                $html.find('p.selected').removeClass('selected');
                $target.addClass('selected');
            });

            function appendProperties($div, data) {
                data.each(function (key, value) {
                    var $label = $('<p>' + key + '<p>'),
                        $child = $('<div class="property_list"></div>')
                                     .append($label);
                    if (value.instanceof(hot.ResourcePropertyWrapper) &&
                            value.getValue().instanceof(Barricade.Container) &&
                            !value.getValue()
                                  .instanceof(hot.IntrinsicFunction)) {
                        appendProperties($child, value.getValue());
                    } else if (value.instanceof(Barricade.Container)) {
                        $label.addClass('disabled');
                        appendProperties($child, value);
                    }

                    $div.append($child);
                });
            }

            appendProperties($html, properties);

            this._html = $html;
            
            return $html;
        },
        getSelection: function () {
            var $html = this._html,
                $selected = $html.find('p.selected').parent(),
                curLabel,
                result = [];

            if ($selected.length) {
                while (!$selected.is($html)) {
                    curLabel = $selected.children('p').html();
                    result.unshift(isNaN(+curLabel) ? curLabel : +curLabel);
                    $selected = $selected.parent();
                }
            }

            return result;
        }
    });

    ui.ResAttributeSelector = ui.Base.extend({
        create: function (resource) {
            var self = ui.Base.create.call(this);
            self._resource = resource;
            return self;
        },
        _doHTML: function () {
            var $select = $('<select></select>');
            
            this._resource.getAttributeNames().forEach(function (attribute) {
                $select.append($('<option>' + attribute + '</option>'));
            });

            this._html = $select;
            return $select;
        },
        getSelection: function () {
            return this._html.val();
        }
    });

    ui.Modal = BaseObject.extend({
        create: function (options) {
            var self = this.extend({});

            if (!options.buttons) {
                options.buttons = [{'label': 'Okay'}];
            }
            self._options = options;
            return self;
        },
        display: function () {
            var $container = $('#hb_modal_layer'),
                $buttons = $('<div class="hb_modal_buttons"></div>'),
                $modal = $(Snippy(
                    '<div class="hb_modal ${cssClass}">' +
                        '<div class="hb_modal_title">${title}</div>' +
                        '<div class="hb_modal_content">${content}</div>' +
                    '</div>')(this._options));

            $buttons.append(this._options.buttons.map(function (button) {
                var $button = $(Snippy(
                        '<div class="hb_modal_button ${cssClass}">' +
                        '${label}</div>')(button));

                $button.click(function () {
                    $container.fadeOut(250, function () {
                        $button.remove();
                    });

                    if (button.action) {
                        button.action();
                    }
                });

                return $button;
            }));

            $modal.append($buttons);

            $container.append($modal).fadeIn(250);
        }
    });

    return ui;
}(HotUI.HOT));
