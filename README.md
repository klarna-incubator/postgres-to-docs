# Postgres auto doc
> Make your database overview **smoooth**.

[![Build Status][ci-image]][ci-url]
[![License][license-image]][license-url]
[![Developed at Klarna][klarna-image]][klarna-url]


Postgres auto doc generates a human readable file for your database structure.

## First steps

<details>
 <summary>Installation (for Admins)</summary>
  
  Currently, new repositories can be created only by a Klarna Open Source community lead. Please reach out to us if you need assistance.
  
  1. Create a new repository by clicking ‘Use this template’ button.
  
  2. Make sure your newly created repository is private.
  
  3. Enable Dependabot alerts in your candidate repo settings under Security & analysis. You need to enable ‘Allow GitHub to perform read-only analysis of this repository’ first.
</details>

TODO

## Problem

> You want to get a quick and easy overview of the database setup In your services, for example when having a technical discussion or writing a discovery. You have to start the entire service (pull images, start containers, have to correct config) and open e.g table plus, 
or check through the migrations to see how they are configured.

It would be beneficial to have an external source of database docs that is easier to open and understand. 
 However, just introducing more manual documentation (or having to screenshot an external application like table plus) introduces another piece to maintain and keep up to date.

## Introducing auto docs!

* Keeping docs up to date automatically. The team doesn’t have to maintain documentation that is separate from postgres/code
* Only requires the service to run when generating the docs, not when viewing them



## Extensions
* CLI / runner - the user facing interface that can be used to run the script
* Generator script
* Visualization script
* Extensions
* More export types, e.g a png with a entity relationship diagram
* Performance, currently a log of queries
* Watch mode to run the script automatically when a directory changes. E.g put watch mode on the migrations directory and re run.
* Tests

#### How to
Create an example project that: 
* Starts a Postgres database
* Runs migrations/creates tables
* Runs the auto doc script
* Saves the result to an md-file
* Reference the file in a readme

## Usage example

TODO

_For more examples and usage, please refer to the [Docs](TODO)._

## Development setup

TODO

```sh
make install
npm test
```

## How to contribute

See our guide on [contributing](.github/CONTRIBUTING.md).

## Release History

See our [changelog](CHANGELOG.md).

## License

Copyright © 2021 Klarna Bank AB

For license details, see the [LICENSE](LICENSE) file in the root of this project.


<!-- Markdown link & img dfn's -->
[ci-image]: https://img.shields.io/badge/build-passing-brightgreen?style=flat-square
[ci-url]: https://github.com/klarna-incubator/TODO
[license-image]: https://img.shields.io/badge/license-Apache%202-blue?style=flat-square
[license-url]: http://www.apache.org/licenses/LICENSE-2.0
[klarna-image]: https://img.shields.io/badge/%20-Developed%20at%20Klarna-black?labelColor=ffb3c7&style=flat-square&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAOCAYAAAAmL5yKAAAAAXNSR0IArs4c6QAAAIRlWElmTU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAALQAAAAAQAAAtAAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAABCgAwAEAAAAAQAAAA4AAAAA0LMKiwAAAAlwSFlzAABuugAAbroB1t6xFwAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAAVBJREFUKBVtkz0vREEUhsdXgo5qJXohkUgQ0fgFNFpR2V5ClP6CQu9PiB6lEL1I7B9A4/treZ47c252s97k2ffMmZkz5869m1JKL/AFbzAHaiRbmsIf4BdaMAZqMFsOXNxXkroKbxCPV5l8yHOJLVipn9/vEreLa7FguSN3S2ynA/ATeQuI8tTY6OOY34DQaQnq9mPCDtxoBwuRxPfAvPMWnARlB12KAi6eLTPruOOP4gcl33O6+Sjgc83DJkRH+h2MgorLzaPy68W48BG2S+xYnmAa1L+nOxEduMH3fgjGFvZeVkANZau68B6CrgJxWosFFpF7iG+h5wKZqwt42qIJtARu/ix+gqsosEq8D35o6R3c7OL4lAnTDljEe9B3Qa2BYzmHemDCt6Diwo6JY7E+A82OnN9HuoBruAQvUQ1nSxP4GVzBDRyBfygf6RW2/gD3NmEv+K/DZgAAAABJRU5ErkJggg==
[klarna-url]: https://github.com/klarna-incubator
