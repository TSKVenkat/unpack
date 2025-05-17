'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SVGSVGElement, SVGGElement } from 'react';
import { D3DragEvent } from 'd3';

// D3 Types
type ForceLink = {
  source: string | d3.SimulationNodeDatum;
  target: string | d3.SimulationNodeDatum;
  index: number;
};

// Simulation types
type Simulation = {
  alphaTarget: (value: number) => this;
  restart: () => this;
  nodes: (nodes: d3.SimulationNodeDatum[]) => this;
  force: <T>(name: string, force: d3.ForceLink<T> | null) => this;
  on: (name: string, listener: () => void) => this;
};

// Drag types
type DragBehavior = {
  on: <T>(name: string, listener: (event: D3DragEvent) => void) => this;
};

// Node and Link types
type NodeData = {
  id: string;
  name: string;
  type: string;
  description?: string;
  x?: number;
  y?: number;
};

type LinkData = {
  source: string;
  target: string;
  label?: string;
};

type ArchitectureData = {
  nodes: NodeData[];
  links: LinkData[];
};

type Props = {
  data: ArchitectureData;
  width?: number;
  height?: number;
};

function dragstarted(event: D3DragEvent) {
  if (!event.active) {
    (event.sourceEvent as any).simulation.alphaTarget(0.3).restart();
  }
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

function dragged(event: D3DragEvent) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

function dragended(event: D3DragEvent) {
  if (!event.active) {
    (event.sourceEvent as any).simulation.alphaTarget(0);
  }
  event.subject.fx = null;
  event.subject.fy = null;
}

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
    default:
      return '#a0aec0';
  }
}

export default function ArchitectureDiagram({ data, width = 800, height = 600 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

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
      .force('link', d3.forceLink<NodeData>().id((d) => d.id).distance(100))
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
      .text((d: LinkData) => d.label || '');

    // Create nodes
    const nodes = svg.selectAll('.node')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<NodeData>()
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
        .attr('x1', (d: LinkData) => (data.nodes.find(n => n.id === d.source)?.x || 0))
        .attr('y1', (d: LinkData) => (data.nodes.find(n => n.id === d.source)?.y || 0))
        .attr('x2', (d: LinkData) => (data.nodes.find(n => n.id === d.target)?.x || 0))
        .attr('y2', (d: LinkData) => (data.nodes.find(n => n.id === d.target)?.y || 0));

      links.selectAll('text')
        .attr('x', (d: LinkData) => ((data.nodes.find(n => n.id === d.source)?.x || 0) + (data.nodes.find(n => n.id === d.target)?.x || 0)) / 2)
        .attr('y', (d: LinkData) => ((data.nodes.find(n => n.id === d.source)?.y || 0) + (data.nodes.find(n => n.id === d.target)?.y || 0)) / 2);

      nodes.attr('transform', (d: NodeData) => `translate(${d.x}, ${d.y})`);
    });

    // Apply links to simulation
    simulation.force<d3.ForceLink<NodeData>>('link')!.links(data.links as any);
  }, [data, width, height]);

  return <svg ref={svgRef} />;

// D3 Types
type D3DragEvent = {
  sourceEvent: any;
  active: boolean;
  subject: {
    x: number;
    y: number;
    fx: number | null;
    fy: number | null;
  };
  x: number;
  y: number;
};

// Node and Link types
type NodeData = {
  id: string;
  name: string;
  type: string;
  description?: string;
  x?: number;
  y?: number;
};

type LinkData = {
  source: string;
  target: string;
  label?: string;
};

type ArchitectureData = {
  nodes: NodeData[];
  links: LinkData[];
};

type Props = {
  data: ArchitectureData;
  width?: number;
  height?: number;
};

function dragstarted(event: D3DragEvent) {
  if (!event.active) {
    (event.sourceEvent as any).simulation.alphaTarget(0.3).restart();
  }
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

function dragged(event: D3DragEvent) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

function dragended(event: D3DragEvent) {
  if (!event.active) {
    (event.sourceEvent as any).simulation.alphaTarget(0);
  }
  event.subject.fx = null;
  event.subject.fy = null;
}

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
    default:
      return '#a0aec0';
  }
}

export default function ArchitectureDiagram({ data, width = 800, height = 600 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

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
      .force('link', d3.forceLink<NodeData>().id((d) => d.id).distance(100))
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
      .text((d: LinkData) => d.label || '');

    // Create nodes
    const nodes = svg.selectAll('.node')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<NodeData>()
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
        .attr('x1', (d: LinkData) => (data.nodes.find(n => n.id === d.source)?.x || 0))
        .attr('y1', (d: LinkData) => (data.nodes.find(n => n.id === d.source)?.y || 0))
        .attr('x2', (d: LinkData) => (data.nodes.find(n => n.id === d.target)?.x || 0))
        .attr('y2', (d: LinkData) => (data.nodes.find(n => n.id === d.target)?.y || 0));

      links.selectAll('text')
        .attr('x', (d: LinkData) => ((data.nodes.find(n => n.id === d.source)?.x || 0) + (data.nodes.find(n => n.id === d.target)?.x || 0)) / 2)
        .attr('y', (d: LinkData) => ((data.nodes.find(n => n.id === d.source)?.y || 0) + (data.nodes.find(n => n.id === d.target)?.y || 0)) / 2);

      nodes.attr('transform', (d: NodeData) => `translate(${d.x}, ${d.y})`);
    });

    // Apply links to simulation
    simulation.force<d3.ForceLink<NodeData>>('link')!.links(data.links as any);
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

// Helper function to get node color based on type
function getNodeColor(type: string): string {
  const typeMap: Record<string, string> = {
    'frontend': '#4299e1', // blue
    'backend': '#48bb78',  // green
    'database': '#9f7aea', // purple
    'api': '#f56565',      // red
    'external': '#f56565', // red
    'cache': '#ecc94b',    // yellow
  };

  return typeMap[type.toLowerCase()] || '#718096'; // gray default
}
