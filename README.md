# MCP FirestoreDB - Google Cloud Firestore MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Google Cloud Firestore](https://img.shields.io/badge/Google%20Cloud-Firestore-orange)](https://cloud.google.com/firestore)
[![MCP Protocol](https://img.shields.io/badge/MCP-Protocol-purple)](https://github.com/modelcontextprotocol/sdk)
[![Claude Desktop](https://img.shields.io/badge/Claude-Desktop-orange)](https://claude.ai/desktop)
[![Cursor IDE](https://img.shields.io/badge/Cursor-IDE-green)](https://cursor.sh/)
[![Trae AI](https://img.shields.io/badge/Trae%20AI-IDE-blue)](https://trae.ai/)

A comprehensive **Model Context Protocol (MCP)** server for **Google Cloud Firestore** database operations. This server provides 12 powerful tools for document database management, collection operations, and data querying through the MCP protocol.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google Cloud Firestore database with service account credentials
- MCP-compatible client (Claude Desktop, Cursor IDE, etc.)

## ⚙️ Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON file | `/path/to/service-account.json` |
| `FIREBASE_PROJECT_ID` | Firebase/GCP Project ID | `my-project-id` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FIRESTORE_DATABASE_ID` | Firestore database ID | `(default)` |
| `FIRESTORE_EMULATOR_HOST` | Firestore emulator host for local development | `localhost:8080` |
| `DEBUG_FIRESTORE` | Enable debug logging | `false` |

### Installation Options

#### Option 1: Local Development
```bash
git clone <your-repo-url>
cd MCPFirestoreDB
npm install && npm run build
```

Then configure with local path:
```json
{
  "mcpServers": {
    "mcp-firestoredb": {
      "command": "node",
      "args": ["path/to/MCPFirestoreDB/dist/server.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account.json",
        "FIREBASE_PROJECT_ID": "your-project-id"
      }
    }
  }
}
```

## 🛠️ Available Tools

MCP FirestoreDB provides 12 comprehensive tools for Google Cloud Firestore operations:

### CRUD Operations

### 1. 📝 **Create Document** - `mcp_firestoredb_mcp_create_document`
Create a new document in a Firestore collection.

**Parameters:**
- `collection_path`: Collection path (e.g., "users" or "users/123/orders")
- `document_id`: Optional document ID (auto-generated if not provided)
- `data`: Document data object

### 2. 📖 **Get Document** - `mcp_firestoredb_mcp_get_document`
Retrieve a specific document by ID from a collection.

**Parameters:**
- `collection_path`: Collection path
- `document_id`: Document ID to retrieve

### 3. 📚 **Get Documents** - `mcp_firestoredb_mcp_get_documents`
Get multiple documents with optional filtering and pagination.

**Parameters:**
- `collection_path`: Collection path
- `limit`: Maximum number of documents (default: 100)
- `order_by`: Field to order by
- `order_direction`: Order direction ("asc" or "desc")
- `where_conditions`: Array of where conditions [field, operator, value]
- `start_after`: Document ID for pagination

### 4. ✏️ **Update Document** - `mcp_firestoredb_mcp_update_document`
Update an existing document in a collection.

**Parameters:**
- `collection_path`: Collection path
- `document_id`: Document ID to update
- `data`: Data to update (partial update supported)
- `merge`: Whether to merge with existing data (default: true)

### 5. 🗑️ **Delete Document** - `mcp_firestoredb_mcp_delete_document`
Delete a document from a collection.

**Parameters:**
- `collection_path`: Collection path
- `document_id`: Document ID to delete

### Batch Operations

### 6. 📝📝 **Batch Create Documents** - `mcp_firestoredb_mcp_batch_create_documents`
Create multiple documents in a single batch operation.

### 7. ✏️✏️ **Batch Update Documents** - `mcp_firestoredb_mcp_batch_update_documents`
Update multiple documents in a single batch operation.

### 8. 🗑️🗑️ **Batch Delete Documents** - `mcp_firestoredb_mcp_batch_delete_documents`
Delete multiple documents in a single batch operation.

### Collection Operations

### 9. 📋 **List Collections** - `mcp_firestoredb_mcp_list_collections`
List all collections in the Firestore database.

**Parameters:**
- `parent_path`: Optional parent document path for subcollections

### 10. 📊 **Get Collection Stats** - `mcp_firestoredb_mcp_get_collection_stats`
Get statistics about a Firestore collection.

**Parameters:**
- `collection_path`: Collection path
- `sample_size`: Number of documents to sample (default: 100)

### 11. 🏗️ **Analyze Collection Schema** - `mcp_firestoredb_mcp_analyze_collection_schema`
Analyze the schema of documents in a collection.

**Parameters:**
- `collection_path`: Collection path
- `sample_size`: Number of documents to sample (default: 100)

### 12. 🗑️📁 **Delete Collection** - `mcp_firestoredb_mcp_delete_collection`
Delete an entire collection and all its documents (use with caution).

**Parameters:**
- `collection_path`: Collection path to delete
- `batch_size`: Documents to delete per batch (default: 100)

## 📋 Usage Examples

### Document Operations
```typescript
// Create a document
const newDoc = await mcp_create_document({
  collection_path: "users",
  document_id: "user-123",
  data: {
    name: "John Doe",
    email: "john@example.com",
    createdAt: new Date()
  }
});

// Get a specific document
const document = await mcp_get_document({
  collection_path: "users",
  document_id: "user-123"
});

// Update a document
const updated = await mcp_update_document({
  collection_path: "users",
  document_id: "user-123",
  data: { lastLogin: new Date() },
  merge: true
});
```

### Querying Data
```typescript
// Get documents with filtering
const activeUsers = await mcp_get_documents({
  collection_path: "users",
  where_conditions: [
    ["status", "==", "active"],
    ["createdAt", ">", "2024-01-01"]
  ],
  order_by: "createdAt",
  order_direction: "desc",
  limit: 50
});

// Get documents with pagination
const nextPage = await mcp_get_documents({
  collection_path: "users",
  limit: 10,
  start_after: "last-document-id"
});
```

### Batch Operations
```typescript
// Batch create multiple documents
const batchCreate = await mcp_batch_create_documents({
  operations: [
    {
      collection_path: "products",
      document_id: "prod-1",
      data: { name: "Product 1", price: 100 }
    },
    {
      collection_path: "products",
      document_id: "prod-2",
      data: { name: "Product 2", price: 200 }
    }
  ]
});
```

### Collection Analysis
```typescript
// List all collections
const collections = await mcp_list_collections();

// Get collection statistics
const stats = await mcp_get_collection_stats({
  collection_path: "users",
  sample_size: 1000
});

// Analyze collection schema
const schema = await mcp_analyze_collection_schema({
  collection_path: "products",
  sample_size: 500
});
```

## 🔧 Configuration Examples

**Production Environment:**
```json
{
  "mcpServers": {
    "mcp-firestoredb": {
      "command": "node",
      "args": ["path/to/MCPFirestoreDB/dist/server.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/production-service-account.json",
        "FIREBASE_PROJECT_ID": "my-production-project"
      }
    }
  }
}
```

**Development with Emulator:**
```json
{
  "mcpServers": {
    "mcp-firestoredb": {
      "command": "node",
      "args": ["path/to/MCPFirestoreDB/dist/server.js"],
      "env": {
        "FIREBASE_PROJECT_ID": "demo-project",
        "FIRESTORE_EMULATOR_HOST": "localhost:8080",
        "DEBUG_FIRESTORE": "true"
      }
    }
  }
}
```

**Multiple Databases:**
```json
{
  "mcpServers": {
    "mcp-firestoredb-main": {
      "command": "node",
      "args": ["path/to/MCPFirestoreDB/dist/server.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account.json",
        "FIREBASE_PROJECT_ID": "my-project",
        "FIRESTORE_DATABASE_ID": "(default)"
      }
    },
    "mcp-firestoredb-analytics": {
      "command": "node",
      "args": ["path/to/MCPFirestoreDB/dist/server.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account.json",
        "FIREBASE_PROJECT_ID": "my-project",
        "FIRESTORE_DATABASE_ID": "analytics-db"
      }
    }
  }
}
```

## 🚨 Troubleshooting

**Authentication Issues:**
- **Service account not found**: Verify GOOGLE_APPLICATION_CREDENTIALS path
- **Permission denied**: Ensure service account has Firestore permissions
- **Project not found**: Check FIREBASE_PROJECT_ID matches your GCP project

**Connection Issues:**
- **Emulator connection failed**: Ensure Firestore emulator is running on specified port
- **Network timeout**: Check firewall settings and network connectivity
- **Database not found**: Verify FIRESTORE_DATABASE_ID exists

**Query Issues:**
- **Invalid where condition**: Check field names and operator syntax
- **Query timeout**: Reduce sample sizes or add more specific filters
- **Index required**: Create composite indexes for complex queries

**Firestore Emulator Setup:**
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Start emulator: `firebase emulators:start --only firestore`
3. Set FIRESTORE_EMULATOR_HOST environment variable
4. Use demo project ID for testing

## 🧪 Development

```bash
npm install       # Install dependencies
npm run build     # Build project
npm test          # Run tests
npm start         # Development mode
```

## 🏗️ Architecture

**Project Structure:**
```
src/
├── tools/                      # Tool implementations
│   ├── crudOperations.ts       # CRUD operations
│   ├── collectionOperations.ts # Collection management
│   ├── types.ts                # Type definitions
│   └── index.ts                # Tool exports
├── db.ts                       # Firestore connection
├── server.ts                   # MCP server setup
└── tools.ts                    # Tool definitions
```

**Key Features:**
- ⚡ Efficient connection management
- 🛡️ Comprehensive error handling
- 📊 Collection statistics and schema analysis
- 🔧 Environment-based configuration
- 🚀 Batch operations for performance
- 📋 Intelligent schema analysis
- 🔍 Advanced querying capabilities

## 📝 Important Notes

- **Collection Paths**: Use forward slashes for nested collections (e.g., "users/123/orders")
- **Document IDs**: Auto-generated if not provided in create operations
- **Batch Operations**: Limited to 500 operations per batch
- **Security Rules**: Ensure proper Firestore security rules are configured
- **Indexes**: Create composite indexes for complex queries
- **Costs**: Monitor Firestore usage to manage costs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Make changes and add tests
4. Ensure tests pass (`npm test`)
5. Commit changes (`git commit -m 'Add feature'`)
6. Push and open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏷️ Tags & Keywords

**Database:** `firestore` `google-cloud-firestore` `nosql` `document-database` `database-analysis` `database-tools` `google-cloud` `database-management` `database-operations` `data-analysis`

**MCP & AI:** `model-context-protocol` `mcp-server` `mcp-tools` `ai-tools` `claude-desktop` `cursor-ide` `anthropic` `llm-integration` `ai-database` `intelligent-database`

**Technology:** `typescript` `nodejs` `npm-package` `cli-tool` `database-client` `nosql-client` `database-sdk` `rest-api` `json-api` `database-connector`

**Features:** `collection-analysis` `document-operations` `batch-operations` `schema-analysis` `query-execution` `database-search` `data-exploration` `database-insights` `crud-operations` `real-time-database`

**Use Cases:** `database-development` `data-science` `business-intelligence` `database-migration` `schema-documentation` `performance-analysis` `data-governance` `database-monitoring` `troubleshooting` `automation`

## 🙏 Acknowledgments

- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- [@google-cloud/firestore](https://github.com/googleapis/nodejs-firestore)
- Inspired by [MCPCosmosDB](https://github.com/hendrickcastro/MCPCosmosDB)

**🎯 MCP FirestoreDB provides comprehensive Google Cloud Firestore database management through the Model Context Protocol. Perfect for developers and data analysts working with Firestore!** 🚀