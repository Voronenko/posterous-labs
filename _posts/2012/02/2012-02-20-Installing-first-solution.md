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
