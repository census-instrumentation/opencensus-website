---
title: "Introduction"
date: 2018-07-16T14:28:03-07:00
draft: false
weight: 1
---

{{<title>}} makes getting critical telemetry out of your services easy and seamless. OpenCensus currently provides libraries for a number of languages that allow you to capture, manipulate, and export metrics and distributed traces to the backend(s) of your choice. OpenCensus works great with all software systems, from client applications, large monoliths, or highly-distributed microservices. OpenCensus started at Google but is now developed by a broad community of service developers, cloud vendors, and community contributors. OpenCensus isn't tied to any particular vendor's backend or analysis system.

In this section we will walk through what OpenCensus is, what problems it solves, and how it can help your project.

{{% children %}}

Or, if you are ready to integrate OpenCensus in to your project, visit the [Quickstart](/quickstart).

# Overview
OpenCensus provides observability for your microservices and monoliths alike by tracing requests as they propagate through services and capturing critical time-series metrics.

The core functionality of OpenCensus is the ability to collect traces and metrics from your app, display them locally, and send them to any analysis tool (also called a 'backend'). However, OpenCensus provides more than just data insight. This page describes some of that functionality and points you to resources for building it into your app.

After instrumenting your code with OpenCensus, you will equip yourself with the ability to optimize the speed of your services, understand exactly how a request travels between your services, gather any useful metrics about your entire architecture, and more.

# Features

#### Context Propagation
In order to correlate activities and requests between services with an initial customer action, context (usually in the form of trace or correlation ID) must be propagated throughout your systems. Performing this automatically can be quite difficult, and a lack of automatic context propagation is often identified as the biggest blocker to an organization adopting distributed tracing. OpenCensus provides automatic context propagation across its supported languages and frameworks, and provides simple APIs for manually propagating or manipulating context.

OpenCensus supports several different context propagation formats, and is the reference implementation of the official W3C HTTP tracing header.

#### Distributed Trace Collection
OpenCensus captures and propagates distributed traces through your system, allowing you to visualize how customer requests flow across services, rapidly perform deep root cause analysis, and better analyze latency across a highly distributed set of services. OpenCensus includes functionality like context propagation and sampling out of the box and can interoperate with a variety of tracing systems. You can learn more about OpenCensus' distributed tracing support [here](/tracing).

#### Time-series Metrics Collection
OpenCensus captures critical time series statistics from your application, including the latency, request count, and request size for each endpoint. Once captured, these individual statistics can be aggregated into metrics with time windows and dimensions of your choosing.

#### APIs
OpenCensus provides APIs for all telemetry types. For example, you can use these to define and capture custom metrics, add additional spans or annotations to traces, define custom trace sampling policy, switch context propagation formats, etc.

#### Integrations
OpenCensus contains an incredible amount of integrations out of the box. These allow traces and metrics to be captured from popular RPC systems, web frameworks, and storage clients.

#### Single Project and Implementation
While OpenCensus is an open source project with an incredibly active community, it also benefits from maintaining a single distribution for each language. This means that contributions are focused, that efforts are not wasted on multiple competing implementations (particularly important for integrations), and that as much functionality is available out of the box as possible.

#### Low Overhead
OpenCensus is used in production at some of the largest companies in the world, and as such it strives to have as small of a performance impact as possible.

#### Backend Support
OpenCensus can upload data to almost any backend with its various exporter implementations. If you're using a backend that isn't supported yet (such as an analysis system built specifically for your organization), you can also implement your own quickly and easily. [Read more](/exporters).

#### Partners & Contributors
{{<card-vendor href="https://google.com" src="/img/partners/google_logo.svg">}}
{{<card-vendor href="https://www.datadoghq.com/" src="/img/partners/datadog_logo.svg">}}
{{<card-vendor href="https://orijtech.com/" src="/img/partners/orijtech_logo.png">}}
{{<card-vendor href="https://signalfx.com/" src="/img/partners/signalFx_logo.svg">}}
{{<card-vendor href="https://www.cesar.org.br/" src="/img/partners/cesar_logo.svg">}}
{{<card-vendor href="http://thecreativefew.com/" src="/img/partners/creative_few_logo.svg">}}
{{<card-vendor href="https://www.microsoft.com/" src="/img/partners/microsoft_logo.svg">}}
{{<card-vendor href="https://www.jaegertracing.io/" src="/img/partners/jaeger_logo.svg">}}
{{<card-vendor href="https://zipkin.io/" src="/img/partners/zipkin_logo.svg">}}
{{<card-vendor href="https://www.solarwinds.com/" src="/img/partners/solarwinds_logo.svg">}}
{{<card-vendor href="https://cloud.google.com/stackdriver/" src="/img/partners/stackdriver_logo.svg">}}
{{<card-vendor href="https://prometheus.io/" src="/img/partners/prometheus_logo.svg">}}
{{<card-vendor href="https://www.instana.com/" src="/img/partners/instana_logo.svg">}}
{{<card-vendor href="https://omnition.io/" src="/img/partners/omnition_logo.svg">}}
{{<card-vendor href="https://www.honeycomb.io/" src="/img/partners/honeycomb_logo.svg">}}
{{<card-vendor href="https://corporate.comcast.com/" src="/img/partners/comcast_logo.jpg">}}
{{<card-vendor href="https://postmates.com/" src="/img/partners/postmates_logo.png">}}
{{<card-vendor href="https://lightstep.com/" src="/img/partners/lightstep-logo.svg">}}
