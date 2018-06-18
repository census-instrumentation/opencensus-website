+++
Description = "faq"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "main"

title = "FAQ"
date = "2018-05-10T14:14:33-05:00"
+++

{{% sc_faq %}}
&nbsp;  

<!-- COLLAPSIBLE ACCORDION START-->
<div class="accordion">
<dl>
<dt>
<a href="#accordion1" aria-expanded="false" aria-controls="accordion1" class="accordion-title accordionTitle js-accordionTrigger">+ Who is behind OpenCensus?</a>
</dt>
<dd class="accordion-content accordionItem is-collapsed" id="accordion1" aria-hidden="true">
<p>OpenCensus is being developed by a group of cloud providers, Application Performance Management vendors, and open source contributors. This project is hosted on <a href="https://github.com/census-instrumentation" target="_blank"><span class="content">GitHub</span></a> and all work occurs there.</p><p>OpenCensus was initiated by Google, and is based on instrumentation systems used inside of Google. OpenCensus is a complete rewrite of the Google system and has no Google intellectual property.</p>
</dd>
<hr>
<dt>
<a href="#accordion2" aria-expanded="false" aria-controls="accordion2" class="accordion-title accordionTitle js-accordionTrigger">+ How does OpenCensus benefit the ecosystem?</a>
</dt>
<dd class="accordion-content accordionItem is-collapsed" id="accordion2" aria-hidden="true">
<p>1. Making application metrics and distributed traces more accessible to developers. Today, one of the biggest challenges with gathering this information is the lack of good automatic instrumentation, as tracing and APM vendors have typically supplied their own limited, incompatible instrumentation solutions. With OpenCensus, more developers will be able to use these tools, which will improve the overall quality of their services and the web at large.</p>
<p>2. APM vendors will benefit from less setup friction for customers, broader language and framework coverage, and reduced effort spent in designing and maintaining their own instrumentation.</p>
<p>3. Local debugging capabilities. OpenCensus’s optional agent can be used to view requests and metrics locally and can dynamically change the sampling rate of traces, both of which are incredibly useful during critical production debugging sessions.</p>
<p>4. Collaboration and support from vendors (cloud providers like Google and Microsoft in addition to APM companies) and open source providers (Zipkin). As the OpenCensus libraries include instrumentation hooks into various web and RPC frameworks and exporters, they are immediately useful out of the box.</p>
<p>5. Allowing service providers to better debug customer issues. As OpenCensus defines a common context propagation format, customers experiencing issues can provide a request ID to providers so that they can debug the problem together. Ideally, providers can trace the same requests as customers, even if they are using different analysis systems.</p>
</dd>
<hr>
<dt>
<a href="#accordion3" aria-expanded="false" aria-controls="accordion3" class="accordion-title accordionTitle js-accordionTrigger">+ What languages &amp; integrations does OpenCensus support?</a>
</dt>
<dd class="accordion-content accordionItem is-collapsed" id="accordion3" aria-hidden="true">
{{< sc_supportedLanguages />}}
</dd>
<hr>
<dt>
<a href="#accordion4" aria-expanded="false" aria-controls="accordion4" class="accordion-title accordionTitle js-accordionTrigger">+ What Exporters does OpenCensus support?</a>
</dt>
<dd class="accordion-content accordionItem is-collapsed" id="accordion4" aria-hidden="true">
{{< sc_supportedExporters />}}
</dd>
<hr>
<dt>
<a href="#accordion6" aria-expanded="false" aria-controls="accordion6" class="accordion-title accordionTitle js-accordionTrigger">+ How do I use OpenCensus in my application?</a>
</dt>
<dd class="accordion-content accordionItem is-collapsed" id="accordion6" aria-hidden="true">
  <ul>
<li>If you are using a supported application framework, follow its instructions for configuring OpenCensus.</li><li>Choose a supported APM tool and follow its configuration instructions for using OpenCensus.</li><li>You can also use the OpenCensus z-Pages to view your tracing data without an APM tool.</li><li>A user’s guide will be released as soon as possible.</li></ul>
</dd>
<hr>
<dt>
<a href="#accordion7" aria-expanded="false" aria-controls="accordion7" class="accordion-title accordionTitle js-accordionTrigger">+ How do I integrate OpenCensus with my framework?</a>
</dt>
<dd class="accordion-content accordionItem is-collapsed" id="accordion7" aria-hidden="true">
  <p>See the <a href="https://github.com/census-instrumentation/opencensus-cpp" target="_blank"><span>OpenCensus Guide for Framework Developers.</span></a></p>
</dd>
<hr>
<dt>
<a href="#accordion8" aria-expanded="false" aria-controls="accordion8" class="accordion-title accordionTitle js-accordionTrigger">+ What are the z-Pages?</a>
</dt>
<dd class="accordion-content accordionItem is-collapsed" id="accordion8" aria-hidden="true">
<p>OpenCensus provides a stand-alone application that uses a gRPC channel to communicate with the OpenCensus code linked into your application. The application displays configuration parameters and trace information in real time held in the OpenCensus library.</p>
</dd>
<hr>
<dt>
<a href="#accordion9" aria-expanded="false" aria-controls="accordion9" class="accordion-title accordionTitle js-accordionTrigger">+ How can I contribute to OpenCensus?</a>
</dt>
<dd class="accordion-content accordionItem is-collapsed" id="accordion9" aria-hidden="true">
<p>&bull; Help people on the discussion forums.</p><p>&bull; Tell us your success story using OpenCensus.</p><p>&bull; Tell us how we can improve OpenCensus, and help us do it.</p><p>&bull; Contribute to an existing library or create one for a new language.</p><p>&bull; Integrate OpenCensus with a new framework.</p><p>&bull; Integrate OpenCensus with a new APM tool.</p>
</dd>
<hr>
</dl><!-- COLLAPSIBLE ACCORDION CONTENT END -->
</div><!-- END ACCORION -->

{{% /sc_faq %}}

