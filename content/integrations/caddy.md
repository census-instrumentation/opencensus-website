---
title: "Caddy"
date: 2018-07-16T14:42:17-07:00
draft: false
class: "integration-page"
---

![caddy logo](/img/caddyserver-logo.png)

#### Table of contents

- [Background](#background)
- [Enabling Observability](#enabling-observability)
    - [Git checkout](#git-checkout)
    - [Syntax](#syntax)
    - [Variables Table](#variables-table)
    - [Examples](#examples)

#### Background

Caddy is a modern server that is deployable for modern web services.
With the increasing complexity and style of deployment of many web services,
examining the behavior of the entire system quickly becomes very complex,
and gains from any updates, optimizations or load shedding become
very hard to qualify or examine.

To fill this void, Caddy rightfully so deserves modern observability.

Modern observability on the web server means that any operations after a request
hits the web server can be observed, measured and examined irrespective of
the destination of the request, whatever centric serving it performs or the big
picture system behavior.

Distributed Tracing and Monitoring is the mechanism by which we can gain
insights into the behavior of a distributed system.

Tracing gives us timing and territorial information about the progression
of a request. Using context propagation on the transport e.g HTTP, we can
send over information between remote services and after completion examine
the propagations on various backends, without any vendor lock-in or any
single cloud lock-in.

With monitoring/metric collection, we can collect any quantifiable metrics such as:
* Client and Server latency
* Memory statistics
* Runtime behavior

An added advantage of vendor agnostic distributed tracing is that we can then export
these traces and metrics simultaneously to a plethora of backends that your
site reliability engineers and generally other developers can examine on such as:
* Instana
* Prometheus/Grafana
* AWS X-Ray
* Zipkin
* Jaeger
* DataDog
* Stackdriver Monitoring and Tracing
and many more

However, the distributed tracing and monitoring framework should provide very low
latency and optionality so that users of the server will not incur expensive overhead.
Also the addition of observability the web server should not add a maintainence burden
for your teams, the project maintainers either nor should they require sophisticated
and specialized distributed systems and observability knowledge, nor should it require
sophisicated infrastructure deployments.

#### Enabling Observability

```shell
caddy -observability "<sampler_rate>;exporter1:[config1Key=config1Value:config2Key=config2Value...][,]exporter2...]"
```

##### Git checkout

You can enable observability by checking out the instrumented branch of caddy
```shell
go get github.com/mholt/caddy/caddy
cd $GOPATH/src/github.com/mholt/caddy
git add orijtech git@github.com:orijtech/caddy.git && git fetch orijtech && git checkout instrument-with-opencensus && go get ./caddy
```

##### Syntax

```xml
observability   := SamplerRate;Exporters
SamplerRate     := float64 value
Exporters       := [ExporterConfig](,ExporterConfig)?
ExporterConfig  := Name:[Key-ValuePairs]*
Name            := collection of symbolic names for exporters
Key-Value Pair  := KeyToken=ValueToken
KeyToken        := string
ValueToken      := string
```

##### Variables Table

Exporter Name|Key|Type|Notes|Example
---|---|---|---|---
aws-xray|AWS_REGION|String|The region that your project is located in|`AWS_REGION=us-west-2`
aws-xray|AWS_ACCESS_KEY_ID|Your access key|`AWS_ACCESS_KEY_ID=keyID`
aws-xray|AWS_SECRET_ACCESS_KEY|Your access key|`AWS_SECRET_ACCESS_KEY=secretKey`
jaeger|agent|The URL of the Jaeger|`caddy -observability "jaeger:agent=localhost:6831"`
jaeger|collector|The URL of the Jaeger|`caddy -observability "jaeger:collector=http://localhost:9411"`
jaeger|service-name|The service name when inspected by Jaeger|`caddy -observability "jaeger:service-name=search_endpoint"`
prometheus|port|The port that will be scraped from your `prometheus.yml` file|`caddy -observability "prometheus:port=9987"`
stackdriver|GOOGLE_APPLICATION_CREDENTIALS|File path for value|The credentials for your Google Cloud Platform project|`GOOGLE_APPLICATION_CREDENTIALS=~/creds.json caddy -observability "1;stackdriver:tracing=true"`
stackdriver|monitoring|boolean for value|A commandline option to toggle monitoring|`caddy -observability "stackdriver:monitoring=true"`
stackdriver|tracing|boolean for value|A commandline option to toggle tracing|`caddy -observability "stackdriver:tracing=true"`
stackdriver|project-id|string for value|A commandline option|`caddy -observability "stackdriver:project-id=census-demos"`
zipkin|local|URL|The URL of the local endpoint|`caddy -observability "zipkin:local=192.168.1.5:5454"`
zipkin|reporter|URL|The URL of the reporter endpoint|`caddy -observability "zipkin:reporter=http://localhost:9411/api/v2/spans"`
zipkin|service-name|string|The name of your service|`caddy -observability "service-name=server"`

##### Examples

* Comprehensive example running with all the environment variables too

```shell
GOOGLE_APPLICATION_CREDENTIALS=./creds.json AWS_REGION=us-west-2 AWS_ACCESS_KEY_ID=keyId AWS_SECRET_ACCESS_KEY=secretKey \
  caddy -observability "0.9;zipkin,prometheus:port=8999,aws-xray,stackdriver:tracing=true:monitoring=true:project-id=census-demos,jaeger:agent=localhost:6831,service-name=search-endpoint"
```
