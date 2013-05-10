---
layout: post
category : hadoop
tagline: "Zoo in your virtual garden - part 1 - Hadoop"
tags : [bigdata, hadoop, howto]
---
So nowadays is new big trend - bigdata. Why not to experiment on them in your virtual PC. Asusually we need windows XP image (those provided by Microsoft as IE6 test - are ok).

Step 1 - install cygwin

Steps are similar to installing openshift environment, but you need in addition following packages:

openssl, diffutils,tcp_wrappers

Note: ssh needs to be installed as service this time:

<div class='p_embed p_image_embed'>
<img src='/image/2012/05/41202903-ScreenHunter_129_20120518.jpg'>
<img src='/image/2012/05/41202492-ScreenHunter_130_20120518.jpg'>
</div>


without privilege separation, recommended service name is ntsec (easier to find in services list).

You have to generate ssh key pair (do not set pass phrase - this key will be used by system). Add the generated key to list of authorized keys, ensure that you are able ssh to local host without any issues.

<div class='p_embed p_image_embed'>
<img src='/image/2012/05/41202591-ScreenHunter_131_20120518.jpg'>
<img src='/image/2012/05/41202663-ScreenHunter_132_20120518.jpg'>
<img src='/image/2012/05/41202715-ScreenHunter_133_20120518.jpg'>
<img src='/image/2012/05/41202772-ScreenHunter_134_20120518.jpg'>
<img src='/image/2012/05/41202808-ScreenHunter_135_20120518.jpg'>
</div>


Step 2: hadoop itself.
a)Navigate to hadoop download mirrors and download the installation,.

b)Put it under /usr/local/

c)tar xvzf it under /local/

d)locate core-site.xml, set fs.default.name to hdfs://127.0.0.1:9100/

e)locate mapred-site.xml set mapred.job.tracker to 127.0.0.1:9101

g)locate hdfs-site.xml set following properties:

<pre><code class="xml">
 <property>

   <name>dfs.replication</name>

   <value>1</value>

  </property>

  <property>

   <name>dfs.permissions</name>

   <value>false</value>

  </property>
</code></pre>


<div class='p_embed p_image_embed'>
<img src='/image/2012/05/41203207-ScreenHunter_136_20120518.jpg'>
<img src='/image/2012/05/41203295-ScreenHunter_137_20120518.jpg'>
<img src='/image/2012/05/41203407-ScreenHunter_138_20120518.jpg'>
<img src='/image/2012/05/41203438-ScreenHunter_139_20120518.jpg'>
<img src='/image/2012/05/41203470-ScreenHunter_140_20120518.jpg'>
<img src='/image/2012/05/41203498-ScreenHunter_141_20120518.jpg'>
<img src='/image/2012/05/41203504-ScreenHunter_142_20120518.jpg'>
<img src='/image/2012/05/41203513-ScreenHunter_143_20120518.jpg'>
<img src='/image/2012/05/41203523-ScreenHunter_144_20120518.jpg'>
<img src='/image/2012/05/41203536-ScreenHunter_145_20120518.jpg'>
<img src='/image/2012/05/41203541-ScreenHunter_146_20120518.jpg'>
<img src='/image/2012/05/41203596-ScreenHunter_147_20120518.jpg'>
</div>

Ups, if you do not have java runtime environment on your box it's time to setup it - you need jre6 as for now (may, 2012)

<div class='p_embed p_image_embed'>
<img src='/image/2012/05/41203694-ScreenHunter_153_20120518.jpg'>
<img src='/image/2012/05/41203691-ScreenHunter_149_20120518.jpg'>
</div>

Step 3 running hadoop:
a) make logs folder under hadoop. Ensure write access for daemon.

b) in hadoop-env.sh specify correct java home directory

c) format drive - hadoop namenode -format. This will happen very quickly.

d) in case if you get strange message about SERVER and jvm.dll  - just copy contents of client directory to server.

e) execute start-mapred.sh


<div class='p_embed p_image_embed'>
<img src='/image/2012/05/41203917-ScreenHunter_154_20120518.jpg'>
<img src='/image/2012/05/41203933-ScreenHunter_157_20120518.jpg'>
<img src='/image/2012/05/41203940-ScreenHunter_158_20120518.jpg'>
<img src='/image/2012/05/41203954-ScreenHunter_159_20120518.jpg'>
<img src='/image/2012/05/41203996-ScreenHunter_161_20120518.jpg'>
<img src='/image/2012/05/41204005-ScreenHunter_162_20120518.jpg'>
<img src='/image/2012/05/41204031-ScreenHunter_163_20120518.jpg'>
<img src='/image/2012/05/41204038-ScreenHunter_164_20120518.jpg'>
</div>



Horray! HADOOP now lives in your virtual garden.

Next post about HBase in the same garden.

