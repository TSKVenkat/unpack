'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

type NodeData = {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: NodeData[];
};

type Props = {
  data: NodeData;
  width?: number;
  height?: number;
};

export default function CodeStructureVisualization({ data, width = 800, height = 600 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Create hierarchy
    const root = d3.hierarchy(data);

    // Create tree layout
    const treeLayout = d3.tree<NodeData>().size([height - 100, width - 200]);

    // Apply layout to hierarchy
    const treeData = treeLayout(root as d3.HierarchyNode<NodeData>);

    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(100, 50)`);

    // Add links between nodes
    svg.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<d3.HierarchyPointLink<NodeData>, d3.HierarchyPointNode<NodeData>>()
        .x((d: any) => d.y)
        .y((d: any) => d.x))
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1.5);

    // Add nodes
    const nodes = svg.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: d3.HierarchyPointNode<NodeData>) => `translate(${d.y}, ${d.x})`)
      .on('click', (event: any, d: d3.HierarchyPointNode<NodeData>) => {
        setSelectedNode(d.data);
      });

    // Add node circles
    nodes.append('circle')
      .attr('r', (d: d3.HierarchyPointNode<NodeData>) => d.data.type === 'directory' ? 8 : 5)
      .attr('fill', (d: d3.HierarchyPointNode<NodeData>) => d.data.type === 'directory' ? '#4299e1' : '#48bb78')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    // Add node labels
    nodes.append('text')
      .attr('dy', '.31em')
      .attr('x', (d: d3.HierarchyPointNode<NodeData>) => d.children ? -12 : 12)
      .attr('text-anchor', (d: d3.HierarchyPointNode<NodeData>) => d.children ? 'end' : 'start')
      .text((d: d3.HierarchyPointNode<NodeData>) => d.data.name)
      .style('font-size', '12px')
      .style('font-family', 'sans-serif');

  }, [data, width, height]);

  return (
    <div className="flex flex-col">
      <div className="border rounded-lg shadow-sm bg-white p-4 overflow-auto">
        <svg ref={svgRef}></svg>
      </div>
      {selectedNode && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold">{selectedNode.name}</h3>
          <p className="text-sm text-gray-600">Path: {selectedNode.path}</p>
          <p className="text-sm text-gray-600">Type: {selectedNode.type}</p>
          {selectedNode.size && (
            <p className="text-sm text-gray-600">Size: {formatBytes(selectedNode.size)}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to format bytes
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
