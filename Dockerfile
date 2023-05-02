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

# Dockerfile for a build environment with the correct version of hugo and needed deps

FROM debian:bullseye
RUN apt update && apt upgrade -y && apt install -y wget git curl
RUN wget -O /tmp/hugo.deb https://github.com/gohugoio/hugo/releases/download/v0.32/hugo_0.32_Linux-64bit.deb && \
	dpkg -i /tmp/hugo.deb
