---
title: "OpenCensus at Microsoft Ignite"
date: 2018-09-25
draft: false
weight: 3
aliases: [/blog/ms-ignite-2018]
hidden: true
logo: /img/logo-sm.svg
---

## Open Census at Microsoft Ignite

![](http://appanacdn.blob.core.windows.net/cdn/icons/aic.png)

### Introduction

Just 3 month passed since the announcement that Microsoft is joining the
OpenCensus project. This week at [Microsoft
Ignite](https://www.microsoft.com/ignite) a Open Census were part of
many conversation. It makes the goal of building a standardized platform
for instrumenting metrics and distributed traces that work across
various programming languages and technologies closer.

### Keynote

As part of a keynote Microsoft announced support of Virtual Nodes by
Azure Kubernetes Service. Virtual Nodes allow to scale your app faster,
in a matter of minutes. What's the best way to demonstrate this if not
the Application Insights [Live
Metrics Stream](https://docs.microsoft.com/azure/application-insights/app-insights-live-stream).

![Microsoft Ignite 2018 keynote AKS Virtual Nodes with Application
Insights and Open Census](images/ms-ignite-kyenote.gif).

Link to the [video](https://mediastream.microsoft.com/events/2018/1809/Ignite/player/tracks/track2.html?start=17300).

Looking at demo application you may see that it is powered by [Open
Census](https://github.com/Azure-Samples/virtual-node-autoscale).

![](images/keynote-demo-app-uses-open-census.png)

Open Census allows to instrument an app once and use various backends to
visualize and analyze the data. As was said during this demo - if you
want to use Azure with your own tooling - this is OK. You can bring your
tooling and build the same experience as was shown with Application
Insights. With Azure it's easy.

### Better Go and Python support

With Open Census - Application Insights delivers a better support for Go
and Python. Azure Monitor
[announcement](https://azure.microsoft.com/blog/new-full-stack-monitoring-capabilities-in-azure-monitor/)
calls out that Python & Go apps monitoring are now supported by
Application Insights thru Open Census and Local Forwarder.

You can find details documentation at
[docs.microsoft.com](https://docs.microsoft.com/azure/application-insights/distributed-tracing#enable-via-opencensus).

This is an important milestone. It not only simply enables new apps
support for Microsoft customers. It enables community to achieve more
thru collaboration and combined scenarios.

### Call for standardization

Open Census and Local Forwarder approach simplifies the design of
monitoring system and opens door for new scenarios and innovations. All
those scenarios are only possible with the standardized and unified
implementation for metrics and distributed tracing data collection.

As a fundamental principle of Open Census we strive for consistency in
data collection in SDKs thru specifications and test cases across
languages. We build test cases for [propagation
protocols](https://github.com/w3c/distributed-tracing) and data
collection specifications.

### Summary

We in Microsoft are set on the path for better monitoring and
observability for everybody. We thank everybody in Open Census community
for support and collaboration! The future is looking bright!

By Sergey Kanzhelev and Nik Molnar, Microsoft.
