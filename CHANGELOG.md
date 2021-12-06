# Changelog
All notable changes to this project will be documented in this file.

## [0.15.3] - 2021-12-06
### Changed
- Update to core 0.15.1 

## [0.15.2] - 2021-12-04

### Fixed
- Update to fixed database bundles
- Export DB Classes in root file

## [0.15.1] - 2021-12-03

### Fixed
- Linting error
- DB Duplication

## [0.15.0] - 2021-12-02
### Added
- Add Changelog
- Add ORM System 
- Add reflection Typescript feature (for ORM)
````json
 {
  "dependencies": {
    "reflect-metadata": "^0.1.13"
  }
}
````
- `GKey` Store 
- `GKey` - ORM Entity
### Changed
- Update to core version `0.15.0`
- Change tsconfig.json enable decorator feature 
````json
 {
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
````


### Removed
- legacy keystore  

### Fixed
> bundle export nameSpace 

