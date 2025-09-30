'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Database, Code, Sparkles, LayoutTemplate, X, Copy, CheckCircle2 } from 'lucide-react';
import SchemaBuilder, { SchemaField } from './SchemaBuilder';
import { schemaTemplates } from '@/lib/schema-templates';



export default function MQLGenerator() {
  const [activeTab, setActiveTab] = useState('demo');
  const [query, setQuery] = useState('');
  const [schema, setSchema] = useState('');
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([
    { name: '', type: 'String', required: false, description: '', children: [], isExpanded: true }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [schemaMode, setSchemaMode] = useState<'builder' | 'text'>('builder');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);

  // Preserve state for each tab
  const [customTabState, setCustomTabState] = useState({
    query: '',
    schema: '',
    schemaFields: [{ name: '', type: 'String', required: false, description: '', children: [], isExpanded: true }] as SchemaField[],
    selectedTemplate: '',
    schemaMode: 'builder' as 'builder' | 'text'
  });

  const [demoTabState, setDemoTabState] = useState({
    query: ''
  });

  useEffect(() => {
    loadSampleData();
  }, []);

  const handleGenerateMQL = async () => {
    if (!query.trim()) return;

    if (activeTab === 'custom' && !schema.trim()) {
      setResult({
        success: false,
        error: 'Please select a template or provide a custom schema'
      });
      setShowResults(true);
      return;
    }

    setIsLoading(true);
    setShowResults(true);
    setResult(null);

    try {
      let endpoint = '';
      let requestBody: any = {};

      if (activeTab === 'demo') {
        endpoint = '/api/generate-demo-mql';
        requestBody = { query: query.trim() };
      } else {
        endpoint = '/api/generate-custom-mql';
        requestBody = {
          query: query.trim(),
          schema: schema.trim()
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleData = async () => {
    try {
      const response = await fetch('/api/generate-demo-mql');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSampleData(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load sample data:', error);
    }
  };

  const handleTemplateSelect = (templateName: string) => {
    const template = schemaTemplates.find(t => t.name === templateName);
    if (template) {
      setSchema(template.schema);
      setQuery(template.sampleQuery);
      setSelectedTemplate(templateName);
      
      try {
        const parsedSchema = JSON.parse(template.schema);
        const newFields = parseSchemaToFields(parsedSchema);
        setSchemaFields(newFields);
      } catch (e) {
        console.error('Error parsing template schema:', e);
      }
    }
  };

  const parseSchemaToFields = (schemaObj: any): SchemaField[] => {
    return Object.keys(schemaObj).map(key => {
      const value = schemaObj[key];
      const field: SchemaField = {
        name: key,
        type: 'String',
        required: false,
        description: '',
        children: [],
        isExpanded: true
      };

      if (typeof value === 'string') {
        const parts = value.split(' - ');
        field.type = parts[0].replace(' (Required)', '').trim();
        field.description = parts[1] || '';
        field.required = value.includes('(Required)');
      }

      return field;
    });
  };

  const handleTabChange = (value: string) => {
    // Save current tab state before switching
    if (activeTab === 'custom') {
      setCustomTabState({
        query,
        schema,
        schemaFields,
        selectedTemplate,
        schemaMode
      });
    } else if (activeTab === 'demo') {
      setDemoTabState({ query });
    }

    setActiveTab(value);
    setResult(null);
    setShowResults(false);
    
    // Restore state for the new tab
    if (value === 'demo') {
      setQuery(demoTabState.query);
    } else if (value === 'custom') {
      setQuery(customTabState.query);
      setSchema(customTabState.schema);
      setSchemaFields(customTabState.schemaFields);
      setSelectedTemplate(customTabState.selectedTemplate);
      setSchemaMode(customTabState.schemaMode);
    }
  };

  const handleSchemaChange = (newSchema: string, newFields: SchemaField[]) => {
    setSchema(newSchema);
    setSchemaFields(newFields);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            MongoDB Query Generator
          </CardTitle>
          <CardDescription>
            Convert natural language queries to MongoDB Query Language (MQL) using AI
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="demo" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Demo Dataset
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Custom Schema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test with Candidate Dataset</CardTitle>
              <CardDescription>
                Try queries on our candidate/resume database with fields like name, email, experience, education, skills, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={loadSampleData} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                View Sample Data
              </Button>

              {sampleData.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-sm font-medium">Sample Documents (5 shown):</Label>
                  <pre className="text-xs mt-2 overflow-auto max-h-40">
                    {JSON.stringify(sampleData, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <Label htmlFor="demo-query">Natural Language Query</Label>
                <Textarea
                  id="demo-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Find candidates who worked at Google with machine learning skills and have published research papers"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Schema Query</CardTitle>
              <CardDescription>
                Choose a template, use the schema builder, or paste your own schema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-select">Quick Start Templates</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {schemaTemplates.map((template) => (
                      <SelectItem key={template.name} value={template.name}>
                        {template.name} - {template.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Schema Input Method</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    onClick={() => setSchemaMode('builder')}
                    variant={schemaMode === 'builder' ? 'default' : 'outline'}
                    size="sm"
                  >
                    <LayoutTemplate className="h-4 w-4 mr-2" />
                    Visual Builder
                  </Button>
                  <Button
                    onClick={() => setSchemaMode('text')}
                    variant={schemaMode === 'text' ? 'default' : 'outline'}
                    size="sm"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Text Input
                  </Button>
                </div>
              </div>

              {schemaMode === 'builder' ? (
                <SchemaBuilder 
                  initialFields={schemaFields}
                  onSchemaChange={handleSchemaChange} 
                />
              ) : (
                <div>
                  <Label htmlFor="custom-schema">MongoDB Collection Schema</Label>
                  <Textarea
                    id="custom-schema"
                    value={schema}
                    onChange={(e) => setSchema(e.target.value)}
                    placeholder={`{
  "name": "String - User's full name",
  "email": "String - Email address",
  "age": "Number - User age"
}`}
                    className="mt-1 font-mono text-sm"
                    rows={10}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="custom-query">Natural Language Query</Label>
                <Textarea
                  id="custom-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Find active users who joined in the last 6 months"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <div className="flex justify-center">
          <Button 
            onClick={handleGenerateMQL} 
            className="flex items-center gap-2"
            disabled={!query.trim() || (activeTab === 'custom' && !schema.trim()) || isLoading}
          >
            <Sparkles className="h-4 w-4" />
            Generate MongoDB Query
          </Button>
        </div>
      </Tabs>

      {/* Modern Overlay Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl mt-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <Card className="shadow-2xl border-2">
              <CardHeader className="relative border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResults(false)}
                  className="absolute right-4 top-4 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardTitle className="flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      Generating MQL Query...
                    </>
                  ) : result?.success ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Query Generated Successfully
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-red-600" />
                      Generation Failed
                    </>
                  )}
                </CardTitle>
              </CardHeader>

              {isLoading ? (
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Processing your query with AI...</p>
                  </div>
                </CardContent>
              ) : result ? (
                <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto p-6">
                  {result.success ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          Enhanced Query
                        </Label>
                        <p className="text-xs text-gray-500">AI-processed and structured version</p>
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                          <p className="text-sm leading-relaxed">{result.enhancedQuery}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <Code className="h-4 w-4 text-green-600" />
                          Generated MongoDB Query
                        </Label>
                        <p className="text-xs text-gray-500">Ready-to-use MQL for your collection</p>
                        <div className="relative group">
                          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-64">
                            <pre>{result.mqlQuery}</pre>
                          </div>
                          <Button 
                            onClick={() => handleCopy(result.mqlQuery)}
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copied ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {activeTab === 'demo' && result.results && result.results.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-base font-semibold flex items-center gap-2">
                            <Database className="h-4 w-4 text-blue-600" />
                            Query Results
                          </Label>
                          <p className="text-xs text-gray-500">
                            {result.results.length} document{result.results.length !== 1 ? 's' : ''} returned
                          </p>
                          <div className="bg-gray-50 p-4 rounded-lg border overflow-auto max-h-96">
                            <pre className="text-xs">{JSON.stringify(result.results, null, 2)}</pre>
                          </div>
                        </div>
                      )}

                      {activeTab === 'custom' && (
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>💡 Note:</strong> For custom schemas, only the MQL query is generated. 
                            Copy and execute it in your MongoDB environment.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg">
                      <Label className="text-base font-semibold text-red-800 mb-2 block">Error</Label>
                      <p className="text-sm text-red-600">{result.error}</p>
                    </div>
                  )}
                </CardContent>
              ) : null}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}