+++
title = "Overview"
type = "leftnav"
date = "2018-05-30T10:49:38-05:00"
+++

---

OpenCensus is a framework for stats collection and distributed tracing. It supports multiple backends.  

<div class="video-responsive">
	<video width="550px" poster="../img/vidposter.svg" controls>
		<source src="https://storage.googleapis.com/opencensusio/OpenCensusVideo.mp4" type="video/mp4">
		<p>This browser does not support the video element. <a href="https://storage.googleapis.com/opencensusio/OpenCensusVideo.mp4"><span class="gloss1">Here</span></a> is a link to the video instead.</p>
	</video>
</div>

&nbsp;  

In microservices architectures, it is difficult to understand how services use resources across shared infrastructure. In monolithic systems, we depend on traditional tools that report per-process resource usage and latency characteristics that are limited to a single process. In order to be able to collect and analyze resource utilization and performance characteristics of distributed systems, OpenCensus tracks resource utilization through the chain of services processing a user request.  
&nbsp;  
&nbsp;  

__Data collected by OpenCensus can be used for:__  

{{% sc_ulist %}}Monitoring of resource usage.{{% /sc_ulist %}}

{{% sc_ulist %}}Analyzing performance and efficiency characteristics of systems to reduce the overall resource consumption of resources and improve latency.{{% /sc_ulist %}}

{{% sc_ulist %}}Analyzing the collected data for capacity planning. Being able to predict the overall impact of a product on the infrastructure and being able to estimate how much more resources are required if a product grows.{{% /sc_ulist %}}

{{% sc_ulist %}}Being able to debug problems in isolation in complex systems.{{% /sc_ulist %}}
&nbsp;  

__OpenCensus aims to provide:__  

{{% sc_ulist %}}Low-overhead collection.{{% /sc_ulist %}}
   
{{% sc_ulist %}}Standard wire protocols and consistent APIs for handling trace and stats data.{{% /sc_ulist %}}
   
{{% sc_ulist %}}A single set of libraries for many languages, including Java, C++, Go, Python, PHP, Erlang, and Ruby.{{% /sc_ulist %}}
   
{{% sc_ulist %}}Integrations with web and RPC frameworks, making traces and stats available out of the box. Full extendability in implementing additional integrations.{{% /sc_ulist %}}
   
{{% sc_ulist %}}Exporters for storage and analysis tools. Full extendability in implementing additional integrations.{{% /sc_ulist %}}

{{% sc_ulist %}}In process debugging: an optional handler for displaying request stats and traces on instrumented hosts.{{% /sc_ulist %}}  
   
No additional server or daemon is required to support OpenCensus.

&nbsp;  

---
&nbsp;  
#### Concepts  
&nbsp;  

__Tags__  

OpenCensus allows systems to associate measurements with dimensions as they are recorded. Recorded data allows us to breakdown the measurements, analyze them from various different perspectives and be able to target specific cases in isolation even in highly interconnected and complex systems. [{{< sc_gloss1 >}}Read more.{{< /sc_gloss1 >}}](/tags)  

&nbsp;  

__Stats__  

*Stats* is collection allow libraries and applications to record measurements, aggregate the recorded data and export them. [{{< sc_gloss1 >}}Read more.{{< /sc_gloss1 >}}](/stats)  

&nbsp;  

__Trace__  

*Distributed traces* track the progression of a single user request as it is handled by the internal services until the user request is responded. [{{< sc_gloss1 >}}Read more.{{< /sc_gloss1 >}}](/trace)  

&nbsp;  

__Exporters__  

OpenCensus is vendor-agnostic and can upload data to any backend with various exporter implementations. Even though, OpenCensus provides support for many backends, users can also implement their own exporters for proprietary and unofficially supported backends.  

&nbsp;  

__Introspection__  

OpenCensus provides in-process dashboards that displays diagnostics data from the process. These pages are called z-pages and they are useful to understand to see collected data from a specific process without having to depend on any metric collection or distributed tracing backend.  

&nbsp;  
![traceZ summary example image](/img/traceZ.png "traceZ summary example image")  

&nbsp;  
An example /tracez handler served by the application that reports traces collected in the process.  
&nbsp;  
