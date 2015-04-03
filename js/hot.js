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

var createHOT;

$(function () {
    var resourceTypeObj,
        neededResources = [];

    try {
        resourceTypeObj = JSON.parse(localStorage.getItem('resourceTypes'));
        if (resourceTypeObj === null || typeof resourceTypeObj !== 'object' ||
                resourceTypeObj instanceof Array) {
            resourceTypeObj = {};
        }
    } catch (e) {
        resourceTypeObj = {};
    }

    HOTUI_RESOURCE_NAMES.forEach(function (type) {
        if (!resourceTypeObj.hasOwnProperty(type)) {
            neededResources.push(type);
        }
    });

    if (neededResources.length > 0) {
        jQuery.ajax({
            url: ENDPOINTS.resourceTypeShow + STACK_REGION + '/' +
                neededResources.join(','),
            success: function(data) {
                Object.keys(data).forEach(function (type) {
                    resourceTypeObj[type] = data[type];
                });

                localStorage.setItem('resourceTypes',
                                     JSON.stringify(resourceTypeObj));
            },
            async: false
        });
    }

    HotUI.HOT = createHOT(resourceTypeObj);
});

createHOT = function (resourceTypeObj) {
    // create namespace
    var hot = {};

    //
    // Set up ResourceTypes so that different Resource classes can be created
    // later.
    //

    hot.ResourcePropertyWrapper = Barricade.Base.extend({
        create: function (json, parameters) {
            var self = this.extend({}),
                value = hot.IntrinsicFunctionFactory(json, parameters);

            if (!parameters) {
                parameters = {};
            }

            Barricade.Observable.call(self);
            Barricade.Identifiable.call(self, parameters.id);

            if (value) {
                self.setValue(value);
            } else {
                self.setValue(json, parameters);
            }

            return self;
        },
        getValue: function () {
            return this._value;
        },
        setValue: function (newValue, newParameters) {
            var self = this;

            function onChange() { self.emit('change', this); }
            function onChildChange() { self.emit('childChange', this); }
            function onReplace(newVal) { self.setValue(newVal); }

            if (this._value) {
                this._value.emit('removeFrom', this);
            }

            if (this._safeInstanceof(newValue, hot.IntrinsicFunction) ||
                    this._safeInstanceof(newValue, this._innerClass)) {
                this._value = newValue;
            } else {
                this._value = this._innerClass.create(newValue,
                                                       newParameters);
            }

            this._value.on('change', onChange);
            this._value.on('childChange', onChildChange);
            this._value.on('replace', onReplace);

            this._value.on('removeFrom', function (container) {
                self._value.off('change', onChange);
                self._value.off('childChange', onChildChange);
                self._value.off('replace', onReplace);
            });

            this.emit('change', 'set', this._value);
        },
        toNormal: function () {
            this.setValue();
        },
        toIntrinsicFunction: function () {
            this.setValue(hot.GetParameter.create());
        },
        hasDescription: function () {
            return ('_description' in this) && !this._description.isEmpty();
        },
        getDescription: function () {
            return this._description.get();
        },
        hasDependency: function () {
            return this._value.hasDependency();
        },
        resolveWith: function (obj) {
            return this.getValue().resolveWith(obj);
        },
        isEmpty: function () {
            return !!this._value;
        },
        isUsed: function () {
            return this.isRequired() || this._value.isUsed();
        },
        setIsUsed: function (isUsed) {
            return this._value.setIsUsed(isUsed);
        },
        getIntrinsicFunctions: function () {
            function searchValue(value) {
                var intrinsics = [];
                if (value.instanceof(hot.ResourcePropertyWrapper)) {
                    return value.getIntrinsicFunctions();
                } else if (value.instanceof(hot.IntrinsicFunction)) {
                    if (value.instanceof(hot.StringReplace)) {
                        return [value].concat(value.getIntrinsicFunctions());
                    }
                    return [value];
                } else if (value.instanceof(Barricade.Container)) {
                    value.each(function (i, element) {
                        intrinsics = intrinsics.concat(searchValue(element));
                    });
                    return intrinsics;
                }
                return [];
            }
            return searchValue(this.getValue());
        },
        toJSON: function (ignoreUnused) {
            return this._value.toJSON(ignoreUnused);
        }
    });

    function constraintFactory(constraintObj) {
        var types = {
                'range': function (constraint) {
                    var min = constraint.min,
                        max = constraint.max;

                    function getMessage() {
                        if (min === undefined) {
                            return 'Value must be less than ' + max;
                        } else if (max === undefined) {
                            return 'Value must be greater than ' + min;
                        }
                        return 'Value must be between ' +
                            min + ' and ' + max;
                    }

                    return function (val) {
                        return ((min === undefined || val >= min) &&
                                (max === undefined || val <= max)) ||
                               getMessage();
                    };
                },
                'length': function (constraint) {
                    var min = constraint.min,
                        max = constraint.max;

                    function getMessage() {
                        if (min === undefined) {
                            return 'Must have fewer than ' +
                                max + ' letters';
                        } else if (max === undefined) {
                            return 'Must have more than ' +
                                min + ' letters';
                        }
                        return 'Must have between ' +
                            min + ' and ' + max + ' letters';
                    }

                    return function (val) {
                        return ((min === undefined || val.length >= min) &&
                                (max === undefined || val.length <= max)) ||
                               getMessage();
                    };
                },
                'allowed_values': function (constraint) {
                    return function (val) {
                        console.log((constraint.indexOf(val) > -1) ||
                            ('Value must be one of ' +
                             constraint.join(', ')));
                        return (constraint.indexOf(val) > -1) ||
                            ('Value must be one of ' +
                             constraint.join(', '));
                    };
                },
                'allowed_pattern': function (constraint) {
                    var regex = new RegExp(constraint);
                    return function (val) {
                        return regex.test(val) ||
                            ('Must match pattern: ' + constraint);
                    };
                },
                'custom_constraint': function () {
                    return function () { return true; };
                }
            };

        function getConstraint(constraintObj) {
            for (var t in types) {
                if (constraintObj.hasOwnProperty(t)) {
                    return types[t](constraintObj[t]);
                }
            }

            console.log('Constraint type not found: ', constraintObj);
            return function () { return true; };
        }
    }

    hot.ResourcePropertyFactory = function (json, parameters) {
        if (!json.hasOwnProperty('schema')) {
            if (json.type === 'list') {
                json.schema = {
                    '*': {
                        'type': 'string' // No '@'. This fixes missing
                                         // resource_type_show schema
                    }
                };
            }
        }

        if (json.type === 'map' && !json.hasOwnProperty('schema')) {
            return hot.ResourceProperty_map2.create(json, parameters)
        }
        return hot['ResourceProperty_' + json.type].create(json, parameters);
    };

    hot.ResourceProperty = Barricade.ImmutableObject.extend({
        getSchema: function () {
            var schema = {},
                wrapperSchema = {},
                types = {
                    'map': Object,
                    'list': Array,
                    'string': String,
                    'number': Number,
                    'integer': Number,
                    'boolean': Boolean
                };

            wrapperSchema['@required'] = this.get('required').get();
            schema['@type'] = types[this.get('type').get()];
            schema['@required'] = this.get('required').get();
            schema['@constraints'] =
                this.get('constraints').get().map(constraintFactory);

            if (schema['@type'] === Object) {
                if (this.get('schema')) {
                    this.get('schema').each(function (i, prop) {
                        schema[prop.getID()] = prop.getSchema();
                    });
                }
            } else if (schema['@type'] === Array) {
                schema['*'] = this.get('schema').get('*').getSchema();
            }

            return {
                '@class': hot.ResourcePropertyWrapper.extend({
                    _innerClass: Barricade.create(schema),
                    _description: this.get('description')
                }, wrapperSchema)
            };
        }
    }, {
        '@type': Object,
        'type': {'@type': String},
        'description': {'@type': String},
        'required': {'@type': Boolean},
        'constraints': {'@type': Array},
        'update_allowed': {'@type': Boolean}
    });

    hot.ResourceProperty_map = hot.ResourceProperty.extend({}, {
        'default': {'@type': Object},
        'schema': {
            '@type': Object,
            '?': {
                '@class': hot.ResourceProperty,
                '@factory': hot.ResourcePropertyFactory
            }
        }
    });

    hot.ResourceProperty_list = hot.ResourceProperty.extend({}, {
        'default': {'@type': Array},
        'schema': {
            '@type': Object,
            '*': {
                '@class': hot.ResourceProperty,
                '@factory': hot.ResourcePropertyFactory
            }
        }
    });

    hot.ResourceProperty_map2 = hot.ResourceProperty.extend({}, {
        'default': {'@type': Object}});
    hot.ResourceProperty_string = hot.ResourceProperty.extend({}, {
        'default': {'@type': String}});
    hot.ResourceProperty_number = hot.ResourceProperty.extend({}, {
        'default': {'@type': Number}});
    hot.ResourceProperty_integer = hot.ResourceProperty.extend({}, {
        'default': {'@type': Number}});
    hot.ResourceProperty_boolean = hot.ResourceProperty.extend({}, {
        'default': {'@type': Boolean}});

    hot.ResourceAttribute = Barricade.create({
            '@type': Object,
            'description': {'@type': String}
    });

    hot.ResourceType = Barricade.ImmutableObject.extend({
        getSchema: function () {
            var propertySchema = {
                    '@type': Object,
                    '@required': false
                };

            this.get('properties').each(function (i, self) {
                propertySchema[self.getID()] = self.getSchema();
            });

            if (this.getID() === 'OS::Heat::ResourceGroup') {
                propertySchema.resource_def = {
                    '@type': Object,
                    'type': {'@type': String},
                    'properties': {
                        '@type': Object,
                        '@ref': {
                            to: hot.ResourceProperties,
                            needs: function () {
                                return hot.ResourceProperties;
                            },
                            resolver: function (json, properties) {
                                var type = properties.get('resource_def')
                                                     .get('type');
                                console.log('resolving resource_def');
                                type.on('change', function () {
                                    console.log('resource def changed to ' +
                                                type.get());
                                    properties
                                        .get('resource_def')
                                        .set('properties',
                                             hot.ResourcePropertiesFactory(
                                                 undefined, undefined,
                                                 type.get()));
                                });

                                return hot.ResourcePropertiesFactory(
                                           json.get(), undefined, type.get());
                            }
                        }
                    }
                };
            }

            return propertySchema;
        }
    }, {
        '@type': Object,

        'attributes': {
            '@type': Object,
            '?': {'@class': hot.ResourceAttribute}
        },

        'properties': {
            '@type': Object,
            '?': {
                '@class': hot.ResourceProperty,
                '@factory': hot.ResourcePropertyFactory
            }
        }
    });

    hot.ResourceTypes = Barricade.create({
        '@type': Object,
        '?': {'@class': hot.ResourceType}
    });

    hot.resourceTypes = hot.ResourceTypes.create(resourceTypeObj);

    //
    // Now that the resource types have been processed, create everthing
    // needed for a heat template.
    //

    hot.IntrinsicFunctionFactory = function (json, parameters) {
        if (Barricade.getType(json) === Object) {
            if (json.hasOwnProperty('get_resource')) {
                return hot.GetResource.create(json, parameters);

            } else if (json.hasOwnProperty('get_attr')) {
                return hot.GetAttribute.create(json, parameters);

            } else if (json.hasOwnProperty('get_param')) {
                return hot.GetParameter.create(json, parameters);

            } else if (json.hasOwnProperty('get_file')) {
                return hot.GetFile.create(json, parameters);

            } else if (json.hasOwnProperty('str_replace')) {
                return hot.StringReplace.create(json, parameters);

            } else if (json.hasOwnProperty('resource_facade')) {
                return hot.ResourceFacade.create(json, parameters);
            }
        }

        return false;
    };

    hot.IntrinsicFunction = Barricade.ImmutableObject.extend({}, {
        '@type': Object,
        '@required': false
    });

    hot.GetResource = hot.IntrinsicFunction.extend({}, {
        '@toJSON': function () {
            if (this.get('get_resource').getPrimitiveType() === String) {
                console.error('Resource was not available');
                return {get_resource: ''};
            } else {
                return {get_resource: this.get('get_resource').getID()};
            }
        },
        'get_resource': {
            '@type': String,
            '@ref': {
                to: function () { return hot.Resource; },
                needs: function () { return hot.Template; },
                resolver: function (json, template) {
                    return template.get('resources').getByID(json.get());
                }
            }
        }
    });

    hot.GetAttribute = hot.IntrinsicFunction.extend({}, {
        'get_attr': {
            // handle a nicely-formatted object instead of
            // an array with different types in it, the first
            // two of which should really be references
            '@type': Object,
            '@inputMassager': function (json) {
                if (!json) {
                    json = ['', ''];
                }

                return {
                    resource: json[0],
                    attribute: json[1],
                    value: json.slice(2)
                };
            },
            '@toJSON': function () {
                var resourceID;

                if (this.get('resource').getPrimitiveType() === String) {
                    resourceID = '';
                    console.error('Resource was not available');
                } else {
                    resourceID = this.get('resource').getID();
                }
                return [
                    resourceID,
                    this.get('attribute')
                ].concat(this.get('value').get());
            },

            'resource': {
                '@type': String,
                '@ref': {
                    to: function () { return hot.Resource; },
                    needs: function () { return hot.Template; },
                    resolver: function (json, template) {
                        return template.get('resources')
                                       .getByID(json.get());
                    }
                }
            },
            'attribute': {'@type': String},
            'value': {'@type': Array}
        }
    });

    hot.GetParameter = hot.IntrinsicFunction.extend({}, {
        '@toJSON': function () {
            if (this.get('get_param').getPrimitiveType() === String) {
                console.error('Parameter was not available');
                return {get_param: ''};
            } else {
                return {get_param: this.get('get_param').getID()};
            }
        },
        'get_param': {
            '@type': String,
            '@ref': {
                to: function () { return hot.Parameter; },
                needs: function () { return hot.Template; },
                resolver: function (json, template) {
                    return template.get('parameters').getByID(json.get());
                }
            }
        }
    });

    hot.GetFile = hot.IntrinsicFunction.extend({}, {
        'get_file': {'@type': String}
    });

    hot.StringReplace = hot.IntrinsicFunction.extend({
        getParams: function () {
            return this.get('str_replace').get('params');
        },
        getTemplate: function () {
            return this.get('str_replace').get('template');
        },
        getIntrinsicFunctions: function () {
            return this.getParams().toArray().reduce(function (arr, current) {
                       return arr.concat(current.getIntrinsicFunctions());
                   }, []);
        }
    }, {
        'str_replace': {
            '@type': Object,
            'template': {'@type': String},
            'params': {
                '@type': Object,
                '?': {
                    '@class': hot.ResourcePropertyWrapper.extend({
                        _innerClass: Barricade.create({'@type': String})
                    }, {})
                }
            }
        }
    });

    hot.ResourceFacade = hot.IntrinsicFunction.extend({}, {
        'resource_facade': {'@type': String}
    });

    hot.ResourceProperties = Barricade.ImmutableObject.extend({});

    hot.ResourcePropertiesFactory = function (json, parameters, type) {
        var propertyClass = hot['ResourceProperties_' + type],
            propertiesOut;

        if (!propertyClass) {
            propertyClass = hot.ResourcePropertiesNull;
        }

        return propertyClass.create(json, parameters);
    };

    // Create various hot.ResourceProperties_<type> types
    // (ex. hot["ResourceProperties_AWS::EC2::Instance"])
    (function () {
        var allResourceTypes = hot.resourceTypes.toArray();

        // null resource type to aid ResourceGroup
        allResourceTypes.push(hot.ResourceType.create({}, {id: 'null'}));

        allResourceTypes.forEach(function (resourceType) {
            hot['ResourceProperties_' + resourceType.getID()] =
                hot.ResourceProperties.extend({
                        getBackingType: function () {
                            return resourceType;
                        }
                    },
                    resourceType.getSchema());
        });
    }());

    hot.Resource = Barricade.ImmutableObject.extend({
        getProperties: function () {
            return this.get('properties');
        },
        getProperty: function (property) {
            return this.getProperties().get(property);
        },
        isResourceGroup: function () {
            return this.get('type').get() === 'OS::Heat::ResourceGroup';
        },
        getType: function () {
            return this.isResourceGroup()
                ? this.getProperty('resource_def').get('type').get()
                : this.get('type').get();
        },
        getAttributes: function () {
            var attributes = this.getProperties().getBackingType()
                                 .get('attributes').toArray();
            if (this.isResourceGroup()) {
                return attributes.concat(
                    this.getProperty('resource_def').get('properties')
                        .getBackingType().get('attributes').toArray());
            }
            return attributes;
        },
        getAttributeNames: function () {
            return this.getAttributes().map(function (attribute) {
                       return attribute.getID();
                   });
        },
        getIntrinsicFunctions: function () {
            function getIntrinsics(value) {
                var intrinsics = [];
                if (value.instanceof(hot.ResourcePropertyWrapper)) {
                    return value.getIntrinsicFunctions();
                } else if (value.instanceof(Barricade.Container)) {
                    value.each(function (i, element) {
                        intrinsics = intrinsics.concat(getIntrinsics(element));
                    });
                    return intrinsics;
                }
                return [];
            }
            return getIntrinsics(this.getProperties());
        },
        connectTo: function (resource) {
            this.getProperties().connectTo(resource);
            resource.getProperties().connectTo(this);
        },
        _docsBaseURL: "http://docs.rs-heat.com/raxdox/",
        getDocsLink: function () {
            var resourceType = this.get('type').get(),
                nameTokens = resourceType.split('::'),
                resourceBase;
            if (nameTokens[0] === 'OS') {
                resourceBase = "openstack";
            } else if (nameTokens[0] === 'Rackspace') {
                resourceBase = "rackspace";
            } else {
                console.warn("Resource type not found: %s", nameTokens[0]);
                return this._docsBaseURL;
            }
            return this._docsBaseURL + resourceBase + '.html#' +
                   resourceType;
        }
    }, {
        '@type': Object,

        'type': {'@type': String},
        'properties': {
            '@type': Object,
            '@ref': {
                to: hot.ResourceProperties,
                needs: function () { return hot.Resource; },
                resolver: function (json, resource) {
                    var type = resource.get('type');

                    type.on('change', function () {
                        console.log('type changed to ' + type.get());
                        resource.set('properties',
                                     hot.ResourcePropertiesFactory(undefined,
                                                                   undefined,
                                                                   type.get()));
                    });

                    return hot.ResourcePropertiesFactory(json.get(), undefined,
                                                         type.get());
                }
            }
        },
        'metadata': {
            '@type': String,
            '@required': false
        },
        'depends_on': {
            '@type': Array,
            '@required': false,
            '@inputMassager': function (json) {
                if (typeof json === "string") {
                    return [json];
                } else {
                    return json;
                }
            },
            '*': {'@type': String}
        },
        'update_policy': {
            '@type': Object,
            '@required': false,
            '?': {'@type': String}
        },
        'deletion_policy': {
            '@type': String,
            '@required': false
        }
    });


    hot.ParameterDefault = Barricade.Primitive.extend({}, {
        '@required': false
    });

    (function () {
        var pd = hot.ParameterDefault;
        hot.StringParameterDefault = pd.extend({}, {'@type': String});
        hot.NumberParameterDefault = pd.extend({}, {'@type': Number});
        hot.ArrayParameterDefault = pd.extend({}, {'@type': Array});
        hot.ObjectParameterDefault = pd.extend({}, {'@type': Object});
        hot.BooleanParameterDefault = pd.extend({}, {'@type': Boolean});
    }());

    hot.ParameterConstraintFactory = function (json, parameters) {
        var key,
            types = {
                'length': hot.LengthParameterConstraint,
                'range': hot.RangeParameterConstraint,
                'allowed_values': hot.AllowedValuesParameterConstraint,
                'allowed_pattern': hot.AllowedPatternParameterConstraint,
                'custom_constraint': hot.CustomParameterConstraint,
            };

        if (!json) {
            return hot.LengthParameterConstraint.create(json, parameters);
        }

        for (key in types) {
            if (types.hasOwnProperty(key) && json.hasOwnProperty(key)) {
                return types[key].create(json, parameters);
            }
        }

        console.error('unknown constraint type');
    };

    hot.ParameterConstraint = Barricade.ImmutableObject.extend({}, {
        '@type': Object,
        'description': {
            '@type': String,
            '@required': false
        }
    });

    hot.LengthParameterConstraint = hot.ParameterConstraint.extend({}, {
        'length': {
            '@type': Object,
            'min': {
                '@type': Number,
                '@required': false
            },
            'max': {
                '@type': Number,
                '@required': false
            }
        }
    });

    hot.RangeParameterConstraint = hot.ParameterConstraint.extend({}, {
        'range': {
            '@type': Object,
            'min': {
                '@type': Number,
                '@required': false
            },
            'max': {
                '@type': Number,
                '@required': false
            }
        }
    });

    hot.AllowedValuesParameterConstraint = hot.ParameterConstraint.extend({}, {
        'allowed_values': {'@type': Array}});
    hot.AllowedPatternParameterConstraint = hot.ParameterConstraint.extend({}, {
        'allowed_pattern': {'@type': String}});
    hot.CustomParameterConstraint = hot.ParameterConstraint.extend({}, {
        'custom_constraint': {'@type': String}});

    hot.Parameter = Barricade.create({
        '@type': Object,

        'type': {'@type': String},
        'label': {
            '@type': String,
            '@required': false
        },
        'description': {
            '@type': String,
            '@required': false
        },
        'default': {
            '@type': Object,
            // default can be various types, so wrap it in an object to
            // make Barricade happy
            '@inputMassager': function (json) {
                return {value: json};
            },
            '@ref': {
                to: hot.ParameterDefault,
                needs: function () { return hot.Parameter; },
                resolver: function (json, parameter) {
                    var types = {
                            'string': hot.StringParameterDefault,
                            '': hot.StringParameterDefault,
                            'number': hot.NumberParameterDefault,
                            'comma_delimited_list':
                                hot.ArrayParameterDefault,
                            'json': hot.ObjectParameterDefault,
                            'boolean': hot.BooleanParameterDefault,
                        },
                        type = parameter.get('type').get();

                    return types[type].create(json.get().value);
                }
            }
        },
        'hidden': {
            '@type': Boolean,
            '@required': false,
        },
        'constraints': {
            '@type': Array,
            '@required': false,
            '*': {
                '@class': hot.ParameterConstraint,
                '@factory': hot.ParameterConstraintFactory
            }
        }
    });

    hot.ParameterGroup = Barricade.create({
        '@type': Object,

        'label': {'@type': String},
        'description': {'@type': String},
        'parameters': {
            '@type': Array,
            '*': {
                '@type': String,
                '@ref': {
                    to: hot.Parameter,
                    needs: function () { return hot.Template; },
                    resolver: function (json, template) {
                        return template.get('parameters')
                                       .getByID(json.get());
                    }
                }
            }
        },
    });

    hot.Output = Barricade.create({
        '@type': Object,
        'description': {'@type': String},
        'value': {
            '@class': hot.ResourcePropertyWrapper.extend({
                _innerClass: Barricade.create({'@type': String})
            }, {})
        }
    });

    hot.Template = Barricade.create({
        '@type': Object,

        'heat_template_version': {'@type': String},
        'description': {
            '@type': String,
            '@required': false
        },
        'parameter_groups': {
            '@type': Array,
            '@required': false,
            '*': {'@class': hot.ParameterGroup}
        },
        'parameters': {
            '@type': Object,
            '@required': false,
            '?': {'@class': hot.Parameter}
        },
        'resources': {
            '@type': Object,
            '?': {'@class': hot.Resource}
        },
        'outputs': {
            '@type': Object,
            '@required': false,
            '?': {'@class': hot.Output}
        }
    });

    (function () {
        var elementSchema,
            primitiveExtension = {
                create: function (json, parameters) {
                    var self = Barricade.Primitive.create.call(this, json,
                                                               parameters);
                    hot.Primitive.call(self);
                    return self;
                }
            };

        hot.Primitive = Barricade.Blueprint.create(function () {});

        hot.Primitive._schema = {}; // QUICK HACK

        hot.Primitive.Factory = function (json, parameters) {
            var type = Barricade.getType(json);

            if (json === undefined || type === String) {
                return hot.Primitive.string.create(json, parameters);
            } else if (type === Boolean) {
                return hot.Primitive.bool.create(json, parameters);
            } else if (type === Number) {
                return hot.Primitive.number.create(json, parameters);
            } else if (type === Array) {
                return hot.Primitive.Array.create(json, parameters);
            } else if (type === Object) {
                return hot.Primitive.object.create(json, parameters);
            }
        };

        elementSchema = {
            '@class': hot.Primitive,
            '@factory': hot.Primitive.Factory
        };

        hot.Primitive.string = Barricade.Primitive.extend(primitiveExtension,
                                                          {'@type': String});
        hot.Primitive.bool = Barricade.Primitive.extend(primitiveExtension,
                                                        {'@type': Boolean});
        hot.Primitive.number = Barricade.Primitive.extend(primitiveExtension,
                                                          {'@type': Number});
        hot.Primitive.Array = Barricade.Array.extend({
            create: function (json, parameters) {
                var self = Barricade.Array.create.call(this, json, parameters);
                hot.Primitive.call(self);
                return self;
            }
        }, {
            '@type': Array,
            '*': elementSchema
        });

        hot.Primitive.object = Barricade.MutableObject.extend({
            create: function (json, parameters) {
                var self = Barricade.MutableObject
                                    .create.call(this, json, parameters);
                hot.Primitive.call(self);
                return self;
            }
        }, {
            '@type': Object,
            '?': elementSchema
        });

    }());

    return hot;

};
