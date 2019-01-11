---
title: "Java"
date: 2018-11-26T01:04:03-07:00
draft: false
aliases: [/integrations/redis/java]
logo: /images/java-opencensus.png
---

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [How it works](#how-it-works)
- [Dependency listing](#dependency-listing)
- [Imports](#imports)
- [Enabling observability](#enabling-observability)
- [Available metrics](#available-metrics)
- [End to end example](#end-to-end-example)
    - [Running it](#running-it)
- [Viewing your metrics](#viewing-your-metrics)
- [Viewing your traces](#viewing-your-traces)

### Introduction
To provide client side observability, a Java Redis client [Jedis](https://github.com/xetorthio/jedis) has been instrumented
with OpenCensus for tracing and metrics.

Resource|Repository link
---|---
Jedis wrapper on Github|https://github.com/orijtech/ocjedis
Maven Central URL|https://mvnrepository.com/artifact/io.orijtech.integrations/ocjedis

### Prerequisites

You will need the following:

* Redis server
* Prometheus
* Zipkin

{{% notice tip %}}
Before proceeding we'll need to firstly install the following

Requirement|Guide
---|---
Redis server|https://redis.io/topics/quickstart
Prometheus|[Prometheus codelab](/codelabs/prometheus)
Zipkin|[Zipkin codelab](/codelabs/zipkin)
{{% /notice %}}

### How it works

The integration extends [redis.clients.jedis.Jedis](https://static.javadoc.io/redis.clients/jedis/3.0.1/redis/clients/jedis/Jedis.html) by wrapping most methods with instrumentation that enables tracing and metrics.

### Dependency listing

{{<tabs Maven Gradle Ivy Buildr>}}
{{<highlight xml>}}
<!-- https://mvnrepository.com/artifact/io.orijtech.integrations/ocjedis -->
<dependency>
  <groupId>io.orijtech.integrations</groupId>
  <artifactId>ocjedis</artifactId>
  <version>0.0.3</version>
</dependency>
{{</highlight>}}

{{<highlight gradle>}}
// https://mvnrepository.com/artifact/io.orijtech.integrations/ocjedis
compile group: 'io.orijtech.integrations', name: 'ocjedis', version: '0.0.3'
{{</highlight>}}

{{<highlight xml>}}
<!-- https://mvnrepository.com/artifact/io.orijtech.integrations/ocjedis -->
<dependency org="io.orijtech.integrations" name="ocjedis" rev="0.0.3"/>
{{</highlight>}}

{{<highlight python>}}
# https://mvnrepository.com/artifact/io.orijtech.integrations/ocjedis
'io.orijtech.integrations:ocjedis:jar:0.0.3'
{{</highlight>}}

{{</tabs>}}

### Imports
One just needs to import the integration and use it like they would for Jedis

```java
import io.orijtech.integrations.ocjedis.OcWrapJedis;
import io.orijtech.integrations.ocjedis.Observability;

private static final OcWrapJedis jedis = new OcWrapJedis(redisHost);
```

### Enabling observability
We'll need to enable stats by registering and enabling all available views
{{<highlight java>}}
// Enable exporting of all the Jedis specific metrics and views
Observability.registerAllViews();
{{</highlight>}}

### Available metrics

Metric search suffix|Description|Tags
---|---|---
jedis/latency|The latency of the various methods|"method", "error", "status"
jedis/calls|The calls made by various methods|"method", "error", "status"
jedis/data_transferred|The amount of data transferred|"method", "type"


### End to end example

In this end-to-end example, we've taken an excerpt from a search service. It checks Redis server if the expensively computed response
was already saved. If not found ("cache miss"), it'll process the response then save it to the cache for later "cache hits".

{{<tabs Source Pom>}}

{{<highlight java>}}
package io.opencensus.tutorials.jedis;

import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.Span;
import io.opencensus.trace.Status;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.samplers.Samplers;
import io.opencensus.common.Scope;

// Enable the exporters.
import io.opencensus.exporter.stats.prometheus.PrometheusStatsCollector;
import io.opencensus.exporter.trace.zipkin.ZipkinTraceExporter;
import io.prometheus.client.exporter.HTTPServer;

import io.orijtech.integrations.ocjedis.OcWrapJedis;
import io.orijtech.integrations.ocjedis.Observability;

public class JedisOpenCensus {
    private static final OcWrapJedis jedis = new OcWrapJedis("localhost");
    private static final Tracer tracer = Tracing.getTracer();

    public static void main(String ...args) {
        // Now enable OpenCensus exporters
        try {
            setupOpenCensusAndExporters();
        } catch(Exception e) {
            System.err.println("Failed to create OpenCensus exporters " + e);
        }

        while (true) {
            try {
                // Sleeping for a bit to avoid exhausting CPU.
                Thread.sleep(1700);
            } catch (Exception e) {
            }

            // Add user input here.
            String query = "This simulates user input to aid populating observability signals";
            String result = "";

            try (Scope ss = JedisOpenCensus.tracer.spanBuilder("Search").startScopedSpan()) {

                Span span = JedisOpenCensus.tracer.getCurrentSpan();

                // Check Redis if we've memoized the response.
                result = jedis.get(query);
                if (result == null || result == "") {
                    // Cache miss so process and memoize it
                    span.addAnnotation("Cache miss!");
                    result = "$" + query + "$";
                    jedis.set(query, result);
                } else {
                    span.addAnnotation("Cache hit!");
                    // Clear the output so that the next search will be a Cache miss.
                    jedis.del(query);
                }
            } catch (Exception e) {
                Span span = JedisOpenCensus.tracer.getCurrentSpan();
                span.setStatus(Status.INTERNAL.withDescription(e.toString()));
                System.err.println("Exception "+ e);
            }

            // Finally print out the output.
            System.out.println("< " + result + "\n");
        }
    }

    private static void setupOpenCensusAndExporters() throws Exception {
        // Enable exporting of all the Jedis specific metrics.
        Observability.registerAllViews();

        // Change the sampling rate to always sample.
        TraceConfig traceConfig = Tracing.getTraceConfig();
        traceConfig.updateActiveTraceParams(
                traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

        // Next create the Zipkin trace exporter.
        ZipkinTraceExporter.createAndRegister("http://localhost:9411/api/v2/spans", "itunes-search-client");

        // And then enable the Prometheus exporter too.
        PrometheusStatsCollector.createAndRegister();
        // Start the Prometheus server
        HTTPServer prometheusServer = new HTTPServer(9888, true);
    }
}
{{</highlight>}}

{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.opencensus.quickstart</groupId>
    <artifactId>quickstart</artifactId>
    <packaging>jar</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>quickstart</name>
    <url>http://maven.apache.org</url>

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
            <scope>runtime</scope>
            <version>${opencensus.version}</version>
        </dependency>


        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-exporter-stats-prometheus</artifactId>
            <version>${opencensus.version}</version>
        </dependency>
        <dependency>
            <groupId>io.prometheus</groupId>
            <artifactId>simpleclient_httpserver</artifactId>
            <version>0.3.0</version>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-exporter-trace-zipkin</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <!-- https://mvnrepository.com/artifact/io.orijtech.integrations/ocjedis -->
        <dependency>
            <groupId>io.orijtech.integrations</groupId>
            <artifactId>ocjedis</artifactId>
            <version>0.0.3</version>
        </dependency>
    </dependencies>

    <build>
        <extensions>
            <extension>
                <groupId>kr.motd.maven</groupId>
                <artifactId>os-maven-plugin</artifactId>
                <version>1.5.0.Final</version>
            </extension>
        </extensions>

        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>3.7.0</version>
                    <configuration>
                        <source>1.8</source>
                        <target>1.8</target>
                    </configuration>
                </plugin>

                <plugin>
                    <groupId>org.codehaus.mojo</groupId>
                    <artifactId>appassembler-maven-plugin</artifactId>
                    <version>1.10</version>
                    <configuration>
                        <programs>
                            <program>
                                <id>JedisOpenCensus</id>
                                <mainClass>io.opencensus.tutorials.jedis.JedisOpenCensus</mainClass>
                            </program>
                        </programs>
                    </configuration>
                </plugin>
            </plugins>

        </pluginManagement>

    </build>
</project>
{{</highlight>}}
{{</tabs>}}

#### Running it
```shell
mvn install && mvn exec:java -Dexec.mainClass=io.opencensus.tutorials.jedis.JedisOpenCensus
```

### Viewing your metrics
Please visit the Prometheus UI at http://localhost:9090

* All metrics
![](/images/ocjedis-metrics-all.png)

* Calls
![](/images/ocjedis-metrics-calls.png)

* Latency, with errors too
![](/images/ocjedis-metrics-latency-with-errors.png)

* Data transferred
![](/images/ocjedis-metrics-data_transferred.png)

### Viewing your traces
Please visit the Zipkin UI at http://localhost:9411/zipkin

* All traces
![](/images/ocjedis-trace-all.png)

* Single trace without error
![](/images/ocjedis-trace-single.png)

* Single trace with error
![](/images/ocjedis-trace-with-error.png)

* Single trace with error detail
![](/images/ocjedis-trace-with-error-detail.png)

### References

Resource|URL
---|---
OCJedis integration on Github|https://github.com/orijtech/ocjedis
OCJedis on Maven Central|https://mvnrepository.com/artifact/io.orijtech.integrations/ocjedis
Jedis project Javadoc|https://www.javadoc.io/doc/redis.clients/jedis
Jedis project Github|https://github.com/xetorthio/jedis
