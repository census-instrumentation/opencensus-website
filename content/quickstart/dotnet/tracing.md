---
title: "Tracing"
date: 2019-01-07T00:01:21-07:00
draft: false
class: "shadowed-image lightbox"
---

- [Prerequisites](#prerequisites)
- [Run it locally](#run-it-locally)
- [Configure Exporter](#configure-exporter)
- [Configure Sampler](#configure-sampler)
- [Using the Tracer](#using-the-tracer)
- [Create a Span](#create-a-span)
- [Create a Child Span](#create-a-child-span)
- [Shutdown the Tracer](#shutdown-the-tracer)
- [References](#references)

#### Prerequisites

1. [.NET Core 2.0+](https://dotnet.microsoft.com/download/dotnet-core/2.1) .NET Framework 4.6.1+ is also supported.
2. [Docker for Desktop](https://www.docker.com/products/docker-desktop)

#### Run it locally

1. Clone the Opencensus C# repository: `git clone https://github.com/census-instrumentation/opencensus-csharp.git`
2. Change to the example directory: `cd src/Samples`
3. Build the sample by `dotnet build`
4. Run Zipkin in Docker container: `docker run -d -p 9411:9411 openzipkin/zipkin`
5. If you don't have "Docker for Desktop" installed, follow this: `https://zipkin.io/pages/quickstart`
6. `dotnet run zipkin --uri=http://localhost:9411/api/v2/spans`
7. Navigate to Zipkin Web UI: `http://localhost:9411`
8. Click _Find Traces_, and you should see a trace.
9. Click into that, and you should see the details.

![](/images/java-tracing-zipkin.png)

#### How does it work

{{% tabs Snippet All %}}
```csharp
internal static object Run(string zipkinUri)
{
    // 1. Configure exporter to export traces to Zipkin
    var exporter = new ZipkinTraceExporter(
        new ZipkinTraceExporterOptions()
        {
            Endpoint = new Uri(zipkinUri),
            ServiceName = "tracing-to-zipkin-service",
        },
        Tracing.ExportComponent);
    exporter.Start();

    // 2. Configure 100% sample rate for the purposes of the demo
    ITraceConfig traceConfig = Tracing.TraceConfig;
    ITraceParams currentConfig = traceConfig.ActiveTraceParams;
    var newConfig = currentConfig.ToBuilder()
        .SetSampler(Samplers.AlwaysSample)
        .Build();
    traceConfig.UpdateActiveTraceParams(newConfig);

    // 3. Tracer is global singleton. You can register it via dependency injection if it exists
    // but if not - you can use it as follows:
    var tracer = Tracing.Tracer;

    // 4. Create a scoped span. It will end automatically when using statement ends
    using (var scope = tracer.SpanBuilder("Main").StartScopedSpan())
    {
        Console.WriteLine("About to do a busy work");
        for (int i = 0; i < 10; i++)
        {
            DoWork(i);
        }
    }

    // 5. Gracefully shutdown the exporter so it'll flush queued traces to Zipkin.
    Tracing.ExportComponent.SpanExporter.Dispose();

    return null;
}
```

```csharp
namespace Samples
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using OpenCensus.Exporter.Zipkin;
    using OpenCensus.Trace;
    using OpenCensus.Trace.Config;
    using OpenCensus.Trace.Sampler;

    internal class TestZipkin
    {
        internal static object Run(string zipkinUri)
        {
            // 1. Configure exporter to export traces to Zipkin
            var exporter = new ZipkinTraceExporter(
                new ZipkinTraceExporterOptions()
                {
                    Endpoint = new Uri(zipkinUri),
                    ServiceName = "tracing-to-zipkin-service",
                },
                Tracing.ExportComponent);
            exporter.Start();

            // 2. Configure 100% sample rate for the purposes of the demo
            ITraceConfig traceConfig = Tracing.TraceConfig;
            ITraceParams currentConfig = traceConfig.ActiveTraceParams;
            var newConfig = currentConfig.ToBuilder()
                .SetSampler(Samplers.AlwaysSample)
                .Build();
            traceConfig.UpdateActiveTraceParams(newConfig);

            // 3. Tracer is global singleton. You can register it via dependency injection if it exists
            // but if not - you can use it as follows:
            var tracer = Tracing.Tracer;

            // 4. Create a scoped span. It will end automatically when using statement ends
            using (var scope = tracer.SpanBuilder("Main").StartScopedSpan())
            {
                Console.WriteLine("About to do a busy work");
                for (int i = 0; i < 10; i++)
                {
                    DoWork(i);
                }
            }

            // 5. Gracefully shutdown the exporter so it'll flush queued traces to Zipkin.
            Tracing.ExportComponent.SpanExporter.Dispose();

            return null;
        }

        private static void DoWork(int i)
        {
            // 6. Get the global singleton Tracer object
            ITracer tracer = Tracing.Tracer;

            // 7. Start another span. If another span was already started, it'll use that span as the parent span.
            // In this example, the main method already started a span, so that'll be the parent span, and this will be
            // a child span.
            using (OpenCensus.Common.IScope scope = tracer.SpanBuilder("DoWork").StartScopedSpan())
            {
                // Simulate some work.
                ISpan span = tracer.CurrentSpan;

                try
                {
                    Console.WriteLine("Doing busy work");
                    Thread.Sleep(1000);
                }
                catch (ArgumentOutOfRangeException e)
                {
                    // 6. Set status upon error
                    span.Status = Status.Internal.WithDescription(e.ToString());
                }

                // 7. Annotate our span to capture metadata about our operation
                var attributes = new Dictionary<string, IAttributeValue>();
                attributes.Add("use", AttributeValue.StringAttributeValue("demo"));
                span.AddAnnotation("Invoking DoWork", attributes);
            }
        }
    }
}
```
{{% /tabs %}}

#### Configure Exporter

OpenCensus can export traces to different distributed tracing stores \(such as Zipkin, Jeager, Stackdriver Trace\). In \(1\), we configure OpenCensus to export to Zipkin, which is listening on `localhost` port `9411`, and all of the traces from this program will be associated with a service name `tracing-to-zipkin-service`.

```java
// 1. Configure exporter to export traces to Zipkin.
ZipkinTraceExporter.createAndRegister(
    "http://localhost:9411/api/v2/spans", "tracing-to-zipkin-service");
```

You can export trace data to different backends. Learn more in [OpenCensus Supported Exporters](../../exporters/supported-exporters/).

#### Configure Sampler

Configure 100% sample rate, otherwise, few traces will be sampled.

```csharp
// 2. Configure 100% sample rate, otherwise, few traces will be sampled.
ITraceConfig traceConfig = Tracing.TraceConfig;
ITraceParams currentConfig = traceConfig.ActiveTraceParams;
var newConfig = currentConfig.ToBuilder()
    .SetSampler(Samplers.AlwaysSample)
    .Build();
traceConfig.UpdateActiveTraceParams(newConfig);
```

There are multiple ways to configure how OpenCensus sample traces. Learn more in  [OpenCensus Sampling](../../tracing/sampling.md).

#### Using the Tracer

To start a trace, you first need to get a reference to the `Tracer` \(3\). It can be retrieved as a global singleton.

```csharp
// 3. Tracer is global singleton. You can register it via dependency injection if it exists
// but if not - you can use it as follows:
var tracer = Tracing.Tracer;
```

#### Create a Span

To create a span in a trace, we used the `Tracer` to start a new span \(4\). A span must be closed in order to mark the end of the span. A scoped span \(`Scope`\) implements `IDisposable`, so when used within a `using` block, the span will be closed automatically when exiting the block.

```csharp
// 4. Create a scoped span, a scoped span will automatically end when closed.
// It implements AutoClosable, so it'll be closed when the try block ends.
using (var scope = tracer.SpanBuilder("Main").StartScopedSpan())
{
    Console.WriteLine("About to do a busy work");
    for (int i = 0; i < 10; i++)
    {
        DoWork(i);
    }
}
```

#### Create a Child Span

The `Run` method calls `DoWork` a number of times. Each invocation also generates a child span. Take a look at `DoWork`method.

```csharp
private static void DoWork(int i)
{
    // 6. Get the global singleton Tracer object
    ITracer tracer = Tracing.Tracer;

    // 7. Start another span. If another span was already started, it'll use that span as the parent span.
    // In this example, the main method already started a span, so that'll be the parent span, and this will be
    // a child span.
    using (OpenCensus.Common.IScope scope = tracer.SpanBuilder("DoWork").StartScopedSpan())
    {
        // Simulate some work.
        ISpan span = tracer.CurrentSpan;

        try
        {
            Console.WriteLine("Doing busy work");
            Thread.Sleep(1000);
        }
        catch (ArgumentOutOfRangeException e)
        {
            // 6. Set status upon error
            span.Status = Status.Internal.WithDescription(e.ToString());
        }

        // 7. Annotate our span to capture metadata about our operation
        var attributes = new Dictionary<string, IAttributeValue>();
        attributes.Add("use", AttributeValue.StringAttributeValue("demo"));
        span.AddAnnotation("Invoking DoWork", attributes);
    }
}
```

#### Shutdown the Tracer

Traces are queued up in memory and flushed to the trace store \(in this case, Zipkin\) periodically, and/or when the buffer is full. In \(5\), we need to make sure that any buffered traces that had yet been sent are flushed for a graceful shutdown.

```csharp
// 5. Gracefully shutdown the exporter so it'll flush queued traces to Zipkin.
Tracing.ExportComponent.SpanExporter.Dispose();
```

#### Set the Status of the span
We can set the [status](https://opencensus.io/tracing/span/status/) of our span to create more observability of our traced operations.
```csharp
// 6. Set status upon error
span.Status = Status.Internal.WithDescription(e.ToString());
```

#### Create an Annotation
An [annotation](https://opencensus.io/tracing/span/time_events/annotation/) tells a descriptive story in text of an event that occurred during a span’s lifetime.
```csharp
// 7. Annotate our span to capture metadata about our operation
var attributes = new Dictionary<string, IAttributeValue>();
attributes.Add("use", AttributeValue.StringAttributeValue("demo"));
span.AddAnnotation("Invoking DoWork", attributes);
```


#### References

Resource|URL
---|---
Zipkin project|https://zipkin.io/
Setting up Zipkin|[Zipkin Codelab](/codelabs/zipkin)
Zipkin C# exporter|https://www.nuget.org/packages/OpenCensus.Exporter.Zipkin
C# exporters|[C# exporters](https://github.com/census-instrumentation/opencensus-csharp)
OpenCensus C# Trace package|https://www.nuget.org/packages/OpenCensus/
