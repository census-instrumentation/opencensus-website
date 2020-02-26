---
title: "Agent"
weight: 7
aliases: [/agent]
logo: /images/opencensus-logo.png
---

- [Introduction](#introduction)
- [Benefits](#benefits)
- [Getting started](#getting-started)
- [References](#references)

### Introduction
The OpenCensus Agent is a daemon that allows polyglot deployments of OpenCensus to use centralized
exporter implementations. Instead of traditionally taking down and configuring OpenCensus exporters
per language library and for every single application, with the OpenCensus Agent, one just has to singly
enable the OpenCensus Agent exporter for their target language and it will deliver stats, metrics and traces
to the centralized point before they are exported to the target backends.

![](/images/agent-server.png)

By default, ocagent runs on TCP port `55678` and receives traffic from:

* HTTP/2 clients with Protobuf messages
* HTTP/1 clients that use the [grpc-gateway](https://github.com/grpc-ecosystem/grpc-gateway)

ocagent is written in the [Go programming language](https://golang.org/), it is cross platform, self-monitored and receives traffic
from any application that supports the [ocagent protocol](https://github.com/census-instrumentation/opencensus-proto/tree/master/src/opencensus/proto/agent) or from
any application that supported by any of the "OpenCensus Agent receivers", regardless of the programming language and deployment.

### Benefits

##### For APM Providers ...
* <b>Implement one Exporter and get data from applications in many languages.</b>
Developing exporters only for one language "Go" dramatically scales infrastructure development and deployment, as
observability backends no longer have to develop exporters in [every 1 of the 9+ languages that OpenCensus supports.](/language-support)

* <b>Democratizes deployments</b> for cloud providers because cloud providers can define the backends/exporters
that ocagent sends data to.

##### For Application Developers ...

* <b>Manage single exporter.</b> Your applications no longer have to locally enable each exporter per language.
All applications sends data to OC-Agent using OpenCensus Exporter.

* <b>Democratizes deployments</b> for customers as well. They can send the data to a backend of their choice.

* <b>Agent provides stats aggregation.</b> Some languages like PHP are a challenge to use a unified in-app concept of stats, instead each request forks independently,
hence requires a side car approach to capture stats and traces. Enabling exporters per request is non-idle and expensive.
For this purpose, ocagent with a custom daemon allows aggregation of stats and sending over traces.
You can read more about this in [OpenCensus PHP design](https://docs.google.com/document/d/1CRiRq_wpzOuG9VKM_eaImcrS12Iie2V7LePnH9AwclU/)

* <b>Instrument once, choose and replace backend anytime.</b> Projects can be instrumented without having to upfront decide what backend their signals will be exported to.
Drivers, servers, frameworks etc can all be instrumented and still be portable across various deployments and clouds. The customer
can at anytime decide which backend they'd like to export to.
An example of such a provider is [Microsoft with Azure Application Insights.](https://docs.microsoft.com/en-us/azure/azure-monitor/app/opencensus-local-forwarder)
Which has their own agent that receives OpenCensus observability signals.

* <b>Reduces overhead.</b> Enabling exporters in only one place dramatically reduces the need to restart and redeploy each application that produces observability.
Only ocagent needs to be restarted and the other applications can stay deployed in production.

* <b>Consolidates Observability signals.</b> To bootstrap and democratize collection and exporting of your observability data, ocagent also comes with "receivers". "receivers" make ocagent act like
pass-through backends that then receive your telemetry and then route it to the exporter of your choice. For example if all your applications used Zipkin or Jaeger or Prometheus,
ocagent can receive data from your applications and then route it to your target backend. This is particularly important if you are in a polyglot and poly-backend setup
for which legacy applications are a pain to maintain but you'd like to consolidate your observability signals. It also means that you won't have to install every single backend's
library and run and scale each backend. Some situations such as expensive acquisitions particularly can benefit from ocagent as described.

* <b>No more managing ports.</b> ocagent becomes especially important since some exporters such as Prometheus require
a port for every single application so traditionally you'd be limited to 65536 - (number of reserved ports) applications.
Unfortunately that approach doesn't scale proportionally with the complexity of your applications and their deployments.
ocagent mitigates such problems by allowing all your applications to send observability data to it, and then it will singly
be connected to your final exporter. Now notice, that's just 1 port open vs a max of 65536, yet giving the same functionality.


### Getting started
To get started with the OpenCensus Agent, let's examine the following topics:
{{% children %}}

### References

Resource|URL
---|---
OpenCensus Agent Protocol|[ocagent-protocol](https://github.com/census-instrumentation/opencensus-proto/tree/master/src/opencensus/proto/agent)
OpenCensus Agent Design|[ocagent design doc](https://github.com/census-instrumentation/opencensus-service/blob/master/DESIGN.md#opencensus-agent)
OpenCensus Collector Design|[occollector design doc](https://github.com/census-instrumentation/opencensus-service/blob/master/DESIGN.md#opencensus-collector)
grpc-gateway|[grpc-gateway on GitHub](https://github.com/grpc-ecosystem/grpc-gateway)
OpenCensus PHP design|[Design doc](https://docs.google.com/document/d/1CRiRq_wpzOuG9VKM_eaImcrS12Iie2V7LePnH9AwclU/)
