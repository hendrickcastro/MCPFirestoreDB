# Changelog

All notable changes to this project will be documented in this file.

## [1.1.2] - 2026-01-30

### Documentation
- Updated README.md with npm package as the primary recommended installation method
- Highlighted benefits of using npm package (no installation, automatic updates, bug fixes)
- Updated all configuration examples to use mcpfirestoredb@1.1.2
- Updated cursor_mcp_config.example.json with npm installation
- Updated claude_desktop_config.example.json with npm installation
- Improved documentation structure for better clarity

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
