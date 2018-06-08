+++
Description = "roadmap"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "main"

title = "Roadmap"
date = "2018-05-11T12:09:08-05:00"
+++

{{% sc_roadmap %}}

#### OpenCensus’s journey ahead: [{{< sc_gloss1 >}}platforms and languages{{< /sc_gloss1 >}}](https://opensource.googleblog.com/2018/05/opencensus-journey-ahead-part-1.html)  
&nbsp;  

---
&nbsp;

#### Languages  
&nbsp;  

<table>
  <thead>
    <tr>
	  <th scope="col">Language</th>
	  <th scope="col">Tracing</th>
	  <th scope="col">Stats</th>
    </tr>
  </thead>
  <tbody>
    <tr>
	  <td data-label="Language: &nbsp; "><a href="https://github.com/census-instrumentation/opencensus-cpp" target="_blank" class="gloss1">C++</a></td>
	  <td data-label="Tracing: &nbsp; ">Supported</td>
	  <td data-label="Stats: &nbsp; ">Supported</td>
	</tr>
	<tr>
	  <td scope="row" data-label="Language: &nbsp; "><a href="https://github.com/census-instrumentation/opencensus-erlang" target="_blank" class="gloss1">Erlang</a></td>
	  <td data-label="Tracing: &nbsp; ">Supported</td>
	  <td data-label="Stats: &nbsp; ">Supported</td>
	</tr>
	<tr>
	  <td scope="row" data-label="Language: &nbsp; "><a href="https://github.com/census-instrumentation/opencensus-go" target="_blank" class="gloss1">Go</a></td>
	  <td data-label="Tracing: &nbsp; ">Supported</td>
	  <td data-label="Stats: &nbsp; ">Supported</td>
	</tr>
	<tr>
	  <td scope="row" data-label="Language: &nbsp; "><a href="https://github.com/census-instrumentation/opencensus-java" target="_blank" class="gloss1">Java (JVM, OpenJDK, Android)</a></td>
	  <td data-label="Tracing: &nbsp; ">Supported</td>
	  <td data-label="Stats: &nbsp; ">Supported</td>
	</tr>
	<tr>
	  <td scope="row" data-label="Language: &nbsp; "><a href="https://github.com/census-instrumentation/opencensus-php" target="_blank" class="gloss1">PHP</a></td>
	  <td data-label="Tracing: &nbsp; ">Supported</td>
	  <td data-label="Stats: &nbsp; ">Planned</td>
	</tr>
	<tr>
	  <td scope="row" data-label="Language: &nbsp; "><a href="https://github.com/census-instrumentation/opencensus-python" target="_blank" class="gloss1">Python</a></td>
	  <td data-label="Tracing: &nbsp; ">Supported</td>
	  <td data-label="Stats: &nbsp; ">In Progress</td>
	</tr>
	<tr>
	  <td scope="row" data-label="Language: &nbsp; "><a href="https://github.com/census-instrumentation/opencensus-ruby" target="_blank" class="gloss1">Ruby</a></td>
	  <td data-label="Tracing: &nbsp; ">Supported</td>
	  <td data-label="Stats: &nbsp; ">Planned</td>
	</tr>
  </tbody>
</table>

&nbsp;  

---
&nbsp;  

#### Exporters  

<table>
  <thead>
	<tr>
	  <th scope="col">Backend</th>
	  <th scope="col">Go</th>
	  <th scope="col">Java</th>
	  <th scope="col">Erlang</th>
	  <th scope="col">C++</th>
	  <th scope="col">Python</th>
	</tr>
  </thead>
  <tbody>
	<tr>
	  <td data-label="Backend: &nbsp; ">SignalFX</td>
	  <td data-label="Go: &nbsp; " class="tall">No <a href="https://github.com/census-instrumentation/opencensus-go/issues/360" target="_blank" class="gloss1">(open issue)</a></td>
	  <td data-label="Java: &nbsp; ">Yes</td>
	  <td data-label="Erlang: &nbsp; ">No</td>
	  <td data-label="C++: &nbsp; ">No</td>
	  <td data-label="Python: &nbsp; ">No</td>
	</tr>
	<tr>
	  <td data-label="Backend: &nbsp; ">Prometheus</td>
	  <td data-label="Go: &nbsp; ">Yes</td>
	  <td data-label="Java: &nbsp; ">Yes</span></a></td>
	  <td data-label="Erlang: &nbsp; ">Yes</td>
	  <td data-label="C++: &nbsp; ">No</td>
	  <td data-label="Python: &nbsp; ">No</td>
	</tr>
	<tr>
	  <td data-label="Backend: &nbsp; ">Jaeger</td>
	  <td data-label="Go: &nbsp; ">Yes</td>
	  <td data-label="Java: &nbsp; ">No</td>
	  <td data-label="Erlang: &nbsp; ">No</td>
	  <td data-label="C++: &nbsp; ">No</td>
	  <td data-label="Python: &nbsp; ">No</td>
	</tr>
	<tr>
	  <td data-label="Backend: &nbsp; ">Stackdriver</td>
	  <td data-label="Go: &nbsp; ">Yes</td>
	  <td data-label="Java: &nbsp; ">Yes</td>
	  <td data-label="Erlang: &nbsp; ">Yes (trace only)</td>
	  <td data-label="C++: &nbsp; ">No</td>
	  <td data-label="Python: &nbsp; ">Yes</td>
	</tr>
	<tr>
	  <td data-label="Backend: &nbsp; ">Zipkin</td>
	  <td data-label="Go: &nbsp; ">Yes</td>
	  <td data-label="Java: &nbsp; ">Yes</td>
	  <td data-label="Erlang: &nbsp; ">Yes</td>
	  <td data-label="C++: &nbsp; ">No</td>
	  <td data-label="Python: &nbsp; ">No</td>
	</tr>
  </tbody>
</table>

&nbsp;  

---
&nbsp;  

#### How do I contribute?

Contributions are highly appreciated! Please follow the steps for [{{< sc_gloss1 >}}Contribute Here.{{< /sc_gloss1 >}}]
(../community/index.html)

{{% /sc_roadmap %}}