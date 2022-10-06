#!/usr/bin/env bash
set -e

#===================================================================================
# Usage:
#   create-version.sh <version-type> [<package-name>]
#
# Description:
#   Create new version of package to be published on NPM.
#   Before pushing changes to remote, build and test npm scripts are executed.
#
# Globals:
#   MAIN_BRANCH - (optional) Repository main branch (default: master)
#
# Arguments:
#   $1 (version type) - `npm version` strings allowed
#                       see https://docs.npmjs.com/cli/v8/commands/npm-version#workspaces
#   $2 (package name) - last portion of the package name inside `packages` directory
#
# Returns:
#   None
#===================================================================================

log() {
    LOG_PREFIX="create-version.sh:"
    echo -e $LOG_PREFIX $@
}

VERSION_TYPE=$1
PACKAGE_NAME=$2

if [ -n "$PACKAGE_NAME" ]; then
    IS_WORKSPACE_PACKAGE=1
    cd packages/$2 || {
        log "Invalid package name provided"
        false
    }
fi
NPM_PACKAGE_NAME=`cut -d "=" -f 2 <<< $(npm run env | grep "npm_package_name")`

MAIN_BRANCH=${MAIN_BRANCH:-master}
log "Switching to main branch (${MAIN_BRANCH}) and checking if its up-to-date...";
git checkout ${MAIN_BRANCH} || {
  log "Error during checking out ${MAIN_BRANCH} branch"
  false
}
git fetch || {
  log "Error during fetching data from repository"
  false
}
git pull || {
  log "Error during pulling ${MAIN_BRANCH} branch"
  false
}
git diff origin/${MAIN_BRANCH} --exit-code --compact-summary || {
  log "Working directory not clean. Delete or push your changes to ${MAIN_BRANCH}}."
  false
}

log "Running tests and build..."
npm run lint --if-present || {
  log "Running lint check failed"
  false
}
npm run check-types --if-present || {
  log "Running types check failed"
  false
}
npm run test --if-present || {
  log "Running tests failed"
  false
}
npm run build --if-present || {
  log "Running build failed"
  false
}

NPM_VERSION_OPTIONS="--no-git-tag-version $VERSION_TYPE"
if [[ $VERSION_TYPE == pre* ]]; then
    NPM_VERSION_OPTIONS="$NPM_VERSION_OPTIONS --preid pre"
fi
echo NPM_VERSION_OPTIONS = $NPM_VERSION_OPTIONS
npm version $NPM_VERSION_OPTIONS
NEXT_VERSION=v$(node -p "require('./package.json').version")
log "Creating ${NPM_PACKAGE_NAME} ${NEXT_VERSION}...";

log "Creating version publish branch...";
if [ -n "$IS_WORKSPACE_PACKAGE" ]; then
    NEXT_VERSION_BRANCH="publish_${PACKAGE_NAME}_${NEXT_VERSION}"
    COMMIT_MESSAGE="Bump ${PACKAGE_NAME} version to ${NEXT_VERSION}"
    GIT_TAG="${PACKAGE_NAME}_${NEXT_VERSION}"
else
    NEXT_VERSION_BRANCH="publish_${NEXT_VERSION}"
    COMMIT_MESSAGE="Bump version to ${NEXT_VERSION}"
    GIT_TAG="${NEXT_VERSION}"
fi

git checkout -b ${NEXT_VERSION_BRANCH}
git add package.json
if [ -n "$IS_WORKSPACE_PACKAGE" ]; then
    git add ../../package-lock.json
else
    git add package-lock.json
fi
git commit -m "${COMMIT_MESSAGE}"
git tag ${GIT_TAG}

log "This is the last step before CI-based npm publish.";
log "Are you sure you want to trigger publish ${NPM_PACKAGE_NAME} ${NEXT_VERSION}?";
select choice in "Yes" "No"; do
case "$choice" in
    Yes)
        log "Pushing changes...";
        git push origin ${NEXT_VERSION_BRANCH} tag ${GIT_TAG}
        git checkout ${MAIN_BRANCH}
        break;;
    *)
        log "Reverting changes...";
        git checkout ${MAIN_BRANCH}
        git tag -d ${GIT_TAG}
        git branch -D ${NEXT_VERSION_BRANCH}
        break;;
esac
done
