#!/bin/bash

# Create directories if they don't exist
mkdir -p nginx/conf.d certs

# Generate SSL certificates (self-signed for development)
echo "Generating SSL certificates..."
mkdir -p certs

# Generate root CA key and certificate
openssl genrsa -out certs/rootCA.key 4096
openssl req -x509 -new -nodes -key certs/rootCA.key -sha256 -days 1024 -out certs/rootCA.crt \
  -subj "/C=US/ST=State/L=City/O=Rica/CN=Rica Root CA"

# Generate server key and CSR
openssl genrsa -out certs/rica.key 2048
openssl req -new -key certs/rica.key -out certs/rica.csr \
  -subj "/C=US/ST=State/L=City/O=Rica/CN=*.rica.local"

# Create a config file for the extensions
cat > certs/rica.ext << EOL
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = rica.local
DNS.2 = app.rica.local
DNS.3 = www.rica.local
EOL

# Sign the certificate
openssl x509 -req -in certs/rica.csr -CA certs/rootCA.crt -CAkey certs/rootCA.key -CAcreateserial \
  -out certs/rica.crt -days 365 -sha256 -extfile certs/rica.ext

# Generate strong Diffie-Hellman parameters
echo "Generating Diffie-Hellman parameters (this may take a while)..."
openssl dhparam -out nginx/ssl-dhparams.pem 2048

echo "SSL certificates generated in the 'certs' directory."
echo "Add the following to your hosts file:"
echo "127.0.0.1   rica.local app.rica.local www.rica.local"
echo ""
echo "To trust the self-signed certificate, import certs/rootCA.crt into your trusted root certificates."
