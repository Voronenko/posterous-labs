---
layout: post
category : hadoop
tagline: "Zoo in virtual garden - how to take care of your hadoop"
tags : [bigdata, hadoop]
---
1) Hadoop -wake up !

bin/start-dfs.sh

bin/start-mapred.sh

or, shorter, bin/start-all.sh

2) Hadoop - go to bed!

bin/stop-all.sh

3) Hadoop - what have you eaten? (show filesystem)

ls

hadoop fs -ls /

hadoop fs -ls /user/

mkdir

hadoop fs mkdir hello

Subset of filesystem commands is supported, very similar to busybox embedded linux. Please do not forget, that hadoop filesystem is append only

4) Pipelining

you can pipeline output of hadoop commands to our native commandline tools

$ bin/hadoop fs -ls /user/XPMUser | grep hello

5) Putting and getting files to hadoop

On cygwin there is some issue with path naming, but on unix node it should accept normal path

$ bin/hadoop fs -put C:/cygwin/usr/local/population.csv  /population.csv

6) Finally, as we will be playing with hbase, let's check how many bytes files consume on volume



7) You tired of command line?  - There is nice web statistics on

http://nodename:50070/

Further reading:

http://hadoop.apache.org/common/docs/r0.17.2/hdfs_user_guide.html

<div class='p_embed p_image_embed'>
<img src='/image/2012/05/41222519-ScreenHunter_186_20120519.jpg'>
<img src='/image/2012/05/41222521-ScreenHunter_187_20120519.jpg'>
<img src='/image/2012/05/41222527-ScreenHunter_188_20120519.jpg'>
<img src='/image/2012/05/41222543-ScreenHunter_189_20120519.jpg'>
<img src='/image/2012/05/41222549-ScreenHunter_190_20120519.jpg'>
<img src='/image/2012/05/41222553-ScreenHunter_191_20120519.jpg'>
<img src='/image/2012/05/41222557-ScreenHunter_192_20120519.jpg'>
<img src='/image/2012/05/41222562-ScreenHunter_193_20120519.jpg'>
<img src='/image/2012/05/41222567-ScreenHunter_194_20120519.jpg'>
<img src='/image/2012/05/41222574-ScreenHunter_195_20120519.jpg'>
</div>








