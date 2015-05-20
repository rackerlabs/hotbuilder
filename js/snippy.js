// Copyright 2015 Rackspace
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

var Snippy = (function () {
    var snippets = {},
        r = /(\$\{[\S\s]*?\})/g,
        r2 = /\$\{([\S\s]*?)\}/;

    function produceSnippet(html) {
        var locs = {},
            locKeys,
            template = html.split(r);

        template.forEach(function (s, i) {
            var key = (r2.exec(s) || '  ')[1].trim();

            if (key) {
                if (!locs.hasOwnProperty(key)) {
                    locs[key] = [];
                }
                locs[key].push(i);
            }
        });

        locKeys = Object.keys(locs);

        snippets[html] = function (args) {
            for (var i = locKeys.length - 1; i >= 0; i--) {
                for (var j = locs[locKeys[i]].length - 1; j >= 0; j--) {
                    template[locs[locKeys[i]][j]] = args[locKeys[i]];
                }
            }
            return template.join('');
        };

        return snippets[html];
    }

    return function (html) {
        return snippets[html] || produceSnippet(html);
    };
}());
