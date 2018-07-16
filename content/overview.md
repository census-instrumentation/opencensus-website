+++
title = "Overview"
type = "leftnav"
date = "2018-05-30T10:49:38-05:00"
+++

OpenCensus is a framework for stats collection and distributed tracing. It supports multiple backends.  

<div class="video-responsive">
	<video width="550px" poster="../img/vidposter.svg" controls>
		<source src="https://storage.googleapis.com/opencensusio/OpenCensusVideo.mp4" type="video/mp4">
		<p>This browser does not support the video element. <a href="https://storage.googleapis.com/opencensusio/OpenCensusVideo.mp4">Here</a> is a link to the video instead.</p>
	</video>
</div>

In microservices architectures, it is difficult to understand how services use resources across shared infrastructure. In monolithic systems, we depend on traditional tools that report per-process resource usage and latency characteristics that are limited to a single process. In order to be able to collect and analyze resource utilization and performance characteristics of distributed systems, OpenCensus tracks resource utilization through the chain of services processing a user request.  

__Data collected by OpenCensus can be used for:__  

* Monitoring of resource usage.
* Analyzing performance and efficiency characteristics of systems to reduce the overall resource consumption of resources and improve latency.
* Analyzing the collected data for capacity planning. Being able to predict the overall impact of a product on the infrastructure and being able to estimate how much more resources are required if a product grows.
* Being able to debug problems in isolation in complex systems.

__OpenCensus aims to provide:__  

* Low-overhead collection.
* Standard wire protocols and consistent APIs for handling trace and stats data.
* A single set of libraries for many languages, including Java, C++, Go, Python, PHP, Erlang, and Ruby.
* Integrations with web and RPC frameworks, making traces and stats available out of the box. Full extendability in implementing additional integrations.
* Exporters for storage and analysis tools. Full extendability in implementing additional integrations.
* In process debugging: an optional handler for displaying request stats and traces on instrumented hosts.  

No additional server or daemon is required to support OpenCensus.

## Concepts  

### Tags

OpenCensus allows systems to associate measurements with dimensions as they are recorded. Recorded data allows us to breakdown the measurements, analyze them from various different perspectives and be able to target specific cases in isolation even in highly interconnected and complex systems. [Read more](/tags). 

### Stats 

*Stats* is collection allow libraries and applications to record measurements, aggregate the recorded data and export them. [Read more](/stats).

### Traces  

*Distributed traces* track the progression of a single user request as it is handled by the internal services until the user request is responded. [Read more](/traces).

### Exporters  

OpenCensus is vendor-agnostic and can upload data to any backend with various exporter implementations. Even though, OpenCensus provides support for many backends, users can also implement their own exporters for proprietary and unofficially supported backends. [Read more](/exporters).

### Z-Pages  

OpenCensus provides in-process dashboards that displays diagnostics data from the process. These pages are called z-pages and they are useful to understand to see collected data from a specific process without having to depend on any metric collection or distributed tracing backend. [Read more](/zpages).