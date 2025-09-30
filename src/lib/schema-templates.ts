import { SchemaTemplate } from '@/types';

export const schemaTemplates: SchemaTemplate[] = [
  {
    name: 'E-commerce Products',
    description: 'Online store product catalog',
    schema: JSON.stringify({
      "name": "String - Product name",
      "price": "Number - Product price",
      "category": "String - Product category",
      "inStock": "Boolean - Availability status",
      "tags": "Array - Product tags"
    }, null, 2),
    sampleQuery: 'Find products under $50 that are in stock in the electronics category'
  },
  {
    name: 'User Management',
    description: 'User accounts and profiles',
    schema: JSON.stringify({
      "username": "String - Username",
      "email": "String - Email address",
      "age": "Number - User age",
      "isActive": "Boolean - Account active status",
      "joinDate": "Date - Registration date"
    }, null, 2),
    sampleQuery: 'Find active users who joined in the last 3 months'
  },
  {
    name: "Blog Posts",
    description: "Content management system",
    schema: `{
  "title": "String - Post title",
  "content": "String - Post content",
  "author": "String - Author name",
  "publishDate": "Date - Publication date",
  "category": "String - Post category",
  "tags": "Array<String> - Post tags",
  "views": "Number - View count",
  "likes": "Number - Like count",
  "isPublished": "Boolean - Publication status",
  "featured": "Boolean - Featured post status"
}`,
    sampleQuery: "Show me published posts from last month with more than 100 views"
  },
  {
    name: "Order Management", 
    description: "E-commerce orders and transactions",
    schema: `{
  "orderId": "String - Unique order ID",
  "customerId": "String - Customer ID",
  "customerName": "String - Customer name",
  "items": "Array<Object> - Ordered items",
  "totalAmount": "Number - Total order value",
  "status": "String - Order status (pending/shipped/delivered)",
  "orderDate": "Date - Order placement date",
  "shippingAddress": "String - Delivery address",
  "paymentMethod": "String - Payment method used",
  "isRush": "Boolean - Rush delivery requested"
}`,
    sampleQuery: "Find all pending orders from this week with total amount over $100"
  },
  {
    name: "Candidate/Resume Database",
    description: "Professional profiles",
    schema: `{
  "_id": "ObjectId - MongoDB document ID",
  "userId": "String - Unique candidate identifier", 
  "name": "String - Full name",
  "email": "String - Contact email",
  "location": "String - City, State/Country",
  "workExperience": {
    "type": "Array<Object>",
    "description": "Job history with company details",
    "structure": {
      "company": "String - Company name",
      "title": "String - Job title/position", 
      "start_date": "Date - Employment start date",
      "end_date": "Date|null - Employment end date (null if current)",
      "description": "String - Job responsibilities and achievements"
    }
  },
  "education": {
    "type": "Array<Object>", 
    "description": "Educational background",
    "structure": {
      "degree": "String - Degree type (Bachelor, Master, PhD)",
      "major": "String - Field of study", 
      "school": "String - University/institution name",
      "graduation_date": "Date - Graduation date",
      "gpa": "Number - Grade point average"
    }
  },
  "skills": "Array<String> - Technical and professional skills",
  "awards": {
    "type": "Array<Object>",
    "description": "Professional recognition and achievements", 
    "structure": {
      "title": "String - Award name",
      "description": "String - Award details",
      "date": "Date - When award was received",
      "organization": "String - Awarding organization"
    }
  },
  "publications": {
    "type": "Array<Object>",
    "description": "Research papers and articles",
    "structure": {
      "details": "String - Publication title and abstract",
      "publication": "String - Journal/conference name", 
      "date": "Date - Publication date"
    }
  },
  "github": {
    "type": "Object",
    "description": "GitHub profile information",
    "structure": {
      "userName": "String - GitHub username",
      "githubId": "String - GitHub profile ID",
      "repositories": "Number - Number of public repositories",
      "followers": "Number - Number of GitHub followers"
    }
  },
  "certifications": "Array<String> - Professional certifications",
  "projects": {
    "type": "Array<Object>",
    "description": "Personal and professional projects",
    "structure": {
      "projectId": "String - Unique project identifier",
      "title": "String - Project name", 
      "description": "String - Project details and impact",
      "startDate": "Date - Project start date",
      "endDate": "Date - Project completion date",
      "technologies": "Array<String> - Technologies used",
      "githubUrl": "String - Repository URL"
    }
  },
  "yearsOfExperience": "Number - Total years of professional experience",
  "currentSalary": "Number - Annual salary in USD", 
  "isActive": "Boolean - Whether actively job searching",
  "lastUpdated": "Date - Profile last updated"
}`,
    sampleQuery: "Find candidates who worked at Google or Microsoft with machine learning skills and published research papers"
  }
];



