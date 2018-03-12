---
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

OpenCensus is a vendor-agnostic framework for stats collection and distributed tracing.

In microservices architectures, it is difficult to understand how services use
resources across shared infrastructure. In monolithic systems, we depend on
traditional tools that report per-process resource usage and latency characteristics
that are only limited to a single process. In order to be able to collect and analyze
resource utilization and performance characteristics of distributed systems,
OpenCensus associates resource utilization with events occur in the chain of
requests until a user request is responded.

Data collected by OpenCensus can be used for:

* Monitoring and alerting of resource usage.
* Analyzing performance and efficiency characteristics of systems to reduce the
  overall resource consumption of resources and improve performance.
* Analyzing the collected data for capacity planning. Being able to
  predict the overall impact of a product on the infrastructure and
 being able to estimate how much more resources are required if a product grows.
* Being able to debug problems in isolation even in complex systems.
* Making real-time scheduling decisions based on diagnostics data.


Other key features of OpenCensus include:

* Highly performant low-overhead collection.
* Standard wire protocols and consistent APIs for handling
  trace and metric data.
* A single set of libraries for many languages, including
  Java, C++, Go, .Net, Python, PHP, Node.js, Erlang, and Ruby.
* Integrations with web and RPC frameworks, making traces and metrics
  available out of the box. Full extendability in implementing
  additional integrations.
* Eporters for storage and analysis tools. Right now the list
  includes [Zipkin](http://zipkin.io), [Prometheus](http://prometheus.io),
  [Jaeger](https://jaeger.readthedocs.io/en/latest/),
  [Stackdriver](https://cloud.google.com/stackdriver), and
  [SignalFx](https://signalfx.com).
  Full extendability in implementing additional integrations.
* In process debugging: an optional agent for displaying request
  and metrics data on instrumented hosts.

No additional server or daemon is required to support OpenCensus.

## Contributing

The project is [hosted on GitHub](https://github.com/census-instrumentation) and
all work occurs there.



## Google Summer of Code

Interested in contributing to OpenCensus? See the
[2018 OpenCensus Google Summer of Code Ideas List](https://storage.googleapis.com/summer-of-code/OpenCensusIdeasList.pdf).
