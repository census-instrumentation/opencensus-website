---
title: "Java"
date: 2018-08-08T16:10:31-07:00
draft: false
weight: 2
---

![](/images/java-grpc-opencensus.png)

{{% notice note %}}
Before beginning, if you haven't already:

* Setup gRPC for Java by visiting this quickstart page [https://grpc.io/docs/quickstart/java.html](https://grpc.io/docs/quickstart/java.html)
* Setup [Stackdriver Tracing and Monitoring](/codelabs/stackdriver/)
{{% / notice %}}

#### Table of contents
- [Overview](#overview)
    - [Protobuf definition](#protobuf-definition)
    - [Generate the service](#generate-the-service)
- [Instrumentation](#instrumentation)
    - [Instrumenting the server](#instrumenting-the-server)
    - [Instrumenting the client](#instrumenting-the-client)
- [Examining traces](#examining-traces)
- [Examining metrics](#examining-metrics)
- [Notes](#notes)

#### Overview

Our serivce takes in a payload containing bytes and capitalizes them.

Using OpenCensus, we can collect traces and metrics of our system and export them to the backend of our choice, to give observability to our distributed systems.

grpc-Java has already been instrumented [gRPC-Core](https://github.com/grpc/grpc-java) with OpenCensus for tracing and metrics. Application users just need to add a runtime dependency on OpenCensus-Java impl, and the instrumentations should just work.

As specified at [grpc-java on Github](https://github.com/grpc/grpc-java#download), the respective inclusions to our build systems are:

{{<tabs Maven Non-Android_Gradle Android-Gradle>}}
{{<highlight xml>}}
<dependency>
  <groupId>io.grpc</groupId>
  <artifactId>grpc-netty-shaded</artifactId>
  <version>1.14.0</version>
</dependency>
<dependency>
  <groupId>io.grpc</groupId>
  <artifactId>grpc-protobuf</artifactId>
  <version>1.14.0</version>
</dependency>
<dependency>
  <groupId>io.grpc</groupId>
  <artifactId>grpc-stub</artifactId>
  <version>1.14.0</version>
</dependency>
{{</highlight>}}

{{<highlight text>}}
compile 'io.grpc:grpc-netty-shaded:1.14.0'
compile 'io.grpc:grpc-protobuf:1.14.0'
compile 'io.grpc:grpc-stub:1.14.0'
{{</highlight>}}

{{<highlight text>}}
compile 'io.grpc:grpc-okhttp:1.14.0'
compile 'io.grpc:grpc-protobuf-lite:1.14.0'
compile 'io.grpc:grpc-stub:1.14.0'
{{</highlight>}}
{{</tabs>}}

#### Protobuf definition

Make a directory structure `src/main/proto`

```shell
mkdir -p src/main/proto
```
and inside it paste this protobuf definition inside `defs.proto`

{{<highlight proto>}}
syntax = "proto3";

package ocgrpc;

option java_package = "io.octutorials.ocgrpc";

message Payload {
    int32 id    = 1;
    bytes data  = 2;
}

service Fetch {
    rpc Capitalize(Payload) returns (Payload) {}
}
{{</highlight>}}


#### Generate the service

The source code below and the pom.xml file will be used to generate the service
Please place the server code in file `src/main/java/io/octutorials/ocgrpc/TutorialServer.java`.

{{<tabs Server_code pom_mxl>}}
{{<highlight java>}}
package io.octutorials.ocgrpc;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import io.grpc.stub.StreamObserver;

import io.octutorials.ocgrpc.Defs.Payload;
import io.octutorials.ocgrpc.FetchGrpc;

import com.google.protobuf.ByteString;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.lang.InterruptedException;

public class TutorialServer {
    private final int serverPort;
    private Server server;

    public TutorialServer(int port) {
        this.serverPort = port;
    }

    static class FetchImpl extends FetchGrpc.FetchImplBase {
        @Override
        public void capitalize(Payload req, StreamObserver<Payload> responseObserver) {
            try {
                String capitalized = req.getData().toString("UTF8").toUpperCase();
                ByteString bs = ByteString.copyFrom(capitalized.getBytes("UTF8"));
                Payload resp = Payload.newBuilder().setData(bs).build();
                responseObserver.onNext(resp);
            } catch (UnsupportedEncodingException e) {
            } finally {
                responseObserver.onCompleted();
            }
        }
    }

    public void listenAndServe() throws IOException, InterruptedException {
        this.start();
        this.server.awaitTermination();
    }

    private void start() throws IOException {
        this.server = ServerBuilder.forPort(this.serverPort)
                        .addService(new FetchImpl())
                        .build()
                        .start();

        System.out.println("Server listening on " + this.serverPort);

        Server theServer = this.server;
        Runtime.getRuntime()
            .addShutdownHook(
                    new Thread() {
                        public void run() {
                            theServer.shutdown();
                        }
                    });
    }

    public static void main(String ...args) {
        TutorialServer tsrv = new TutorialServer(9876);

        try {
            tsrv.listenAndServe();
        } catch (IOException e) {
            System.err.println("Exception encountered while serving: " + e);
        } catch (InterruptedException e) {
            System.err.println("Caught an interrupt: " + e);
        } catch (Exception e) {
            System.err.println("Unhandled exception: " + e);
        }
    }
}
{{</highlight>}}
{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.octutorials</groupId>
    <artifactId>octutorials</artifactId>
    <packaging>jar</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>ocgrpc</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <grpc.version>1.9.0</grpc.version> <!-- The gRPC version to use with the version of OpenCensus -->
    </properties>

    <dependencies>
        <dependency>
            <groupId>io.grpc</groupId>
            <artifactId>grpc-netty</artifactId>
            <version>${grpc.version}</version>
        </dependency>

        <dependency>
            <groupId>io.grpc</groupId>
            <artifactId>grpc-protobuf</artifactId>
            <version>${grpc.version}</version>
        </dependency>

        <dependency>
            <groupId>io.grpc</groupId>
            <artifactId>grpc-stub</artifactId>
            <version>${grpc.version}</version>
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
                            <id>TutorialServer</id>
                            <mainClass>io.octutorials.ocgrpc.TutorialServer</mainClass>
                        </program>
                    </programs>
                </configuration>
            </plugin>

            <plugin>
                <groupId>org.xolstice.maven.plugins</groupId>
                <artifactId>protobuf-maven-plugin</artifactId>
                <version>0.5.0</version>
                <configuration>
                    <protocArtifact>com.google.protobuf:protoc:3.5.1-1:exe:${os.detected.classifier}</protocArtifact>
                    <pluginId>grpc-java</pluginId>
                    <pluginArtifact>io.grpc:protoc-gen-grpc-java:${grpc.version}:exe:${os.detected.classifier}</pluginArtifact>
                </configuration>

                <executions>
                    <execution>
                        <goals>
                            <goal>compile</goal>
                            <goal>compile-custom</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>

</project>
{{</highlight>}}
{{</tabs>}}

and to run it, we'll do
```shell
mvn install && mvn exec:java -Dexec.mainClass=io.octutorials.ocgrpc.TutorialServer
```
which will give such output

![](/images/java-grpc-server-plain.png)

##### Client

The client talks to the server via a gRPC channel, sending in bytes and getting back the output capitalized.

The contents of `src/main/java/io/octutorials/ocgrpc/TutorialServer.java` are as below:
```java
package io.octutorials.ocgrpc;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;

import io.octutorials.ocgrpc.Defs.Payload;
import io.octutorials.ocgrpc.FetchGrpc;

import com.google.protobuf.ByteString;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.concurrent.TimeUnit;

public class TutorialClient {
    private final ManagedChannel channel;
    private final FetchGrpc.FetchBlockingStub stub;

    public TutorialClient(String serverHost, int serverPort) {
        this.channel = ManagedChannelBuilder.forAddress(serverHost, serverPort)
            .usePlaintext(true)
            .build();
        this.stub = FetchGrpc.newBlockingStub(this.channel);
    }

    public void shutdown() throws InterruptedException {
        this.channel.shutdown().awaitTermination(4, TimeUnit.SECONDS);
    }

    public String capitalize(String data) {
        try {
            ByteString bs = ByteString.copyFrom(data.getBytes("UTF8"));
            Payload in = Payload.newBuilder().setData(bs).build();
            Payload out = this.stub.capitalize(in);
            return out.getData().toString("UTF8");
        } catch (UnsupportedEncodingException e) {
            return "";
        } catch (StatusRuntimeException e) {
            return "";
        }
    }

    public static void main(String ...args) {
        TutorialClient  cc = new TutorialClient("0.0.0.0", 9876);

        try {
            BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

            while (true) {
                System.out.print("> ");
                System.out.flush();
                String in = stdin.readLine();

                String out = cc.capitalize(in);
                System.out.println(String.format("< %s\n", out));
            }
        } catch (Exception e) {
        }
    }
}
```

which will give you such output after you've typed in
![](/images/ocgrpc-java-client.png)

#### Instrumentation

To gain insights to our service, we'll add trace and metrics instrumentation as follows

##### Instrumenting the server


We'll instrument the server by tracing as well as gRPC metrics using OpenCensus with imports such as:

Import|Purpose
---|---
io.opencensus.contrib.grpc.metrics.RpcViews|gRPC metrics
io.opencensus.trace.*|The tracing packages
io.opencensus.exporter.stats.stackdriver.*|The Stackdriver Stats exporter
io.opencensus.exporter.trace.stackdriver.*|The Stackdriver Tracing exporter

And we'll have the source code as follows

{{<tabs Traces Metrics Combined Pom_xml>}}
{{<highlight java>}}
package io.octutorials.ocgrpc;

import io.opencensus.common.Scope;
import io.opencensus.trace.Span;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.samplers.Samplers;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.config.TraceParams;

import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;

public class TutorialServer {
    private static final Tracer tracer = Tracing.getTracer();

    static class FetchImpl extends FetchGrpc.FetchImplBase {
        @Override
        public void capitalize(Payload req, StreamObserver<Payload> responseObserver) {
            Scope ss = TutorialServer.tracer.spanBuilder("octutorials.FetchImpl.capitalize").startScopedSpan();

            try {
                String capitalized = req.getData().toString("UTF8").toUpperCase();
                ByteString bs = ByteString.copyFrom(capitalized.getBytes("UTF8"));
                Payload resp = Payload.newBuilder().setData(bs).build();
                responseObserver.onNext(resp);
            } catch (UnsupportedEncodingException e) {
            } finally {
                ss.close();
                responseObserver.onCompleted();
            }
        }
    }

    private static void setupOpencensusAndExporters() throws IOException {
        String gcpProjectId = System.getenv().get("GCP_PROJECTID");
        if (gcpProjectId == null || gcpProjectId == "") {
            gcpProjectId = "census-demos";
        }

        // For demo purposes, always sample
        TraceConfig traceConfig = Tracing.getTraceConfig();
        traceConfig.updateActiveTraceParams(
                traceConfig.getActiveParams()
                    .toBuilder()
                    .setSample(Samplers.alwaysSample())
                    .build());

        // Create the Stackdriver trace exporter
        StackdriverTraceExporter.createAndRegister(
                StackdriverTraceConfiguration.builder()
                .setProjectId(gcpProjectId)
                .build());
    }
}
{{</highlight>}}

{{<highlight java>}}
package io.octutorials.ocgrpc;

import io.opencensus.common.Duration;
import io.opencensus.contrib.grpc.metrics.RpcViews;

import io.opencensus.exporter.stats.stackdriver.StackdriverStatsConfiguration;
import io.opencensus.exporter.stats.stackdriver.StackdriverStatsExporter;

public class TutorialServer {
    private static void setupOpencensusAndExporters throws IOException {
        String gcpProjectId = System.getenv().get("GCP_PROJECTID");
        if (gcpProjectId == null || gcpProjectId == "") {
            gcpProjectId = "census-demos";
        }

        // Register all the gRPC views and enable stats
        RpcViews.registerAllViews();

        // Create the Stackdriver stats exporter
        StackdriverStatsExporter.createAndRegister(
                StackdriverStatsConfiguration.builder()
                .setProjectId(gcpProjectId)
                .setExportInterval(Duration.create(5, 0))
                .build());
    }
}
{{</highlight>}}

{{<highlight java>}}
package io.octutorials.ocgrpc;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import io.grpc.stub.StreamObserver;

import io.opencensus.common.Duration;
import io.opencensus.contrib.grpc.metrics.RpcViews;

import io.opencensus.trace.Span;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.samplers.Samplers;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.config.TraceParams;

import io.opencensus.exporter.stats.stackdriver.StackdriverStatsConfiguration;
import io.opencensus.exporter.stats.stackdriver.StackdriverStatsExporter;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;

import io.octutorials.ocgrpc.Defs.Payload;
import io.octutorials.ocgrpc.FetchGrpc;

import com.google.protobuf.ByteString;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.lang.InterruptedException;

public class TutorialServer {
    private final int serverPort;
    private Server server;
    private static final Tracer tracer = Tracing.getTracer();

    public TutorialServer(int port) {
        this.serverPort = port;
    }

    static class FetchImpl extends FetchGrpc.FetchImplBase {
        @Override
        public void capitalize(Payload req, StreamObserver<Payload> responseObserver) {
            Scope ss = TutorialServer.tracer.spanBuilder("octutorials.FetchImpl.capitalize").startScopedSpan();

            try {
                String capitalized = req.getData().toString("UTF8").toUpperCase();
                ByteString bs = ByteString.copyFrom(capitalized.getBytes("UTF8"));
                Payload resp = Payload.newBuilder().setData(bs).build();
                responseObserver.onNext(resp);
            } catch (UnsupportedEncodingException e) {
            } finally {
                ss.close();
                responseObserver.onCompleted();
            }
        }
    }

    public void listenAndServe() throws IOException, InterruptedException {
        this.start();
        this.server.awaitTermination();
    }

    private void start() throws IOException {
        this.server = ServerBuilder.forPort(this.serverPort)
                        .addService(new FetchImpl())
                        .build()
                        .start();

        System.out.println("Server listening on " + this.serverPort);

        Server theServer = this.server;
        Runtime.getRuntime()
            .addShutdownHook(
                    new Thread() {
                        public void run() {
                            theServer.shutdown();
                        }
                    });
    }

    public void setupOpenCensusAndExporters() throws IOException {
        String gcpProjectId = System.getenv().get("GCP_PROJECTID");
        if (gcpProjectId == null || gcpProjectId == "") {
            gcpProjectId = "census-demos";
        }

        // Register all the gRPC views and enable stats
        RpcViews.registerAllViews();

        // Create the Stackdriver stats exporter
        StackdriverStatsExporter.createAndRegister(
                StackdriverStatsConfiguration.builder()
                .setProjectId(gcpProjectId)
                .setExportInterval(Duration.create(5, 0))
                .build());

        // For demo purposes, always sample
        TraceConfig traceConfig = Tracing.getTraceConfig();
        traceConfig.updateActiveTraceParams(
                traceConfig.getActiveTraceParams()
                    .toBuilder()
                    .setSampler(Samplers.alwaysSample())
                    .build());

        // Create the Stackdriver trace exporter
        StackdriverTraceExporter.createAndRegister(
                StackdriverTraceConfiguration.builder()
                .setProjectId(gcpProjectId)
                .build());
    }


    public static void main(String ...args) {
        TutorialServer tsrv = new TutorialServer(9876);

        try {
            tsrv.setupOpenCensusAndExporters();
        } catch (IOException e) {
            System.err.println("Failed to enable and toggle OpenCensus exporters: " + e);
            System.exit(-1);
        }

        try {
            tsrv.listenAndServe();
        } catch (IOException e) {
            System.err.println("Exception encountered while serving: " + e);
        } catch (InterruptedException e) {
            System.err.println("Caught an interrupt: " + e);
        } catch (Exception e) {
            System.err.println("Unhandled exception: " + e);
        }
    }
}
{{</highlight>}}

{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.octutorials</groupId>
    <artifactId>octutorials</artifactId>
    <packaging>jar</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>ocgrpc</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <opencensus.version>0.15.0</opencensus.version> <!-- The version of OpenCensus to use -->
        <grpc.version>1.12.0</grpc.version> <!-- The gRPC version to use with the version of OpenCensus -->
    </properties>

    <dependencies>
        <dependency>
            <groupId>io.grpc</groupId>
            <artifactId>grpc-netty</artifactId>
            <version>${grpc.version}</version>
        </dependency>

        <dependency>
            <groupId>io.grpc</groupId>
            <artifactId>grpc-protobuf</artifactId>
            <version>${grpc.version}</version>
        </dependency>

        <dependency>
            <groupId>io.grpc</groupId>
            <artifactId>grpc-stub</artifactId>
            <version>${grpc.version}</version>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-api</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-contrib-grpc-metrics</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-impl</artifactId>
            <version>${opencensus.version}</version>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-exporter-trace-stackdriver</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-exporter-stats-stackdriver</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>io.netty</groupId>
            <artifactId>netty-tcnative-boringssl-static</artifactId>
            <version>2.0.8.Final</version>
            <scope>runtime</scope>
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
                            <id>TutorialServer</id>
                            <mainClass>io.octutorials.ocgrpc.TutorialServer</mainClass>
                        </program>
                    </programs>
                </configuration>
            </plugin>

            <plugin>
                <groupId>org.xolstice.maven.plugins</groupId>
                <artifactId>protobuf-maven-plugin</artifactId>
                <version>0.5.0</version>
                <configuration>
                    <protocArtifact>com.google.protobuf:protoc:3.5.1-1:exe:${os.detected.classifier}</protocArtifact>
                    <pluginId>grpc-java</pluginId>
                    <pluginArtifact>io.grpc:protoc-gen-grpc-java:${grpc.version}:exe:${os.detected.classifier}</pluginArtifact>
                </configuration>

                <executions>
                    <execution>
                        <goals>
                            <goal>compile</goal>
                            <goal>compile-custom</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>com.google.protobuf</groupId>
                <artifactId>protobuf-java</artifactId>
                <version>3.6.1</version>
            </dependency>

            <dependency>
                <groupId>io.grpc</groupId>
                <artifactId>grpc-all</artifactId>
                <version>1.13.1</version>
            </dependency>

            <dependency>
                <groupId>io.netty</groupId>
                <artifactId>netty-all</artifactId>
                <version>4.1.28.Final</version>
            </dependency>
        </dependencies>
  </dependencyManagement>

</project>
{{</highlight>}}
{{</tabs>}}

##### Instrumenting the client

We'll instrument the client too by tracing as well as gRPC metrics using OpenCensus with imports such as:

Import|Purpose
---|---
io.opencensus.contrib.grpc.metrics.RpcViews|gRPC metrics
io.opencensus.trace.*|The tracing packages
io.opencensus.exporter.stats.stackdriver.*|The Stackdriver Stats exporter
io.opencensus.exporter.trace.stackdriver.*|The Stackdriver Tracing exporter

The subsequent code follows:

{{<tabs Traces Metrics Combined>}}
{{<highlight java>}}
package io.octutorials.ocgrpc;

import io.opencensus.common.Scope;
import io.opencensus.trace.Span;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.samplers.Samplers;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.config.TraceParams;

import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;

public class TutorialClient {
    private static final Tracer tracer = Tracing.getTracer();

    public String capitalize(String data) {
        Scope ss = TutorialClient.tracer.spanBuilder("octutorialsClient.capitalize").startScopedSpan();

        try {
            ByteString bs = ByteString.copyFrom(data.getBytes("UTF8"));
            Payload in = Payload.newBuilder().setData(bs).build();
            Payload out = this.stub.capitalize(in);
            return out.getData().toString("UTF8");
        } catch (UnsupportedEncodingException e) {
            return "";
        } catch (StatusRuntimeException e) {
            return "";
        } finally {
            ss.close();
        }
    }

    private static void setupOpencensusAndExporters throws IOException {
        String gcpProjectId = System.getenv().get("GCP_PROJECTID");
        if (gcpProjectId == null || gcpProjectId == "") {
            gcpProjectId = "census-demos";
        }

        // For demo purposes, always sample
        TraceConfig traceConfig = Tracing.getTraceConfig();
        traceConfig.updateActiveTraceParams(
                traceConfig.getActiveParams()
                    .toBuilder()
                    .setSample(Samplers.alwaysSample())
                    .build());

        // Create the Stackdriver trace exporter
        StackdriverTraceExporter.createAndRegister(
                StackdriverTraceConfiguration.builder()
                .setProjectId(gcpProjectId)
                .build());
    }
}
{{</highlight>}}

{{<highlight java>}}
package io.octutorials.ocgrpc;

import io.opencensus.common.Duration;
import io.opencensus.contrib.grpc.metrics.RpcViews;

import io.opencensus.exporter.stats.stackdriver.StackdriverStatsConfiguration;
import io.opencensus.exporter.stats.stackdriver.StackdriverStatsExporter;

public class TutorialClient {
    private static void setupOpencensusAndExporters throws IOException {
        String gcpProjectId = System.getenv().get("GCP_PROJECTID");
        if (gcpProjectId == null || gcpProjectId == "") {
            gcpProjectId = "census-demos";
        }

        // Register all the gRPC views and enable stats
        RpcViews.registerAllViews();

        // Create the Stackdriver stats exporter
        StackdriverStatsExporter.createAndRegister(
                StackdriverStatsConfiguration.builder()
                .setProjectId(gcpProjectId)
                .setExportInterval(Duration.create(5, 0))
                .build());
    }
}
{{</highlight>}}

{{<highlight java>}}
package io.octutorials.ocgrpc;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;

import io.opencensus.common.Duration;
import io.opencensus.common.Scope;
import io.opencensus.contrib.grpc.metrics.RpcViews;

import io.opencensus.trace.Span;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.samplers.Samplers;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.config.TraceParams;

import io.opencensus.exporter.stats.stackdriver.StackdriverStatsConfiguration;
import io.opencensus.exporter.stats.stackdriver.StackdriverStatsExporter;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;

import io.octutorials.ocgrpc.Defs.Payload;
import io.octutorials.ocgrpc.FetchGrpc;

import com.google.protobuf.ByteString;

import java.io.IOException;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.concurrent.TimeUnit;

public class TutorialClient {
    private final ManagedChannel channel;
    private final FetchGrpc.FetchBlockingStub stub;
    private static final Tracer tracer = Tracing.getTracer();

    public TutorialClient(String serverHost, int serverPort) {
        this.channel = ManagedChannelBuilder.forAddress(serverHost, serverPort)
            .usePlaintext(true)
            .build();
        this.stub = FetchGrpc.newBlockingStub(this.channel);
    }

    public void shutdown() throws InterruptedException {
        this.channel.shutdown().awaitTermination(4, TimeUnit.SECONDS);
    }

    public String capitalize(String data) {
        Scope ss = TutorialClient.tracer.spanBuilder("octutorialsClient.capitalize").startScopedSpan();

        try {
            ByteString bs = ByteString.copyFrom(data.getBytes("UTF8"));
            Payload in = Payload.newBuilder().setData(bs).build();
            Payload out = this.stub.capitalize(in);
            return out.getData().toString("UTF8");
        } catch (UnsupportedEncodingException e) {
            return "";
        } catch (StatusRuntimeException e) {
            return "";
        } finally {
            ss.close();
        }
    }

    public void setupOpenCensusAndExporters() throws IOException {
        String gcpProjectId = System.getenv().get("GCP_PROJECTID");
        if (gcpProjectId == null || gcpProjectId == "") {
            gcpProjectId = "census-demos";
        }

        // Register all the gRPC views and enable stats
        RpcViews.registerAllViews();

        // Create the Stackdriver stats exporter
        StackdriverStatsExporter.createAndRegister(
                StackdriverStatsConfiguration.builder()
                .setProjectId(gcpProjectId)
                .setExportInterval(Duration.create(5, 0))
                .build());

        // For demo purposes, always sample
        TraceConfig traceConfig = Tracing.getTraceConfig();
        traceConfig.updateActiveTraceParams(
                traceConfig.getActiveTraceParams()
                    .toBuilder()
                    .setSampler(Samplers.alwaysSample())
                    .build());

        // Create the Stackdriver trace exporter
        StackdriverTraceExporter.createAndRegister(
                StackdriverTraceConfiguration.builder()
                .setProjectId(gcpProjectId)
                .build());
    }

    public static void main(String ...args) {
        TutorialClient  cc = new TutorialClient("0.0.0.0", 9876);

        try {
            cc.setupOpenCensusAndExporters();
        } catch (IOException e) {
            System.err.println("Failed to enable and toggle OpenCensus exporters: " + e);
            System.exit(-1);
        }

        try {
            BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

            while (true) {
                System.out.print("> ");
                System.out.flush();
                String in = stdin.readLine();

                String out = cc.capitalize(in);
                System.out.println(String.format("< %s\n", out));
            }
        } catch (Exception e) {
        }
    }
}
{{</highlight>}}

{{</tabs>}}

And then to run the instrumented server and client in separate terminals

* Run the server
```shell
mvn exec:java -Dexec.mainClass=io.octutorials.ocgrpc.TutorialServer
```

* Run the client
```shell
mvn exec:java -Dexec.mainClass=io.octutorials.ocgrpc.TutorialClient
```

#### Examining traces
Please visit [https://console.cloud.google.com/traces/traces](https://console.cloud.google.com/traces/traces)

which will give visuals such as:

![Trace list](/images/ocgrpc-tutorial-java-overall-traces.png)

![Single trace details](/images/ocgrpc-tutorial-java-trace-details.png)

#### Examining metrics
Please visit [https://console.cloud.google.com/monitoring](https://console.cloud.google.com/monitoring)

which will give visuals such as:

* Available metrics
![](/images/ocgrpc-tutorial-java-server-available-metrics.png)
![](/images/ocgrpc-tutorial-java-client-available-metrics.png)

* Client latency
![](/images/ocgrpc-tutorial-java-client-latency-cumulative.png)

* Server latency
![](/images/ocgrpc-tutorial-java-server-latency-cumulative.png)
![](/images/ocgrpc-tutorial-java-server-latency-p99th.png)

#### References

Notes|Link
---|---
OpenCensus Java gRPC metrics|https://www.javadoc.io/doc/io.opencensus/opencensus-contrib-grpc-metrics
Trace JavaDoc|[io.opencensus.trace.*](https://static.javadoc.io/io.opencensus/opencensus-api/0.15.0/io/opencensus/trace/package-summary.html)
Stats JavaDoc|[io.opencensus.stats.*](https://static.javadoc.io/io.opencensus/opencensus-api/0.15.0/io/opencensus/stats/package-summary.html)
OpenCensus JavaDoc|[io.opencensus.*](https://www.javadoc.io/doc/io.opencensus/opencensus-api/)
OpenCensus Java exporters|[Some OpenCensus Java exporters](/supported-exporters/java/)
