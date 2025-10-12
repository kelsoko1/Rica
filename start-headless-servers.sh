#!/bin/bash

echo "Rica Headless Servers Management Script"
echo "======================================"
echo

if [ -z "$1" ]; then
    COMMAND="help"
else
    COMMAND="$1"
fi

case "$COMMAND" in
    all)
        echo "Starting all headless servers..."
        docker-compose -f docker-compose.headless-servers.yml up -d
        echo
        echo "All headless servers started successfully."
        echo
        echo "Access the services at:"
        echo "-  (Fabric): http://localhost:2020"
        echo "-  (Simulations): http://localhost:2021"
        echo "- Activepieces (Auto): http://localhost:2022"
        echo "- Code Server: http://localhost:2023"
        echo "- Ollama: http://localhost:11434"
        ;;
    )
        echo "Starting  (Fabric)..."
        docker-compose -f docker-compose..yml up -d
        echo
        echo " started successfully. Access at http://localhost:2020"
        ;;
    )
        echo "Starting  (Simulations)..."
        docker-compose -f docker-compose..yml up -d
        echo
        echo " started successfully. Access at http://localhost:2021"
        ;;
    activepieces)
        echo "Starting Activepieces (Auto)..."
        docker-compose -f docker-compose.activepieces.yml up -d
        echo
        echo "Activepieces started successfully. Access at http://localhost:2022"
        ;;
    code-server)
        echo "Starting Code Server..."
        docker-compose -f docker-compose.code-server.yml up -d
        echo
        echo "Code Server started successfully. Access at http://localhost:2023"
        ;;
    ollama)
        echo "Starting Ollama..."
        docker-compose -f docker-compose.ollama.yml up -d
        echo
        echo "Ollama started successfully. Access at http://localhost:11434"
        ;;
    stop)
        echo "Stopping all headless servers..."
        docker-compose -f docker-compose.headless-servers.yml down
        echo
        echo "All headless servers stopped successfully."
        ;;
    status)
        echo "Checking status of headless servers..."
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E '||activepieces|code-server|ollama'
        ;;
    help|*)
        echo "Usage: ./start-headless-servers.sh [command]"
        echo
        echo "Commands:"
        echo "  all           Start all headless servers"
        echo "         Start  (Fabric)"
        echo "         Start  (Simulations)"
        echo "  activepieces  Start Activepieces (Auto)"
        echo "  code-server   Start Code Server"
        echo "  ollama        Start Ollama"
        echo "  stop          Stop all headless servers"
        echo "  status        Check status of headless servers"
        echo "  help          Show this help message"
        echo
        echo "Examples:"
        echo "  ./start-headless-servers.sh all"
        echo "  ./start-headless-servers.sh "
        echo "  ./start-headless-servers.sh stop"
        ;;
esac
