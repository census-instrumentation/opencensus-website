+++
title = "Troubleshooting"
type = "leftnav"
+++

This page contains several use cases
OpenCensus data helps fixing outages
and debugging issues in production.

---

## High Error Rate

Operations team gets an alert due to increased
error rate for the `inbox.Timeline.Messages` RPC handler.
The team looks at the dashboards and confirms that
the handler is violating the error rate SLO.

![High Error Rate for RPC](/img/troubleshoot-errorsrpc.png)

In order to debug, they query the tracing backend
to search for a trace where
inbox.Timeline.Messages span is errored.

![Errored Span](/img/troubleshoot-errortrace.png)

From the traces, it is visible that mysql.Query is
consistently erroring for inbox.Timeline.Messages.
The error is INVALID_ARGUMENT.

Carefully investigating the code, they see that
there is an escaping problem with the MySQL query.

![Invalid Query](/img/troubleshoot-invalid.png)

Developer team patches the handler and publishes a new release.
The error is gone and the error rate returns back to normal.

---

## Unexpected Retries

Operations team gets an alert for increasing latency for
the `/timeline` HTTP handler.
The team looks at the dashboards and confirms that
the handler is violating the latency SLO.

![Unexpected HTTP Latency](/img/troubleshoot-retries.png)

They query the traces to find a /timeline span that
taking more than 100ms.

![Retried spans](/img/troubleshoot-retriedspans.png)

From the traces, it is visible that auth.AccessToken
is often retried when serving the /timeline endpoint.

By looking at the logs with the NetOps team and they
realize that there is a networking outage affecting
the requests between the HTTP server and the auth service.

Operations fix the networking issue and retries 
don’t happen as frequently as they happened during the outage.
Latency returns back to normal.

---

## Cache misses

Operations get an alert for increasing latency for
the `inbox.Timeline.Messages` RPC handler.
Team looks at the dashboards and confirms that
inbox.Timeline.Messages handler is violating the latency SLO.

![Unexpected RPC Latency](/img/troubleshoot-cachemiss.png)

They search for a trace where inbox.Timeline.Messages
span is taking more than 100ms and violating the SLOs.

![No Caching](/img/troubleshoot-nocacheput.png)

They realize for all cases inbox.Timeline.Messages
are querying the database and never see any cache hits.
By looking at the handler source code, they see
the latest development push mistakenly removed the
cache.Put call after database is queries.

They roll back the new release and fix the bug.

With the new release, the results are cached and
the RPC handler’s latency is in the target SLO.

![Cached](/img/troubleshoot-cached.png)
