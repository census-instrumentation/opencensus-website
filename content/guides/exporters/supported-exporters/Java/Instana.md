---
title: "Instana (Tracing)"
date: 2018-07-21T18:52:35-07:00
draft: false
weight: 3
class: "resized-logo"
---

![](/images/instana.png)

Instant provides AI Powered Application and Infrastructure Monitoring, allowing you to
deliver Faster With Confidence, and automatic Analysis and Optimization.

OpenCensus Java has support for this exporter available through package [io.opencensus.exporter.trace.instana](https://www.javadoc.io/doc/io.opencensus/opencensus-exporter-trace-instana)

More information can be found at the [Instana website](https://www.instana.com/)

#### Table of contents
- [Creating the exporters](#creating-the-exporters)
- [Viewing your traces](#viewing-your-traces)

##### Creating the trace exporter
To create the trace exporter, you'll need to:

* Have Instana credentials
* Use Maven setup your pom.xml file
* Create the exporter in code

##### pom.xml

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
            <artifactId>opencensus-impl</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-exporter-trace-instana</artifactId>
            <version>${opencensus.version}</version>
        </dependency>
    </dependencies>
```

##### Creating the exporter in code

{{<highlight java>}}
package io.opencensus.tutorial.instana;

import io.opencensus.exporter.trace.instana.InstanaTraceExporter;

public class InstanaTutorial {
    public static void main(String ...args) {
        String agentEndpointURI = "http://localhost:42699/com.instana.plugin.generic.trace";
        InstanaTraceExporter.createAndRegister(agentEndpointURI);
    }
}
{{</highlight>}}
