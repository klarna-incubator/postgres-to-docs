# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - yyyy-mm-dd

### Added
- New output formats and options:
  - LLM-optimized JSON format for AI consumption
  - Separate `folder` and `fileName` configuration options
  - Ability to generate both markdown and JSON outputs simultaneously
- Entity Relationship Diagrams using Mermaid.js
- Function documentation support:
  - Full function signatures
  - Function definitions
  - Language and volatility information
- Row Level Security (RLS) policy documentation:
  - Policy definitions
  - USING expressions
  - WITH CHECK expressions
  - Role assignments
- Enhanced schema documentation:
  - Table and column comments
  - View definitions and comments
  - Default values for columns
- Environment variable support:
  - `.env` and `.env.local` file support
  - Database connection string via `DB_STRING`
- Table of Contents generation
- Pure markdown mode (no HTML)

### Changed
- Replaced single `output` option with `folder` and `fileName` for more flexibility
- Improved configuration handling with better defaults
- Enhanced CLI argument support for all configuration options

## [0.1.1] - 2020-03-15

### Added
- Initial release

<!-- Markdown link dfn's -->
[unreleased]: https://github.com/klarna-incubator/postgres-to-docs/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/klarna-incubator/postgres-to-docs/releases/tag/v0.1.1
