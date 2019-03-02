---
title: "Server"
date: 2019-02-26T00:35:17-08:00
draft: false
aliases: [/integrations/http/java/jetty/server]
logo: /images/jetty-header-logo.png
---

- [Introduction](#introduction)
- [Imports](#imports)
    - [Dependency management](#dependency-management)
- [Initialization](#initialization)
- [Enabling observability](#enabling-observability)
    - [Stats](#stats)
    - [Traces](#traces)
    - [Extracting observability](#extracting-observability)
- [End-to-end example](#end-to-end-example)
    - [Source code](#source-code)
    - [Running it](#running-it)
- [Examining your traces](#examining-your-traces)
    - [All traces](#all-traces)
    - [Detailed Trace](#detailed-trace)
- [Examining your stats](#examining-your-stats)
   - [All stats](#all-stats)
   - [Request Count](#request-count)
   - [Latency](#latency)
   - [Bytes received](#bytes-received)
- [References](#references)

### Introduction

The Jetty server integration has been instrumented with OpenCensus and it provides traces and stats.
This integration was added in OpenCensus-Java version 0.19.1.
This example uses [Jetty Embedding](https://www.eclipse.org/jetty/documentation/current/advanced-embedding.html).
You do not have to use Jetty embedding to take advantage of this Java HTTP integration though.
You can use it in regular Java Servlets.

### Imports

To add the Jetty server integration, we'll perform the following import.

{{<highlight Java>}}
import io.opencensus.contrib.http.servlet.OcHttpServletFilter;
{{</highlight>}}

#### Dependency management
Please add these lines to a pom.xml file in your current working directory.

{{<highlight xml>}}
<!-- https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-http-servlet -->
<dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-contrib-http-servlet</artifactId>
    <version>0.19.2</version>
</dependency>

<!-- https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-http-util -->
<dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-contrib-http-util</artifactId>
    <version>0.19.1</version>
</dependency>
{{</highlight>}}

### Initialization

The server can be initialized by
{{<highlight java>}}
package io.opencensus.examples.http.jetty.server;

import io.opencensus.contrib.http.servlet.OcHttpServletFilter;

public class HelloWorldServer extends AbstractHandler {

  public static void main(String[] args) throws Exception {
    Server server = new Server(8080);
    ServletHandler handler = new ServletHandler();
    server.setHandler(handler);

    handler.addFilterWithMapping(
        OcHttpServletFilter.class, "/*", EnumSet.of(DispatcherType.REQUEST));
    handler.addServletWithMapping(HelloServlet.class, "/*");
  }

}
{{</highlight>}}

### Enabling observability

Enabling observability takes just a few steps:

#### Stats
To add stats, we'll just add an extra step of registering HttpViews like this

{{<highlight java>}}
import io.opencensus.contrib.http.util.HttpViews;

HttpViews.registerAllServerViews();
{{</highlight>}}

and after this we'll ensure that we add any of the [Stats exporters](/exporters/supported-exporters/java)

#### Traces
You don't need do anything else, except enable [Trace exporters](/exporters/supported-exporters/java)

#### Extracting observability

For the purposes of this demo, we'll do the following:

* Enable and use the Prometheus stats exporter to extract stats
* Enable and use the Jaeger tracing exporter to extract traces
* Turn up the trace sampling rate to 100% only to ensure every run produces traces and isn't sampled

### End to end example
For background on Jetty, as used in this example application, see [Chapter 21. Embedding](https://www.eclipse.org/jetty/documentation/current/advanced-embedding.html) of the Jetty documentation.

{{% notice tip %}}
For assistance running the metrics and trace backends for any of the exporters, please refer to:

Exporter|URL
---|---
Prometheus|[Prometheus codelab](/codelabs/prometheus)
Jaeger|[Jaeger codelab](/codelabs/jaeger)
{{% /notice %}}

#### Source Code

{{<tabs Java Pom>}}
{{<highlight java>}}
package io.opencensus.examples.http.jetty.server;

import io.opencensus.contrib.http.servlet.OcHttpServletFilter;
import io.opencensus.contrib.http.util.HttpViews;
import io.opencensus.exporter.stats.prometheus.PrometheusStatsCollector;
import io.opencensus.exporter.trace.jaeger.JaegerTraceExporter;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.samplers.Samplers;
import io.prometheus.client.exporter.HTTPServer;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.EnumSet;
import javax.servlet.AsyncContext;
import javax.servlet.DispatcherType;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.WriteListener;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.log4j.Logger;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.AbstractHandler;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHandler;

/** Sample application that shows how to instrument jetty server. */
public class HelloWorldServer extends AbstractHandler {
  private static final Logger logger = Logger.getLogger(HelloWorldServer.class.getName());

  public static class HelloServlet extends HttpServlet {
    private static String body = "<h1>Hello World Servlet Get</h1>";

    private static final long serialVersionUID = 1L;

    private void blockingGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {

      String str = body.concat("<h3>blocking</h3>");
      ByteBuffer content = ByteBuffer.wrap(str.getBytes(StandardCharsets.UTF_8));

      PrintWriter pout = response.getWriter();

      pout.print("<html><body>");
      pout.print(str);
      pout.print("</body></html>\n");
      return;
    }

    private void asyncGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
      String str = body.concat("<h3>async</h3>");
      ByteBuffer content = ByteBuffer.wrap(str.getBytes(StandardCharsets.UTF_8));

      AsyncContext async = request.startAsync();
      response.setContentType("text/html");
      try {
        Thread.sleep(100);
      } catch (Exception e) {
        logger.info("Error sleeping");
      }
      ServletOutputStream out = response.getOutputStream();
      out.setWriteListener(
          new WriteListener() {
            @Override
            public void onWritePossible() throws IOException {
              while (out.isReady()) {
                if (!content.hasRemaining()) {
                  response.setStatus(200);
                  async.complete();
                  return;
                }
                out.write(content.get());
              }
            }

            @Override
            public void onError(Throwable t) {
              logger.info("Server onError callled");
              getServletContext().log("Async Error", t);
              async.complete();
            }
          });
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
      if (request.getPathInfo().contains("async")) {
        asyncGet(request, response);
      } else {
        blockingGet(request, response);
      }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
      // Read from request
      StringBuilder buffer = new StringBuilder();
      BufferedReader reader = request.getReader();
      String line;
      while ((line = reader.readLine()) != null) {
        buffer.append(line);
      }
      String data = buffer.toString();

      PrintWriter pout = response.getWriter();

      pout.print("<html><body>");
      pout.print("<h3>Hello World Servlet Post</h3>");
      pout.print("</body></html>");
      return;
    }
  }

  @Override
  public void handle(
      String target, Request baseRequest, HttpServletRequest request, HttpServletResponse response)
      throws IOException, ServletException {
    response.setContentType("text/html;charset=utf-8");
    response.setStatus(HttpServletResponse.SC_OK);
    baseRequest.setHandled(true);
    response.getWriter().println("<h1>Hello World. default handler.</h1>");
  }

  private static void initStatsExporter() throws IOException {
    HttpViews.registerAllServerViews();

    // Register Prometheus exporters and export metrics to a Prometheus HTTPServer.
    // Refer to https://prometheus.io/ to run Prometheus Server.
    PrometheusStatsCollector.createAndRegister();
    HTTPServer prometheusServer = new HTTPServer(9888, true);
  }

  private static void initTracing() {
    TraceConfig traceConfig = Tracing.getTraceConfig();

    // default sampler is set to Samplers.alwaysSample() for demonstration. In production
    // or in high QPS environment please use default sampler.
    traceConfig.updateActiveTraceParams(
        traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

    // Register Jaeger Tracing. Refer to https://www.jaegertracing.io/docs/1.8/getting-started/ to
    // run Jaeger
    JaegerTraceExporter.createAndRegister("http://localhost:14268/api/traces", "helloworldserver");
  }

  /**
   * HelloWorldServer starts a jetty server that responds to http request sent by {@link
   * HelloWorldClient}. The server uses http servlet which is instrumented with opencensus to enable
   * tracing and monitoring stats.
   */
  public static void main(String[] args) throws Exception {
    initTracing();
    initStatsExporter();
    ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
    context.setContextPath("/");

    Server server = new Server(8080);
    ServletHandler handler = new ServletHandler();
    server.setHandler(handler);

    handler.addFilterWithMapping(
        OcHttpServletFilter.class, "/*", EnumSet.of(DispatcherType.REQUEST));
    handler.addServletWithMapping(HelloServlet.class, "/*");

    server.start();
    server.join();
  }
}
{{</highlight>}}
{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.opencensus.tutorials.jetty</groupId>
    <artifactId>jetty-server-tutorial</artifactId>
    <packaging>jar</packaging>
    <version>0.0.1</version>
    <name>jettyclient</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <opencensus.version>0.19.2</opencensus.version>
        <!-- Change this to the Jetty version that you would like to use -->
        <jetty.version>9.4.12.v20180830</jetty.version>
    </properties>

    <dependencies>
        <!-- https://mvnrepository.com/artifact/javax.servlet/javax.servlet-api -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>3.1.0</version>
        </dependency>

        <dependency>
            <groupId>log4j</groupId>
            <artifactId>log4j</artifactId>
            <version>1.2.17</version>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-contrib-http-servlet</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>org.eclipse.jetty</groupId>
            <artifactId>jetty-server</artifactId>
            <version>${jetty.version}</version>
        </dependency>

        <dependency>
            <groupId>org.eclipse.jetty</groupId>
            <artifactId>jetty-servlet</artifactId>
            <version>${jetty.version}</version>
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
            <artifactId>opencensus-exporter-trace-jaeger</artifactId>
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

To compile with Maven, copy the code above into the files `pom.xml` and `src/main/java/io/opencensus/examples/http/jetty/server/HelloWorldServer.java` and build with the command
```bash
mvn install
```

Run Jaeger as per the codelab.

Prometheus installed, the last
step is to turn on Prometheus with this configuration file that we'll save in `prom.yaml`

{{<highlight yaml>}}
scrape_configs:
  - job_name: 'jetty_tutorial'

    scrape_interval: 5s

    static_configs:
      - targets: ['localhost:9888']
{{</highlight>}}

and then run Prometheus like this

```shell
prometheus --config.file=prom.yaml
```

And finally to run the code

{{<highlight shell>}}
mvn exec:java -Dexec.mainClass=io.opencensus.examples.http.jetty.server.HelloWorldServer
{{</highlight>}}

Send a GET request to the server with the command
```bash
curl http://localhost:8080/
```

You should see the output

```bash
<html><body><h1>Hello World Servlet Get</h1><h3>blocking</h3></body></html>
```

Send multiple requests to the server with a command like
```bash
curl -I http://localhost:8080/[0-9]
```

You should see output like

```bash
[1/10]: http://localhost:8080/0 --> <stdout>
--_curl_--http://localhost:8080/0
HTTP/1.1 200 OK
Date: Thu, 28 Feb 2019 14:29:31 GMT
Content-Length: 75
Server: Jetty(9.4.12.v20180830)
...
```

This will send 10 HEAD requests to the server. Send a POST request with the command

```bash
curl -d "param1=value1&amp;param2=value2" -X POST http://localhost:8080
```

You should see output like

```bash
<html><body><h3>Hello World Servlet Post</h3></body></html>
```

### Examining your traces

On navigating to the Jaeger UI at http://localhost:16686, you should see

#### All traces
All traces
![](/images/jetty-server-traces-all.png)

#### Detailed trace
jetty-server-traces-detailOn clicking on one of the spans you should a detailed view like shown below
![](/images/jetty-server-traces-detail.png)


### Examining your stats

On navigating to the Prometheus UI at http://localhost:9090, you should see something like

####  All stats
The list of metrics should be listed in a dropdown:
![](/images/jetty-server-stats-all.png)

#### Request Count

In the expression browser enter the text
```shell
rate(opencensus_io_http_server_completed_count[5m])
```

You should see a graph like shown below.

![](/images/jetty-server-stats-request-count.png)

Notice the separate timeseries for GET and HEAD requests.

#### Latency

For the 95th percentile latency enter this text into the expresson browser
```shell
histogram_quantile(0.95, sum(rate(opencensus_io_http_server_server_latency_bucket[5m])) by (method, error, le))
```
![](/images/jetty-server-stats-request-latency.png)

#### Bytes received

Rate of bytes received
```shell
sum(rate(opencensus_io_http_server_received_bytes_bucket[5m])) 
```
![](/images/jetty-server-stats-received-bytes-rate.png)

### References

Resource|URL
---|---
Jetty Documentation | [Current Release](https://www.eclipse.org/jetty/documentation/current/)
Jetty JavaDoc|[org.eclipse.jetty](https://www.eclipse.org/jetty/javadoc/current/)
OcJettyClient JavaDoc|[io.opencensus.contrib.http.jetty.client.OcJettyHttpClient](https://www.javadoc.io/doc/io.opencensus/opencensus-contrib-http-jetty-client/)
OcJetty on Maven Central|https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-http-jetty-client
HTTP util on Maven Central|https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-http-util

