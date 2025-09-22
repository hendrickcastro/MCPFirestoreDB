import { ToolResult, CollectionInfo, CollectionStats, SchemaAnalysis, DeleteOptions } from './types.js';
export declare const mcp_list_collections: () => Promise<ToolResult<CollectionInfo[]>>;
export declare const mcp_get_collection_stats: (params: {
    collection_path: string;
    sample_size?: number;
}) => Promise<ToolResult<CollectionStats>>;
export declare const mcp_analyze_collection_schema: (params: {
    collection_path: string;
    sample_size?: number;
}) => Promise<ToolResult<SchemaAnalysis>>;
export declare const mcp_delete_collection: (params: {
    collection_path: string;
    options?: DeleteOptions;
}) => Promise<ToolResult<{
    deleted: boolean;
    documentsDeleted: number;
}>>;
