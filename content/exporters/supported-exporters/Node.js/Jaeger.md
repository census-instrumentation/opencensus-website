---
title: "Jaeger (Tracing)"
date: 2018-08-29T15:29:53-07:00
draft: false
class: "resized-logo"
aliases: [/guides/exporters/supported-exporters/node.js/jaeger]
logo: /img/partners/jaeger_logo.svg
---

- [Introduction](#introduction)
- [Installing the exporter](#installing-the-exporter)
- [Creating the exporter](#creating-the-exporter)

## Introduction
Jaeger, inspired by Dapper and OpenZipkin, is a distributed tracing system released as open source by Uber Technologies.
It is used for monitoring and troubleshooting microservices-based distributed systems, including:

* Distributed context propagation
* Distributed transaction monitoring
* Root cause analysis
* Service dependency analysis
* Performance / latency optimization

OpenCensus Node.js has support for this exporter available, distributed through NPM package [@opencensus/exporter-jaeger](https://www.npmjs.com/package/@opencensus/exporter-jaeger)

{{% notice tip %}}
For assistance setting up Jaeger, [Click here](/codelabs/jaeger) for a guided codelab.
{{% /notice %}}

## Installing the exporter
You can install OpenCensus Jaeger Exporter by running these steps:

```bash
npm install @opencensus/core
npm install @opencensus/nodejs
npm install @opencensus/exporter-jaeger
```

## Creating the exporter
Now let's use the Jaeger exporter:

```js
var core = require('@opencensus/core');
var tracing = require('@opencensus/nodejs');
var jaeger = require('@opencensus/exporter-jaeger');

var jaegerOptions = {
  serviceName: 'opencensus-exporter-jaeger',
  host: 'localhost',
  port: 6832,
  tags: [{key: 'opencensus-exporter-jeager', value: '0.0.1'}],
  bufferTimeout: 10, // time in milliseconds
  logger: core.logger.logger('debug'),
  maxPacketSize: 1000
};

var exporter = new jaeger.JaegerTraceExporter(jaegerOptions);

tracing.registerExporter(exporter).start();
```
