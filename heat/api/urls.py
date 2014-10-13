# Copyright 2014 Rackspace
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa

from heat.api.views import json_to_yaml
from heat.api.views import template_validate
from heat.api.views import url_to_json
from heat.api.views import yaml_to_json

urlpatterns = patterns(
    '',

    url(r'^template_validate/$', template_validate, name='template_validate'),

    url(r'^json_to_yaml/$', json_to_yaml, name='json_to_yaml'),

    url(r'^yaml_to_json/$', yaml_to_json, name='yaml_to_json'),

    url(r'^url_to_json/$', url_to_json, name='url_to_json'),

)
