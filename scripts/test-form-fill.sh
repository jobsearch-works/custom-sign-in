#!/bin/bash

# Script to run the domain commands test with a URL parameter
# Usage: ./scripts/test-form-fill.sh <URL>
# Example: ./scripts/test-form-fill.sh https://boards.greenhouse.io/aurosglobal/jobs/4493809005

# Get the script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$DIR")"

# Check if URL parameter is provided
if [ -z "$1" ]; then
  echo "Error: URL parameter is required"
  echo "Usage: $0 <URL>"
  echo "Example: $0 https://example.com/form"
  exit 1
else
  export FORM_URL="$1"
  echo "Testing URL: $FORM_URL"
fi

echo "============================================================"
echo "  Form Schema Integration Test"
echo "============================================================"
echo "This test verifies that the domain schema stored in Firestore"
echo "can be successfully retrieved and used to fill a form."
echo ""
echo "It will:"
echo "  1. Extract the domain from the URL"
echo "  2. Fetch domain configuration from Firestore"
echo "  3. Attempt to execute commands from the schema"
echo ""
echo "Note: The test may not complete successfully if form fields are"
echo "not visible or the form structure has changed. This is normal"
echo "and can help identify needed updates to the schema."
echo "============================================================"
echo ""

# Run the test by name instead of line number
cd "$PROJECT_ROOT" && \
  npx playwright test -g "Execute domain form commands from Firestore" 