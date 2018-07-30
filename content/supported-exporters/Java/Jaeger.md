---
title: "Jaeger (Tracing)"
date: 2018-07-22T17:35:15-07:00
draft: false
weight: 3
class: "resized-logo"
---

![](https://www.jaegertracing.io/img/jaeger-logo.png)

{{% notice note %}}
This guide makes use of Jaeger for visualizing your data. For assistance setting up Jaeger, [Click here](/codelabs/jaeger) for a guided codelab.
{{% /notice %}}

Jaeger, inspired by Dapper and OpenZipkin, is a distributed tracing system released as open source by Uber Technologies.
It is used for monitoring and troubleshooting microservices-based distributed systems, including:

* Distributed context propagation
* Distributed transaction monitoring
* Root cause analysis
* Service dependency analysis
* Performance / latency optimization

OpenCensus Java has support for this exporter available through package [io.opencensus.exporter.trace.jaeger](https://www.javadoc.io/doc/io.opencensus/opencensus-exporter-trace-jaeger)

#### Table of contents
- [Creating the exporter](#creating-the-exporter)
- [Viewing your traces](#viewing-your-traces)
- [Project link](#project-link)

##### Creating the exporter
To create the exporter, we'll need to:

* Create an exporter in code
* Have the Jaeger endpoint available to receive traces

#### pom.xml
If using Maven, add these to your pom.xml file
```xml
<properties>
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  <opencensus.version>0.15.0</opencensus.version> <!-- The OpenCensus version to use -->
</properties>

<dependencies>
  <dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-api</artifactId>
    <version>${opencensus.version}</version>
  </dependency>
  <dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-exporter-trace-jaeger</artifactId>
    <version>${opencensus.version}</version>
  </dependency>
  <dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-impl</artifactId>
    <version>${opencensus.version}</version>
    <scope>runtime</scope>
  </dependency>
</dependencies>
```

{{<highlight java>}}
package io.opencensus.tutorial.jaeger;

import io.opencensus.exporter.trace.jaeger.JaegerTraceExporter;

public class JaegerTutorial {
    public static void main(String ...args) throws Exception {
        JaegerTraceExporter.createAndRegister("http://127.0.0.1:14268/api/traces", "service-b");
    }
}
{{</highlight>}}

#### Viewing your traces
Please visit the Jaeger UI endpoint [http://localhost:6831](http://localhost:6831)

#### Project link
You can find out more about the Jaeger project at [https://www.jaegertracing.io/](https://www.jaegertracing.io/)
