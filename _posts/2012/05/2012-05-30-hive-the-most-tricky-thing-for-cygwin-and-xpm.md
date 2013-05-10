---
layout: post
category : hadoop
tagline: "Hive - the most tricky thing for cygwin and XPMode"
tags : [bigdata, cygwin, hive]
---
Oficially Hive is not supported under cygwin.

Starts as usually -

a)goto hive downloads site.

b)download hive binary

c) untar

d)point to hadoop install path

e)hive-site.xml is the settings file where you can override hive-default settings

g) prepare filesystem for hive on hadoop

h) configure metadata storage for hive. I think mysql is better for this purpose.

i) some services, like hiveserver will be even in runnable state

j) on first hive start mysql database specified in settings will be automatically initialized with schema

IMPORTANT: choose latin1 charset and latin1_general_ci collation - not UTF one

k) those mysterious 'relative path found in'

https://issues.apache.org/jira/browse/HIVE-2388

Official version - won't fix, use unix

well, it is dirty dirty workaround - use it only if your hive is for experiments only and on virtual xpmode

set java.io.tmpdir to "" - at least you will be able to play.

m) Testing creating table and it's presense in hadoop - YEAH!



As usually screencast

<div class='p_embed p_image_embed'>
<img src='/image/2012/05/41631364-ScreenHunter_202_20120524.jpg'>
<img src='/image/2012/05/41631390-ScreenHunter_203_20120524.jpg'>
<img src='/image/2012/05/41631415-ScreenHunter_204_20120524.jpg'>
<img src='/image/2012/05/41631425-ScreenHunter_205_20120524.jpg'>
<img src='/image/2012/05/41631429-ScreenHunter_206_20120524.jpg'>
<img src='/image/2012/05/41631441-ScreenHunter_207_20120524.jpg'>
<img src='/image/2012/05/41631448-ScreenHunter_207_20120525.jpg'>
<img src='/image/2012/05/41631454-ScreenHunter_207_20120524.jpg'>
<img src='/image/2012/05/41631497-ScreenHunter_208_20120525.jpg'>
<img src='/image/2012/05/41631519-ScreenHunter_208_20120529.jpg'>
<img src='/image/2012/05/41631549-ScreenHunter_208_20120530.jpg'>
<img src='/image/2012/05/41631577-ScreenHunter_209_20120530.jpg'>
<img src='/image/2012/05/41631593-ScreenHunter_210_20120530.jpg'>
<img src='/image/2012/05/41631617-ScreenHunter_211_20120530.jpg'>
<img src='/image/2012/05/41631639-ScreenHunter_212_20120530.jpg'>
<img src='/image/2012/05/41631658-ScreenHunter_213_20120530.jpg'>
<img src='/image/2012/05/41631679-ScreenHunter_215_20120530.jpg'>
<img src='/image/2012/05/41631694-ScreenHunter_216_20120530.jpg'>
</div>