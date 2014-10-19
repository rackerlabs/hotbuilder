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

import datetime
import json
import logging
import yaml

from heatclient import client as heat_client

logger = logging.getLogger(__name__)


def format_parameters(params):
    parameters = {}
    for count, p in enumerate(params, 1):
        parameters['Parameters.member.%d.ParameterKey' % count] = p
        parameters['Parameters.member.%d.ParameterValue' % count] = params[p]
    return parameters


def heatclient(session, endpoint='', auth_info=None):
    if auth_info:
        tenant = auth_info['tenant']
        token = auth_info['token']
    else:
        tenant = session.get('auth_impersonation_tenant_id')
        token = session.get('auth_impersonation_token')

    api_version = "1"
    if endpoint[-1] != '/':
        endpoint = endpoint + '/'
    endpoint = endpoint + tenant
    kwargs = {
        'insecure': True,
        'username': tenant,
        'password': token,
        'token': token,
        'timeout': 2 * 60,  # seconds
    }

    logger.debug('Initializing heatclient - token: %s, endpoint: %s' %
                 (token, endpoint))
    client = heat_client.Client(api_version, endpoint, **kwargs)
    client.format_parameters = format_parameters
    return client


def template_validate(request, endpoint, **kwargs):
    client = heatclient(request.session, endpoint=endpoint)
    return client.stacks.validate(**kwargs)


def resource_type_list(request, endpoint):
    client = heatclient(request.session, endpoint=endpoint)
    kwargs = {}
    return client.resource_types.list(**kwargs)


def resource_type_show(request, resource_type, endpoint):
    client = heatclient(request.session, endpoint=endpoint)
    return client.resource_types.get(resource_type)


def json_to_yaml(json_string):
    def show_block_if_newline(self, tag, value, style=None):
        if style is None:
            style = '|' if ('\n' in value) else self.default_style

        node = yaml.representer.ScalarNode(tag, value, style=style)
        if self.alias_key is not None:
            self.represented_objects[self.alias_key] = node
        return node

    json_data = json.loads(json_string)

    # To prevent side effects, save old method and then restore it afterwards
    old_represent_scalar = yaml.representer.BaseRepresenter.represent_scalar
    yaml.representer.BaseRepresenter.represent_scalar = show_block_if_newline
    yaml_output = yaml.safe_dump(json_data, width=9999)
    yaml.representer.BaseRepresenter.represent_scalar = old_represent_scalar

    return yaml_output


def yaml_to_json(yaml_string):
    yaml_data = yaml.safe_load(yaml_string)

    # Prevents 'datetime is not JSON serializable' errors
    def datetime_handler(obj):
        if isinstance(obj, datetime.date):
            return obj.isoformat()
        else:
            return json.JSONEncoder().default(obj)

    return json.dumps(yaml_data, default=datetime_handler)
