---
title: "Tracing"
date: 2018-07-16T14:29:21-07:00
draft: false
class: "shadowed-image lightbox"
---

{{% notice note %}}
This guide makes use of Stackdriver for visualizing your data. For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

#### Table of contents

- [Requirements](#background)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Enable Tracing](#enable-tracing)
    - [Import Packages](#import-tracing-packages)
    - [Instrumentation](#instrument-tracing)
- [Exporting to Stackdriver](#exporting-to-stackdriver)
    - [Import Packages](#import-exporting-packages)
    - [Export Traces](#export-traces)
    - [Create Annotations](#create-annotations)
- [Viewing your Traces on Stackdriver](#viewing-your-traces-on-stackdriver)

In this quickstart, we’ll learn gleam insights into a segment of code and learn how to:

1. Trace the code using [OpenCensus Tracing](/core-concepts/tracing)
2. Register and enable an exporter for a [backend](http://localhost:1313/core-concepts/exporters/#supported-backends) of our choice
3. View traces on the backend of our choice

#### Requirements
- Java 8+
- Google Cloud Platform account anproject
- Google Stackdriver Tracing enabled on your project (Need help? [Click here](/codelabs/stackdriver))

#### Installation
```bash
mvn archetype:generate \
  -DgroupId=io.opencensus.quickstart \
  -DartifactId=repl-app \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DinteractiveMode=false \

cd repl-app/src/main/java/io/opencensus/quickstart

mv App.Java Repl.java
```
Put this in your newly generated `pom.xml` file:

```xml
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
        <opencensus.version>0.14.0</opencensus.version> <!-- The OpenCensus version to use -->
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
                                <mainClass>io.opencensus.quickstart.Repl</mainClass>
                            </program>
                        </programs>
                    </configuration>
                </plugin>
            </plugins>

        </pluginManagement>

    </build>
</project>
```

Put this in `src/main/java/io/opencensus/quickstart/Repl.java`:

{{<highlight java>}}
package io.opencensus.quickstart;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Repl {
    public static void main(String ...args) {
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                System.out.print("> ");
                System.out.flush();
                String line = stdin.readLine();
                String processed = processLine(line);
                System.out.println("< " + processed + "\n");
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static String processLine(String line) {
        return line.toUpperCase();
    }
}
{{</highlight>}}

Install required dependencies:
```bash
mvn install
```

#### Getting Started
Let's first run the application and see what we have.
```bash
mvn exec:java -Dexec.mainClass=io.opencensus.quickstart.Repl
```
We have ourselves a lower-to-UPPERCASE REPL. You should see something like this:
![java image 1](https://cdn-images-1.medium.com/max/1600/1*VFN-txsDL6qYkN_UH3VwhA.png)

Now, in preparation of tracing, lets abstract some of the core functionality in `main()` to a suite of helper functions:

{{<highlight java>}}
package io.opencensus.quickstart;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

public class Repl {
    public static void main(String ...args) {
        // Step 1. Our OpenCensus initialization will eventually go here

        // Step 2. The normal REPL.
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcess(stdin);
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

    private static void readEvaluateProcess(BufferedReader in) throws IOException {
        System.out.print("> ");
        System.out.flush();
        String line = readLine(in);
        String processed = processLine(line);
        System.out.println("< " + processed + "\n");
    }
}
{{</highlight>}}

#### Enable Tracing

##### Import Packages
To enable tracing, we’ll declare the dependencies in your `pom.xml` file:

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
    </dependency>
</dependencies>
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
        <opencensus.version>0.14.0</opencensus.version> <!-- The OpenCensus version to use -->
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
                                <id>Repl</id>
                                <mainClass>io.opencensus.quickstart.Repl</mainClass>
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

{{<tabs Snippet All>}}
{{<highlight java>}}
import io.opencensus.common.Scope;
import io.opencensus.trace.Span;
import io.opencensus.trace.Status;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
{{</highlight>}}

{{<highlight java>}}
package io.opencensus.quickstart;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

import io.opencensus.common.Scope;
import io.opencensus.trace.Span;
import io.opencensus.trace.Status;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;

public class Repl {
    public static void main(String ...args) {
        // Step 1. Our OpenCensus initialization will eventually go here

        // Step 2. The normal REPL.
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcess(stdin);
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

    private static void readEvaluateProcess(BufferedReader in) throws IOException {
        System.out.print("> ");
        System.out.flush();
        String line = readLine(in);
        String processed = processLine(line);
        System.out.println("< " + processed + "\n");
    }
}
{{</highlight>}}
{{</tabs>}}

##### Instrumentation
We will begin by creating a private static `Tracer` as a property of our Repl class.

```java
private static final Tracer TRACER = Tracing.getTracer();
```

We will be tracing the execution as it flows through `readEvaluateProcess`, `readLine`, and finally `processLine`.

To do this, we will create a [span](http://localhost:1313/core-concepts/tracing/#spans).

You can create a span by inserting the following line in each of the three functions:
```java
Scope ss = TRACER.spanBuilder("repl").startScopedSpan();
```

Here is our updated state of `Repl.java`:

```java
package io.opencensus.quickstart;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import io.opencensus.common.Scope;
import io.opencensus.trace.Span;
import io.opencensus.trace.Status;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;

public class Repl {
    private static final Tracer TRACER = Tracing.getTracer();

    public static void main(String ...args) {
        // Step 1. Our OpenCensus initialization will eventually go here

        // Step 2. The normal REPL.
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcess(stdin);
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static String processLine(String line) {
        try (Scope ss = TRACER.spanBuilder("processLine").startScopedSpan()) {
            return line.toUpperCase();
        }
    }

    private static String readLine(BufferedReader in) {
        Scope ss = TRACER.spanBuilder("readLine").startScopedSpan();

        String line = "";

        try {
            line = in.readLine();
        } catch (Exception e) {
            Span span = TRACER.getCurrentSpan();
            span.setStatus(Status.INTERNAL.withDescription(e.toString()));
        } finally {
            ss.close();
            return line;
        }
    }
}
```

#### Exporting to Stackdriver

##### Import Packages
To turn on Stackdriver Tracing, we’ll need to declare the Stackdriver dependency in your `pom.xml`:

{{<tabs Snippet All>}}
{{<highlight xml>}}
<dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-exporter-trace-stackdriver</artifactId>
    <version>${opencensus.version}</version>
</dependency>
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
        <opencensus.version>0.14.0</opencensus.version> <!-- The OpenCensus version to use -->
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
            <artifactId>opencensus-exporter-trace-stackdriver</artifactId>
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
                                <mainClass>io.opencensus.quickstart.Repl</mainClass>
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

{{<tabs Snippet All>}}
{{<highlight java>}}
import java.util.HashMap;
import java.util.Map;

import io.opencensus.trace.AttributeValue;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.samplers.Samplers;

import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;
{{</highlight>}}

{{<highlight java>}}
package io.opencensus.quickstart;

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

import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;

public class Repl {
    private static final Tracer TRACER = Tracing.getTracer();

    public static void main(String ...args) {
        // Step 1. Our OpenCensus initialization will eventually go here

        // Step 2. The normal REPL.
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcess(stdin);
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static String processLine(String line) {
        try (Scope ss = TRACER.spanBuilder("processLine").startScopedSpan()) {
            return line.toUpperCase();
        }
    }

    private static String readLine(BufferedReader in) {
        Scope ss = TRACER.spanBuilder("readLine").startScopedSpan();

        String line = "";

        try {
            line = in.readLine();
        } catch (Exception e) {
            Span span = TRACER.getCurrentSpan();
            span.setStatus(Status.INTERNAL.withDescription(e.toString()));
        } finally {
            ss.close();
            return line;
        }
    }
}
{{</highlight>}}
{{</tabs>}}

##### Export Traces

Now it is time to implement `Step 1: OpenCensus Initialization`!

We will create a function called `setupOpenCensusAndStackdriverExporter` and call it from our `main` function:

{{<tabs Snippet All>}}
{{<highlight java>}}
public static void main(String ...args) {
    // Step 1. Enable OpenCensus Tracing.
    try {
        setupOpenCensusAndStackdriverExporter();
    } catch (IOException e) {
        System.err.println("Failed to create and register OpenCensus Stackdriver Trace exporter "+ e);
        return;
    }

    //..
}
{{</highlight>}}

{{<highlight java>}}
package io.opencensus.quickstart;

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

import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;

public class Repl {
    private static final Tracer TRACER = Tracing.getTracer();

    public static void main(String ...args) {
        // Step 1. Enable OpenCensus Tracing.
        try {
            setupOpenCensusAndStackdriverExporter();
        } catch (IOException e) {
            System.err.println("Failed to create and register OpenCensus Stackdriver Trace exporter "+ e);
            return;
        }

        // Step 2. The normal REPL.
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcess(stdin);
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static String processLine(String line) {
        try (Scope ss = TRACER.spanBuilder("processLine").startScopedSpan()) {
            return line.toUpperCase();
        }
    }

    private static String readLine(BufferedReader in) {
        Scope ss = TRACER.spanBuilder("readLine").startScopedSpan();

        String line = "";

        try {
            line = in.readLine();
        } catch (Exception e) {
            Span span = TRACER.getCurrentSpan();
            span.setStatus(Status.INTERNAL.withDescription(e.toString()));
        } finally {
            ss.close();
            return line;
        }
    }
}
{{</highlight>}}
{{</tabs>}}

We will do three things in our `setupOpenCensusAndStackdriverExporter` function:

1. Set our [sampling rate](http://localhost:1313/core-concepts/tracing/#sampling)
```java
TraceConfig traceConfig = Tracing.getTraceConfig();
// For demo purposes, lets always sample.
traceConfig.updateActiveTraceParams(
        traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());
```

2. Retrieve our Google Cloud Project ID
```java
// Implementation will come later
String gcpProjectId = envOrAlternative("GCP_PROJECT_ID");
```

3. Export our Traces to Stackdriver
```java
StackdriverTraceExporter.createAndRegister(
        StackdriverTraceConfiguration.builder()
        .setProjectId(gcpProjectId)
        .build());
```

The function ends up looking like this:

{{<tabs Snippet All>}}
{{<highlight java>}}
private static void setupOpenCensusAndStackdriverExporter() throws IOException {
    TraceConfig traceConfig = Tracing.getTraceConfig();
    // For demo purposes, lets always sample.
    traceConfig.updateActiveTraceParams(
            traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

    String gcpProjectId = envOrAlternative("GCP_PROJECT_ID");

    StackdriverTraceExporter.createAndRegister(
            StackdriverTraceConfiguration.builder()
            .setProjectId(gcpProjectId)
            .build());
}
{{</highlight>}}

{{<highlight java>}}
package io.opencensus.quickstart;

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

import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;

public class Repl {
    private static final Tracer TRACER = Tracing.getTracer();

    public static void main(String ...args) {
        // Step 1. Enable OpenCensus Tracing.
        try {
            setupOpenCensusAndStackdriverExporter();
        } catch (IOException e) {
            System.err.println("Failed to create and register OpenCensus Stackdriver Trace exporter "+ e);
            return;
        }

        // Step 2. The normal REPL.
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcess(stdin);
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static String processLine(String line) {
        try (Scope ss = TRACER.spanBuilder("processLine").startScopedSpan()) {
            return line.toUpperCase();
        }
    }

    private static String readLine(BufferedReader in) {
        Scope ss = TRACER.spanBuilder("readLine").startScopedSpan();

        String line = "";

        try {
            line = in.readLine();
        } catch (Exception e) {
            Span span = TRACER.getCurrentSpan();
            span.setStatus(Status.INTERNAL.withDescription(e.toString()));
        } finally {
            ss.close();
            return line;
        }
    }

    private static void setupOpenCensusAndStackdriverExporter() throws IOException {
        TraceConfig traceConfig = Tracing.getTraceConfig();
        // For demo purposes, lets always sample.
        traceConfig.updateActiveTraceParams(
                traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

        String gcpProjectId = envOrAlternative("GCP_PROJECT_ID");

        StackdriverTraceExporter.createAndRegister(
                StackdriverTraceConfiguration.builder()
                .setProjectId(gcpProjectId)
                .build());
    }
}
{{</highlight>}}
{{</tabs>}}

Now we will handle our implementation of `envOrAlternative`:

{{<tabs Snippet All>}}
{{<highlight java>}}
private static String envOrAlternative(String key, String ...alternatives) {
  String value = System.getenv().get(key);
  if (value != null && value != "")
  return value;

  // Otherwise now look for the alternatives.
  for (String alternative : alternatives) {
    if (alternative != null && alternative != "") {
      value = alternative;
      break;
    }
  }

  return value;
}
{{</highlight>}}

{{<highlight java>}}
package io.opencensus.quickstart;

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

import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;

public class Repl {
    private static final Tracer TRACER = Tracing.getTracer();

    public static void main(String ...args) {
        // Step 1. Enable OpenCensus Tracing.
        try {
            setupOpenCensusAndStackdriverExporter();
        } catch (IOException e) {
            System.err.println("Failed to create and register OpenCensus Stackdriver Trace exporter "+ e);
            return;
        }

        // Step 2. The normal REPL.
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcess(stdin);
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static String processLine(String line) {
        try (Scope ss = TRACER.spanBuilder("processLine").startScopedSpan()) {
            return line.toUpperCase();
        }
    }

    private static String readLine(BufferedReader in) {
        Scope ss = TRACER.spanBuilder("readLine").startScopedSpan();

        String line = "";

        try {
            line = in.readLine();
        } catch (Exception e) {
            Span span = TRACER.getCurrentSpan();
            span.setStatus(Status.INTERNAL.withDescription(e.toString()));
        } finally {
            ss.close();
            return line;
        }
    }

    private static void setupOpenCensusAndStackdriverExporter() throws IOException {
        TraceConfig traceConfig = Tracing.getTraceConfig();
        // For demo purposes, lets always sample.
        traceConfig.updateActiveTraceParams(
                traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

        String gcpProjectId = envOrAlternative("GCP_PROJECT_ID");

        StackdriverTraceExporter.createAndRegister(
                StackdriverTraceConfiguration.builder()
                .setProjectId(gcpProjectId)
                .build());
    }

    private static String envOrAlternative(String key, String ...alternatives) {
      String value = System.getenv().get(key);
      if (value != null && value != "")
      return value;

      // Otherwise now look for the alternatives.
      for (String alternative : alternatives) {
        if (alternative != null && alternative != "") {
          value = alternative;
          break;
        }
      }

      return value;
    }
}
{{</highlight>}}
{{</tabs>}}


##### Create Annotations
When looking at our traces on a backend (such as Stackdriver), we can add metadata to our traces to increase our post-mortem insight.

Let's record the length of each requested string so that it is available to view when we are looking at our traces.

To do this, we'll dive in to `readEvaluateProcess`.

Between `String line = readLine(in)` and `String processed = processLine(line)`, add this:

```java
// Annotate the span to indicate we are invoking processLine next.
Map<String, AttributeValue> attributes = new HashMap<String, AttributeValue>();
attributes.put("len", AttributeValue.longAttributeValue(line.length()));
attributes.put("use", AttributeValue.stringAttributeValue("repl"));
Span span = TRACER.getCurrentSpan();
span.addAnnotation("Invoking processLine", attributes);
```

The final state of `Repl.java` should be this:

```java
package io.opencensus.quickstart;

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

import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;

public class Repl {
    private static final Tracer TRACER = Tracing.getTracer();

    public static void main(String ...args) {
        // Step 1. Enable OpenCensus Tracing.
        try {
            setupOpenCensusAndStackdriverExporter();
        } catch (IOException e) {
            System.err.println("Failed to create and register OpenCensus Stackdriver Trace exporter "+ e);
            return;
        }

        // Step 2. The normal REPL.
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcess(stdin);
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static String processLine(String line) {
        try (Scope ss = TRACER.spanBuilder("processLine").startScopedSpan()) {
            return line.toUpperCase();
        }
    }

    private static String readLine(BufferedReader in) {
        Scope ss = TRACER.spanBuilder("readLine").startScopedSpan();

        String line = "";

        try {
            line = in.readLine();
        } catch (Exception e) {
            Span span = TRACER.getCurrentSpan();
            span.setStatus(Status.INTERNAL.withDescription(e.toString()));
        } finally {
            ss.close();
            return line;
        }
    }

    private static void readEvaluateProcess(BufferedReader in) throws IOException {
        try (Scope ss = TRACER.spanBuilder("repl").startScopedSpan()) {
            System.out.print("> ");
            System.out.flush();
            String line = readLine(in);

            // Annotate the span to indicate we are invoking processLine next.
            Map<String, AttributeValue> attributes = new HashMap<String, AttributeValue>();
            attributes.put("len", AttributeValue.longAttributeValue(line.length()));
            attributes.put("use", AttributeValue.stringAttributeValue("repl"));
            Span span = TRACER.getCurrentSpan();
            span.addAnnotation("Invoking processLine", attributes);

            String processed = processLine(line);
            System.out.println("< " + processed + "\n");
        }
    }

    private static void setupOpenCensusAndStackdriverExporter() throws IOException {
        TraceConfig traceConfig = Tracing.getTraceConfig();
        // For demo purposes, lets always sample.
        traceConfig.updateActiveTraceParams(
                traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

        String gcpProjectId = envOrAlternative("GCP_PROJECT_ID");

        StackdriverTraceExporter.createAndRegister(
                StackdriverTraceConfiguration.builder()
                .setProjectId(gcpProjectId)
                .build());
    }

    private static String envOrAlternative(String key, String ...alternatives) {
        String value = System.getenv().get(key);
        if (value != null && value != "")
            return value;

        // Otherwise now look for the alternatives.
        for (String alternative : alternatives) {
            if (alternative != null && alternative != "") {
                value = alternative;
                break;
            }
        }

        return value;
    }
}
```

#### Viewing your Traces on Stackdriver
With the above you should now be able to navigate to the [Google Cloud Platform console](https://console.cloud.google.com/traces/traces), select your project, and view the traces.

![viewing traces 1](https://cdn-images-1.medium.com/max/1600/1*v7qiO8nX8WAxpX4LjiQ2oA.png)

And on clicking on one of the traces, we should be able to see the annotation whose description `isInvoking processLine` and on clicking on it, it should show our attributes `len` and `use`.

![viewing traces 2](https://cdn-images-1.medium.com/max/1600/1*SEsUxV1GXu-jM8dLQwtVMw.png)
