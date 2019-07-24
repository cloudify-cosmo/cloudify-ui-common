#!/usr/bin/env bash
set -e

MAIN_BRANCH=${MAIN_BRANCH:-master}
echo "Switching to main branch (${MAIN_BRANCH}) and checking if its up-to-date...";
git checkout ${MAIN_BRANCH}
git fetch
git diff ${MAIN_BRANCH}..origin/${MAIN_BRANCH} --exit-code --name-only

NEXT_VERSION=$(npm version --no-git-tag-version "$@")
echo "Creating cloudify-ui-common ${NEXT_VERSION}...";

echo "Creating version publish branch...";
NEXT_VERSION_BRANCH="publish-version-$NEXT_VERSION"
git checkout -b ${NEXT_VERSION_BRANCH}
git add package.json package-lock.json
git commit -m "Bump version"
git tag $NEXT_VERSION

echo
echo "This is the last step before CircleCI-based npm publish.";
echo "Are you sure you want to trigger cloudify-ui-common ${NEXT_VERSION} version publish?";
select choice in "Yes" "No"; do
case "$choice" in
    Yes)
        echo "Pushing changes";
        git push --quiet --follow-tags origin ${NEXT_VERSION_BRANCH}
        git checkout ${MAIN_BRANCH}
        break;;
    *)
        echo "Reverting changes";
        git checkout master
        git tag -d $NEXT_VERSION
        git branch -D ${NEXT_VERSION_BRANCH}
        break;;
esac
done
