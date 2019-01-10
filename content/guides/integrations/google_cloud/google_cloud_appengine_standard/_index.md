---
title: "Google Cloud AppEngine"
date: 2018-07-24T14:20:00-07:00
draft: false
weight: 3
class: "resized-logo"
aliases: [/integrations/google_cloud_appengine, /guides/integrations/google_cloud_appengine]
logo: /images/google_cloud_appengine.png
---

OpenCensus is not currently supported in the AppEngine Standard framework (but
it is compatible with AppEngine Flex).

In AppEngine Standard, user code is executed in a sandboxed container that
limits communication to specialized interfaces provided by the framework, which
means that e.g. gRPC and the standard Google Cloud client libraries cannot be
used directly.

AppEngine Standard is evolving and to provide better support for external
communication that will enable the use of the standard libraries. As that work
progresses, we will re-evaluate OpenCensus support for the framework.



