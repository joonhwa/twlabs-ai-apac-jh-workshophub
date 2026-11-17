---
description: Kick off a Jira card — read it, make your own working copy in In Development (or comment if already there), save the story to ./stories, and create the latc-{id}-{desc} branch.
argument-hint: <JIRA-KEY e.g. LATC-2>
allowed-tools: AskUserQuestion, Bash, Write, mcp__jira__getAccessibleAtlassianResources, mcp__jira__getJiraIssue, mcp__jira__createJiraIssue, mcp__jira__transitionJiraIssue, mcp__jira__addOrEditJiraIssueComment, mcp__jira__editJiraIssue
---

# Kickoff (WorkshopHub)

Start work on Jira card `$ARGUMENTS`. Follow these steps in order. Stop as soon as a step says to stop.

## Hard rules

- **NEVER edit, change, transition or move the original card.** No field edits, no status transitions, no reassignment, no label changes on it. All edits and transitions happen **only on the copy** created in Step 3.
- `editJiraIssue` may only be called on the **copy**, never on the original.
- Comments are the only thing that may be added to a card that is already `In Development` (Step 3b). Use `addOrEditJiraIssueComment` for this — `editJiraIssue` only edits fields and can't add comments.
- Use `AskUserQuestion` for anything unclear (missing key, ambiguous story, branch description). Never guess a card key.
- Do not commit, push, or open a PR. The command ends after the branch is checked out.

## Step 1 — Get the card key and site

1. Take the key from `$ARGUMENTS` (pattern `[A-Z][A-Z0-9]+-[0-9]+`, uppercase it). If it's missing or invalid, ask the user for it with `AskUserQuestion`.
2. Call `getAccessibleAtlassianResources` once and reuse the `cloudId` for every Jira call. If there's more than one site, ask which one.

## Step 2 — Read the card

Call `getJiraIssue` for the key with `view: "full"`, so you get the summary, description, acceptance criteria, issue type, project, priority, labels and **current status**.

If the card doesn't exist or can't be read, show the error and stop.

## Step 3 — Check status and act

Compare the card's current status name to `In Development` (case-insensitive).

### 3a — Not in `In Development` → make a working copy

1. Get the user's name from `git config user.name`.
2. Call `createJiraIssue` in the **same project**, with the **same issue type**, and copy over the description, priority and labels. Set the summary to:
   ```
   [<Your Name>] <original summary>
   ```
   Add a line at the top of the description: `Copied from <ORIGINAL-KEY> for kickoff by <Your Name>.`
3. Call `transitionJiraIssue` on the **new copy** to move it to `In Development`. If there's no direct transition, list the available transitions and ask the user which to use. Don't touch the original.
4. The **working key** is the new copy's key.

### 3b — Already in `In Development` → comment only

1. Do **not** create a copy and do **not** change any fields or status.
2. Call `addOrEditJiraIssueComment` on the card with a comment like:
   ```
   Kickoff attempted by <Your Name> on <YYYY-MM-DD>: card was already In Development. Working branch: <branch name from Step 5>.
   ```
   (Work out the branch name from Step 5 first, then post the comment.)
3. The **working key** is the card's own key.

## Step 4 — Clarify and save the story

1. If the story is unclear (no acceptance criteria, contradictory requirements, unclear scope), ask the user with `AskUserQuestion` and record the answers.
2. Write the story to `./stories/<WORKING-KEY>.md` (create `stories/` if needed) with this structure:

   ```markdown
   # <WORKING-KEY>: <summary>

   - **Original card:** <ORIGINAL-KEY>
   - **Working card:** <WORKING-KEY>
   - **Status:** In Development
   - **Type / Priority:** <type> / <priority>
   - **Kicked off:** <YYYY-MM-DD> by <Your Name>

   ## Description
   <description, converted to Markdown>

   ## Acceptance criteria
   <list, or "None specified">

   ## Clarifications
   <Q&A from this session, or "None">
   ```

   If the file already exists, ask before overwriting it.

## Step 5 — Create the branch

1. Run `git status --short`. If there are uncommitted changes, ask the user whether to carry them onto the new branch or stop.
2. Build the branch name: `latc-<id>-<desc>`
   - `<id>` = the number from the **working key** (e.g. `LATC-17` → `17`).
   - `<desc>` = 3–5 words from the summary in kebab-case: lower case, `a-z0-9` and `-` only, no leading/trailing `-`. Leave out the `[Your Name]` prefix.
   - Example: `LATC-17` "Add cancel endpoint for bookings" → `latc-17-add-cancel-endpoint-bookings`.
3. If the branch already exists (`git branch --list <name>`), ask whether to switch to it or pick a new name.
4. Create it from `main` and check it out:
   ```bash
   git switch -c <branch-name> main
   ```

## Step 6 — Confirm and stop

Run `git branch --show-current` and report:

- Original card key, and whether a copy was made (with its key) or a comment was posted
- Path of the saved story file
- The checked-out branch name

Then **stop**. Don't start implementing the story.
