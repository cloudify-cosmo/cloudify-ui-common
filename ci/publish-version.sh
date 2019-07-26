#!/usr/bin/env bash
set -e

log() {
    LOG_PREFIX="publish-version.sh:"
    echo -e $LOG_PREFIX $@
}

MAIN_BRANCH=${MAIN_BRANCH:-master}
log "Switching to main branch (${MAIN_BRANCH}) and checking if its up-to-date...";
git checkout ${MAIN_BRANCH}
git fetch
git diff origin/${MAIN_BRANCH} --exit-code --compact-summary

log "Running tests and build..."
npm run test:build

NEXT_VERSION=$(npm version --no-git-tag-version "$@")
log "Creating cloudify-ui-common ${NEXT_VERSION}...";

log "Creating version publish branch...";
NEXT_VERSION_BRANCH="publish-${NEXT_VERSION}"
git checkout -b ${NEXT_VERSION_BRANCH}
git add package.json package-lock.json
git commit -m "Bump version to ${NEXT_VERSION}"
git tag ${NEXT_VERSION}

log "This is the last step before CircleCI-based npm publish.";
log "Are you sure you want to trigger cloudify-ui-common ${NEXT_VERSION} version publish?";
select choice in "Yes" "No"; do
case "$choice" in
    Yes)
        log "Pushing changes...";
        git push --follow-tags origin ${NEXT_VERSION_BRANCH}
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
