---
title: "Azure Monitor"
date: 2018-10-22
draft: false
weight: 3
class: "resized-logo"
aliases: [/supported-exporters/python/applicationinsights, /guides/exporters/supported-exporters/python/applicationinsights]
logo: /img/partners/microsoft_logo.svg
---

- [Introduction](#introduction)
- [Creating the exporter](#creating-the-exporter)
- [Viewing your traces](#viewing-your-traces)

## Introduction
Azure Monitor is an extensible Application Performance Management (APM) service for web developers on multiple platforms. Offered by Microsoft Azure, it's a complete at-scale telemetry and monitoring solution.

If you don't have an Azure account yet, [click here](https://docs.microsoft.com/azure/application-insights/app-insights-overview) to start.

## Creating the exporter
Azure Monitor does not need a dedicated exporter to work with OpenCensus. Instead, it uses the readily available default exporter along with a dedicated agent known as Local Forwarder. 

To learn about Local Forwarder and how to set it up, visit [this link](https://docs.microsoft.com/azure/application-insights/opencensus-local-forwarder).

Here's an example of setting things up on the OpenCensus side (see [Local Forwarder repo](https://github.com/Microsoft/ApplicationInsights-LocalForwarder/blob/master/examples/opencensus/python-app/app/views.py) for the most up-to-date example):

{{<highlight python>}}
import os
import time

from django.http import HttpResponse
from django.shortcuts import render
import requests

from opencensus.common.async.transports.async_ import AsyncTransport
from opencensus.trace import config_integration
from opencensus.trace.tracer import Tracer
from opencensus.ext.ocagent.trace_exporter import TraceExporter
from opencensus.trace.propagation.trace_context_http_header_format import TraceContextPropagator

INTEGRATIONS = ["httplib"]

service_name = os.getenv("SERVICE_NAME", "python-service")
config_integration.trace_integrations(
    INTEGRATIONS,
    tracer=Tracer(
        exporter=TraceExporter(
            service_name=service_name,
            endpoint=os.getenv("OCAGENT_TRACE_EXPORTER_ENDPOINT"),
            transport=AsyncTransport),
        propagator=TraceContextPropagator()))

def call(request):
    requests.get("http://go-app:50030/call")
    return HttpResponse("hello world from " + service_name)
{{</highlight>}}


## Viewing your traces
You must have an Azure account to view your data. If you don't have one yet, [click here](https://docs.microsoft.com/azure/application-insights/app-insights-overview) to start.
