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

import * as assert from "power-assert";
import { isReleaseSemVer, isPrereleaseSemVer } from "../lib/semver";

describe("semver", () => {
	describe("isReleaseSemVer", () => {
		it("matches release semantic versions", () => {
			const vs = ["1.2.3", "v1.2.4", "0.0.0", "v12312.456456456.7897897"];
			vs.forEach(v => assert(isReleaseSemVer(v)));
		});
		it("does not match non-release semantic versions", () => {
			const vs = [
				"1.2.3-0",
				"vv1.2.4",
				"0.00.0",
				"v12312.456456456.7897897-text.1.2.3",
				"not-a-version-at-all",
				"1.2.3.",
			];
			vs.forEach(v => assert(!isReleaseSemVer(v)));
		});
	});

	describe("isPrereleaseSemVer", () => {
		it("matches prerelease semantic versions", () => {
			const vs = [
				"1.0.0-alpha",
				"1.0.0-alpha.1",
				"1.0.0-0.3.7",
				"1.0.0-x.7.z.92",
				"1.0.0-x-y-z.-",
				"v12312.456456456.7897897-text.0.1.2.3",
			];
			vs.forEach(v => assert(isPrereleaseSemVer(v)));
		});
		it("does not match non-prerelease semantic versions", () => {
			const vs = [
				"1.2.3",
				"vv1.2.4-0",
				"0.00.0",
				"not-a-version-at-all",
				"1.2.3.",
				"1.0.0-alpha.00",
				"1.0.0+alpha.0",
			];
			vs.forEach(v => assert(!isPrereleaseSemVer(v)));
		});
	});
});
