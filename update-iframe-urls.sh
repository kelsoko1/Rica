#!/bin/bash

echo "Rica UI Iframe URL Update Script"
echo "=============================="
echo
echo "This script will update the iframe URLs in the Rica UI components to match the standardized port mapping."
echo

FABRIC_FRAME="rica-ui/src/components/FabricFrame.js"
SIMS_FRAME="rica-ui/src/components/SimsFrame.js"
AUTO_FRAME="rica-ui/src/components/AutoFrame.js"

echo "Checking for component files..."

if [ ! -f "$FABRIC_FRAME" ]; then
    echo "ERROR: $FABRIC_FRAME not found."
    echo "Please make sure you're running this script from the Rica root directory."
    exit 1
fi

if [ ! -f "$SIMS_FRAME" ]; then
    echo "ERROR: $SIMS_FRAME not found."
    echo "Please make sure you're running this script from the Rica root directory."
    exit 1
fi

if [ ! -f "$AUTO_FRAME" ]; then
    echo "WARNING: $AUTO_FRAME not found. Will skip updating AutoFrame."
fi

echo
echo "Updating iframe URLs..."

echo "Updating $FABRIC_FRAME..."
sed -i 's|http://localhost:4000|http://localhost:2020|g' "$FABRIC_FRAME"
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to update $FABRIC_FRAME."
else
    echo "Successfully updated $FABRIC_FRAME."
fi

echo "Updating $SIMS_FRAME..."
sed -i 's|http://localhost:3000|http://localhost:2021|g' "$SIMS_FRAME"
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to update $SIMS_FRAME."
else
    echo "Successfully updated $SIMS_FRAME."
fi

if [ -f "$AUTO_FRAME" ]; then
    echo "Updating $AUTO_FRAME..."
    sed -i 's|http://localhost:[0-9]\+|http://localhost:2022|g' "$AUTO_FRAME"
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to update $AUTO_FRAME."
    else
        echo "Successfully updated $AUTO_FRAME."
    fi
fi

echo
echo "Update complete."
echo
echo "The iframe URLs have been updated to use the standardized port mapping:"
echo "- OpenCTI (Fabric): http://localhost:2020"
echo "- OpenBAS (Simulations): http://localhost:2021"
echo "- Activepieces (Auto): http://localhost:2022"
echo
echo "You should rebuild the Rica UI for the changes to take effect."
echo
