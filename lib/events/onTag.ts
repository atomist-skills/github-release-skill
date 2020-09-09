/*
 * Copyright © 2020 Atomist, Inc.
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

import { EventHandler, log, secret, status } from "@atomist/skill";
import { Octokit } from "@octokit/rest";
import { GitHubReleaseConfiguration } from "../configuration";
import { isPrereleaseSemVer, isReleaseSemVer } from "../semver";
import { OnTagSubscription } from "../typings/types";

export const handler: EventHandler<
	OnTagSubscription,
	GitHubReleaseConfiguration
> = async ctx => {
	const tag = ctx.data.Tag[0];
	const tagName = tag?.name;
	const repo = tag.commit.repo;
	const repoSlug = `${repo.owner}/${repo.name}`;
	const createPrerelease = ctx.configuration?.[0]?.parameters?.prerelease;

	if (createPrerelease && isPrereleaseSemVer(tagName)) {
		log.info(`Creating GitHub prerelease ${tagName} for ${repoSlug}`);
	} else if (isReleaseSemVer(tagName)) {
		log.info(`Creating GitHub release ${tagName} for ${repoSlug}`);
	} else {
		return {
			code: 0,
			reason: `Not a semantic version tag: ${tag}`,
			visibility: "hidden",
		};
	}

	await ctx.audit.log(`Starting GitHub Release on ${repoSlug}`);

	const credential = await ctx.credential.resolve(
		secret.gitHubAppToken({
			owner: repo.owner,
			repo: repo.name,
			apiUrl: repo.org.provider.apiUrl,
		}),
	);

	const octokit = new Octokit({
		auth: credential.token,
		userAgent: "@atomist/github-release-skill v0.1.0",
	});

	try {
		await octokit.repos.createRelease({
			name: `${tagName} Release`,
			owner: repo.owner,
			repo: repo.name,
			tag_name: tagName,
		});
	} catch (e) {
		const reason = `Failed to create release ${tagName} for ${repoSlug}: ${e.message}`;
		await ctx.audit.log(reason);
		return status.failure(reason);
	}

	const msg = `Created release ${tagName} for ${repoSlug}`;
	log.info(msg);
	return status.success(msg);
};
