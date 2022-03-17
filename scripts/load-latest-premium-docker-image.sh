#!/usr/bin/env bash

#===================================================================================
# Usage:
#   ./load-latest-premium-docker-image.sh
#
# Description:
#   The script has been created to provide a tool for downloading and installing cloudify docker image with one command.
#   It is mainly used in Makefile inside of cloudify-stage and cloudify-blueprint-composer repositories. It can be also used separately in aforementioned projects.
#
# Globals:
#   None
#
# Arguments:
#   None
#
# Returns:
#   None
#===================================================================================


PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[", ]//g');

PACKAGE_VERSION_WITH_BACKSLASH="${PACKAGE_VERSION/-/\/}";

FILENAME="cloudify-manager-aio-docker-${PACKAGE_VERSION}-x86_64.tar";

# we are getting premium image version URL
LINK="https://repository.cloudifysource.org/cloudify/${PACKAGE_VERSION_WITH_BACKSLASH}-release/${FILENAME}";
# premium images addresses:
# https://github.com/cloudify-cosmo/cloudify-premium/blob/master/packages-urls/docker-image-release.yaml
# community image addresses:
# https://github.com/cloudify-cosmo/cloudify-versions/blob/master/packages-urls/docker-image-release.yaml

echo "Docker image URL:${LINK}";
echo "Downloading docker image...";

wget $LINK;

echo "Loading image into the docker...";
docker load < ${FILENAME};

rm $FILENAME;
echo "Removed downloaded image";
