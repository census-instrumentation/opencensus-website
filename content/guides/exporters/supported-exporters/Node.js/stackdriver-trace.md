---
title: "Stackdriver (Trace)"
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

OpenCensus Node has support for this exporter available through package:

* [OpenCensus for Node.js](https://github.com/census-instrumentation/opencensus-node/tree/master/packages/opencensus-nodejs)

#### Table of contents
- [Installing the exporters](#installing-the-exporters)
- [Creating the exporters](#creating-the-exporters)
- [Viewing your traces](#viewing-your-traces)

#### Instalign the exporters
Install OpenCensus Stackdriver Exporter with:

{{<highlight bash>}}
npm install @opencensus/nodejs
npm install @opencensus/exporter-stackdriver
{{</highlight>}}

#### Creating the exporters
To create the exporters, you'll need to:

* Have a GCP Project ID
* Have already enabled [Stackdriver Tracing](https://cloud.google.com/trace/docs/quickstart), if not, please visit the [Code lab](/codelabs/stackdriver)
* Enable your [Application Default Credentials](https://cloud.google.com/docs/authentication/getting-started) for authentication with:

{{<highlight bash>}}
export GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credential.json
{{</highlight>}}

* Create the exporters in code

#### Creating the exporter in code
{{<highlight javascript>}}
var tracing = require('@opencensus/nodejs');
var stackdriver = require('@opencensus/exporter-stackdriver');

// Add your project id to the Stackdriver options
var exporter = new stackdriver.StackdriverTraceExporter({projectId: "your-project-id"});

tracing.registerExporter(exporter).start();
{{</highlight>}}

#### Viewing your traces
Please visit [https://console.cloud.google.com/traces/traces](https://console.cloud.google.com/traces/traces)
