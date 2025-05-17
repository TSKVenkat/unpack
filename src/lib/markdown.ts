import { Analysis } from '@/types/declarations';

export function generateMarkdown(analysis: Analysis): string {
  const features = JSON.parse(typeof analysis.features === 'string' ? analysis.features : JSON.stringify(analysis.features));
  const stats = JSON.parse(typeof analysis.codeStats === 'string' ? analysis.codeStats : JSON.stringify(analysis.codeStats));
  const architecture = JSON.parse(typeof analysis.architecture === 'string' ? analysis.architecture : JSON.stringify(analysis.architecture));

  return `# Code Analysis Report

## Repository Information
- **Name:** ${analysis.repoName}
- **Analysis Date:** ${new Date(analysis.createdAt).toLocaleDateString()}

## Summary
${analysis.summary}

## Detected Features
${features.map((feature: any) => `- **${feature.name}**: ${feature.description}`).join('\n')}

## Architecture
${Object.entries(architecture).map(([key, value]) => 
  `- **${key}**: ${JSON.stringify(value, null, 2)}`).join('\n')}

## Code Statistics
${Object.entries(stats).map(([key, value]) => 
  `- **${key}**: ${value}`).join('\n')}

## Analysis Items
${analysis.analysisItems.map(item => `
### ${item.path}
- **Type:** ${item.type}
- **Summary:** ${item.summary || 'No summary available'}
- **Features:** ${item.features ? JSON.stringify(item.features, null, 2) : 'None'}
- **Complexity Score:** ${item.complexity || 'N/A'}`).join('\n')}
`;
}
