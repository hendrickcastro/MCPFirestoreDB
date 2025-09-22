import { getFirestoreClient, getCollection } from '../db.js';
import { 
  ToolResult, 
  CollectionInfo, 
  CollectionStats,
  SchemaAnalysis,
  FieldAnalysis,
  NestedStructureAnalysis,
  IndexSuggestion,
  DeleteOptions
} from './types.js';
import { Timestamp } from '@google-cloud/firestore';

// LIST: Get all collections
export const mcp_list_collections = async (): Promise<ToolResult<CollectionInfo[]>> => {
  try {
    const db = getFirestoreClient();
    const collections = await db.listCollections();
    
    const collectionInfos: CollectionInfo[] = [];
    
    for (const collection of collections) {
      try {
        // Get basic collection info
        const snapshot = await collection.limit(1).get();
        
        collectionInfos.push({
          id: collection.id,
          path: collection.path,
          documentCount: undefined, // We'll calculate this separately if needed
          lastModified: undefined
        });
      } catch (error) {
        // If we can't access the collection, still include it in the list
        collectionInfos.push({
          id: collection.id,
          path: collection.path
        });
      }
    }

    return { 
      success: true, 
      data: collectionInfos 
    };

  } catch (error: any) {
    return { 
      success: false, 
      error: `Failed to list collections: ${error.message}` 
    };
  }
};

// STATS: Get collection statistics
export const mcp_get_collection_stats = async (params: {
  collection_path: string;
  sample_size?: number;
}): Promise<ToolResult<CollectionStats>> => {
  try {
    const { collection_path, sample_size = 1000 } = params;
    
    if (!collection_path) {
      return { success: false, error: 'Collection path is required' };
    }

    const collection = getCollection(collection_path);
    
    // Get total document count
    const snapshot = await collection.count().get();
    const documentCount = snapshot.data().count;

    // Get sample documents for analysis
    const sampleSnapshot = await collection.limit(sample_size).get();
    const sampleDocs = sampleSnapshot.docs;

    let totalSizeBytes = 0;
    const fieldStats: Map<string, any> = new Map();

    // Analyze sample documents
    for (const doc of sampleDocs) {
      const data = doc.data();
      const docString = JSON.stringify(data);
      totalSizeBytes += Buffer.byteLength(docString, 'utf8');

      // Analyze fields
      analyzeFields(data, '', fieldStats);
    }

    const averageDocumentSize = sampleDocs.length > 0 ? totalSizeBytes / sampleDocs.length : 0;
    const estimatedTotalSize = averageDocumentSize * documentCount;

    // Convert field stats to array
    const fieldStatistics = Array.from(fieldStats.values());

    return {
      success: true,
      data: {
        documentCount,
        totalSizeBytes: estimatedTotalSize,
        averageDocumentSize,
        fieldStatistics
      }
    };

  } catch (error: any) {
    return { 
      success: false, 
      error: `Failed to get collection stats: ${error.message}` 
    };
  }
};

// SCHEMA: Analyze collection schema
export const mcp_analyze_collection_schema = async (params: {
  collection_path: string;
  sample_size?: number;
}): Promise<ToolResult<SchemaAnalysis>> => {
  try {
    const { collection_path, sample_size = 100 } = params;
    
    if (!collection_path) {
      return { success: false, error: 'Collection path is required' };
    }

    const collection = getCollection(collection_path);
    const snapshot = await collection.limit(sample_size).get();
    const documents = snapshot.docs;

    if (documents.length === 0) {
      return {
        success: true,
        data: {
          collectionPath: collection_path,
          sampleSize: 0,
          commonFields: [],
          dataTypes: {},
          nestedStructures: [],
          indexSuggestions: []
        }
      };
    }

    const fieldAnalysis: Map<string, FieldAnalysis> = new Map();
    const dataTypes: Record<string, number> = {};
    const nestedStructures: Map<string, NestedStructureAnalysis> = new Map();

    // Analyze each document
    for (const doc of documents) {
      const data = doc.data();
      analyzeDocumentSchema(data, '', fieldAnalysis, dataTypes, nestedStructures, documents.length);
    }

    // Convert maps to arrays and sort by frequency
    const commonFields = Array.from(fieldAnalysis.values())
      .sort((a, b) => b.frequency - a.frequency);

    const nestedStructuresArray = Array.from(nestedStructures.values())
      .sort((a, b) => b.frequency - a.frequency);

    // Generate index suggestions
    const indexSuggestions = generateIndexSuggestions(commonFields);

    return {
      success: true,
      data: {
        collectionPath: collection_path,
        sampleSize: documents.length,
        commonFields,
        dataTypes,
        nestedStructures: nestedStructuresArray,
        indexSuggestions
      }
    };

  } catch (error: any) {
    return { 
      success: false, 
      error: `Failed to analyze schema: ${error.message}` 
    };
  }
};

// DELETE: Delete entire collection (with recursive option)
export const mcp_delete_collection = async (params: {
  collection_path: string;
  options?: DeleteOptions;
}): Promise<ToolResult<{ deleted: boolean; documentsDeleted: number }>> => {
  try {
    const { collection_path, options = {} } = params;
    
    if (!collection_path) {
      return { success: false, error: 'Collection path is required' };
    }

    const db = getFirestoreClient();
    const collection = getCollection(collection_path);
    
    let documentsDeleted = 0;

    if (options.recursive) {
      // Delete all documents in batches
      const batchSize = 500;
      let query = collection.limit(batchSize);

      while (true) {
        const snapshot = await query.get();
        
        if (snapshot.empty) {
          break;
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        documentsDeleted += snapshot.docs.length;

        if (snapshot.docs.length < batchSize) {
          break;
        }
      }
    } else {
      // Just check if collection is empty
      const snapshot = await collection.limit(1).get();
      if (!snapshot.empty) {
        return { 
          success: false, 
          error: 'Collection is not empty. Use recursive option to delete all documents.' 
        };
      }
    }

    return {
      success: true,
      data: {
        deleted: true,
        documentsDeleted
      }
    };

  } catch (error: any) {
    return { 
      success: false, 
      error: `Failed to delete collection: ${error.message}` 
    };
  }
};

// Helper function to analyze fields for statistics
function analyzeFields(obj: any, prefix: string, fieldStats: Map<string, any>) {
  for (const [key, value] of Object.entries(obj)) {
    const fieldPath = prefix ? `${prefix}.${key}` : key;
    
    if (!fieldStats.has(fieldPath)) {
      fieldStats.set(fieldPath, {
        fieldName: fieldPath,
        fieldType: getFieldType(value),
        frequency: 0,
        nullCount: 0,
        uniqueValues: new Set(),
        examples: []
      });
    }

    const stats = fieldStats.get(fieldPath);
    stats.frequency++;

    if (value === null || value === undefined) {
      stats.nullCount++;
    } else {
      stats.uniqueValues.add(JSON.stringify(value));
      if (stats.examples.length < 5) {
        stats.examples.push(value);
      }
    }

    // Recursively analyze nested objects
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Timestamp)) {
      analyzeFields(value, fieldPath, fieldStats);
    }
  }
}

// Helper function to analyze document schema
function analyzeDocumentSchema(
  obj: any, 
  prefix: string, 
  fieldAnalysis: Map<string, FieldAnalysis>,
  dataTypes: Record<string, number>,
  nestedStructures: Map<string, NestedStructureAnalysis>,
  totalDocs: number
) {
  for (const [key, value] of Object.entries(obj)) {
    const fieldPath = prefix ? `${prefix}.${key}` : key;
    const fieldType = getFieldType(value);

    // Update data types count
    dataTypes[fieldType] = (dataTypes[fieldType] || 0) + 1;

    // Update field analysis
    if (!fieldAnalysis.has(fieldPath)) {
      fieldAnalysis.set(fieldPath, {
        name: fieldPath,
        type: fieldType,
        frequency: 0,
        nullCount: 0,
        examples: [],
        isArray: Array.isArray(value),
        isNested: typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Timestamp)
      });
    }

    const analysis = fieldAnalysis.get(fieldPath)!;
    analysis.frequency++;

    if (value === null || value === undefined) {
      analysis.nullCount++;
    } else if (analysis.examples.length < 3) {
      analysis.examples.push(value);
    }

    // Analyze nested structures
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Timestamp)) {
      if (!nestedStructures.has(fieldPath)) {
        nestedStructures.set(fieldPath, {
          path: fieldPath,
          type: 'object',
          frequency: 0,
          fields: []
        });
      }
      nestedStructures.get(fieldPath)!.frequency++;
      
      // Recursively analyze nested object
      analyzeDocumentSchema(value, fieldPath, fieldAnalysis, dataTypes, nestedStructures, totalDocs);
    } else if (Array.isArray(value)) {
      if (!nestedStructures.has(fieldPath)) {
        nestedStructures.set(fieldPath, {
          path: fieldPath,
          type: 'array',
          frequency: 0
        });
      }
      nestedStructures.get(fieldPath)!.frequency++;
    }
  }
}

// Helper function to determine field type
function getFieldType(value: any): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') return 'string';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Timestamp) return 'timestamp';
  if (value instanceof Date) return 'date';
  if (typeof value === 'object') return 'object';
  return 'unknown';
}

// Helper function to generate index suggestions
function generateIndexSuggestions(fields: FieldAnalysis[]): IndexSuggestion[] {
  const suggestions: IndexSuggestion[] = [];

  // Suggest single field indexes for frequently queried fields
  const frequentFields = fields.filter(f => f.frequency > 0.5 && f.type !== 'object' && f.type !== 'array');
  
  for (const field of frequentFields.slice(0, 5)) {
    suggestions.push({
      fields: [field.name],
      type: 'single',
      reason: `High frequency field (${(field.frequency * 100).toFixed(1)}%) suitable for queries`
    });
  }

  // Suggest composite indexes for common field combinations
  if (frequentFields.length >= 2) {
    const topFields = frequentFields.slice(0, 3).map(f => f.name);
    suggestions.push({
      fields: topFields,
      type: 'composite',
      reason: 'Composite index for common field combinations'
    });
  }

  return suggestions;
}