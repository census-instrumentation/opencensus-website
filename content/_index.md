---
title: ""
date: 2018-07-19T09:58:45-07:00
draft: false
class: "no-pagination no-top-border-header no-search max-text-width"
---

{{<title-card>}}

> OpenCensus and OpenTracing have merged to form [OpenTelemetry](https://opentelemetry.io), which serves as the next major version of OpenCensus and OpenTracing. OpenTelemetry will offer backwards compatibility with existing OpenCensus integrations, and we will continue to make security patches to existing OpenCensus libraries for two years.

##### What is OpenCensus?

{{<title>}} is a set of libraries for various languages that allow you to collect application **metrics** and **distributed traces**, then transfer the data to a backend of your choice in real time. This data can be analyzed by developers and admins to understand the health of the application and debug problems.

{{<button class="btn-light" icon="true" href="/introduction/#overview">}}Overview{{</button>}}

{{<button class="btn-light" icon="true" href="/quickstart">}}Quickstart{{</button>}}

##### How can I use OpenCensus in my project?
We provide libraries for Go, Java, C#, Node.js, C++, Ruby, Erlang/Elixir, Python, Scala and PHP.

Supported backends include Azure Monitor, Datadog, Instana, Jaeger, New Relic, SignalFX, Google Cloud Monitoring + Trace, and Zipkin. You can also [add support for other backends](/guides/exporters/custom-exporter/).

{{<button class="btn-light" icon="true" href="/language-support">}}Language Support{{</button>}}

{{<button class="btn-light" icon="true" href="/guides/exporters/supported-exporters">}}Supported Backends{{</button>}}

##### Who is behind it?
OpenCensus originates from Google, where a set of libraries called Census are used to automatically capture traces and metrics from services. Since going open source, the project is now composed of a group of cloud providers, application performance management vendors, and open source contributors. The project is hosted on [GitHub](https://github.com/census-instrumentation) and all work occurs there.

{{<button class="btn-light" icon="true" href="https://github.com/census-instrumentation/">}}Github{{</button>}}

{{<button class="btn-light" icon="true" href="/community">}}Community{{</button>}}

{{<button class="btn-light" icon="true" href="https://gitter.im/census-instrumentation/Lobby">}}Gitter{{</button>}}

##### What data can OpenCensus collect?

[**Metrics**](/core-concepts/metrics) are any quantifiable piece of data that you would like to track, such as latency in a service or database, request content length, or number of open file descriptors. Viewing graphs of your metrics can help you understand and gauge the performance and overall quality of your application and set of services.

[**Traces**](/core-concepts/tracing) show you how a request propagates throughout your application or set of services. Viewing graphs of your traces can help you understand the bottlenecks in your architecture by visualizing how data flows between all of your services.

Other types of telemetry will be added to OpenCensus as the project matures. **Logs** will likely be added next.

##### How can I contribute to OpenCensus?
* Help people on the discussion forums
* Tell us your success stories using OpenCensus
* Tell us how we can improve OpenCensus, and help us do it
* Contribute to an existing library or create one for a new language

{{<button class="btn-light" icon="true" href="https://gitter.im/census-instrumentation/Lobby">}}Discussion forum{{</button>}}

{{<button class="btn-light" icon="true" href="https://github.com/census-instrumentation/">}}Contribute{{</button>}}

##### Partners & Contributors
{{<card-vendor href="https://google.com" src="/img/partners/google_logo.svg">}}
{{<card-vendor href="https://www.datadoghq.com/" src="/img/partners/datadog_logo.svg">}}
{{<card-vendor href="https://orijtech.com/" src="/img/partners/orijtech_logo.png">}}
{{<card-vendor href="https://signalfx.com/" src="/img/partners/signalFx_logo.svg">}}
{{<card-vendor href="https://www.cesar.org.br/" src="/img/partners/cesar_logo.svg">}}
{{<card-vendor href="http://thecreativefew.com/" src="/img/partners/creative_few_logo.svg">}}
{{<card-vendor href="https://www.microsoft.com/" src="/img/partners/microsoft_logo.svg">}}
{{<card-vendor href="https://www.jaegertracing.io/" src="/img/partners/jaeger_logo.svg">}}
{{<card-vendor href="https://zipkin.io/" src="/img/partners/zipkin_logo.svg">}}
{{<card-vendor href="https://www.solarwinds.com/" src="/img/partners/solarwinds_logo.svg">}}
{{<card-vendor href="https://cloud.google.com/stackdriver/" src="/img/partners/stackdriver_logo.svg">}}
{{<card-vendor href="https://prometheus.io/" src="/img/partners/prometheus_logo.svg">}}
{{<card-vendor href="https://www.instana.com/" src="/img/partners/instana_logo.svg">}}
{{<card-vendor href="https://omnition.io/" src="/img/partners/omnition_logo.svg">}}
{{<card-vendor href="https://www.honeycomb.io/" src="/img/partners/honeycomb_logo.svg">}}
{{<card-vendor href="https://corporate.comcast.com/" src="/img/partners/comcast_logo.jpg">}}
{{<card-vendor href="https://postmates.com/" src="/img/partners/postmates_logo.png">}}
{{<card-vendor href="https://lightstep.com/" src="/img/partners/lightstep-logo.svg">}}
{{<card-vendor href="https://www.scalyr.com/" src="/img/partners/scalyr-logo-stacked.png">}}
{{<card-vendor href="https://www.wavefront.com/" src="/img/partners/wavefront_logo.svg">}}
