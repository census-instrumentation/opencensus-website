#!/bin/bash
# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -xe

docker build -t oc-website .
docker run --rm -i -u "$UID" -v "$PWD:$PWD" -w "$PWD" oc-website bash <<EOF
set -xe

# commands copied from .travis.yml
curl -L https://github.com/census-instrumentation/opencensus-php/archive/gh-pages.tar.gz | tar -xz --strip-components=1 -C static/api/php
curl -L https://github.com/census-instrumentation/opencensus-python/archive/gh-pages.tar.gz | tar -xz --strip-components=1 -C static/api/python
hugo
EOF
