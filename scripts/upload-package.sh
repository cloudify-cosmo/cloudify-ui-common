#!/usr/bin/env bash -e

#===================================================================================
# Usage:
#   uploadPackage <package_file> <ssh_command>
#
# Description:
#   Uploads package file to the remote machine using SSH
#   and runs specified command remotely.
#
# Globals:
#   MANAGER_USER - (optional) Cloudify Manager SSH username (default: centos)
#   MANAGER_IP   - (required) Cloudify Manager IP address
#   SSH_KEY_PATH - (required) Cloudify Manager SSH key path

# Arguments:
#   $1 (package_file) - path to package file, eg. "./stage.tar.gz"
#   $2 (ssh_command)  - string with command to be executed after uploading
#                       on remote machine, eg. "tar xzf stage.tar.gz"
# Returns:
#   None
#===================================================================================
uploadPackage() {
    MANAGER_USER=${MANAGER_USER:-centos}
    PACKAGE_PATH=$1
    SSH_COMMAND=$2
    COMMON_OPTIONS="-o StrictHostKeyChecking=no"
    ERROR_CODE=0

    pwd

    # Manager IP check
    if [ -z $MANAGER_IP ]; then
        echo "ERROR: Cloudify Manager IP (MANAGER_IP variable) not defined."
        ((ERROR_CODE++))
    fi

    # SSH key check
    if [ ! -f "${SSH_KEY_PATH}" ]; then
        echo "ERROR: SSH key to Cloudify Manager (SSH_KEY_PATH variable) - '${SSH_KEY_PATH}' - not found.";
        ((ERROR_CODE++))
    fi

    # Package check
    if [ ! -f "${PACKAGE_PATH}" ]; then
        echo "ERROR: Package to be uploaded to Cloudify Manager - '${PACKAGE_PATH}' - not found."
        ((ERROR_CODE++))
    fi

    if [ $ERROR_CODE -gt 0 ]; then
        exit $ERROR_CODE
    fi

    scp -i ${SSH_KEY_PATH} ${COMMON_OPTIONS} ${PACKAGE_PATH} ${MANAGER_USER}@${MANAGER_IP}:~

    ssh -i ${SSH_KEY_PATH} ${COMMON_OPTIONS} ${MANAGER_USER}@${MANAGER_IP} ${SSH_COMMAND}
}
