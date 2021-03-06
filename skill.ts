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

import {
	Category,
	parameter,
	ParameterType,
	resourceProvider,
	skill,
} from "@atomist/skill";

import { GitHubReleaseConfiguration } from "./lib/configuration";

export const Skill = skill<GitHubReleaseConfiguration & { repos: any }>({
	description:
		"Create a GitHub release when semantic version tags are pushed",
	displayName: "GitHub Release",
	categories: [Category.DevOps],
	iconUrl:
		"https://raw.githubusercontent.com/atomist-skills/github-release-skill/main/docs/images/icon.svg",

	resourceProviders: {
		github: resourceProvider.gitHub({ minRequired: 1 }),
	},

	parameters: {
		prerelease: {
			type: ParameterType.Boolean,
			displayName: "Create Prereleases",
			description:
				"Select to create GitHub prereleases in addition to releases",
			required: false,
		},
		repos: parameter.repoFilter(),
	},

	runtime: {
		memory: 512,
	},

	subscriptions: ["@atomist/skill/github/onTag"],
});
