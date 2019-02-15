---
title: "Instana (Tracing)"
date: 2018-08-29T15:29:53-07:00
draft: false
class: "resized-logo"
aliases: [/guides/exporters/supported-exporters/node.js/instana, /guides/exporters/supported-exporters/nodejs/instana]
logo: /images/instana.png
---

- [Introduction](#introduction)
- [Installing the exporter](#installing-the-exporter)
- [Creating the exporter](#creating-the-exporter)

## Introduction
Instanta provides AI Powered Application and Infrastructure Monitoring, allowing you to
deliver Faster With Confidence, and automatic Analysis and Optimization.

OpenCensus Node.js has support for this exporter available, distributed through NPM package [@opencensus/exporter-instana](https://www.npmjs.com/package/@opencensus/exporter-instana)

More information can be found at the [Instana website](https://www.instana.com/)

## Installing the exporter
You can install OpenCensus Instana Exporter by running these steps:

```bash
npm install @opencensus/nodejs
npm install @opencensus/exporter-instana
```

To use Instana as your exporter, first ensure that you have an [Instana agent running on your system](https://docs.instana.io/quick_start/getting_started/) and reporting to your environment. The Instana OpenCensus exporter directly communicates with the Instana agent in order to transmit data to Instana.

## Creating the exporter
Now let's use the Instana exporter:

```js
const tracing = require('@opencensus/nodejs');
const { InstanaTraceExporter }= require('@opencensus/exporter-instana');

const exporter = new InstanaTraceExporter();
tracing.registerExporter(exporter).start();
```
