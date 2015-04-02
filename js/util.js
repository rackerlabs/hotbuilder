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

// Create HotUI 'namespace'
var HotUI = {},
    BaseObject = Object.create(null),
    ENDPOINTS = {
        templateValidate: HOTUI_API_ROOT + "template_validate/",
        jsonToYAML: HOTUI_API_ROOT + "json_to_yaml/",
        yamlToJSON: HOTUI_API_ROOT + "yaml_to_json/",
        urlToJSON: HOTUI_API_ROOT + "url_to_json/",
        downloadTemplate: HOTUI_API_ROOT + "download_template/",
        resourceTypeShow: HOTUI_API_ROOT + "resource_type_show/"
    };

Object.defineProperty(BaseObject, 'extend', {
    writable: false,
    value: function (extension) {
        return Object.keys(extension).reduce(function (object, property) {
            object[property] = extension[property];
            return object;
        }, Object.create(this));
    }
});

Object.defineProperty(BaseObject, 'instanceof', {
    value: function (proto) {
        var _instanceof = this.instanceof,
            subject = this;

        function hasMixin(obj, mixin) {
            return Object.prototype.hasOwnProperty.call(obj, '_parents') &&
                obj._parents.some(function (_parent) {
                    return _instanceof.call(_parent, mixin);
                });
        }

        do {
            if (subject === proto ||
                    hasMixin(subject, proto)) {
                return true;
            }
            subject = Object.getPrototypeOf(subject);
        } while (subject);

        return false;
    }
});
