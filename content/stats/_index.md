---
title: "Stats/Metrics"
weight: 4
aliases: [/core-concepts/metrics]
---

Application and request metrics are important indicators
of availability. Custom metrics can provide insights into
how availability indicators impact user experience or the business.
Collected data can help automatically
generate alerts at an outage or trigger better scheduling
decisions to scale up a deployment automatically upon high demand.


Stats collection allows users to collect custom metrics and provide
a set of predefined metrics through the framework integrations.
Collected data can be multidimensional and
it can be filtered and grouped by [tags](/tags).

Stats collection requires two steps:  

* Definition of measures and recording of data points.
* Definition and registration of views to aggregate the recorded values.

#### Exporting

Collected data is aggregated and exported to stats collection
backends of your choice, by registering an exporter.

Exporting every individual measurement would be very expensive in terms of network bandwidth and CPU costs.
This is why stats collection aggregates data in the process and exports only the aggregated data.

Multiple exporters can be registered to upload the data to various different backends.
Users can unregister the exporters if they no longer are needed.
See [exporters](/core-concepts/exporters) to learn more about exporters.

#### Next steps
To explore stats, please continue reading these sections

{{% children %}}
