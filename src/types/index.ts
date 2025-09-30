export interface SampleDocument {
  _id: string;
  [key: string]: unknown;
}

// Updated for separate demo and custom endpoints
export interface DemoMQLRequest {
  query: string;
}

export interface CustomMQLRequest {
  query: string;
  schema: string;
}

// Unified response interface for both endpoints
export interface MQLGenerationResponse {
  success: boolean;
  enhancedQuery?: string;
  mqlQuery?: string;
  results?: unknown[] | null;  // null for custom schema, array for demo
  schema?: string;
  error?: string;
}

// Sample data endpoint response
export interface SampleDataResponse {
  success: boolean;
  data?: SampleDocument[];
  error?: string;
}

// Updated SchemaField interface with support for nested structures
export interface SchemaField {
  name: string;
  type: 'String' | 'Number' | 'Boolean' | 'Date' | 'Array' | 'Object';
  required: boolean;
  description?: string;
  children?: SchemaField[];  // For nested fields in Objects and Arrays
  isExpanded?: boolean;      // UI state for collapse/expand functionality
}

export interface MongoDBSchema {
  collection: string;
  fields: SchemaField[];
  sampleData?: unknown[];
}

export interface SchemaTemplate {
  name: string;
  description: string;
  schema: string;
  sampleQuery: string;
}