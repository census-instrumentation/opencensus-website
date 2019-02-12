---
title: "Stackdriver (Tracing)"
date: 2018-07-22T23:47:14-07:00
draft: false
weight: 3
aliases: [/guides/exporters/supported-exporters/node.js/stackdriver-trace, /guides/exporters/supported-exporters/nodejs/stackdriver-trace]
logo: /images/logo_gcp_vertical_rgb.png
---

- [Introduction](#introduction)
- [Installing the exporter](#installing-the-exporter)
- [Creating the exporter](#creating-the-exporter)
- [Viewing your traces](#viewing-your-traces)
- [References](#references)

## Introduction
Stackdriver Trace is a distributed tracing system that collects latency data from your applications and displays it in the Google Cloud Platform Console.

You can track how requests propagate through your application and receive detailed near real-time performance insights.
Stackdriver Trace automatically analyzes all of your application's traces to generate in-depth latency reports to surface performance degradations,
and can capture traces from all of your VMs, containers, or Google App Engine projects.

OpenCensus Node.js has support for this exporter available, distributed through NPM package [@opencensus/exporter-stackdriver](https://www.npmjs.com/package/@opencensus/exporter-stackdriver)

{{% notice tip %}}
For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

## Installing the exporter
Install OpenCensus Stackdriver Exporter with:

{{<highlight bash>}}
npm install @opencensus/nodejs
npm install @opencensus/exporter-stackdriver
{{</highlight>}}

## Creating the exporter
To create the exporter, you'll need to:

* Have a GCP Project ID
* Have already enabled [Stackdriver Tracing](https://cloud.google.com/trace/docs/quickstart), if not, please visit the [Code lab](/codelabs/stackdriver)
* Enable your [Application Default Credentials](https://cloud.google.com/docs/authentication/getting-started) for authentication with:

{{<highlight bash>}}
export GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credential.json
{{</highlight>}}

To create the exporter, in code:

{{<highlight javascript>}}
const tracing = require('@opencensus/nodejs');
const { StackdriverTraceExporter } = require('@opencensus/exporter-stackdriver');

// Add your project id to the Stackdriver options
const exporter = new StackdriverTraceExporter({projectId: "your-project-id"});

tracing.registerExporter(exporter).start();
{{</highlight>}}

## Viewing your traces
Please visit [https://console.cloud.google.com/traces/traces](https://console.cloud.google.com/traces/traces)

## References

Resource|URL
---|---
NPM: @opencensus/exporter-stackdriver|https://www.npmjs.com/package/@opencensus/exporter-stackdriver
NPM: @opencensus/nodejs|https://www.npmjs.com/package/@opencensus/nodejs
Github: OpenCensus for Node.js|https://github.com/census-instrumentation/opencensus-node/tree/master/packages/opencensus-nodejs
