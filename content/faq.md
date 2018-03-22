---
date: "2017-10-10T11:27:27-04:00"
title: "Frequently Asked Questions"
---

## Who is behind OpenCensus?

OpenCensus is being developed by a group of cloud providers, Application Performance Management vendors, and open source contributors. This project is hosted on GitHub and all work occurs there.

OpenCensus was initiated by Google, and is based on instrumentation systems used inside of Google. OpenCensus is a complete rewrite of the Google system and has no Google intellectual property.

## How does OpenCensus benefit the ecosystem?

1. Making application metrics and distributed traces more accessible to developers. Today, one of the biggest challenges with gathering this information is the lack of good automatic instrumentation, as tracing and APM vendors have typically supplied their own limited, incompatible instrumentation solutions. With OpenCensus, more developers will be able to use these tools, which will improve the overall quality of their services and the web at large.

2. APM vendors will benefit from less setup friction for customers, broader language and framework coverage, and reduced effort spent in designing and maintaining their own instrumentation.

3. Local debugging capabilities. OpenCensus’s optional agent can be used to view requests and metrics locally and can dynamically change the sampling rate of traces, both of which are incredibly useful during critical production debugging sessions.

4. Collaboration and support from vendors (cloud providers like Google and Microsoft in addition to APM companies) and open source providers (Zipkin). As the OpenCensus libraries include instrumentation hooks into various web and RPC frameworks and exporters, they are immediately useful out of the box.

5. Allowing service providers to better debug customer issues. As OpenCensus defines a common context propagation format, customers experiencing issues can provide a request ID to providers so that they can debug the problem together. Ideally, providers can trace the same requests as customers, even if they are using different analysis systems.

## How do I use OpenCensus in my application?

If you are using a supported application framework, follow its instructions for configuring OpenCensus.

Choose a supported APM tool and follow its configuration instructions for using OpenCensus.

You can also use the OpenCensus z-Pages to view your tracing data without an APM tool.

A user’s guide will be released as soon as possible.

## What are the Z-pages?

OpenCensus provides in-process dashboards that displays diagnostics data from the process. These pages are called z-pages and they are useful to understand to see collected data from a specific process without having to depend on any metric collection or distributed tracing backend.

## How can I contribute to OpenCensus?

*  Help people on the discussion forums.
* Tell us your success story using OpenCensus.
* Tell us how we can improve OpenCensus, and help us do it.
* Contribute to an existing library or create one for a new language.
* Integrate OpenCensus with a new framework.
* Integrate OpenCensus with a new APM tool.