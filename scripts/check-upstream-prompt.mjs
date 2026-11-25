const referenceRepository = "AoTofu/my-claude-system-prompt";
const initialRevision = "07d15d24fee2f47039d78d2e5f08de7c488239c5";
// The label and marker still say "upstream" because earlier issues use them
// to record the last reported revision; renaming them would re-report old changes.
const label = "upstream-prompt";
const issueAuthor = "github-actions[bot]";
const revisionMarker = /^<!-- upstream-prompt: ([0-9a-f]{40}) -->$/m;
const maxOpenIssues = 5;
const tokyoDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo", dateStyle: "short" });

async function listUpdateIssues(request, repositoryPath) {
  const issues = [];
  const pageSize = 100;
  for (let page = 1; ; page += 1) {
    const batch = await request(`${repositoryPath}/issues?state=all&labels=${label}&per_page=${pageSize}&page=${page}`);
    for (const issue of batch) {
      if (issue.pull_request || issue.user?.login !== issueAuthor) continue;

      const revision = issue.body?.match(revisionMarker)?.[1];
      if (revision) issues.push({ ...issue, revision });
    }
    if (batch.length < pageSize) break;
  }
  return issues.sort((left, right) => right.number - left.number);
}

/**
 * Checks the reference prompt repository for new commits and keeps the newest update issues open.
 * The clock and HTTP client can be supplied for an offline run.
 *
 * @example
 * await checkUpstreamPrompt({ repository: "owner/repo", token: process.env.GITHUB_TOKEN });
 */
export async function checkUpstreamPrompt({ repository, token, now = new Date(), requestFetch = fetch }) {
  if (!repository || !token) throw new Error("GITHUB_REPOSITORY and GITHUB_TOKEN are required.");

  async function request(path, { method = "GET", body, allowNotFound = false } = {}) {
    const response = await requestFetch(`https://api.github.com${path}`, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
    if (allowNotFound && response.status === 404) return null;
    if (!response.ok) throw new Error(`${method} ${path} failed with HTTP ${response.status}.`);
    return response.json();
  }

  const repositoryPath = `/repos/${repository}`;
  const [head] = await request(`/repos/${referenceRepository}/commits?per_page=1`);
  if (!/^[0-9a-f]{40}$/.test(head?.sha ?? "")) throw new Error("The reference repository returned no valid commit SHA.");

  const issues = await listUpdateIssues(request, repositoryPath);
  // Closed issues still record which upstream revision was last reported.
  const previousRevision = issues[0]?.revision ?? initialRevision;
  const title = `Review changes to the reference writing prompt (${tokyoDate.format(now)})`;

  if (head.sha !== previousRevision && !issues.some((issue) => issue.title === title)) {
    const existingLabel = await request(`${repositoryPath}/labels/${label}`, { allowNotFound: true });
    if (existingLabel === null) {
      await request(`${repositoryPath}/labels`, {
        method: "POST",
        body: { name: label, color: "5319E7", description: "Changes to the reference writing prompt" },
      });
    }

    const referenceUrl = `https://github.com/${referenceRepository}`;
    const issue = await request(`${repositoryPath}/issues`, {
      method: "POST",
      body: {
        title,
        labels: [label],
        body: [
          `<!-- upstream-prompt: ${head.sha} -->`,
          "",
          `The reference prompt in [${referenceRepository}](${referenceUrl}) has new commits since the last report. This skill uses it as a reference, not as an upstream to sync with.`,
          "",
          "Read the changes and adopt only the guidance that fits this skill's readers and media. Leaving a change out is fine; note the reason in this issue when you close it.",
          "",
          `- [Changes since the last report](${referenceUrl}/compare/${previousRevision}...${head.sha})`,
        ].join("\n"),
      },
    });
    issues.unshift(issue);
    console.log(`Created issue #${issue.number} for ${head.sha}.`);
  }

  for (const issue of issues.filter(({ state }) => state === "open").slice(maxOpenIssues)) {
    await request(`${repositoryPath}/issues/${issue.number}`, {
      method: "PATCH",
      body: { state: "closed", state_reason: "not_planned" },
    });
    console.log(`Closed old update issue #${issue.number}.`);
  }
}

if (import.meta.main) {
  await checkUpstreamPrompt({
    repository: process.env.GITHUB_REPOSITORY,
    token: process.env.GITHUB_TOKEN,
  });
}
