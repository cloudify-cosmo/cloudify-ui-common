#!/usr/bin/env bash
set -e

#===================================================================================
# Usage:
#   createVersion <major|minor|patch>
#
# Description:
#   Create new version of package to be published on NPM.
#   Before pushing changes to remote, build and test npm scripts are executed.
#
# Globals:
#   MAIN_BRANCH - (optional) Repository main branch (default: master)
#
# Arguments:
#   $1 (version type) - "patch", "minor" and "major" strings allowed
#
# Returns:
#   None
#===================================================================================

createVersion() {
    log() {
        LOG_PREFIX="create-version.sh:"
        echo -e $LOG_PREFIX $@
    }

    NPM_VERSION_ARGUMENT=$@
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
    npm run test || {
      log "Running tests failed"
    }
    npm run build || {
      log "Running build failed"
    }

    NEXT_VERSION=$(npm version --no-git-tag-version "$NPM_VERSION_ARGUMENT")
    log "Creating ${NPM_PACKAGE_NAME} ${NEXT_VERSION}...";

    log "Creating version publish branch...";
    NEXT_VERSION_BRANCH="publish-${NEXT_VERSION}"
    git checkout -b ${NEXT_VERSION_BRANCH}
    git add package.json package-lock.json
    git commit -m "Bump version to ${NEXT_VERSION}"
    git tag ${NEXT_VERSION}

    log "This is the last step before CircleCI-based npm publish.";
    log "Are you sure you want to trigger ${NPM_PACKAGE_NAME} ${NEXT_VERSION} version publish?";
    select choice in "Yes" "No"; do
    case "$choice" in
        Yes)
            log "Pushing changes...";
            git push origin ${NEXT_VERSION_BRANCH} tag ${NEXT_VERSION}
            git checkout ${MAIN_BRANCH}
            break;;
        *)
            log "Reverting changes...";
            git checkout ${MAIN_BRANCH}
            git tag -d ${NEXT_VERSION}
            git branch -D ${NEXT_VERSION_BRANCH}
            break;;
    esac
    done
}
