---
title: "Jaeger (Tracing)"
date: 2018-07-22T23:33:31-07:00
draft: false
weight: 3
class: "resized-logo"
---

![](https://www.jaegertracing.io/img/jaeger-logo.png)

{{% notice note %}}
This guide makes use of Jaeger for visualizing your data. For assistance setting up Jaeger, [Click here](/codelabs/jaeger) for a guided codelab.
{{% /notice %}}

Jaeger, inspired by Dapper and OpenZipkin, is a distributed tracing system released as open source by Uber Technologies.
It is used for monitoring and troubleshooting microservices-based distributed systems, including:

* Distributed context propagation
* Distributed transaction monitoring
* Root cause analysis
* Service dependency analysis
* Performance / latency optimization

OpenCensus Python has support for this exporter available through package [opencensus.trace.exporters.jaeger_exporter](https://github.com/census-instrumentation/opencensus-python/blob/master/opencensus/trace/exporters/jaeger_exporter.py)

#### Table of contents
- [Creating the exporter](#creating-the-exporter)
- [Viewing your traces](#viewing-your-traces)
- [Project link](#project-link)

##### Creating the exporter
To create the exporter, we'll need to:

* Create an exporter in code
* Have the Jaeger endpoint available to receive traces

{{<highlight python>}}
#!/usr/bin/env python

from opencensus.trace.exporters.jaeger_exporter import JaegerExporter
from opencensus.trace.tracer import Tracer

def main():
    je = JaegerExporter(service_name="service-b",
                        host_name='localhost',
                        agent_port=6831,
                        endpoint='/api/traces')

    tracer = Tracer(exporter=je)
    with tracer.span(name='doingWork') as span:
        for i in range(10):
            continue

if __name__ == "__main__":
    main()
{{</highlight>}}


#### Viewing your traces
Please visit the Jaeger UI endpoint [http://localhost:6831](http://localhost:6831)

#### Project link
You can find out more about the Jaeger project at [https://www.jaegertracing.io/](https://www.jaegertracing.io/)
