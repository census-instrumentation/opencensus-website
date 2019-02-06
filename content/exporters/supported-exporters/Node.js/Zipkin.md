---
title: "Zipkin (Tracing)"
date: 2018-08-29T15:29:53-07:00
draft: false
class: "resized-logo"
aliases: [/guides/exporters/supported-exporters/node.js/zipkin, /guides/exporters/supported-exporters/nodejs/zipkin]
logo: /img/zipkin-logo.jpg
---

- [Introduction](#introduction)
- [Installing the exporter](#installing-the-exporter)
- [Creating the exporter](#creating-the-exporter)

## Introduction
Zipkin is a distributed tracing system. It helps gather timing data needed to troubleshoot latency problems in microservice architectures.

It manages both the collection and lookup of this data. Zipkin’s design is based on the Google Dapper paper.

OpenCensus Node.js has support for this exporter available, distributed through NPM package [@opencensus/exporter-zipkin](https://www.npmjs.com/package/@opencensus/exporter-zipkin)

{{% notice tip %}}
For assistance setting up Zipkin, [Click here](/codelabs/zipkin) for a guided codelab.
{{% /notice %}}

## Installing the exporter
You can install OpenCensus Zipkin Exporter by running these steps:

```bash
npm install @opencensus/nodejs
npm install @opencensus/exporter-zipkin
```

## Creating the exporter
Now let's use the Zipkin exporter:

```js
var tracing = require('@opencensus/nodejs');
var zipkin = require('@opencensus/exporter-zipkin');

// Add your zipkin url (ex http://localhost:9411/api/v2/spans)
// and application name to the Zipkin options
var options = {
  url: 'your-zipkin-url',
  serviceName: 'your-application-name'
};

var exporter = new zipkin.ZipkinTraceExporter(options);
tracing.registerExporter(exporter).start();
```
