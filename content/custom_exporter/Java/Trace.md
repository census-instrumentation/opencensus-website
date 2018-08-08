---
title: "Trace exporter"
draft: false
weight: 3
---

### Table of contents
- [Introduction](#introduction)
- [Implementation](#implementation)
- [Runnable example](#runnable-example)
- [Notes](#notes)
- [References](#references)

#### Introduction

A trace exporter must extend the abstract class [SpanExporter.Handler](https://static.javadoc.io/io.opencensus/opencensus-api/0.15.0/io/opencensus/trace/export/SpanExporter.Handler.html) implementing the `export` method

which for purposes of brevity is:

```java
import java.util.Collection;

import io.opencensus.trace.export.SpanData;

public void export(Collection<SpanData> spanDataList);
```

The sole method `export` will be used to process and translate a collection of [SpanData](https://static.javadoc.io/io.opencensus/opencensus-api/0.15.0/io/opencensus/trace/export/SpanData.html) to your desired trace backend's data.

After an exporter is created, it must be registered with [SpanExporter.registerHandler](https://static.javadoc.io/io.opencensus/opencensus-api/0.15.0/io/opencensus/trace/export/SpanExporter.html#registerHandler-java.lang.String-io.opencensus.trace.export.SpanExporter.Handler-)

```java
SpanExporter.registerHandler(nameOfTheExporter, anInstanceOfTheExporter);
```

#### Implementation

For example, let's make a custom trace exporter that will print span data to standard output.

Inside file `src/main/java/oc/tutorials/CustomTraceExporter.java` we'll write the following code

```java
package oc.tutorials;

import java.util.Collection;

import io.opencensus.trace.SpanContext;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.export.SpanData;
import io.opencensus.trace.export.SpanExporter;

public class CustomTraceExporter extends SpanExporter.Handler {
    @Override
    public void export(Collection<SpanData> spanDataList) {
        for (SpanData sd : spanDataList) {
            SpanContext sc = sd.getContext();
            System.out.println(String.format(
                "Name: %s\nTraceID: %s\nSpanID: %s\nParentSpanID: %s\nStartTime: %d\nEndTime: %d\nAnnotations: %s\n\n",
                    sd.getName(), sc.getTraceId(), sc.getSpanId(), sd.getParentSpanId(),
                    sd.getStartTimestamp().getSeconds(), sd.getEndTimestamp().getSeconds(), sd.getAnnotations()));
        }
    }

    public static void createAndRegister() {
        // Please remember to register your exporter
        // so that it can receive exportered spanData.
        Tracing.getExportComponent().getSpanExporter().registerHandler(CustomTraceExporter.class.getName(), new CustomTraceExporter());
    }
}
```

#### Runnable example

With the previous implementation, here is a fully runnable example, that we'll run using Maven.

{{<tabs Java_Code pom_xml>}}
{{<highlight java>}}
package oc.tutorials;

import java.util.Collection;

import io.opencensus.common.Scope;
import io.opencensus.trace.Span;
import io.opencensus.trace.SpanContext;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.export.SpanData;
import io.opencensus.trace.export.SpanExporter;
import io.opencensus.trace.samplers.Samplers;

public class CustomTraceExporter extends SpanExporter.Handler {
    private static Tracer tracer = Tracing.getTracer();

    public static void main(String ...args) {
        // Firstly create and register the exporter
        CustomTraceExporter.createAndRegister();

        // For demo purposes, we'll always sample
        TraceConfig traceConfig = Tracing.getTraceConfig();
        traceConfig.updateActiveTraceParams(
                traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

        // Do some work
        for (int i = 0; i < 5; i++) {
            String name = String.format("sample-%d", i);
            Scope ss = tracer.spanBuilder(name).startScopedSpan();
            tracer.getCurrentSpan().addAnnotation("This annotation is for " + name);
            sleep(200); // Sleep for 200 milliseconds
            ss.close();
        }

        sleep(8000); // Sleep for 8 seconds to give exporting time to complete
        System.exit(0);
    }

    @Override
    public void export(Collection<SpanData> spanDataList) {
        for (SpanData sd : spanDataList) {
            SpanContext sc = sd.getContext();
            System.out.println(String.format(
                "Name: %s\nTraceID: %s\nSpanID: %s\nParentSpanID: %s\nStartTime: %d\nEndTime: %d\nAnnotations: %s\n\n",
                    sd.getName(), sc.getTraceId(), sc.getSpanId(), sd.getParentSpanId(),
                    sd.getStartTimestamp().getSeconds(), sd.getEndTimestamp().getSeconds(), sd.getAnnotations()));
        }
    }

    public static void createAndRegister() {
        // Please remember to register your exporter
        // so that it can receive exportered spanData.
        Tracing.getExportComponent().getSpanExporter().registerHandler(CustomTraceExporter.class.getName(), new CustomTraceExporter());
    }

    private static void sleep(int ms) {
        // A helper to avoid try-catch when invoking Thread.sleep so that
        // sleeps can be succinct and not permeated by exception handling.
        try {
            Thread.sleep(ms);
        } catch(Exception e) {
            System.err.println(String.format("Failed to sleep for %dms. Exception: %s", ms, e));
        }
    }
}
{{</highlight>}}

{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>oc.tutorial</groupId>
    <artifactId>tracetutorial</artifactId>
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

                <plugin>
                    <groupId>org.codehaus.mojo</groupId>
                    <artifactId>appassembler-maven-plugin</artifactId>
                    <version>1.10</version>
                    <configuration>
                        <programs>
                            <program>
                                <id>CustomTraceExporter</id>
                                <mainClass>oc.tutorials.CustomTraceExporter</mainClass>
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

will print out something like this
```shell
$ mvn exec:java -Dexec.mainClass=oc.tutorials.CustomTraceExporter
Name: sample-0
TraceID: TraceId{traceId=1cdffe16132f7682f94b1777da7b41c7}
SpanID: SpanId{spanId=e7c7c30546527d21}
ParentSpanID: null
StartTime: 1533768923
EndTime: 1533768923
Annotations: TimedEvents{events=[TimedEvent{timestamp=Timestamp{seconds=1533768923, nanos=227544959}, event=Annotation{description=This annotation is for sample-0, attributes={}}}], droppedEventsCount=0}


Name: sample-1
TraceID: TraceId{traceId=3c4af55e485cd5b6bc8b2c45042f0458}
SpanID: SpanId{spanId=1e9a9ebe862f1a05}
ParentSpanID: null
StartTime: 1533768923
EndTime: 1533768923
Annotations: TimedEvents{events=[TimedEvent{timestamp=Timestamp{seconds=1533768923, nanos=431021767}, event=Annotation{description=This annotation is for sample-1, attributes={}}}], droppedEventsCount=0}


Name: sample-2
TraceID: TraceId{traceId=e20a916fed0ce71e9645f2ee1dde6cfd}
SpanID: SpanId{spanId=2ce49605d29994c1}
ParentSpanID: null
StartTime: 1533768923
EndTime: 1533768923
Annotations: TimedEvents{events=[TimedEvent{timestamp=Timestamp{seconds=1533768923, nanos=633038726}, event=Annotation{description=This annotation is for sample-2, attributes={}}}], droppedEventsCount=0}


Name: sample-3
TraceID: TraceId{traceId=1dbb12d52d7d03a75c5a28612bd46b30}
SpanID: SpanId{spanId=dfad460a90b67623}
ParentSpanID: null
StartTime: 1533768923
EndTime: 1533768924
Annotations: TimedEvents{events=[TimedEvent{timestamp=Timestamp{seconds=1533768923, nanos=833034459}, event=Annotation{description=This annotation is for sample-3, attributes={}}}], droppedEventsCount=0}


Name: sample-4
TraceID: TraceId{traceId=4991fe623a155ef9913bd5e9dc8f1ee8}
SpanID: SpanId{spanId=a2d301f9e8f0cbc8}
ParentSpanID: null
StartTime: 1533768924
EndTime: 1533768924
Annotations: TimedEvents{events=[TimedEvent{timestamp=Timestamp{seconds=1533768924, nanos=34021598}, event=Annotation{description=This annotation is for sample-4, attributes={}}}], droppedEventsCount=0}


```

#### Notes

* Please remember to invoke [SpanExporter.registerHandler](https://static.javadoc.io/io.opencensus/opencensus-api/0.15.0/io/opencensus/trace/export/SpanExporter.html#registerHandler-java.lang.String-io.opencensus.trace.export.SpanExporter.Handler-) for your created Trace exporter lest it won't receive exported span data 

* Your exporter's `export` method will receive exported span data only for spans that have been ended

#### References

Name|Link
---|---
Trace JavaDoc |[io.opencensus.trace.*](https://static.javadoc.io/io.opencensus/opencensus-api/0.15.0/io/opencensus/trace/package-summary.html)
OpenCensus JavaDoc|[io.opencensus.*](https://www.javadoc.io/doc/io.opencensus/opencensus-api/)
OpenCensus Java exporters|[Some OpenCensus Java exporters](/supported-exporters/java/)
