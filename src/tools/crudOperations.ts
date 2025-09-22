import { getFirestoreClient, getCollection, getDocument } from '../db';
import { 
  ToolResult, 
  DocumentInfo, 
  CreateDocumentOptions, 
  UpdateDocumentOptions,
  DeleteOptions,
  QueryOptions,
  QueryResult,
  BatchOperationResult,
  CollectionPath,
  DocumentId
} from './types.js';
import { FieldValue, Timestamp, Query, CollectionReference, DocumentData } from '@google-cloud/firestore';

// Helper function to convert Firestore document to DocumentInfo
const convertToDocumentInfo = (doc: any): DocumentInfo => {
  const data = doc.data();
  
  // Convert Firestore Timestamps to regular dates for serialization
  const convertTimestamps = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    
    if (obj instanceof Timestamp) {
      return obj.toDate();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(convertTimestamps);
    }
    
    if (typeof obj === 'object') {
      const converted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        converted[key] = convertTimestamps(value);
      }
      return converted;
    }
    
    return obj;
  };

  return {
    id: doc.id,
    path: doc.ref.path,
    data: convertTimestamps(data),
    createTime: doc.createTime?.toDate(),
    updateTime: doc.updateTime?.toDate(),
    readTime: doc.readTime?.toDate()
  };
};

// CREATE: Create a new document
export const mcp_create_document = async (params: {
  collection_path: string;
  document_id?: string;
  data: DocumentData;
  options?: CreateDocumentOptions;
}): Promise<ToolResult<DocumentInfo>> => {
  try {
    const { collection_path, document_id, data, options = {} } = params;
    
    if (!collection_path || !data) {
      return { success: false, error: 'Collection path and data are required' };
    }

    const collection = getCollection(collection_path);
    let docRef;

    if (document_id) {
      docRef = collection.doc(document_id);
      
      if (options.merge || options.mergeFields) {
        await docRef.set(data, { 
          merge: options.merge,
          mergeFields: options.mergeFields 
        });
      } else {
        await docRef.set(data);
      }
    } else {
      docRef = await collection.add(data);
    }

    // Get the created document
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return { success: false, error: 'Document was not created successfully' };
    }

    return { 
      success: true, 
      data: convertToDocumentInfo(doc)
    };

  } catch (error: any) {
    return { 
      success: false, 
      error: `Failed to create document: ${error.message}` 
    };
  }
};

// READ: Get a document by ID
export const mcp_get_document = async (params: {
  collection_path: string;
  document_id: string;
}): Promise<ToolResult<DocumentInfo | null>> => {
  try {
    const { collection_path, document_id } = params;
    
    if (!collection_path || !document_id) {
      return { success: false, error: 'Collection path and document ID are required' };
    }

    const docRef = getDocument(collection_path, document_id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return { success: true, data: null };
    }

    return { 
      success: true, 
      data: convertToDocumentInfo(doc)
    };

  } catch (error: any) {
    return { 
      success: false, 
      error: `Failed to get document: ${error.message}` 
    };
  }
};

// READ: Get multiple documents with query options
export const mcp_get_documents = async (params: {
  collection_path: string;
  query_options?: QueryOptions;
}): Promise<ToolResult<QueryResult>> => {
  try {
    const { collection_path, query_options = {} } = params;
    
    if (!collection_path) {
      return { success: false, error: 'Collection path is required' };
    }

    let query: Query<DocumentData> | CollectionReference<DocumentData> = getCollection(collection_path);

    // Apply where conditions
    if (query_options.where) {
      for (const condition of query_options.where) {
        query = query.where(condition.field, condition.operator as any, condition.value);
      }
    }

    // Apply ordering
    if (query_options.orderBy) {
      for (const order of query_options.orderBy) {
        query = query.orderBy(order.field, order.direction);
      }
    }

    // Apply offset
    if (query_options.offset) {
      query = query.offset(query_options.offset);
    }

    // Apply limit
    if (query_options.limit) {
      query = query.limit(query_options.limit);
    }

    const startTime = Date.now();
    const snapshot = await query.get();
    const executionTime = Date.now() - startTime;

    const documents = snapshot.docs.map(convertToDocumentInfo);

    return {
      success: true,
      data: {
        documents,
        totalCount: documents.length,
        hasMore: snapshot.size === (query_options.limit || 0),
        executionStats: {
          documentsScanned: snapshot.size,
          documentsReturned: documents.length,
          executionTimeMs: executionTime
        }
      }
    };

  } catch (error: any) {
    return { 
      success: false, 
      error: `Failed to get documents: ${error.message}` 
    };
  }
};

// UPDATE: Update a document
export const mcp_update_document = async (params: {
  collection_path: string;
  document_id: string;
  data: DocumentData;
  options?: UpdateDocumentOptions;
}): Promise<ToolResult<DocumentInfo>> => {
  try {
    const { collection_path, document_id, data, options = {} } = params;
    
    if (!collection_path || !document_id || !data) {
      return { success: false, error: 'Collection path, document ID, and data are required' };
    }

    const docRef = getDocument(collection_path, document_id);

    // Check if document exists (unless createIfMissing is true)
    if (!options.createIfMissing) {
      const doc = await docRef.get();
      if (!doc.exists) {
        return { success: false, error: 'Document does not exist' };
      }
    }

    if (options.merge || options.mergeFields) {
      await docRef.set(data, { 
        merge: options.merge,
        mergeFields: options.mergeFields 
      });
    } else {
      await docRef.update(data);
    }

    // Get the updated document
    const updatedDoc = await docRef.get();
    
    if (!updatedDoc.exists) {
      return { success: false, error: 'Document update failed' };
    }

    return { 
      success: true, 
      data: convertToDocumentInfo(updatedDoc)
    };

  } catch (error: any) {
    return { 
      success: false, 
      error: `Failed to update document: ${error.message}` 
    };
  }
};

// DELETE: Delete a document
export const mcp_delete_document = async (params: {
  collection_path: string;
  document_id: string;
}): Promise<ToolResult<{ deleted: boolean; documentId: string }>> => {
  try {
    const { collection_path, document_id } = params;
    
    if (!collection_path || !document_id) {
      return { success: false, error: 'Collection path and document ID are required' };
    }

    const docRef = getDocument(collection_path, document_id);
    
    // Check if document exists
    const doc = await docRef.get();
    if (!doc.exists) {
      return { success: false, error: 'Document does not exist' };
    }

    await docRef.delete();

    return { 
      success: true, 
      data: { deleted: true, documentId: document_id }
    };

  } catch (error: any) {
    return { 
      success: false, 
      error: `Failed to delete document: ${error.message}` 
    };
  }
};

// BATCH CREATE: Create multiple documents
export const mcp_batch_create_documents = async (params: {
  collection_path: string;
  documents: Array<{ id?: string; data: DocumentData }>;
}): Promise<ToolResult<BatchOperationResult>> => {
  try {
    const { collection_path, documents } = params;
    
    if (!collection_path || !documents || documents.length === 0) {
      return { success: false, error: 'Collection path and documents array are required' };
    }

    const db = getFirestoreClient();
    const batch = db.batch();
    const collection = getCollection(collection_path);
    const results: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < documents.length; i++) {
      try {
        const { id, data } = documents[i];
        const docRef = id ? collection.doc(id) : collection.doc();
        
        batch.set(docRef, data);
        results.push({ id: docRef.id, path: docRef.path });
      } catch (error: any) {
        errors.push(`Document ${i}: ${error.message}`);
      }
    }

    await batch.commit();

    return {
      success: true,
      data: {
        success: errors.length === 0,
        processedCount: results.length,
        errors,
        results
      }
    };

  } catch (error: any) {
    return { 
      success: false, 
      error: `Failed to batch create documents: ${error.message}` 
    };
  }
};

// BATCH UPDATE: Update multiple documents
export const mcp_batch_update_documents = async (params: {
  collection_path: string;
  updates: Array<{ id: string; data: DocumentData }>;
}): Promise<ToolResult<BatchOperationResult>> => {
  try {
    const { collection_path, updates } = params;
    
    if (!collection_path || !updates || updates.length === 0) {
      return { success: false, error: 'Collection path and updates array are required' };
    }

    const db = getFirestoreClient();
    const batch = db.batch();
    const collection = getCollection(collection_path);
    const results: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < updates.length; i++) {
      try {
        const { id, data } = updates[i];
        const docRef = collection.doc(id);
        
        batch.update(docRef, data);
        results.push({ id, path: docRef.path });
      } catch (error: any) {
        errors.push(`Document ${updates[i].id}: ${error.message}`);
      }
    }

    await batch.commit();

    return {
      success: true,
      data: {
        success: errors.length === 0,
        processedCount: results.length,
        errors,
        results
      }
    };

  } catch (error: any) {
    return { 
      success: false, 
      error: `Failed to batch update documents: ${error.message}` 
    };
  }
};

// BATCH DELETE: Delete multiple documents
export const mcp_batch_delete_documents = async (params: {
  collection_path: string;
  document_ids: string[];
}): Promise<ToolResult<BatchOperationResult>> => {
  try {
    const { collection_path, document_ids } = params;
    
    if (!collection_path || !document_ids || document_ids.length === 0) {
      return { success: false, error: 'Collection path and document IDs array are required' };
    }

    const db = getFirestoreClient();
    const batch = db.batch();
    const collection = getCollection(collection_path);
    const results: any[] = [];
    const errors: string[] = [];

    for (const id of document_ids) {
      try {
        const docRef = collection.doc(id);
        batch.delete(docRef);
        results.push({ id, deleted: true });
      } catch (error: any) {
        errors.push(`Document ${id}: ${error.message}`);
      }
    }

    await batch.commit();

    return {
      success: true,
      data: {
        success: errors.length === 0,
        processedCount: results.length,
        errors,
        results
      }
    };

  } catch (error: any) {
    return { 
      success: false, 
      error: `Failed to batch delete documents: ${error.message}` 
    };
  }
};