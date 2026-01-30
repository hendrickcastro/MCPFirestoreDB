# Changelog

All notable changes to this project will be documented in this file.

## [1.1.1] - 2026-01-30

### Fixed
- Fixed `__dirname is not defined` error when running the package via npx
- Modified build configuration to exclude bundling of external dependencies (@google-cloud/firestore, @modelcontextprotocol/sdk, dotenv)
- Reduced bundle size from 4.5MB to 43.8KB by not bundling Google Cloud dependencies
- Server now works correctly when installed from npm registry

### Changed
- Updated esbuild configuration to mark critical dependencies as external

## [1.1.0] - 2025-XX-XX

### Added
- Initial release with 17 Firestore tools
- Document CRUD operations
- Batch operations
- Collection management
- Index operations
