/*
 * Copyright © 2021 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
	EventHandler,
	github,
	log,
	secret,
	status,
	subscription,
} from "@atomist/skill";

import { GitHubReleaseConfiguration } from "../configuration";
import { isPrereleaseSemVer, isReleaseSemVer } from "../semver";

export const handler: EventHandler<
	subscription.types.OnTagSubscription,
	GitHubReleaseConfiguration
> = async ctx => {
	const tag = ctx.data.Tag?.[0];
	if (!tag) {
		return status.success("No tag").hidden();
	}
	const tagName = tag?.name;
	if (!tagName) {
		return status.success("No tag name").hidden();
	}
	const repo = tag.commit?.repo;
	if (!repo || !repo.owner || !repo.name) {
		return status.success(`Tag ${tagName} has no repo`).hidden();
	}
	const repoSlug = `${repo.owner}/${repo.name}`;
	const createPrerelease = ctx.configuration?.parameters?.prerelease;

	let prerelease = false;
	if (createPrerelease && isPrereleaseSemVer(tagName)) {
		prerelease = true;
		log.info(`Creating GitHub prerelease ${tagName} for ${repoSlug}`);
	} else if (isReleaseSemVer(tagName)) {
		log.info(`Creating GitHub release ${tagName} for ${repoSlug}`);
	} else {
		return status.success(`Not a semantic version tag: ${tag}`).hidden();
	}

	log.info(`Starting GitHub Release on ${repoSlug}`);

	const credential = await ctx.credential.resolve(
		secret.gitHubAppToken({
			owner: repo.owner,
			repo: repo.name,
			apiUrl: repo.org?.provider?.apiUrl,
		}),
	);
	if (!credential) {
		return status
			.success(`Failed to get credential for ${repoSlug}`)
			.hidden();
	}

	const octokit = github.api({
		apiUrl: repo.org?.provider?.apiUrl,
		credential,
	});
	try {
		await octokit.repos.createRelease({
			name: `${tagName} Release`,
			owner: repo.owner,
			prerelease,
			repo: repo.name,
			tag_name: tagName,
		});
	} catch (e) {
		const reason = `Failed to create release ${tagName} for ${repoSlug}: ${e.message}`;
		log.info(reason);
		return status.failure(reason);
	}

	const msg = `Created release ${tagName} for ${repoSlug}`;
	log.info(msg);
	return status.success(msg);
};
