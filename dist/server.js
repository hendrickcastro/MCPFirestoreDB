#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
// Import tools and database connection
import { MCP_FIRESTORE_TOOLS } from './tools.js';
import { connectFirestore, closeConnection } from './db.js';
import { create_doc, get_doc, get_docs, update_doc, delete_doc, batch_create, batch_update, batch_delete, list_collections, collection_stats, analyze_schema, delete_collection } from './tools/index.js';
// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Logging function
function logToFile(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    try {
        const logDir = join(__dirname, '..', 'logs');
        if (!existsSync(logDir)) {
            mkdirSync(logDir, { recursive: true });
        }
        const logFile = join(logDir, 'mcp-firestore.log');
        writeFileSync(logFile, logMessage, { flag: 'a' });
    }
    catch (error) {
        console.error('Failed to write to log file:', error);
    }
}
// Helper function to prepare data for response
function prepareDataForResponse(data) {
    if (data === null || data === undefined) {
        return data;
    }
    if (data instanceof Date) {
        return data.toISOString();
    }
    if (typeof data === 'object') {
        if (Array.isArray(data)) {
            return data.map(prepareDataForResponse);
        }
        const result = {};
        for (const [key, value] of Object.entries(data)) {
            result[key] = prepareDataForResponse(value);
        }
        return result;
    }
    return data;
}
class FirestoreServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'mcp-firestoredb',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    setupErrorHandling() {
        this.server.onerror = (error) => {
            logToFile(`[MCP Error] ${error}`, 'error');
            console.error('[MCP Error]', error);
        };
        process.on('SIGINT', async () => {
            logToFile('Received SIGINT, shutting down gracefully...', 'info');
            await this.cleanup();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            logToFile('Received SIGTERM, shutting down gracefully...', 'info');
            await this.cleanup();
            process.exit(0);
        });
    }
    async cleanup() {
        try {
            await closeConnection();
            logToFile('Firestore connection closed successfully', 'info');
        }
        catch (error) {
            logToFile(`Error during cleanup: ${error}`, 'error');
        }
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            logToFile('Listing available tools', 'debug');
            return {
                tools: MCP_FIRESTORE_TOOLS,
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            logToFile(`Tool called: ${name} with args: ${JSON.stringify(args)}`, 'debug');
            try {
                // Ensure Firestore connection
                await connectFirestore();
                let result;
                switch (name) {
                    // CRUD Operations
                    case 'create_doc':
                        result = await create_doc(args);
                        break;
                    case 'get_doc':
                        result = await get_doc(args);
                        break;
                    case 'get_docs':
                        result = await get_docs(args);
                        break;
                    case 'update_doc':
                        result = await update_doc(args);
                        break;
                    case 'delete_doc':
                        result = await delete_doc(args);
                        break;
                    // Batch Operations
                    case 'batch_create':
                        result = await batch_create(args);
                        break;
                    case 'batch_update':
                        result = await batch_update(args);
                        break;
                    case 'batch_delete':
                        result = await batch_delete(args);
                        break;
                    // Collection Operations
                    case 'list_collections':
                        result = await list_collections();
                        break;
                    case 'collection_stats':
                        result = await collection_stats(args);
                        break;
                    case 'analyze_schema':
                        result = await analyze_schema(args);
                        break;
                    case 'delete_collection':
                        result = await delete_collection(args);
                        break;
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
                const preparedResult = prepareDataForResponse(result);
                logToFile(`Tool ${name} executed successfully`, 'debug');
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(preparedResult, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logToFile(`Tool ${name} failed: ${errorMessage}`, 'error');
                if (error instanceof McpError) {
                    throw error;
                }
                throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${errorMessage}`);
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        logToFile('Starting MCP Firestore Server...', 'info');
        try {
            await connectFirestore();
            logToFile('Firestore connection established successfully', 'info');
        }
        catch (error) {
            logToFile(`Failed to connect to Firestore: ${error}`, 'error');
            throw error;
        }
        await this.server.connect(transport);
        logToFile('MCP Firestore Server started and listening on stdio', 'info');
    }
}
// Start the server
async function main() {
    const server = new FirestoreServer();
    await server.run();
}
main().catch((error) => {
    logToFile(`Failed to start server: ${error}`, 'error');
    console.error('Failed to start server:', error);
    process.exit(1);
});
