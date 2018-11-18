---
date: 2018-10-25T20:01:43-07:00
title: "Name"
weight: 1
aliases: [/core-concepts/tracing/span/name]
---

### Name

A span name is a string descriptive of what the span does. Span names should
be statistically meaningful. Most tracing backend and analysis
tools use span names to auto generate reports for the represented work.

Examples of span names:

* "cache.Get" represents the Get method of the cache service.
* "/messages" represents the messages web page.
* "/api/user/(\\d+)" represents the user detail pages.

Names are usually created in the span's constructor.

### Source code sample

We'll create a span with the Name "cache.Get", below:

{{<tabs Java Go Python CplusPlus NodeJS>}}
{{<highlight java>}}
try (Scope ss = TRACER.spanBuilder("cache.Get").startScopedSpan()) {
}
{{</highlight>}}

{{<highlight go>}}
ctx, span := trace.StartSpan(ctx, "cache.Get")
{{</highlight>}}

{{<highlight python>}}
with tracer.span(name="cache.get") as span:
    pass
{{</highlight>}}

{{<highlight cpp>}}
opencensus::trace::Span span = opencensus::trace::Span::StartSpan(
                                            "cache.Get", nullptr, {&sampler});
{{</highlight>}}

{{<highlight js>}}
tracer.startRootSpan({name: 'cache.Get'}, rootSpan => {
});
{{</highlight>}}

{{</tabs>}}

### Visuals

The span when visualized will look something like this:
![](/images/span-name-sample.png)

### References
Resource|URL
---|---
Name in datamodel reference|[proto/v1/Span.Name](https://github.com/census-instrumentation/opencensus-proto/blob/99162e4df59df7e6f54a8a33b80f0020627d8405/src/opencensus/proto/trace/v1/trace.proto#L78-L86)
