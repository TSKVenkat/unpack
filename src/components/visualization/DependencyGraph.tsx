'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DependencyNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  size?: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface DependencyLink {
  source: string | DependencyNode;
  target: string | DependencyNode;
  strength: number;
}

type DependencyData = {
  nodes: DependencyNode[];
  links: DependencyLink[];
};

type Props = {
  data: DependencyData;
  width?: number;
  height?: number;
};

export default function DependencyGraph({ data, width = 800, height = 600 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || !data.nodes || !data.links) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Add zoom functionality
    const zoomG = svg.append('g');
    
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
          zoomG.attr('transform', `translate(${event.transform.x},${event.transform.y}) scale(${event.transform.k})`);
        }) as any
    );

    // Create a force simulation
    const simulation = d3.forceSimulation<DependencyNode>()
      .force('link', d3.forceLink<DependencyNode, DependencyLink>().id((d: DependencyNode) => d.id).distance(100))
      .force('charge', d3.forceManyBody<DependencyNode>().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<DependencyNode>().radius((d: DependencyNode) => getNodeRadius(d) + 5));

    // Create links
    const links = zoomG.selectAll('.link')
      .data(data.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: DependencyLink) => Math.sqrt(d.strength) * 2);

    // Create nodes
    const nodes = zoomG.selectAll('.node')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<SVGGElement, DependencyNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Add node circles
    nodes.append('circle')
      .attr('r', (d: DependencyNode) => getNodeRadius(d))
      .attr('fill', (d: DependencyNode) => getNodeColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    // Add node labels
    nodes.append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .text((d: DependencyNode) => d.name)
      .style('font-size', '10px')
      .style('fill', (d: DependencyNode) => isLightColor(d.type) ? '#000' : '#fff')
      .style('pointer-events', 'none');

    // Add tooltips
    nodes.append('title')
      .text((d: DependencyNode) => `${d.name} (${d.type})`);

    // Update positions on simulation tick
    simulation.nodes(data.nodes).on('tick', () => {
      links
        .attr('x1', (d: any) => {
          const source = typeof d.source === 'string' 
            ? data.nodes.find(n => n.id === d.source) 
            : d.source as DependencyNode;
          return source?.x || 0;
        })
        .attr('y1', (d: any) => {
          const source = typeof d.source === 'string' 
            ? data.nodes.find(n => n.id === d.source) 
            : d.source as DependencyNode;
          return source?.y || 0;
        })
        .attr('x2', (d: any) => {
          const target = typeof d.target === 'string' 
            ? data.nodes.find(n => n.id === d.target) 
            : d.target as DependencyNode;
          return target?.x || 0;
        })
        .attr('y2', (d: any) => {
          const target = typeof d.target === 'string' 
            ? data.nodes.find(n => n.id === d.target) 
            : d.target as DependencyNode;
          return target?.y || 0;
        });

      nodes.attr('transform', (d: DependencyNode) => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // Apply links to simulation
    simulation.force<d3.ForceLink<DependencyNode, DependencyLink>>('link')!.links(data.links as any);

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, DependencyNode, DependencyNode>, d: DependencyNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, DependencyNode, DependencyNode>, d: DependencyNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, DependencyNode, DependencyNode>, d: DependencyNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Helper function to determine node radius
    function getNodeRadius(d: DependencyNode): number {
      if (d.size) {
        // Scale size logarithmically between 5 and 20
        return Math.max(5, Math.min(20, 5 + Math.log(d.size) / Math.log(10) * 3));
      }
      return 10; // Default size
    }

  }, [data, width, height]);

  return (
    <div className="border rounded-lg shadow-sm bg-white p-4 overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Dependency Graph</h3>
        <p className="text-sm text-gray-600">
          Visualizes dependencies between components. Node size represents complexity or importance.
        </p>
      </div>
      <svg ref={svgRef} width={width} height={height}></svg>
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-sm">Component</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm">Utility</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
          <span className="text-sm">Library</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
          <span className="text-sm">Service</span>
        </div>
      </div>
    </div>
  );
}

// Helper function to get node color based on type
function getNodeColor(type: string): string {
  const typeMap: Record<string, string> = {
    'component': '#4299e1', // blue
    'utility': '#48bb78',   // green
    'library': '#ecc94b',   // yellow
    'service': '#9f7aea',   // purple
    'hook': '#ed64a6',      // pink
    'context': '#f56565',   // red
    'store': '#ed8936',     // orange
  };

  return typeMap[type.toLowerCase()] || '#a0aec0'; // gray default
}

// Helper function to determine if a color is light
function isLightColor(type: string): boolean {
  const lightColors = ['library']; // Add any light color types here
  return lightColors.includes(type.toLowerCase());
}
