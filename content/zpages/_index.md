---
title: "zPages"
weight: 6
aliases: [/core-concepts/zpages]
---

- [zPages](#zpages)
- [Tracez](#tracez)
- [Rpcz](#rpcz)
- [Language implementations](#language-implementations)

### zPages

OpenCensus provides in-process web pages that display
collected data from the process that they are attached to.
These are called "zPages".  They are useful to for in-process diagnostics
without having to depend on any backend to examine traces or metrics.

zPages can be useful during the development time or when
the process to be inspected is known in production.

### Tracez
The Tracez route is available to examine and bucketize spans by latency buckets for example

```yaml
(0us, 10us, 100us, 1ms, 10ms, 100ms, 1s, 10s, 1m]
```

They also allow you to quickly examine error samples

### Rpcz
The Rpcz route is available to help examine statistics of remote procedure calls (RPCs) that
are are instrumented with OpenCensus. For example when using [gRPC](/grpc)

### Language implementations
zPages are supported for the following languages:
{{% children %}}
