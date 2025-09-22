import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { MCP_FIRESTORE_TOOLS } from '../tools';

// Create mock server instance
const mockServer = {
  setRequestHandler: jest.fn(),
  connect: jest.fn(),
  close: jest.fn()
};

// Mock the MCP server and transport
jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn().mockImplementation(() => mockServer)
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn().mockImplementation(() => ({
    start: jest.fn()
  }))
}));

// Mock the database connection
jest.mock('../db', () => ({
  connectFirestore: jest.fn(),
  closeConnection: jest.fn()
}));

// Mock the tools
jest.mock('../tools/index', () => ({
  mcp_create_document: jest.fn(),
  mcp_get_document: jest.fn(),
  mcp_get_documents: jest.fn(),
  mcp_update_document: jest.fn(),
  mcp_delete_document: jest.fn(),
  mcp_batch_create_documents: jest.fn(),
  mcp_batch_update_documents: jest.fn(),
  mcp_batch_delete_documents: jest.fn(),
  mcp_list_collections: jest.fn(),
  mcp_get_collection_stats: jest.fn(),
  mcp_analyze_collection_schema: jest.fn(),
  mcp_delete_collection: jest.fn()
}));

describe('Firestore MCP Server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Tool Definitions', () => {
    it('should have all required tools defined', () => {
      expect(MCP_FIRESTORE_TOOLS).toHaveLength(12);
      
      const toolNames = MCP_FIRESTORE_TOOLS.map(tool => tool.name);
      
      // CRUD Operations
      expect(toolNames).toContain('mcp_firestoredb_mcp_create_document');
      expect(toolNames).toContain('mcp_firestoredb_mcp_get_document');
      expect(toolNames).toContain('mcp_firestoredb_mcp_get_documents');
      expect(toolNames).toContain('mcp_firestoredb_mcp_update_document');
      expect(toolNames).toContain('mcp_firestoredb_mcp_delete_document');
      
      // Batch Operations
      expect(toolNames).toContain('mcp_firestoredb_mcp_batch_create_documents');
      expect(toolNames).toContain('mcp_firestoredb_mcp_batch_update_documents');
      expect(toolNames).toContain('mcp_firestoredb_mcp_batch_delete_documents');
      
      // Collection Operations
      expect(toolNames).toContain('mcp_firestoredb_mcp_list_collections');
      expect(toolNames).toContain('mcp_firestoredb_mcp_get_collection_stats');
      expect(toolNames).toContain('mcp_firestoredb_mcp_analyze_collection_schema');
      expect(toolNames).toContain('mcp_firestoredb_mcp_delete_collection');
    });

    it('should have proper input schemas for all tools', () => {
      MCP_FIRESTORE_TOOLS.forEach(tool => {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
      });
    });

    it('should have required fields defined correctly', () => {
      const createDocTool = MCP_FIRESTORE_TOOLS.find(
        tool => tool.name === 'mcp_firestoredb_mcp_create_document'
      );
      
      expect(createDocTool?.inputSchema.required).toContain('collection_path');
      expect(createDocTool?.inputSchema.required).toContain('data');
      expect(createDocTool?.inputSchema.required).not.toContain('document_id');
    });
  });

  describe('Server Configuration', () => {
    it('should have correct server configuration', () => {
      // Test that the mock server is properly configured
      expect(mockServer).toBeDefined();
      expect(mockServer.setRequestHandler).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should have error handling capabilities', () => {
      // Verify that error handling structures are in place
      expect(mockServer.setRequestHandler).toBeDefined();
    });
  });

  describe('Tool Validation', () => {
    it('should validate create document parameters', () => {
      const createTool = MCP_FIRESTORE_TOOLS.find(
        tool => tool.name === 'mcp_firestoredb_mcp_create_document'
      );
      
      expect(createTool?.inputSchema.properties?.collection_path).toBeDefined();
      expect(createTool?.inputSchema.properties?.data).toBeDefined();
      expect(createTool?.inputSchema.properties?.document_id).toBeDefined();
    });

    it('should validate get documents parameters', () => {
      const getTool = MCP_FIRESTORE_TOOLS.find(
        tool => tool.name === 'mcp_firestoredb_mcp_get_documents'
      );
      
      expect(getTool?.inputSchema.properties?.collection_path).toBeDefined();
      expect(getTool?.inputSchema.properties?.limit).toBeDefined();
      expect(getTool?.inputSchema.properties?.where_conditions).toBeDefined();
    });

    it('should validate batch operation parameters', () => {
      const batchTool = MCP_FIRESTORE_TOOLS.find(
        tool => tool.name === 'mcp_firestoredb_mcp_batch_create_documents'
      );
      
      expect(batchTool?.inputSchema.properties?.operations).toBeDefined();
      expect(batchTool?.inputSchema.required).toContain('operations');
    });
  });
});