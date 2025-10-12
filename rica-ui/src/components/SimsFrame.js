import React, { useState, useEffect } from 'react';
import './SimsFrame.css';
import './IframeContainer.css';

const SimsFrame = ({ onError }) => {
  const [activeSection, setActiveSection] = useState('exercises');
  const [navOpen, setNavOpen] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showNewExerciseForm, setShowNewExerciseForm] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [newExerciseData, setNewExerciseData] = useState({
    name: '',
    description: '',
    type: 'tabletop',
    difficulty: 'medium',
    duration: '60'
  });
  
  useEffect(() => {
    // Simulated exercise data
    const loadExercises = () => {
      const sampleExercises = [
        {
          id: 'EX001',
          name: 'Network Breach Response',
          type: 'tabletop',
          status: 'ready',
          difficulty: 'medium',
          duration: '60',
          participants: 8,
          description: 'Practice incident response procedures for a simulated network breach scenario.',
          objectives: [
            'Identify breach indicators',
            'Execute incident response plan',
            'Maintain communication channels',
            'Document actions taken'
          ],
          lastRun: '2025-09-15',
          progress: 0
        },
        {
          id: 'EX002',
          name: 'Ransomware Recovery',
          type: 'technical',
          status: 'in_progress',
          difficulty: 'hard',
          duration: '120',
          participants: 12,
          description: 'Technical exercise focusing on ransomware recovery procedures and business continuity.',
          objectives: [
            'Isolate affected systems',
            'Assess damage scope',
            'Implement recovery procedures',
            'Test restored systems'
          ],
          lastRun: '2025-09-18',
          progress: 65
        },
        {
          id: 'EX003',
          name: 'Crisis Communication',
          type: 'tabletop',
          status: 'completed',
          difficulty: 'easy',
          duration: '45',
          participants: 6,
          description: 'Exercise focused on internal and external communication during a security incident.',
          objectives: [
            'Establish communication chain',
            'Draft stakeholder messages',
            'Coordinate with PR team',
            'Monitor public response'
          ],
          lastRun: '2025-09-17',
          progress: 100
        }
      ];
      
      setTimeout(() => {
        setExercises(sampleExercises);
      }, 1000);
    };

    loadExercises();
  }, []);

  const toggleNav = () => {
    setNavOpen(!navOpen);
    localStorage.setItem('simsNavOpen', String(!navOpen));
  };

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
  };

  const handleNewExercise = () => {
    setShowNewExerciseForm(true);
  };

  const handleCreateExercise = () => {
    if (!newExerciseData.name) return;

    const newExercise = {
      id: `EX${String(exercises.length + 1).padStart(3, '0')}`,
      status: 'ready',
      participants: 0,
      progress: 0,
      lastRun: null,
      objectives: [],
      ...newExerciseData
    };

    setExercises([newExercise, ...exercises]);
    setShowNewExerciseForm(false);
    setNewExerciseData({
      name: '',
      description: '',
      type: 'tabletop',
      difficulty: 'medium',
      duration: '60'
    });
  };

  const handleStartExercise = (exercise) => {
    const updatedExercises = exercises.map(ex => {
      if (ex.id === exercise.id) {
        return {
          ...ex,
          status: 'in_progress',
          progress: 0,
          lastRun: new Date().toISOString().split('T')[0]
        };
      }
      return ex;
    });
    setExercises(updatedExercises);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'status-ready';
      case 'in_progress': return 'status-running';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return '';
    }
  };

  // Direct iframe integration
  const renderDirectIframe = () => {
    return (
      <div className="iframe-container">
        <iframe
          src="http://localhost:2021"
          title=" Security Simulation Platform"
          className="external-iframe"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
          allow="clipboard-read; clipboard-write"
          onLoad={() => setIframeLoaded(true)}
          onError={() => onError && onError()}
        />
      </div>
    );
  };

  // Rich UI version (original implementation)
  const renderRichUI = () => {
    return (
    <div className="sims-container">
      {/* Left Navigation */}
      <div className={`sims-leftbar ${navOpen ? 'open' : 'closed'}`}>
        <div className="leftbar-header">
          <div className="toggle-button" onClick={toggleNav}>
            {navOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>
        
        <div className="leftbar-content">
          <div className="menu-list">
            <div 
              className={`menu-item ${activeSection === 'exercises' ? 'active' : ''}`}
              onClick={() => setActiveSection('exercises')}
            >
              <div className="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {navOpen && <div className="menu-text">Exercises</div>}
            </div>
            
            <div 
              className={`menu-item ${activeSection === 'scenarios' ? 'active' : ''}`}
              onClick={() => setActiveSection('scenarios')}
            >
              <div className="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {navOpen && <div className="menu-text">Scenarios</div>}
            </div>
            
            <div 
              className={`menu-item ${activeSection === 'results' ? 'active' : ''}`}
              onClick={() => setActiveSection('results')}
            >
              <div className="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {navOpen && <div className="menu-text">Results</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="sims-main">
        <div className="sims-header">
          <h1>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
          {activeSection === 'exercises' && (
            <button className="new-exercise-btn" onClick={handleNewExercise}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              New Exercise
            </button>
          )}
        </div>
        
        <div className="sims-content">
          {activeSection === 'exercises' && (
            <div className="exercises-content">
              {showNewExerciseForm ? (
                <div className="new-exercise-form">
                  <h2>Create New Exercise</h2>
                  <div className="form-group">
                    <label>Exercise Name</label>
                    <input
                      type="text"
                      value={newExerciseData.name}
                      onChange={(e) => setNewExerciseData({...newExerciseData, name: e.target.value})}
                      placeholder="Enter exercise name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newExerciseData.description}
                      onChange={(e) => setNewExerciseData({...newExerciseData, description: e.target.value})}
                      placeholder="Enter exercise description"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={newExerciseData.type}
                        onChange={(e) => setNewExerciseData({...newExerciseData, type: e.target.value})}
                      >
                        <option value="tabletop">Tabletop</option>
                        <option value="technical">Technical</option>
                        <option value="functional">Functional</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Difficulty</label>
                      <select
                        value={newExerciseData.difficulty}
                        onChange={(e) => setNewExerciseData({...newExerciseData, difficulty: e.target.value})}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Duration (minutes)</label>
                      <input
                        type="number"
                        value={newExerciseData.duration}
                        onChange={(e) => setNewExerciseData({...newExerciseData, duration: e.target.value})}
                        min="15"
                        step="15"
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="cancel-btn" onClick={() => setShowNewExerciseForm(false)}>Cancel</button>
                    <button 
                      className="create-btn" 
                      onClick={handleCreateExercise}
                      disabled={!newExerciseData.name}
                    >
                      Create Exercise
                    </button>
                  </div>
                </div>
              ) : selectedExercise ? (
                <div className="exercise-detail">
                  <button className="back-button" onClick={() => setSelectedExercise(null)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back to Exercises
                  </button>
                  
                  <div className="exercise-header">
                    <div className="exercise-title">
                      <h2>{selectedExercise.name}</h2>
                      <span className="exercise-id">{selectedExercise.id}</span>
                    </div>
                    <div className="exercise-actions">
                      {selectedExercise.status === 'ready' && (
                        <button 
                          className="start-btn"
                          onClick={() => handleStartExercise(selectedExercise)}
                        >
                          Start Exercise
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="exercise-meta">
                    <div className="meta-item">
                      <span className="meta-label">Type</span>
                      <span className="meta-value">{selectedExercise.type}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Difficulty</span>
                      <span className={`meta-value ${getDifficultyColor(selectedExercise.difficulty)}`}>
                        {selectedExercise.difficulty}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Duration</span>
                      <span className="meta-value">{selectedExercise.duration} min</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Status</span>
                      <span className={`meta-value ${getStatusColor(selectedExercise.status)}`}>
                        {selectedExercise.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="exercise-section">
                    <h3>Description</h3>
                    <p>{selectedExercise.description}</p>
                  </div>
                  
                  <div className="exercise-section">
                    <h3>Objectives</h3>
                    <ul className="objectives-list">
                      {selectedExercise.objectives.map((objective, index) => (
                        <li key={index} className="objective-item">
                          <div className="objective-check"></div>
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {selectedExercise.status === 'in_progress' && (
                    <div className="exercise-section">
                      <h3>Progress</h3>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${selectedExercise.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="exercises-grid">
                  {exercises.map(exercise => (
                    <div 
                      key={exercise.id}
                      className="exercise-card"
                      onClick={() => handleExerciseSelect(exercise)}
                    >
                      <div className="exercise-card-header">
                        <span className={`status-indicator ${getStatusColor(exercise.status)}`}></span>
                        <span className="exercise-type">{exercise.type}</span>
                        <span className={`difficulty-badge ${getDifficultyColor(exercise.difficulty)}`}>
                          {exercise.difficulty}
                        </span>
                      </div>
                      <h3>{exercise.name}</h3>
                      <p>{exercise.description}</p>
                      <div className="exercise-card-meta">
                        <div className="meta-row">
                          <span className="meta-label">Duration:</span>
                          <span className="meta-value">{exercise.duration} min</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-label">Participants:</span>
                          <span className="meta-value">{exercise.participants}</span>
                        </div>
                      </div>
                      {exercise.status === 'in_progress' && (
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${exercise.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeSection === 'scenarios' && (
            <div className="scenarios-content">
              <div className="scenarios-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Scenario Builder</h3>
                <p>Create and manage simulation scenarios</p>
                <button className="action-btn">Create Scenario</button>
              </div>
            </div>
          )}
          
          {activeSection === 'results' && (
            <div className="results-content">
              <div className="results-filters">
                <div className="filter-group">
                  <label>Time Range</label>
                  <select>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Custom range</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Exercise Type</label>
                  <select>
                    <option>All Types</option>
                    <option>Tabletop</option>
                    <option>Technical</option>
                    <option>Functional</option>
                  </select>
                </div>
              </div>
              
              <div className="results-grid">
                <div className="results-panel wide">
                  <h3>Exercise Completion Rates</h3>
                  <div className="chart-placeholder">
                    <div className="chart-bar" style={{ height: '60%' }}></div>
                    <div className="chart-bar" style={{ height: '80%' }}></div>
                    <div className="chart-bar" style={{ height: '45%' }}></div>
                    <div className="chart-bar" style={{ height: '90%' }}></div>
                    <div className="chart-bar" style={{ height: '70%' }}></div>
                  </div>
                </div>
                
                <div className="results-panel">
                  <h3>Performance by Type</h3>
                  <div className="chart-placeholder circle">
                    <div className="chart-segment"></div>
                  </div>
                </div>
                
                <div className="results-panel">
                  <h3>Recent Results</h3>
                  <div className="results-list">
                    {exercises
                      .filter(ex => ex.status === 'completed')
                      .map(exercise => (
                        <div key={exercise.id} className="result-item">
                          <div className="result-header">
                            <span className="result-name">{exercise.name}</span>
                            <span className="result-date">{exercise.lastRun}</span>
                          </div>
                          <div className="result-stats">
                            <div className="stat-item">
                              <span className="stat-label">Score</span>
                              <span className="stat-value">85%</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Time</span>
                              <span className="stat-value">{exercise.duration} min</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Team</span>
                              <span className="stat-value">{exercise.participants}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    );
  };

  // Use direct iframe integration
  return renderDirectIframe();
};

export default SimsFrame;