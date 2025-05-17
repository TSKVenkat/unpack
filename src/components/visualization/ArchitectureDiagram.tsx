'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Define types for our data
interface NodeData extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  description?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface LinkData {
  source: string | NodeData;
  target: string | NodeData;
  label?: string;
}

interface ArchitectureData {
  nodes: NodeData[];
  links: LinkData[];
}

interface Props {
  data: ArchitectureData;
  width?: number;
  height?: number;
}

// Helper function to get node color based on type
function getNodeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'api':
      return '#4299e1';
    case 'database':
      return '#48bb78';
    case 'cache':
      return '#ed8936';
    case 'service':
      return '#9f7aea';
    case 'frontend':
      return '#4299e1'; // blue
    case 'backend':
      return '#48bb78';  // green
    case 'external':
      return '#f56565'; // red
    default:
      return '#a0aec0';
  }
}

export default function ArchitectureDiagram({ data, width = 800, height = 600 }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || !data.nodes || !data.links) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Create a force simulation
    const simulation = d3.forceSimulation<NodeData>()
      .force('link', d3.forceLink<NodeData, LinkData>().id((d: NodeData) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius(50));

    // Create links
    const links = svg.selectAll('.link')
      .data(data.links)
      .enter()
      .append('g')
      .attr('class', 'link');

    const linkLines = links.append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6);

    // Add link labels
    links.append('text')
      .attr('dy', -5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#666')
      .style('font-size', '10px')
      .text((d: any) => (d as LinkData).label || '');

    // Define drag behavior functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, NodeData, NodeData>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      const d = event.subject;
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: d3.D3DragEvent<SVGGElement, NodeData, NodeData>) {
      const d = event.subject;
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: d3.D3DragEvent<SVGGElement, NodeData, NodeData>) {
      if (!event.active) simulation.alphaTarget(0);
      const d = event.subject;
      d.fx = null;
      d.fy = null;
    }

    // Create nodes
    const nodes = svg.selectAll('.node')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<SVGGElement, NodeData>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add node circles
    nodes.append('circle')
      .attr('r', 25)
      .attr('fill', (d: NodeData) => getNodeColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    // Add node labels
    nodes.append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .text((d: NodeData) => d.name)
      .style('font-size', '10px')
      .style('fill', '#fff')
      .style('font-weight', 'bold');

    // Add tooltips
    nodes.append('title')
      .text((d: NodeData) => d.description || d.name);

    // Update positions on simulation tick
    simulation.nodes(data.nodes).on('tick', () => {
      linkLines
        .attr('x1', (d: any) => {
          const link = d as LinkData;
          const source = typeof link.source === 'string' 
            ? data.nodes.find(n => n.id === link.source) 
            : link.source as NodeData;
          return source?.x || 0;
        })
        .attr('y1', (d: any) => {
          const link = d as LinkData;
          const source = typeof link.source === 'string' 
            ? data.nodes.find(n => n.id === link.source) 
            : link.source as NodeData;
          return source?.y || 0;
        })
        .attr('x2', (d: any) => {
          const link = d as LinkData;
          const target = typeof link.target === 'string' 
            ? data.nodes.find(n => n.id === link.target) 
            : link.target as NodeData;
          return target?.x || 0;
        })
        .attr('y2', (d: any) => {
          const link = d as LinkData;
          const target = typeof link.target === 'string' 
            ? data.nodes.find(n => n.id === link.target) 
            : link.target as NodeData;
          return target?.y || 0;
        });

      links.selectAll('text')
        .attr('x', (d: any) => {
          const link = d as LinkData;
          const sourceX = typeof link.source === 'string' 
            ? data.nodes.find(n => n.id === link.source)?.x || 0 
            : (link.source as NodeData).x || 0;
          const targetX = typeof link.target === 'string' 
            ? data.nodes.find(n => n.id === link.target)?.x || 0 
            : (link.target as NodeData).x || 0;
          return (sourceX + targetX) / 2;
        })
        .attr('y', (d: any) => {
          const link = d as LinkData;
          const sourceY = typeof link.source === 'string' 
            ? data.nodes.find(n => n.id === link.source)?.y || 0 
            : (link.source as NodeData).y || 0;
          const targetY = typeof link.target === 'string' 
            ? data.nodes.find(n => n.id === link.target)?.y || 0 
            : (link.target as NodeData).y || 0;
          return (sourceY + targetY) / 2;
        });

      nodes.attr('transform', (d: NodeData) => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // Apply links to simulation
    simulation.force<d3.ForceLink<NodeData, LinkData>>('link')!.links(data.links as any);
  }, [data, width, height]);

  return (
    <div className="border rounded-lg shadow-sm bg-white p-4 overflow-auto">
      <svg ref={svgRef} width={width} height={height}></svg>
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-sm">Frontend</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm">Backend</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
          <span className="text-sm">Database</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
          <span className="text-sm">External API</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
          <span className="text-sm">Other</span>
        </div>
      </div>
    </div>
  );
}
