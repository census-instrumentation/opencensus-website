+++
title = "Documentation"
+++

Welcome to the developer documentation for OpenCensus.
Learn about key OpenCensus concepts, find library docs,
reference material, and tutorials.

OpenCensus terminology is explained at the [glossary](/glossary).

---

## Concepts

* [Overview](/overview)
* [Tags](/tags)
* [Stats](/stats)
* [Exporters](/exporters)
* [Z-Pages](/zpages)

---

## Libraries

<div class="col-md-12 box" style="margin-top:20px">
	<div class="col-md-4 box" id="docbox">
		<table>
			<tr>
				<th data-label="C++:">C++</th>
			</tr>
			<tr>
				<td><a href="/cpp">Quickstart Guide</a></td>
			</tr>
			<tr>
				<td><a href="https://github.com/census-instrumentation/opencensus-cpp/blob/master/opencensus/stats/README.md">Stats API Reference</a></td>
			</tr>
			<tr>
				<td><a href="https://github.com/census-instrumentation/opencensus-cpp/blob/master/opencensus/trace/README.md">Trace API Reference</a></td>
			</tr>
		</table>
	</div>
	<div class="col-md-4 box" id="docbox">
		<table>
			<tr>
				<th data-label="Erlang:">Erlang</th>
			</tr>
			<tr>
				<td><a href="/erlang">Quickstart Guide</a></td>
			</tr>
			<tr>
				<td><a href="https://hexdocs.pm/opencensus/0.3.1/">API Reference</a></td>
			</tr>
			<tr>
				<td><a href="https://hex.pm/packages/opencensus">Package</a></td>
			</tr>
		</table>
	</div>
	<div class="col-md-4 box" id="docbox">
		<table>
			<tr>
				<th>Go</th>
			</tr>
			<tr>
				<td><a href="/go">Quickstart Guide</a></td>
			</tr>
			<tr>
				<td><a href="https://godoc.org/go.opencensus.io">API Reference</a></td>
			</tr>
			<tr>
				<td>&nbsp;</td>
			</tr>
		</table>
	</div>
</div>
<div class="col-md-12 box" style="margin-top:20px">
	<div class="col-md-4 box" id="docbox" style="align:left;">
		<table>
			<tr>
				<th>Java</th>
			</tr>
			<tr>
				<td><a href="/java">Quickstart Guide</a></td>
			</tr>
			<tr>
				<td><a href="https://www.javadoc.io/doc/io.opencensus/opencensus-api/">API Reference</a></td>
			</tr>
			<tr>
				<td>&nbsp;</td>
			</tr>
		</table>
	</div>
	<div class="col-md-4 box" id="docbox">
		<table>
			<tr>
				<th>PHP</th>
			</tr>
			<tr>
				<td><a href="/php">Quickstart Guide</a></td>
			</tr>
			<tr>
				<td><a href="https://packagist.org/packages/opencensus/opencensus">API Reference</a></td>
			</tr>
			<tr>
				<td>&nbsp;</td>
			</tr>
		</table>
	</div>
	<div class="col-md-4 box" id="docbox">
		<table>
			<tr>
				<th>Python</th>
			</tr>
			<tr>
			<td><a href="/python">Quickstart Guide</td>
			</tr>
			<tr>
				<td><a href="https://census-instrumentation.github.io/opencensus-python/trace/api/index.html">API Reference</a></td>
			</tr>
			<tr>
				<td>&nbsp;</td>
			</tr>
		</table>
	</div>
</div>
<div class="col-md-12 box" style="margin-top:20px">
	<div class="col-md-4 box" id="docbox">
		<table>
			<tr>
				<th>Ruby</th>
			</tr>
			<tr>
				<td><a href="/ruby">Quickstart Guide</a></td>
			</tr>
			<tr>
				<td><a href="https://www.rubydoc.info/gems/opencensus">API Reference</a></td>
			</tr>
			<tr>
				<td>&nbsp;</td>
			</tr>
		</table>
	</div>
</div>


<br clear="both">

---

## Use Cases

* [Cloud Spanner - Instrumented by OpenCensus and exported to Stackdriver][1]  
* [OpenCensus for gRPC Go][2]


[1]: https://medium.com/@orijtech/cloud-spanner-instrumented-by-opencensus-and-exported-to-stackdriver-6ed61ed6ab4e
[2]: /gogrpc
