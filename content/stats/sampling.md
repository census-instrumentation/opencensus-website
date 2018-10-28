---
title: "Sampling"
weight: 4
aliases: [/core-concepts/metrics/sampling]
---

#### Sampling

Stats are NOT sampled to be able to represent uncommon
cases hence, stats are ALWAYS recorded unless [\[1\] dropped](#1-dropped).

The reasoning behind this is that outlier statistics such as "99th latency event"
occur rarely but also occur unpredictably. If our recording system has a low sampling,
we are most likely to miss recording such events. In addition, unlike spans, recording
measurements only requires updating aggregated data (view data) rather than creating 
new objects, so it is relatively light-weight even always sampled. Hence this is the 
reason why stats are NOT sampled but are ALWAYS recorded.

This video below "How NOT to Measure Latency" by Gil Tene might help with understanding this decision.

[![How NOT to Measure Latency](http://img.youtube.com/vi/lJ8ydIuPFeU/0.jpg)](http://www.youtube.com/watch?v=lJ8ydIuPFeU)


###### [1] dropped:
Measurements are dropped if the user is not aggregating them using [Views](/stats/views)
