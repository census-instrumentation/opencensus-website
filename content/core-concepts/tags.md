---
title: "Tags"
weight: 10
---


Tags are key-value pairs of data that are associated with collected metrics to
provide contextual information, distinguish and group metrics during analysis and inspection.

Some examples of tags are:

* `frontend=mobile`
* `method="push"`
* `originator=photo_svc`

#### Propagation

Tags can be defined in one service, then can be serialized into request
headers and propagated as a part of a request to downstream services.

In distributed systems, a single request can touch a wide range of services.
For example a file upload request can invoke the authentication, billing, data storage,
and caching services.

To maintain contextual information of the specific request, tag propagation through
your distributed system is necessary; the higher levels generate tags that are then
passed down to the lower-level services. Data is collected with the tags and are
sent to your observability systems.

![Tag propagation](/img/tag-propagation.png)

Above, a request comes in to the Web server. Web server tags all the
outgoing requests with the following tags.

* `originator=photo-app`
* `frontend=web`

These values are propagated all the way down to database and the CDN.

With these tags, you can uniquely identify and break down which service called
the downstream services, how much quota they've been used, what calls are failing
and more.
