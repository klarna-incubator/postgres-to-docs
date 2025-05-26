# Postgres to Docs
[![Build Status][ci-image]][ci-url]
[![License][license-image]][license-url]
[![Developed at Klarna][klarna-image]][klarna-url]

Make your database documentation smooth by generating markdown for your schema. You need to get a quick and easy overview of your database schema but don't want to...
* Open the source code and find the model definitions
* Start your database and service, install dependencies, have a proper configuration, and open an external tool like TablePlus or DBeaver
* Read through your migrations directory to find the latest version of your schema
* Look through external documentation that might be out of date

## Features
postgres-to-docs generates comprehensive documentation for your PostgreSQL database schema:

### Documentation Elements
- [x] Tables
  - Primary Keys
  - Foreign Keys
  - Nullable fields
  - Default values
  - Column comments
- [x] Views
  - Column definitions
  - View comments
- [x] User-defined Types
  - Composite types
  - Enums
- [x] Functions
  - Full signatures
  - Arguments and return types
  - Function definitions
  - Language and volatility
- [x] Row Level Security (RLS) Policies
  - Policy definitions
  - USING expressions
  - WITH CHECK expressions
  - Applicable roles
- [x] Entity Relationship Diagrams
  - Mermaid.js format
  - Visual representation of relationships
  - Table structure visualization

### Output Formats
- [x] Markdown
  - Clean, readable documentation
  - Table of Contents
  - Hyperlinked references
  - Optional pure markdown mode (no HTML)
- [x] LLM-optimized JSON
  - Structured schema information
  - Complete metadata
  - Optimized for AI consumption
  - Includes schema statistics

### Configuration Options
- **Output Control**
  - `folder`: Output directory (default: "docs")
  - `fileName`: Base name for output files (default: "schema")
  - `pureMarkdown`: Generate clean markdown without HTML
  - `llmFormat`: Generate additional LLM-friendly JSON format
- **Content Filtering**
  - `includeTables`: List of tables to include
  - `excludeTables`: List of tables to exclude
  - `includeTypes`: Include user-defined types
  - `includeRLS`: Include RLS policies
  - `includeFunctions`: Include function definitions
  - `includeDiagram`: Include ER diagram
  - `includeToc`: Include table of contents
- **Database Connection**
  - Support for connection string or individual parameters
  - Environment variable support through `.env` files

## Usage

1.  Install through npm
    ```bash
    npm install @klarna/postgres-to-docs
    ```

2. Define a `postgrestodocs.json` config file
    ```json
    {
        "host": "localhost",
        "port": 5432,
        "user": "user",
        "password": "password",
        "database": "database",
        "schema": "public",
        "folder": "docs",
        "fileName": "schema",
        "includeTables": [],
        "exludeTables": [],
        "includeTypes": true,
        "pureMarkdown": false,
        "includeRLS": true,
        "includeToc": true,
        "includeFunctions": true,
        "includeDiagram": true,
        "llmFormat": false
    }
    ```
3. Run the tool
    ```bash
    postgres-to-docs
    ```

### Environment Variables
You can use environment variables to avoid storing sensitive database credentials in your configuration file. The tool supports both `.env` and `.env.local` files, with `.env.local` taking precedence.

Create a `.env` or `.env.local` file or add the following to your existing `.env` file:
```env
# Database connection string
DB_STRING=postgresql://user:password@localhost:5432/database
```

The tool will:
1. Look for `.env.local` first (good for local development overrides)
2. Then look for `.env` (good for team-shared defaults)
3. Use DB_STRING to override the connection parameters if found
4. Fall back to the explicit values in the config file if DB_STRING is not found

**Best Practice**: Add `.env.local` to your `.gitignore` file to keep sensitive credentials out of version control:
```gitignore
.env.local
```

### CLI Options
All configuration options can be overridden via CLI arguments:
```bash
postgres-to-docs --folder=my-docs --fileName=my-schema --llmFormat=true
```

## Development
Clone the repo, then:

```bash
npm install
npm run start:dev
```

## How to contribute

See our guide on [contributing](.github/CONTRIBUTING.md).

## Release History

See our [changelog](CHANGELOG.md).

## License

Copyright © 2021 Klarna Bank AB

For license details, see the [LICENSE](LICENSE) file in the root of this project.

Contributors:
- [@hankanman](https://github.com/hankanman)

<!-- Markdown link & img dfn's -->
[ci-image]: https://img.shields.io/badge/build-passing-brightgreen?style=flat-square
[ci-url]: https://github.com/klarna-incubator/TODO
[license-image]: https://img.shields.io/badge/license-Apache%202-blue?style=flat-square
[license-url]: http://www.apache.org/licenses/LICENSE-2.0
[klarna-image]: https://img.shields.io/badge/%20-Developed%20at%20Klarna-black?labelColor=ffb3c7&style=flat-square&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAOCAYAAAAmL5yKAAAAAXNSR0IArs4c6QAAAIRlWElmTU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAALQAAAAAQAAAtAAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAABCgAwAEAAAAAQAAAA4AAAAA0LMKiwAAAAlwSFlzAABuugAAbroB1t6xFwAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAAVBJREFUKBVtkz0vREEUhsdXgo5qJXohkUgQ0fgFNFpR2V5ClP6CQu9PiB6lEL1I7B9A4/treZ47c252s97k2ffMmZkz5869m1JKL/AFbzAHaiRbmsIf4BdaMAZqMFsOXNxXkroKbxCPV5l8yHOJLVipn9/vEreLa7FguSN3S2ynA/ATeQuI8tTY6OOY34DQaQnq9mPCDtxoBwuRxPfAvPMWnARlB12KAi6eLTPruOOP4gcl33O6+Sjgc83DJkRH+h2MgorLzaPy68W48BG2S+xYnmAa1L+nOxEduMH3fgjGFvZeVkANZau68B6CrgJxWosFFpF7iG+h5wKZqwt42qIJtARu/ix+gqsosEq8D35o6R3c7OL4lAnTDljEe9B3Qa2BYzmHemDCt6Diwo6JY7E+A82OnN9HuoBruAQvUQ1nSxP4GVzBDRyBfygf6RW2/gD3NmEv+K/DZgAAAABJRU5ErkJggg==
[klarna-url]: https://github.com/klarna-incubator