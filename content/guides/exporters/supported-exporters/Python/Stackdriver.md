---
title: "Stackdriver (Tracing)"
date: 2018-07-22T23:47:14-07:00
draft: false
weight: 3
class: "resized-logo"
---

![](/images/logo_gcp_vertical_rgb.png)

{{% notice note %}}
This guide makes use of Stackdriver for visualizing your data. For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

Stackdriver Trace is a distributed tracing system that collects latency data from your applications and displays it in the Google Cloud Platform Console.
You can track how requests propagate through your application and receive detailed near real-time performance insights.
Stackdriver Trace automatically analyzes all of your application's traces to generate in-depth latency reports to surface performance degradations,
and can capture traces from all of your VMs, containers, or Google App Engine projects.

Stackdriver Monitoring provides visibility into the performance, uptime, and overall health of cloud-powered applications.
Stackdriver collects metrics, events, and metadata from Google Cloud Platform, Amazon Web Services, hosted uptime probes, application instrumentation,
and a variety of common application components including Cassandra, Nginx, Apache Web Server, Elasticsearch, and many others.
Stackdriver ingests that data and generates insights via dashboards, charts, and alerts. Stackdriver alerting helps you collaborate by
integrating with Slack, PagerDuty, HipChat, Campfire, and more.

OpenCensus Python has support for this exporter available through package:
* Trace [opencensus.trace.exporters.stackdriver_exporter](https://census-instrumentation.github.io/opencensus-python/trace/api/stackdriver_exporter.html)

#### Table of contents
- [Creating the exporters](#creating-the-exporters)
- [Viewing your traces](#viewing-your-traces)

##### Creating the exporters
To create the exporters, you'll need to:

* Have a GCP Project ID
* Have already enabled Stackdriver Tracing and Metrics, if not, please visit the [Code lab](/codelabs/stackdriver)
* Create the exporters in code

##### Creating the exporter in code
{{<highlight python>}}
#!/usr/bin/env python

import os

from opencensus.trace.tracer import Tracer
from opencensus.trace.exporters import stackdriver_exporter
from opencensus.trace.exporters.transports.background_thread import BackgroundThreadTransport

def main():
    sde = stackdriver_exporter.StackdriverExporter(
                project_id=os.environ.get("GCP_PROJECT_ID"),
                transport=BackgroundThreadTransport)

    tracer = Tracer(exporter=sde)
    with tracer.span(name='doingWork') as span:
        for i in range(10):
            continue

if __name__ == "__main__":
    main()
{{</highlight>}}

#### Viewing your metrics
Please visit [https://console.cloud.google.com/monitoring](https://console.cloud.google.com/monitoring)

#### Viewing your traces
Please visit [https://console.cloud.google.com/traces/traces](https://console.cloud.google.com/traces/traces)
