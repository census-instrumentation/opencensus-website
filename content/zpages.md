+++
title = "Z-Pages"
type = "leftnav"
+++

OpenCensus provides in-process web pages that displays
collected data from the process. These pages are called z-pages
and they are useful to see collected data from a specific process
without having to depend on any metric collection or
distributed tracing backend.

Z-Pages can be useful during the development time or when
the process to be inspected is known in production.
Z-Pages can also be used to debug [exporter](/exporters) issues.

In order to serve Z-pages, register their handlers and
start a web server. Below, there is an example how to
serve these pages from `127.0.0.1:7777/debug`.


{{% snippets %}}
{{% go %}}
```
import "go.opencensus.io/zpages"

zpages.Handle(nil, "/debug")
log.Fatal(http.ListenAndServe("127.0.0.1:7777", nil))
```
{{% /go %}}
{{% java %}}
```
// Add the dependencies by following the instructions at
// https://github.com/census-instrumentation/opencensus-java/tree/master/contrib/zpages

ZPageHandlers.startHttpServerAndRegisterAll(7777);
```
{{% /java %}}
{{% /snippets %}}

Once handler is registered, there are various pages provided
from the libraries:

* [127.0.0.1:7777/debug/rpcz](http://127.0.0.1:7777/debug/rpcz)
* [127.0.0.1:7777/debug/tracez](http://127.0.0.1:7777/debug/tracez)

## /rpcz

Rpcz page is available at [/rpcz](http://127.0.0.1:7777/debug/rpcz).
This page serves stats about sent and received RPCs.

Available stats:

* Number of RPCs made per minute, hour and in total.
* Average latency in the last minute, hour and since the process started.
* RPCs per second in the last minute, hour and since the process started.
* Input payload in KB/s in the last minute, hour and since the process started.
* Output payload in KB/s in the last minute, hour and since the process started.
* Number of RPC errors in the last minute, hour and in total.

## /tracez

Tracez page is available at [/tracez](http://127.0.0.1:7777/debug/tracez).
This page serves details about the trace spans collected in the process.
It provides several sample spans per latency bucket and sample errored spans.

An example screenshot from this page is below:

![/tracez](/img/traceZ.png)
