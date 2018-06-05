+++
Description = "roadmap"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "main"

title = "Roadmap"
date = "2018-05-11T12:09:08-05:00"
+++

{{% sc_roadmap %}}
{{% sc_roadmap2 %}}
#### OpenCensus’s journey ahead: [{{< sc_gloss1 >}}platforms and languages{{< /sc_gloss1 >}}](https://opensource.googleblog.com/2018/05/opencensus-journey-ahead-part-1.html)  
&nbsp;  

#### Languages  
&nbsp;  

| LANGUAGE | TRACING | STATS |
| :------- | :------ | :---- |
| [{{< sc_gloss1 >}}C++{{< /sc_gloss1 >}}](https://github.com/census-instrumentation/opencensus-cpp) | Supported | Supported |
| [{{< sc_gloss1 >}}Erlang{{< /sc_gloss1 >}}](href="https://github.com/census-instrumentation/opencensus-erlang) | Supported | Supported |
| [{{< sc_gloss1 >}}GO{{< /sc_gloss1 >}}](https://github.com/census-instrumentation/opencensus-go) | Supported | Supported |
| [{{< sc_gloss1 >}}Java (JVM, OpenJDK, Android){{< /sc_gloss1 >}}](https://github.com/census-instrumentation/opencensus-java)  | Supported | Supported |
| [{{< sc_gloss1 >}}PHP{{< /sc_gloss1 >}}](https://github.com/census-instrumentation/opencensus-php) | Supported | Planned |
| [{{< sc_gloss1 >}}Python{{< /sc_gloss1 >}}](https://github.com/census-instrumentation/opencensus-python) | Supported | In Progress |
| [{{< sc_gloss1 >}}Ruby{{< /sc_gloss1 >}}](https://github.com/census-instrumentation/opencensus-ruby) | Supported | Planned |
{{% /sc_roadmap2 %}}
{{% sc_roadmap2 %}}
#### Exporters  

| Backend | GO   | Java | Erlang | C++  | Python |
| :------ | :--- | :--- | :----- | :--- | :----- |
| SignalFX | No [{{< sc_gloss1 >}}(open issue){{< /sc_gloss1 >}}](https://github.com/census-instrumentation/opencensus-go/issues/360) | Yes | No | No | No |
| Prometheus | Yes | Yes | Yes | No | No |
| Jaeger | Yes | No | No | No | No |
| Stackdriver | Yes | Yes | Yes (trace only) | No | Yes |
| Zipkin | Yes | Yes | Yes | No | No |
{{% /sc_roadmap2 %}}

#### How do I contribute?

Contributions are highly appreciated! Please follow the steps for [{{< sc_gloss1 >}}Contribute Here.{{< /sc_gloss1 >}}]
(../community/index.html)

{{% /sc_roadmap %}}