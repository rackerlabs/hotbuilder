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

import logging
import json
import yaml

from django.core.cache import cache  # noqa
from django.views.generic import TemplateView  # noqa

from heat.api import heat_api
from heat.common.region import get_endpoint
from heat.common.region import get_regions

from heat.hotui import hardcoded_resource_type_show

logger = logging.getLogger(__name__)

class IndexView(TemplateView):
    template_name = 'hotui/hotui.html'

    def get_context_data(self, **kwargs):
        def get_resource_type_show(request, resource_type, heat_endpoint):
            return heat_api.resource_type_show(request, resource_type, heat_endpoint)

        def get_all_resource_type_show(request, resource_type_list, heat_endpoint):
            all_resource_types = {}

            for rt in [type.resource_type for type in resource_type_list]:
                logger.debug('Adding ' + rt)
                all_resource_types[rt] = get_resource_type_show(request, rt, heat_endpoint)

            return all_resource_types

        context = {}
        request = self.request
        region_value = get_regions(request)[0].get('value')
        heat_endpoint = get_endpoint(request, region_value)
        resource_type_list = heat_api.resource_type_list(request, heat_endpoint)
        resource_types = get_all_resource_type_show(request, resource_type_list, heat_endpoint)

        context['region_value'] = region_value
        context['stack_endpoint'] = heat_endpoint
                    
        return context
