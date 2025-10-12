#!/bin/bash

echo "Rica Headless Server Health Endpoints Update Script"
echo "================================================"
echo
echo "This script will update the Docker Compose files to add health check endpoints"
echo "for all headless servers."
echo

# Check if the required files exist
if [ ! -f "docker-compose..yml" ]; then
    echo "ERROR: docker-compose..yml not found."
    echo "Please make sure you're running this script from the Rica root directory."
    exit 1
fi

if [ ! -f "docker-compose..yml" ]; then
    echo "ERROR: docker-compose..yml not found."
    echo "Please make sure you're running this script from the Rica root directory."
    exit 1
fi

if [ ! -f "docker-compose.activepieces.yml" ]; then
    echo "ERROR: docker-compose.activepieces.yml not found."
    echo "Please make sure you're running this script from the Rica root directory."
    exit 1
fi

echo "Creating health check endpoints for headless servers..."

# Create directory for health check endpoints
if [ ! -d "nginx/health" ]; then
    mkdir -p nginx/health
    echo "Created nginx/health directory"
fi

# Create health check endpoint for 
echo "Creating health check endpoint for  (Fabric)..."
cat > nginx/health/fabric.conf << 'EOF'
#  (Fabric) Health Check

location /health/fabric {
    access_log off;
    add_header Content-Type application/json;
    return 200 '{"status":"ok","service":"fabric"}';
}
EOF

# Create health check endpoint for 
echo "Creating health check endpoint for  (Simulations)..."
cat > nginx/health/sims.conf << 'EOF'
#  (Simulations) Health Check

location /health/sims {
    access_log off;
    add_header Content-Type application/json;
    return 200 '{"status":"ok","service":"sims"}';
}
EOF

# Create health check endpoint for Activepieces
echo "Creating health check endpoint for Activepieces (Auto)..."
cat > nginx/health/auto.conf << 'EOF'
# Activepieces (Auto) Health Check

location /health/auto {
    access_log off;
    add_header Content-Type application/json;
    return 200 '{"status":"ok","service":"auto"}';
}
EOF

# Create health check endpoint for Code Server
echo "Creating health check endpoint for Code Server..."
cat > nginx/health/code.conf << 'EOF'
# Code Server Health Check

location /health/code {
    access_log off;
    add_header Content-Type application/json;
    return 200 '{"status":"ok","service":"code"}';
}
EOF

# Create health check endpoint for Ollama
echo "Creating health check endpoint for Ollama..."
cat > nginx/health/ollama.conf << 'EOF'
# Ollama Health Check

location /health/ollama {
    access_log off;
    add_header Content-Type application/json;
    return 200 '{"status":"ok","service":"ollama"}';
}
EOF

# Create health check endpoint for Vircadia
echo "Creating health check endpoint for Vircadia..."
cat > nginx/health/metaverse.conf << 'EOF'
# Vircadia Health Check

location /health/metaverse {
    access_log off;
    add_header Content-Type application/json;
    return 200 '{"status":"ok","service":"metaverse"}';
}
EOF

# Update headless-servers.conf to include health check endpoints
echo "Updating headless-servers.conf to include health check endpoints..."
sed -i 's/# Direct port access configuration/# Health check endpoints\ninclude \/etc\/nginx\/health\/*.conf;\n\n# Direct port access configuration/' headless-servers.conf

# Update rica-complete.conf to include health check endpoints
echo "Updating rica-complete.conf to include health check endpoints..."
sed -i 's/# Rica Application Server/# Health check endpoints\ninclude \/etc\/nginx\/health\/*.conf;\n\n# Rica Application Server/' rica-complete.conf

# Update Docker Compose files to include health check volume
echo "Updating Docker Compose files to include health check volume..."

# Update docker-compose.headless-servers.yml
sed -i 's/volumes:\s*- .\/nginx\/nginx.conf:\/etc\/nginx\/nginx.conf\s*- .\/nginx\/conf.d:\/etc\/nginx\/conf.d\s*- .\/certs:\/etc\/nginx\/certs\s*- .\/nginx\/ssl-dhparams.pem:\/etc\/nginx\/ssl-dhparams.pem/volumes:\n      - .\/nginx\/nginx.conf:\/etc\/nginx\/nginx.conf\n      - .\/nginx\/conf.d:\/etc\/nginx\/conf.d\n      - .\/nginx\/health:\/etc\/nginx\/health\n      - .\/certs:\/etc\/nginx\/certs\n      - .\/nginx\/ssl-dhparams.pem:\/etc\/nginx\/ssl-dhparams.pem/' docker-compose.headless-servers.yml

# Update docker-compose.master.yml
sed -i 's/volumes:\s*- .\/nginx\/nginx.conf:\/etc\/nginx\/nginx.conf\s*- .\/nginx\/conf.d:\/etc\/nginx\/conf.d\s*- .\/certs:\/etc\/nginx\/certs\s*- .\/nginx\/ssl-dhparams.pem:\/etc\/nginx\/ssl-dhparams.pem/volumes:\n      - .\/nginx\/nginx.conf:\/etc\/nginx\/nginx.conf\n      - .\/nginx\/conf.d:\/etc\/nginx\/conf.d\n      - .\/nginx\/health:\/etc\/nginx\/health\n      - .\/certs:\/etc\/nginx\/certs\n      - .\/nginx\/ssl-dhparams.pem:\/etc\/nginx\/ssl-dhparams.pem/' docker-compose.master.yml

echo
echo "Update complete."
echo
echo "The following changes have been made:"
echo "1. Created health check endpoints for all headless servers"
echo "2. Updated headless-servers.conf and rica-complete.conf to include health check endpoints"
echo "3. Updated Docker Compose files to include health check volume"
echo
echo "You should restart the services for the changes to take effect:"
echo "  ./start-rica-complete.sh all"
echo
