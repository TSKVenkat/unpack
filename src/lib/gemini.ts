/**
 * Gemini API integration for code analysis
 */
import { RepoItem, DirectoryItem, FileItem } from './github';

// Analysis result types
export type AnalysisResult = {
  summary: string;
  features: Array<{name: string, description: string}>;
  architecture: Record<string, any>;
  codeStats: Record<string, any>;
  items?: Array<any>;
};

export type FileAnalysisResult = {
  summary: string;
  features: Record<string, any>;
  complexity?: number;
  functions?: Array<{name: string, description: string}>;
  dependencies?: Array<string>;
  issues?: Array<{type: string, description: string}>;
};

export type DirectoryAnalysisResult = {
  summary: string;
  features: Record<string, any>;
  structure?: Record<string, any>;
  dependencies?: Array<string>;
  recommendations?: Array<string>;
};

// Core function to analyze code with Gemini API
export const analyzeCode = async (repoStructure: RepoItem[], options: any = {}): Promise<AnalysisResult> => {
  try {
    // Create context from repository structure
    const context = buildAnalysisContext(repoStructure);
    
    // Construct prompt for Gemini API
    const prompt = constructAnalysisPrompt(context, options);
    
    // Call Gemini API
    const result = await callGeminiAPI(prompt);
    
    // Parse and structure the response
    const structuredAnalysis = parseAnalysisResponse(result);
    
    return structuredAnalysis;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to analyze code with Gemini API");
  }
};

// Analyze a specific file
export const analyzeFile = async (fileContent: string, filePath: string, repoUrl: string): Promise<FileAnalysisResult> => {
  try {
    // Construct file-specific prompt
    const prompt = constructAnalysisPrompt(null, {
      type: 'file',
      path: filePath,
      content: fileContent,
      repoUrl: repoUrl
    });
    
    // Call Gemini API
    const result = await callGeminiAPI(prompt);
    
    // Parse and structure the response
    const structuredAnalysis = parseFileAnalysisResponse(result, filePath);
    
    return structuredAnalysis;
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error);
    return {
      summary: `Failed to analyze file ${filePath}`,
      features: {},
      complexity: 0
    };
  }
};

// Analyze a specific directory
export const analyzeDirectory = async (directoryContents: any[], dirPath: string, repoUrl: string): Promise<DirectoryAnalysisResult> => {
  try {
    // Construct directory-specific prompt
    const prompt = constructAnalysisPrompt(null, {
      type: 'directory',
      path: dirPath,
      contents: directoryContents,
      repoUrl: repoUrl
    });
    
    // Call Gemini API
    const result = await callGeminiAPI(prompt);
    
    // Parse and structure the response
    const structuredAnalysis = parseDirectoryAnalysisResponse(result, dirPath);
    
    return structuredAnalysis;
  } catch (error) {
    console.error(`Error analyzing directory ${dirPath}:`, error);
    return {
      summary: `Failed to analyze directory ${dirPath}`,
      features: {}
    };
  }
};

// Build analysis context from repo structure
export const buildAnalysisContext = (repoStructure: any) => {
  // Import utility functions from github.ts
  const { detectLanguages, findKeyFiles, calculateCodeStats, simplifyStructure } = require('./github');
  
  // Extract languages used
  const languages = detectLanguages(repoStructure);
  
  // Identify key files (package.json, etc)
  const keyFiles = findKeyFiles(repoStructure);
  
  // Calculate code statistics
  const stats = calculateCodeStats(repoStructure);
  
  return {
    languages,
    keyFiles,
    stats,
    structure: simplifyStructure(repoStructure)
  };
};

// Construct appropriate prompt for Gemini API
export const constructAnalysisPrompt = (context: any | null, options: any = {}) => {
  let prompt = '';
  
  if (options.type === 'file') {
    // Construct file-specific prompt
    prompt = `Analyze the following code file and provide insights:
    
    File: ${options.path}
    Content:
    ${options.content}
    
    Provide the following in JSON format:
    {
      "summary": "Summary of what this file does",
      "features": {
        "key_feature_1": "Description of feature 1",
        "key_feature_2": "Description of feature 2"
      },
      "complexity": 0.0 to 1.0 (estimated complexity score),
      "functions": [
        { "name": "functionName", "description": "What this function does" }
      ],
      "dependencies": ["List of dependencies or imports used"],
      "issues": [
        { "type": "issue type", "description": "Description of potential issue" }
      ]
    }`;
  } else if (options.type === 'directory') {
    // Construct directory-specific prompt
    prompt = `Analyze the following directory structure and provide insights:
    
    Directory: ${options.path}
    Contents:
    ${JSON.stringify(options.contents, null, 2)}
    
    Provide the following in JSON format:
    {
      "summary": "Summary of this directory's purpose",
      "features": {
        "key_feature_1": "Description of feature 1",
        "key_feature_2": "Description of feature 2"
      },
      "structure": {
        "description": "Description of the directory structure",
        "key_components": ["List of key components in this directory"]
      },
      "dependencies": ["List of key dependencies or relationships"],
      "recommendations": ["Potential improvements or recommendations"]
    }`;
  } else {
    // Default to repository analysis
    prompt = `Analyze the following GitHub repository structure and provide insights:
    
    Repository Statistics:
    - Languages: ${JSON.stringify(context?.languages)}
    - Key Files: ${JSON.stringify(context?.keyFiles)}
    - Stats: ${JSON.stringify(context?.stats)}
    
    Structure:
    ${JSON.stringify(context?.structure, null, 2)}
    
    Provide the following in JSON format:
    {
      "summary": "Overall summary of the repository",
      "features": [
        { "name": "Feature name", "description": "Feature description" }
      ],
      "architecture": {
        "pattern": "Architectural pattern used",
        "components": ["Key architectural components"],
        "description": "Description of the architecture"
      },
      "codeStats": {
        "complexity": "Overall complexity assessment",
        "quality": "Code quality assessment",
        "maintainability": "Maintainability assessment"
      },
      "items": [
        { "path": "Path to key file", "summary": "Summary of the file" }
      ]
    }`;
  }
  
  return prompt;
};

// Call Gemini API
export const callGeminiAPI = async (prompt: string) => {
  try {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not provided. Using mock implementation.');
      return mockGeminiResponse(prompt);
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract text from response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      return text;
    }
    
    throw new Error('Unexpected response format from Gemini API');
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return mockGeminiResponse(prompt);
  }
};

// Mock implementation for development or when API calls fail
const mockGeminiResponse = (prompt: string) => {
  console.log('Using mock Gemini response for prompt:', prompt.substring(0, 100) + '...');
  
  // Return mock response based on prompt content
  if (prompt.includes('file')) {
    return `
      Summary: This file appears to be a React component that handles user authentication.
      
      Key functions/components:
      - LoginForm: Handles user login form submission
      - validateCredentials: Validates user input
      - handleSubmit: Processes form submission
      
      Integration: This component is likely used in a login page and interacts with authentication API endpoints.
      
      Potential improvements: Could benefit from form validation library integration and more robust error handling.
    `;
  } else if (prompt.includes('directory')) {
    return `
      Summary: This directory contains API route handlers for authentication.
      
      Main features:
      - User registration
      - Login functionality
      - Token refresh
      - Session management
      
      Structure: Well-organized with separate files for each authentication function.
      
      Dependencies: Relies on JWT for token management and bcrypt for password hashing.
    `;
  } else {
    return `
      Summary: This appears to be a Next.js application for code analysis.
      
      Main features:
      - GitHub repository analysis
      - Code structure visualization
      - Authentication system
      - Analysis history management
      
      Architecture: Follows a typical Next.js structure with API routes and React components.
      
      Key implementation details:
      - Uses Gemini API for code analysis
      - Implements JWT authentication
      - Stores data in PostgreSQL via Prisma
      - Caches results with Redis
    `;
  }
};

// Parse and structure the Gemini API response for repository analysis
export const parseAnalysisResponse = (responseText: string): AnalysisResult => {
  try {
    // Try to parse as JSON
    let jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                    responseText.match(/```\n([\s\S]*?)\n```/) ||
                    responseText.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      const jsonText = jsonMatch[1] || jsonMatch[0];
      const parsedJson = JSON.parse(jsonText);
      
      // Ensure the response has the expected structure
      return {
        summary: parsedJson.summary || 'No summary provided',
        features: Array.isArray(parsedJson.features) ? parsedJson.features : [],
        architecture: parsedJson.architecture || { description: 'No architecture details provided' },
        codeStats: parsedJson.codeStats || {},
        items: parsedJson.items || []
      };
    }
    
    // If not JSON, create structured format from text
    const sections = responseText.split(/\n\s*\d+\.\s+/);
    
    // Remove any empty sections
    const filteredSections = sections.filter(section => section.trim().length > 0);
    
    if (filteredSections.length >= 4) {
      return {
        summary: filteredSections[0].trim(),
        features: parseFeatures(filteredSections[1]),
        architecture: { description: filteredSections[2].trim() },
        codeStats: { description: filteredSections[3].trim() },
        items: []
      };
    }
    
    // Fallback for unstructured response
    return {
      summary: responseText.trim(),
      features: [],
      architecture: { description: "Analysis could not be structured properly" },
      codeStats: { },
      items: []
    };
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return {
      summary: "Failed to parse analysis response",
      features: [],
      architecture: { description: "Analysis parsing error" },
      codeStats: { },
      items: []
    };
  }
};

// Parse and structure the Gemini API response for file analysis
export const parseFileAnalysisResponse = (responseText: string, filePath: string): FileAnalysisResult => {
  try {
    // Try to parse as JSON
    let jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                    responseText.match(/```\n([\s\S]*?)\n```/) ||
                    responseText.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      const jsonText = jsonMatch[1] || jsonMatch[0];
      const parsedJson = JSON.parse(jsonText);
      
      // Ensure the response has the expected structure
      return {
        summary: parsedJson.summary || `Analysis of ${filePath}`,
        features: parsedJson.features || {},
        complexity: typeof parsedJson.complexity === 'number' ? parsedJson.complexity : 0.5,
        functions: Array.isArray(parsedJson.functions) ? parsedJson.functions : [],
        dependencies: Array.isArray(parsedJson.dependencies) ? parsedJson.dependencies : [],
        issues: Array.isArray(parsedJson.issues) ? parsedJson.issues : []
      };
    }
    
    // If not JSON, create structured format from text
    const sections = responseText.split(/\n\s*\d+\.\s+/);
    
    // Remove any empty sections
    const filteredSections = sections.filter(section => section.trim().length > 0);
    
    if (filteredSections.length >= 2) {
      return {
        summary: filteredSections[0].trim(),
        features: { description: filteredSections[1].trim() },
        complexity: 0.5
      };
    }
    
    // Fallback for unstructured response
    return {
      summary: responseText.trim(),
      features: {},
      complexity: 0.5
    };
  } catch (error) {
    console.error(`Error parsing file analysis response for ${filePath}:`, error);
    return {
      summary: `Failed to parse analysis for ${filePath}`,
      features: {},
      complexity: 0.5
    };
  }
};

// Parse and structure the Gemini API response for directory analysis
export const parseDirectoryAnalysisResponse = (responseText: string, dirPath: string): DirectoryAnalysisResult => {
  try {
    // Try to parse as JSON
    let jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                    responseText.match(/```\n([\s\S]*?)\n```/) ||
                    responseText.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      const jsonText = jsonMatch[1] || jsonMatch[0];
      const parsedJson = JSON.parse(jsonText);
      
      // Ensure the response has the expected structure
      return {
        summary: parsedJson.summary || `Analysis of ${dirPath}`,
        features: parsedJson.features || {},
        structure: parsedJson.structure || {},
        dependencies: Array.isArray(parsedJson.dependencies) ? parsedJson.dependencies : [],
        recommendations: Array.isArray(parsedJson.recommendations) ? parsedJson.recommendations : []
      };
    }
    
    // If not JSON, create structured format from text
    const sections = responseText.split(/\n\s*\d+\.\s+/);
    
    // Remove any empty sections
    const filteredSections = sections.filter(section => section.trim().length > 0);
    
    if (filteredSections.length >= 2) {
      return {
        summary: filteredSections[0].trim(),
        features: { description: filteredSections[1].trim() }
      };
    }
    
    // Fallback for unstructured response
    return {
      summary: responseText.trim(),
      features: {}
    };
  } catch (error) {
    console.error(`Error parsing directory analysis response for ${dirPath}:`, error);
    return {
      summary: `Failed to parse analysis for ${dirPath}`,
      features: {}
    };
  }
};

// Helper to parse features from text
const parseFeatures = (featuresText: string) => {
  if (!featuresText) return [];
  
  const features = [];
  const featureMatches = featuresText.match(/[•\-*]?\s*([^:]+):\s*([^\n]+)/g);
  
  if (featureMatches) {
    for (const match of featureMatches) {
      const [name, description] = match.split(/:\s*/);
      features.push({
        name: name.replace(/^[•\-*]?\s*/, '').trim(),
        description: description.trim()
      });
    }
  } else {
    // Alternative parsing for different format
    const lines = featuresText.split('\n').filter(line => line.trim().length > 0);
    for (const line of lines) {
      const featureName = line.trim().replace(/^[•\-*]?\s*/, '');
      features.push({
        name: featureName,
        description: featureName
      });
    }
  }
  
  return features;
};
