# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 0.NEXT (Unreleased)

### Changed
n/a

### Fixed
n/a

### Added
n/a

## 0.2.1

### Changed
n/a

### Fixed

- Complex fields (collections, shapes) now actually validate the way they 
  should when nested.

### Added
n/a

## 0.2.0

### Changed

- [BC Break] The fields passed to user components are now object, rather than
  functions. Props for fields are accessible at `this.props.fields.fieldName.props()`.
- [BC Break] Field implementations are now required to return a validation
  context from their `validate` methods. Can be the context passed in or a 
  a different instance.

### Fixed
n/a

### Added

- Collection field types
- Shape field types
