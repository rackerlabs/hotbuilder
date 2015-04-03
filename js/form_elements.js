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
    HotUI.FormControl = function (data, parameters) {
        if (typeof parameters === 'undefined') {
            parameters = {
                nestingLevel: 1,
                template: null
            };
        }

        if (!('template' in parameters)) {
            parameters.template = null;
        }

        if (data.instanceof(HotUI.HOT.ResourcePropertyWrapper)) {
            return HotUI.ResourcePropertyControl.create(data, parameters);
        } else if (data.instanceof(HotUI.HOT.IntrinsicFunction)) {
            return HotUI.IntrinsicFunctionControl.create(data, parameters);
        } else if (data.instanceof(HotUI.HOT.ParameterConstraint)) {
            return HotUI.ParameterConstraintControl.create(data, parameters);
        } else if (data.instanceof(HotUI.HOT.Primitive)) {
            return HotUI.PrimitiveSelectorControl.create(data, parameters);
        } else {
            return HotUI.NormalFormControl(data, parameters);
        }
    };

    HotUI.NormalFormControl = function (data, parameters) {
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
                return HotUI.ArrayControl.create(data, parameters);

            } else if (data.instanceof(Barricade.MutableObject)) {
                return HotUI.MutableObjectControl.create(data, parameters);

            } else if (data.instanceof(Barricade.ImmutableObject)) {
                return HotUI.ImmutableObjectControl.create(data, parameters);
            }
        } else {
            if (type === String) {
                return HotUI.StringControl.create(data);
            } else if (type === Boolean) {
                return HotUI.BooleanControl.create(data);
            } else if (type === Array || type === Object) {
                return HotUI.SchemalessContainerControl.create(data);
            } else if (type === Number) {
                return HotUI.NumberControl.create(data);
            }
        }

        throw new Error('no suitable control found');
    };

    HotUI.BaseControl = BaseObject.extend({
        create: function () {
            return this.extend({});
        },
        _finishHTML: function () { },
        html: function () {
            var $domElement = this._doHTML();
            ko.applyBindings(this, $domElement[0]);
            this._finishHTML();
            return $domElement;
        }
    });

    HotUI.Snippet = HotUI.BaseControl.extend({
        create: function (htmlSnippet, observers) {
            var self = HotUI.BaseControl.create.call(this);
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

    HotUI.Selector = HotUI.BaseControl.extend({
        create: function (options) {
            var self = HotUI.BaseControl.create.call(this),
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

    HotUI.MultiControl = HotUI.BaseControl.extend({
        create: function (data, parameters) {
            var self = HotUI.BaseControl.create.call(this, data, parameters);

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
                        if (typeof HotUI[self._types[i].control] ===
                                'function') {
                            return HotUI[self._types[i].control](data,
                                                                 parameters);
                        } else {
                            return HotUI[self._types[i].control]
                                       .create(data, parameters);
                        }
                    }
                }
            }

            this._finishHTML = function () {
                innerControl = getInnerControl();
                $element.append(innerControl.html());
            };

            $element = $('<div class="' + this._cssClass + '"></div>')
                           .append(getSelect(), '<br>');
            return $element;
        }
    });

    HotUI.PrimitiveControl = HotUI.BaseControl.extend({
        create: function (data, writeFunc) {
            var self = HotUI.BaseControl.create.call(this),
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
            return $('<div><p class="invalid" data-bind="text: valid">' +
                     '</p></div>');
        }
    });

    HotUI.StringControl = HotUI.PrimitiveControl.extend({
        create: function (data) {
            var self = HotUI.PrimitiveControl.create.call(this, data, data.set);
            return self;
        },
        _doHTML: function () {
            return HotUI.PrimitiveControl._doHTML.call(this)
                .append('<input class="StringControl" type="text" ' +
                        'data-bind="value: value">');
        }
    });

    HotUI.NumberControl = HotUI.PrimitiveControl.extend({
        create: function (data) {
            var self = HotUI.PrimitiveControl.create.call(this, data, 
                                                          function (value) {
                                                              data.set(+value);
                                                          });
            return self;
        },
        _doHTML: function () {
            return HotUI.PrimitiveControl._doHTML.call(this)
                .append('<input type="number" data-bind="value: value">');
        }
    });

    HotUI.BooleanControl = HotUI.PrimitiveControl.extend({
        create: function (data) {
            var self = HotUI.PrimitiveControl.create.call(this, data, data.set);
            return self;
        },
        _doHTML: function () {
            return $('<input type="checkbox" class="BooleanControl" ' +
                     'data-bind="checked: value">');
        }
    });

    HotUI.ContainerControl = HotUI.BaseControl.extend({
        create: function (data, parameters) {
            var self = HotUI.BaseControl.create.call(this);

            self.level = parameters.nestingLevel || 1;
            self._elements = ko.observableArray();

            function getUIElement(key, value, startCollapsed) {
                var control = HotUI.FormControl(value, {
                        'template': parameters.template,
                        'nestingLevel': self.level + 1,
                    });
                
                HotUI.ContainerElementControl.call(control, value, 
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

    HotUI.ImmutableObjectControl = HotUI.ContainerControl.extend({
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

    HotUI.MutableContainerControl = HotUI.ContainerControl.extend({
        _doHTML: function () {
            var $html = HotUI.ContainerControl._doHTML.call(this);

            $html.append('<div data-bind="click: addElement"><a>Add</a></div>');
            return $html;
        }
    });

    HotUI.MutableObjectControl = HotUI.MutableContainerControl.extend({
        create: function (data, parameters) {
            var self = HotUI.MutableContainerControl
                            .create.call(this, data, parameters);
            self.addElement = function () {
                data.push(undefined, {id: 'Untitled'});
            };
            return self;
        }
    });

    HotUI.ArrayControl = HotUI.MutableContainerControl.extend({
        create: function (data, parameters) {
            var self = HotUI.MutableContainerControl
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

    HotUI.ContainerElementControl = Barricade.Blueprint.create(
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

                if (data.instanceof(HotUI.HOT.ResourcePropertyWrapper) &&
                        data.hasDescription()) {
                    $title.append('<sup><a href="#" ' +
                                  'title="' + data.getDescription() + '">' +
                                  '[?]</a></sup>');
                }

                $title.append(getFunctionButton());

                if (_parent.instanceof(Barricade.MutableObject) ||
                        _parent.instanceof(Barricade.Array)) {
                    $title.append('<div class="delete_button" ' +
                                  'data-bind="click: deleteSelf">X</div>');
                }

                return $title;
            }

            function bodyHTML() {
                return oldDoHTML.call(self).addClass('element_body');
            }

            this.isValue = ko.computed(function () {
                return data.instanceof(HotUI.HOT.ResourcePropertyWrapper);
            });

            this.isFunctionType = ko.computed(function () {
                isFunctionTypeDummy();
                return self.isValue() && 
                       data.getValue().instanceof(HotUI.HOT.IntrinsicFunction);
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

    HotUI.ResourcePropertyControl = HotUI.BaseControl.extend({
        create: function (data, parameters) {
            var self = HotUI.BaseControl.create.call(this, data, parameters),
                $element,
                innerControl = HotUI.FormControl(data.getValue(), parameters);

            self._finishHTML = function () {
                $element.append(innerControl.html());
            };

            self._doHTML = function () {
                $element = $('<div class="ResourcePropertyControl">' +
                         '</div>');

                return $element;
            };

            data.on('change', function () {
                innerControl = HotUI.FormControl(data.getValue(), parameters);
                $element.empty().append(innerControl.html());
            });

            return self;
        }
    });

    HotUI.IntrinsicFunctionControl = HotUI.BaseControl.extend({
        create: function (data, parameters) {
            var self = HotUI.BaseControl.create.call(this, data, parameters),
                innerControl = HotUI.FunctionControl.create(data, parameters);

            self._doHTML = function () {
                var $innerControl = $('<div class="inner_control"></div>');

                self._finishHTML = function () {
                    $innerControl.append(innerControl.html());
                };

                return $('<div class="IntrinsicFunctionControl"></div>')
                           .append($innerControl);
            };

            return self;
        }
    });

    HotUI.PrimitiveSelectorControl = HotUI.MultiControl.extend({
        _cssClass: 'PrimitiveSelector',
        _types: [
            {
                label: 'Boolean',
                type: HotUI.HOT.Primitive.bool,
                control: 'BooleanControl'
            }, {
                label: 'List',
                type: HotUI.HOT.Primitive.array,
                control: 'ArrayControl'
            }, {
                label: 'Map',
                type: HotUI.HOT.Primitive.object,
                control: 'MutableObjectControl'
            }, {
                label: 'Number',
                type: HotUI.HOT.Primitive.number,
                control: 'NumberControl'
            }, {
                label: 'String',
                type: HotUI.HOT.Primitive.string,
                control: 'StringControl'
            }
        ]
    });

    HotUI.SchemalessContainerControl = HotUI.BaseControl.extend({
        create: function (data, parameters) {
            var self = HotUI.BaseControl.create.call(this, data, parameters),
                barricadeData = HotUI.HOT.Primitive.Factory(data.get()),
                innerControl = HotUI.NormalFormControl(barricadeData,
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
                    $element.append(innerControl.html());
                };

                return $element;
            };

            return self;
        }
    });

    HotUI.FunctionControl = HotUI.MultiControl.extend({
        _cssClass: 'FunctionControl',
        _types: [
            {
                label: 'Attribute',
                type: HotUI.HOT.GetAttribute,
                control: 'GetAttributeControl'
            }, {
                label: 'File',
                type: HotUI.HOT.GetFile,
                control: 'GetFileControl'
            }, {
                label: 'Parameter',
                type: HotUI.HOT.GetParameter,
                control: 'GetParameterControl'
            }, {
                label: 'Resource',
                type: HotUI.HOT.GetResource,
                control: 'GetResourceControl'
            }, {
                label: 'Resource Facade',
                type: HotUI.HOT.ResourceFacade,
                control: 'ResourceFacadeControl'
            }, {
                label: 'String Replace',
                type: HotUI.HOT.StringReplace,
                control: 'StringReplaceControl'
            }
        ]
    });

    HotUI.GetAttributeControl = (function () {
        function constructor(data, parameters) {
            if (!(this instanceof constructor)) {
                return new constructor(data, parameters);
            }

            var attr = data.get('get_attr'),
                resourceControl,
                valueControl,
                $element,
                $attributeSelect,
                $valueControl;
                
            resourceControl = HotUI.ResourceSelectControl(
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
                    valueControl = HotUI.SchemalessContainerControl.create(
                                        attr.get('value'));
                    return valueControl.html();
                }
            }

            function getInnerHTML() {
                return [
                    resourceControl.html(),
                    $('<div class="attribute_select"></div>')
                        .append(getAttributeSelect()),
                    $('<div class="value_control"><div>')
                        .append(getValueHTML())
                ];
            }

            this.attach = function ($el) {
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

            this.html = function () {
                var $el = $('<div class="GetAttributeControl"></div>')
                           .append(getInnerHTML());
                this.attach($el);
                return $el;
            };
        }

        return constructor;
    }());

    HotUI.GetFileControl = function (data, parameters) {
        return HotUI.StringControl.create(data.get('get_file'), parameters);
    };

    HotUI.GetParameterControl = (function () {
        function constructor(data, parametersIn) {
            if (!(this instanceof constructor)) {
                return new constructor(data, parametersIn);
            }

            var parameters = parametersIn.template.get('parameters'),
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

            this.attach = function ($el) {
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

            this.html = function () {
                var $el = $('<div class="GetParameterControl"></div>')
                              .append(getInnerHTML());
                this.attach($el);
                return $el;
            };
        }

        return constructor;
    }());

    HotUI.GetResourceControl = function (data, parameters) {
        return HotUI.ResourceSelectControl(
            function () {
                return data.get('get_resource');
            },
            function (newVal) {
                data.set('get_resource', newVal);
            },
            parameters.template.get('resources'));
    };

    HotUI.ResourceSelectControl = (function () {
        function constructor(getter, setter, resources) {
            if (!(this instanceof constructor)) {
                return new constructor(getter, setter, resources);
            }

            var $element,
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

            this.attach = function ($el) {
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

            this.html = function () {
                var $el = $('<div class="ResourceSelectControl"></div>')
                           .append(getInnerHTML());
                this.attach($el);
                return $el;
            };
        }

        return constructor;
    }());

    HotUI.ResourceFacadeControl = function (data, parameters) {
        return HotUI.StringControl.create(
            data.get('resource_facade'), parameters);
    };

    HotUI.StringReplaceControl = function (data, parameters) {
        return HotUI.FormControl(data.get('str_replace'), parameters);
    };

    HotUI.ParameterConstraintControl = HotUI.MultiControl.extend({
        _cssClass: 'ParameterConstraintControl',
        _types: [
            {
                label: 'Length',
                type: HotUI.HOT.LengthParameterConstraint,
                control: 'ImmutableObjectControl'
            }, {
                label: 'Range',
                type: HotUI.HOT.RangeParameterConstraint,
                control: 'ImmutableObjectControl'
            }, {
                label: 'Allowed Values',
                type: HotUI.HOT.AllowedValuesParameterConstraint,
                control: 'ImmutableObjectControl'
            }, {
                label: 'Allowed Pattern',
                type: HotUI.HOT.AllowedPatternParameterConstraint,
                control: 'ImmutableObjectControl'
            }, {
                label: 'Custom Constraint',
                type: HotUI.HOT.CustomParameterConstraint,
                control: 'ImmutableObjectControl'
            }
        ]
    });

    HotUI.ResourcePropertyWrapperSelector = HotUI.BaseControl.extend({
        create: function (resource) {
            var self = HotUI.BaseControl.create.call(this);
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
                    if (value.instanceof(HotUI.HOT.ResourcePropertyWrapper) &&
                            value.getValue().instanceof(Barricade.Container) &&
                            !value.getValue()
                                  .instanceof(HotUI.HOT.IntrinsicFunction)) {
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

    HotUI.ResourceAttributeSelector = HotUI.BaseControl.extend({
        create: function (resource) {
            var self = HotUI.BaseControl.create.call(this);
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
});
