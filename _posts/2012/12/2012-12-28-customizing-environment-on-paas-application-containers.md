---
layout: post
category : tips
tagline: "Customizing environment on PAAS application containers"
tags : [amazon, beanstalk, openshift, php]
---

#Introduction
PAAS platforms increased popularity causes wider use of this approach in new projects. Last two major players on PAAS market are PAAS from Redhat called Openshift and PAAS from the Amazon Amazon Elastic Beanstalk. Both PAASes are backed up by Amazon Cloud infrastructure, and support LAMP stack solutions which make them good platform for large variety of the php projects.

#Background
In a typical dedicated server web development, we usually install set of software (extensions, etc) and perform number of changes in config files. Usually this set of changes is required by framework used In PAAS environment we are limited according to rules of PAASm thus I would like to share two quick tips on instances configuration

#AWS Elastic Beanstalk
In November, 2012 it was announced, that AWS Elastic Beantalk can now  be customized using YAML configuration files. Set of tasks include, but not limited to - downloading and installing packages, create files, users, groups, etc. In other words, there is no need in creating customized AMI any more - you are taking up-to-date OS clean image  and instruct how it should be configured for need of your application.

 In order to use this feature, you need to create a directory called .ebextensions  in the your deployment directory and place one or more config files in it.

 Example: let's create httpd.config file:
<pre><code class="yaml">

files:
  "/etc/httpd/conf.d/YOURENVIRONMENT.conf":
    mode: "000644"
    owner: root
    group: root
    encoding: plain
    content: |
      <Directory "/var/www/html/site">
          Options FollowSymLinks
          AllowOverride None
          DirectoryIndex index.php
          Order allow,deny
          Allow from all
        RewriteEngine on
        RewriteRule ^/xxx/(.*)$ - [L]
        RewriteCond %{REQUEST_URI} !^/xxx/.*
        RewriteRule ^(.*)$ index.php [L]
      </Directory>
      DocumentRoot "/var/www/html/site"
container_commands:
  cfg_001_create_runtime_folder:
    command: "mkdir --mode:477 protected/runtime"
    ignoreErrors: true

</code></pre>

 in a result we have configured our environment to be ready for Yii environment - my amending httpd.conf with set of rewrite rules, and creating writeable runtime folder required by framework.

 Let me provide link for further reading - it covers more possible options and configuration parameters:

http://docs.amazonwebservices.com/elasticbeanstalk/latest/dg/customize-containers-ec2.html

Forget about customized AMI  unless it is specifically needed.

#Redhat Openshift

Redhat Openshift  PAAS also provide possibility to customize environment in a manner similar to Amazon Beanstalk.  In each application you have a configuration folder called .openshift. Please note, that in subfolder called action_hooks you have ability to amend shell script that will execute upon specific action:

build
deploy
post_deploy
post_start_php-5.3
post_stop_php-5.3
pre_build
pre_start_php-5.3
pre_stop_php-5.3
For example, if we were installed Magento shop, we would need to configure directories for assets in deploy script

<pre><code class="bash>

#!/bin/bash
# This deploy hook gets executed after dependencies are resolved and the
# build hook has been run but before the application has been started back
# up again.  This script gets executed directly, so it could be python, php,
# ruby, etc.

set -e

if [ ! -d $OPENSHIFT_DATA_DIR/magento ]; then
    mkdir $OPENSHIFT_DATA_DIR/magento
fi

if [ ! -d $OPENSHIFT_DATA_DIR/magento/var ]; then
    mkdir $OPENSHIFT_DATA_DIR/magento/var
fi
ln -sf $OPENSHIFT_DATA_DIR/magento/var $OPENSHIFT_REPO_DIR/php/var
if [ ! -d $OPENSHIFT_DATA_DIR/magento/app ]; then
    mkdir $OPENSHIFT_DATA_DIR/magento/app
fi
if [ ! -d $OPENSHIFT_DATA_DIR/magento/app/etc ]; then
    mkdir $OPENSHIFT_DATA_DIR/magento/app/etc
fi
ln -sf $OPENSHIFT_DATA_DIR/magento/app/etc $OPENSHIFT_REPO_DIR/php/app/etc
if [ ! -d $OPENSHIFT_DATA_DIR/magento/media ]; then
    mkdir $OPENSHIFT_DATA_DIR//magento/media
fi
ln -sf $OPENSHIFT_DATA_DIR/magento/media $OPENSHIFT_REPO_DIR/php/media
 or if we were deploying YII framework based application, deploy script might look like this:
</code></pre>


<pre><code class="bash>
#!/bin/bash
# This deploy hook gets executed after dependencies are resolved and the
# build hook has been run but before the application has been started back
# up again.  This script gets executed directly, so it could be python, php,
# ruby, etc.
set -e

if [ ! -d $OPENSHIFT_DATA_DIR/uploads ]; then
    mkdir $OPENSHIFT_DATA_DIR/uploads
fi
ln -sf $OPENSHIFT_DATA_DIR/uploads $OPENSHIFT_REPO_DIR/php/uploads
if [ ! -d $OPENSHIFT_DATA_DIR/assets ]; then
    mkdir $OPENSHIFT_DATA_DIR/assets
fi
chmod 777 $OPENSHIFT_DATA_DIR/assets
ln -sf $OPENSHIFT_DATA_DIR/assets $OPENSHIFT_REPO_DIR/php/assets

if [ ! -d $OPENSHIFT_DATA_DIR/runtime ]; then
    mkdir $OPENSHIFT_DATA_DIR/runtime
fi
if [ ! -d $OPENSHIFT_DATA_DIR/runtime/temp ]; then
    mkdir $OPENSHIFT_DATA_DIR/runtime/temp
fi
chmod 777 $OPENSHIFT_DATA_DIR/runtime
chmod 777 $OPENSHIFT_DATA_DIR/runtime/temp
ln -sf $OPENSHIFT_DATA_DIR/runtime $OPENSHIFT_REPO_DIR/php/protected/runtime
</code></pre>

 More advanced use of hooks also allows installation of the custom modules, packages and further amending of the application environment

More information can be found under link below

https://openshift.redhat.com/community/developers/deploying-and-building-applications

#Points of Interest
Cloud computing is the popular trend this year. More and more startups choose PAASes as a platform for their solutions. This article provides brief advise for beginners how to use two popular PAAS platforms in more efficient way.