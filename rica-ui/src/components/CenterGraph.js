import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import './CenterGraph.css';

const env = typeof import.meta !== 'undefined' ? import.meta.env : {};
const API = env.VITE_API_URL || env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function CenterGraph() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch threat data from the API
    fetchThreatData();
  }, []);
  
  const fetchThreatData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch data from the  API
      // For now, we'll simulate a response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate random positions for nodes
      const generatePosition = () => {
        return {
          left: `${20 + Math.floor(Math.random() * 60)}%`,
          top: `${20 + Math.floor(Math.random() * 60)}%`
        };
      };
      
      // Fetch threat actors
      let threatActors = [];
      try {
        const response = await axios.get(`${API}/threat-actors`);
        threatActors = response.data.items.map(actor => ({
          id: actor.id,
          name: actor.name,
          type: 'threat-actor',
          description: actor.description || 'No description available',
          position: generatePosition()
        }));
      } catch (e) {
        console.warn('Failed to fetch threat actors, using mock data', e);
        // Fallback to mock data
        threatActors = [
          { id: 'apt29', name: 'APT29', type: 'threat-actor', description: 'Russian state-sponsored threat actor', position: generatePosition() },
          { id: 'apt28', name: 'APT28', type: 'threat-actor', description: 'Russian military intelligence', position: generatePosition() },
        ];
      }
      
      // Add other node types
      const allNodes = [
        ...threatActors,
        { id: 'malwarex', name: 'MalwareX', type: 'malware', description: 'Remote access trojan with data exfiltration capabilities', position: generatePosition() },
        { id: 'emotet', name: 'Emotet', type: 'malware', description: 'Banking trojan and malware delivery platform', position: generatePosition() },
        { id: 'phishing', name: 'Phishing Campaign', type: 'campaign', description: 'Targeted phishing campaign using compromised email accounts', position: generatePosition() },
        { id: 'cve2023', name: 'CVE-2023-38831', type: 'vulnerability', description: 'Remote code execution vulnerability in document parsing', position: generatePosition() },
        { id: 'target', name: 'Target Organization', type: 'identity', description: 'Organization targeted in recent cyber attacks', position: generatePosition() },
        { id: 'finance', name: 'Financial Sector', type: 'identity', description: 'Financial institutions targeted by threat actors', position: generatePosition() },
      ];
      
      // Create edges between nodes
      const generatedEdges = [
        { from: 'apt29', to: 'malwarex' },
        { from: 'apt29', to: 'phishing' },
        { from: 'apt28', to: 'emotet' },
        { from: 'malwarex', to: 'cve2023' },
        { from: 'emotet', to: 'finance' },
        { from: 'phishing', to: 'target' },
        { from: 'cve2023', to: 'target' },
      ];
      
      setNodes(allNodes);
      setEdges(generatedEdges);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching threat data:', err);
      setError('Failed to load threat data. Please try again later.');
      setLoading(false);
      
      // Fallback to mock data
      setNodes([
        { id: 'apt29', name: 'APT29', type: 'threat-actor', description: 'Advanced persistent threat group', position: { left: '20%', top: '30%' } },
        { id: 'malwarex', name: 'MalwareX', type: 'malware', description: 'Remote access trojan', position: { left: '50%', top: '40%' } },
        { id: 'phishing', name: 'Phishing Campaign', type: 'campaign', description: 'Targeted phishing campaign', position: { left: '70%', top: '60%' } },
        { id: 'cve2023', name: 'CVE-2023-38831', type: 'vulnerability', description: 'Remote code execution vulnerability', position: { left: '35%', top: '55%' } },
        { id: 'target', name: 'Target Organization', type: 'identity', description: 'Organization targeted in recent attacks', position: { left: '60%', top: '25%' } },
      ]);
      
      setEdges([
        { from: 'apt29', to: 'malwarex' },
        { from: 'apt29', to: 'phishing' },
        { from: 'malwarex', to: 'cve2023' },
        { from: 'phishing', to: 'target' },
        { from: 'cve2023', to: 'target' },
      ]);
    }
  };
  
  const handleNodeClick = (nodeId) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
  };
  
  const getNodeTypeIcon = (type) => {
    switch(type) {
      case 'threat-actor':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'malware':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'campaign':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 3H20C20.5304 3 21.0391 3.21071 21.4142 3.58579C21.7893 3.96086 22 4.46957 22 5V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 11L18 13L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 11L6 13L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 9L11 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'vulnerability':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'identity':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 7H7V9H9V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12H7V14H9V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 17H7V19H9V17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 17H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };
  
  const getNodeTypeClass = (type) => {
    switch(type) {
      case 'threat-actor': return 'node-threat';
      case 'malware': return 'node-malware';
      case 'campaign': return 'node-campaign';
      case 'vulnerability': return 'node-vulnerability';
      case 'identity': return 'node-identity';
      default: return '';
    }
  };
  
  // Refresh data function
  const refreshData = () => {
    setLoading(true);
    setSelectedNode(null);
    fetchThreatData();
  };
  
  return (
    <div className="center-graph">
      <div className="graph-toolbar">
        <div className="toolbar-group">
          <button className="toolbar-btn active">Graph View</button>
          <button className="toolbar-btn">Table View</button>
          <button className="toolbar-btn">Timeline</button>
        </div>
        <div className="toolbar-group">
          <button className="toolbar-btn icon-btn" title="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="toolbar-btn icon-btn" title="Zoom In">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="toolbar-btn icon-btn" title="Zoom Out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="toolbar-btn icon-btn" title="Refresh" onClick={refreshData}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.51 9C4.01717 7.56678 4.87913 6.2854 6.01547 5.27542C7.1518 4.26543 8.52547 3.55976 10.0139 3.22426C11.5023 2.88875 13.0522 2.93436 14.5161 3.35677C15.9801 3.77918 17.3169 4.56473 18.41 5.64L23 10M1 14L5.59 18.36C6.68314 19.4353 8.01993 20.2208 9.48388 20.6432C10.9478 21.0656 12.4977 21.1112 13.9861 20.7757C15.4745 20.4402 16.8482 19.7346 17.9845 18.7246C19.1209 17.7146 19.9828 16.4332 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading threat data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="graph-container">
          {/* Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className={`node ${getNodeTypeClass(node.type)} ${selectedNode === node.id ? 'selected' : ''}`}
              style={{
                left: node.position.left,
                top: node.position.top
              }}
              onClick={() => handleNodeClick(node.id)}
            >
              <div className="node-content">
                {getNodeTypeIcon(node.type)}
                <div className="node-name">{node.name}</div>
              </div>
            </div>
          ))}
          
          {selectedNode && (
            <div className="node-details-panel">
              <div className="node-content">
                {getNodeTypeIcon(nodes.find(n => n.id === selectedNode).type)}
                <div className="node-name">{nodes.find(n => n.id === selectedNode).name}</div>
              </div>
            </div>
          )}
          
          {/* Edges */}
          <svg className="graph-edges">
            {edges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              
              if (!fromNode || !toNode) return null;
              
              const fromX = parseFloat(fromNode.position.left);
              const fromY = parseFloat(fromNode.position.top);
              const toX = parseFloat(toNode.position.left);
              const toY = parseFloat(toNode.position.top);
              
              return (
                <line 
                  key={`edge-${index}`}
                  x1={`${fromX}%`} 
                  y1={`${fromY}%`} 
                  x2={`${toX}%`} 
                  y2={`${toY}%`}
                  className={`edge ${selectedNode === edge.from || selectedNode === edge.to ? 'edge-highlighted' : ''}`}
                />
              );
            })}
          </svg>
          
          {/*  Sidebar */}
          <Sidebar
            isOpen={selectedNode !== null}
            onClose={() => setSelectedNode(null)}
            selectedNode={nodes.find(n => n.id === selectedNode)}
          />
        </div>
      )}
    </div>
  );
}
