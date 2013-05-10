---
layout: post
category : miscellanous
tagline: "Installing first solution"
tags : [openshift]
---

In order to setup first (of five) application it is needed to create application domain first.

As an example let's install ruby based bugtracking system Redmine in PAAS cloud.

Steps:

1) Create application domain (one time action - further applications reuse this obe)

2) Create application with ruby support

3) Configure mysql for application

4) Go to the application directory redmine (from #2) & clone redmine quick start git repository.

5) Please be patient while missed packs needed by ruby are installed

6) Configure yaml file with openshift mysql access details

7) Configure CNAME alias in DNS to point on openshift cloud server

8) Perform push to openshift git repository.

9) Briefly look through initialization scripts output, fill up initial redmine wizard and we are done - redmine on your own domain in 12 minutes!

<div class='p_embed p_image_embed'>
<img src='/image/2012/02/38120888-ScreenHunter_31_20120211.jpg'>
<img src='/image/2012/02/38120890-ScreenHunter_32_20120211.jpg'>
<img src='/image/2012/02/38120900-ScreenHunter_41_20120211.jpg'>
<img src='/image/2012/02/38120891-ScreenHunter_33_20120211.jpg'>
<img src='/image/2012/02/38120904-ScreenHunter_42_20120211.jpg'>
<img src='/image/2012/02/38120893-ScreenHunter_34_20120211.jpg'>
<img src='/image/2012/02/38120894-ScreenHunter_35_20120211.jpg'>
<img src='/image/2012/02/38120897-ScreenHunter_38_20120211.jpg'>
<img src='/image/2012/02/38120896-ScreenHunter_37_20120211.jpg'>
<img src='/image/2012/02/38120898-ScreenHunter_40_20120211.jpg'>
<img src='/image/2012/02/38120906-ScreenHunter_43_20120211.jpg'>
<img src='/image/2012/02/38120908-ScreenHunter_43_20120220.jpg'>
</div>


