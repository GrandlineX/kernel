# Changelog
All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-07-30
### Added
- Add EntitySchemaExtender
- Add BaseUserAgent
### Changed
- Update Deps

## [0.32.11] - 2024-07-13
### Changed
- Update Deps
- Error Handling for BaseApiAction

## [0.32.10] - 2023-10-06
### Changed
- Breaking Change: BaseApiAction now use XActionEvent

## [0.31.1] - 2023-07-07
### Added
- @/token pass the token body to jwt generator function
### Fixed
- Deal with code smells 

## [0.31.0] - 2023-07-06
### Added
- JTW Token now can be extended with custom payload
- Update to core 0.31.0
- Add forceDebug flag for BaseAction to force Server-Timing in production mode

## [0.30.0] - 2023-04-03
### Added
- Switch to ESM
- Update to core 0.30.0

## [0.27.1] - 2023-01-26
### Added
- Add raw body field for express calls 
- change BaseEndpoint variables from private to protected

## [0.25.2] - 2022-08-07
### Added
- Add express timing api in dev mode

## [0.25.0] - 2022-07-23
### Changed
- Update to core 0.25.0


## [0.18.0] - 2022-01-10
### Changed
- Update to core 0.18.0 

## [0.17.0] - 2022-01-03
### Changed
- Update to core 0.17.1
- Using db prefab for kernel db 

## [0.16.2] - 2021-12-17

### Changed
- Update Db Bundles with search bug


## [0.16.1] - 2021-12-07

### Changed
- Update to core 0.16.2

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

