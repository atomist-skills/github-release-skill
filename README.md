# `atomist/github-release-skill`

<!---atomist-skill-description:start--->

Create a GitHub release when semantic version tags are pushed

<!---atomist-skill-description:end--->

---

<!---atomist-skill-readme:start--->

## What it's useful for

In a typical release flow on GitHub, you push a semantic version tag
when you want to release a new version. This skill facilitates this
release flow by automating the creation of a GitHub release.

## How it works

When a tag is pushed to a selected repository that looks like a
[semantic version][semver], this skill creates a [GitHub
Release][gh-release] for that tag.

[semver]: https://semver.org/ "Semantic Versioning"
[gh-release]: https://docs.github.com/en/github/administering-a-repository/about-releases

<!---atomist-skill-readme:end--->

---

Created by [Atomist][atomist].
Need Help? [Join our Slack workspace][slack].

[atomist]: https://atomist.com/ "Atomist - How Teams Deliver Software"
[slack]: https://join.atomist.com/ "Atomist Community Slack"
