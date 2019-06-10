---
title: "Java"
weight: 1
aliases: [/core-concepts/zpages/java]
---

- [Dependency addition](#dependency-addition)
- [Source code example](#source-code-example)
- [Rpcz](#rpcz)
- [Statz](#statz)
- [Tracez](#tracez)
- [TraceConfigz](#traceconfigz)
- [References](#references)

### Dependency addition

Please add these dependencies to your project for Gradle and Maven respectively

{{<tabs Gradle Maven>}}
{{<highlight gradle>}}
compile 'io.opencensus:opencensus-api:0.16.1'
compile 'io.opencensus:opencensus-contrib-zpages:0.16.1'
runtime 'io.opencensus:opencensus-impl:0.16.1'
{{</highlight>}}

{{<highlight xml>}}
<dependencies>
  <dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-api</artifactId>
    <version>0.16.1</version>
  </dependency>
  <dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-contrib-zpages</artifactId>
    <version>0.16.1</version>
  </dependency>
  <dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-impl</artifactId>
    <version>0.16.1</version>
    <scope>runtime</scope>
  </dependency>
</dependencies>
{{</highlight>}}
{{</tabs>}}

### Source code example

{{<highlight java>}}
import io.opencensus.contrib.zpages.ZPageHandlers;

public class MyMainClass {
  public static void main(String[] args) throws Exception {
    ZPageHandlers.startHttpServerAndRegisterAll(8887);
    // ... do work
  }
}
{{</highlight>}}

#### Rpcz
/rpcz displays the canonical gRPC cumulative and interval stats broken down by RPC methods

On visiting http://localhost:8887/rpcz
![](/images/zpages-rpcz-example-java.png)

#### Statz
/statz displays measures and stats for all the exported views. Views are grouped into directories according to their namespace

On visiting http://localhost:8887/statz
![](/images/zpages-statsz-example-1-java.png)
![](/images/zpages-statsz-example-2-java.png)

#### Tracez
/tracez displays information aobut all the active spans and all the sampled spans based on latency and errors

On visiting http://localhost:8887/tracez
![](/images/zpages-tracez-example-java.png)

#### TraceConfigz
/tracez displays information about the current active tracing configuration and allows users to change it

On visiting http://localhost:8887/traceconfigz
![](/images/zpages-traceconfigz-example-java.png)

### References

Resource|URL
---|---
zPages JavaDoc|https://www.javadoc.io/doc/io.opencensus/opencensus-contrib-zpages/
zPages Java tutorial|https://github.com/census-instrumentation/opencensus-java/tree/master/contrib/zpages
