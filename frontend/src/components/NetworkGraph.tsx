import React, { useRef, useEffect, useState } from 'react';
import { GraphNode, GraphEdge } from '../types';

interface NetworkGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  highlightClusterId?: number | null;
  height?: number;
}

const CLUSTER_COLORS = [
  '#2563eb', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0891b2', // Cyan
  '#ea580c', // Orange
  '#4f46e5', // Indigo
];

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  edges,
  onNodeClick,
  selectedNodeId,
  highlightClusterId,
  height = 450,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  // Simple deterministic circular / force layout for reproducibility
  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    const width = 800;
    const canvasHeight = height;
    const cx = width / 2;
    const cy = canvasHeight / 2;
    const radius = Math.min(width, canvasHeight) * 0.38;

    const positions = new Map<string, { x: number; y: number }>();

    // Group nodes by cluster to place members close to each other
    const clustersMap = new Map<number, GraphNode[]>();
    nodes.forEach((node) => {
      const list = clustersMap.get(node.cluster_id) || [];
      list.push(node);
      clustersMap.set(node.cluster_id, list);
    });

    const clusterKeys = Array.from(clustersMap.keys());
    let angleOffset = 0;

    clusterKeys.forEach((cId) => {
      const cNodes = clustersMap.get(cId) || [];
      const clusterAngle = (2 * Math.PI) / clusterKeys.length;
      const cCenterX = cx + (radius * 0.7) * Math.cos(angleOffset);
      const cCenterY = cy + (radius * 0.7) * Math.sin(angleOffset);

      cNodes.forEach((node, idx) => {
        if (cNodes.length === 1) {
          positions.set(node.id, { x: cCenterX, y: cCenterY });
        } else {
          const subAngle = (2 * Math.PI * idx) / cNodes.length;
          const subR = Math.min(65, 25 + cNodes.length * 7);
          positions.set(node.id, {
            x: cCenterX + subR * Math.cos(subAngle),
            y: cCenterY + subR * Math.sin(subAngle),
          });
        }
      });
      angleOffset += clusterAngle;
    });

    setNodePositions(positions);
  }, [nodes, height]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Edges
    edges.forEach((edge) => {
      const p1 = nodePositions.get(edge.source);
      const p2 = nodePositions.get(edge.target);
      if (!p1 || !p2) return;

      const isConnectedToSelected =
        selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);
      const isConnectedToHovered =
        hoveredNode && (edge.source === hoveredNode.id || edge.target === hoveredNode.id);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (isConnectedToSelected || isConnectedToHovered) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = Math.max(2, edge.weight * 5);
        ctx.globalAlpha = 0.9;
      } else {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = Math.max(1, edge.weight * 3.5);
        ctx.globalAlpha = 0.35;
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });

    // 2. Draw Nodes
    nodes.forEach((node) => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const isDimmed = highlightClusterId !== null && highlightClusterId !== undefined && node.cluster_id !== highlightClusterId;

      const color = node.is_isolated
        ? '#64748b'
        : CLUSTER_COLORS[Math.abs(node.cluster_id) % CLUSTER_COLORS.length];

      const nodeRadius = isSelected || isHovered ? 14 : Math.min(18, 9 + node.degree * 2);

      ctx.save();
      if (isDimmed) {
        ctx.globalAlpha = 0.25;
      }

      // Outer glow for selected
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius + 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.strokeStyle = isSelected ? '#1e3a8a' : '#ffffff';
      ctx.stroke();

      // Node Label
      ctx.fillStyle = '#0f172a';
      ctx.font = isSelected || isHovered ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.id, pos.x, pos.y + nodeRadius + 13);

      ctx.restore();
    });
  }, [nodes, edges, nodePositions, selectedNodeId, hoveredNode, highlightClusterId]);

  // Handle Mouse Interactions
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let found: GraphNode | null = null;
    nodes.forEach((node) => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;
      const dist = Math.hypot(mouseX - pos.x, mouseY - pos.y);
      if (dist <= 18) {
        found = node;
      }
    });

    setHoveredNode(found);
  };

  const handleClick = () => {
    if (hoveredNode && onNodeClick) {
      onNodeClick(hoveredNode.id);
    }
  };

  return (
    <div className="relative border border-slate-200 rounded-lg bg-slate-50/50 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
        onClick={handleClick}
        className="w-full h-auto cursor-pointer block"
      />

      {/* Floating Tooltip */}
      {hoveredNode && (
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-2 rounded shadow-md pointer-events-none max-w-xs text-xs animate-in fade-in duration-150">
          <p className="font-bold text-slate-900">{hoveredNode.id}: {hoveredNode.title}</p>
          <p className="text-slate-600 mt-0.5">
            Cluster: <span className="font-semibold text-blue-600">{hoveredNode.is_isolated ? 'Isolated (-1)' : `Cluster ${hoveredNode.cluster_id}`}</span>
          </p>
          <p className="text-slate-500">Degree (Neighbors): {hoveredNode.degree}</p>
          <p className="text-[10px] text-blue-600 font-medium mt-1">Click to view document details →</p>
        </div>
      )}

      {/* Graph Legend Overlay */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs border border-slate-200 px-3 py-2 rounded text-[11px] text-slate-600 shadow-xs flex items-center space-x-4">
        <span className="flex items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-1.5" />
          Thematic Clusters
        </span>
        <span className="flex items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 mr-1.5" />
          Isolated Outliers
        </span>
        <span className="flex items-center">
          <span className="w-4 h-0.5 bg-slate-400 mr-1.5" />
          Edge (Similarity &ge; &tau;)
        </span>
      </div>
    </div>
  );
};
