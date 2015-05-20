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

var RESOURCE_TYPE_SHOW = {
  "AWS::EC2::Instance": {
    "attributes": {
      "PublicIp": {
        "description": "Public IP address of the specified instance."
      },
      "PrivateDnsName": {
        "description": "Private DNS name of the specified instance."
      },
      "AvailabilityZone": {
        "description": "The Availability Zone where the specified instance is launched."
      },
      "PublicDnsName": {
        "description": "Public DNS name of the specified instance."
      },
      "PrivateIp": {
        "description": "Private IP address of the specified instance."
      }
    },
    "properties": {
      "UserData": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "User data to pass to instance.",
        "immutable": false
      },
      "AvailabilityZone": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Availability zone to launch the instance in.",
        "immutable": false
      },
      "NovaSchedulerHints": {
        "description": "Scheduler hints to pass to Nova (Heat extension).",
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "Value": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "immutable": false
              },
              "Key": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "immutable": false
              }
            }
          }
        }
      },
      "Tags": {
        "description": "Tags to attach to instance.",
        "required": false,
        "update_allowed": true,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "Value": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "immutable": false
              },
              "Key": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "immutable": false
              }
            }
          }
        }
      },
      "ImageId": {
        "description": "Glance image ID or name.",
        "required": true,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "glance.image"
          }
        ]
      },
      "BlockDeviceMappings": {
        "description": "Block device mappings to attach to instance.",
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "DeviceName": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "description": "A device name where the volume will be attached in the system at /dev/device_name.e.g. vdb",
                "immutable": false
              },
              "VirtualName": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "description": "The name of the virtual device. The name must be in the form ephemeralX where X is a number starting from zero (0); for example, ephemeral0.",
                "immutable": false
              },
              "NoDevice": {
                "type": "map",
                "required": false,
                "update_allowed": false,
                "description": "The can be used to unmap a defined device.",
                "immutable": false
              },
              "Ebs": {
                "description": "The ebs volume to attach to the instance.",
                "required": false,
                "update_allowed": false,
                "type": "map",
                "immutable": false,
                "schema": {
                  "SnapshotId": {
                    "description": "The ID of the snapshot to create a volume from.",
                    "required": false,
                    "update_allowed": false,
                    "type": "string",
                    "immutable": false,
                    "constraints": [
                      {
                        "custom_constraint": "cinder.snapshot"
                      }
                    ]
                  },
                  "DeleteOnTermination": {
                    "description": "Indicate whether the volume should be deleted when the instance is terminated.",
                    "default": true,
                    "required": false,
                    "update_allowed": false,
                    "type": "boolean",
                    "immutable": false
                  },
                  "VolumeType": {
                    "type": "string",
                    "required": false,
                    "update_allowed": false,
                    "description": "The volume type.",
                    "immutable": false
                  },
                  "VolumeSize": {
                    "type": "string",
                    "required": false,
                    "update_allowed": false,
                    "description": "The size of the volume, in GB. Must be equal or greater than the size of the snapshot. It is safe to leave this blank and have the Compute service infer the size.",
                    "immutable": false
                  },
                  "Iops": {
                    "type": "number",
                    "required": false,
                    "update_allowed": false,
                    "description": "The number of I/O operations per second that the volume supports.",
                    "immutable": false
                  }
                }
              }
            }
          }
        }
      },
      "KeyName": {
        "description": "Optional Nova keypair name.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "nova.keypair"
          }
        ]
      },
      "SecurityGroups": {
        "type": "list",
        "required": false,
        "update_allowed": false,
        "description": "Security group names to assign.",
        "immutable": false
      },
      "Volumes": {
        "description": "Volumes to attach to instance.",
        "default": [],
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "Device": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "description": "The device where the volume is exposed on the instance. This assignment may not be honored and it is advised that the path /dev/disk/by-id/virtio-<VolumeId> be used instead.",
                "immutable": false
              },
              "VolumeId": {
                "description": "The ID of the volume to be attached.",
                "required": true,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "cinder.volume"
                  }
                ]
              }
            }
          }
        }
      },
      "SubnetId": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "Subnet ID to launch instance in.",
        "immutable": false
      },
      "SecurityGroupIds": {
        "type": "list",
        "required": false,
        "update_allowed": false,
        "description": "Security group IDs to assign.",
        "immutable": false
      },
      "InstanceType": {
        "description": "Nova instance type (flavor).",
        "required": true,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "nova.flavor"
          }
        ]
      },
      "NetworkInterfaces": {
        "type": "list",
        "required": false,
        "update_allowed": true,
        "description": "Network interfaces to associate with instance.",
        "immutable": false
      }
    },
    "resource_type": "AWS::EC2::Instance"
  },
  "OS::Nova::Server": {
    "attributes": {
      "console_urls": {
        "description": "URLs of server's consoles. To get a specific console type, the requested type can be specified as parameter to the get_attr function, e.g. get_attr: [ <server>, console_urls, novnc ]. Currently supported types are novnc, xvpvnc, spice-html5, rdp-html5, serial."
      },
      "name": {
        "description": "Name of the server."
      },
      "first_address": {
        "description": "Convenience attribute to fetch the first assigned network address, or an empty string if nothing has been assigned at this time. Result may not be predictable if the server has addresses from more than one network."
      },
      "show": {
        "description": "A dict of all server details as returned by the API."
      },
      "instance_name": {
        "description": "AWS compatible instance name."
      },
      "accessIPv4": {
        "description": "The manually assigned alternative public IPv4 address of the server."
      },
      "accessIPv6": {
        "description": "The manually assigned alternative public IPv6 address of the server."
      },
      "networks": {
        "description": "A dict of assigned network addresses of the form: {\"public\": [ip1, ip2...], \"private\": [ip3, ip4]}."
      },
      "addresses": {
        "description": "A dict of all network addresses with corresponding port_id. The port ID may be obtained through the following expression: \"{get_attr: [<server>, addresses, <network name>, 0, port]}\"."
      }
    },
    "properties": {
      "admin_pass": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "The administrator password for the server.",
        "immutable": false
      },
      "user_data_format": {
        "description": "How the user_data should be formatted for the server. For HEAT_CFNTOOLS, the user_data is bundled as part of the heat-cfntools cloud-init boot configuration data. For RAW the user_data is passed to Nova unmodified. For SOFTWARE_CONFIG user_data is bundled as part of the software config data, and metadata is derived from any associated SoftwareDeployment resources.",
        "default": "HEAT_CFNTOOLS",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "HEAT_CFNTOOLS",
              "RAW",
              "SOFTWARE_CONFIG"
            ]
          }
        ]
      },
      "admin_user": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Name of the administrative user to use on the server. This property will be removed from Juno in favor of the default cloud-init user set up for each image (e.g. \"ubuntu\" for Ubuntu 12.04+, \"fedora\" for Fedora 19+ and \"cloud-user\" for CentOS/RHEL 6.5).",
        "immutable": false
      },
      "diskConfig": {
        "description": "Control how the disk is partitioned when the server is created.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "AUTO",
              "MANUAL"
            ]
          }
        ]
      },
      "name": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "Server name.",
        "immutable": false
      },
      "block_device_mapping": {
        "description": "Block device mappings for this server.",
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "volume_size": {
                "type": "integer",
                "required": false,
                "update_allowed": false,
                "description": "The size of the volume, in GB. It is safe to leave this blank and have the Compute service infer the size.",
                "immutable": false
              },
              "volume_id": {
                "description": "The ID of the volume to boot from. Only one of volume_id or snapshot_id should be provided.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "cinder.volume"
                  }
                ]
              },
              "snapshot_id": {
                "description": "The ID of the snapshot to create a volume from.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "cinder.snapshot"
                  }
                ]
              },
              "delete_on_termination": {
                "type": "boolean",
                "required": false,
                "update_allowed": false,
                "description": "Indicate whether the volume should be deleted when the server is terminated.",
                "immutable": false
              },
              "device_name": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "description": "A device name where the volume will be attached in the system at /dev/device_name. This value is typically vda.",
                "immutable": false
              }
            }
          }
        }
      },
      "key_name": {
        "description": "Name of keypair to inject into the server.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "nova.keypair"
          }
        ]
      },
      "image": {
        "description": "The ID or name of the image to boot with.",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "glance.image"
          }
        ]
      },
      "availability_zone": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Name of the availability zone for server placement.",
        "immutable": false
      },
      "image_update_policy": {
        "description": "Policy on how to apply an image-id update; either by requesting a server rebuild or by replacing the entire server",
        "default": "REPLACE",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "REBUILD",
              "REPLACE",
              "REBUILD_PRESERVE_EPHEMERAL"
            ]
          }
        ]
      },
      "software_config_transport": {
        "description": "How the server should receive the metadata required for software configuration. POLL_SERVER_CFN will allow calls to the cfn API action DescribeStackResource authenticated with the provided keypair. POLL_SERVER_HEAT will allow calls to the Heat API resource-show using the provided keystone credentials. POLL_TEMP_URL will create and populate a Swift TempURL with metadata for polling.",
        "default": "POLL_SERVER_CFN",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "POLL_SERVER_CFN",
              "POLL_SERVER_HEAT",
              "POLL_TEMP_URL"
            ]
          }
        ]
      },
      "config_drive": {
        "type": "boolean",
        "required": false,
        "update_allowed": false,
        "description": "If True, enable config drive on the server.",
        "immutable": false
      },
      "personality": {
        "description": "A map of files to create/overwrite on the server upon boot. Keys are file names and values are the file contents.",
        "default": {},
        "required": false,
        "update_allowed": false,
        "type": "map",
        "immutable": false
      },
      "user_data": {
        "description": "User data script to be executed by cloud-init.",
        "default": "",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false
      },
      "flavor_update_policy": {
        "description": "Policy on how to apply a flavor update; either by requesting a server resize or by replacing the entire server.",
        "default": "RESIZE",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "RESIZE",
              "REPLACE"
            ]
          }
        ]
      },
      "flavor": {
        "description": "The ID or name of the flavor to boot onto.",
        "required": true,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "nova.flavor"
          }
        ]
      },
      "metadata": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "description": "Arbitrary key/value metadata to store for this server. Both keys and values must be 255 characters or less. Non-string values will be serialized to JSON (and the serialized string must be 255 characters or less).",
        "immutable": false
      },
      "reservation_id": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "A UUID for the set of servers being requested.",
        "immutable": false
      },
      "networks": {
        "description": "An ordered list of nics to be added to this server, with information about connected networks, fixed ips, port etc.",
        "required": false,
        "update_allowed": true,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "network": {
                "description": "Name or ID of network to create a port on.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "neutron.network"
                  }
                ]
              },
              "fixed_ip": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "description": "Fixed IP address to specify for the port created on the requested network.",
                "immutable": false
              },
              "port": {
                "description": "ID of an existing port to associate with this server.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "neutron.port"
                  }
                ]
              },
              "uuid": {
                "description": "ID of network to create a port on.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "neutron.network"
                  }
                ]
              }
            }
          }
        }
      },
      "security_groups": {
        "description": "List of security group names or IDs. Cannot be used if neutron ports are associated with this server; assign security groups to the ports instead.",
        "default": [],
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false
      },
      "scheduler_hints": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Arbitrary key-value pairs specified by the client to help boot a server.",
        "immutable": false
      }
    },
    "resource_type": "OS::Nova::Server"
  },
  "OS::Heat::ChefSolo": {
    "attributes": {},
    "properties": {
      "username": {
        "description": "The username to connect to the host with.",
        "default": "root",
        "required": true,
        "update_allowed": false,
        "type": "string",
        "immutable": false
      },
      "node": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "The node file for the chef run. May have a run_list, attributes, etc.",
        "immutable": false
      },
      "private_key": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "The ssh key to connect to the host with.",
        "immutable": false
      },
      "clients": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Clients to be written to the kitchen for the chef run.",
        "immutable": false
      },
      "users": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Users to be written to the kitchen for the chef run.",
        "immutable": false
      },
      "Cheffile": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "The Cheffile to use with librarian-chef to download cookbooks on the host for the chef run.",
        "immutable": false
      },
      "Berksfile.lock": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "The Berksfile.lock to use with berkshelf to specify cookbook versions for the chef run.",
        "immutable": false
      },
      "Berksfile": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "The Berksfile to use with berkshelf to download cookbooks on the host for the chef run.",
        "immutable": false
      },
      "data_bags": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Data_bags to write to the kitchen during the chef run.",
        "immutable": false
      },
      "environments": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Environments to be written to the kitchen for the chef run.",
        "immutable": false
      },
      "host": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "The host to run chef-solo on.",
        "immutable": false
      },
      "roles": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Roles to be written to the kitchen for the chef run.",
        "immutable": false
      },
      "chef_version": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "The version of chef to install on the host.",
        "immutable": false
      },
      "kitchen": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "A git url to the kitchen to clone. This can be used in place of a Berks or Chef file to install cookbooks on the host.",
        "immutable": false
      }
    },
    "resource_type": "OS::Heat::ChefSolo"
  },
  "Rackspace::AutoScale::Group": {
    "attributes": {},
    "properties": {
      "launchConfiguration": {
        "description": "Launch configuration.",
        "required": true,
        "update_allowed": true,
        "type": "map",
        "immutable": false,
        "schema": {
          "args": {
            "description": "Type-specific server launching arguments.",
            "required": true,
            "update_allowed": false,
            "type": "map",
            "immutable": false,
            "schema": {
              "loadBalancers": {
                "description": "List of load balancers to hook the server up to. If not specified, no load balancing will be configured.",
                "required": false,
                "update_allowed": false,
                "type": "list",
                "immutable": false,
                "schema": {
                  "*": {
                    "type": "map",
                    "required": false,
                    "update_allowed": false,
                    "immutable": false,
                    "schema": {
                      "port": {
                        "type": "number",
                        "required": true,
                        "update_allowed": false,
                        "description": "Server port to connect the load balancer to.",
                        "immutable": false
                      },
                      "loadBalancerId": {
                        "type": "string",
                        "required": true,
                        "update_allowed": false,
                        "description": "ID of the load balancer.",
                        "immutable": false
                      }
                    }
                  }
                }
              },
              "server": {
                "description": "Server creation arguments, as accepted by the Cloud Servers server creation API.",
                "required": true,
                "update_allowed": false,
                "type": "map",
                "immutable": false,
                "schema": {
                  "name": {
                    "type": "string",
                    "required": true,
                    "update_allowed": false,
                    "description": "Server name.",
                    "immutable": false
                  },
                  "imageRef": {
                    "type": "string",
                    "required": true,
                    "update_allowed": false,
                    "description": "Image ID.",
                    "immutable": false
                  },
                  "key_name": {
                    "type": "string",
                    "required": false,
                    "update_allowed": false,
                    "description": "Name of a previously created SSH keypair to allow key-based authentication to the server.",
                    "immutable": false
                  },
                  "flavorRef": {
                    "type": "string",
                    "required": true,
                    "update_allowed": false,
                    "description": "Flavor ID.",
                    "immutable": false
                  },
                  "user_data": {
                    "type": "string",
                    "required": false,
                    "update_allowed": false,
                    "description": "User data for bootstrapping the instance.",
                    "immutable": false
                  },
                  "diskConfig": {
                    "description": "Configuration specifying the partition layout. AUTO to create a partition utilizing the entire disk, and MANUAL to create a partition matching the source image.",
                    "required": false,
                    "update_allowed": false,
                    "type": "string",
                    "immutable": false,
                    "constraints": [
                      {
                        "allowed_values": [
                          "AUTO",
                          "MANUAL"
                        ]
                      }
                    ]
                  },
                  "personality": {
                    "type": "map",
                    "required": false,
                    "update_allowed": false,
                    "description": "File path and contents.",
                    "immutable": false
                  },
                  "config_drive": {
                    "type": "boolean",
                    "required": false,
                    "update_allowed": false,
                    "description": "Enable config drive on the instance.",
                    "immutable": false
                  },
                  "networks": {
                    "description": "Networks to attach to. If unspecified, the instance will be attached to the public Internet and private ServiceNet networks.",
                    "required": false,
                    "update_allowed": false,
                    "type": "list",
                    "immutable": false,
                    "schema": {
                      "*": {
                        "type": "map",
                        "required": false,
                        "update_allowed": false,
                        "immutable": false,
                        "schema": {
                          "uuid": {
                            "type": "string",
                            "required": true,
                            "update_allowed": false,
                            "description": "UUID of network to attach to.",
                            "immutable": false
                          }
                        }
                      }
                    }
                  },
                  "metadata": {
                    "type": "map",
                    "required": false,
                    "update_allowed": false,
                    "description": "Metadata key and value pairs.",
                    "immutable": false
                  }
                }
              }
            }
          },
          "type": {
            "description": "Launch configuration method. Only launch_server is currently supported.",
            "required": true,
            "update_allowed": false,
            "type": "string",
            "immutable": false,
            "constraints": [
              {
                "allowed_values": [
                  "launch_server"
                ]
              }
            ]
          }
        }
      },
      "groupConfiguration": {
        "description": "Group configuration.",
        "required": true,
        "update_allowed": true,
        "type": "map",
        "immutable": false,
        "schema": {
          "maxEntities": {
            "type": "number",
            "required": true,
            "update_allowed": false,
            "description": "Maximum number of entities in this scaling group.",
            "immutable": false
          },
          "cooldown": {
            "type": "number",
            "required": true,
            "update_allowed": false,
            "description": "Number of seconds after capacity changes during which further capacity changes are disabled.",
            "immutable": false
          },
          "name": {
            "type": "string",
            "required": true,
            "update_allowed": false,
            "description": "Name of the scaling group.",
            "immutable": false
          },
          "minEntities": {
            "type": "number",
            "required": true,
            "update_allowed": false,
            "description": "Minimum number of entities in this scaling group.",
            "immutable": false
          },
          "metadata": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "description": "Arbitrary key/value metadata to associate with this group.",
            "immutable": false
          }
        }
      }
    },
    "resource_type": "Rackspace::AutoScale::Group"
  },
  "OS::Heat::ResourceGroup": {
    "attributes": {
      "attributes": {
        "description": "A map of resource names to the specified attribute of each individual resource. Requires heat_template_version: 2014-10-16."
      },
      "refs": {
        "description": "A list of resource IDs for the resources in the group"
      }
    },
    "properties": {
      "count": {
        "description": "The number of instances to create.",
        "default": 1,
        "required": false,
        "update_allowed": true,
        "type": "integer",
        "immutable": false,
        "constraints": [
          {
            "range": {
              "min": 0
            }
          }
        ]
      },
      "resource_def": {
        "description": "Resource definition for the resources in the group. The value of this property is the definition of a resource just as if it had been declared in the template itself.",
        "required": true,
        "update_allowed": true,
        "type": "map",
        "immutable": false,
        "schema": {
          "type": {
            "type": "string",
            "required": true,
            "update_allowed": false,
            "description": "The type of the resources in the group",
            "immutable": false
          },
          "properties": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "description": "Property values for the resources in the group",
            "immutable": false
          }
        }
      },
      "removal_policies": {
        "description": "Policies for removal of resources on update",
        "default": [],
        "required": false,
        "update_allowed": true,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "description": "Policy to be processed when doing an update which requires removal of specific resources.",
            "required": false,
            "update_allowed": false,
            "type": "map",
            "immutable": false,
            "schema": {
              "resource_list": {
                "description": "List of resources to be removed when doing an update which requires removal of specific resources. The resource may be specified several ways: (1) The resource name, as in the nested stack, (2) The resource reference returned from get_resource in a template, as available via the 'refs' attribute Note this is destructive on update when specified; even if the count is not being reduced, and once a resource name is removed, it's name is never reused in subsequent updates",
                "default": [],
                "required": false,
                "update_allowed": false,
                "type": "list",
                "immutable": false
              }
            }
          }
        }
      },
      "index_var": {
        "description": "A variable that this resource will use to replace with the current index of a given resource in the group. Can be used, for example, to customize the name property of grouped servers in order to differentiate them when listed with nova client.",
        "default": "%index%",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "min": 3
            }
          }
        ]
      }
    },
    "resource_type": "OS::Heat::ResourceGroup"
  },
  "AWS::CloudFormation::WaitConditionHandle": {
    "attributes": {
      "curl_cli": {
        "description": "Convenience attribute, provides curl CLI command prefix, which can be used for signalling handle completion or failure. You can signal success by adding --data-binary '{\"status\": \"SUCCESS\"}' , or signal failure by adding --data-binary '{\"status\": \"FAILURE\"}'"
      },
      "token": {
        "description": "Tokens are not needed for Swift TempURLs. This attribute is being kept for compatibility with the OS::Heat::WaitConditionHandle resource"
      },
      "endpoint": {
        "description": "Endpoint/url which can be used for signalling handle"
      }
    },
    "properties": {},
    "resource_type": "AWS::CloudFormation::WaitConditionHandle"
  },
  "Rackspace::RackConnect::PublicIP": {
    "attributes": {},
    "properties": {
      "server_id": {
        "description": "The id of the server to be added.",
        "required": true,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "nova.server"
          }
        ]
      }
    },
    "resource_type": "Rackspace::RackConnect::PublicIP"
  },
  "Rackspace::CloudMonitoring::Check": {
    "attributes": {
      "show": {
        "description": "A dict of all entity details as returned by the API."
      }
    },
    "properties": {
      "target_alias": {
        "description": "A key in the entity's 'ip_addresses' hash used to resolve this check to an IP address. This parameter is mutually exclusive with target_hostname.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 64,
              "min": 1
            }
          }
        ]
      },
      "period": {
        "description": "The period in seconds for a check. The value must be greater than the minimum period set on your account.",
        "default": 60,
        "required": false,
        "update_allowed": true,
        "type": "integer",
        "immutable": false,
        "constraints": [
          {
            "range": {
              "max": 1800,
              "min": 30
            }
          }
        ]
      },
      "label": {
        "description": "A friendly label for this resource",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 255,
              "min": 1
            }
          }
        ]
      },
      "disabled": {
        "description": "Disables the check",
        "default": false,
        "required": false,
        "update_allowed": true,
        "type": "boolean",
        "immutable": false
      },
      "target_hostname": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "The hostname this check should target. This parameter is mutually exclusive with target_alias. Value must be a Valid FQDN, IPv4 or IPv6 address",
        "immutable": false
      },
      "details": {
        "description": "A hash of type-specific details",
        "default": {},
        "required": false,
        "update_allowed": false,
        "type": "map",
        "immutable": false
      },
      "timeout": {
        "description": "The timeout in seconds for a check. This has to be less than the period.",
        "default": 30,
        "required": false,
        "update_allowed": true,
        "type": "integer",
        "immutable": false,
        "constraints": [
          {
            "range": {
              "max": 1800,
              "min": 2
            }
          }
        ]
      },
      "monitoring_zones_poll": {
        "description": "List of monitoring zones to poll from. Note: This argument is only required for remote (non-agent) checks",
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "string",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "constraints": [
              {
                "custom_constraint": "monitoring.zone"
              }
            ]
          }
        }
      },
      "target_receiver": {
        "description": "Determines how to resolve the check target.",
        "default": "IPv4",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "IPv4",
              "IPv6"
            ]
          }
        ]
      },
      "entity": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "The id of the entity for which to create the check. This can either be the id of a configured monitoring entity, a cloud server or a cloud database instance.",
        "immutable": false
      },
      "type": {
        "description": "The specific type of resource",
        "required": true,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 64,
              "min": 1
            }
          }
        ]
      },
      "metadata": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "description": "Arbitrary key/value pairs that are passed during the alerting phase. Both keys and values must be 255 characters or less. Non-string values will be serialized to JSON (and the serialized string must be 255 characters or less).",
        "immutable": false
      }
    },
    "resource_type": "Rackspace::CloudMonitoring::Check"
  },
  "OS::Neutron::Net": {
    "attributes": {
      "status": {
        "description": "The status of the network."
      },
      "subnets": {
        "description": "Subnets of this network."
      },
      "name": {
        "description": "The name of the network."
      },
      "show": {
        "description": "All attributes."
      },
      "tenant_id": {
        "description": "The tenant owning this network."
      },
      "admin_state_up": {
        "description": "The administrative status of the network."
      }
    },
    "properties": {
      "dhcp_agent_ids": {
        "type": "list",
        "required": false,
        "update_allowed": true,
        "description": "The IDs of the DHCP agent to schedule the network. Note that the default policy setting in Neutron restricts usage of this property to administrative users only.",
        "immutable": false
      },
      "name": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "A string specifying a symbolic name for the network, which is not required to be unique.",
        "immutable": false
      },
      "admin_state_up": {
        "description": "A boolean value specifying the administrative status of the network.",
        "default": true,
        "required": false,
        "update_allowed": true,
        "type": "boolean",
        "immutable": false
      },
      "tenant_id": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "The ID of the tenant which will own the network. Only administrative users can set the tenant identifier; this cannot be changed using authorization policies.",
        "immutable": false
      },
      "value_specs": {
        "description": "Extra parameters to include in the \"network\" object in the creation request. Parameters are often specific to installed hardware or extensions.",
        "default": {},
        "required": false,
        "update_allowed": true,
        "type": "map",
        "immutable": false
      },
      "shared": {
        "description": "Whether this network should be shared across all tenants. Note that the default policy setting restricts usage of this attribute to administrative users only.",
        "default": false,
        "required": false,
        "update_allowed": true,
        "type": "boolean",
        "immutable": false
      }
    },
    "resource_type": "OS::Neutron::Net"
  },
  "Rackspace::CloudMonitoring::Entity": {
    "attributes": {
      "show": {
        "description": "A dict of all entity details as returned by the API."
      }
    },
    "properties": {
      "ip_addresses": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "IP addresses that can be referenced by checks on this entity. Keys must be between 1 and 64 characters long. Values must be valid IPv4 or IPv6 addresses.",
        "immutable": false
      },
      "metadata": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "description": "Arbitrary key/value pairs that are passed during the alerting phase. Both keys and values must be 255 characters or less. Non-string values will be serialized to JSON (and the serialized string must be 255 characters or less).",
        "immutable": false
      },
      "agent_id": {
        "description": "Agent to which this entity is bound",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_pattern": "[-\\.\\w]+"
          },
          {
            "length": {
              "max": 255,
              "min": 1
            }
          }
        ]
      },
      "label": {
        "description": "A friendly label for this resource",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 255,
              "min": 1
            }
          }
        ]
      }
    },
    "resource_type": "Rackspace::CloudMonitoring::Entity"
  },
  "Rackspace::AutoScale::ScalingPolicy": {
    "attributes": {},
    "properties": {
      "group": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "Scaling group ID that this policy belongs to.",
        "immutable": false
      },
      "name": {
        "type": "string",
        "required": true,
        "update_allowed": true,
        "description": "Name of this scaling policy.",
        "immutable": false
      },
      "args": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "description": "Type-specific arguments for the policy.",
        "immutable": false
      },
      "changePercent": {
        "type": "number",
        "required": false,
        "update_allowed": true,
        "description": "Percentage-based change to add or remove from current number of instances. Incompatible with change and desiredCapacity.",
        "immutable": false
      },
      "cooldown": {
        "type": "number",
        "required": false,
        "update_allowed": true,
        "description": "Number of seconds after a policy execution during which further executions are disabled.",
        "immutable": false
      },
      "type": {
        "description": "Type of this scaling policy. Specifies how the policy is executed.",
        "required": true,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "webhook",
              "schedule",
              "cloud_monitoring"
            ]
          }
        ]
      },
      "change": {
        "type": "number",
        "required": false,
        "update_allowed": true,
        "description": "Amount to add to or remove from current number of instances. Incompatible with changePercent and desiredCapacity.",
        "immutable": false
      },
      "desiredCapacity": {
        "type": "number",
        "required": false,
        "update_allowed": true,
        "description": "Absolute number to set the number of instances to. Incompatible with change and changePercent.",
        "immutable": false
      }
    },
    "resource_type": "Rackspace::AutoScale::ScalingPolicy"
  },
  "Rackspace::Cloud::Server": {
    "attributes": {
      "admin_pass": {
        "description": "The administrator password for the server."
      },
      "console_urls": {
        "description": "URLs of server's consoles. To get a specific console type, the requested type can be specified as parameter to the get_attr function, e.g. get_attr: [ <server>, console_urls, novnc ]. Currently supported types are novnc, xvpvnc, spice-html5, rdp-html5, serial."
      },
      "name": {
        "description": "Name of the server."
      },
      "first_address": {
        "description": "Convenience attribute to fetch the first assigned network address, or an empty string if nothing has been assigned at this time. Result may not be predictable if the server has addresses from more than one network."
      },
      "show": {
        "description": "A dict of all server details as returned by the API."
      },
      "instance_name": {
        "description": "AWS compatible instance name."
      },
      "accessIPv4": {
        "description": "The manually assigned alternative public IPv4 address of the server."
      },
      "accessIPv6": {
        "description": "The manually assigned alternative public IPv6 address of the server."
      },
      "privateIPv4": {
        "description": "The private IPv4 address of the server."
      },
      "distro": {
        "description": "The Linux distribution on the server."
      },
      "networks": {
        "description": "A dict of assigned network addresses of the form: {\"public\": [ip1, ip2...], \"private\": [ip3, ip4]}."
      },
      "addresses": {
        "description": "A dict of all network addresses with corresponding port_id. The port ID may be obtained through the following expression: \"{get_attr: [<server>, addresses, <network name>, 0, port]}\"."
      }
    },
    "properties": {
      "admin_pass": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "The administrator password for the server.",
        "immutable": false
      },
      "availability_zone": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Name of the availability zone for server placement.",
        "immutable": false
      },
      "personality": {
        "description": "A map of files to create/overwrite on the server upon boot. Keys are file names and values are the file contents.",
        "default": {},
        "required": false,
        "update_allowed": false,
        "type": "map",
        "immutable": false
      },
      "image": {
        "description": "The ID or name of the image to boot with.",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "glance.image"
          }
        ]
      },
      "user_data": {
        "description": "User data script to be executed by cloud-init.",
        "default": "",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false
      },
      "diskConfig": {
        "description": "Control how the disk is partitioned when the server is created.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "AUTO",
              "MANUAL"
            ]
          }
        ]
      },
      "flavor_update_policy": {
        "description": "Policy on how to apply a flavor update; either by requesting a server resize or by replacing the entire server.",
        "default": "RESIZE",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "RESIZE",
              "REPLACE"
            ]
          }
        ]
      },
      "save_admin_pass": {
        "description": "True if the system should remember the admin password; False otherwise.",
        "default": false,
        "required": false,
        "update_allowed": false,
        "type": "boolean",
        "immutable": false
      },
      "reservation_id": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "A UUID for the set of servers being requested.",
        "immutable": false
      },
      "flavor": {
        "description": "The ID or name of the flavor to boot onto.",
        "required": true,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "nova.flavor"
          }
        ]
      },
      "security_groups": {
        "description": "List of security group names or IDs. Cannot be used if neutron ports are associated with this server; assign security groups to the ports instead.",
        "default": [],
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false
      },
      "scheduler_hints": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Arbitrary key-value pairs specified by the client to help boot a server.",
        "immutable": false
      },
      "networks": {
        "description": "An ordered list of nics to be added to this server, with information about connected networks, fixed ips, port etc.",
        "required": false,
        "update_allowed": true,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "uuid": {
                "description": "ID of network to create a port on.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "neutron.network"
                  }
                ]
              },
              "fixed_ip": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "description": "Fixed IP address to specify for the port created on the requested network.",
                "immutable": false
              },
              "network": {
                "description": "Name or ID of network to create a port on.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "neutron.network"
                  }
                ]
              },
              "port": {
                "description": "ID of an existing port to associate with this server.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "neutron.port"
                  }
                ]
              }
            }
          }
        }
      },
      "metadata": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "description": "Arbitrary key/value metadata to store for this server. Both keys and values must be 255 characters or less. Non-string values will be serialized to JSON (and the serialized string must be 255 characters or less).",
        "immutable": false
      },
      "user_data_format": {
        "description": "How the user_data should be formatted for the server. For HEAT_CFNTOOLS, the user_data is bundled as part of the heat-cfntools cloud-init boot configuration data. For RAW the user_data is passed to Nova unmodified. For SOFTWARE_CONFIG user_data is bundled as part of the software config data, and metadata is derived from any associated SoftwareDeployment resources.",
        "default": "HEAT_CFNTOOLS",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "HEAT_CFNTOOLS",
              "RAW",
              "SOFTWARE_CONFIG"
            ]
          }
        ]
      },
      "admin_user": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Name of the administrative user to use on the server. This property will be removed from Juno in favor of the default cloud-init user set up for each image (e.g. \"ubuntu\" for Ubuntu 12.04+, \"fedora\" for Fedora 19+ and \"cloud-user\" for CentOS/RHEL 6.5).",
        "immutable": false
      },
      "block_device_mapping": {
        "description": "Block device mappings for this server.",
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "device_name": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "description": "A device name where the volume will be attached in the system at /dev/device_name. This value is typically vda.",
                "immutable": false
              },
              "volume_size": {
                "type": "integer",
                "required": false,
                "update_allowed": false,
                "description": "The size of the volume, in GB. It is safe to leave this blank and have the Compute service infer the size.",
                "immutable": false
              },
              "snapshot_id": {
                "description": "The ID of the snapshot to create a volume from.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "cinder.snapshot"
                  }
                ]
              },
              "delete_on_termination": {
                "type": "boolean",
                "required": false,
                "update_allowed": false,
                "description": "Indicate whether the volume should be deleted when the server is terminated.",
                "immutable": false
              },
              "volume_id": {
                "description": "The ID of the volume to boot from. Only one of volume_id or snapshot_id should be provided.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "cinder.volume"
                  }
                ]
              }
            }
          }
        }
      },
      "key_name": {
        "description": "Name of keypair to inject into the server.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "nova.keypair"
          }
        ]
      },
      "software_config_transport": {
        "description": "How the server should receive the metadata required for software configuration. POLL_SERVER_CFN will allow calls to the cfn API action DescribeStackResource authenticated with the provided keypair. POLL_SERVER_HEAT will allow calls to the Heat API resource-show using the provided keystone credentials. POLL_TEMP_URL will create and populate a Swift TempURL with metadata for polling.",
        "default": "POLL_SERVER_CFN",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "POLL_SERVER_CFN",
              "POLL_SERVER_HEAT",
              "POLL_TEMP_URL"
            ]
          }
        ]
      },
      "name": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "Server name.",
        "immutable": false
      },
      "image_update_policy": {
        "description": "Policy on how to apply an image-id update; either by requesting a server rebuild or by replacing the entire server",
        "default": "REPLACE",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "REBUILD",
              "REPLACE",
              "REBUILD_PRESERVE_EPHEMERAL"
            ]
          }
        ]
      },
      "config_drive": {
        "type": "boolean",
        "required": false,
        "update_allowed": false,
        "description": "If True, enable config drive on the server.",
        "immutable": false
      }
    },
    "resource_type": "Rackspace::Cloud::Server"
  },
  "OS::Heat::SwiftSignal": {
    "attributes": {
      "data": {
        "description": "JSON data that was uploaded via the SwiftSignalHandle."
      }
    },
    "properties": {
      "count": {
        "description": "The number of success signals that must be received before the stack creation process continues.",
        "default": 1,
        "required": false,
        "update_allowed": false,
        "type": "number",
        "immutable": false,
        "constraints": [
          {
            "range": {
              "max": 1000,
              "min": 1
            }
          }
        ]
      },
      "handle": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "URL of TempURL where resource will signal completion and optionally upload data.",
        "immutable": false
      },
      "timeout": {
        "description": "The maximum number of seconds to wait for the resource to signal completion. Once the timeout is reached, creation of the signal resource will fail.",
        "required": true,
        "update_allowed": false,
        "type": "number",
        "immutable": false,
        "constraints": [
          {
            "range": {
              "max": 43200,
              "min": 1
            }
          }
        ]
      }
    },
    "resource_type": "OS::Heat::SwiftSignal"
  },
  "AWS::ElasticLoadBalancing::LoadBalancer": {
    "attributes": {
      "SourceSecurityGroup.OwnerAlias": {
        "description": "Owner of the source security group."
      },
      "CanonicalHostedZoneNameID": {
        "description": "The ID of the hosted zone name that is associated with the LoadBalancer."
      },
      "DNSName": {
        "description": "The DNS name for the LoadBalancer."
      },
      "SourceSecurityGroup.GroupName": {
        "description": "The security group that you can use as part of your inbound rules for your LoadBalancer's back-end instances."
      },
      "CanonicalHostedZoneName": {
        "description": "The name of the hosted zone that is associated with the LoadBalancer."
      }
    },
    "properties": {
      "HealthCheck": {
        "description": "An application health check for the instances.",
        "required": false,
        "update_allowed": false,
        "type": "map",
        "immutable": false,
        "schema": {
          "HealthyThreshold": {
            "type": "number",
            "required": true,
            "update_allowed": false,
            "description": "The number of consecutive health probe successes required before moving the instance to the healthy state.",
            "immutable": false
          },
          "Interval": {
            "type": "number",
            "required": true,
            "update_allowed": false,
            "description": "The approximate interval, in seconds, between health checks of an individual instance.",
            "immutable": false
          },
          "Target": {
            "type": "string",
            "required": true,
            "update_allowed": false,
            "description": "The port being checked.",
            "immutable": false
          },
          "Timeout": {
            "type": "number",
            "required": true,
            "update_allowed": false,
            "description": "Health probe timeout, in seconds.",
            "immutable": false
          },
          "UnhealthyThreshold": {
            "type": "number",
            "required": true,
            "update_allowed": false,
            "description": "The number of consecutive health probe failures required before moving the instance to the unhealthy state",
            "immutable": false
          }
        }
      },
      "Listeners": {
        "description": "One or more listeners for this load balancer.",
        "required": true,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "InstancePort": {
                "type": "number",
                "required": true,
                "update_allowed": false,
                "description": "TCP port on which the instance server is listening.",
                "immutable": false
              },
              "Protocol": {
                "description": "The load balancer transport protocol to use.",
                "required": true,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "allowed_values": [
                      "TCP",
                      "HTTP"
                    ]
                  }
                ]
              },
              "LoadBalancerPort": {
                "type": "number",
                "required": true,
                "update_allowed": false,
                "description": "The external load balancer port number.",
                "immutable": false
              },
              "SSLCertificateId": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "description": "Not Implemented.",
                "immutable": false
              },
              "PolicyNames": {
                "type": "list",
                "required": false,
                "update_allowed": false,
                "description": "Not Implemented.",
                "immutable": false
              }
            }
          }
        }
      },
      "AvailabilityZones": {
        "type": "list",
        "required": true,
        "update_allowed": false,
        "description": "The Availability Zones in which to create the load balancer.",
        "immutable": false
      },
      "Instances": {
        "type": "list",
        "required": false,
        "update_allowed": true,
        "description": "The list of instance IDs load balanced.",
        "immutable": false
      }
    },
    "resource_type": "AWS::ElasticLoadBalancing::LoadBalancer"
  },
  "Rackspace::Cloud::ChefSolo": {
    "attributes": {},
    "properties": {
      "username": {
        "description": "The username to connect to the host with.",
        "default": "root",
        "required": true,
        "update_allowed": false,
        "type": "string",
        "immutable": false
      },
      "node": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "The node file for the chef run. May have a run_list, attributes, etc.",
        "immutable": false
      },
      "private_key": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "The ssh key to connect to the host with.",
        "immutable": false
      },
      "clients": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Clients to be written to the kitchen for the chef run.",
        "immutable": false
      },
      "users": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Users to be written to the kitchen for the chef run.",
        "immutable": false
      },
      "Cheffile": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "The Cheffile to use with librarian-chef to download cookbooks on the host for the chef run.",
        "immutable": false
      },
      "Berksfile.lock": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "The Berksfile.lock to use with berkshelf to specify cookbook versions for the chef run.",
        "immutable": false
      },
      "Berksfile": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "The Berksfile to use with berkshelf to download cookbooks on the host for the chef run.",
        "immutable": false
      },
      "data_bags": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Data_bags to write to the kitchen during the chef run.",
        "immutable": false
      },
      "environments": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Environments to be written to the kitchen for the chef run.",
        "immutable": false
      },
      "host": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "The host to run chef-solo on.",
        "immutable": false
      },
      "roles": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Roles to be written to the kitchen for the chef run.",
        "immutable": false
      },
      "chef_version": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "The version of chef to install on the host.",
        "immutable": false
      },
      "kitchen": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "A git url to the kitchen to clone. This can be used in place of a Berks or Chef file to install cookbooks on the host.",
        "immutable": false
      }
    },
    "resource_type": "Rackspace::Cloud::ChefSolo"
  },
  "Rackspace::AutoScale::WebHook": {
    "attributes": {
      "capabilityUrl": {
        "description": "The url for executing the webhook (doesn't require auth)."
      },
      "executeUrl": {
        "description": "The url for executing the webhook (requires auth)."
      }
    },
    "properties": {
      "policy": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "The policy that this webhook should apply to, in {group_id}:{policy_id} format. Generally a Ref to a Policy resource.",
        "immutable": false
      },
      "name": {
        "type": "string",
        "required": true,
        "update_allowed": true,
        "description": "The name of this webhook.",
        "immutable": false
      },
      "metadata": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "description": "Arbitrary key/value metadata for this webhook.",
        "immutable": false
      }
    },
    "resource_type": "Rackspace::AutoScale::WebHook"
  },
  "Rackspace::CloudMonitoring::NotificationPlan": {
    "attributes": {
      "show": {
        "description": "A dict of all entity details as returned by the API."
      }
    },
    "properties": {
      "ok_state": {
        "type": "list",
        "required": false,
        "update_allowed": true,
        "description": "The notification list to send to when the state is OK.",
        "immutable": false
      },
      "warning_state": {
        "type": "list",
        "required": false,
        "update_allowed": true,
        "description": "The notification list to send to when the state is WARNING.",
        "immutable": false
      },
      "critical_state": {
        "type": "list",
        "required": false,
        "update_allowed": true,
        "description": "The notification list to send to when the state is CRITICAL.",
        "immutable": false
      },
      "label": {
        "description": "A friendly label for this resource",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 255,
              "min": 1
            }
          }
        ]
      }
    },
    "resource_type": "Rackspace::CloudMonitoring::NotificationPlan"
  },
  "Rackspace::Cloud::WinServer": {
    "attributes": {
      "admin_pass": {
        "description": "The administrator password for the server."
      },
      "console_urls": {
        "description": "URLs of server's consoles. To get a specific console type, the requested type can be specified as parameter to the get_attr function, e.g. get_attr: [ <server>, console_urls, novnc ]. Currently supported types are novnc, xvpvnc, spice-html5, rdp-html5, serial."
      },
      "name": {
        "description": "Name of the server."
      },
      "first_address": {
        "description": "Convenience attribute to fetch the first assigned network address, or an empty string if nothing has been assigned at this time. Result may not be predictable if the server has addresses from more than one network."
      },
      "show": {
        "description": "A dict of all server details as returned by the API."
      },
      "instance_name": {
        "description": "AWS compatible instance name."
      },
      "accessIPv4": {
        "description": "The manually assigned alternative public IPv4 address of the server."
      },
      "accessIPv6": {
        "description": "The manually assigned alternative public IPv6 address of the server."
      },
      "privateIPv4": {
        "description": "The private IPv4 address of the server."
      },
      "networks": {
        "description": "A dict of assigned network addresses of the form: {\"public\": [ip1, ip2...], \"private\": [ip3, ip4]}."
      },
      "addresses": {
        "description": "A dict of all network addresses with corresponding port_id. The port ID may be obtained through the following expression: \"{get_attr: [<server>, addresses, <network name>, 0, port]}\"."
      }
    },
    "properties": {
      "admin_pass": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "The administrator password for the server.",
        "immutable": false
      },
      "availability_zone": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Name of the availability zone for server placement.",
        "immutable": false
      },
      "personality": {
        "description": "A map of files to create/overwrite on the server upon boot. Keys are file names and values are the file contents.",
        "default": {},
        "required": false,
        "update_allowed": false,
        "type": "map",
        "immutable": false
      },
      "image": {
        "description": "The ID or name of the image to boot with.",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "glance.image"
          }
        ]
      },
      "user_data": {
        "description": "User data script to be executed by cloud-init.",
        "default": "",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false
      },
      "diskConfig": {
        "description": "Control how the disk is partitioned when the server is created.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "AUTO",
              "MANUAL"
            ]
          }
        ]
      },
      "flavor_update_policy": {
        "description": "Policy on how to apply a flavor update; either by requesting a server resize or by replacing the entire server.",
        "default": "RESIZE",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "RESIZE",
              "REPLACE"
            ]
          }
        ]
      },
      "save_admin_pass": {
        "description": "True if the system should remember the admin password; False otherwise.",
        "default": false,
        "required": false,
        "update_allowed": false,
        "type": "boolean",
        "immutable": false
      },
      "reservation_id": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "A UUID for the set of servers being requested.",
        "immutable": false
      },
      "flavor": {
        "description": "The ID or name of the flavor to boot onto.",
        "required": true,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "nova.flavor"
          }
        ]
      },
      "security_groups": {
        "description": "List of security group names or IDs. Cannot be used if neutron ports are associated with this server; assign security groups to the ports instead.",
        "default": [],
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false
      },
      "scheduler_hints": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Arbitrary key-value pairs specified by the client to help boot a server.",
        "immutable": false
      },
      "networks": {
        "description": "An ordered list of nics to be added to this server, with information about connected networks, fixed ips, port etc.",
        "required": false,
        "update_allowed": true,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "uuid": {
                "description": "ID of network to create a port on.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "neutron.network"
                  }
                ]
              },
              "fixed_ip": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "description": "Fixed IP address to specify for the port created on the requested network.",
                "immutable": false
              },
              "network": {
                "description": "Name or ID of network to create a port on.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "neutron.network"
                  }
                ]
              },
              "port": {
                "description": "ID of an existing port to associate with this server.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "neutron.port"
                  }
                ]
              }
            }
          }
        }
      },
      "metadata": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "description": "Arbitrary key/value metadata to store for this server. Both keys and values must be 255 characters or less. Non-string values will be serialized to JSON (and the serialized string must be 255 characters or less).",
        "immutable": false
      },
      "user_data_format": {
        "description": "How the user_data should be formatted for the server. For HEAT_CFNTOOLS, the user_data is bundled as part of the heat-cfntools cloud-init boot configuration data. For RAW the user_data is passed to Nova unmodified. For SOFTWARE_CONFIG user_data is bundled as part of the software config data, and metadata is derived from any associated SoftwareDeployment resources.",
        "default": "HEAT_CFNTOOLS",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "HEAT_CFNTOOLS",
              "RAW",
              "SOFTWARE_CONFIG"
            ]
          }
        ]
      },
      "admin_user": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Name of the administrative user to use on the server. This property will be removed from Juno in favor of the default cloud-init user set up for each image (e.g. \"ubuntu\" for Ubuntu 12.04+, \"fedora\" for Fedora 19+ and \"cloud-user\" for CentOS/RHEL 6.5).",
        "immutable": false
      },
      "block_device_mapping": {
        "description": "Block device mappings for this server.",
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "device_name": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "description": "A device name where the volume will be attached in the system at /dev/device_name. This value is typically vda.",
                "immutable": false
              },
              "volume_size": {
                "type": "integer",
                "required": false,
                "update_allowed": false,
                "description": "The size of the volume, in GB. It is safe to leave this blank and have the Compute service infer the size.",
                "immutable": false
              },
              "snapshot_id": {
                "description": "The ID of the snapshot to create a volume from.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "cinder.snapshot"
                  }
                ]
              },
              "delete_on_termination": {
                "type": "boolean",
                "required": false,
                "update_allowed": false,
                "description": "Indicate whether the volume should be deleted when the server is terminated.",
                "immutable": false
              },
              "volume_id": {
                "description": "The ID of the volume to boot from. Only one of volume_id or snapshot_id should be provided.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "cinder.volume"
                  }
                ]
              }
            }
          }
        }
      },
      "key_name": {
        "description": "Name of keypair to inject into the server.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "nova.keypair"
          }
        ]
      },
      "software_config_transport": {
        "description": "How the server should receive the metadata required for software configuration. POLL_SERVER_CFN will allow calls to the cfn API action DescribeStackResource authenticated with the provided keypair. POLL_SERVER_HEAT will allow calls to the Heat API resource-show using the provided keystone credentials. POLL_TEMP_URL will create and populate a Swift TempURL with metadata for polling.",
        "default": "POLL_SERVER_CFN",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "POLL_SERVER_CFN",
              "POLL_SERVER_HEAT",
              "POLL_TEMP_URL"
            ]
          }
        ]
      },
      "name": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "Server name.",
        "immutable": false
      },
      "image_update_policy": {
        "description": "Policy on how to apply an image-id update; either by requesting a server rebuild or by replacing the entire server",
        "default": "REPLACE",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "REBUILD",
              "REPLACE",
              "REBUILD_PRESERVE_EPHEMERAL"
            ]
          }
        ]
      },
      "config_drive": {
        "type": "boolean",
        "required": false,
        "update_allowed": false,
        "description": "If True, enable config drive on the server.",
        "immutable": false
      }
    },
    "resource_type": "Rackspace::Cloud::WinServer"
  },
  "Rackspace::CloudMonitoring::Notification": {
    "attributes": {
      "show": {
        "description": "A dict of all entity details as returned by the API."
      }
    },
    "properties": {
      "type": {
        "description": "The specific type of resource",
        "required": true,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 64,
              "min": 1
            }
          },
          {
            "custom_constraint": "monitoring.notificationtype"
          }
        ]
      },
      "details": {
        "description": "A hash of type-specific details. See http://docs.rackspace.com/cm/api/v1.0/cm-devguide/content/service-notification-types-crud.html",
        "default": {},
        "required": false,
        "update_allowed": false,
        "type": "map",
        "immutable": false
      },
      "label": {
        "description": "A friendly label for this resource",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 255,
              "min": 1
            }
          }
        ]
      }
    },
    "resource_type": "Rackspace::CloudMonitoring::Notification"
  },
  "Rackspace::RackConnect::PoolNode": {
    "attributes": {},
    "properties": {
      "server_id": {
        "description": "The id of the server to be added.",
        "required": true,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "nova.server"
          }
        ]
      },
      "pool": {
        "description": "The id of the pool.",
        "required": true,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "rackconnect.pool"
          }
        ]
      }
    },
    "resource_type": "Rackspace::RackConnect::PoolNode"
  },
  "DockerInc::Docker::Container": {
    "attributes": {
      "info": {
        "description": "Container info."
      },
      "logs_tail": {
        "description": "Container last logs line."
      },
      "logs": {
        "description": "Container logs."
      },
      "network_udp_ports": {
        "description": "Container UDP ports."
      },
      "network_tcp_ports": {
        "description": "Container TCP ports."
      },
      "network_gateway": {
        "description": "Container ip gateway."
      },
      "network_info": {
        "description": "Container network info."
      },
      "logs_head": {
        "description": "Container first logs line."
      },
      "network_ip": {
        "description": "Container ip address."
      }
    },
    "properties": {
      "tty": {
        "description": "Allocate a pseudo-tty.",
        "default": false,
        "required": false,
        "update_allowed": false,
        "type": "boolean",
        "immutable": false
      },
      "cmd": {
        "description": "Command to run after spawning the container.",
        "default": [],
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false
      },
      "stdin_once": {
        "description": "If true, close stdin after the 1 attached client disconnects.",
        "default": false,
        "required": false,
        "update_allowed": false,
        "type": "boolean",
        "immutable": false
      },
      "port_specs": {
        "type": "list",
        "required": false,
        "update_allowed": false,
        "description": "TCP/UDP ports mapping.",
        "immutable": false
      },
      "links": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Links to other containers.",
        "immutable": false
      },
      "image": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Image name.",
        "immutable": false
      },
      "hostname": {
        "description": "Hostname of the container.",
        "default": "",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false
      },
      "open_stdin": {
        "description": "Open stdin.",
        "default": false,
        "required": false,
        "update_allowed": false,
        "type": "boolean",
        "immutable": false
      },
      "dns": {
        "type": "list",
        "required": false,
        "update_allowed": false,
        "description": "Set custom dns servers.",
        "immutable": false
      },
      "volumes_from": {
        "description": "Mount all specified volumes.",
        "default": "",
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false
      },
      "user": {
        "description": "Username or UID.",
        "default": "",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false
      },
      "env": {
        "type": "list",
        "required": false,
        "update_allowed": false,
        "description": "Set environment variables.",
        "immutable": false
      },
      "memory": {
        "description": "Memory limit (Bytes).",
        "default": 0,
        "required": false,
        "update_allowed": false,
        "type": "integer",
        "immutable": false
      },
      "docker_endpoint": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Docker daemon endpoint (by default the local docker daemon will be used).",
        "immutable": false
      },
      "volumes": {
        "description": "Create a bind mount.",
        "default": {},
        "required": false,
        "update_allowed": false,
        "type": "map",
        "immutable": false
      },
      "port_bindings": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "TCP/UDP ports bindings.",
        "immutable": false
      },
      "privileged": {
        "description": "Enable extended privileges.",
        "default": false,
        "required": false,
        "update_allowed": false,
        "type": "boolean",
        "immutable": false
      },
      "name": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Name of the container.",
        "immutable": false
      }
    },
    "resource_type": "DockerInc::Docker::Container"
  },
  "OS::Cinder::Volume": {
    "attributes": {
      "status": {
        "description": "The current status of the volume."
      },
      "metadata_values": {
        "description": "Key/value pairs associated with the volume in raw dict form."
      },
      "display_name": {
        "description": "Name of the volume."
      },
      "attachments": {
        "description": "The list of attachments of the volume."
      },
      "availability_zone": {
        "description": "The availability zone in which the volume is located."
      },
      "bootable": {
        "description": "Boolean indicating if the volume can be booted or not."
      },
      "encrypted": {
        "description": "Boolean indicating if the volume is encrypted or not."
      },
      "created_at": {
        "description": "The timestamp indicating volume creation."
      },
      "display_description": {
        "description": "Description of the volume."
      },
      "source_volid": {
        "description": "The volume used as source, if any."
      },
      "snapshot_id": {
        "description": "The snapshot the volume was created from, if any."
      },
      "size": {
        "description": "The size of the volume in GB."
      },
      "volume_type": {
        "description": "The type of the volume mapping to a backend, if any."
      },
      "metadata": {
        "description": "Key/value pairs associated with the volume."
      }
    },
    "properties": {
      "size": {
        "description": "The size of the volume in GB. On update only increase in size is supported.",
        "required": false,
        "update_allowed": true,
        "type": "integer",
        "immutable": false,
        "constraints": [
          {
            "range": {
              "min": 1
            }
          }
        ]
      },
      "backup_id": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "If specified, the backup to create the volume from.",
        "immutable": false
      },
      "description": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "A description of the volume.",
        "immutable": false
      },
      "imageRef": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "The ID of the image to create the volume from.",
        "immutable": false
      },
      "availability_zone": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "The availability zone in which the volume will be created.",
        "immutable": false
      },
      "image": {
        "description": "If specified, the name or ID of the image to create the volume from.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "glance.image"
          }
        ]
      },
      "source_volid": {
        "description": "If specified, the volume to use as source.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "cinder.volume"
          }
        ]
      },
      "name": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "A name used to distinguish the volume.",
        "immutable": false
      },
      "volume_type": {
        "description": "If specified, the type of volume to use, mapping to a specific backend.",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "cinder.vtype"
          }
        ]
      },
      "snapshot_id": {
        "description": "If specified, the snapshot to create the volume from.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "cinder.snapshot"
          }
        ]
      },
      "scheduler_hints": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Arbitrary key-value pairs specified by the client to help the Cinder scheduler creating a volume.",
        "immutable": false
      },
      "metadata": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "description": "Key/value pairs to associate with the volume.",
        "immutable": false
      }
    },
    "resource_type": "OS::Cinder::Volume"
  },
  "OS::Neutron::Subnet": {
    "attributes": {
      "name": {
        "description": "Friendly name of the subnet."
      },
      "enable_dhcp": {
        "description": "'true' if DHCP is enabled for this subnet; 'false' otherwise."
      },
      "show": {
        "description": "All attributes."
      },
      "network_id": {
        "description": "Parent network of the subnet."
      },
      "tenant_id": {
        "description": "Tenant owning the subnet."
      },
      "dns_nameservers": {
        "description": "List of dns nameservers."
      },
      "allocation_pools": {
        "description": "Ip allocation pools and their ranges."
      },
      "host_routes": {
        "description": "Additional routes for this subnet."
      },
      "ip_version": {
        "description": "Ip version for the subnet."
      },
      "gateway_ip": {
        "description": "Ip of the subnet's gateway."
      },
      "cidr": {
        "description": "CIDR block notation for this subnet."
      }
    },
    "properties": {
      "name": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "The name of the subnet.",
        "immutable": false
      },
      "enable_dhcp": {
        "description": "Set to true if DHCP is enabled and false if DHCP is disabled.",
        "default": true,
        "required": false,
        "update_allowed": true,
        "type": "boolean",
        "immutable": false
      },
      "network_id": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "neutron.network"
          }
        ]
      },
      "tenant_id": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "The ID of the tenant who owns the network. Only administrative users can specify a tenant ID other than their own.",
        "immutable": false
      },
      "dns_nameservers": {
        "description": "A specified set of DNS name servers to be used.",
        "default": [],
        "required": false,
        "update_allowed": true,
        "type": "list",
        "immutable": false
      },
      "ipv6_ra_mode": {
        "description": "IPv6 RA (Router Advertisement) mode. dhcpv6-stateful, dhcpv6-stateless, or slaac.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "dhcpv6-stateful",
              "dhcpv6-stateless",
              "slaac"
            ]
          }
        ]
      },
      "allocation_pools": {
        "description": "The start and end addresses for the allocation pools.",
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "start": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "immutable": false
              },
              "end": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "immutable": false
              }
            }
          }
        }
      },
      "host_routes": {
        "type": "list",
        "required": false,
        "update_allowed": true,
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "nexthop": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "immutable": false
              },
              "destination": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "immutable": false
              }
            }
          }
        }
      },
      "value_specs": {
        "description": "Extra parameters to include in the creation request.",
        "default": {},
        "required": false,
        "update_allowed": true,
        "type": "map",
        "immutable": false
      },
      "ipv6_address_mode": {
        "description": "IPv6 address mode. dhcpv6-stateful, dhcpv6-stateless, or slaac.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "dhcpv6-stateful",
              "dhcpv6-stateless",
              "slaac"
            ]
          }
        ]
      },
      "ip_version": {
        "description": "The IP version, which is 4 or 6.",
        "default": 4,
        "required": false,
        "update_allowed": false,
        "type": "integer",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              4,
              6
            ]
          }
        ]
      },
      "gateway_ip": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "The gateway IP address. Set to any of [ null | ~ | \"\" ] to create the subnet without a gateway. If omitted, the first IP address within the subnet is assigned to the gateway.",
        "immutable": false
      },
      "cidr": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "The CIDR.",
        "immutable": false
      },
      "network": {
        "description": "The ID of the attached network.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "neutron.network"
          }
        ]
      }
    },
    "resource_type": "OS::Neutron::Subnet"
  },
  "Rackspace::CloudMonitoring::PlanNotifications": {
    "attributes": {},
    "properties": {
      "ok_state": {
        "type": "list",
        "required": false,
        "update_allowed": true,
        "description": "The notification list to send to when the state is OK.",
        "immutable": false
      },
      "warning_state": {
        "type": "list",
        "required": false,
        "update_allowed": true,
        "description": "The notification list to send to when the state is WARNING.",
        "immutable": false
      },
      "critical_state": {
        "type": "list",
        "required": false,
        "update_allowed": true,
        "description": "The notification list to send to when the state is CRITICAL.",
        "immutable": false
      },
      "plan": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "The notification plan to add notifications to",
        "immutable": false
      }
    },
    "resource_type": "Rackspace::CloudMonitoring::PlanNotifications"
  },
  "Rackspace::CloudMonitoring::AgentToken": {
    "attributes": {
      "show": {
        "description": "A dict of all entity details as returned by the API."
      }
    },
    "properties": {
      "label": {
        "description": "A friendly label for this resource",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 255,
              "min": 1
            }
          }
        ]
      }
    },
    "resource_type": "Rackspace::CloudMonitoring::AgentToken"
  },
  "Rackspace::Cloud::LoadBalancer": {
    "attributes": {
      "PublicIp": {
        "description": "Public IP address of the specified instance."
      },
      "virtualIps": {
        "description": "A list of assigned virtual ip addresses"
      }
    },
    "properties": {
      "protocol": {
        "type": "string",
        "required": true,
        "update_allowed": true,
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "DNS_TCP",
              "DNS_UDP",
              "FTP",
              "HTTP",
              "HTTPS",
              "IMAPS",
              "IMAPv4",
              "LDAP",
              "LDAPS",
              "MYSQL",
              "POP3",
              "POP3S",
              "SMTP",
              "TCP",
              "TCP_CLIENT_FIRST",
              "UDP",
              "UDP_STREAM",
              "SFTP"
            ]
          }
        ]
      },
      "name": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "immutable": false
      },
      "algorithm": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "LEAST_CONNECTIONS",
              "RANDOM",
              "ROUND_ROBIN",
              "WEIGHTED_LEAST_CONNECTIONS",
              "WEIGHTED_ROUND_ROBIN"
            ]
          }
        ]
      },
      "virtualIps": {
        "required": true,
        "update_allowed": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "ipVersion": {
                "description": "IP version of the VIP. This property cannot be specified if 'id' is specified. This property must be specified if id is not specified.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "allowed_values": [
                      "IPV6",
                      "IPV4"
                    ]
                  }
                ]
              },
              "type": {
                "description": "The type of VIP (public or internal). This property cannot be specified if 'id' is specified. This property must be specified if id is not specified.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "allowed_values": [
                      "SERVICENET",
                      "PUBLIC"
                    ]
                  }
                ]
              },
              "id": {
                "type": "number",
                "required": false,
                "update_allowed": false,
                "description": "ID of a shared VIP to use instead of creating a new one. This property cannot be specified if type or version is specified.",
                "immutable": false
              }
            }
          }
        },
        "type": "list",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "min": 1
            }
          }
        ]
      },
      "connectionThrottle": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "immutable": false,
        "schema": {
          "maxConnectionRate": {
            "type": "number",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "constraints": [
              {
                "range": {
                  "max": 100000,
                  "min": 0
                }
              }
            ]
          },
          "maxConnections": {
            "type": "number",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "constraints": [
              {
                "range": {
                  "max": 100000,
                  "min": 1
                }
              }
            ]
          },
          "rateInterval": {
            "type": "number",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "constraints": [
              {
                "range": {
                  "max": 3600,
                  "min": 1
                }
              }
            ]
          },
          "minConnections": {
            "type": "number",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "constraints": [
              {
                "range": {
                  "max": 1000,
                  "min": 1
                }
              }
            ]
          }
        }
      },
      "port": {
        "type": "number",
        "required": true,
        "update_allowed": true,
        "immutable": false
      },
      "accessList": {
        "type": "list",
        "required": false,
        "update_allowed": false,
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "type": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "immutable": false,
                "constraints": [
                  {
                    "allowed_values": [
                      "ALLOW",
                      "DENY"
                    ]
                  }
                ]
              },
              "address": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "immutable": false
              }
            }
          }
        }
      },
      "errorPage": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "immutable": false
      },
      "contentCaching": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "ENABLED",
              "DISABLED"
            ]
          }
        ]
      },
      "healthMonitor": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "immutable": false,
        "schema": {
          "attemptsBeforeDeactivation": {
            "type": "number",
            "required": true,
            "update_allowed": false,
            "immutable": false,
            "constraints": [
              {
                "range": {
                  "max": 10,
                  "min": 1
                }
              }
            ]
          },
          "delay": {
            "type": "number",
            "required": true,
            "update_allowed": false,
            "immutable": false,
            "constraints": [
              {
                "range": {
                  "max": 3600,
                  "min": 1
                }
              }
            ]
          },
          "statusRegex": {
            "type": "string",
            "required": false,
            "update_allowed": false,
            "immutable": false
          },
          "bodyRegex": {
            "type": "string",
            "required": false,
            "update_allowed": false,
            "immutable": false
          },
          "hostHeader": {
            "type": "string",
            "required": false,
            "update_allowed": false,
            "immutable": false
          },
          "timeout": {
            "type": "number",
            "required": true,
            "update_allowed": false,
            "immutable": false,
            "constraints": [
              {
                "range": {
                  "max": 300,
                  "min": 1
                }
              }
            ]
          },
          "path": {
            "type": "string",
            "required": false,
            "update_allowed": false,
            "immutable": false
          },
          "type": {
            "type": "string",
            "required": true,
            "update_allowed": false,
            "immutable": false,
            "constraints": [
              {
                "allowed_values": [
                  "CONNECT",
                  "HTTP",
                  "HTTPS"
                ]
              }
            ]
          }
        }
      },
      "timeout": {
        "type": "number",
        "required": false,
        "update_allowed": true,
        "immutable": false,
        "constraints": [
          {
            "range": {
              "max": 120,
              "min": 1
            }
          }
        ]
      },
      "halfClosed": {
        "type": "boolean",
        "required": false,
        "update_allowed": true,
        "immutable": false
      },
      "nodes": {
        "type": "list",
        "required": true,
        "update_allowed": true,
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "weight": {
                "type": "number",
                "required": false,
                "update_allowed": false,
                "immutable": false,
                "constraints": [
                  {
                    "range": {
                      "max": 100,
                      "min": 1
                    }
                  }
                ]
              },
              "type": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "immutable": false,
                "constraints": [
                  {
                    "allowed_values": [
                      "PRIMARY",
                      "SECONDARY"
                    ]
                  }
                ]
              },
              "addresses": {
                "description": "IP addresses for the load balancer node. Must have at least one address.",
                "required": true,
                "update_allowed": false,
                "type": "list",
                "immutable": false,
                "schema": {
                  "*": {
                    "type": "string",
                    "required": false,
                    "update_allowed": false,
                    "immutable": false
                  }
                }
              },
              "condition": {
                "default": "ENABLED",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "allowed_values": [
                      "ENABLED",
                      "DISABLED"
                    ]
                  }
                ]
              },
              "port": {
                "type": "number",
                "required": true,
                "update_allowed": false,
                "immutable": false
              }
            }
          }
        }
      },
      "sessionPersistence": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "HTTP_COOKIE",
              "SOURCE_IP"
            ]
          }
        ]
      },
      "connectionLogging": {
        "type": "boolean",
        "required": false,
        "update_allowed": true,
        "immutable": false
      },
      "sslTermination": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "immutable": false,
        "schema": {
          "privatekey": {
            "type": "string",
            "required": true,
            "update_allowed": false,
            "immutable": false
          },
          "securePort": {
            "default": 443,
            "type": "number",
            "required": false,
            "update_allowed": false,
            "immutable": false
          },
          "secureTrafficOnly": {
            "default": false,
            "type": "boolean",
            "required": false,
            "update_allowed": false,
            "immutable": false
          },
          "certificate": {
            "type": "string",
            "required": true,
            "update_allowed": false,
            "immutable": false
          },
          "intermediateCertificate": {
            "type": "string",
            "required": false,
            "update_allowed": false,
            "immutable": false
          }
        }
      },
      "metadata": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "immutable": false
      }
    },
    "resource_type": "Rackspace::Cloud::LoadBalancer"
  },
  "AWS::CloudFormation::WaitCondition": {
    "attributes": {
      "Data": {
        "description": "JSON data that was uploaded via the SwiftSignalHandle."
      }
    },
    "properties": {
      "Count": {
        "description": "The number of success signals that must be received before the stack creation process continues.",
        "default": 1,
        "required": false,
        "update_allowed": false,
        "type": "number",
        "immutable": false,
        "constraints": [
          {
            "range": {
              "max": 1000,
              "min": 1
            }
          }
        ]
      },
      "Handle": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "URL of TempURL where resource will signal completion and optionally upload data.",
        "immutable": false
      },
      "Timeout": {
        "description": "The maximum number of seconds to wait for the resource to signal completion. Once the timeout is reached, creation of the signal resource will fail.",
        "required": true,
        "update_allowed": false,
        "type": "number",
        "immutable": false,
        "constraints": [
          {
            "range": {
              "max": 43200,
              "min": 1
            }
          }
        ]
      }
    },
    "resource_type": "AWS::CloudFormation::WaitCondition"
  },
  "Rackspace::CloudMonitoring::Alarm": {
    "attributes": {
      "show": {
        "description": "A dict of all entity details as returned by the API."
      }
    },
    "properties": {
      "label": {
        "description": "A friendly label for this resource",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 255,
              "min": 1
            }
          }
        ]
      },
      "disabled": {
        "description": "Disable processing and alerts on this alarm",
        "default": false,
        "required": false,
        "update_allowed": true,
        "type": "boolean",
        "immutable": false
      },
      "plan": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "The notification plan to execute when the state changes",
        "immutable": false
      },
      "criteria": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "The alarm DSL for describing alerting conditions and their output states",
        "immutable": false
      },
      "check": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "The check to alert on",
        "immutable": false
      },
      "metadata": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "description": "Arbitrary key/value pairs that are passed during the alerting phase. Both keys and values must be 255 characters or less. Non-string values will be serialized to JSON (and the serialized string must be 255 characters or less).",
        "immutable": false
      }
    },
    "resource_type": "Rackspace::CloudMonitoring::Alarm"
  },
  "Rackspace::Cloud::DNS": {
    "attributes": {},
    "properties": {
      "comment": {
        "description": "Optional free form text comment",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 160
            }
          }
        ]
      },
      "records": {
        "description": "Domain records",
        "required": false,
        "update_allowed": true,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "comment": {
                "description": "Optional free form text comment",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "length": {
                      "max": 160
                    }
                  }
                ]
              },
              "name": {
                "description": "Specifies the name for the domain or subdomain. Must be a valid domain name.",
                "required": true,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "length": {
                      "min": 3
                    }
                  }
                ]
              },
              "data": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "description": "Type specific record data",
                "immutable": false
              },
              "priority": {
                "description": "Required for MX and SRV records, but forbidden for other record types. If specified, must be an integer from 0 to 65535.",
                "required": false,
                "update_allowed": false,
                "type": "integer",
                "immutable": false,
                "constraints": [
                  {
                    "range": {
                      "max": 65535,
                      "min": 0
                    }
                  }
                ]
              },
              "ttl": {
                "description": "How long other servers should cache recorddata.",
                "default": 3600,
                "required": false,
                "update_allowed": false,
                "type": "integer",
                "immutable": false,
                "constraints": [
                  {
                    "range": {
                      "min": 300
                    }
                  }
                ]
              },
              "type": {
                "description": "Specifies the record type.",
                "required": true,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "allowed_values": [
                      "A",
                      "AAAA",
                      "NS",
                      "MX",
                      "CNAME",
                      "TXT",
                      "SRV"
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      "emailAddress": {
        "type": "string",
        "required": true,
        "update_allowed": true,
        "description": "Email address to use for contacting the domain administrator.",
        "immutable": false
      },
      "name": {
        "description": "Specifies the name for the domain or subdomain. Must be a valid domain name.",
        "required": true,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "min": 3
            }
          }
        ]
      },
      "ttl": {
        "description": "How long other servers should cache recorddata.",
        "default": 3600,
        "required": false,
        "update_allowed": true,
        "type": "integer",
        "immutable": false,
        "constraints": [
          {
            "range": {
              "min": 300
            }
          }
        ]
      }
    },
    "resource_type": "Rackspace::Cloud::DNS"
  },
  "Rackspace::Cloud::Network": {
    "attributes": {
      "cidr": {
        "description": "The CIDR for an isolated private network."
      },
      "label": {
        "description": "The name of the network."
      }
    },
    "properties": {
      "cidr": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "The IP block from which to allocate the network. For example, 172.16.0.0/24 or 2001:DB8::/64.",
        "immutable": false
      },
      "label": {
        "description": "The name of the network.",
        "required": true,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 64,
              "min": 3
            }
          }
        ]
      }
    },
    "resource_type": "Rackspace::Cloud::Network"
  },
  "OS::Cinder::VolumeAttachment": {
    "attributes": {},
    "properties": {
      "instance_uuid": {
        "type": "string",
        "required": true,
        "update_allowed": true,
        "description": "The ID of the server to which the volume attaches.",
        "immutable": false
      },
      "mountpoint": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "The location where the volume is exposed on the instance. This assignment may not be honored and it is advised that the path /dev/disk/by-id/virtio-<VolumeId> be used instead.",
        "immutable": false
      },
      "volume_id": {
        "description": "The ID of the volume to be attached.",
        "required": true,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "cinder.volume"
          }
        ]
      }
    },
    "resource_type": "OS::Cinder::VolumeAttachment"
  },
  "OS::Neutron::Port": {
    "attributes": {
      "status": {
        "description": "The status of the port."
      },
      "subnets": {
        "description": "A list of all subnet attributes for the port."
      },
      "name": {
        "description": "Friendly name of the port."
      },
      "allowed_address_pairs": {
        "description": "Additional MAC/IP address pairs allowed to pass through a port."
      },
      "show": {
        "description": "All attributes."
      },
      "network_id": {
        "description": "Unique identifier for the network owning the port."
      },
      "tenant_id": {
        "description": "Tenant owning the port."
      },
      "admin_state_up": {
        "description": "The administrative state of this port."
      },
      "device_owner": {
        "description": "Name of the network owning the port."
      },
      "mac_address": {
        "description": "MAC address of the port."
      },
      "fixed_ips": {
        "description": "Fixed IP addresses."
      },
      "security_groups": {
        "description": "A list of security groups for the port."
      },
      "device_id": {
        "description": "Unique identifier for the device."
      }
    },
    "properties": {
      "replacement_policy": {
        "description": "Policy on how to respond to a stack-update for this resource. REPLACE_ALWAYS will replace the port regardless of any property changes. AUTO will update the existing port for any changed update-allowed property.",
        "default": "REPLACE_ALWAYS",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "REPLACE_ALWAYS",
              "AUTO"
            ]
          }
        ]
      },
      "name": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "A symbolic name for this port.",
        "immutable": false
      },
      "allowed_address_pairs": {
        "description": "Additional MAC/IP address pairs allowed to pass through the port.",
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "ip_address": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "description": "IP address to allow through this port.",
                "immutable": false
              },
              "mac_address": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "description": "MAC address to allow through this port.",
                "immutable": false
              }
            }
          }
        }
      },
      "admin_state_up": {
        "description": "The administrative state of this port.",
        "default": true,
        "required": false,
        "update_allowed": true,
        "type": "boolean",
        "immutable": false
      },
      "network_id": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "neutron.network"
          }
        ]
      },
      "binding:vnic_type": {
        "description": "The vnic type to be bound on the neutron port. To support SR-IOV PCI passthrough networking, you can request that the neutron port to be realized as normal (virtual nic), direct (pci passthrough), or macvtap (virtual interface with a tap-like software interface). Note that this only works for Neutron deployments that support the bindings extension.",
        "required": false,
        "update_allowed": true,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "normal",
              "direct",
              "macvtap"
            ]
          }
        ]
      },
      "device_owner": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "Name of the network owning the port. The value is typically network:floatingip or network:router_interface or network:dhcp",
        "immutable": false
      },
      "value_specs": {
        "description": "Extra parameters to include in the \"port\" object in the creation request.",
        "default": {},
        "required": false,
        "update_allowed": false,
        "type": "map",
        "immutable": false
      },
      "mac_address": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "MAC address to give to this port.",
        "immutable": false
      },
      "device_id": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "Device ID of this port.",
        "immutable": false
      },
      "fixed_ips": {
        "description": "Desired IPs for this port.",
        "default": [],
        "required": false,
        "update_allowed": true,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "subnet_id": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "immutable": false
              },
              "subnet": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "description": "Subnet in which to allocate the IP address for this port.",
                "immutable": false
              },
              "ip_address": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "description": "IP address desired in the subnet for this port.",
                "immutable": false
              }
            }
          }
        }
      },
      "security_groups": {
        "type": "list",
        "required": false,
        "update_allowed": true,
        "description": "Security group IDs to associate with this port.",
        "immutable": false
      },
      "network": {
        "description": "Network this port belongs to.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "neutron.network"
          }
        ]
      }
    },
    "resource_type": "OS::Neutron::Port"
  },
  "OS::Heat::RandomString": {
    "attributes": {
      "value": {
        "description": "The random string generated by this resource. This value is also available by referencing the resource."
      }
    },
    "properties": {
      "length": {
        "description": "Length of the string to generate.",
        "default": 32,
        "required": false,
        "update_allowed": false,
        "type": "integer",
        "immutable": false,
        "constraints": [
          {
            "range": {
              "max": 512,
              "min": 1
            }
          }
        ]
      },
      "salt": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Value which can be set or changed on stack update to trigger the resource for replacement with a new random string . The salt value itself is ignored by the random generator.",
        "immutable": false
      },
      "character_sequences": {
        "description": "A list of character sequences and their constraints to generate the random string from.",
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "min": {
                "description": "The minimum number of characters from this sequence that will be in the generated string.",
                "default": 1,
                "required": false,
                "update_allowed": false,
                "type": "integer",
                "immutable": false,
                "constraints": [
                  {
                    "range": {
                      "max": 512,
                      "min": 1
                    }
                  }
                ]
              },
              "sequence": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "description": "A character sequence and its corresponding min constraint to generate the random string from.",
                "immutable": false
              }
            }
          }
        }
      },
      "character_classes": {
        "description": "A list of character class and their constraints to generate the random string from.",
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "class": {
                "description": "A character class and its corresponding min constraint to generate the random string from.",
                "default": "lettersdigits",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "allowed_values": [
                      "lettersdigits",
                      "letters",
                      "lowercase",
                      "uppercase",
                      "digits",
                      "hexdigits",
                      "octdigits"
                    ]
                  }
                ]
              },
              "min": {
                "description": "The minimum number of characters from this character class that will be in the generated string.",
                "default": 1,
                "required": false,
                "update_allowed": false,
                "type": "integer",
                "immutable": false,
                "constraints": [
                  {
                    "range": {
                      "max": 512,
                      "min": 1
                    }
                  }
                ]
              }
            }
          }
        }
      },
      "sequence": {
        "description": "Sequence of characters to build the random string from.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "lettersdigits",
              "letters",
              "lowercase",
              "uppercase",
              "digits",
              "hexdigits",
              "octdigits"
            ]
          }
        ]
      }
    },
    "resource_type": "OS::Heat::RandomString"
  },
  "OS::Swift::Container": {
    "attributes": {
      "RootURL": {
        "description": "The parent URL of the container."
      },
      "BytesUsed": {
        "description": "The number of bytes stored in the container."
      },
      "DomainName": {
        "description": "The host from the container URL."
      },
      "WebsiteURL": {
        "description": "The URL of the container."
      },
      "ObjectCount": {
        "description": "The number of objects stored in the container."
      },
      "HeadContainer": {
        "description": "A map containing all headers for the container."
      }
    },
    "properties": {
      "X-Container-Write": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Specify the ACL permissions on who can write objects to the container.",
        "immutable": false
      },
      "X-Account-Meta": {
        "description": "A map of user-defined meta data to associate with the account. Each key in the map will set the header X-Account-Meta-{key} with the corresponding value.",
        "default": {},
        "required": false,
        "update_allowed": false,
        "type": "map",
        "immutable": false
      },
      "PurgeOnDelete": {
        "description": "If True, delete any objects in the container when the container is deleted. Otherwise, deleting a non-empty container will result in an error.",
        "default": false,
        "required": false,
        "update_allowed": false,
        "type": "boolean",
        "immutable": false
      },
      "X-Container-Read": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Specify the ACL permissions on who can read objects in the container.",
        "immutable": false
      },
      "X-Container-Meta": {
        "description": "A map of user-defined meta data to associate with the container. Each key in the map will set the header X-Container-Meta-{key} with the corresponding value.",
        "default": {},
        "required": false,
        "update_allowed": false,
        "type": "map",
        "immutable": false
      },
      "name": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Name for the container. If not specified, a unique name will be generated.",
        "immutable": false
      }
    },
    "resource_type": "OS::Swift::Container"
  },
  "OS::Heat::SwiftSignalHandle": {
    "attributes": {
      "curl_cli": {
        "description": "Convenience attribute, provides curl CLI command prefix, which can be used for signalling handle completion or failure. You can signal success by adding --data-binary '{\"status\": \"SUCCESS\"}' , or signal failure by adding --data-binary '{\"status\": \"FAILURE\"}'"
      },
      "token": {
        "description": "Tokens are not needed for Swift TempURLs. This attribute is being kept for compatibility with the OS::Heat::WaitConditionHandle resource"
      },
      "endpoint": {
        "description": "Endpoint/url which can be used for signalling handle"
      }
    },
    "properties": {},
    "resource_type": "OS::Heat::SwiftSignalHandle"
  },
  "OS::Zaqar::Queue": {
    "attributes": {
      "href": {
        "description": "The resource href of the queue."
      },
      "queue_id": {
        "description": "ID of the queue."
      }
    },
    "properties": {
      "name": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "Name of the queue instance to create.",
        "immutable": false
      },
      "metadata": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "description": "Arbitrary key/value metadata to store contextual information about this queue.",
        "immutable": false
      }
    },
    "resource_type": "OS::Zaqar::Queue"
  },
  "OS::Nova::KeyPair": {
    "attributes": {
      "public_key": {
        "description": "The public key."
      },
      "private_key": {
        "description": "The private key if it has been saved."
      }
    },
    "properties": {
      "public_key": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "The optional public key. This allows users to supply the public key from a pre-existing key pair. If not supplied, a new key pair will be generated.",
        "immutable": false
      },
      "name": {
        "description": "The name of the key pair.",
        "required": true,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 255,
              "min": 1
            }
          }
        ]
      },
      "save_private_key": {
        "description": "True if the system should remember a generated private key; False otherwise.",
        "default": false,
        "required": false,
        "update_allowed": false,
        "type": "boolean",
        "immutable": false
      }
    },
    "resource_type": "OS::Nova::KeyPair"
  },
  "OS::Heat::Stack": {
    "attributes": {
      "stack_name": {
        "description": "Name of the stack."
      },
      "outputs": {
        "description": "A dict of key-value pairs output from the stack."
      }
    },
    "properties": {
      "timeout": {
        "type": "number",
        "required": false,
        "update_allowed": true,
        "description": "Number of minutes to wait for this stack creation.",
        "immutable": false
      },
      "parameters": {
        "description": "Set of parameters passed to this stack.",
        "default": {},
        "required": false,
        "update_allowed": true,
        "type": "map",
        "immutable": false
      },
      "context": {
        "description": "Context for this stack.",
        "required": false,
        "update_allowed": false,
        "type": "map",
        "immutable": false,
        "schema": {
          "region_name": {
            "type": "string",
            "required": true,
            "update_allowed": false,
            "description": "Region name in which this stack will be created.",
            "immutable": false
          }
        }
      },
      "template": {
        "type": "string",
        "required": true,
        "update_allowed": true,
        "description": "Template that specifies the stack to be created as a resource.",
        "immutable": false
      }
    },
    "resource_type": "OS::Heat::Stack"
  },
  "OS::Trove::Instance": {
    "attributes": {
      "href": {
        "description": "Api endpoint reference of the instance."
      },
      "hostname": {
        "description": "Hostname of the instance."
      }
    },
    "properties": {
      "users": {
        "description": "List of users to be created on DB instance creation.",
        "default": [],
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "host": {
                "description": "The host from which a user is allowed to connect to the database.",
                "default": "%",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false
              },
              "password": {
                "description": "Password for those users on instance creation.",
                "required": true,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "allowed_pattern": "[a-zA-Z0-9_]+[a-zA-Z0-9_@?#\\s]*[a-zA-Z0-9_]+"
                  }
                ]
              },
              "name": {
                "description": "User name to create a user on instance creation.",
                "required": true,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "length": {
                      "max": 16
                    }
                  },
                  {
                    "allowed_pattern": "[a-zA-Z0-9_]+[a-zA-Z0-9_@?#\\s]*[a-zA-Z0-9_]+"
                  }
                ]
              },
              "databases": {
                "description": "Names of databases that those users can access on instance creation.",
                "required": true,
                "update_allowed": false,
                "constraints": [
                  {
                    "length": {
                      "min": 1
                    }
                  }
                ],
                "type": "list",
                "immutable": false,
                "schema": {
                  "*": {
                    "type": "string",
                    "required": false,
                    "update_allowed": false,
                    "immutable": false
                  }
                }
              }
            }
          }
        }
      },
      "availability_zone": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Name of the availability zone for DB instance.",
        "immutable": false
      },
      "datastore_version": {
        "description": "Name of the registered datastore version. It must exist for provided datastore type. Defaults to using single active version. If several active versions exist for provided datastore type, explicit value for this parameter must be specified.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 255
            }
          }
        ]
      },
      "name": {
        "description": "Name of the DB instance to create.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 255
            }
          }
        ]
      },
      "restore_point": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "DB instance restore point.",
        "immutable": false
      },
      "databases": {
        "description": "List of databases to be created on DB instance creation.",
        "default": [],
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "character_set": {
                "description": "Set of symbols and encodings.",
                "default": "utf8",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false
              },
              "name": {
                "description": "Specifies database names for creating databases on instance creation.",
                "required": true,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "length": {
                      "max": 64
                    }
                  },
                  {
                    "allowed_pattern": "[a-zA-Z0-9_]+[a-zA-Z0-9_@?#\\s]*[a-zA-Z0-9_]+"
                  }
                ]
              },
              "collate": {
                "description": "Set of rules for comparing characters in a character set.",
                "default": "utf8_general_ci",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false
              }
            }
          }
        }
      },
      "datastore_type": {
        "description": "Name of registered datastore type.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 255
            }
          }
        ]
      },
      "flavor": {
        "type": "string",
        "required": true,
        "update_allowed": false,
        "description": "Reference to a flavor for creating DB instance.",
        "immutable": false
      },
      "networks": {
        "description": "List of network interfaces to create on instance.",
        "default": [],
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "fixed_ip": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "description": "Fixed IPv4 address for this NIC.",
                "immutable": false
              },
              "network": {
                "description": "Name or UUID of the network to attach this NIC to. Either port or network must be specified.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "neutron.network"
                  }
                ]
              },
              "port": {
                "description": "Name or UUID of Neutron port to attach this NIC to. Either port or network must be specified.",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "neutron.port"
                  }
                ]
              }
            }
          }
        }
      },
      "size": {
        "description": "Database volume size in GB.",
        "required": true,
        "update_allowed": false,
        "type": "integer",
        "immutable": false,
        "constraints": [
          {
            "range": {
              "max": 150,
              "min": 1
            }
          }
        ]
      }
    },
    "resource_type": "OS::Trove::Instance"
  },
  "OS::Heat::CloudConfig": {
    "attributes": {
      "config": {
        "description": "The config value of the software config."
      }
    },
    "properties": {
      "cloud_config": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Map representing the cloud-config data structure which will be formatted as YAML.",
        "immutable": false
      }
    },
    "resource_type": "OS::Heat::CloudConfig"
  },
  "OS::Heat::SoftwareDeployment": {
    "attributes": {
      "deploy_stdout": {
        "description": "Captured stdout from the configuration execution."
      },
      "deploy_stderr": {
        "description": "Captured stderr from the configuration execution."
      },
      "deploy_status_code": {
        "description": "Returned status code from the configuration execution"
      }
    },
    "properties": {
      "signal_transport": {
        "description": "How the server should signal to heat with the deployment output values. CFN_SIGNAL will allow an HTTP POST to a CFN keypair signed URL. TEMP_URL_SIGNAL will create a Swift TempURL to be signaled via HTTP PUT. HEAT_SIGNAL will allow calls to the Heat API resource-signal using the provided keystone credentials. NO_SIGNAL will result in the resource going to the COMPLETE state without waiting for any signal.",
        "default": "CFN_SIGNAL",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "CFN_SIGNAL",
              "TEMP_URL_SIGNAL",
              "HEAT_SIGNAL",
              "NO_SIGNAL"
            ]
          }
        ]
      },
      "name": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Name of the derived config associated with this deployment. This is used to apply a sort order to the list of configurations currently deployed to a server.",
        "immutable": false
      },
      "actions": {
        "description": "Which stack actions will result in this deployment being triggered.",
        "default": [
          "CREATE",
          "UPDATE"
        ],
        "required": false,
        "update_allowed": true,
        "type": "list",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "CREATE",
              "UPDATE",
              "DELETE",
              "SUSPEND",
              "RESUME"
            ]
          }
        ]
      },
      "server": {
        "description": "ID of Nova server to apply configuration to.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "custom_constraint": "nova.server"
          }
        ]
      },
      "input_values": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "description": "Input values to apply to the software configuration on this server.",
        "immutable": false
      },
      "config": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "ID of software configuration resource to execute when applying to the server.",
        "immutable": false
      }
    },
    "resource_type": "OS::Heat::SoftwareDeployment"
  },
  "OS::Heat::SoftwareConfig": {
    "attributes": {
      "config": {
        "description": "The config value of the software config."
      }
    },
    "properties": {
      "inputs": {
        "description": "Schema representing the inputs that this software config is expecting.",
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "default": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "description": "Default value for the input if none is specified.",
                "immutable": false
              },
              "type": {
                "description": "Type of the value of the input.",
                "default": "String",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "allowed_values": [
                      "String",
                      "Number",
                      "CommaDelimitedList",
                      "Json"
                    ]
                  }
                ]
              },
              "name": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "description": "Name of the input.",
                "immutable": false
              },
              "description": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "description": "Description of the input.",
                "immutable": false
              }
            }
          }
        }
      },
      "config": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Configuration script or manifest which specifies what actual configuration is performed.",
        "immutable": false
      },
      "options": {
        "type": "map",
        "required": false,
        "update_allowed": false,
        "description": "Map containing options specific to the configuration management tool used by this resource.",
        "immutable": false
      },
      "group": {
        "description": "Namespace to group this software config by when delivered to a server. This may imply what configuration tool is going to perform the configuration.",
        "default": "Heat::Ungrouped",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false
      },
      "outputs": {
        "description": "Schema representing the outputs that this software config will produce.",
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "type": {
                "description": "Type of the value of the output.",
                "default": "String",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "allowed_values": [
                      "String",
                      "Number",
                      "CommaDelimitedList",
                      "Json"
                    ]
                  }
                ]
              },
              "name": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "description": "Name of the output.",
                "immutable": false
              },
              "error_output": {
                "description": "Denotes that the deployment is in an error state if this output has a value.",
                "default": false,
                "required": false,
                "update_allowed": false,
                "type": "boolean",
                "immutable": false
              },
              "description": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "description": "Description of the output.",
                "immutable": false
              }
            }
          }
        }
      }
    },
    "resource_type": "OS::Heat::SoftwareConfig"
  },
  "OS::Trove::Cluster": {
    "attributes": {
      "instances": {
        "description": "A list of instances ids."
      },
      "ip": {
        "description": "IP of the cluster."
      }
    },
    "properties": {
      "datastore_type": {
        "description": "Name of registered datastore type.",
        "required": true,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 255
            }
          }
        ]
      },
      "instances": {
        "description": "List of database instances.",
        "required": true,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "volume_size": {
                "description": "Size of the instance disk volume in GB.",
                "required": true,
                "update_allowed": false,
                "type": "integer",
                "immutable": false,
                "constraints": [
                  {
                    "range": {
                      "max": 150,
                      "min": 1
                    }
                  }
                ]
              },
              "flavor": {
                "description": "Flavor of the instance.",
                "required": true,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "custom_constraint": "trove.flavor"
                  }
                ]
              }
            }
          }
        }
      },
      "datastore_version": {
        "description": "Name of the registered datastore version. It must exist for provided datastore type. Defaults to using single active version. If several active versions exist for provided datastore type, explicit value for this parameter must be specified.",
        "required": true,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 255
            }
          }
        ]
      },
      "name": {
        "description": "Name of the cluster to create.",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "length": {
              "max": 255
            }
          }
        ]
      }
    },
    "resource_type": "OS::Trove::Cluster"
  },
  "OS::Heat::SoftwareDeployments": {
    "attributes": {
      "deploy_stderrs": {
        "description": "A map of Nova names and captured stderrs from the configuration execution to each server."
      },
      "deploy_stdouts": {
        "description": "A map of Nova names and captured stdouts from the configuration execution to each server."
      },
      "deploy_status_codes": {
        "description": "A map of Nova names and returned status code from the configuration execution"
      }
    },
    "properties": {
      "signal_transport": {
        "description": "How the server should signal to heat with the deployment output values. CFN_SIGNAL will allow an HTTP POST to a CFN keypair signed URL. TEMP_URL_SIGNAL will create a Swift TempURL to be signaled via HTTP PUT. HEAT_SIGNAL will allow calls to the Heat API resource-signal using the provided keystone credentials. NO_SIGNAL will result in the resource going to the COMPLETE state without waiting for any signal.",
        "default": "CFN_SIGNAL",
        "required": false,
        "update_allowed": false,
        "type": "string",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "CFN_SIGNAL",
              "TEMP_URL_SIGNAL",
              "HEAT_SIGNAL",
              "NO_SIGNAL"
            ]
          }
        ]
      },
      "name": {
        "type": "string",
        "required": false,
        "update_allowed": false,
        "description": "Name of the derived config associated with this deployment. This is used to apply a sort order to the list of configurations currently deployed to a server.",
        "immutable": false
      },
      "actions": {
        "description": "Which stack actions will result in this deployment being triggered.",
        "default": [
          "CREATE",
          "UPDATE"
        ],
        "required": false,
        "update_allowed": true,
        "type": "list",
        "immutable": false,
        "constraints": [
          {
            "allowed_values": [
              "CREATE",
              "UPDATE",
              "DELETE",
              "SUSPEND",
              "RESUME"
            ]
          }
        ]
      },
      "servers": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "description": "A map of Nova names and IDs to apply configuration to.",
        "immutable": false
      },
      "input_values": {
        "type": "map",
        "required": false,
        "update_allowed": true,
        "description": "Input values to apply to the software configuration on this server.",
        "immutable": false
      },
      "config": {
        "type": "string",
        "required": false,
        "update_allowed": true,
        "description": "ID of software configuration resource to execute when applying to the server.",
        "immutable": false
      }
    },
    "resource_type": "OS::Heat::SoftwareDeployments"
  },
  "OS::Heat::MultipartMime": {
    "attributes": {
      "config": {
        "description": "The config value of the software config."
      }
    },
    "properties": {
      "parts": {
        "description": "Parts belonging to this message.",
        "default": [],
        "required": false,
        "update_allowed": false,
        "type": "list",
        "immutable": false,
        "schema": {
          "*": {
            "type": "map",
            "required": false,
            "update_allowed": false,
            "immutable": false,
            "schema": {
              "subtype": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "description": "Optional subtype to specify with the type.",
                "immutable": false
              },
              "config": {
                "type": "string",
                "required": true,
                "update_allowed": false,
                "description": "Content of part to attach, either inline or by referencing the ID of another software config resource",
                "immutable": false
              },
              "type": {
                "description": "Whether the part content is text or multipart.",
                "default": "text",
                "required": false,
                "update_allowed": false,
                "type": "string",
                "immutable": false,
                "constraints": [
                  {
                    "allowed_values": [
                      "text",
                      "multipart"
                    ]
                  }
                ]
              },
              "filename": {
                "type": "string",
                "required": false,
                "update_allowed": false,
                "description": "Optional filename to associate with part.",
                "immutable": false
              }
            }
          }
        }
      }
    },
    "resource_type": "OS::Heat::MultipartMime"
  }
}
