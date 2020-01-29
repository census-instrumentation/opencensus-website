---
title: "Exporters"
weight: 6
aliases: [/core-concepts/exporters]
---

- [Exporters](#exporters)
- [Language vs available exporters matrix](#language-vs-available-exporters-matrix)
- [Language specific guides](#language-specific-guides)
- [Supported exporters](#supported-exporters)
- [Writing a custom exporter](#writing-a-custom-exporter)


### Exporters
An exporter sends traces and metrics to any backend that is capable of consuming them.
The exporter itself can change without requiring a change in your client code. This is what makes OpenCensus truly vendor agnostic.
Collect traces and metrics once, export simultaneously to various backends!

OpenCensus exporters can be contributed by anyone, and we provide support for several
open source backends and vendors out-of-the-box.

We also provide guides on how to [write a custom exporter](#writing-a-custom-exporter) in your desired language.

### Language vs available exporters matrix

<abbr class="trace-exporter blue white-text">T</abbr> Backend supports Tracing

<abbr class="stats-exporter teal white-text">S</abbr> Backend supports Stats
{{<feature-matrix>}}


### Language specific guides
<abbr class="trace-exporter blue white-text">T</abbr> Tracing guide available

<abbr class="stats-exporter teal white-text">S</abbr> Stats guide available

#### Supported exporters
{{<card-exporter target-url="supported-exporters/go" src="/images/gopher.png" lang="Go" tracing="true" stats="true">}}
{{<card-exporter target-url="supported-exporters/java" src="/images/java-icon.png" lang="Java" tracing="true" stats="true">}}
{{<card-exporter target-url="supported-exporters/python" src="/images/python-icon.png" lang="Python" tracing="true" stats="true">}}
{{<card-exporter target-url="supported-exporters/node.js" src="/images/nodejs.png" lang="Node.js" tracing="true" stats="true">}}

#### Writing a custom exporter
{{<card-exporter target-url="custom-exporter/go" src="/images/gopher.png" lang="Go" tracing="true" stats="true">}}
{{<card-exporter target-url="custom-exporter/java" src="/images/java-icon.png" lang="Java" tracing="true">}}
{{<card-exporter target-url="custom-exporter/node.js" src="/images/nodejs.png" lang="Node.js" tracing="true" stats="true">}}
