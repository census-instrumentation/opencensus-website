---
title: "Tags"
weight: 10
---


Tags are key-value pairs of data that are associated with collected metrics, to
provide contextual information, distinguish and group metrics during analysis and inspection.

Some examples of tags could include:

* `frontend=ofe`
* `user_agent="ios-10.2.12"`
* `method="push"`
* `value=12`
* `customer_id=44ca62e0-44a3-4c67-9955-33805d551d01`

#### Propagation

Tags can be defined in one service's requests and then serialized on the wire to downstream services
that the request progresses through.

In distributed systems, a single request could touch a wide range of isolated services.
For example a file upload request can invoke the authentication and billing service, the data storage
service, the caching service etc. which might all be isolated and invokable by [Remote Procedure Calls (RPCs)](https://en.wikipedia.org/wiki/Remote_procedure_call)

To maintain contextual information of the specific request, tag propagation through
your distributed system is necessary; the higher levels generate tags that are then
passed down to the invoked lower level services and eventually those are sent to your observability systems.

![Tag propagation](/img/tag-propagation-handdrawn.jpg)

From the above drawing, a request comes in through the frontend server/service,
the tags:

* `customer_id=foo_bar`
* `originator=photoop_svc`

are assigned to that request and propagated as it goes through layers:

* Authentication
* Database
* Cloud storage
* Content Delivery Network(CDN)
etc.

and with those tags, you can uniquely identify and disambiguate which service called
the downstream services, how much quota they've used, what calls are failing etc.
