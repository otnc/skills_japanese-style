import assert from "node:assert/strict";
import { test } from "node:test";
import { checkUpstreamPrompt } from "./check-upstream-prompt.mjs";

const repository = "owner/repo";
const repositoryPath = `/repos/${repository}`;
const referenceCommitsPath = "/repos/AoTofu/my-claude-system-prompt/commits";
const baseline = "07d15d24fee2f47039d78d2e5f08de7c488239c5";
const updated = "a".repeat(40);
const newer = "b".repeat(40);
const now = new Date("2026-11-16T15:10:00Z");

function updateIssue(number, revision, options = {}) {
  return {
    number,
    title: "Review changes to the reference writing prompt (2026-11-16)",
    body: `<!-- upstream-prompt: ${revision} -->`,
    state: "open",
    user: { login: "github-actions[bot]" },
    ...options,
  };
}

function mockGitHub({ head = updated, issues = [], labelExists = true } = {}) {
  const changes = [];
  const pages = [];
  async function requestFetch(url, { method, body }) {
    const { pathname, searchParams } = new URL(url);
    if (method === "GET" && pathname === referenceCommitsPath) return Response.json([{ sha: head }]);
    if (method === "GET" && pathname === `${repositoryPath}/issues`) {
      assert.equal(searchParams.get("state"), "all");
      assert.equal(searchParams.get("labels"), "upstream-prompt");
      const page = Number(searchParams.get("page"));
      pages.push(page);
      return Response.json(issues.slice((page - 1) * 100, page * 100));
    }
    if (method === "GET" && pathname === `${repositoryPath}/labels/upstream-prompt`) {
      return Response.json({}, { status: labelExists ? 200 : 404 });
    }

    const data = JSON.parse(body);
    changes.push({ method, pathname, data });
    if (pathname === `${repositoryPath}/issues`) return Response.json({ ...data, number: 300, state: "open" });
    return Response.json({});
  }

  return {
    changes,
    pages,
    run: () => checkUpstreamPrompt({ repository, token: "test-token", now, requestFetch }),
  };
}

test("skips issue creation when the reference prompt is unchanged from the incorporated revision", async () => {
  const github = mockGitHub({ head: baseline });
  await github.run();
  assert.deepEqual(github.changes, []);
});

test("creates a labeled issue dated in Tokyo and closes only the oldest managed open issues", async () => {
  const olderIssues = [1, 2, 3, 4, 5, 6].map((number) => updateIssue(number, baseline));
  const humanIssues = Array.from({ length: 100 }, (_, index) => updateIssue(index + 10, updated, { user: { login: "maintainer" } }));
  const github = mockGitHub({ issues: [...humanIssues, ...olderIssues], labelExists: false });
  await github.run();

  assert.deepEqual(github.pages, [1, 2]);
  const [label, created, ...closed] = github.changes;
  assert.equal(label.pathname, `${repositoryPath}/labels`);
  assert.equal(label.data.name, "upstream-prompt");
  assert.equal(created.pathname, `${repositoryPath}/issues`);
  assert.equal(created.data.title, "Review changes to the reference writing prompt (2026-11-17)");
  assert.deepEqual(created.data.labels, ["upstream-prompt"]);
  assert.ok(created.data.body.includes(`/compare/${baseline}...${updated})`));
  assert.deepEqual(closed, [2, 1].map((number) => ({
    method: "PATCH",
    pathname: `${repositoryPath}/issues/${number}`,
    data: { state: "closed", state_reason: "not_planned" },
  })));
});

test("uses closed issues to recognize a reported revision and avoid a duplicate on the same date", async () => {
  const closed = updateIssue(5, updated, { state: "closed" });
  const sameRevision = mockGitHub({ head: updated, issues: [closed] });
  await sameRevision.run();
  assert.deepEqual(sameRevision.changes, []);

  const sameDay = mockGitHub({
    head: newer,
    issues: [{ ...closed, title: "Review changes to the reference writing prompt (2026-11-17)" }],
  });
  await sameDay.run();
  assert.deepEqual(sameDay.changes, []);
});
