import React, { useEffect, useRef, useState } from 'react';
import { Network, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function ThreatGraphVis({ graphData }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graphData || !graphData.nodes || graphData.nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Arrange nodes in radial/spring positions
    const centerX = width / 2;
    const centerY = height / 2;
    const nodes = graphData.nodes.map((node, i) => {
      if (node.id === 'node_url') {
        return { ...node, x: centerX, y: centerY };
      }
      const angle = ((i - 1) / (graphData.nodes.length - 1)) * 2 * Math.PI;
      const radius = 130;
      return {
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    });

    // Render loop
    ctx.clearRect(0, 0, width, height);

    // Draw edges
    graphData.edges.forEach((edge) => {
      const src = nodes.find((n) => n.id === edge.source);
      const tgt = nodes.find((n) => n.id === edge.target);
      if (src && tgt) {
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw edge label
        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText(edge.label || '', midX - 15, midY - 4);
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      // Glow
      ctx.beginPath();
      ctx.arc(node.x, node.y, (node.size || 20) / 2 + 4, 0, 2 * Math.PI);
      ctx.fillStyle = (node.color || '#38bdf8') + '33';
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(node.x, node.y, (node.size || 20) / 2, 0, 2 * Math.PI);
      ctx.fillStyle = node.color || '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = '#f1f5f9';
      ctx.textAlign = 'center';
      ctx.fillText(node.label || node.id, node.x, node.y + (node.size || 20) / 2 + 14);
      
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`[${node.type}]`, node.x, node.y + (node.size || 20) / 2 + 24);
    });

  }, [graphData]);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return null;
  }

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wide">
            Infrastructure Threat Graph
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {graphData.nodes.length} Nodes • {graphData.edges.length} Relationships
        </span>
      </div>

      <div className="relative w-full overflow-hidden rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={640}
          height={340}
          className="w-full max-w-full h-auto cursor-crosshair"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Malicious Target</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Hostname</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Domain Zone</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> IP Address</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> SSL Certificate</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500"></span> Impersonated Brand</span>
      </div>
    </div>
  );
}
