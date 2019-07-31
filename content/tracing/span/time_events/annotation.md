---
date: 2018-10-25T20:01:43-07:00
title: "Annotation"
weight: 20
aliases: [/core-concepts/tracing/span/time_events/annotation]
---

- [Annotation](#annotation)
- [Code examples](#code-examples)
- [Visual representation](#visual-representation)
- [References](#references)

### Annotation

An annotation tells a descriptive story in text, of an event that occurred during a span's lifetime.

It consists of fields:

Field|Information
---|---
Description|The user supplied message that details the event
Attributes|A set of attributes to articulate the annotate

#### Code examples

We'll add an annotation to a span in the excerpts with a couple of languages:

{{<tabs Go Java CplusPlus Python NodeJS>}}
{{<highlight go>}}
import "go.opencensus.io/trace"

span.Annotate([]trace.Attribute{
    trace.StringAttribute("store", "memcache"),
    trace.BoolAttribute("cache_miss", true),
    trace.Int64Attribute("age_ns", 13488999),
}, "Cache miss during GC")
{{</highlight>}}

{{<highlight java>}}
import io.opencensus.trace.AttributeValue;
import java.util.HashMap;

HashMap<String, AttributeValue> map = new HashMap<String, AttributeValue>();
map.put("store", AttributeValue.stringAttributeValue("memcache"));
map.put("cache_miss", AttributeValue.booleanAttributeValue(true));
map.put("age_ns", AttributeValue.int64AttributeValue(13488999));

span.addAnnotation(Annotation.fromDescriptionAndAttributes("Cache miss during GC", map));
{{</highlight>}}

{{<highlight cpp>}}
span.AddAnnotation("Cache miss during GC",  {{"store", "memcache"}},
                                        {{"cache_miss", True}}, {{"age_ns", 13488999}});
{{</highlight>}}

{{<highlight py>}}
span.add_annotation("Cache miss during GC", store="memcache", cache_miss=true, age_ns=13488999)
{{</highlight>}}

{{<highlight js>}}
rootSpan.addAnnotation(
  'Cache miss during GC',
  {store: 'memcache', cache_miss: true},
  13488999
);
{{</highlight>}}
{{</tabs>}}

### Visual representation
![](/images/span-annotation-sample.png)

### References

Resource|URL
---|---
Data model reference|[trace_proto/v1.Annotation](https://github.com/census-instrumentation/opencensus-proto/blob/99162e4df59df7e6f54a8a33b80f0020627d8405/src/opencensus/proto/trace/v1/trace.proto#L146-L153)
Go annotation API: Span.Annotate|[GoDoc](https://godoc.org/go.opencensus.io/trace#Span.Annotate)
Java annotation API: Span.addAnnotation|[JavaDoc](https://static.javadoc.io/io.opencensus/opencensus-api/0.16.1/io/opencensus/trace/Span.html#addAnnotation-java.lang.String-java.util.Map-)
Python annotation API|[Definition](https://github.com/census-instrumentation/opencensus-python/blob/d9384fdfafebe678aef0d28a237d098f4e240ad7/opencensus/trace/span.py#L188-L200)
C++ annotation API|[Definition](https://github.com/census-instrumentation/opencensus-cpp/blob/c5e59c48a3c40a7da737391797423b88e93fd4bb/opencensus/trace/span.h#L119-L123)
