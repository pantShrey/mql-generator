import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error('GOOGLE_GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// Enhanced query generation using Gemini Pro (based on official MongoDB documentation)
export async function enhanceQuery(userQuery: string, schema?: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro', generationConfig: { temperature: 0.4 } });

  const currentDate = new Date().toString();

  const enhancementPrompt = `You are an expert data analyst experienced at using MongoDB.
Your job is to analyze a natural language query and break it down into structured requirements for MongoDB query generation.

## Current Date: 
${currentDate} (use this to inform relative date queries)

## Database Schema:
${schema ? schema : 'Generic MongoDB collection with typical fields like _id, name, email, createdAt, etc.'}

## Natural Language Query:
"${userQuery}"

## Your Task:
Analyze the natural language query and identify:


2. **Query Type**: Whether this needs find() or aggregate() operation
3. **Filter Conditions**: What fields to filter on and with what criteria
4. **Data Types**: Identify the data types involved (String, Number, Date, Boolean, Array, ObjectId)
5. **Operations Needed**: Any sorting, limiting, grouping, or projection requirements
6. **Array Handling**: If querying arrays, determine if $elemMatch, $all, or $size is needed
7. **Date Handling**: Convert relative dates to specific date ranges
8. **Text Matching**: Identify if case-insensitive or partial matching is needed


## Analysis Format:
Break down your analysis as:

**Query Analysis:**

- Operation: [find/aggregate with reasoning]
- Primary Filters: [list main filtering criteria]
- Data Types: [specify types for each field]
- Special Operations: [sorting, limiting, grouping, etc.]
- Array Operations: [if applicable]
- Date Operations: [if applicable]
- Text Operations: [if applicable]


Think step by step about the requirements before providing your analysis.`;

  const result = await model.generateContent(enhancementPrompt);
  return result.response.text();
}

// MQL generation using Gemini Flash (based on official MongoDB guidelines)
export async function generateMQL(enhancedQuery: string, schema?: string): Promise<string> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-001',
    generationConfig: { temperature: 0.1 }
  });

  const currentDate = new Date().toString();

  const mqlPrompt = `You are an expert data analyst experienced at using MongoDB.
Your job is to take query analysis and generate a MongoDB  query to execute.

**IMPORTANT OUTPUT REQUIREMENTS:**
- Return ONLY valid JSON - no code blocks, no explanations, no markdown
- For find() operations: return the query object only (e.g., {"name": "John"})
- For aggregate() operations: return the pipeline array only (e.g., [{"$match": {"name": "John"}}])
- Do NOT include db.collection.find() or db.collection.aggregate() wrapper
- Use string format for regex patterns instead of JavaScript regex literals
- Example regex: {"name": {"$regex": "^john$", "$options": "i"}} NOT {"name": /^john$/i}

## Database Schema:
${schema ? schema : 'Generic MongoDB collection'}

## Current Date: 
${currentDate} (use this to inform dates in queries)

## Query Analysis:
${enhancedQuery}

## MongoDB Query Authoring Guidelines (Official MongoDB Best Practices):

1. **Operators & Data Types**: Ensure proper use of MongoDB operators ($eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $regex, etc.) and data types (ObjectId, ISODate, Decimal128)

2. **Complex Queries**: For complex queries, use aggregation pipeline with proper stages ($match, $group, $project, $sort, $limit, $lookup, etc.)

3. **Performance**: Consider performance by utilizing available indexes, avoiding $where and full collection scans, and using covered queries where possible

4. **Result Management**: Include sorting (.sort()) and limiting (.limit()) when appropriate for result set management

5. **Null Values**: Handle null values and existence checks explicitly with $exists and $type operators to differentiate between missing fields, null values, and empty arrays

6. **Aggregation Results**: Do not include null in results objects in aggregation (e.g., do not include _id: null)

7. **Date Operations**: NEVER use an empty new Date() object. ALWAYS specify the date, such as new Date("2024-10-24"). Use the provided current date to inform relative date queries

8. **Decimal128**: For Decimal128 operations, prefer range queries over exact equality

9. **Array Queries**: When querying arrays, use appropriate operators:
   - $elemMatch for complex matching of array elements
   - $all to match multiple elements
   - $size for array length checks

10. **Text Search**: For text searches, use $regex with case-insensitive flag: { field: { $regex: "pattern", $options: "i" } }

11. **Data Type Conversion**: Use proper data type conversions (ObjectId for _id fields, ISODate for date fields)

## Instructions:
1. Based on the query analysis, generate the appropriate MongoDB query
2. Choose find() for simple queries, aggregate() for complex operations requiring grouping, joining, or advanced transformations
3. Use proper MongoDB syntax and operators
4. Ensure all dates use proper ISODate format
5. Include appropriate limits to prevent excessive data retrieval
6. No explanations, just the query object or pipeline array

Generate the MongoDB query:`;

  const result = await model.generateContent(mqlPrompt);
  const response = result.response.text();
  console.log('Raw MQL Response:', response);
  // Enhanced parsing to extract MongoDB queries from various formats
  
  try {
    // Remove any markdown code blocks
    let cleanedResponse = response.replace(/```(?:json|javascript|js)?\n?/g, '').trim();
    
    // Remove any trailing code block markers
    cleanedResponse = cleanedResponse.replace(/```\s*$/, '').trim();
    
    // Try to parse as JSON to validate
    const parsed = JSON.parse(cleanedResponse);
    
    // Return the cleaned response as string (it will be parsed again in route.ts)
    return cleanedResponse;
  } catch (parseError) {
    console.error('Failed to parse MQL response:', parseError);
    console.error('Response was:', response);
    
    // Fallback: try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const extracted = jsonMatch[0];
        JSON.parse(extracted); // Validate
        return extracted;
      } catch (e) {
        console.error('Fallback extraction also failed:', e);
      }
    }
    
    throw new Error('Could not generate valid JSON from LLM response');
  }
}
