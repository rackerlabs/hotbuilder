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

var TEMPLATES = {};

TEMPLATES.wp_single = {
    "parameter_groups": [
        {
            "parameters": [
                "server_hostname",
                "image",
                "flavor"
            ],
            "label": "Server Settings"
        },
        {
            "parameters": [
                "domain",
                "username"
            ],
            "label": "WordPress Settings"
        },
        {
            "parameters": [
                "kitchen",
                "chef_version",
                "version",
                "prefix"
            ],
            "label": "rax-dev-params"
        }
    ],
    "heat_template_version": "2013-05-23",
    "description":
        "This is a Heat template to deploy a single Linux server " +
        "running WordPress.\n",
    "parameters": {
        "server_hostname": {
            "default": "WordPress",
            "label": "Server Name",
            "type": "string",
            "description":
                "Hostname to use for the server that's built.",
            "constraints": [
                {
                    "length": {
                        "max": 64,
                        "min": 1
                    }
                },
                {
                    "allowed_pattern": "^[a-zA-Z][a-zA-Z0-9-]*$",
                    "description":
                        "Must begin with a letter and contain only " +
                        "alphanumeric characters.\n"
                }
            ]
        },
        "username": {
            "default": "wp_user",
            "label": "Username",
            "type": "string",
            "description":
                "Username for system, database, and WordPress logins.",
            "constraints": [
                {
                    "allowed_pattern": "^[a-zA-Z0-9 _.@-]{1,16}$",
                    "description":
                        "Must be shorter than 16 characters and may " +
                        "only contain alphanumeric\ncharacters, ' ', " +
                        "'_', '.', '@', and/or '-'.\n"
                }
            ]
        },
        "domain": {
            "default": "example.com",
            "label": "Site Domain",
            "type": "string",
            "description": "Domain to be used with WordPress site",
            "constraints": [
                {
                    "allowed_pattern":
                        "^[a-zA-Z0-9.-]{1,255}.[a-zA-Z]{2,15}$",
                    "description": "Must be a valid domain name"
                }
            ]
        },
        "image": {
            "default": "Ubuntu 12.04 LTS (Precise Pangolin) (PVHVM)",
            "label": "Operating System",
            "type": "string",
            "description":
                "Required: Server image used for all servers that " +
                "are created as a part of\nthis deployment.\n",
            "constraints": [
                {
                    "description":
                        "Must be a supported operating system.",
                    "allowed_values": [
                        "Ubuntu 12.04 LTS (Precise Pangolin) (PVHVM)"
                    ]
                }
            ]
        },
        "prefix": {
            "default": "wp_",
            "label": "Database Prefix",
            "type": "string",
            "description":
                "Prefix to use for WordPress database tables",
            "constraints": [
                {
                    "allowed_pattern": "^[0-9a-zA-Z$_]{0,10}$",
                    "description":
                        "Prefix must be shorter than 10 characters, " +
                        "and can only include\nletters, numbers, $, " +
                        "and/or underscores.\n"
                }
            ]
        },
        "version": {
            "default": "3.9.3",
            "label": "WordPress Version",
            "type": "string",
            "description": "Version of WordPress to install",
            "constraints": [
                {
                    "allowed_values": [
                        "3.9.3"
                    ]
                }
            ]
        },
        "database_name": {
            "default": "wordpress",
            "label": "Database Name",
            "type": "string",
            "description": "WordPress database name",
            "constraints": [
                {
                    "allowed_pattern": "^[0-9a-zA-Z$_]{1,64}$",
                    "description":
                        "Maximum length of 64 characters, may only " +
                        "contain letters, numbers, and\nunderscores.\n"
                }
            ]
        },
        "flavor": {
            "default": "4 GB General Purpose v1",
            "label": "Server Size",
            "type": "string",
            "description":
                "Required: Rackspace Cloud Server flavor to use. The " +
                "size is based on the\namount of RAM for the " +
                "provisioned server.\n",
            "constraints": [
                {
                    "description":
                        "Must be a valid Rackspace Cloud Server " +
                        "flavor for the region you have\nselected to " +
                        "deploy into.\n",
                    "allowed_values": [
                        "1 GB General Purpose v1",
                        "2 GB General Purpose v1",
                        "4 GB General Purpose v1",
                        "8 GB General Purpose v1",
                        "15 GB I/O v1",
                        "30 GB I/O v1",
                        "1GB Standard Instance",
                        "2GB Standard Instance",
                        "4GB Standard Instance",
                        "8GB Standard Instance",
                        "15GB Standard Instance",
                        "30GB Standard Instance"
                    ]
                }
            ]
        },
        "chef_version": {
            "default": "11.16.2",
            "type": "string",
            "description": "Version of chef client to use",
            "label": "Chef Version"
        },
        "kitchen": {
            "default":
                "https://github.com/rackspace-orchestration-templates" +
                "/wordpress-single.git",
            "type": "string",
            "description":
                "URL for a git repo containing required cookbooks",
            "label": "Kitchen URL"
        }
    },
    "outputs": {
        "mysql_root_password": {
            "description": "MySQL Root Password",
            "value": {
                "get_attr": [
                    "mysql_root_password",
                    "value"
                ]
            }
        },
        "wordpress_password": {
            "description": "WordPress Password",
            "value": {
                "get_attr": [
                    "database_password",
                    "value"
                ]
            }
        },
        "private_key": {
            "description": "SSH Private Key",
            "value": {
                "get_attr": [
                    "ssh_key",
                    "private_key"
                ]
            }
        },
        "server_ip": {
            "description": "Server IP",
            "value": {
                "get_attr": [
                    "wordpress_server",
                    "accessIPv4"
                ]
            }
        },
        "wordpress_user": {
            "description": "WordPress User",
            "value": {
                "get_param": "username"
            }
        }
    },
    "resources": {
        "sync_key": {
            "type": "OS::Nova::KeyPair",
            "properties": {
                "name": {
                    "str_replace": {
                        "params": {
                            "%stack_id%": {
                                "get_param": "OS::stack_id"
                            }
                        },
                        "template": "%stack_id%-sync"
                    }
                },
                "save_private_key": true
            }
        },
        "wp_secure_auth": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 32,
                "sequence": "hexdigits"
            }
        },
        "wordpress_server": {
            "depends_on": "ssh_key",
            "type": "OS::Nova::Server",
            "properties": {
                "key_name": {
                    "get_resource": "ssh_key"
                },
                "flavor": {
                    "get_param": "flavor"
                },
                "name": {
                    "get_param": "server_hostname"
                },
                "image": {
                    "get_param": "image"
                },
                "metadata": {
                    "rax-heat": {
                        "get_param": "OS::stack_id"
                    }
                }
            }
        },
        "mysql_root_password": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 16,
                "sequence": "lettersdigits"
            }
        },
        "mysql_debian_password": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 16,
                "sequence": "lettersdigits"
            }
        },
        "wp_auth": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 32,
                "sequence": "hexdigits"
            }
        },
        "wp_nonce": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 32,
                "sequence": "hexdigits"
            }
        },
        "ssh_key": {
            "type": "OS::Nova::KeyPair",
            "properties": {
                "name": {
                    "get_param": "OS::stack_id"
                },
                "save_private_key": true
            }
        },
        "wordpress_setup": {
            "depends_on": "wordpress_server",
            "type": "OS::Heat::ChefSolo",
            "properties": {
                "username": "root",
                "node": {
                    "varnish": {
                        "version": "3.0",
                        "listen_port": "80"
                    },
                    "sysctl": {
                        "values": {
                            "fs.inotify.max_user_watches": 1000000
                        }
                    },
                    "lsyncd": {
                        "interval": 5
                    },
                    "monit": {
                        "mail_format": {
                            "from": "monit@localhost"
                        },
                        "notify_email": "root@localhost"
                    },
                    "vsftpd": {
                        "hide_ids": false,
                        "chroot_local_user": false,
                        "ssl_enable": true,
                        "ssl_ciphers": "AES256-SHA",
                        "write_enable": true,
                        "ipaddress": "",
                        "local_umask": "002"
                    },
                    "wordpress": {
                        "keys": {
                            "logged_in": {
                                "get_attr": [
                                    "wp_logged_in",
                                    "value"
                                ]
                            },
                            "secure_auth_key": {
                                "get_attr": [
                                    "wp_secure_auth",
                                    "value"
                                ]
                            },
                            "nonce_key": {
                                "get_attr": [
                                    "wp_nonce",
                                    "value"
                                ]
                            },
                            "auth": {
                                "get_attr": [
                                    "wp_auth",
                                    "value"
                                ]
                            }
                        },
                        "server_aliases": [
                            {
                                "get_param": "domain"
                            }
                        ],
                        "version": {
                            "get_param": "version"
                        },
                        "db": {
                            "user": {
                                "get_param": "username"
                            },
                            "host": "127.0.0.1",
                            "name": {
                                "get_param": "database_name"
                            },
                            "pass": {
                                "get_attr": [
                                    "database_password",
                                    "value"
                                ]
                            }
                        },
                        "dir": {
                            "str_replace": {
                                "params": {
                                    "%domain%": {
                                        "get_param": "domain"
                                    }
                                },
                                "template": "/var/www/vhosts/%domain%"
                            }
                        }
                    },
                    "run_list": [
                        "recipe[apt]",
                        "recipe[build-essential]",
                        "recipe[rax-wordpress::apache-prep]",
                        "recipe[sysctl::attribute_driver]",
                        "recipe[mysql::server]",
                        "recipe[rax-wordpress::mysql]",
                        "recipe[hollandbackup]",
                        "recipe[hollandbackup::mysqldump]",
                        "recipe[hollandbackup::main]",
                        "recipe[hollandbackup::backupsets]",
                        "recipe[hollandbackup::cron]",
                        "recipe[rax-wordpress::x509]",
                        "recipe[memcached]",
                        "recipe[php]",
                        "recipe[rax-install-packages]",
                        "recipe[wordpress]",
                        "recipe[rax-wordpress::wp-setup]",
                        "recipe[rax-wordpress::user]",
                        "recipe[rax-wordpress::memcache]",
                        "recipe[lsyncd]",
                        "recipe[vsftpd]",
                        "recipe[rax-wordpress::vsftpd]",
                        "recipe[varnish::repo]",
                        "recipe[varnish]",
                        "recipe[rax-wordpress::apache]",
                        "recipe[rax-wordpress::varnish]",
                        "recipe[rax-wordpress::firewall]",
                        "recipe[rax-wordpress::vsftpd-firewall]",
                        "recipe[rax-wordpress::lsyncd]"
                    ],
                    "mysql": {
                        "bind_address": "127.0.0.1",
                        "remove_test_database": true,
                        "server_debian_password": {
                            "get_attr": [
                                "mysql_debian_password",
                                "value"
                            ]
                        },
                        "server_root_password": {
                            "get_attr": [
                                "mysql_root_password",
                                "value"
                            ]
                        },
                        "server_repl_password": {
                            "get_attr": [
                                "mysql_repl_password",
                                "value"
                            ]
                        },
                        "remove_anonymous_users": true
                    },
                    "apache": {
                        "listen_ports": [
                            8080
                        ],
                        "serversignature": "Off",
                        "traceenable": "Off",
                        "timeout": 30
                    },
                    "memcached": {
                        "listen": "127.0.0.1"
                    },
                    "hollandbackup": {
                        "main": {
                            "mysqldump": {
                                "host": "localhost",
                                "password": {
                                    "get_attr": [
                                        "mysql_root_password",
                                        "value"
                                    ]
                                },
                                "user": "root"
                            },
                            "backup_directory": "/var/lib/mysqlbackup"
                        }
                    },
                    "rax": {
                        "apache": {
                            "domain": {
                                "get_param": "domain"
                            }
                        },
                        "varnish": {
                            "master_backend": "localhost"
                        },
                        "packages": [
                            "php5-imagick"
                        ],
                        "wordpress": {
                            "admin_pass": {
                                "get_attr": [
                                    "database_password",
                                    "value"
                                ]
                            },
                            "admin_user": {
                                "get_param": "username"
                            },
                            "user": {
                                "group": {
                                    "get_param": "username"
                                },
                                "name": {
                                    "get_param": "username"
                                }
                            }
                        },
                        "lsyncd": {
                            "ssh": {
                                "private_key": {
                                    "get_attr": [
                                        "sync_key",
                                        "private_key"
                                    ]
                                }
                            }
                        }
                    }
                },
                "private_key": {
                    "get_attr": [
                        "ssh_key",
                        "private_key"
                    ]
                },
                "kitchen": {
                    "get_param": "kitchen"
                },
                "host": {
                    "get_attr": [
                        "wordpress_server",
                        "accessIPv4"
                    ]
                },
                "chef_version": {
                    "get_param": "chef_version"
                }
            }
        },
        "database_password": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 16,
                "sequence": "lettersdigits"
            }
        },
        "wp_logged_in": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 32,
                "sequence": "hexdigits"
            }
        },
        "mysql_repl_password": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 16,
                "sequence": "lettersdigits"
            }
        }
    }
};
