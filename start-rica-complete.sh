#!/bin/bash

echo "Rica Complete Management Script"
echo "=============================="
echo

if [ -z "$1" ]; then
    COMMAND="help"
else
    COMMAND="$1"
fi

case "$COMMAND" in
    all)
        echo "Starting all Rica components..."
        docker-compose -f docker-compose.master.yml up -d
        echo
        echo "All Rica components started successfully."
        echo
        echo "Access the services at:"
        echo "- Rica UI: http://localhost:3000"
        echo "- Rica API: http://localhost:3001"
        echo "- OpenCTI (Fabric): http://localhost:2020"
        echo "- OpenBAS (Simulations): http://localhost:2021"
        echo "- Activepieces (Auto): http://localhost:2022"
        echo "- Code Server: http://localhost:2023"
        echo "- Ollama: http://localhost:2024"
        ;;
    ui)
        echo "Starting Rica UI components..."
        docker-compose -f docker-compose.rica-ui.yml up -d
        echo
        echo "Rica UI components started successfully."
        echo
        echo "Access the services at:"
        echo "- Rica UI: http://localhost:3000"
        echo "- Rica API: http://localhost:3001"
        ;;
    headless)
        echo "Starting all headless servers..."
        docker-compose -f docker-compose.headless-servers.yml up -d
        echo
        echo "All headless servers started successfully."
        echo
        echo "Access the services at:"
        echo "- OpenCTI (Fabric): http://localhost:2020"
        echo "- OpenBAS (Simulations): http://localhost:2021"
        echo "- Activepieces (Auto): http://localhost:2022"
        echo "- Code Server: http://localhost:2023"
        echo "- Ollama: http://localhost:2024"
        ;;
    opencti)
        echo "Starting OpenCTI (Fabric)..."
        docker-compose -f docker-compose.opencti.yml up -d
        echo
        echo "OpenCTI started successfully. Access at http://localhost:2020"
        ;;
    openbas)
        echo "Starting OpenBAS (Simulations)..."
        docker-compose -f docker-compose.openbas.yml up -d
        echo
        echo "OpenBAS started successfully. Access at http://localhost:2021"
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
        echo "Ollama started successfully. Access at http://localhost:2024"
        ;;
    stop)
        echo "Stopping all Rica components..."
        docker-compose -f docker-compose.master.yml down
        echo
        echo "All Rica components stopped successfully."
        ;;
    status)
        echo "Checking status of Rica components..."
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E 'rica|opencti|openbas|activepieces|code-server|ollama'
        ;;
    help|*)
        echo "Usage: ./start-rica-complete.sh [command]"
        echo
        echo "Commands:"
        echo "  all           Start all Rica components"
        echo "  ui            Start Rica UI components only"
        echo "  headless      Start all headless servers"
        echo "  opencti       Start OpenCTI (Fabric)"
        echo "  openbas       Start OpenBAS (Simulations)"
        echo "  activepieces  Start Activepieces (Auto)"
        echo "  code-server   Start Code Server"
        echo "  ollama        Start Ollama"
        echo "  stop          Stop all Rica components"
        echo "  status        Check status of Rica components"
        echo "  help          Show this help message"
        echo
        echo "Examples:"
        echo "  ./start-rica-complete.sh all"
        echo "  ./start-rica-complete.sh ui"
        echo "  ./start-rica-complete.sh headless"
        echo "  ./start-rica-complete.sh stop"
        ;;
esac
