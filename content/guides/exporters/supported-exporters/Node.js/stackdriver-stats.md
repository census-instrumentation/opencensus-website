---
title: "Stackdriver (Stats)"
date: 2018-07-22T23:47:14-07:00
draft: false
weight: 3
class: "resized-logo"
---

![](/images/logo_gcp_vertical_rgb.png)

{{% notice note %}}
This guide makes use of Stackdriver for visualizing your data. For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

Stackdriver Monitoring provides visibility into the performance, uptime, and overall health of cloud-powered applications. Stackdriver collects metrics, events, and metadata from Google Cloud Platform, Amazon Web Services, hosted uptime probes, application instrumentation, and a variety of common application components including Cassandra, Nginx, Apache Web Server, Elasticsearch, and many others. Stackdriver ingests that data and generates insights via dashboards, charts, and alerts. Stackdriver alerting helps you collaborate by integrating with Slack, PagerDuty, HipChat, Campfire, and more.

OpenCensus Node has support for this exporter available through package:

* [OpenCensus for Node.js](https://github.com/census-instrumentation/opencensus-node/tree/master/packages/opencensus-nodejs)

#### Table of contents
- [Installing the exporters](#installing-the-exporters)
- [Creating the exporters](#creating-the-exporters)
- [Viewing your traces](#viewing-your-traces)

#### Instalign the exporters
Install OpenCensus Stackdriver Exporter with:

{{<highlight bash>}}
npm install @opencensus/core
npm install @opencensus/exporter-stackdriver
{{</highlight>}}

#### Creating the exporters
To create the exporters, you'll need to:

* Have a GCP Project ID
* Have already enabled [Stackdriver Monitoring](https://cloud.google.com/monitoring/docs/quickstart), if not, please visit the [Code lab](/codelabs/stackdriver)
* Enable your [Application Default Credentials](https://cloud.google.com/docs/authentication/getting-started) for authentication with:

{{<highlight bash>}}
export GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credential.json
{{</highlight>}}

* Create the exporters in code

#### Creating the exporter in code
{{<highlight javascript>}}
var opencensus = require('@opencensus/core');
var stackdriver = require('@opencensus/exporter-stackdriver');

// Add your project id to the Stackdriver options
var exporter = new stackdriver.StackdriverStatsExporter({projectId: "your-project-id"});

var stats = new opencensus.Stats();

stats.registerExporter(exporter);
{{</highlight>}}

#### Viewing your traces
Please visit [https://console.cloud.google.com/monitoring](https://console.cloud.google.com/monitoring)
