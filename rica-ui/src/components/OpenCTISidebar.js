import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, selectedNode }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  return (
    <div className="-sidebar">
      <div className="-sidebar-header">
        <h2>{selectedNode?.name || 'Node Details'}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="-sidebar-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('knowledge')}
        >
          Knowledge
        </button>
        <button 
          className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          Analysis
        </button>
        <button 
          className={`tab ${activeTab === 'relationships' ? 'active' : ''}`}
          onClick={() => setActiveTab('relationships')}
        >
          Relationships
        </button>
      </div>

      <div className="-sidebar-content">
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="entity-details">
              <div className="detail-item">
                <label>Type</label>
                <span>{selectedNode?.type || 'Unknown'}</span>
              </div>
              <div className="detail-item">
                <label>Created</label>
                <span>{selectedNode?.created || 'Unknown'}</span>
              </div>
              <div className="detail-item">
                <label>Modified</label>
                <span>{selectedNode?.modified || 'Unknown'}</span>
              </div>
              <div className="detail-item description">
                <label>Description</label>
                <p>{selectedNode?.description || 'No description available'}</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'knowledge' && (
          <div className="tab-content">
            <div className="knowledge-graph">
              {/* Knowledge graph visualization will go here */}
              <p>Knowledge graph visualization coming soon...</p>
            </div>
          </div>
        )}
        {activeTab === 'analysis' && (
          <div className="tab-content">
            <div className="analysis-section">
              <h3>Threat Analysis</h3>
              {/* Analysis content will go here */}
              <p>Threat analysis content coming soon...</p>
            </div>
          </div>
        )}
        {activeTab === 'relationships' && (
          <div className="tab-content">
            <div className="relationships-list">
              {/* Relationships content will go here */}
              <p>Relationships content coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
