---
title: "Trace exporter"
date: 2018-10-22T17:31:12-07:00
draft: false
aliases: [/custom_exporter/cpp/tracing, /guides/exporters/custom-exporter/cpp/tracing]
class: "shadowed-image lightbox"
---

In this quickstart, we'll learn how to write a custom exporter for tracing.

## Requirements
- A C++ compiler: g++ or clang
- [Bazel](https://bazel.build/)

## Brief overview
By the end of this tutorial, we would have done these two things using OpenCensus:

1. Write a custom exporter for tracing.
2. Show how to use this exporter in an example program.

## Getting started
The exporter has two components:

- An API that lets the user register it.
- An internal implementation that implements the `Handler` interface.

Let's put the API in `latency_exporter.h`:

```cpp
class LatencyExporter {
 public:
  LatencyExporter() = delete;
  static void Register();
};
```

And the implementation in `latency_exporter.cc`:

```cpp
#include "latency_exporter.h"

#include <iostream>
#include <vector>

#include "absl/memory/memory.h"
#include "opencensus/trace/exporter/span_data.h"
#include "opencensus/trace/exporter/span_exporter.h"

namespace {

// Implement the Handler interface.
class Handler : public ::opencensus::trace::exporter::SpanExporter::Handler {
 public:
  // OpenCensus will call Export() periodically with a batch of spans.
  void Export(const std::vector<::opencensus::trace::exporter::SpanData>& spans)
      override {
    // Export each span we were given.
    for (const auto& span : spans) {
      std::cout << "Span \"" << span.name() << "\" took "
                << (span.end_time() - span.start_time()) << ".\n";
    }
  }
};

}  // namespace

// static
void LatencyExporter::Register() {
  ::opencensus::trace::exporter::SpanExporter::RegisterHandler(
      absl::make_unique<Handler>());
}
```

Add a `cc_library` target to the BUILD file:

```python
cc_library(
    name = "latency_exporter",
    srcs = ["latency_exporter.cc"],
    hdrs = ["latency_exporter.h"],
    deps = [
        "@com_google_absl//absl/memory",
        "@io_opencensus_cpp//opencensus/trace",
    ],
)
```

## Exercise

Adapt the [tracing quickstart](../tracing/) to use this exporter:

* Add our new `":latency_exporter"` library as a dependency.

* Add a `#include "latency_exporter.h"`.

* Call `LatencyExporter::Register();` in `main()`.

Every five seconds, the exporter will produce output like:

```
Span "readLine" took 1.862484838s.
Span "processLine" took 37.702us.
Span "repl" took 1.862748259s.
```

## References

A good reference is
[opencensus/exporters/trace/stdout/](https://github.com/census-instrumentation/opencensus-cpp/tree/master/opencensus/exporters/trace/stdout)
which implements a simple exporter.

Resource|URL
---|---
OpenCensus C++|https://github.com/census-instrumentation/opencensus-cpp
Bazel build system|https://bazel.build/
