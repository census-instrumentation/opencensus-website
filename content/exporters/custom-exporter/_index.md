---
title: "Writing a custom exporter"
draft: false
weight: 56
class: "resized-logo"
aliases: [/custom_exporter, /guides/exporters/custom-exporter]
logo: /images/opencensus-logo.png
---

As already introduced, OpenCensus is a vendor-agnostic library that allows you collect traces and metrics, allowing you
to export that data to backends of your choice, in your applications.

The OpenCensus community has and continues to implement [various exporters](/guides/exporters/supported-exporters/).

However, this guide is to enable anyone and any vendor to implement their custom exporter as per languages:

<abbr class="trace-exporter blue white-text">T</abbr> Tracing guide available

<abbr class="stats-exporter teal white-text">S</abbr> Stats guide available

{{<card-exporter target-url="cpp" src="/images/cpp.png" lang="C++" tracing="true">}}
{{<card-exporter target-url="go" src="/images/gopher.png" lang="Go" tracing="true" stats="true">}}
{{<card-exporter target-url="java" src="/images/java-icon.png" lang="Java" tracing="true" stats="true">}}
{{<card-exporter target-url="node.js" src="/images/nodejs.png" lang="Node.js" tracing="true" stats="true">}}
