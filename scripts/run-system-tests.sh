#!/usr/bin/env bash
set -eo pipefail

#===================================================================================
# Usage:
#   run-system-tests.sh <test_to_run>
#
# Description:
#   Executes common flow for lanuching system tests build
#
# Globals:
#   MANAGER_USER - (optional) Cloudify Manager SSH username (default: centos)
#   MANAGER_IP   - (required) Cloudify Manager IP address
#   SSH_KEY_PATH - (required) Cloudify Manager SSH key path
#
# Arguments:
#   $1 (test_to_run) - optional test specifier to be passed to cypress runner if
#                      only selected test has to be run
#
# Returns:
#   None
#===================================================================================

echo Starting update of package on Manager...
echo Creating package...
npm run build:coverage
npm run zip

echo Uploading package...
npm run upload

echo Starting system tests...
npm run e2e -- -s "${1:-**/*}"

echo Starting unit tests...
export NODE_OPTIONS="--max-old-space-size=8192"
npm run test:frontend:coverage

echo Checking coverage...
npm run coverageCheck
