---
title: "Stackdriver (Stats)"
date: 2018-07-22T23:47:14-07:00
draft: false
weight: 3
aliases: [/guides/exporters/supported-exporters/node.js/stackdriver-stats, /guides/exporters/supported-exporters/nodejs/stackdriver-stats]
logo: /images/logo_gcp_vertical_rgb.png
---

- [Introduction](#introduction)
- [Installing the exporter](#installing-the-exporter)
- [Creating the exporters](#creating-the-exporter)
- [Viewing your metrics](#viewing-your-metrics)
- [References](#references)


## Introduction
{{% notice note %}}
This guide makes use of Stackdriver for visualizing your data. For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

Stackdriver Monitoring provides visibility into the performance, uptime, and overall health of cloud-powered applications. Stackdriver collects metrics, events, and metadata from Google Cloud Platform, Amazon Web Services, hosted uptime probes, application instrumentation, and a variety of common application components including Cassandra, Nginx, Apache Web Server, Elasticsearch, and many others. Stackdriver ingests that data and generates insights via dashboards, charts, and alerts. Stackdriver alerting helps you collaborate by integrating with Slack, PagerDuty, HipChat, Campfire, and more.

OpenCensus Node has support for this exporter available through package:

## Installing the exporter
You can install OpenCensus Stackdriver Exporter by running these steps:

{{<highlight bash>}}
npm install @opencensus/core
npm install @opencensus/exporter-stackdriver
{{</highlight>}}

## Creating the exporter
To create the exporter, you'll need to:

* Have a GCP Project ID
* Have already enabled [Stackdriver Monitoring](https://cloud.google.com/monitoring/docs/quickstart), if not, please visit the [Code lab](/codelabs/stackdriver)
* Enable your [Application Default Credentials](https://cloud.google.com/docs/authentication/getting-started) for authentication with:

{{<highlight bash>}}
export GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credential.json
{{</highlight>}}

* Create the exporters in code

{{% notice warning %}}
Stackdriver's minimum stats reporting period must be >= 60 seconds. Find out why at this [official Stackdriver advisory](https://cloud.google.com/monitoring/custom-metrics/creating-metrics#writing-ts)
{{% /notice %}}

{{<highlight javascript>}}
const { globalStats } = require('@opencensus/core');
const { StackdriverStatsExporter } = require('@opencensus/exporter-stackdriver');

// Add your project id to the Stackdriver options
const exporter = new StackdriverStatsExporter({projectId: "your-project-id"});

globalStats.registerExporter(exporter);
{{</highlight>}}

## Viewing your metrics
Please visit [https://console.cloud.google.com/monitoring](https://console.cloud.google.com/monitoring)

## References

Resource|URL
---|---
NPM: @opencensus/exporter-stackdriver|https://www.npmjs.com/package/@opencensus/exporter-stackdriver
NPM: @opencensus/nodejs|https://www.npmjs.com/package/@opencensus/nodejs
Github: OpenCensus for Node.js|https://github.com/census-instrumentation/opencensus-node/tree/master/packages/opencensus-nodejs
