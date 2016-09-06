# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 0.2 (Unreleased)

### Changed

- [BC Break] The fields passed to user components are now object, rather than
  functions. Props for fields are accessible at `this.props.fields.fieldName.props()`.
- [BC Break] Field implementations are now required to return a validation
  context from their `validate` methods. Can be the context passed in or a 
  a different instance.

### Fixed
n/a

### Added

- Collection form types
