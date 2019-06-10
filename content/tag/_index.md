---
title: "Tags"
weight: 4
aliases: [/core-concepts/tags]
---

- [Tags](#tags)
- [Propagation](#propagation)
- [Makeup of a tag](#makeup-of-a-tag)
- [Tags vs Annotations](#tags-vs-annotations)
- [References](#references)

### Tags

Tags are key-value pairs of data associated with recorded measurements to
provide contextual information, distinguish and group [metrics](/metrics) during analysis and inspection.

When measurements are aggregated to become metrics, tags are used as the labels to breakdown the metrics.

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


### Makeup of a tag
A tag is defined by the following:

{{% children  %}}

### Tags vs Annotations
Tags are key-value used to filter and group metrics while annotations are used to give insight into an event in time for a span.

### References

Resource|URL
---|---
TagContext in OpenCensus specs|[TagContext API](https://github.com/census-instrumentation/opencensus-specs/blob/master/tags/TagMap.md)
Go tag package|https://godoc.org/go.opencensus.io/tag
Java tags package|[Tags API JavaDoc](https://static.javadoc.io/io.opencensus/opencensus-api/0.16.1/io/opencensus/tags/package-frame.html)
Python tags package|[Tags API implementation](https://github.com/census-instrumentation/opencensus-python/tree/master/opencensus/tags)
C++ tags package|[Tags API implementation](https://github.com/census-instrumentation/opencensus-cpp/tree/master/opencensus/tags)
