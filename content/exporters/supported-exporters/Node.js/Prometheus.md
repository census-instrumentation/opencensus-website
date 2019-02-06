---
title: "Prometheus (Stats)"
date: 2018-08-29T15:29:53-07:00
draft: false
class: "resized-logo"
aliases: [/guides/exporters/supported-exporters/node.js/prometheus, /guides/exporters/supported-exporters/nodejs/prometheus]
logo: /img/prometheus-logo.png
---

- [Introduction](#introduction)
- [Installing the exporter](#installing-the-exporter)
- [Creating the exporter](#creating-the-exporter)

## Introduction
Prometheus is a monitoring system that collects metrics, by scraping
exposed endpoints at regular intervals, evaluating rule expressions.
It can also trigger alerts if certain conditions are met.

OpenCensus Node.js has support for this exporter available, distributed through NPM package [@opencensus/exporter-prometheus](https://www.npmjs.com/package/@opencensus/exporter-prometheus)

{{% notice tip %}}
For assistance setting up Prometheus, [Click here](/codelabs/prometheus) for a guided codelab.
{{% /notice %}}

## Installing the exporter
You can install OpenCensus Prometheus Exporter by running these steps:

```bash
npm install @opencensus/core
npm install @opencensus/exporter-prometheus
```

## Creating the exporter
Now let's use the Prometheus exporter:

```js
const { Stats } = require('@opencensus/core');
const { PrometheusStatsExporter } = require('@opencensus/exporter-prometheus');

// Add your port and startServer to the Prometheus options
const exporter = new PrometheusStatsExporter({
  port: 9464,
  startServer: false
});

// Our Stats manager
const stats = new Stats();

// Pass the created exporter to Stats
stats.registerExporter(exporter);

// Run the server
exporter.startServer(function callback() {
  // Callback
});
```
