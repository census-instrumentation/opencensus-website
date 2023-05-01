# Deploying (for maintainers)

The site is hosted in firebase and you must have access to the `opencensusio` project to
deploy. Travis CI used to deploy things automatically but that is no longer working. Instead,
follow these steps:

First, [install the Firebase CLI](https://firebase.google.com/docs/cli#setup_update_cli) and
[login](https://firebase.google.com/docs/cli#sign-in-test-cli). Then, checkout the repo and run
the following commands:

```sh
# Clean everything for a fresh build
git clean -fdx

# Run the build in a docker container
./build.sh

# Optionally serve the firebase project locally
firebase serve --only hosting --host 0.0.0.0

# Finally deploy the result
firebase deploy --project opencensusio
```
