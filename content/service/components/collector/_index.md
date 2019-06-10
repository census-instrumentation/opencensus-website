---
title: "Collector"
weight: 7
logo: /images/opencensus-logo.png
---

- [Introduction](#introduction)
- [Benefits](#benefits)
- [Getting started](#getting-started)
- [References](#references)

### Introduction

The OpenCensus Collector is a component that runs “nearby” (e.g. in the same
VPC, AZ, etc.) a user’s application components and receives trace spans and
metrics emitted by supported [Receivers](/collector/receivers). The received
spans and metrics could be emitted directly by clients in instrumented tasks,
or potentially routed via intermediate proxy sidecar/daemon agents such as the
[OpenCensus Agent](/agent). The collector provides a central egress point for
exporting traces and metrics to one or more tracing and/or metrics backends
while offering buffering and retries as well as advanced aggregation,
filtering, annotation and intelligent sampling capabilities.

![](/images/opencensus-service-deployment-models.png)

By default, the OpenCensus Collector listens on TCP port `55678` and receives
traffic from the [opencensus
protocol](https://github.com/census-instrumentation/opencensus-proto/tree/master/src/opencensus/proto/agent).
It can be configured to listen for a variety of different protocols as defined
in the [Receivers](/collector/receivers) section.

The Collector is written in the [Go programming language](https://golang.org/),
it is cross platform, self-monitored and receives traffic from any application
that supports any of the available [Receivers](/collector/receivers) regardless
of the programming language and deployment.

### Benefits

##### For Tracing/Metrics Providers ...

* <b>Implement one [Exporter](/collector/exporters) and get data from applications in many languages.</b>
Developing exporters only for one language ("Go") dramatically scales
infrastructure development and deployment, as observability backends no longer
have to develop exporters in [every 1 of the 9+ languages that OpenCensus
supports.](/language-support)

* <b>Democratizes deployments</b>
Cloud providers can define the backends/exporters that the Collector sends data to.

##### For Application Developers ...

* <b>Manage a single [Exporter](/collector/exporter).</b>
Your applications no longer have to locally enable each exporter per language.
All applications sends data using [OpenCensus
Exporter](/collector/exporters/opencensus).

* <b>Democratizes deployments</b>
Developers can send the data to the backends of their choice.

* <b>Instrument once, choose and replace the backends at any anytime.</b>
Projects can be instrumented without having to upfront decide what backend their signals will be exported to.
Drivers, servers, frameworks etc can all be instrumented and still be portable across various deployments and clouds. The customer
can at anytime decide which backend they'd like to export to.

* <b>Limit your egress points better controlling what data leaves your environment.</b>
Instead of granting every application or agent external access from your
environment as well as managing TLS certificates and API keys for all of these
endpoints, centrally manage it from the Collectors.

* <b>Ensure your data reaches the backend.</b>
Sending large amount of data over the network requires the ability to handle
sending failures. The Collector features built-in buffering and retry
capabilities per Exporter configured ensuring your data reaches its intended
destination.

* <b>Handle scale and only collect what you care about with Intelligent Sampling.</b>
The Collector features Intelligent (tail-based) Sampling of traces allowing you
to calculate aggregates over all of your data, while only retaining what is
relevant to you.

* <b>Annotation your spans.</b>
Add metadata to your spans at collection time. This makes it easy to enhance
spans with information such as the environment and region.

* <b>Redact tags.</b>
Remove or override tags contained with spans.

### Getting started

To get started with the OpenCensus Collector, please review the following topics:
{{% children %}}

### References

Resource|URL
---|---
OpenCensus Protocol|[opencensus-protocol](https://github.com/census-instrumentation/opencensus-proto/tree/master/src/opencensus/proto/agent)
OpenCensus Collector Design|[oc-collector design document](https://github.com/census-instrumentation/opencensus-service/blob/master/DESIGN.md#opencensus-collector)
OpenCensus Collector Performance|[oc-collector performance](https://github.com/census-instrumentation/opencensus-service/blob/master/PERFORMANCE.md)
OpenCensus Agent Design|[ocagent design doc](https://github.com/census-instrumentation/opencensus-service/blob/master/DESIGN.md#opencensus-agent)
