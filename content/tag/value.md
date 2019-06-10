---
title: "TagValue"
weight: 2
aliases: [/core-concepts/tags/tagvalue]
---

- [TagValue](#tagvalue)
- [Restrictions](#restrictions)
- [References](#references)

### TagValue
The value that gives meaning to the [TagKey](/tag/key).


### Restrictions
* It MUST contain only printable ASCII (codes between 32 and 126, inclusive)
* The length of a TagValue must be greater than zero and less than 256

### Example
{{<tabs Go Python Java CplusPlus NodeJS>}}
{{<highlight go>}}
import "go.opencensus.io/tag"

mutator = tag.Upsert(keyMethod, "memcache.Client.Get")
{{</highlight>}}

{{<highlight python>}}
from opencensus.tags import tag_value

value = tag_value.TagValue('memcache.Client.Get')
{{</highlight>}}

{{<highlight java>}}
import io.opencensus.tags.Tags.TagValue;

TagValue value = TagValue.create("memcache.Client.Get");
{{</highlight>}}

{{<highlight cpp>}}
#include "absl/strings/string_view.h"

ABSL_CONST_INIT const absl::string_view kGetMethod =
    "memcache.Client.Get";
{{</highlight>}}

{{<highlight javascript>}}
const methodValue = { value: "memcache.Client.Get" };
{{</highlight>}}
{{</tabs>}}

### References

Resource|URL
---|---
Specs reference|[specs/TagContext.TagValue](https://github.com/census-instrumentation/opencensus-specs/blob/master/tags/TagMap.md#tagvalue)
Go TagValue API|[TagMutator](https://godoc.org/go.opencensus.io/tag#Mutator)
Java TagValue API|[TagValue JavaDoc](https://static.javadoc.io/io.opencensus/opencensus-api/0.16.1/io/opencensus/tags/TagValue.html)
Python TagValue reference|[Github implementation](https://github.com/census-instrumentation/opencensus-python/blob/fc42d70f0c9f423b22d0d6a55cc1ffb0e3e478c8/opencensus/tags/tag_value.py#L15-L34)
C++ Tags reference|[Tags source](https://github.com/census-instrumentation/opencensus-cpp/tree/master/opencensus/tags)
Node.js TagValue reference|[Github implementation](https://github.com/census-instrumentation/opencensus-node/blob/master/packages/opencensus-core/src/tags/types.ts#L23-L27)
