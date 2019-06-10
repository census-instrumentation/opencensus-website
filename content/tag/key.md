---
title: "TagKey"
weight: 1
aliases: [/core-concepts/tags/tagkey]
---

- [TagKey](#tagkey)
- [Restrictions](#restrictions)
- [References](#references)

### TagKey
The key to filter or group metrics.

### Restrictions

* It MUST contain only printable ASCII (codes between 32 and 126, inclusive)
* The length must be greater than zero and less than 256

### Example
{{<tabs Go Python Java CplusPlus NodeJS>}}
{{<highlight go>}}
import "go.opencensus.io/tag"

keyMethod, _ := tag.NewKey("method")
{{</highlight>}}

{{<highlight python>}}
import opencensus.tags import tag_key

keyMethod = tag_key.TagKey("method")
{{</highlight>}}

{{<highlight java>}}
import io.opencensus.tags.Tags;

private static final TagKey KEY_METHOD = TagKey.create("method");
{{</highlight>}}

{{<highlight cpp>}}
#include "opencensus/tags/tag_key.h"

// Initialize on demand in order to avoid initialization order issues.
opencensus::tags::TagKey MethodKey() {
  static const auto key = opencensus::tags::TagKey::Register("method");
  return key;
}
{{</highlight>}}

{{<highlight javascript>}}
const methodKey = { name: "method" };
{{</highlight>}}
{{</tabs>}}

### References

Resource|URL
---|---
Specs definition|[specs/TagContext.TagKey](https://github.com/census-instrumentation/opencensus-specs/blob/master/tags/TagMap.md#tagkey)
Go TagKey API|[TagKey](https://godoc.org/go.opencensus.io/tag#Key)
Java TagKey API|[TagKey JavaDoc](https://static.javadoc.io/io.opencensus/opencensus-api/0.16.1/io/opencensus/tags/TagKey.html)
Python TagKey reference|[Github implementation](https://github.com/census-instrumentation/opencensus-python/blob/fc42d70f0c9f423b22d0d6a55cc1ffb0e3e478c8/opencensus/tags/tag_key.py#L15-L34)
C++ Tags reference|[Tags source](https://github.com/census-instrumentation/opencensus-cpp/tree/master/opencensus/tags)
Node.js TagKey reference|[Github implementation](https://github.com/census-instrumentation/opencensus-node/blob/master/packages/opencensus-core/src/tags/types.ts#L17-L21)
