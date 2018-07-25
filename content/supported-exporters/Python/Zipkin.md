---
title: "Zipkin (Tracing)"
date: 2018-07-22T23:12:15-07:00
draft: false
weight: 3
class: "resized-logo"
---

![](/img/zipkin-logo.jpg)

{{% notice note %}}
This guide makes use of Zipkin for visualizing your data. For assistance setting up Zipkin, [Click here](/codelabs/zipkin) for a guided codelab.
{{% /notice %}}

Zipkin is a distributed tracing system. It helps gather timing data needed to troubleshoot latency problems in microservice architectures.

It manages both the collection and lookup of this data. Zipkin’s design is based on the Google Dapper paper.

OpenCensus Python has support for this exporter available through package [opencensus.trace.exporters.zipkin_exporter](https://census-instrumentation.github.io/opencensus-python/trace/api/zipkin_exporter.html)

#### Table of contents
- [Creating the exporter](#creating-the-exporter)
- [Viewing your traces](#viewing-your-traces)
- [Project link](#project-link)

##### Creating the exporter
To create the exporter, we'll need to:

* Create an exporter in code
* Have the Zipkin endpoint available to receive traces

{{<highlight python>}}
#!/usr/bin/env python

from opencensus.trace.exporters.zipkin_exporter import ZipkinExporter
from opencensus.trace.tracer import Tracer

def main():
    ze = ZipkinExporter(service_name="service-a",
                        host_name='localhost',
                        port=9411,
                        endpoint='/api/v2/spans')

    tracer = Tracer(exporter=ze)
    with tracer.span(name='doingWork') as span:
        for i in range(10):
            continue

if __name__ == "__main__":
    main()
{{</highlight>}}

#### Viewing your traces
Please visit the Zipkin UI endpoint [http://localhost:9411](http://localhost:9411)

#### Project link
You can find out more about the Zipkin project at [https://zipkin.io/](https://zipkin.io/)
