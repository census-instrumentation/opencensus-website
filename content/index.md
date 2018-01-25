---
date: "2017-10-10T11:27:27-04:00"
type: index
---

<table>
<tr>
<td><img src="/images/opencensus.svg" width="400"></td>
<td>
<h1> What is OpenCensus?</h1>

<p>A single distribution of libraries that automatically collects traces and
metrics from your app, displays them locally, and sends them to any analysis
tool.</p>
</td>
</tr>
</table>

The key features of OpenCensus include:

+   Standard wire protocols and
    consistent APIs for handling trace and metric data.
+   A single set of libraries for many languages, including Java, C++, Go,
    .Net, Python, PHP, Node.js, Erlang, and Ruby.
+   Included integrations with web and RPC frameworks, making traces and
    metrics available out of the box.
+   Included exporters for storage and analysis tools. Right now the list
    includes [Zipkin](http://zipkin.io), [Prometheus](http://prometheus.io),
    [Jaeger](https://jaeger.readthedocs.io/en/latest/),
    [Stackdriver](https://cloud.google.com/stackdriver), and
    [SignalFx](https://signalfx.com).
+   Full open source availability for additional integrations and export options.
+   No additional server or daemon is required to support OpenCensus.
+   In process debugging: an optional agent for displaying request and
    metrics data on instrumented hosts.

OpenCensus is being developed by a group of cloud providers, Application
Performance Management vendors, and open source contributors. The project is
[hosted on GitHub](https://github.com/census-instrumentation) and all work
occurs there.

## Concepts

### Distributed Tracing

A distributed trace tracks the progression of a single user request as it is
handled by the services and processes that make up an application. Each step is
called a _span_ in the trace. Spans include metadata about the step, including
especially the time spent in the step, called the span's _latency_. You can use
this information to tune the performance of your application.

Example: A customer completes an order on the checkout page of an e-commerce
application. The distributed trace for this request typically shows how the
request passes through the front end web service, the user authentication
service, the product database, and so on.

 Examples of distributed tracing systems include Zipkin, Jaeger, Datadog APM,
and Stackdriver Trace.

### Metrics

An application metric records information about some part of your application
system: the number of orders received, the number of failed authentications, the
number of RPC connections received, and so on. You use this information to track
usage trends and to detect anomalies that might indicate a problem.

OpenCensus automatically collects a set of predefined metrics from certain
runtime libraries, and you can easily send your own application and runtime
metrics. Because OpenCensus is linked with your application, it does not send
system-level metrics such as CPU or memory utilization.

 Examples of metrics analysis systems are Prometheus, Nagios, Datadog, and
Stackdriver Monitoring.

# FAQ

## Who is behind OpenCensus?

OpenCensus is being developed by a group of cloud providers, Application
Performance Management vendors, and open source contributors. 

OpenCensus was initiated by Google, and is based on instrumentation systems used
inside of Google. OpenCensus is a complete rewrite of the Google system.

## What languages and integrations does OpenCensus support?

Languages under development:

+   [C++](https://github.com/census-instrumentation/opencensus-cpp)
+   [Erlang](https://github.com/census-instrumentation/opencensus-erlang)
+   [Java (JVM, OpenJDK, Android)](https://github.com/census-instrumentation/opencensus-java)
+   [Go](https://github.com/census-instrumentation/opencensus-go)
+   [Ruby](https://github.com/census-instrumentation/opencensus-ruby)
+   .Net (planned)
+   Node.js (planned)
+   [PHP](https://github.com/census-instrumentation/opencensus-php)
+   [Python](https://github.com/census-instrumentation/opencensus-python)
+   Web JS (planned)

Integrations supported:

+   Spring (planned)
+   gRPC
+   JDBC (planned)
+   net/http
+   Dropwizard (planned)


## What APM tools does OpenCensus support?

This list is not yet available. Check out the individual GitHub repos for details.


## How do I use OpenCensus in my application?

If you are using a supported application framework, follow its instructions
for configuring OpenCensus.

Choose a supported APM tool and follow its configuration instructions for
using OpenCensus.

You can also use the OpenCensus z-Pages to view your
tracing data without an APM tool.

A user's guide will be released as soon as possible.

## What are the z-Pages?

OpenCensus provides a stand-alone application that uses a gRPC channel to
communicate with the OpenCensus code linked into your application. The
application displays configuration parameters and trace information held in
the OpenCensus library.


## How can I contribute to OpenCensus?

+   Help people on the discussion forums.
+   Tell us your success story using OpenCensus.
+   Tell us how we can improve OpenCensus, and help us do it.
+   Contribute to an existing library or create one for a new language.
+   Integrate OpenCensus with a new framework.
+   Integrate OpenCensus with a new APM tool.
