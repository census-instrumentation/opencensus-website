+++
title = "FAQ"
Description = "faq"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "main"
date = "2018-05-10T14:14:33-05:00"
+++

####  Who is behind OpenCensus?

OpenCensus originates from Google, where a set of libraries called Census were used to automatically capture traces and metrics from services. Since going open source, the project is now composed of a group of cloud providers, application performance management vendors, and open source contributors. The project is hosted in [GitHub](https://github.com/census-instrumentation/) and all work occurs there.

---

####  How does OpenCensus benefit the ecosystem?

* Making application metrics and distributed traces more accessible to developers. Today, one of the biggest challenges with gathering this information is the lack of good automatic instrumentation, as tracing and APM vendors have typically supplied their own limited, incompatible instrumentation solutions. With OpenCensus, more developers will be able to use these tools, which will improve the overall quality of their services and the web at large.
* APM vendors will benefit from less setup friction for customers, broader language and framework coverage, and reduced effort spent in designing and maintaining their own instrumentation.
* Local debugging capabilities. OpenCensus’s optional agent can be used to view requests and metrics locally and can dynamically change the sampling rate of traces, both of which are incredibly useful during critical production debugging sessions.</p>
* Collaboration and support from vendors (cloud providers like Google and Microsoft in addition to APM companies) and open source providers (Zipkin). As the OpenCensus libraries include instrumentation hooks into various web and RPC frameworks and exporters, they are immediately useful out of the box.
* Allowing service providers to better debug customer issues. As OpenCensus defines a common context propagation format, customers experiencing issues can provide a request ID to providers so that they can debug the problem together. Ideally, providers can trace the same requests as customers, even if they are using different analysis systems.

---

#### What languages &amp; integrations does OpenCensus support?

{{< sc_supportedLanguages />}}

---

#### What Exporters does OpenCensus support?

{{< sc_supportedExporters />}}

---

#### How do I use OpenCensus in my application?
If you are using a supported application framework, follow its instructions for configuring OpenCensus.

* Choose a supported APM tool and follow its configuration instructions for using OpenCensus.
* You can also use the OpenCensus z-Pages to view your tracing data without an APM tool.

A user’s guide will be released as soon as possible.

---

#### What are the z-Pages?

OpenCensus provides a stand-alone application that uses a gRPC channel to communicate with the OpenCensus code linked into your application. The application displays configuration parameters and trace information in real time held in the OpenCensus library.

---

####  How can I contribute to OpenCensus?

* Help people on the discussion forums.
* Tell us your success story using OpenCensus.
* Tell us how we can improve OpenCensus, and help us do it.
* Contribute to an existing library or create one for a new language.
* Integrate OpenCensus with a new framework.
* Integrate OpenCensus with a new APM tool.
