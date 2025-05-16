/**
 * GitHub API integration for fetching repository data
 */

// Maximum file size to fetch (in bytes)
const MAX_FILE_SIZE = 1000000; // 1MB

// Helper to parse GitHub URL
export const parseGitHubUrl = (url: string) => {
  // Handle various GitHub URL formats
  const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = url.match(regex);
  
  if (!match) {
    throw new Error("Invalid GitHub repository URL");
  }
  
  return {
    owner: match[1],
    repo: match[2].replace('.git', '')
  };
};

// Fetch with authentication
export const fetchWithAuth = async (url: string) => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  // Add GitHub token if available
  if (process.env.GITHUB_API_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_API_TOKEN}`;
  }
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Check if file is a code file
export const isCodeFile = (filename: string) => {
  const codeExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.go',
    '.rb', '.php', '.swift', '.kt', '.rs', '.dart', '.html', '.css', '.scss',
    '.json', '.yml', '.yaml', '.md', '.sql'
  ];
  
  return codeExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

// Core function to fetch a GitHub repository
export const fetchRepository = async (repoUrl: string) => {
  // Extract owner and repo name from URL
  const { owner, repo } = parseGitHubUrl(repoUrl);
  
  // GitHub API endpoints
  const baseApiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const contentsUrl = `${baseApiUrl}/contents`;
  
  // Fetch repository metadata
  const repoData = await fetchWithAuth(baseApiUrl);
  
  // Recursively fetch directory structure
  const structure = await fetchDirectoryContents(contentsUrl);
  
  return {
    metadata: repoData,
    structure: structure
  };
};

// Define types for repository structure
export type FileItem = {
  type: 'file';
  name: string;
  path: string;
  size: number;
  content: string | null;
};

export type DirectoryItem = {
  type: 'directory';
  name: string;
  path: string;
  children: RepoItem[];
};

export type RepoItem = FileItem | DirectoryItem;

// Helper to recursively fetch directory contents
export const fetchDirectoryContents = async (url: string, path = ''): Promise<RepoItem[]> => {
  const contents = await fetchWithAuth(url);
  
  const result: RepoItem[] = [];
  
  for (const item of contents) {
    if (item.type === 'dir') {
      const children: RepoItem[] = await fetchDirectoryContents(item.url, `${path}/${item.name}`);
      result.push({
        type: 'directory',
        name: item.name,
        path: `${path}/${item.name}`,
        children: children
      });
    } else if (item.type === 'file') {
      // Only fetch content for code files under size limit
      let content = null;
      if (isCodeFile(item.name) && item.size < MAX_FILE_SIZE) {
        const fileData = await fetch(item.download_url);
        content = await fileData.text();
      }
      
      result.push({
        type: 'file',
        name: item.name,
        path: `${path}/${item.name}`,
        size: item.size,
        content: content
      });
    }
  }
  
  return result;
};

// Fetch specific file content from GitHub
export const fetchFileContent = async (repoUrl: string, filePath: string) => {
  try {
    // Extract owner and repo name from URL
    const { owner, repo } = parseGitHubUrl(repoUrl);
    
    // GitHub API endpoint for specific file
    const fileApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    
    // Fetch file metadata
    const fileData = await fetchWithAuth(fileApiUrl);
    
    // Check file size
    if (fileData.size > MAX_FILE_SIZE) {
      console.warn(`File ${filePath} exceeds maximum size limit of ${MAX_FILE_SIZE} bytes`);
      return null;
    }
    
    // Fetch file content
    const response = await fetch(fileData.download_url);
    const content = await response.text();
    
    return content;
  } catch (error) {
    console.error(`Error fetching file ${filePath}:`, error);
    return null;
  }
};

// Fetch specific directory contents from GitHub
export const fetchDirectoryContent = async (repoUrl: string, dirPath: string) => {
  try {
    // Extract owner and repo name from URL
    const { owner, repo } = parseGitHubUrl(repoUrl);
    
    // GitHub API endpoint for specific directory
    const dirApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}`;
    
    // Fetch directory contents
    const contents = await fetchWithAuth(dirApiUrl);
    
    return contents;
  } catch (error) {
    console.error(`Error fetching directory ${dirPath}:`, error);
    return [];
  }
};

// Detect languages used in repository
export const detectLanguages = (repoStructure: RepoItem[]) => {
  const languageCounts: Record<string, number> = {};
  let totalFiles = 0;
  
  const processItem = (item: RepoItem) => {
    if (item.type === 'file' && item.name.includes('.')) {
      const extension = item.name.split('.').pop()?.toLowerCase();
      
      if (extension) {
        languageCounts[extension] = (languageCounts[extension] || 0) + 1;
        totalFiles++;
      }
    } else if (item.type === 'directory' && item.children) {
      item.children.forEach(processItem);
    }
  };
  
  repoStructure.forEach(processItem);
  
  // Convert to percentage
  const languages = Object.entries(languageCounts)
    .map(([language, count]) => ({
      language,
      percentage: Math.round((count / totalFiles) * 100)
    }))
    .sort((a, b) => b.percentage - a.percentage);
  
  return languages;
};

// Find key files in repository (package.json, README, etc.)
export const findKeyFiles = (repoStructure: RepoItem[]) => {
  const keyFilePatterns = [
    { name: 'package.json', type: 'dependency' },
    { name: 'requirements.txt', type: 'dependency' },
    { name: 'Gemfile', type: 'dependency' },
    { name: 'pom.xml', type: 'dependency' },
    { name: 'build.gradle', type: 'dependency' },
    { name: 'README.md', type: 'documentation' },
    { name: 'LICENSE', type: 'license' },
    { name: '.gitignore', type: 'configuration' },
    { name: 'Dockerfile', type: 'configuration' },
    { name: 'docker-compose.yml', type: 'configuration' },
    { name: '.env.example', type: 'configuration' },
    { name: 'tsconfig.json', type: 'configuration' },
    { name: '.eslintrc', type: 'configuration' },
    { name: '.prettierrc', type: 'configuration' },
    { name: 'next.config.js', type: 'configuration' },
    { name: 'nuxt.config.js', type: 'configuration' },
    { name: 'angular.json', type: 'configuration' },
    { name: 'svelte.config.js', type: 'configuration' }
  ];
  
  const keyFiles: Array<{name: string, path: string, type: string}> = [];
  
  const findFiles = (items: RepoItem[], basePath = '') => {
    for (const item of items) {
      if (item.type === 'file') {
        const matchingPattern = keyFilePatterns.find(pattern => 
          item.name.toLowerCase() === pattern.name.toLowerCase());
        
        if (matchingPattern) {
          keyFiles.push({
            name: item.name,
            path: `${basePath}/${item.name}`,
            type: matchingPattern.type
          });
        }
      } else if (item.type === 'directory' && item.children) {
        findFiles(item.children, `${basePath}/${item.name}`);
      }
    }
  };
  
  findFiles(repoStructure);
  return keyFiles;
};

// Calculate code statistics
export const calculateCodeStats = (repoStructure: RepoItem[]) => {
  let totalFiles = 0;
  let totalDirectories = 0;
  let totalLines = 0;
  let totalSize = 0;
  const languageCounts: Record<string, {files: number, lines: number, size: number}> = {};
  
  const processItem = (item: RepoItem) => {
    if (item.type === 'file') {
      totalFiles++;
      totalSize += item.size || 0;
      
      // Count lines if content is available
      if (item.content) {
        const lines = item.content.split('\n').length;
        totalLines += lines;
        
        // Track by language
        if (item.name.includes('.')) {
          const extension = item.name.split('.').pop()?.toLowerCase();
          
          if (extension) {
            if (!languageCounts[extension]) {
              languageCounts[extension] = { files: 0, lines: 0, size: 0 };
            }
            
            languageCounts[extension].files += 1;
            languageCounts[extension].lines += lines;
            languageCounts[extension].size += item.size || 0;
          }
        }
      }
    } else if (item.type === 'directory') {
      totalDirectories++;
      
      if (item.children) {
        item.children.forEach(processItem);
      }
    }
  };
  
  repoStructure.forEach(processItem);
  
  return {
    totalFiles,
    totalDirectories,
    totalLines,
    totalSize,
    languageStats: Object.entries(languageCounts).map(([language, stats]) => ({
      language,
      files: stats.files,
      lines: stats.lines,
      size: stats.size,
      percentage: Math.round((stats.files / totalFiles) * 100)
    })).sort((a, b) => b.files - a.files)
  };
};

// Define simplified structure types
export type SimplifiedFileItem = {
  type: 'file';
  name: string;
  path: string;
  size: number;
};

export type SimplifiedDirectoryItem = {
  type: 'directory';
  name: string;
  path: string;
  children: SimplifiedRepoItem[];
};

export type SimplifiedRepoItem = SimplifiedFileItem | SimplifiedDirectoryItem;

// Simplify structure for API response
export const simplifyStructure = (repoStructure: RepoItem[]): SimplifiedRepoItem[] => {
  const simplify = (item: RepoItem): SimplifiedRepoItem => {
    if (item.type === 'file') {
      return {
        type: 'file',
        name: item.name,
        path: item.path,
        size: item.size
      };
    } else {
      return {
        type: 'directory',
        name: item.name,
        path: item.path,
        children: item.children.map(simplify)
      };
    }
  };
  
  return repoStructure.map(simplify);
};
