import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MongoDB URI not configured');
  }

  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  
  const databaseName = process.env.MONGODB_DATABASE || 'test';
  db = client.db(databaseName);
  
  return db;
}

export async function getSampleData(limit: number = 5): Promise<any[]> {
  const database = await connectToMongoDB();
  const collectionName = process.env.MONGODB_COLLECTION || 'sample';
  
  return await database
    .collection(collectionName)
    .find({})
    .limit(limit)
    .toArray();
}

export async function executeQuery(query: object | any[]): Promise<any[]> {
  const database = await connectToMongoDB();
  const collectionName = process.env.MONGODB_COLLECTION || 'sample';
  const collection = database.collection(collectionName);

  // Handle aggregation pipeline
  if (Array.isArray(query)) {
    console.log('Executing aggregation pipeline:', JSON.stringify(query, null, 2));
    return await collection
      .aggregate(query)
      .limit(20)
      .toArray();
  }

  // Handle find query
  console.log('Executing find query:', JSON.stringify(query, null, 2));
  return await collection
    .find(query)
    .limit(20)
    .toArray();
}

// Helper function to validate query structure
export function validateQuery(query: any): { isValid: boolean; type: 'find' | 'aggregate' | 'unknown'; error?: string } {
  if (Array.isArray(query)) {
    // Validate aggregation pipeline
    if (query.length === 0) {
      return { isValid: false, type: 'aggregate', error: 'Empty aggregation pipeline' };
    }
    
    // Check if all pipeline stages are objects
    const invalidStages = query.filter(stage => typeof stage !== 'object' || stage === null);
    if (invalidStages.length > 0) {
      return { isValid: false, type: 'aggregate', error: 'Invalid pipeline stages found' };
    }
    
    return { isValid: true, type: 'aggregate' };
  }
  
  if (typeof query === 'object' && query !== null) {
    // Validate find query object
    return { isValid: true, type: 'find' };
  }
  
  return { isValid: false, type: 'unknown', error: 'Query must be an object (find) or array (aggregate)' };
}