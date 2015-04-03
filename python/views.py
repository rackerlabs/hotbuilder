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

from django.views.generic import TemplateView  # noqa

from heat.api.hotui import hotui_api
from heat.common.region import get_endpoint
from heat.common.region import get_regions

logger = logging.getLogger(__name__)

class IndexView(TemplateView):
    template_name = 'hotui/hotui_base.html'

    def get_context_data(self, **kwargs):
        context = {}
        request = self.request
        region_value = get_regions(request)[0].get('value')
        heat_endpoint = get_endpoint(request, region_value)
        resource_names = [t.resource_type for t in
                          hotui_api.resource_type_list(request, heat_endpoint)]

        context['region_value'] = region_value
        context['stack_endpoint'] = heat_endpoint
        context['resource_names'] = json.dumps(resource_names)
                    
        return context
