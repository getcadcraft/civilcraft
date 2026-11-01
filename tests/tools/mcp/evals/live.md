<!-- SPDX-License-Identifier: Apache-2.0 -->
# Model-in-the-loop run (manual, not a gate)

The deterministic set (`node tools/mcp/evals/run.mjs`) proves the tools do the job when called correctly. This run proves a real
assistant finds and calls them. For each app, paste the `prompt` of every task in `evals/<app>.json` into a connected client (permissions
as the task's `allow`), on a copy of the fixture, then run the same checker on what the assistant saved:

    node tools/mcp/evals/check.mjs <task-file-dir>/<app>.json <task id> <folder the assistant worked in>

Log per client: tasks passed / total, tool calls made, any call that was refused and what the assistant did next. Results are logged in
`docs/0.8-sessions/ai-core_PART_2.md` § Results and are not a CI gate (a model's choice varies from run to run).
