# MCP Logging Compliance Update

## Date: January 2026
## Version: 1.0.1

## Change Description

This document describes the update to MCPFirestoreDB to comply with the Model Context Protocol (MCP) specification regarding logging handling in stdio transport.

## Problem Identified

According to the MCP specification, when using stdio transport:

- **stdout**: Must be reserved EXCLUSIVELY for JSON-RPC 2.0 messages
- **stderr**: Must be used for ALL other output (logs, debug, warnings, errors, status messages)

When a standard MCP client reads the stdout stream, it expects every line to be a parsable JSON object. When it encounters a plain text debug line like `Connecting to Firestore...`, it immediately throws a JSON parsing error, and the entire connection fails.

## Solution Implemented

Instead of using `console.log()` or `console.error()`, we now use `process.stderr.write()` directly through a helper function:

```typescript
// Helper function to write to stderr (MCP compliant - keeps stdout clean for JSON-RPC)
const log = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

// Usage
log('Connected to Firestore successfully');
log(`Project ID: ${config.projectId}`);
```

### Why `process.stderr.write()` instead of `console.error()`?

- `console.error()` semantically suggests an error, but we're logging informational messages
- `process.stderr.write()` is more explicit about writing to stderr
- Both write to stderr, but `process.stderr.write()` is cleaner and more intentional

## Changes Made

### Modified Files

1. **src/db.ts**
   - Added `log()` helper function using `process.stderr.write()`
   - Replaced all `console.log()` calls with `log()`
   - Removed emoji icons from log messages for cleaner output

### Change Summary

```typescript
// BEFORE (incorrect - writes to stdout)
console.log('✅ Connected to Firestore successfully');
console.log(`📊 Project ID: ${config.projectId}`);

// AFTER (correct - writes to stderr without emojis)
const log = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

log('Connected to Firestore successfully');
log(`Project ID: ${config.projectId}`);
```

**Total changes**: 8 instances updated

## Impact

### Compatibility
- Compatible with standard Python MCP clients (fastmcp, langchain-mcp-adapters)
- Compatible with TypeScript MCP clients
- Complies with official MCP specification
- No "stream sanitizers" required on client side

### Functionality
- No changes to server functionality
- Log messages remain visible on stderr
- JSON-RPC messages remain exclusively on stdout
- Better separation between protocol and logging
- Cleaner, more professional log output (no emojis)

## Validation

### Before update:
```bash
# stdout contained log messages (WRONG)
✅ Connected to Firestore successfully
📊 Project ID: my-project
{"jsonrpc":"2.0","id":1,"result":{...}}
```

### After update:
```bash
# stdout contains ONLY JSON-RPC messages (CORRECT)
{"jsonrpc":"2.0","id":1,"result":{...}}

# stderr contains clean logs
Connected to Firestore successfully
Project ID: my-project
```

## Technical Details

In Node.js:
- `console.log()` writes to **stdout** (WRONG for MCP)
- `console.error()` writes to **stderr** (semantically suggests errors)
- `process.stderr.write()` writes to **stderr** (explicit and clean)

For MCP servers using stdio transport:
- JSON-RPC messages: stdout only
- All other logs: stderr via `process.stderr.write()`

## References

- MCP Specification: https://modelcontextprotocol.io/
- MCP stdio Transport: https://modelcontextprotocol.io/docs/concepts/transports#stdio
- GitHub Issues: 
  - https://github.com/ruvnet/claude-flow/issues/835
  - https://github.com/firebase/genkit/issues/2954

---

**Author**: MCP System  
**Reviewed**: January 2026  
**Status**: Implemented
