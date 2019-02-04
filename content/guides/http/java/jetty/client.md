---
title: "Client"
date: 2019-02-04T00:35:17-08:00
draft: false
aliases: [/integrations/http/java/jetty/client]
logo: /images/jetty-header-logo.png
---

- [Introduction](#introduction)
- [Imports](#imports)
    - [Dependency management](#dependency-management)
- [Initializing the client](#initializing-the-client)
- [Enabling observability](#enabling-observability)
    - [Stats](#stats)
    - [Traces](#traces)
    - [Extracing observability](#extracting-observability)
- [End-to-end example](#end-to-end-example)
    - [Source code](#source-code)
    - [Running it](#running-it)
- [Examining your traces](#examining-your-traces)
    - [All traces](#all-traces)
    - [Existent page](#existent-page)
    - [Non-existent page](#non-existent-page)
- [Examining your stats](#examining-your-stats)
- [References](#references)

### Introduction

The Jetty client integration has been instrumented with OpenCensus and it provides traces and stats.
This integration was added in OpenCensus-Java version 0.19.1.

### Imports

To add the Jetty client integration, we'll perform the following import.

{{<highlight Java>}}
import io.opencensus.contrib.http.jetty.client.OcJettyHttpClient;
{{</highlight>}}

#### Dependency management
Please add these lines to a pom.xml file in your current working directory.

{{<tabs Pom Gradle Ivy Buildr>}}
{{<highlight xml>}}
<!-- https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-http-jetty-client -->
<dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-contrib-http-jetty-client</artifactId>
    <version>0.19.1</version>
</dependency>

<!-- https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-http-util -->
<dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-contrib-http-util</artifactId>
    <version>0.19.1</version>
</dependency>
{{</highlight>}}

{{<highlight gradle>}}
// https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-http-jetty-client
compile group: 'io.opencensus', name: 'opencensus-contrib-http-jetty-client', version: '0.19.1'

// https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-http-util
compile group: 'io.opencensus', name: 'opencensus-contrib-http-util', version: '0.19.1'
{{</highlight>}}

{{<highlight xml>}}
<!-- https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-http-jetty-client -->
<dependency org="io.opencensus" name="opencensus-contrib-http-jetty-client" rev="0.19.1"/>

<!-- https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-http-util -->
<dependency org="io.opencensus" name="opencensus-contrib-http-util" rev="0.19.1"/>
{{</highlight>}}

{{<highlight python>}}
# https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-http-jetty-client
'io.opencensus:opencensus-contrib-http-jetty-client:jar:0.19.1'

# https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-http-util
'io.opencensus:opencensus-contrib-http-util:jar:0.19.1'
{{</highlight>}}

{{</tabs>}}

### Initializing the client

The client can be initialized simply by
{{<highlight java>}}
package io.opencensus.tutorials.jetty;

import io.opencensus.contrib.http.jetty.client.OcJettyHttpClient;

public class JettyClient {
  public static void main(String[] args) {
    OcJettyHttpClient httpClient = new OcJettyHttpClient();

    try {
      httpClient.start();
    } catch (Exception e) {
      System.err.println("Failed to start the Jetty Http client " + e);
      return;
    }
  }
}
{{</highlight>}}

### Enabling observability

Enabling observability takes just a few steps:

#### Stats
To add stats, we'll just add an extra step of registering HttpViews like this

{{<highlight java>}}
import io.opencensus.contrib.http.util.HttpViews;

public class JettyClient {
  private static void registerHttpViews() {
    HttpViews.registerAllClientViews();
  }
}
{{</highlight>}}

and after this we'll ensure that we add any of the [Stats exporters](/exporters/supported-exporters/java)

#### Traces
You don't need do anything else, except enable [Trace exporters](/exporters/supported-exporters/java)

#### Extracting observability

For the purposes of this demo, we'll do the following:

* Enable and use the Prometheus stats exporter to extract stats
* Enable and use the Zipkin tracing exporter to extract traces
* Turn up the trace sampling rate to 100% only to ensure every run produces traces and isn't sampled

### End to end example
{{% notice tip %}}
For assistance running any of the backends for any of the exporters, please refer to:

Exporter|URL
---|---
Prometheus|[Prometheus codelab](/codelabs/prometheus)
Zipkin|[Zipkin codelab](/codelabs/zipkin)
{{% /notice %}}

In this example, we'll be fetching from two different URLs:

URL|Purpose
---|---
https://opencensus.io/community|Existent URL
https://opencensus.io/non-existent|Non-existent URL

{{<tabs JettyClient Pom>}}
{{<highlight java>}}
package io.opencensus.tutorials.jetty;

import io.opencensus.contrib.http.jetty.client.OcJettyHttpClient;
import io.opencensus.contrib.http.util.HttpViews;
import io.opencensus.exporter.stats.prometheus.PrometheusStatsCollector;
import io.opencensus.exporter.trace.zipkin.ZipkinTraceExporter;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.samplers.Samplers;
import io.prometheus.client.exporter.HTTPServer;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.eclipse.jetty.client.HttpRequest;
import org.eclipse.jetty.client.api.ContentResponse;

public class JettyClient {
  public static void main(String[] args) {

    // First things first, enable observability exporters.
    try {
      enableOpenCensusExporters();
    } catch (Exception e) {
      System.err.println("Failed to create the OpenCensus exporters: " + e);
      return;
    }

    OcJettyHttpClient httpClient = new OcJettyHttpClient();

    try {
      httpClient.start();
    } catch (Exception e) {
      System.err.println("Failed to start the Jetty Http client " + e);
      return;
    }

    for (int i = 1; i <= 1000; i++) {
      System.out.println("Iteration: #" + i);

      String[] urls = {"https://opencensus.io/community", "https://opencensus.io/non-existent"};

      for (String url : urls) {
        System.out.println("Fetching URL: " + url);
        // Perform the synchronous request.
        HttpRequest syncRequest = (HttpRequest) httpClient.newRequest(url);
        try {
          ContentResponse response = syncRequest.send();

          byte[] payload = response.getContent();
          String strPayload = new String(response.getContent(), StandardCharsets.UTF_8);
          System.out.println("Payload \n" + strPayload);

          System.out.println("\n\n\nNow sleeping for 5s");
          Thread.sleep(5000);

        } catch (java.lang.InterruptedException e) {
          System.err.println("This thread was interrupted: " + e);
        } catch (java.util.concurrent.TimeoutException e) {
          System.err.println("The request timed out unfortunately: " + e);
        } catch (java.util.concurrent.ExecutionException e) {
          System.err.println("Execution failed: " + e);
        } catch (Exception e) {
          System.err.println("Unhandled exception: " + e);
        }
      }
    }
  }

  private static void enableOpenCensusExporters() throws IOException {
    // Firstly enable stats from the Http client views.
    HttpViews.registerAllClientViews();

    // Register the Prometheus stats collector aka "exporter".
    PrometheusStatsCollector.createAndRegister();
    HTTPServer prometheusServer = new HTTPServer(8889, true);

    // Update the trace sampling rate to 100% aka "AlwaysSample".
    TraceConfig traceConfig = Tracing.getTraceConfig();
    traceConfig.updateActiveTraceParams(
        traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

    // Enable the Zipkin trace exporter.
    ZipkinTraceExporter.createAndRegister(
        "http://localhost:9411/api/v2/spans", "jetty-client-tutorial");
  }
}
{{</highlight>}}
{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.opencensus.tutorials.jetty</groupId>
    <artifactId>jetty-client-tutorial</artifactId>
    <packaging>jar</packaging>
    <version>0.0.1</version>
    <name>jettyclient</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <opencensus.version>0.19.1</opencensus.version>
        <!-- Change this to the Jetty version that you would like to use -->
        <jetty.version>9.4.12.v20180830</jetty.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-contrib-http-jetty-client</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>org.eclipse.jetty</groupId>
            <artifactId>jetty-client</artifactId>
            <version>${jetty.version}</version>
        </dependency>

        <dependency>
            <groupId>io.netty</groupId>
            <artifactId>netty-tcnative-boringssl-static</artifactId>
            <version>2.0.8.Final</version>
            <scope>runtime</scope>
        </dependency>

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
            <artifactId>opencensus-exporter-stats-prometheus</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>io.prometheus</groupId>
            <artifactId>simpleclient_httpserver</artifactId>
            <version>0.4.0</version>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-exporter-trace-zipkin</artifactId>
            <version>${opencensus.version}</version>
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
            </plugins>
        </pluginManagement>

        <plugins>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>appassembler-maven-plugin</artifactId>
                <version>1.10</version>
                <configuration>
                    <programs>
                        <program>
                            <id>SQLApp</id>
                            <mainClass>io.opencensus.tutorials.jetty.JettyClient</mainClass>
                        </program>
                    </programs>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
{{</highlight>}}
{{</tabs>}}

### Running it

With Zipkin running as per [End-to-end example](#end-to-end-example) and Prometheus installed, the last
step is to turn on Prometheus with this configuration file that we'll save in `prom.yaml`

{{<highlight yaml>}}
scrape_configs:
  - job_name: 'jetty_tutorial'

    scrape_interval: 5s

    static_configs:
      - targets: ['localhost:8889']
{{</highlight>}}

and then run Prometheus like this

```shell
prometheus --config.file=prom.yaml
```

And finally to run the code

{{<highlight shell>}}
mvn install && mvn exec:java -Dexec.mainClass=io.opencensus.tutorials.jetty.JettyClient
{{</highlight>}}

### Examining your traces

On navigating to the Zipkin UI at http://localhost:9411/zipkin, you should see

#### All traces
* All traces
![](/images/jetty-client-traces-all.png)

#### Existent page
* On clicking on one of the spans where we fetched an existent page "https://opencensus.io/community"
![](/images/jetty-client-traces-200.png)

#### Non-Existent page
* On clicking on one of the spans where we fetched a non-existent page "https://opencensus.io/non-existent"
![](/images/jetty-client-traces-404.png)

### Examining your stats

On navigating to the Prometheus UI at http://localhost:9090, you should see

####  All stats
![](/images/jetty-client-stats-all.png)

#### Roundtrip latency
* 95th percentile for HTTP client roundtrip latency grouped by the "http_client_status" tag
```shell
histogram_quantile(0.95,
    sum(rate(opencensus_io_http_client_roundtrip_latency_bucket[5m])) by (http_client_status, le))
```
![](/images/jetty-client-stats-roundtrip-latency-95th.png)

#### Sent bytes

* Rate of sent bytes
```shell
rate(opencensus_io_http_client_sent_bytes_bucket[5m])
```
![](/images/jetty-client-stats-sent-bytes-rate.png)

### References

Resource|URL
---|---
Jetty client JavaDoc|[org.eclipse.jetty.client](https://www.eclipse.org/jetty/javadoc/current/org/eclipse/jetty/client/package-summary.html)
OcJettyClient JavaDoc|[io.opencensus.contrib.http.jetty.client.OcJettyHttpClient](https://www.javadoc.io/doc/io.opencensus/opencensus-contrib-http-jetty-client/)
OcJetty on Maven Central|https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-http-jetty-client
HTTP util on Maven Central|https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-http-util

