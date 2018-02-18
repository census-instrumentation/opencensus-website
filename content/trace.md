---
title: "Distributed Tracing"
---

A distributed trace tracks the progression of a single user request as it is
handled by the services and processes that make up an application. Each step is
called a _span_ in the trace. Spans include metadata about the step, including
especially the time spent in the step, called the span's _latency_. You can use
this information to tune the performance of your application.

Examples of distributed tracing backends include Zipkin, Jaeger, Datadog APM,
and Stackdriver Trace.
