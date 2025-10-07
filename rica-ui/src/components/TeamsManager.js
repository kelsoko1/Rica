import React, { useState, useEffect } from 'react';
import './TeamsManager.css';

const TeamsManager = ({ onTeamSelect, className }) => {
  const [teams, setTeams] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [showNewTeam, setShowNewTeam] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    members: []
  });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');

  // Load saved teams and profiles on component mount
  useEffect(() => {
    const savedTeams = localStorage.getItem('browserTeams');
    const savedProfiles = localStorage.getItem('browserProfiles');
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    }
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    }
  }, []);

  // Save teams whenever they change
  useEffect(() => {
    localStorage.setItem('browserTeams', JSON.stringify(teams));
  }, [teams]);

  const handleCreateTeam = () => {
    const team = {
      ...newTeam,
      id: Date.now(),
      created: new Date().toISOString(),
      owner: 'current-user', // Replace with actual user ID
      sharedProfiles: [],
      lastActive: new Date().toISOString()
    };

    setTeams([...teams, team]);
    setShowNewTeam(false);
    setNewTeam({
      name: '',
      description: '',
      members: []
    });
  };

  const handleInviteMember = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (team && inviteEmail) {
      const updatedTeam = {
        ...team,
        members: [...team.members, {
          email: inviteEmail,
          status: 'pending',
          joinedAt: new Date().toISOString()
        }]
      };

      setTeams(teams.map(t => t.id === teamId ? updatedTeam : t));
      setInviteEmail('');
      setShowInviteModal(false);
    }
  };

  const handleShareProfile = (teamId, profileId) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      const updatedTeam = {
        ...team,
        sharedProfiles: [...team.sharedProfiles, profileId]
      };
      setTeams(teams.map(t => t.id === teamId ? updatedTeam : t));
    }
  };

  const handleDeleteTeam = (teamId) => {
    setTeams(teams.filter(t => t.id !== teamId));
  };

  const handleUnshareProfile = (teamId, profileId) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      const updatedTeam = {
        ...team,
        sharedProfiles: team.sharedProfiles.filter(id => id !== profileId)
      };
      setTeams(teams.map(t => t.id === teamId ? updatedTeam : t));
    }
  };

  return (
    <div className={`teams-manager ${className || ''}`}>
      <div className="teams-header">
        <h2>Teams</h2>
        <div className="header-actions">
          <button onClick={() => setShowNewTeam(true)} className="create-team-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Create Team
          </button>
        </div>
      </div>

      {teams.length === 0 && !showNewTeam && (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 7.16C17.94 7.15 17.87 7.15 17.81 7.16C16.43 7.11 15.33 5.98 15.33 4.58C15.33 3.15 16.48 2 17.91 2C19.34 2 20.49 3.16 20.49 4.58C20.48 5.98 19.38 7.11 18 7.16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.97 14.44C18.34 14.67 19.85 14.43 20.91 13.72C22.32 12.78 22.32 11.24 20.91 10.3C19.84 9.59001 18.31 9.35 16.94 9.59" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.96998 7.16C6.02998 7.15 6.09998 7.15 6.15998 7.16C7.53998 7.11 8.63998 5.98 8.63998 4.58C8.63998 3.15 7.48998 2 6.05998 2C4.62998 2 3.47998 3.16 3.47998 4.58C3.48998 5.98 4.58998 7.11 5.96998 7.16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 14.44C5.63 14.67 4.12 14.43 3.06 13.72C1.65 12.78 1.65 11.24 3.06 10.3C4.13 9.59001 5.66 9.35 7.03 9.59" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 14.63C11.94 14.62 11.87 14.62 11.81 14.63C10.43 14.58 9.32996 13.45 9.32996 12.05C9.32996 10.62 10.48 9.47 11.91 9.47C13.34 9.47 14.49 10.63 14.49 12.05C14.48 13.45 13.38 14.59 12 14.63Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.08997 17.78C7.67997 18.72 7.67997 20.26 9.08997 21.2C10.69 22.27 13.31 22.27 14.91 21.2C16.32 20.26 16.32 18.72 14.91 17.78C13.32 16.72 10.69 16.72 9.08997 17.78Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>No Teams Yet</h3>
          <p>Create a team to start collaborating and sharing browser profiles with your teammates.</p>
          <button onClick={() => setShowNewTeam(true)} className="create-team-btn">
            Create Your First Team
          </button>
        </div>
      )}

      {showNewTeam && (
        <div className="modal-overlay">
          <div className="new-team-form">
            <h3>Create New Team</h3>
            <div className="form-group">
              <label>Team Name</label>
              <input
                type="text"
                placeholder="Enter team name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Enter team description"
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button 
                className="secondary-btn"
                onClick={() => setShowNewTeam(false)}
              >
                Cancel
              </button>
              <button 
                className="primary-btn"
                onClick={handleCreateTeam}
                disabled={!newTeam.name}
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="teams-list">
        {teams.map(team => (
          <div key={team.id} className="team-card">
            <div className="team-info">
              <h3>{team.name}</h3>
              <p>{team.description}</p>
              <div className="team-stats">
                <span>{team.members.length} members</span>
                <span>{team.sharedProfiles.length} shared profiles</span>
              </div>
            </div>
            <div className="team-actions">
              <button 
                className="share-btn"
                onClick={() => {
                  setSelectedTeam(team);
                  setShowShareModal(true);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 22.027v-2.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7.02a5.44 5.44 0 0 0-1.5-3.75 5.07 5.07 0 0 0-.09-3.77s-1.18-.35-3.91 1.48a13.38 13.38 0 0 0-7 0c-2.73-1.83-3.91-1.48-3.91-1.48A5.07 5.07 0 0 0 5 5.797a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7.02a3.37 3.37 0 0 0-.94 2.58v2.87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Share Profile
              </button>
              <button 
                className="invite-btn"
                onClick={() => {
                  setSelectedTeam(team);
                  setShowInviteModal(true);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Invite Member
              </button>
              <button 
                className="delete-btn"
                onClick={() => handleDeleteTeam(team.id)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Delete Team
              </button>
            </div>
            {team.sharedProfiles.length > 0 && (
              <div className="shared-profiles">
                <h4>Shared Profiles</h4>
                <div className="profile-tags">
                  {team.sharedProfiles.map(profileId => {
                    const profile = profiles.find(p => p.id === profileId);
                    return profile ? (
                      <div key={profile.id} className="profile-tag">
                        <span>{profile.name}</span>
                        <button 
                          className="unshare-btn"
                          onClick={() => handleUnshareProfile(team.id, profile.id)}
                        >
                          Unshare
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            {team.members.length > 0 && (
              <div className="team-members">
                <h4>Team Members</h4>
                <div className="member-list">
                  {team.members.map((member, index) => (
                    <div key={index} className={`member-tag ${member.status}`}>
                      <span>{member.email}</span>
                      <span className="status">{member.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showInviteModal && selectedTeam && (
        <div className="modal-overlay">
          <div className="invite-modal">
            <h3>Invite Member to {selectedTeam.name}</h3>
            <input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <div className="modal-actions">
              <button 
                className="primary-btn"
                onClick={() => handleInviteMember(selectedTeam.id)}
              >
                Send Invite
              </button>
              <button 
                className="secondary-btn"
                onClick={() => {
                  setShowInviteModal(false);
                  setSelectedTeam(null);
                  setInviteEmail('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && selectedTeam && (
        <div className="modal-overlay">
          <div className="share-modal">
            <h3>Share Profile with {selectedTeam.name}</h3>
            <div className="profiles-list">
              {profiles.map(profile => (
                <div key={profile.id} className="profile-item">
                  <div className="profile-info">
                    <span className="profile-name">{profile.name}</span>
                    <span className="profile-type">{profile.browserType}</span>
                  </div>
                  <button
                    className={`share-btn ${selectedTeam.sharedProfiles.includes(profile.id) ? 'shared' : ''}`}
                    onClick={() => handleShareProfile(selectedTeam.id, profile.id)}
                    disabled={selectedTeam.sharedProfiles.includes(profile.id)}
                  >
                    {selectedTeam.sharedProfiles.includes(profile.id) ? 'Shared' : 'Share'}
                  </button>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button 
                className="secondary-btn"
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedTeam(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsManager;
