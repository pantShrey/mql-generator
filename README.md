# MongoDB Query Generator

An intelligent Next.js application that converts natural language queries into MongoDB Query Language (MQL) using AI. Built with modern React components and powered by Google Gemini AI for accurate query translation.

##  Features

- **AI-Powered Query Translation**: Convert natural language to MQL using Google Gemini AI
- **Visual Schema Builder**: Drag-and-drop interface for building MongoDB collection schemas
- **Pre-built Templates**: Ready-to-use schema templates including CandidateResume database
- **Real-time Execution**: Execute queries instantly on demo dataset with live results
- **Custom Schema Support**: Build and test queries on your own MongoDB schemas
- **Modern UI**: Clean, responsive interface built with TypeScript and Tailwind CSS

##  Live Demo

**[Try it out here!](https://mql-generator.vercel.app/)**

##  Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB database (for custom schemas)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone mql-generator
   cd mql-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
    ```

3. **Environment Variables**

   Fill your environment variables in `.env.local`  :
   ```env
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DATABASE=your_database_name
   MONGODB_COLLECTION=your_collection_name
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)



##  Usage

### Demo Mode (with Custom Dataset)

- Default demo uses **Candidate/Resume Database** schema template.
- To use your own dataset:
  1. Update `.env.local` with your `MONGODB_DATABASE` and `MONGODB_COLLECTION`.
  2. In `lib/schema-templates.ts`, add your schema with a unique `name` and corresponding fields.
  3. In `app/api/generate-demo-mql/route.ts`, modify the template lookup:
     ```ts
     const candidateTemplate = schemaTemplates.find(
       t => t.name === "Your Schema Name"
     );
     ```
  4. Run the app and select **Demo Dataset**, then choose your schema to test queries against your collection.

### Custom Schema Mode
- Use the **Custom Schema** tab to define a JSON schema inline or select a template.
- Generate MQL without executing on database (ideal for schema validation).

## 🏗️ Project Structure

```
├── components/
│   ├── MQL-Generator.tsx      # Main query interface
│   ├── SchemaBuilder.tsx      # Visual schema builder
│   └── ui/                    # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── tabs.tsx
│       └── ...
├── app/
│   └── api/                   # API endpoints
│       ├── generate-demo-mql/
│       │   └── route.ts       # Demo queries against MongoDB
│       ├── generate-custom-mql/
│       └── sample-data/
├── lib/
│   ├── schema-templates.ts    # Schema definitions and templates
│   └── gemini.ts              # AI query enhancement and MQL generation
│   └── ...
├── types/                     # TypeScript type definitions
├── .env.local.example         # Example env vars
└── README.md                  # Project documentation
```

## 🔧 API Endpoints

### `POST /api/generate-demo-mql`
Processes natural language requests on the demo (or custom) MongoDB collection.

### `POST /api/generate-custom-mql`
Generates MQL for provided JSON schema without execution.

### `GET /api/sample-data`
Fetches sample documents from the demo collection.

##  AI & Architecture Feedback

This project leverages **Next.js 13 App Router** and React hooks for seamless client-server interactions. The clear separation between demo and custom modes makes the codebase scalable. The visual schema builder greatly improves usability for non-technical users. Overall, it’s a well-structured, modern frontend application showcasing best practices in:

- **TypeScript-First Development**
- **Composable React Components**
- **API Routes for Serverless Functions**
- **AI Integration via Google Gemini**
- **Tailwind CSS Utility-First Styling**

This setup is excellent for rapid prototyping and production-readiness, offering both flexibility and clarity for developers and end-users alike.

## Contributing & Support

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Enjoy building with MongoDB Query Generator!**
