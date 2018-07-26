---
title: ""
date: 2018-07-19T09:58:45-07:00
draft: false
class: "no-pagination no-top-border-header no-search max-text-width"
---

{{<title-card>}}

##### What is OpenCensus?

{{<title>}} is a vendor-agnostic single distribution of libraries to provide **metrics** collection and **tracing** for your services.

{{<button class="btn-light" icon="true" href="/introduction/overview">}}Overview{{</button>}}

{{<button class="btn-light" icon="true" href="/quickstart">}}Quickstart{{</button>}}

##### Can I use OpenCensus in my project?
Our libraries support Go, Java, C++, Ruby, Erlang, Python, and PHP.

Supported backends include Datadog, Instana, Jaeger, SignalFX, Stackdriver, and Zipkin. You can also [add support for other backends](/).

{{<button class="btn-light" icon="true" href="/introduction/language-support">}}Language Support{{</button>}}

{{<button class="btn-light" icon="true" href="/supported-exporters">}}Supported Backends{{</button>}}

##### Who is behind it?
OpenCensus originates from Google, where a set of libraries called Census were used to automatically capture traces and metrics from services. Since going open source, the project is now composed of a group of cloud providers, application performance management vendors, and open source contributors. The project is hosted on GitHub and all work occurs there.

{{<button class="btn-light" icon="true" href="https://github.com/census-instrumentation/">}}Github{{</button>}}

{{<button class="btn-light" icon="true" href="/community">}}Community{{</button>}}

##### What are *Metrics* and *Tracing*?

[**Metrics**](/core-concepts/metrics) are any quantifiable piece of data that you would like to track, such as latency in a service or database, request content length, or number of open file descriptors. Viewing graphs of your metrics can help you understand and gauge the performance and overall quality of your application and set of services.

[**Traces**](/core-concepts/tracing) show you how a request propagates throughout your application or set of services. Viewing graphs of your traces can help you understand the bottlenecks in your architecture by visualizing how data flows between all of your services.

##### Partners & Contributors

{{<partners>}}
