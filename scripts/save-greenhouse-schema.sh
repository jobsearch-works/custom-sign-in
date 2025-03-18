#!/bin/bash

# Sample script to save the greenhouse schema to Firestore
# Usage: ./scripts/save-greenhouse-schema.sh [--dry-run]

# Get the script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$DIR")"

# Check if dry run is requested
DRY_RUN=""
if [ "$1" == "--dry-run" ]; then
  DRY_RUN="--dry-run"
  echo "Running in dry-run mode (no changes will be saved to Firestore)"
fi

# Run the save-schema command
cd "$PROJECT_ROOT" && \
  npm run save-schema -- -f ./schemas/greenhouse.json $DRY_RUN

# Check if the command was successful
if [ $? -eq 0 ]; then
  if [ -z "$DRY_RUN" ]; then
    echo "✅ Greenhouse schema successfully saved to Firestore"
  else
    echo "✅ Dry run completed successfully"
  fi
else
  echo "❌ Error saving schema to Firestore"
  exit 1
fi 