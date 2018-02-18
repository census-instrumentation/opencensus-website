---
title: "FAQ"
---


## Who is behind OpenCensus?

OpenCensus is being developed by a group of cloud providers, Application
Performance Management vendors, and open source contributors. 

OpenCensus was initiated by Google, and is based on instrumentation systems used
inside of Google. OpenCensus is a complete rewrite of the Google system.

## What languages and integrations does OpenCensus support?

Languages under development:

| Language        | Tracing         | Metrics         |
|:--------------- |:--------------- |:--------------- |
|[C++](https://github.com/census-instrumentation/opencensus-cpp)                           |Supported   |Supported   |
|[Java (JVM, OpenJDK, Android)](https://github.com/census-instrumentation/opencensus-java) |Supported   |Supported   |
|[Go](https://github.com/census-instrumentation/opencensus-go)                             |Supported   |Supported   |
|[Python](https://github.com/census-instrumentation/opencensus-python)                     |Supported   |In Progress |
|[PHP](https://github.com/census-instrumentation/opencensus-php)                           |Supported   |Planned     |
|[Ruby](https://github.com/census-instrumentation/opencensus-ruby)                         |Supported   |Planned     |
|[Node.js](https://github.com/census-instrumentation/opencensus-node)                      |In Progress |In Progress |
|[C#/.Net](https://github.com/census-instrumentation/opencensus-csharp)                    |Planned     |Planned     |
|[Erlang](https://github.com/census-instrumentation/opencensus-erlang)                     |In Progress |Planned     |
|[Web JS](https://github.com/census-instrumentation/opencensus-web)                        |Planned     |Planned     |

Integrations supported:

* Spring (planned)
* gRPC
* JDBC (planned)
* net/http
* Dropwizard (planned)


## What APM tools does OpenCensus support?

This list is not yet available. Check out the individual GitHub repos for details.


## How do I use OpenCensus in my application?

If you are using a supported application framework, follow its instructions
for configuring OpenCensus.
Choose a supported APM tool and follow its configuration instructions for
using OpenCensus.
You can also use the OpenCensus z-Pages to view your
tracing data without an APM tool.

## What are the z-Pages?

OpenCensus provides a stand-alone application that uses a gRPC channel to
communicate with the OpenCensus code linked into your application. The
application displays configuration parameters and trace information held in
the OpenCensus library.


## How can I contribute to OpenCensus?

* Help people on the discussion forums.
* Tell us your success story using OpenCensus.
* Tell us how we can improve OpenCensus, and help us do it.
* Contribute to an existing library or create one for a new language.
* Integrate OpenCensus with a new framework.
* Integrate OpenCensus with a new APM tool.
