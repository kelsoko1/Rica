class TerminalService {
  constructor() {
    this.allowedCommands = [
      'ls', 'pwd', 'git status', 'git branch',
      'npm install', 'npm run', 'yarn', 'yarn add',
      'docker ps', 'docker-compose up', 'docker-compose down',
      'python', 'python3', 'node', 'npx'
    ];
  }

  async runCommand(command, cwd) {
    // Validate locally first
    if (!this.isAllowed(command)) {
      throw new Error(`Command not allowed: ${command}`);
    }
    
    try {
      const response = await fetch('/api/run-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, cwd })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run command');
      }
      
      const data = await response.json();
      return `$ ${command}\n${data.output}`;
    } catch (error) {
      throw new Error(`Command execution failed: ${error.message}`);
    }
  }

  isAllowed(command) {
    return this.allowedCommands.some(allowed => command.startsWith(allowed));
  }
}

export default new TerminalService();
