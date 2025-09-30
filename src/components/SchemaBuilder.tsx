'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, ChevronRight, ChevronDown } from 'lucide-react';

// It's recommended to move this interface to a central types file (e.g., types/index.ts)
export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  children?: SchemaField[];
  isExpanded?: boolean;
}

interface SchemaBuilderProps {
  initialFields?: SchemaField[];
  onSchemaChange: (schema: string, fields: SchemaField[]) => void;
}

export default function SchemaBuilder({ initialFields, onSchemaChange }: SchemaBuilderProps) {
  const [fields, setFields] = useState<SchemaField[]>(initialFields || [
    { name: '', type: 'String', required: false, description: '', children: [], isExpanded: true }
  ]);

  useEffect(() => {
    if (initialFields && initialFields.length > 0) {
      setFields(initialFields);
    }
  }, [initialFields]);

  useEffect(() => {
    generateSchema(fields);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  const addField = (parentPath?: number[]) => {
    const newField: SchemaField = { 
      name: '', 
      type: 'String', 
      required: false, 
      description: '', 
      children: [],
      isExpanded: true 
    };

    if (!parentPath) {
      setFields([...fields, newField]);
    } else {
      const updatedFields = [...fields];
      let target = updatedFields;
      
      for (let i = 0; i < parentPath.length - 1; i++) {
        target = target[parentPath[i]].children!;
      }
      
      const parentIndex = parentPath[parentPath.length - 1];
      if (!target[parentIndex].children) {
        target[parentIndex].children = [];
      }
      target[parentIndex].children!.push(newField);
      
      setFields(updatedFields);
    }
  };

  const removeField = (path: number[]) => {
    if (path.length === 1 && fields.length === 1) return;

    const updatedFields = [...fields];
    
    if (path.length === 1) {
      updatedFields.splice(path[0], 1);
    } else {
      let target = updatedFields;
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]].children!;
      }
      target.splice(path[path.length - 1], 1);
    }
    
    setFields(updatedFields);
  };

  const updateField = (path: number[], updates: Partial<SchemaField>) => {
    const updatedFields = [...fields];
    let target = updatedFields;
    
    for (let i = 0; i < path.length - 1; i++) {
      target = target[path[i]].children!;
    }
    
    const fieldIndex = path[path.length - 1];
    target[fieldIndex] = { ...target[fieldIndex], ...updates };
    
    setFields(updatedFields);
  };

  const toggleExpanded = (path: number[]) => {
    const updatedFields = [...fields];
    let target = updatedFields;
    
    for (let i = 0; i < path.length - 1; i++) {
      target = target[path[i]].children!;
    }
    
    const fieldIndex = path[path.length - 1];
    target[fieldIndex].isExpanded = !target[fieldIndex].isExpanded;
    
    setFields(updatedFields);
  };

  const generateSchema = (currentFields: SchemaField[]) => {
    const buildSchemaObject = (fields: SchemaField[]): Record<string, any> => {
      const schemaObject: Record<string, any> = {};
      
      fields.forEach(field => {
        if (field.name) {
          let typeDescription = field.type;
          
          if (field.type === 'Object' && field.children && field.children.length > 0) {
            const nestedSchema = buildSchemaObject(field.children);
            typeDescription = `Object - ${field.description || 'Nested object'}`;
            schemaObject[field.name] = {
              type: typeDescription,
              properties: nestedSchema
            };
            if (field.required) {
              schemaObject[field.name].required = true;
            }
          } else if (field.type === 'Array' && field.children && field.children.length > 0) {
            const nestedSchema = buildSchemaObject(field.children);
            typeDescription = `Array - ${field.description || 'Array of objects'}`;
            schemaObject[field.name] = {
              type: typeDescription,
              items: nestedSchema
            };
            if (field.required) {
              schemaObject[field.name].required = true;
            }
          } else {
            if (field.description) {
              typeDescription += ` - ${field.description}`;
            }
            if (field.required) {
              typeDescription += ' (Required)';
            }
            schemaObject[field.name] = typeDescription;
          }
        }
      });
      
      return schemaObject;
    };

    const schemaObject = buildSchemaObject(currentFields);
    const schemaString = JSON.stringify(schemaObject, null, 2);
    onSchemaChange(schemaString, currentFields);
  };

  const renderField = (field: SchemaField, path: number[], depth: number = 0) => {
    const hasNestableType = field.type === 'Object' || field.type === 'Array';
    const canDelete = !(path.length === 1 && fields.length === 1);

    return (
      <div key={path.join('-')} className="space-y-2">
        <div 
          className="grid grid-cols-12 gap-3 items-end"
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <div className="col-span-12 flex items-end gap-3">
            {hasNestableType && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(path)}
                className="h-9 w-9 p-0 flex-shrink-0"
              >
                {field.isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            
            <div className="flex-1 grid grid-cols-12 gap-3 items-end">
              <div className="col-span-3">
                <Label htmlFor={`field-name-${path.join('-')}`}>Field Name</Label>
                <Input
                  id={`field-name-${path.join('-')}`}
                  value={field.name}
                  onChange={(e) => updateField(path, { name: e.target.value })}
                  placeholder="fieldName"
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor={`field-type-${path.join('-')}`}>Type</Label>
                <Select 
                  value={field.type} 
                  onValueChange={(value) => {
                    const updates: Partial<SchemaField> = { type: value };
                    if (value === 'Object' || value === 'Array') {
                      if (!field.children) {
                        updates.children = [];
                        updates.isExpanded = true;
                      }
                    }
                    updateField(path, updates);
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="String">String</SelectItem>
                    <SelectItem value="Number">Number</SelectItem>
                    <SelectItem value="Boolean">Boolean</SelectItem>
                    <SelectItem value="Date">Date</SelectItem>
                    <SelectItem value="Array">Array</SelectItem>
                    <SelectItem value="Object">Object</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-4">
                <Label htmlFor={`field-desc-${path.join('-')}`}>Description</Label>
                <Input
                  id={`field-desc-${path.join('-')}`}
                  value={field.description || ''}
                  onChange={(e) => updateField(path, { description: e.target.value })}
                  placeholder="Field description"
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(path, { required: e.target.checked })}
                    className="rounded"
                  />
                  <span>Required</span>
                </Label>
              </div>

              <div className="col-span-1 flex gap-1">
                {hasNestableType && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addField([...path])}
                    className="h-9 w-9 p-0"
                    title="Add nested field"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeField(path)}
                  disabled={!canDelete}
                  className="h-9 w-9 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {hasNestableType && field.isExpanded && field.children && field.children.length > 0 && (
          <div className="space-y-2 border-l-2 border-gray-200 ml-3 pl-3">
            {field.children.map((childField, index) => 
              renderField(childField, [...path, index], depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visual Schema Builder</CardTitle>
        <CardDescription>
          Build your MongoDB collection schema with support for nested objects and arrays
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => renderField(field, [index]))}

        <Button onClick={() => addField()} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Root Field
        </Button>
      </CardContent>
    </Card>
  );
}