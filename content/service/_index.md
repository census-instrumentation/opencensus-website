---
title: "Service"
weight: 7
logo: /images/opencensus-logo.png
---

- [Introduction](#introduction)
- [References](#references)

### Introduction

The [OpenCensus
Service](https://github.com/census-instrumentation/opencensus-service) is a set of
components that can collect traces and metrics from processes instrumented by
OpenCensus or other monitoring/tracing libraries (Jaeger, Prometheus, etc.), do
aggregation and smart sampling, and export traces and metrics to one or more
monitoring/tracing backends.

Some frameworks and ecosystems provide out-of-the-box instrumentation
by using OpenCensus, but the user is still expected to register an exporter in
order to export data. This is a problem during an incident. Even though our
users can benefit from having more diagnostics data coming out of services
already instrumented with OpenCensus, they have to modify their code to
register an exporter and redeploy. Asking our users recompile and redeploy is
not an ideal at an incident time. In addition, currently users need to decide
which service backend they want to export to, before they distribute their
binary instrumented by OpenCensus.

The OpenCensus Service is trying to eliminate these requirements. With the
OpenCensus Service, users do not need to redeploy or restart their applications
as long as it has the OpenCensus exporter. All they need to do is just
configure and deploy the OpenCensus Service separately. The OpenCensus Service
will then automatically collect traces and metrics and export to any backend of
users' choice.

The OpenCensus Service consists of two components: the [OpenCensus
Agent](/service/components/agent) and the [OpenCensus
Collector](/service/components/collector). For the detailed design specs, please
see
[DESIGN.md](https://github.com/census-instrumentation/opencensus-service/blob/master/DESIGN.md).

### References

Resource|URL
---|---
OpenCensus Agent|[opencensus-protocol](https://github.com/census-instrumentation/opencensus-proto/tree/master/src/opencensus/proto/agent)
OpenCensus Collector Design|[oc-collector design document](https://github.com/census-instrumentation/opencensus-service/blob/master/DESIGN.md#opencensus-collector)
OpenCensus Service Design|[opencensus service design doc](https://github.com/census-instrumentation/opencensus-service/blob/master/DESIGN.md)
