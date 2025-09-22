export type ToolSuccessResult<T> = {
    success: true;
    data: T;
};
export type ToolErrorResult = {
    success: false;
    error: string;
};
export type ToolResult<T> = ToolSuccessResult<T> | ToolErrorResult;
export interface CollectionInfo {
    id: string;
    path: string;
    documentCount?: number;
    lastModified?: Date;
}
export interface DocumentInfo {
    id: string;
    path: string;
    data: Record<string, any>;
    createTime?: Date;
    updateTime?: Date;
    readTime?: Date;
}
export interface QueryOptions {
    limit?: number;
    offset?: number;
    orderBy?: {
        field: string;
        direction: 'asc' | 'desc';
    }[];
    where?: WhereCondition[];
}
export interface WhereCondition {
    field: string;
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
    value: any;
}
export interface BatchOperationResult {
    success: boolean;
    processedCount: number;
    errors: string[];
    results: any[];
}
export interface CollectionStats {
    documentCount: number;
    totalSizeBytes?: number;
    averageDocumentSize?: number;
    fieldStatistics?: FieldStatistics[];
}
export interface FieldStatistics {
    fieldName: string;
    fieldType: string;
    frequency: number;
    nullCount: number;
    uniqueValues?: number;
    examples: any[];
}
export interface SchemaAnalysis {
    collectionPath: string;
    sampleSize: number;
    commonFields: FieldAnalysis[];
    dataTypes: Record<string, number>;
    nestedStructures: NestedStructureAnalysis[];
    indexSuggestions?: IndexSuggestion[];
}
export interface FieldAnalysis {
    name: string;
    type: string;
    frequency: number;
    nullCount: number;
    examples: any[];
    isArray?: boolean;
    isNested?: boolean;
}
export interface NestedStructureAnalysis {
    path: string;
    type: 'object' | 'array' | 'map';
    frequency: number;
    fields?: FieldAnalysis[];
}
export interface IndexSuggestion {
    fields: string[];
    type: 'single' | 'composite';
    reason: string;
}
export interface CreateDocumentOptions {
    merge?: boolean;
    mergeFields?: string[];
}
export interface UpdateDocumentOptions {
    merge?: boolean;
    mergeFields?: string[];
    createIfMissing?: boolean;
}
export interface DeleteOptions {
    recursive?: boolean;
}
export interface QueryResult {
    documents: DocumentInfo[];
    totalCount?: number;
    hasMore?: boolean;
    nextPageToken?: string;
    executionStats?: {
        documentsScanned: number;
        documentsReturned: number;
        executionTimeMs: number;
    };
}
export interface FirestoreError {
    code: string;
    message: string;
    details?: any;
}
export type DocumentData = Record<string, any>;
export type CollectionPath = string;
export type DocumentPath = string;
export type DocumentId = string;
