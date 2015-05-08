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

        this.template = HotUI.HOT.Template.create(TEMPLATES.wp_single);
    });

    it('should resolve intrinsic functions in primitive maps', function () {
        var wp_setup = this.template.get('resources')
                                    .getByID('wordpress_setup');

        expect(wp_setup.getIntrinsicFunctions().length).toEqual(25);
    });

    it('should output the same template that was put in', function () {
        expect(this.template.toJSON(true)).toEqual(TEMPLATES.wp_single);
    });
});
