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
- [Running Prometheus](#running-prometheus)
- [Viewing your metrics](#viewing-your-metrics)
- [Project link](#project-link)

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
To create the exporter, we'll need to:

* Import and use the Prometheus exporter package
* Define a namespace that will uniquely identify our metrics when viewed on Prometheus
* Expose a port on which we shall run a `/metrics` endpoint
* With the defined port, we'll need a Promethus configuration file so that Prometheus can scrape from this endpoint

Now let's use the Prometheus exporter:

```js
const { globalStats } = require('@opencensus/core');
const { PrometheusStatsExporter } = require('@opencensus/exporter-prometheus');

// Add your port and startServer to the Prometheus options
const exporter = new PrometheusStatsExporter({
  port: 9464,
  startServer: true
});

// Pass the created exporter to Stats
globalStats.registerExporter(exporter);
```

and then for our corresponding `prometheus.yaml` file:

```yaml
global:
  scrape_interval: 10s

  external_labels:
    monitor: 'demo'

scrape_configs:
  - job_name: 'demo'

    scrape_interval: 10s

    static_configs:
      - targets: ['localhost:8888']
```

## Running Prometheus
And then run Prometheus with your configuration
```shell
prometheus --config.file=prometheus.yaml
```

## Viewing your metrics
Please visit [http://localhost:9090](http://localhost:9090)

## Project link
You can find out more about the Prometheus project at [https://prometheus.io/](https://prometheus.io/)

