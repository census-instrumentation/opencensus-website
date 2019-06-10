---
title: "Azure Monitor"
date: 2019-06-10
draft: false
weight: 3
class: "resized-logo"
aliases: [/guides/exporters/supported-exporters/python/azure-monitor]
logo: /img/partners/microsoft_logo.svg
---

- [Introduction](#introduction)
- [Installing the exporter](#installing-the-exporter)
- [Creating the exporter](#creating-the-exporter)
- [Viewing your traces](#viewing-your-traces)

## Introduction
[Azure Monitor](https://docs.microsoft.com/en-us/azure/azure-monitor/) is an
extensible Application Performance Management (APM) service for web developers
on multiple platforms. Offered by Microsoft Azure, it's a complete at-scale
telemetry and monitoring solution.

## Installing the exporter
The Azure Monitor exporter can be installed from pip by
```shell
pip install opencensus-ext-azure
```

## Creating the exporter
To create the exporters, you'll need to:

* Use an active Azure account, [sign up for free](https://azure.microsoft.com/en-us/free/) if you haven't already.
* Create an Azure Monitor resource and get the instrumentation key, more information can be found
  [here](https://docs.microsoft.com/en-us/azure/azure-monitor/app/create-new-resource).
* Put the instrumentation key in `APPINSIGHTS_INSTRUMENTATIONKEY` environment variable.
* Create the exporters in code.

{{% notice tip %}}
For demo purpose, the example code is using 100% sample rate.
You should specify a reasonable sample rate for production environment.
{{% /notice %}}

{{<highlight python>}}
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.trace.samplers import ProbabilitySampler
from opencensus.trace.tracer import Tracer

tracer = Tracer(exporter=AzureExporter(), sampler=ProbabilitySampler(1.0))

with tracer.span(name='hello'):
    print('Hello, World!')
{{</highlight>}}

For more information, please refer to [README](https://github.com/census-instrumentation/opencensus-python/tree/master/contrib/opencensus-ext-azure).

## Viewing your traces
You can view the traces by using [Search](https://docs.microsoft.com/en-us/azure/azure-monitor/app/diagnostic-search),
[Transaction Diagnostics](https://docs.microsoft.com/en-us/azure/azure-monitor/app/transaction-diagnostics)
or [Application Map](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-map).
