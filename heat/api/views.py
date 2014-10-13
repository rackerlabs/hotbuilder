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

import httplib2
import json
import yaml

from django.conf import settings  # noqa
from django.http import HttpResponse  # noqa

from heat.api import heat_api

if settings.ENV == 'PUBLIC':
    from public.common.decorators import ajax_check_auth
else:
    from heat.common.decorators import ajax_check_auth


# does not handle GET requests
@ajax_check_auth
def template_validate(request):
    endpoint = request.POST.get("endpoint")

    kwargs = {}

    template_url = request.POST.get("url")
    template = request.POST.get("template")

    if template_url is not None:
        kwargs["template_url"] = template_url

    if template is not None:
        kwargs["template"] = json.loads(template)

    try:
        validate = heat_api.template_validate(request, endpoint, **kwargs)
        return HttpResponse(json.dumps(validate),
                            content_type="application/json")
    except Exception as e:
        return HttpResponse(str(e),
                            content_type="text/html")


def get_template_from_url(url):
    '''Helper function to retrieve heat template content from a given url.'''

    h = httplib2.Http(disable_ssl_certificate_validation=True)
    resp, content = h.request(
        uri=url,
        method='GET',
    )

    return content


@ajax_check_auth
def json_to_yaml(request):
    return HttpResponse(heat_api.json_to_yaml(request.POST['json']),
                        content_type="text/html")


@ajax_check_auth
def yaml_to_json(request):
    return HttpResponse(heat_api.yaml_to_json(request.POST['yaml']),
                        content_type="application/json")


@ajax_check_auth
def url_to_json(request):
    try:
        template = get_template_from_url(request.GET.get('url'))
        return HttpResponse(heat_api.yaml_to_json(template),
                            content_type="application/json")
    except Exception as e:
        return HttpResponse(str(e), content_type="text/html")
