---
title: "Tracing"
date: 2018-10-19T17:31:12-07:00
draft: false
class: "shadowed-image lightbox"
---

- [Requirements](#requirements)
- [Brief Overview](#brief-overview)
- [Getting started](#getting-started)
- [Enable tracing](#enable-tracing)
    - [Build system](#build-system)
        - [WORKSPACE file](#enable-tracing-workspace-file)
        - [BUILD file](#enable-tracing-build-file)
    - [Instrumenting your code](#instrumenting-your-code)
- [Enable exporting](#enable-exporting)
    - [BUILD file](#exporting-build-file)
    - [WORKSPACE file](#exporting-workspace-file)
    - [Zipkin exporter](#zipkin-exporter)
- [End to end code](#end-to-end-code)
- [Viewing your traces on Zipkin](#viewing-your-traces-on-zipkin)
    - [All traces](#all-traces)
    - [Single trace](#single-trace)
    - [Root span](#root-span)
    - [Child span](#child-span)
- [References](#references)

In this quickstart, we’ll learn how to:

1. Add tracing to our application
2. Enabling an exporter to our C++ application

## Requirements
- A compiler: g++ or clang
- [Zipkin](https://zipkin.io)
- [Bazel](https://bazel.build/)

## Brief overview
By the end of this tutorial, we would have done these two things using OpenCensus:

1. Learn how to add traces to our applications
2. Learn how to extract traces and export them to a backend of our choice

## Getting started
Our application is an interactive commandline application that:

- accepts input from standard input
- capitalizes the input
- prints out the capitalized data to standard output

To get started, we'll create a file `tracing.cc`
```cpp
#include <iostream>

std::string capitalize(std::string in) {
    std::string out(in);

    for (auto it = out.begin(); it != out.end(); it++)
        *it = std::toupper(*it);

    return out;
}

int main(int argc, char **argv) {
    while (1) {
        std::cout << "\n> ";
        std::string input;
        std::getline(std::cin, input);
        std::string upper = capitalize(input);
        std::cout << "< " << upper << std::endl;
    }
}
```

and to run it, we'll use this command

```shell
g++ -std=c++11 tracing.cc -o tracing && ./tracing
```

which will produce output such as:

```shell
> bigger than this
< BIGGER THAN THIS

> this is the quickstart
< THIS IS THE QUICKSTART

> introductions
< INTRODUCTIONS

>
```

With the application running, we might want to know:

a) How do the parts of the program coordinate?
b) How long do the various parts take?

To answer the above questions, please read along:

## Enable tracing

### Build system
To enable tracing, we'll need to use the OpenCensus C++ library. The library requires the Bazel build system

{{% notice tip %}}
For assistance setting up Bazel Build, please [click here](https://docs.bazel.build/versions/master/install.html)
{{% /notice %}}

Please install bazel first. After that, please proceed below.

To add tracing with OpenCensus, firstly we'll need to use Bazel build to setup a couple of imports for:

* [Abseil C++](https://abseil.io/)
* [OpenCensus C++](https://github.com/census-instrumentation/opencensus-cpp)

After installing bazel, we'll need to make two files in the same working directory as the `tracing.cc`
that is:

- WORKSPACE
- BUILD


#### <a name="enable-tracing-workspace-file"></a>WORKSPACE
Please update your `WORKSPACE` file to:
```python
http_archive(
    name = "io_opencensus_cpp",
    strip_prefix = "opencensus-cpp-master",
    urls = ["https://github.com/census-instrumentation/opencensus-cpp/archive/master.zip"],
)

# OpenCensus depends on Abseil so we have to explicitly to pull it in.
# This is how diamond dependencies are prevented.
http_archive(
    name = "com_google_absl",
    strip_prefix = "abseil-cpp-master",
    urls = ["https://github.com/abseil/abseil-cpp/archive/master.zip"]
)
```

`http_archive` tells bazel to configure an "external repository" by downloading an archive via http, unpacking it, and removing the top-level directory as per "strip_prefix"

#### <a name="enable-tracing-build-file"></a>BUILD
Please update your `BUILD` file to:
```python
cc_binary(
        name = "tracing",
        srcs = ["tracing.cc"],
        linkopts = ["-pthread"],
        deps = [
            "@com_google_absl//absl/time",
            "@io_opencensus_cpp//opencensus/trace:trace",
        ],
)
```

* "deps" is a list of libraries that our binary depends on. Alongside linking these libraries, bazel will also
make their headers available to the compiler.
* "@io_opencensus_cpp" refers to an external subrepository
* "//opencensus/trace" is a directory path within that subdirectory
* ":trace" is the name of a "cc_library" target in that directory

From the compiler's point of view, all of the sources and dependencies' headers are merged into a single hierarchy i.e.
```shell
tracing.cc
absl/...
opencensus/trace/span.h
```

### Instrumenting your code

To add traces, we'll start spans using the `opencensus::trace::Span::StartSpan` function
and at the end invoke `opencensus::trace::Span::End` on each span, e.g.:

```cpp
auto span = opencensus::trace::Span::StartSpan("name", &parentSpan, {&sampler});
// Do work.
// ...
// Finally explicitly end the span.
span.End();
```

which then fully becomes:

```cpp
#include <iostream>
#include "opencensus/trace/sampler.h"
#include "opencensus/trace/span.h"

std::string processLine(const opencensus::trace::Span& parentSpan,
                        const std::string& in) {
  auto span = opencensus::trace::Span::StartSpan("processLine", &parentSpan);
  std::string out(in);

  for (auto it = out.begin(); it != out.end(); it++) {
    *it = std::toupper(*it);
  }

  // Add a custom annotation to examine later on.
  span.AddAnnotation(out);

  span.End();
  return out;
}

int main(int argc, char** argv) {
  // Samplers are potentially expensive to construct. Use one long-lived
  // sampler instead of constructing one for every Span.
  static opencensus::trace::AlwaysSampler sampler;

  while (1) {
    opencensus::trace::Span replSpan = opencensus::trace::Span::StartSpan(
        "repl", /* parent = */ nullptr, {&sampler});

    std::cout << "\n> ";
    std::string input;

    opencensus::trace::Span readLineSpan =
        opencensus::trace::Span::StartSpan("readLine", &replSpan);
    std::getline(std::cin, input);
    readLineSpan.End();

    // Let's annotate the span.
    replSpan.AddAnnotation("Invoking processLine");
    const std::string upper = processLine(replSpan, input);

    std::cout << "< " << upper << std::endl;

    // Always explicitly End() every Span.
    replSpan.End();
  }
}
```

Now we'll build it like this:
```shell
bazel build :tracing
```

which will place the binary in `bazel-bin/tracing`
and then run it like this
```shell
./bazel-bin/tracing
```

which will produce such output:

```shell
./bazel-bin/tracing

> foo
< FOO

> whip
< WHIP

> foreign
< FOREIGN

> introductions
< INTRODUCTIONS

> tracing
< TRACING

> up-to-date
< UP-TO-DATE
```

## Enable exporting
After successfully instrumenting our code, we now need to extract and visually examine those traces.

For that we'll use Zipkin tracing
{{% notice tip %}}
For assistance setting up Zipkin, [click here](/codelabs/zipkin) for a guided codelab.
{{% /notice %}}

For that we'll update both our files `BUILD` and `WORKSPACE`:

### <a name="exporting-build-file"></a>Updated BUILD file
`BUILD`

```python
cc_binary(
        name = "tracing",
        srcs = ["tracing.cc"],
        linkopts = ["-pthread"],
        deps = [
            "@io_opencensus_cpp//opencensus/trace",
            "@io_opencensus_cpp//opencensus/exporters/trace/zipkin:zipkin_exporter",
            "@com_google_absl//absl/base:core_headers",
            "@com_google_absl//absl/memory",
            "@com_google_absl//absl/strings",
        ],
)
```

### <a name="exporting-workspace-file"></a>Updated WORKSPACE file

```python
http_archive(
    name = "io_opencensus_cpp",
    strip_prefix = "opencensus-cpp-master",
    urls = ["https://github.com/census-instrumentation/opencensus-cpp/archive/master.zip"],
)

# OpenCensus depends on Abseil so we have to explicitly to pull it in.
# This is how diamond dependencies are prevented.
http_archive(
    name = "com_google_absl",
    strip_prefix = "abseil-cpp-master",
    urls = ["https://github.com/abseil/abseil-cpp/archive/master.zip"]
)

# Curl library used by the Zipkin exporter
new_http_archive(
    name = "com_github_curl",
    build_file_content =
        """
load("@io_opencensus_cpp//opencensus:curl.bzl", "CURL_COPTS")
package(features = ['no_copts_tokenization'])
config_setting(
    name = "windows",
    values = {"cpu": "x64_windows"},
    visibility = [ "//visibility:private" ],
)
config_setting(
    name = "osx",
    values = {"cpu": "darwin"},
    visibility = [ "//visibility:private" ],
)
cc_library(
    name = "curl",
    srcs = glob([
        "lib/**/*.c",
    ]),
    hdrs = glob([
        "include/curl/*.h",
        "lib/**/*.h",
    ]),
    includes = ["include/", "lib/"],
    copts = CURL_COPTS + [
        "-DOS=\\"os\\"",
        "-DCURL_EXTERN_SYMBOL=__attribute__((__visibility__(\\"default\\")))",
    ],
    visibility = ["//visibility:public"],
)
""",
    strip_prefix = "curl-master",
    urls = ["https://github.com/curl/curl/archive/master.zip"],
)

# Rapidjson library - used by the Zipkin exporter.
new_http_archive(
    name = "com_github_rapidjson",
    build_file_content =
        """
cc_library(
    name = "rapidjson",
    srcs = [],
    hdrs = glob([
        "include/rapidjson/*.h",
        "include/rapidjson/internal/*.h",
        "include/rapidjson/error/*.h",
    ]),
    includes = ["include/"],
    defines = ["RAPIDJSON_HAS_STDSTRING=1",],
    visibility = ["//visibility:public"],
)
""",
    strip_prefix = "rapidjson-master",
    urls = ["https://github.com/Tencent/rapidjson/archive/master.zip"],
)
```

### Zipkin exporter

To use the Zipkin exporter, we'll just need these lines
```cpp
#include "opencensus/exporters/trace/zipkin/zipkin_exporter.h"

int main(int argc, char **argv) {
  // Initialize and enable the Zipkin trace exporter.
  const absl::string_view endpoint = "http://localhost:9411/api/v2/spans";
  opencensus::exporters::trace::ZipkinExporter::Register(
      opencensus::exporters::trace::ZipkinExporterOptions(endpoint));

  // ...
```

## End to end code

With the above adjustments our sample alongside the updated `BUILD` and `WORKSPACE` files, our `tracing.cc` code will now become:

```cpp
#include <iostream>

#include "absl/strings/string_view.h"
#include "opencensus/exporters/trace/zipkin/zipkin_exporter.h"
#include "opencensus/trace/sampler.h"
#include "opencensus/trace/span.h"

std::string processLine(const opencensus::trace::Span& parentSpan,
                        const std::string& in) {
  auto span = opencensus::trace::Span::StartSpan("processLine", &parentSpan);
  std::string out(in);

  for (auto it = out.begin(); it != out.end(); it++) {
    *it = std::toupper(*it);
  }

  // Add a custom annotation to examine later on.
  span.AddAnnotation(out);

  span.End();
  return out;
}

int main(int argc, char** argv) {
  // Samplers are potentially expensive to construct. Use one long-lived
  // sampler instead of constructing one for every Span.
  static opencensus::trace::AlwaysSampler sampler;

  // Initialize and enable the Zipkin trace exporter.
  const absl::string_view endpoint = "http://localhost:9411/api/v2/spans";
  opencensus::exporters::trace::ZipkinExporter::Register(
      opencensus::exporters::trace::ZipkinExporterOptions(endpoint));

  while (1) {
    opencensus::trace::Span replSpan = opencensus::trace::Span::StartSpan(
        "repl", /* parent = */ nullptr, {&sampler});

    std::cout << "\n> ";
    std::string input;

    opencensus::trace::Span readLineSpan =
        opencensus::trace::Span::StartSpan("readLine", &replSpan);
    std::getline(std::cin, input);
    readLineSpan.End();

    // Let's annotate the span.
    replSpan.AddAnnotation("Invoking processLine");
    const std::string upper = processLine(replSpan, input);

    std::cout << "< " << upper << std::endl;

    // Always explicitly End() every Span.
    replSpan.End();
  }
}
```

and when rebuilt and run:
```shell
bazel build :tracing && ./bazel-bin/tracing
```

## Viewing your traces on Zipkin

After interacting with our application
```shell
$ bazel build :tracing && ./bazel-bin/tracing
INFO: Analysed target //:tracing (0 packages loaded).
INFO: Found 1 target...
Target //:tracing up-to-date:
  bazel-bin/tracing
INFO: Elapsed time: 0.668s, Critical Path: 0.56s
INFO: 2 processes, darwin-sandbox.
INFO: Build completed successfully, 3 total actions

> this is the first
< THIS IS THE FIRST

> what is what?
< WHAT IS WHAT?

> C++ here we come
< C++ HERE WE COME

>
```

And on navigating to the Zipkin UI at http://localhost:9411/zipkin

Alternatively, listen on the Zipkin port to see the exported data:
```shell
$ nc -l -p 9411
```

### All traces
![](/images/cpp-trace-all.png)

### Single trace
![](/images/cpp-trace-single.png)

### Root span
![](/images/cpp-trace-single-root-span.png)

### Child span
From the annotation in the function `processLine`
```cpp
    span.AddAnnotation(out);
```
given `C++ here we come`
we can now see the recorded capitalized annotation `C++ HERE WE COME`
![](/images/cpp-trace-single-child-span.png)

## References

Resource|URL
---|---
OpenCensus C++|https://github.com/census-instrumentation/opencensus-cpp
Zipkin project|https://zipkin.io/
Zipkin C++ exporter|[Github link](https://github.com/census-instrumentation/opencensus-cpp/tree/master/opencensus/exporters/trace/zipkin)
Setting up Zipkin|[Zipkin codelab](/codelabs/zipkin)
Bazel build system|https://bazel.build/
