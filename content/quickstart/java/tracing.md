---
title: "Tracing"
date: 2018-07-16T14:29:21-07:00
draft: false
class: "shadowed-image lightbox"
---

- [Requirements](#requirements)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Enable Tracing](#enable-tracing)
    - [Import Packages](#import-tracing-packages)
    - [Instrumentation](#instrument-tracing)
- [Exporting traces](#exporting-traces)
    - [Initialize the exporter](#initialize-the-exporter)
    - [Export Traces](#export-traces)
    - [Create Annotations](#create-annotations)
- [End to end code](#end-to-end-code)
- [Viewing your traces](#viewing-your-traces)
- [References](#references)

In this quickstart, we’ll glean insights from code segments and learn how to:

1. Trace the code using [OpenCensus Tracing](/core-concepts/tracing)
2. Register and enable an exporter for a [backend](/core-concepts/exporters/#supported-backends) of our choice
3. View traces on the backend of our choice

## Requirements
- Java 8+
- [Apache Maven](https://maven.apache.org/install.html)
- Zipkin as our choice of tracing backend: we are picking it because it is free, open source and easy to setup

{{% notice tip %}}
For assistance setting up Zipkin, [Click here](/codelabs/zipkin) for a guided codelab.

You can swap out any other exporter from the [list of Java exporters](/guides/exporters/supported-exporters/java)
{{% /notice %}}

## Installation
We will first create our project directory, generate the `pom.xml`, and bootstrap our entry file.

```bash
mkdir repl-app
cd repl-app

touch pom.xml

mkdir -p src/main/java/io/opencensus/tracing/quickstart
touch src/main/java/io/opencensus/tracing/quickstart/Repl.java
```

Please add this content to your `pom.xml` file:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.opencensus.tracing.quickstart</groupId>
    <artifactId>quickstart</artifactId>
    <packaging>jar</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>quickstart</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <opencensus.version>0.17.0</opencensus.version> <!-- The OpenCensus version to use -->
    </properties>

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
                                <id>Repl</id>
                                <mainClass>io.opencensus.tracing.quickstart.Repl</mainClass>
                            </program>
                        </programs>
                    </configuration>
                </plugin>
            </plugins>

        </pluginManagement>

    </build>
</project>
```

Put this in `src/main/java/io/opencensus/tracing/quickstart/Repl.java`:

{{<highlight java>}}
package io.opencensus.tracing.quickstart;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

public class Repl {
    public static void main(String ...args) {
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcessLine(stdin);
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static String processLine(String line) {
        return line.toUpperCase();
    }

    private static String readLine(BufferedReader in) {
        String line = "";

        try {
            line = in.readLine();
        } catch (Exception e) {
            System.err.println("Failed to read line "+ e);
        } finally {
            return line;
        }
    }

    private static void readEvaluateProcessLine(BufferedReader in) throws IOException {
        System.out.print("> ");
        System.out.flush();
        String line = readLine(in);
        String processed = processLine(line);
        System.out.println("< " + processed + "\n");
    }
}
{{</highlight>}}

To install required dependencies, run this from your project's root directory:

```bash
# Make sure to be in your project's root directory
mvn install
```

## Getting Started
The Repl application takes input from users, converts any lower-case letters into upper-case letters, and echoes the result back to the user, for example:
```bash
> foo
< FOO
```

Let's first run the application and see what we have.
```bash
mvn exec:java -Dexec.mainClass=io.opencensus.tracing.quickstart.Repl
```

You will be given a text prompt. Try typing in a lowercase word and hit enter to receive the uppercase equivalent.

You should see something like this after a few runs:
![java image 1](https://cdn-images-1.medium.com/max/1600/1*VFN-txsDL6qYkN_UH3VwhA.png)

## Enable Tracing

<a name="import-tracing-packages"></a>
### Import Packages
To enable tracing, we’ll declare the dependencies in your `pom.xml` file. Insert the following code snippet after the `<properties>...</properties>` node:

{{<tabs Snippet All>}}
{{<highlight xml>}}
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
        <scope>runtime</scope>
    </dependency>
</dependencies>
{{</highlight>}}

{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.opencensus.tracing.quickstart</groupId>
    <artifactId>quickstart</artifactId>
    <packaging>jar</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>quickstart</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <opencensus.version>0.17.0</opencensus.version> <!-- The OpenCensus version to use -->
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

                <plugin>
                    <groupId>org.codehaus.mojo</groupId>
                    <artifactId>appassembler-maven-plugin</artifactId>
                    <version>1.10</version>
                    <configuration>
                        <programs>
                            <program>
                                <id>Repl</id>
                                <mainClass>io.opencensus.tracing.quickstart.Repl</mainClass>
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

We will now be importing modules into `Repl.java`. Append the following snippet after the existing import statements:

{{<highlight java>}}
import io.opencensus.common.Scope;
import io.opencensus.trace.Span;
import io.opencensus.trace.Status;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
{{</highlight>}}

### Instrumentation
We will begin by creating a private static `Tracer` as a property of our Repl class.

```java
private static final Tracer tracer = Tracing.getTracer();
```

We will be tracing the execution as it flows through `readEvaluateProcessLine`, `readLine`, and finally `processLine`.

To do this, we will create a [span](/core-concepts/tracing/#spans).

You can create a span by inserting the following line in each of the three functions:
```java
Scope ss = tracer.spanBuilder("repl").startScopedSpan();
```

Here is our updated state of `Repl.java`:

```java
package io.opencensus.tracing.quickstart;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import io.opencensus.common.Scope;
import io.opencensus.trace.Span;
import io.opencensus.trace.Status;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;

public class Repl {
    private static final Tracer tracer = Tracing.getTracer();

    public static void main(String ...args) {
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcessLine(stdin);
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static String processLine(String line) {
        try (Scope ss = tracer.spanBuilder("processLine").startScopedSpan()) {
            return line.toUpperCase();
        }
    }

    private static String readLine(BufferedReader in) {
        Scope ss = tracer.spanBuilder("readLine").startScopedSpan();

        String line = "";

        try {
            line = in.readLine();
        } catch (Exception e) {
            Span span = tracer.getCurrentSpan();
            span.setStatus(Status.INTERNAL.withDescription(e.toString()));
        } finally {
            ss.close();
            return line;
        }
    }

    private static void readEvaluateProcessLine(BufferedReader in) throws IOException {
        System.out.print("> ");
        System.out.flush();
        String line = readLine(in);
        String processed = processLine(line);
        System.out.println("< " + processed + "\n");
    }
}
```

## Exporting traces

### Initialize the exporter
To enable trace exporting to Zipkin, we’ll need to declare the Zipkin exporter dependency in your `pom.xml`. Add the following code snippet inside of your `<dependencies>` node:

{{<tabs Snippet All>}}
{{<highlight xml>}}
<dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-exporter-trace-zipkin</artifactId>
    <version>${opencensus.version}</version>
</dependency>
{{</highlight>}}

{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.opencensus.tracing.quickstart</groupId>
    <artifactId>quickstart</artifactId>
    <packaging>jar</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>quickstart</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <opencensus.version>0.17.0</opencensus.version> <!-- The OpenCensus version to use -->
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
            <scope>runtime</scope>
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

                <plugin>
                    <groupId>org.codehaus.mojo</groupId>
                    <artifactId>appassembler-maven-plugin</artifactId>
                    <version>1.10</version>
                    <configuration>
                        <programs>
                            <program>
                                <id>Repl</id>
                                <mainClass>io.opencensus.tracing.quickstart.Repl</mainClass>
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

Now add the import statements to your `Repl.java`:

{{<highlight java>}}
import java.util.HashMap;
import java.util.Map;

import io.opencensus.trace.AttributeValue;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.samplers.Samplers;

import io.opencensus.exporter.trace.zipkin.ZipkinTraceExporter;
{{</highlight>}}

### Export Traces
We will create a function called `setupOpenCensusAndZipkinExporter` and call it from our `main` function:

{{<tabs Snippet All>}}
{{<highlight java>}}
public static void main(String ...args) {
    try {
        setupOpenCensusAndZipkinExporter();
    } catch (IOException e) {
        System.err.println("Failed to create and register OpenCensus Zipkin Trace exporter "+ e);
        return;
    }

    //..
}
{{</highlight>}}

{{<highlight java>}}
package io.opencensus.tracing.quickstart;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

import io.opencensus.common.Scope;
import io.opencensus.trace.AttributeValue;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.samplers.Samplers;
import io.opencensus.trace.Span;
import io.opencensus.trace.Status;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;

import io.opencensus.exporter.trace.zipkin.ZipkinTraceExporter;

public class Repl {
    private static final Tracer tracer = Tracing.getTracer();

    public static void main(String ...args) {
        try {
            setupOpenCensusAndZipkinExporter();
        } catch (IOException e) {
            System.err.println("Failed to create and register OpenCensus Zipkin Trace exporter "+ e);
            return;
        }

        // Step 2. The normal REPL.
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcessLine(stdin);
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static String processLine(String line) {
        try (Scope ss = tracer.spanBuilder("processLine").startScopedSpan()) {
            return line.toUpperCase();
        }
    }

    private static String readLine(BufferedReader in) {
        Scope ss = tracer.spanBuilder("readLine").startScopedSpan();

        String line = "";

        try {
            line = in.readLine();
        } catch (Exception e) {
            Span span = tracer.getCurrentSpan();
            span.setStatus(Status.INTERNAL.withDescription(e.toString()));
        } finally {
            ss.close();
            return line;
        }
    }

    private static void readEvaluateProcessLine(BufferedReader in) throws IOException {
        System.out.print("> ");
        System.out.flush();
        String line = readLine(in);
        String processed = processLine(line);
        System.out.println("< " + processed + "\n");
    }
}
{{</highlight>}}
{{</tabs>}}

We will do 2 things in our `setupOpenCensusAndZipkinExporter` function:

1. Set our [sampling rate](/core-concepts/tracing/#sampling)
```java
TraceConfig traceConfig = Tracing.getTraceConfig();
// For demo purposes, lets always sample.
traceConfig.updateActiveTraceParams(
        traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());
```

2. Export our Traces to Zipkin:
For this we'll initialize the Zipkin exporter which will send traces to the endpoint that the Zipkin server is running
```java
ZipkinTraceExporter.createAndRegister("http://localhost:9411/api/v2/spans", "ocjavaquickstart");
```

The function ends up looking like this:

{{<tabs Snippet All>}}
{{<highlight java>}}
private static void setupOpenCensusAndZipkinExporter() throws IOException {
    TraceConfig traceConfig = Tracing.getTraceConfig();
    // For demo purposes, lets always sample.
    traceConfig.updateActiveTraceParams(
            traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

    ZipkinTraceExporter.createAndRegister("http://localhost:9411/api/v2/spans", "ocjavaquickstart");
}
{{</highlight>}}

{{<highlight java>}}
package io.opencensus.tracing.quickstart;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

import io.opencensus.common.Scope;
import io.opencensus.trace.AttributeValue;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.samplers.Samplers;
import io.opencensus.trace.Span;
import io.opencensus.trace.Status;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;

import io.opencensus.exporter.trace.zipkin.ZipkinTraceExporter;

public class Repl {
    private static final Tracer tracer = Tracing.getTracer();

    public static void main(String ...args) {
        try {
            setupOpenCensusAndZipkinExporter();
        } catch (IOException e) {
            System.err.println("Failed to create and register OpenCensus Zipkin Trace exporter "+ e);
            return;
        }

        // Step 2. The normal REPL.
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcessLine(stdin);
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static String processLine(String line) {
        try (Scope ss = tracer.spanBuilder("processLine").startScopedSpan()) {
            return line.toUpperCase();
        }
    }

    private static String readLine(BufferedReader in) {
        Scope ss = tracer.spanBuilder("readLine").startScopedSpan();

        String line = "";

        try {
            line = in.readLine();
        } catch (Exception e) {
            Span span = tracer.getCurrentSpan();
            span.setStatus(Status.INTERNAL.withDescription(e.toString()));
        } finally {
            ss.close();
            return line;
        }
    }

    private static void readEvaluateProcessLine(BufferedReader in) throws IOException {
        System.out.print("> ");
        System.out.flush();
        String line = readLine(in);
        String processed = processLine(line);
        System.out.println("< " + processed + "\n");
    }

    private static void setupOpenCensusAndZipkinExporter() throws IOException {
        TraceConfig traceConfig = Tracing.getTraceConfig();
        // For demo purposes, lets always sample.
        traceConfig.updateActiveTraceParams(
                traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

        ZipkinTraceExporter.createAndRegister("http://localhost:9411/api/v2/spans", "ocjavaquickstart");
    }
}
{{</highlight>}}
{{</tabs>}}

### Create Annotations
When looking at our traces on a backend (such as Zipkin as we have used), we can add metadata to our traces to increase our post-mortem insight.

Let's record the length of each requested string so that it is available to view when we are looking at our traces.

To do this, we'll dive in to `readEvaluateProcessLine`.

Between `String line = readLine(in)` and `String processed = processLine(line)`, add this:

```java
// Annotate the span to indicate we are invoking processLine next.
Map<String, AttributeValue> attributes = new HashMap<String, AttributeValue>();
attributes.put("len", AttributeValue.longAttributeValue(line.length()));
attributes.put("use", AttributeValue.stringAttributeValue("repl"));
Span span = tracer.getCurrentSpan();
span.addAnnotation("Invoking processLine", attributes);
```

## End to end code

Collectively the final versions of `src/main/java/io/opencensus/tracing/quickstart/Repl.java` and `pom.xml` should be as in the tabs below:

{{<tabs Repl_Java pom_xml>}}
{{<highlight java>}}
package io.opencensus.tracing.quickstart;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

import io.opencensus.common.Scope;
import io.opencensus.trace.AttributeValue;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.samplers.Samplers;
import io.opencensus.trace.Span;
import io.opencensus.trace.Status;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;

import io.opencensus.exporter.trace.zipkin.ZipkinTraceExporter;

public class Repl {
    private static final Tracer tracer = Tracing.getTracer();

    public static void main(String ...args) {
        try {
            setupOpenCensusAndZipkinExporter();
        } catch (IOException e) {
            System.err.println("Failed to create and register OpenCensus Zipkin Trace exporter "+ e);
            return;
        }

        // Step 2. The normal REPL.
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcessLine(stdin);
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static String processLine(String line) {
        try (Scope ss = tracer.spanBuilder("processLine").startScopedSpan()) {
            return line.toUpperCase();
        }
    }

    private static String readLine(BufferedReader in) {
        Scope ss = tracer.spanBuilder("readLine").startScopedSpan();

        String line = "";

        try {
            line = in.readLine();
        } catch (Exception e) {
            Span span = tracer.getCurrentSpan();
            span.setStatus(Status.INTERNAL.withDescription(e.toString()));
        } finally {
            ss.close();
            return line;
        }
    }

    private static void readEvaluateProcessLine(BufferedReader in) throws IOException {
        try (Scope ss = tracer.spanBuilder("repl").startScopedSpan()) {
            System.out.print("> ");
            System.out.flush();
            String line = readLine(in);

            // Annotate the span to indicate we are invoking processLine next.
            Map<String, AttributeValue> attributes = new HashMap<String, AttributeValue>();
            attributes.put("len", AttributeValue.longAttributeValue(line.length()));
            attributes.put("use", AttributeValue.stringAttributeValue("repl"));
            Span span = tracer.getCurrentSpan();
            span.addAnnotation("Invoking processLine", attributes);

            String processed = processLine(line);
            System.out.println("< " + processed + "\n");
        }
    }

    private static void setupOpenCensusAndZipkinExporter() throws IOException {
        TraceConfig traceConfig = Tracing.getTraceConfig();
        // For demo purposes, lets always sample.
        traceConfig.updateActiveTraceParams(
                traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

        ZipkinTraceExporter.createAndRegister("http://localhost:9411/api/v2/spans", "ocjavaquickstart");
    }
}
{{</highlight>}}
{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.opencensus.tracing.quickstart</groupId>
    <artifactId>quickstart</artifactId>
    <packaging>jar</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>quickstart</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <opencensus.version>0.17.0</opencensus.version> <!-- The OpenCensus version to use -->
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
            <scope>runtime</scope>
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

                <plugin>
                    <groupId>org.codehaus.mojo</groupId>
                    <artifactId>appassembler-maven-plugin</artifactId>
                    <version>1.10</version>
                    <configuration>
                        <programs>
                            <program>
                                <id>Repl</id>
                                <mainClass>io.opencensus.tracing.quickstart.Repl</mainClass>
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

## Running the code

Having already successfully started Zipkin as in [Zipkin Codelab](/codelabs/zipkin), we can now run our code by

```shell
mvn install
mvn exec:java -Dexec.mainClass=io.opencensus.tracing.quickstart.Repl
```
## Viewing your traces
With the above you should now be able to navigate to the Zipkin UI at http://localhost:9411

which will produce such a screenshot:
![](/images/trace-java-zipkin-all-traces.png)

And on clicking on one of the traces, we should be able to see the annotation whose description `isInvoking processLine`
![](/images/trace-java-zipkin-single-trace.png)

whose annotation looks like
![](/images/trace-java-zipkin-annotation.png)

And on clicking on `More info` we should see
![](/images/trace-java-zipkin-all-details.png)

## References

Resource|URL
---|---
Zipkin project|https://zipkin.io/
Setting up Zipkin|[Zipkin Codelab](/codelabs/zipkin)
Zipkin Java exporter|https://www.javadoc.io/doc/io.opencensus/opencensus-exporter-trace-zipkin
Java exporters|[Java exporters](/guides/exporters/supported-exporters/java)
OpenCensus Java Trace package|https://www.javadoc.io/doc/io.opencensus/opencensus-api/
