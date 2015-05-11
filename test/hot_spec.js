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

createHOT(RESOURCE_TYPE_SHOW);

describe('HOT', function () {
    beforeEach(function () {
        this.templates = Object.keys(TEMPLATES).reduce(function (objOut, key) {
            objOut[key] = HotUI.HOT.Template.create(TEMPLATES[key]);
            return objOut;
        }, {});
    });

    it('should resolve intrinsic functions in primitive maps', function () {
        var wp_setup = this.templates.wp_single.get('resources')
                                               .getByID('wordpress_setup');

        expect(wp_setup.getIntrinsicFunctions().length).toEqual(25);
    });

    it('should output the same template that was put in', function () {
        Object.keys(this.templates).forEach(function (name) {
            var t1 = this.templates[name].toJSON({ignoreUnused: true}),
                t2 = TEMPLATES[name];

            Object.keys(t1).forEach(function (k) {
                if (typeof t1[k] === 'object') {
                    Object.keys(t1[k]).forEach(function (l) {
                        expect(t1[k][l]).toEqual(t2[k][l]);
                    });
                } else {
                    expect(t1[k]).toEqual(t2[k]);
                }
            });
        }, this);
    });
});
