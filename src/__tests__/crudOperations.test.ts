import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  mcp_create_document,
  mcp_get_document,
  mcp_get_documents,
  mcp_update_document,
  mcp_delete_document
} from '../tools/crudOperations';

// Mock Firestore
const mockDoc: any = {
  id: 'test-doc',
  exists: true,
  data: () => ({ name: 'Test User', createdAt: new Date() }),
  createTime: { toDate: () => new Date() },
  updateTime: { toDate: () => new Date() }
};

const mockCollection: any = {
  doc: jest.fn().mockReturnValue({
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }),
  add: jest.fn(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  get: jest.fn()
};

const mockFirestore = {
  collection: jest.fn().mockReturnValue(mockCollection)
};

// Mock the db module
jest.mock('../db', () => ({
  getFirestoreClient: () => mockFirestore,
  getCollection: (path: string) => mockCollection,
  getDocument: (collectionPath: string, docId: string) => mockCollection.doc(docId)
}));

describe('CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mcp_create_document', () => {
    it('should create document with provided ID', async () => {
      const args = {
        collection_path: 'users',
        document_id: 'user-123',
        data: { name: 'John Doe', email: 'john@example.com' }
      };

      const result = await mcp_create_document(args);

      expect(result.success).toBe(true);
      expect((result as any).document_id).toBe('user-123');
      expect(mockCollection.doc).toHaveBeenCalledWith('user-123');
    });

    it('should create document with auto-generated ID', async () => {
      const args = {
        collection_path: 'users',
        data: { name: 'Jane Doe', email: 'jane@example.com' }
      };

      const result = await mcp_create_document(args);

      expect(result.success).toBe(true);
      expect((result as any).document_id).toBe('auto-generated-id');
      expect(mockCollection.add).toHaveBeenCalled();
    });

    it('should handle missing collection_path', async () => {
      const args = {
        data: { name: 'Test' }
      } as any;

      await expect(mcp_create_document(args)).rejects.toThrow('collection_path is required');
    });

    it('should handle missing data', async () => {
      const args = {
        collection_path: 'users'
      } as any;

      await expect(mcp_create_document(args)).rejects.toThrow('data is required');
    });
  });

  describe('mcp_get_document', () => {
    it('should retrieve existing document', async () => {
      const args = {
        collection_path: 'users',
        document_id: 'user-123'
      };

      const result = await mcp_get_document(args);

      expect(result.success).toBe(true);
      expect((result as any).document).toBeDefined();
      expect((result as any).document?.id).toBe('test-doc');
    });

    it('should handle non-existent document', async () => {
      (mockCollection.doc() as any).get.mockResolvedValueOnce({
        exists: false
      });

      const args = {
        collection_path: 'users',
        document_id: 'non-existent'
      };

      const result = await mcp_get_document(args);

      expect(result.success).toBe(false);
      expect((result as any).error).toContain('Document not found');
    });

    it('should handle missing parameters', async () => {
      const args = {
        collection_path: 'users'
      } as any;

      await expect(mcp_get_document(args)).rejects.toThrow('document_id is required');
    });
  });

  describe('mcp_get_documents', () => {
    it('should retrieve documents with default parameters', async () => {
      // Setup mock for this specific test
      mockCollection.get.mockResolvedValueOnce({
        docs: [mockDoc],
        size: 1,
        empty: false
      });

      const args = {
        collection_path: 'users'
      };

      const result = await mcp_get_documents(args);

      expect(result.success).toBe(true);
      expect((result as any).documents).toHaveLength(1);
      expect((result as any).data?.total_count).toBe(1);
    });

    it('should apply where conditions', async () => {
      const args = {
        collection_path: 'users',
        where_conditions: [['status', '==', 'active']]
      };

      const result = await mcp_get_documents(args);

      expect(result.success).toBe(true);
      expect(mockCollection.where).toHaveBeenCalledWith('status', '==', 'active');
    });

    it('should apply ordering', async () => {
      const args = {
        collection_path: 'users',
        order_by: 'createdAt',
        order_direction: 'desc' as const
      };

      const result = await mcp_get_documents(args);

      expect(result.success).toBe(true);
      expect(mockCollection.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });

    it('should apply limit', async () => {
      const args = {
        collection_path: 'users',
        limit: 50
      };

      const result = await mcp_get_documents(args);

      expect(result.success).toBe(true);
      expect(mockCollection.limit).toHaveBeenCalledWith(50);
    });
  });

  describe('mcp_update_document', () => {
    it('should update document with merge', async () => {
      const args = {
        collection_path: 'users',
        document_id: 'user-123',
        data: { lastLogin: new Date() },
        merge: true
      };

      const result = await mcp_update_document(args);

      expect(result.success).toBe(true);
      expect((mockCollection.doc() as any).update).toHaveBeenCalled();
    });

    it('should replace document without merge', async () => {
      const args = {
        collection_path: 'users',
        document_id: 'user-123',
        data: { name: 'Updated Name' },
        merge: false
      };

      const result = await mcp_update_document(args);

      expect(result.success).toBe(true);
      expect((mockCollection.doc() as any).set).toHaveBeenCalled();
    });

    it('should handle missing parameters', async () => {
      const args = {
        collection_path: 'users',
        document_id: 'user-123'
      } as any;

      await expect(mcp_update_document(args)).rejects.toThrow('data is required');
    });
  });

  describe('mcp_delete_document', () => {
    it('should delete document successfully', async () => {
      const args = {
        collection_path: 'users',
        document_id: 'user-123'
      };

      const result = await mcp_delete_document(args);

      expect(result.success).toBe(true);
      expect((mockCollection.doc() as any).delete).toHaveBeenCalled();
    });

    it('should handle missing parameters', async () => {
      const args = {
        collection_path: 'users'
      } as any;

      await expect(mcp_delete_document(args)).rejects.toThrow('document_id is required');
    });
  });
});