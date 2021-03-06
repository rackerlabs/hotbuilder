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

var TEMPLATES = {},
    UNSUPPORTED_TEMPLATES = {};

TEMPLATES.lamp_single = {
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
                "phpmyadmin_user"
            ],
            "label": "phpMyAdmin Settings"
        },
        {
            "parameters": [
                "kitchen",
                "chef_version"
            ],
            "label": "rax-dev-params"
        }
    ],
    "heat_template_version": "2013-05-23",
    "description": "This is a Heat template to deploy a server with LAMP\n",
    "parameters": {
        "server_hostname": {
            "default": "web",
            "label": "Server Name",
            "type": "string",
            "description": "Hostname to use for setting the server name.",
            "constraints": [
                {
                    "length": {
                        "max": 64,
                        "min": 1
                    }
                },
                {
                    "allowed_pattern": "^[a-zA-Z0-9]([a-zA-Z0-9.-])*$",
                    "description": "Must begin with a letter or number and be alphanumeric or '-' and '.'\n"
                }
            ]
        },
        "phpmyadmin_user": {
            "default": "serverinfo",
            "label": "Username",
            "type": "string",
            "description": "Username for phpMyAdmin logins.",
            "constraints": [
                {
                    "allowed_pattern": "^(.){1,16}$",
                    "description": "Must be shorter than 16 characters, this is due to MySQL's maximum\nusername length.\n"
                }
            ]
        },
        "image": {
            "default": "CentOS 6 (PVHVM)",
            "label": "Operating System",
            "type": "string",
            "description": "Required: Server image used for all servers that are created as a part of\nthis deployment.\n",
            "constraints": [
                {
                    "description": "Must be a supported operating system.",
                    "allowed_values": [
                        "CentOS 7 (PVHVM)",
                        "CentOS 6 (PVHVM)",
                        "Debian 8 (Jessie) (PVHVM)",
                        "Debian 7 (Wheezy) (PVHVM)",
                        "Red Hat Enterprise Linux 6 (PVHVM)",
                        "Ubuntu 14.04 LTS (Trusty Tahr) (PVHVM)",
                        "Ubuntu 12.04 LTS (Precise Pangolin) (PVHVM)"
                    ]
                }
            ]
        },
        "kitchen": {
            "default": "https://github.com/rackspace-orchestration-templates/lamp",
            "type": "string",
            "description": "URL for the kitchen to use",
            "label": "Kitchen URL"
        },
        "flavor": {
            "default": "1 GB General Purpose v1",
            "label": "Server Size",
            "type": "string",
            "description": "Required: Rackspace Cloud Server flavor to use. The size is based on the\namount of RAM for the provisioned server.\n",
            "constraints": [
                {
                    "description": "Must be a valid Rackspace Cloud Server flavor for the region you have\nselected to deploy into.\n",
                    "allowed_values": [
                        "1 GB General Purpose v1",
                        "2 GB General Purpose v1",
                        "4 GB General Purpose v1",
                        "8 GB General Purpose v1",
                        "15 GB I/O v1",
                        "30 GB I/O v1"
                    ]
                }
            ]
        },
        "chef_version": {
            "default": "11.12.8",
            "type": "string",
            "description": "Version of chef client to use",
            "label": "Chef Version"
        }
    },
    "outputs": {
        "phpmyadmin_user": {
            "description": "phpMyAdmin User",
            "value": {
                "get_param": "phpmyadmin_user"
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
                    "linux_server",
                    "accessIPv4"
                ]
            }
        },
        "mysql_root_password": {
            "description": "MySQL Root Password",
            "value": {
                "get_attr": [
                    "mysql_root_password",
                    "value"
                ]
            }
        },
        "phpmyadmin_password": {
            "description": "phpMyAdmin Password",
            "value": {
                "get_attr": [
                    "phpmyadmin_pass",
                    "value"
                ]
            }
        },
        "phpmyadmin_url": {
            "description": "phpMyAdmin URL",
            "value": {
                "str_replace": {
                    "params": {
                        "%server_ip%": {
                            "get_attr": [
                                "linux_server",
                                "accessIPv4"
                            ]
                        }
                    },
                    "template": "http://%server_ip%/phpmyadmin"
                }
            }
        }
    },
    "resources": {
        "linux_server": {
            "type": "OS::Nova::Server",
            "properties": {
                "name": {
                    "get_param": "server_hostname"
                },
                "key_name": {
                    "get_resource": "ssh_key"
                },
                "image": {
                    "get_param": "image"
                },
                "metadata": {
                    "rax-heat": {
                        "get_param": "OS::stack_id"
                    }
                },
                "flavor": {
                    "get_param": "flavor"
                },
                //"config_drive": "true"
                "config_drive": true
            }
        },
        "phpmyadmin_pass": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 16,
                "sequence": "lettersdigits"
            }
        },
        "mysql_root_password": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 16,
                "sequence": "lettersdigits"
            }
        },
        "mysql_repl_password": {
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
        "ssh_key": {
            "type": "OS::Nova::KeyPair",
            "properties": {
                "name": {
                    "get_param": "OS::stack_id"
                },
                "save_private_key": true
            }
        },
        "linux_setup": {
            "depends_on": "linux_server",
            "type": "OS::Heat::ChefSolo",
            "properties": {
                "username": "root",
                "node": {
                    "phpmyadmin": {
                        "user": {
                            "get_param": "phpmyadmin_user"
                        },
                        "pass": {
                            "get_attr": [
                                "phpmyadmin_pass",
                                "value"
                            ]
                        }
                    },
                    "run_list": [
                        "recipe[LAMP]"
                    ],
                    "mysql": {
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
                        "server_debian_password": {
                            "get_attr": [
                                "mysql_debian_password",
                                "value"
                            ]
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
                        "linux_server",
                        "accessIPv4"
                    ]
                },
                "chef_version": {
                    "get_param": "chef_version"
                }
            }
        }
    }
};

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
    "description": "This is a Heat template to deploy a single Linux server running WordPress.\n",
    "parameters": {
        "server_hostname": {
            "default": "WordPress",
            "label": "Server Name",
            "type": "string",
            "description": "Hostname to use for the server that's built.",
            "constraints": [
                {
                    "length": {
                        "max": 64,
                        "min": 1
                    }
                },
                {
                    "allowed_pattern": "^[a-zA-Z][a-zA-Z0-9-]*$",
                    "description": "Must begin with a letter and contain only alphanumeric characters.\n"
                }
            ]
        },
        "username": {
            "default": "wp_user",
            "label": "Username",
            "type": "string",
            "description": "Username for system, database, and WordPress logins.",
            "constraints": [
                {
                    "allowed_pattern": "^[a-zA-Z0-9 _.@-]{1,16}$",
                    "description": "Must be shorter than 16 characters and may only contain alphanumeric\ncharacters, ' ', '_', '.', '@', and/or '-'.\n"
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
                    "allowed_pattern": "^[a-zA-Z0-9.-]{1,255}.[a-zA-Z]{2,15}$",
                    "description": "Must be a valid domain name"
                }
            ]
        },
        "image": {
            "default": "Ubuntu 12.04 LTS (Precise Pangolin) (PVHVM)",
            "label": "Operating System",
            "type": "string",
            "description": "Required: Server image used for all servers that are created as a part of\nthis deployment.\n",
            "constraints": [
                {
                    "description": "Must be a supported operating system.",
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
            "description": "Prefix to use for WordPress database tables",
            "constraints": [
                {
                    "allowed_pattern": "^[0-9a-zA-Z$_]{0,10}$",
                    "description": "Prefix must be shorter than 10 characters, and can only include\nletters, numbers, $, and/or underscores.\n"
                }
            ]
        },
        "version": {
            "default": "4.2.2",
            "label": "WordPress Version",
            "type": "string",
            "description": "Version of WordPress to install",
            "constraints": [
                {
                    "allowed_values": [
                        "4.2.2"
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
                    "description": "Maximum length of 64 characters, may only contain letters, numbers, and\nunderscores.\n"
                }
            ]
        },
        "flavor": {
            "default": "4 GB General Purpose v1",
            "label": "Server Size",
            "type": "string",
            "description": "Required: Rackspace Cloud Server flavor to use. The size is based on the\namount of RAM for the provisioned server.\n",
            "constraints": [
                {
                    "description": "Must be a valid Rackspace Cloud Server flavor for the region you have\nselected to deploy into.\n",
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
            "default": "https://github.com/rackspace-orchestration-templates/wordpress-single.git",
            "type": "string",
            "description": "URL for a git repo containing required cookbooks",
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

TEMPLATES.php_single = {
    "parameter_groups": [
        {
            "parameters": [
                "image",
                "flavor"
            ],
            "label": "Server Settings"
        },
        {
            "parameters": [
                "url",
                "revision",
                "packages",
                "repo",
                "deploy_key",
                "destination",
                "public"
            ],
            "label": "PHP Application Settings"
        },
        {
            "parameters": [
                "server_hostname",
                "http_port",
                "https_port",
                "memcached_size",
                "kitchen",
                "chef_version"
            ],
            "label": "rax-dev-params"
        }
    ],
    "heat_template_version": "2013-05-23",
    "description": "Heat template to deploy a single server running a PHP app under apache\n",
    "parameters": {
        "server_hostname": {
            "default": "php",
            "label": "Server Name",
            "type": "string",
            "description": "Server Name",
            "constraints": [
                {
                    "length": {
                        "max": 64,
                        "min": 1
                    }
                },
                {
                    "allowed_pattern": "^[a-zA-Z][a-zA-Z0-9-]*$",
                    "description": "Must begin with a letter and contain only alphanumeric characters.\n"
                }
            ]
        },
        "http_port": {
            //"default": 80,
            "default": "80",
            "type": "string",
            "description": "HTTP Port",
            "label": "HTTP Port"
        },
        "https_port": {
            //"default": 443,
            "default": "443",
            "type": "string",
            "description": "HTTPS Port",
            "label": "HTTPS Port"
        },
        "url": {
            "default": "http://example.com",
            "type": "string",
            "description": "URL for site",
            "label": "Site Domain"
        },
        "image": {
            "default": "Ubuntu 12.04 LTS (Precise Pangolin) (PVHVM)",
            "label": "Operating System",
            "type": "string",
            "description": "Required: Server image used for all servers that are created as a part of\nthis deployment.\n",
            "constraints": [
                {
                    "description": "Must be a supported operating system.",
                    "allowed_values": [
                        "Ubuntu 12.04 LTS (Precise Pangolin) (PVHVM)"
                    ]
                }
            ]
        },
        "destination": {
            "default": "/var/www/vhosts/application",
            "type": "string",
            "description": "Path to setup your application on your servers.",
            "label": "Site Path"
        },
        "public": {
            "default": "/",
            "type": "string",
            "description": "The public facing directory of your application relative to the\ndestination.\n",
            "label": "Public Directory"
        },
        "repo": {
            "default": "",
            "type": "string",
            "description": "Optional: URL to your git repository. Use the https syntax for public\nrepositories, use git@ syntax for private repositories.\n",
            "label": "Git Repository"
        },
        "memcached_size": {
            "default": 128,
            "type": "number",
            "description": "Memcached memory size limit",
            "label": "Memcached Memory Limit"
        },
        "packages": {
            "default": "",
            "type": "string",
            "description": "Optional: Additional system packages to install. For a list of available\npackages, see: http://packages.ubuntu.com/precise/allpackages\n",
            "label": "System Packages"
        },
        "flavor": {
            "default": "4 GB General Purpose v1",
            "label": "Server Size",
            "type": "string",
            "description": "Required: Rackspace Cloud Server flavor to use. The size is based on the\namount of RAM for the provisioned server.\n",
            "constraints": [
                {
                    "description": "Must be a valid Rackspace Cloud Server flavor for the region you have\nselected to deploy into.\n",
                    "allowed_values": [
                        "1 GB General Purpose v1",
                        "2 GB General Purpose v1",
                        "4 GB General Purpose v1",
                        "8 GB General Purpose v1",
                        "15 GB I/O v1",
                        "30 GB I/O v1",
                        "512MB Standard Instance",
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
        "deploy_key": {
            "default": "",
            "type": "string",
            "description": "Optional: If you specified a private repository, provide your private\ndeploy key here.\n",
            "label": "Git Deploy Key"
        },
        "revision": {
            "default": "HEAD",
            "type": "string",
            "description": "Optional: Git Branch/Ref to deploy. Default: HEAD\n",
            "label": "Revision"
        },
        "chef_version": {
            "default": "12.2.1-1",
            "type": "string",
            "description": "Version of chef client to use",
            "label": "Chef Version"
        },
        "kitchen": {
            "default": "https://github.com/rackspace-orchestration-templates/php-app-single",
            "type": "string",
            "description": "URL for the kitchen to use",
            "label": "Kitchen"
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
                    "php_server",
                    "accessIPv4"
                ]
            }
        }
    },
    "resources": {
        "mysql_root_password": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 32,
                "sequence": "lettersdigits"
            }
        },
        "mysql_debian_password": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 32,
                "sequence": "lettersdigits"
            }
        },
        "php_setup": {
            "depends_on": "php_server",
            "type": "OS::Heat::ChefSolo",
            "properties": {
                "username": "root",
                "node": {
                    "varnish": {
                        "backend_host": "127.0.0.1"
                    },
                    "php_app": {
                        "http_port": {
                            "get_param": "http_port"
                        },
                        "https_port": {
                            "get_param": "https_port"
                        },
                        "url": {
                            "get_param": "url"
                        },
                        "destination": {
                            "get_param": "destination"
                        },
                        "rev": {
                            "get_param": "revision"
                        },
                        "repo": {
                            "get_param": "repo"
                        },
                        "packages": {
                            "get_param": "packages"
                        },
                        "deploy_key": {
                            "get_param": "deploy_key"
                        },
                        "public": {
                            "get_param": "public"
                        }
                    },
                    "memcached": {
                        "listen": "127.0.0.1"
                    },
                    "run_list": [
                        "recipe[apt]",
                        "recipe[build-essential]",
                        "recipe[memcached]",
                        "recipe[rax_php_app]",
                        "recipe[php-ioncube]",
                        "recipe[mysql::server]"
                    ],
                    "mysql": {
                        "server_root_password": {
                            "get_attr": [
                                "mysql_root_password",
                                "value"
                            ]
                        },
                        "bind_address": "127.0.0.1",
                        "server_debian_password": {
                            "get_attr": [
                                "mysql_debian_password",
                                "value"
                            ]
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
                        "php_server",
                        "accessIPv4"
                    ]
                },
                "chef_version": {
                    "get_param": "chef_version"
                }
            }
        },
        "php_server": {
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
        "ssh_key": {
            "type": "OS::Nova::KeyPair",
            "properties": {
                "name": {
                    "get_param": "OS::stack_id"
                },
                "save_private_key": true
            }
        }
    }
};

TEMPLATES.magento_single = {
    "parameter_groups": [
        {
            "parameters": [
                "image",
                "flavor"
            ],
            "label": "Server Settings"
        },
        {
            "parameters": [
                "domain",
                "terms",
                "username"
            ],
            "label": "Magento Settings"
        },
        {
            "parameters": [
                "server_hostname",
                "database_name",
                "database_user",
                "kitchen",
                "chef_version",
                "admin_email",
                "first_name",
                "last_name",
                "install_sample_data"
            ],
            "label": "rax-dev-params"
        }
    ],
    "heat_template_version": "2013-05-23",
    "description": "This is a Heat template to deploy a single Linux server running Magento\nCommunity Edition.\n",
    "parameters": {
        "server_hostname": {
            "default": "Magento",
            "label": "Server Name",
            "type": "string",
            "description": "Hostname to use for the server that is built.",
            "constraints": [
                {
                    "length": {
                        "max": 64,
                        "min": 1
                    }
                },
                {
                    "allowed_pattern": "^[a-zA-Z][a-zA-Z0-9-]*$",
                    "description": "Must begin with a letter and contain only alphanumeric characters.\n"
                }
            ]
        },
        "username": {
            "default": "MagentoAdmin",
            "label": "Admin User",
            "type": "string",
            "description": "Username for the Magento Administrative user account.",
            "constraints": [
                {
                    "allowed_pattern": "^(.){1,16}$",
                    "description": "Must be shorter than 16 characters.\n"
                }
            ]
        },
        "domain": {
            "default": "example.com",
            "label": "Site Domain",
            "type": "string",
            "description": "Domain to be used with the Magento store",
            "constraints": [
                {
                    "allowed_pattern": "^[a-zA-Z0-9.-]{1,255}.[a-zA-Z]{2,15}$",
                    "description": "Must be a valid domain name"
                }
            ]
        },
        "last_name": {
            "default": "last",
            "type": "string",
            "description": "Last name of the Admin user",
            "label": "Last Name"
        },
        "terms": {
            "label": "Agree to Terms",
            "type": "boolean",
            "description": "Required: You must agree to the Magento Community Edition License which\ncan be found here: http://opensource.org/licenses/osl-3.0.php\n",
            "constraints": [
                {
                    "description": "Terms must be accepted.",
                    "allowed_values": [
                        true
                    ]
                }
            ]
        },
        "database_name": {
            "default": "magento",
            "label": "Database Name",
            "type": "string",
            "description": "Magento database name",
            "constraints": [
                {
                    "allowed_pattern": "^[0-9a-zA-Z$_]{1,64}$",
                    "description": "Maximum length of 64 characters, may only contain letters, numbers, and\nunderscores.\n"
                }
            ]
        },
        "first_name": {
            "default": "first",
            "type": "string",
            "description": "First name of the Admin user",
            "label": "First Name"
        },
        "database_user": {
            "default": "magentouser",
            "label": "Database User",
            "type": "string",
            "description": "Magento Database Username",
            "constraints": [
                {
                    "allowed_pattern": "^(.){1,16}$",
                    "description": "Must be shorter than 16 characters, this is due to MySQL's maximum\nusername length.\n"
                }
            ]
        },
        "image": {
            "default": "Ubuntu 12.04 LTS (Precise Pangolin) (PVHVM)",
            "label": "Operating System",
            "type": "string",
            "description": "Required: Server image used for all servers that are created as a part of\nthis deployment.\n",
            "constraints": [
                {
                    "description": "Must be a supported operating system.",
                    "allowed_values": [
                        "Ubuntu 12.04 LTS (Precise Pangolin) (PVHVM)",
                        "CentOS 6 (PVHVM)"
                    ]
                }
            ]
        },
        "install_sample_data": {
            "default": false,
            "type": "boolean",
            "description": "If selected, this will install Magento sample data. This can be useful\nfor development purposes.\n",
            "label": "Install Sample Data"
        },
        "admin_email": {
            "default": "admin@example.com",
            "type": "string",
            "description": "Email address to associate with the Magento admin account.",
            "label": "Admin Email"
        },
        "chef_version": {
            "default": "11.14.2",
            "type": "string",
            "description": "Version of chef client to use",
            "label": "Chef Version"
        },
        "flavor": {
            "default": "4 GB General Purpose v1",
            "label": "Server Size",
            "type": "string",
            "description": "Required: Rackspace Cloud Server flavor to use. The size is based on the\namount of RAM for the provisioned server.\n",
            "constraints": [
                {
                    "description": "Must be a valid Rackspace Cloud Server flavor for the region you have\nselected to deploy into.\n",
                    "allowed_values": [
                        "4 GB General Purpose v1",
                        "8 GB General Purpose v1",
                        "15 GB I/O v1",
                        "30 GB I/O v1"
                    ]
                }
            ]
        },
        "kitchen": {
            "default": "https://github.com/rackspace-orchestration-templates/magento-single",
            "type": "string",
            "description": "URL for a git repo containing required cookbooks",
            "label": "Kitchen URL"
        }
    },
    "outputs": {
        "private_key": {
            "description": "SSH Private Key",
            "value": {
                "get_attr": [
                    "ssh_key",
                    "private_key"
                ]
            }
        },
        "admin_user": {
            "description": "Admin User",
            "value": {
                "get_param": "username"
            }
        },
        "admin_password": {
            "description": "Admin Password",
            "value": {
                "get_attr": [
                    "admin_password",
                    "value"
                ]
            }
        },
        "server_ip": {
            "description": "Server IP",
            "value": {
                "get_attr": [
                    "magento_server",
                    "accessIPv4"
                ]
            }
        },
        "mysql_root_password": {
            "description": "MySQL Root Password",
            "value": {
                "get_attr": [
                    "mysql_root_password",
                    "value"
                ]
            }
        },
        "admin_url": {
            "description": "Admin URL",
            "value": {
                "str_replace": {
                    "params": {
                        "%domain%": {
                            "get_param": "domain"
                        }
                    },
                    "template": "https://%domain%/admin"
                }
            }
        },
        "magento_url": {
            "description": "Store URL",
            "value": {
                "str_replace": {
                    "params": {
                        "%domain%": {
                            "get_param": "domain"
                        }
                    },
                    "template": "http://%domain%"
                }
            }
        }
    },
    "resources": {
        "mysql_root_password": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 16,
                "sequence": "lettersdigits"
            }
        },
        "magento_server": {
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
        "mysql_debian_password": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 16,
                "sequence": "lettersdigits"
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
        "magento_setup": {
            "depends_on": "magento_server",
            "type": "OS::Heat::ChefSolo",
            "properties": {
                "username": "root",
                "node": {
                    "magento": {
                        "domain": {
                            "get_param": "domain"
                        },
                        "db": {
                            "username": {
                                "get_param": "database_user"
                            },
                            "database": {
                                "get_param": "database_name"
                            },
                            "host": "localhost",
                            "password": {
                                "get_attr": [
                                    "database_password",
                                    "value"
                                ]
                            },
                            "acl": "localhost"
                        }
                    },
                    "run_list": [
                        "recipe[apt]",
                        "recipe[build-essential]",
                        "recipe[rax-magento]",
                        "recipe[hollandbackup]",
                        "recipe[hollandbackup::mysqldump]",
                        "recipe[hollandbackup::main]",
                        "recipe[hollandbackup::backupsets]",
                        "recipe[hollandbackup::cron]",
                        "recipe[rax-firewall]"
                    ],
                    "mysql": {
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
                        "server_debian_password": {
                            "get_attr": [
                                "mysql_debian_password",
                                "value"
                            ]
                        }
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
                        "firewall": {
                            "tcp": [
                                80,
                                443
                            ]
                        },
                        "magento": {
                            "admin_user": {
                                "username": {
                                    "get_param": "username"
                                },
                                "lastname": {
                                    "get_param": "last_name"
                                },
                                "password": {
                                    "get_attr": [
                                        "admin_password",
                                        "value"
                                    ]
                                },
                                "email": {
                                    "get_param": "admin_email"
                                },
                                "firstname": {
                                    "get_param": "first_name"
                                }
                            },
                            "encryption_key": {
                                "get_attr": [
                                    "magento_encryption_key",
                                    "value"
                                ]
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
                        "magento_server",
                        "accessIPv4"
                    ]
                },
                "chef_version": {
                    "get_param": "chef_version"
                }
            }
        },
        "magento_encryption_key": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 32,
                "sequence": "hexdigits"
            }
        },
        "admin_password": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 16,
                "sequence": "lettersdigits"
            }
        },
        "database_password": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 16,
                "sequence": "lettersdigits"
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

TEMPLATES.drupal_single = {
    "parameter_groups": [
        {
            "parameters": [
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
            "label": "Drupal Settings"
        },
        {
            "parameters": [
                "version",
                "server_hostname",
                "database_name",
                "kitchen",
                "chef_version"
            ],
            "label": "rax-dev-params"
        }
    ],
    "heat_template_version": "2013-05-23",
    "description": "This is a Heat template to deploy a single Linux server running Drupal.\n",
    "parameters": {
        "server_hostname": {
            "default": "Drupal",
            "label": "Server Name",
            "type": "string",
            "description": "Hostname to use for the server that's built.",
            "constraints": [
                {
                    "length": {
                        "max": 64,
                        "min": 1
                    }
                },
                {
                    "allowed_pattern": "^[a-zA-Z][a-zA-Z0-9-]*$",
                    "description": "Must begin with a letter and contain only alphanumeric characters.\n"
                }
            ]
        },
        "username": {
            "default": "admin",
            "label": "Username",
            "type": "string",
            "description": "Username for the Drupal admin login",
            "constraints": [
                {
                    "allowed_pattern": "^(.){1,16}$",
                    "description": "Must be shorter than 16 characters, this is due to MySQL's maximum\nusername length.\n"
                }
            ]
        },
        "domain": {
            "default": "example.com",
            "label": "Site Domain",
            "type": "string",
            "description": "Domain to be used with the Drupal site",
            "constraints": [
                {
                    "allowed_pattern": "^[a-zA-Z0-9.-]{1,255}.[a-zA-Z]{2,15}$",
                    "description": "Must be a valid domain name"
                }
            ]
        },
        "database_name": {
            "default": "drupal",
            "label": "Database Name",
            "type": "string",
            "description": "Drupal database name",
            "constraints": [
                {
                    "allowed_pattern": "^[0-9a-zA-Z$_]{1,64}$",
                    "description": "Maximum length of 64 characters, may only contain letters, numbers, and\nunderscores.\n"
                }
            ]
        },
        "version": {
            "default": "7",
            "label": "Drupal Version",
            "type": "string",
            "description": "Version of Drupal to install",
            "constraints": [
                {
                    "allowed_pattern": "^7(\\.?[0-9-a-zA-Z-])*$",
                    "description": "Must be a valid 7.x release.\n"
                }
            ]
        },
        "image": {
            "default": "Ubuntu 12.04 LTS (Precise Pangolin) (PVHVM)",
            "label": "Operating System",
            "type": "string",
            "description": "Required: Server image used for all servers that are created as a part of\nthis deployment.\n",
            "constraints": [
                {
                    "description": "Must be a supported operating system.",
                    "allowed_values": [
                        "Ubuntu 12.04 LTS (Precise Pangolin) (PVHVM)",
                        "Debian 7 (Wheezy) (PVHVM)",
                        "CentOS 6 (PVHVM)",
                        "Red Hat Enterprise Linux 6 (PVHVM)"
                    ]
                }
            ]
        },
        "flavor": {
            "default": "4 GB General Purpose v1",
            "label": "Server Size",
            "type": "string",
            "description": "Required: Rackspace Cloud Server flavor to use. The size is based on the\namount of RAM for the provisioned server.\n",
            "constraints": [
                {
                    "description": "Must be a valid Rackspace Cloud Server flavor for the region you have\nselected to deploy into.\n",
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
            "default": "11.16.4",
            "type": "string",
            "description": "Version of chef client to use",
            "label": "Chef Version"
        },
        "kitchen": {
            "default": "https://github.com/rackspace-orchestration-templates/drupal-single.git",
            "type": "string",
            "description": "URL for a git repo containing required cookbooks",
            "label": "Kitchen URL"
        }
    },
    "outputs": {
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
                    "drupal_server",
                    "accessIPv4"
                ]
            }
        },
        "drupal_url": {
            "description": "Drupal URL",
            "value": {
                "str_replace": {
                    "params": {
                        "%ip%": {
                            "get_attr": [
                                "drupal_server",
                                "accessIPv4"
                            ]
                        }
                    },
                    "template": "http://%ip%"
                }
            }
        },
        "mysql_root_password": {
            "description": "MySQL Root Password",
            "value": {
                "get_attr": [
                    "mysql_root_password",
                    "value"
                ]
            }
        },
        "drupal_password": {
            "description": "Drupal Password",
            "value": {
                "get_attr": [
                    "database_password",
                    "value"
                ]
            }
        },
        "drupal_user": {
            "description": "Drupal User",
            "value": {
                "get_param": "username"
            }
        }
    },
    "resources": {
        "drupal_server": {
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
        "drupal_setup": {
            "depends_on": "drupal_server",
            "type": "OS::Heat::ChefSolo",
            "properties": {
                "username": "root",
                "node": {
                    "apache": {
                        "serversignature": "Off",
                        "traceenable": "Off",
                        "timeout": 30
                    },
                    "run_list": [
                        "recipe[apt]",
                        "recipe[rax-drupal-dir]",
                        "recipe[drupal]",
                        "recipe[dotmy-cnf]",
                        "recipe[patch-drupalconf]",
                        "recipe[hollandbackup]",
                        "recipe[hollandbackup::mysqldump]",
                        "recipe[hollandbackup::main]",
                        "recipe[hollandbackup::backupsets]",
                        "recipe[hollandbackup::cron]",
                        "recipe[rax-firewall]"
                    ],
                    "mysql": {
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
                        "server_debian_password": {
                            "get_attr": [
                                "mysql_debian_password",
                                "value"
                            ]
                        },
                        "remove_anonymous_users": true,
                        "remove_test_database": true
                    },
                    "drupal": {
                        "version": {
                            "get_param": "version"
                        },
                        "db": {
                            "host": "127.0.0.1",
                            "password": {
                                "get_attr": [
                                    "database_password",
                                    "value"
                                ]
                            },
                            "user": {
                                "get_param": "username"
                            },
                            "database": {
                                "get_param": "database_name"
                            }
                        },
                        "site": {
                            "admin": {
                                "get_param": "username"
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
                        "firewall": {
                            "tcp": [
                                80
                            ]
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
                        "drupal_server",
                        "accessIPv4"
                    ]
                },
                "chef_version": {
                    "get_param": "chef_version"
                }
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
        "database_password": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 16,
                "sequence": "lettersdigits"
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

UNSUPPORTED_TEMPLATES.wp_multi = {
    "parameter_groups": [
        {
            "parameters": [
                "image"
            ],
            "label": "Server Settings"
        },
        {
            "parameters": [
                "wp_master_server_flavor",
                "wp_web_server_count",
                "wp_web_server_flavor"
            ],
            "label": "Web Server Settings"
        },
        {
            "parameters": [
                "database_server_flavor"
            ],
            "label": "Database Settings"
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
                "child_template",
                "version",
                "prefix",
                "load_balancer_hostname",
                "wp_web_server_hostnames",
                "wp_master_server_hostname",
                "database_server_hostname"
            ],
            "label": "rax-dev-params"
        }
    ],
    "heat_template_version": "2013-05-23",
    "description": "This is a Heat template to deploy Load Balanced WordPress servers with a\nbackend database server.\n",
    "parameters": {
        "username": {
            "default": "wp_user",
            "label": "Username",
            "type": "string",
            "description": "Username for system, database, and WordPress logins.",
            "constraints": [
                {
                    "allowed_pattern": "^[a-zA-Z0-9 _.@-]{1,16}$",
                    "description": "Must be shorter than 16 characters and may only contain alphanumeric\ncharacters, ' ', '_', '.', '@', and/or '-'.\n"
                }
            ]
        },
        "domain": {
            "default": "example.com",
            "label": "Site Domain",
            "type": "string",
            "description": "Domain to be used with this WordPress site",
            "constraints": [
                {
                    "allowed_pattern": "^[a-zA-Z0-9.-]{1,255}.[a-zA-Z]{2,15}$",
                    "description": "Must be a valid domain name"
                }
            ]
        },
        "wp_web_server_flavor": {
            "default": "2 GB General Purpose v1",
            "label": "Node Server Size",
            "type": "string",
            "description": "Cloud Server size to use on all of the additional web nodes.\n",
            "constraints": [
                {
                    "description": "Must be a valid Rackspace Cloud Server flavor for the region you have\nselected to deploy into.\n",
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
        "wp_web_server_hostnames": {
            "default": "WordPress-Web%index%",
            "label": "Server Name",
            "type": "string",
            "description": "Hostname to use for all additional WordPress web nodes",
            "constraints": [
                {
                    "length": {
                        "max": 64,
                        "min": 1
                    }
                },
                {
                    "allowed_pattern": "^[a-zA-Z][a-zA-Z0-9%-]*$",
                    "description": "Must begin with a letter and contain only alphanumeric characters.\n"
                }
            ]
        },
        "image": {
            "default": "Ubuntu 12.04 LTS (Precise Pangolin) (PVHVM)",
            "label": "Operating System",
            "type": "string",
            "description": "Required: Server image used for all servers that are created as a part of\nthis deployment.\n",
            "constraints": [
                {
                    "description": "Must be a supported operating system.",
                    "allowed_values": [
                        "Ubuntu 12.04 LTS (Precise Pangolin) (PVHVM)"
                    ]
                }
            ]
        },
        "child_template": {
            "default": "https://raw.githubusercontent.com/rackspace-orchestration-templates/wordpress-multi/master/wordpress-web-server.yaml",
            "type": "string",
            "description": "Location of the child template to use for the WordPress web servers\n",
            "label": "Child Template"
        },
        "load_balancer_hostname": {
            "default": "WordPress-Load-Balancer",
            "label": "Load Balancer Hostname",
            "type": "string",
            "description": "Hostname for the Cloud Load Balancer",
            "constraints": [
                {
                    "length": {
                        "max": 64,
                        "min": 1
                    }
                },
                {
                    "allowed_pattern": "^[a-zA-Z][a-zA-Z0-9-]*$",
                    "description": "Must begin with a letter and contain only alphanumeric characters.\n"
                }
            ]
        },
        "prefix": {
            "default": "wp_",
            "label": "Wordpress Prefix",
            "type": "string",
            "description": "Prefix to use for database table names.",
            "constraints": [
                {
                    "allowed_pattern": "^[0-9a-zA-Z$_]{0,10}$",
                    "description": "Prefix must be shorter than 10 characters, and can only include\nletters, numbers, $, and/or underscores.\n"
                }
            ]
        },
        "database_server_flavor": {
            "default": "4 GB General Purpose v1",
            "label": "Server Size",
            "type": "string",
            "description": "Cloud Server size to use for the database server. Sizes refer to the\namount of RAM allocated to the server.\n",
            "constraints": [
                {
                    "description": "Must be a valid Rackspace Cloud Server flavor for the region you have\nselected to deploy into.\n",
                    "allowed_values": [
                        "2 GB General Purpose v1",
                        "4 GB General Purpose v1",
                        "8 GB General Purpose v1",
                        "15 GB I/O v1",
                        "30 GB I/O v1",
                        "2GB Standard Instance",
                        "4GB Standard Instance",
                        "8GB Standard Instance",
                        "15GB Standard Instance",
                        "30GB Standard Instance"
                    ]
                }
            ]
        },
        "kitchen": {
            "default": "https://github.com/rackspace-orchestration-templates/wordpress-multi",
            "type": "string",
            "description": "URL for the kitchen to use, fetched using git\n",
            "label": "Kitchen"
        },
        "database_server_hostname": {
            "default": "WordPress-Database",
            "label": "Server Name",
            "type": "string",
            "description": "Hostname to use for your WordPress Database Server",
            "constraints": [
                {
                    "length": {
                        "max": 64,
                        "min": 1
                    }
                },
                {
                    "allowed_pattern": "^[a-zA-Z][a-zA-Z0-9-]*$",
                    "description": "Must begin with a letter and contain only alphanumeric characters.\n"
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
                    "description": "Maximum length of 64 characters, may only contain letters, numbers, and\nunderscores.\n"
                }
            ]
        },
        "wp_master_server_hostname": {
            "default": "WordPress-Master",
            "label": "Server Name",
            "type": "string",
            "description": "Hostname to use for your WordPress web-master server.",
            "constraints": [
                {
                    "length": {
                        "max": 64,
                        "min": 1
                    }
                },
                {
                    "allowed_pattern": "^[a-zA-Z][a-zA-Z0-9-]*$",
                    "description": "Must begin with a letter and contain only alphanumeric characters.\n"
                }
            ]
        },
        "wp_web_server_count": {
            "default": 1,
            "label": "Web Server Count",
            "type": "number",
            "description": "Number of web servers to deploy in addition to the web-master",
            "constraints": [
                {
                    "range": {
                        "max": 7,
                        "min": 0
                    },
                    "description": "Must be between 0 and 7 servers."
                }
            ]
        },
        "version": {
            "default": "4.2.2",
            "label": "WordPress Version",
            "type": "string",
            "description": "Version of WordPress to install",
            "constraints": [
                {
                    "allowed_values": [
                        "4.2.2"
                    ]
                }
            ]
        },
        "wp_master_server_flavor": {
            "default": "2 GB General Purpose v1",
            "label": "Master Server Size",
            "type": "string",
            "description": "Cloud Server size to use for the web-master node. The size should be at\nleast one size larger than what you use for the web nodes. This server\nhandles all admin calls and will ensure files are synced across all\nother nodes.\n",
            "constraints": [
                {
                    "description": "Must be a valid Rackspace Cloud Server flavor for the region you have\nselected to deploy into.\n",
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
        }
    },
    "outputs": {
        "private_key": {
            "description": "SSH Private IP",
            "value": {
                "get_attr": [
                    "ssh_key",
                    "private_key"
                ]
            }
        },
        "load_balancer_ip": {
            "description": "Load Balancer IP",
            "value": {
                "get_attr": [
                    "load_balancer",
                    "PublicIp"
                ]
            }
        },
        "mysql_root_password": {
            "description": "MySQL Root Password",
            "value": {
                "get_attr": [
                    "mysql_root_password",
                    "value"
                ]
            }
        },
        "wordpress_user": {
            "description": "WordPress User",
            "value": {
                "get_param": "username"
            }
        },
        "wordpress_web_ips": {
            "description": "Web Server IPs",
            "value": {
                "get_attr": [
                    "wp_web_servers",
                    "accessIPv4"
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
        "database_server_ip": {
            "description": "Database Server IP",
            "value": {
                "get_attr": [
                    "database_server",
                    "accessIPv4"
                ]
            }
        },
        "wordpress_web_master_ip": {
            "description": "Web-Master IP",
            "value": {
                "get_attr": [
                    "wp_master_server",
                    "accessIPv4"
                ]
            }
        }
    },
    "resources": {
        "load_balancer": {
            "depends_on": [
                "wp_master_server_setup",
                "wp_web_servers"
            ],
            "type": "Rackspace::Cloud::LoadBalancer",
            "properties": {
                "protocol": "HTTP",
                "name": {
                    "get_param": "load_balancer_hostname"
                },
                "algorithm": "ROUND_ROBIN",
                "virtualIps": [
                    {
                        "ipVersion": "IPV4",
                        "type": "PUBLIC"
                    }
                ],
                "contentCaching": "ENABLED",
                "healthMonitor": {
                    "attemptsBeforeDeactivation": 2,
                    "delay": 10,
                    "statusRegex": "^[23]0[0-2]$",
                    "timeout": 5,
                    "path": "/",
                    "type": "HTTP"
                },
                "nodes": [
                    {
                        "addresses": [
                            {
                                "get_attr": [
                                    "wp_master_server",
                                    "networks",
                                    "private",
                                    0
                                ]
                            }
                        ],
                        "condition": "ENABLED",
                        "port": 80
                    },
                    {
                        "addresses": {
                            "get_attr": [
                                "wp_web_servers",
                                "privateIPv4"
                            ]
                        },
                        "condition": "ENABLED",
                        "port": 80
                    }
                ],
                "port": 80,
                "metadata": {
                    "rax-heat": {
                        "get_param": "OS::stack_id"
                    }
                }
            }
        },
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
        "database_server": {
            "type": "OS::Nova::Server",
            "properties": {
                "key_name": {
                    "get_resource": "ssh_key"
                },
                "flavor": {
                    "get_param": "database_server_flavor"
                },
                "name": {
                    "get_param": "database_server_hostname"
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
        "wp_master_server": {
            "type": "OS::Nova::Server",
            "properties": {
                "user_data_format": "RAW",
                "name": {
                    "get_param": "wp_master_server_hostname"
                },
                "key_name": {
                    "get_resource": "ssh_key"
                },
                "image": {
                    "get_param": "image"
                },
                "user_data": {
                    "get_attr": [
                        "cloud_monitoring_config",
                        "config"
                    ]
                },
                "flavor": {
                    "get_param": "wp_master_server_flavor"
                },
                "config_drive": true,
                "metadata": {
                    "rax-heat": {
                        "get_param": "OS::stack_id"
                    }
                }
            }
        },
        "mysql_debian_password": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 16,
                "sequence": "lettersdigits"
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
        "master_filesystem_check": {
            "type": "Rackspace::CloudMonitoring::Check",
            "properties": {
                "metadata": {
                    "rax-heat": {
                        "get_param": "OS::stack_id"
                    },
                    "stack-name": {
                        "get_param": "OS::stack_name"
                    }
                },
                "details": {
                    "target": "/"
                },
                "timeout": 10,
                "entity": {
                    "get_resource": "wp_master_server"
                },
                "type": "agent.filesystem",
                "period": 30,
                "label": "master_fs_check"
            }
        },
        "wp_auth": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 32,
                "sequence": "hexdigits"
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
        },
        "cloud_monitoring_config": {
            "type": "OS::Heat::SoftwareConfig",
            "properties": {
                "config": {
                    "str_replace": {
                        "params": {
                            "{{token}}": {
                                "get_resource": "agent_token"
                            }
                        },
                        "template": "#!/bin/bash\nwget http://meta.packages.cloudmonitoring.rackspace.com/ubuntu-12.04-x86_64/rackspace-cloud-monitoring-meta-stable_1.0_all.deb\ndpkg -i rackspace-cloud-monitoring-meta-stable_1.0_all.deb\napt-get update\napt-get install rackspace-monitoring-agent\necho \"monitoring_token {{token}}\" > /etc/rackspace-monitoring-agent.cfg\nservice rackspace-monitoring-agent restart\n"
                    }
                }
            }
        },
        "master_cpu_check": {
            "type": "Rackspace::CloudMonitoring::Check",
            "properties": {
                "metadata": {
                    "rax-heat": {
                        "get_param": "OS::stack_id"
                    },
                    "stack-name": {
                        "get_param": "OS::stack_name"
                    }
                },
                "details": {},
                "timeout": 10,
                "entity": {
                    "get_resource": "wp_master_server"
                },
                "type": "agent.cpu",
                "period": 30,
                "label": "master_cpu_check"
            }
        },
        "wp_master_server_setup": {
            "depends_on": [
                "database_server_setup",
                "wp_web_servers"
            ],
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
                            "host": {
                                "get_attr": [
                                    "database_server",
                                    "networks",
                                    "private",
                                    0
                                ]
                            },
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
                        "recipe[mysql::client]",
                        "recipe[mysql-chef_gem]",
                        "recipe[rax-wordpress::apache-prep]",
                        "recipe[sysctl::attribute_driver]",
                        "recipe[rax-wordpress::x509]",
                        "recipe[php]",
                        "recipe[rax-install-packages]",
                        "recipe[rax-wordpress::wp-database]",
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
                        "recipe[rax-wordpress::varnish-firewall]",
                        "recipe[rax-wordpress::firewall]",
                        "recipe[rax-wordpress::vsftpd-firewall]",
                        "recipe[rax-wordpress::lsyncd]"
                    ],
                    "mysql": {
                        "server_root_password": {
                            "get_attr": [
                                "mysql_root_password",
                                "value"
                            ]
                        },
                        "bind_address": {
                            "get_attr": [
                                "mysql_root_password",
                                "value"
                            ]
                        }
                    },
                    "apache": {
                        "listen_ports": [
                            8080
                        ],
                        "serversignature": "Off",
                        "traceenable": "Off",
                        "timeout": 30
                    },
                    "rax": {
                        "varnish": {
                            "master_backend": "localhost"
                        },
                        "memcache": {
                            "server": {
                                "get_attr": [
                                    "database_server",
                                    "networks",
                                    "private",
                                    0
                                ]
                            }
                        },
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
                            "clients": {
                                "get_attr": [
                                    "wp_web_servers",
                                    "privateIPv4"
                                ]
                            },
                            "ssh": {
                                "private_key": {
                                    "get_attr": [
                                        "sync_key",
                                        "private_key"
                                    ]
                                }
                            }
                        },
                        "apache": {
                            "domain": {
                                "get_param": "domain"
                            }
                        },
                        "packages": [
                            "php5-imagick"
                        ]
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
                        "wp_master_server",
                        "accessIPv4"
                    ]
                },
                "chef_version": {
                    "get_param": "chef_version"
                }
            }
        },
        "wp_web_servers": {
            "depends_on": "database_server",
            "type": "OS::Heat::ResourceGroup",
            "properties": {
                "count": {
                    "get_param": "wp_web_server_count"
                },
                "resource_def": {
                    "type": {
                        "get_param": "child_template"
                    },
                    "properties": {
                        "username": {
                            "get_param": "username"
                        },
                        "domain": {
                            "get_param": "domain"
                        },
                        "wp_web_server_flavor": {
                            "get_param": "wp_web_server_flavor"
                        },
                        "image": {
                            "get_param": "image"
                        },
                        "wp_auth": {
                            "get_attr": [
                                "wp_auth",
                                "value"
                            ]
                        },
                        "memcached_host": {
                            "get_attr": [
                                "database_server",
                                "networks",
                                "private",
                                0
                            ]
                        },
                        "prefix": {
                            "get_param": "prefix"
                        },
                        "ssh_private_key": {
                            "get_attr": [
                                "ssh_key",
                                "private_key"
                            ]
                        },
                        "parent_stack_id": {
                            "get_param": "OS::stack_id"
                        },
                        "lsync_pub": {
                            "get_attr": [
                                "sync_key",
                                "public_key"
                            ]
                        },
                        "kitchen": {
                            "get_param": "kitchen"
                        },
                        "wp_secure_auth": {
                            "get_attr": [
                                "wp_secure_auth",
                                "value"
                            ]
                        },
                        "ssh_keypair_name": {
                            "get_resource": "ssh_key"
                        },
                        "wp_logged_in": {
                            "get_attr": [
                                "wp_logged_in",
                                "value"
                            ]
                        },
                        "database_name": {
                            "get_param": "database_name"
                        },
                        "wp_nonce": {
                            "get_attr": [
                                "wp_nonce",
                                "value"
                            ]
                        },
                        "database_host": {
                            "get_attr": [
                                "database_server",
                                "networks",
                                "private",
                                0
                            ]
                        },
                        "agent_config": {
                            "get_attr": [
                                "cloud_monitoring_config",
                                "config"
                            ]
                        },
                        "wp_web_server_hostname": {
                            "get_param": "wp_web_server_hostnames"
                        },
                        "version": {
                            "get_param": "version"
                        },
                        "ssh_public_key": {
                            "get_attr": [
                                "ssh_key",
                                "public_key"
                            ]
                        },
                        "database_password": {
                            "get_attr": [
                                "database_password",
                                "value"
                            ]
                        },
                        "chef_version": {
                            "get_param": "chef_version"
                        },
                        "varnish_master_backend": {
                            "get_attr": [
                                "wp_master_server",
                                "networks",
                                "private",
                                0
                            ]
                        }
                    }
                }
            }
        },
        "wp_secure_auth": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 32,
                "sequence": "hexdigits"
            }
        },
        "mysql_root_password": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 16,
                "sequence": "lettersdigits"
            }
        },
        "wp_nonce": {
            "type": "OS::Heat::RandomString",
            "properties": {
                "length": 32,
                "sequence": "hexdigits"
            }
        },
        "database_server_firewall": {
            "depends_on": "wp_master_server_setup",
            "type": "OS::Heat::ChefSolo",
            "properties": {
                "username": "root",
                "node": {
                    "rax": {
                        "memcached": {
                            "clients": [
                                {
                                    "get_attr": [
                                        "wp_master_server",
                                        "networks",
                                        "private",
                                        0
                                    ]
                                },
                                {
                                    "get_attr": [
                                        "wp_web_servers",
                                        "privateIPv4"
                                    ]
                                }
                            ]
                        }
                    },
                    "run_list": [
                        "recipe[rax-wordpress::memcached-firewall]"
                    ]
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
                        "database_server",
                        "accessIPv4"
                    ]
                },
                "chef_version": {
                    "get_param": "chef_version"
                }
            }
        },
        "database_server_setup": {
            "depends_on": "database_server",
            "type": "OS::Heat::ChefSolo",
            "properties": {
                "username": "root",
                "node": {
                    "mysql": {
                        "bind_address": {
                            "get_attr": [
                                "database_server",
                                "networks",
                                "private",
                                0
                            ]
                        },
                        "remove_test_database": true,
                        "root_network_acl": [
                            "10.%"
                        ],
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
                    "memcached": {
                        "memory": 500,
                        "listen": {
                            "get_attr": [
                                "database_server",
                                "networks",
                                "private",
                                0
                            ]
                        }
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
                    "run_list": [
                        "recipe[apt]",
                        "recipe[build-essential]",
                        "recipe[rax-firewall]",
                        "recipe[mysql::server]",
                        "recipe[rax-wordpress::memcached-firewall]",
                        "recipe[memcached]",
                        "recipe[rax-wordpress::mysql]",
                        "recipe[rax-wordpress::mysql-firewall]",
                        "recipe[hollandbackup]",
                        "recipe[hollandbackup::mysqldump]",
                        "recipe[hollandbackup::main]",
                        "recipe[hollandbackup::backupsets]",
                        "recipe[hollandbackup::cron]"
                    ],
                    "rax": {
                        "firewall": {
                            "tcp": [
                                22
                            ]
                        },
                        "mysql": {
                            "innodb_buffer_pool_mempercent": 0.6
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
                        "database_server",
                        "accessIPv4"
                    ]
                },
                "chef_version": {
                    "get_param": "chef_version"
                }
            }
        },
        "master_mem_check": {
            "type": "Rackspace::CloudMonitoring::Check",
            "properties": {
                "metadata": {
                    "rax-heat": {
                        "get_param": "OS::stack_id"
                    },
                    "stack-name": {
                        "get_param": "OS::stack_name"
                    }
                },
                "details": {},
                "timeout": 10,
                "entity": {
                    "get_resource": "wp_master_server"
                },
                "type": "agent.memory",
                "period": 30,
                "label": "master_mem_check"
            }
        },
        "agent_token": {
            "type": "Rackspace::CloudMonitoring::AgentToken",
            "properties": {
                "label": {
                    "get_param": "OS::stack_name"
                }
            }
        }
    }
};
