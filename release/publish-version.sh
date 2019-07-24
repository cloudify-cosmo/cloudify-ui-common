#!/usr/bin/env bash
set -e

echo "Switching to master branch and checking if its up-to-date...";
git checkout master
git fetch
git diff master..origin/master --exit-code --name-only
if [ $? -ne 0 ]; then
    echo "ERROR: Please update your master branch before creating new version.";
fi

NEXT_VERSION=$(npm version --no-git-tag-version "$@")
echo "Creating cloudify-ui-common ${NEXT_VERSION}...";

echo "Creating version publish branch...";
NEXT_VERSION_BRANCH="publish-version-$NEXT_VERSION"
git branch ${NEXT_VERSION_BRANCH}
git checkout ${NEXT_VERSION_BRANCH}
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
        # git push --follow-tags ${NEXT_VERSION_BRANCH}
        break;;
    *)
        echo "Reverting changes";
        git checkout master
        git branch -D ${NEXT_VERSION_BRANCH}
        git tag -d $NEXT_VERSION
        break;;
esac
done
