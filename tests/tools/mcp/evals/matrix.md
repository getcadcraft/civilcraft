<!-- SPDX-License-Identifier: Apache-2.0 -->
# Real-client matrix (run on workstation11a, rule 25)

For each client x OS: (1) did **Connect your AI** write the entry (diff shown, backup kept), (2) did the client list the CadCraft tools
after a restart, (3) did the test prompt pass (`TEST_PROMPT` in tools/mcp/clients.mjs), (4) did **Disconnect** remove only the
`cadcraft` entry. Run with Studio (a build from this round) open and CadCraft's Settings › Assistants on. Fill the table; a row with
`?` has not been seen, and the path in `clients.mjs` for it stays `unverified: true` until it has.

| Client | Windows 11 | macOS | Linux | Notes to check |
|---|---|---|---|---|
| Claude Desktop | ? | ? | n/a | config path `%APPDATA%\Claude\claude_desktop_config.json`; full quit + restart needed |
| Claude Code | ? | ? | ? | `claude mcp add/remove` run by Studio; `claude mcp list` shows cadcraft |
| Cursor | ? | ? | ? | `~/.cursor/mcp.json` |
| Visual Studio Code (Copilot) | ? | ? | ? | user `mcp.json` / `.vscode/mcp.json`, `servers` + `"type":"stdio"` |
| Windsurf | ? | ? | ? | `~/.codeium/windsurf/mcp_config.json` |
| Codex CLI | ? | ? | ? | TOML `[mcp_servers.cadcraft]` |
| Gemini CLI | ? | ? | ? | `~/.gemini/settings.json` |

Also on each: Studio closed while the client starts (the bridge answers; tools appear when Studio opens), a new token (Studio
restart) with no AI-app change, and a client that sends `initialize` (all of the above today) versus one that sends `server/discover`.

## Clients the owner must install on workstation11a

Claude Desktop, Claude Code (needs Node 20.19+ for `npx`), Cursor, Visual Studio Code with GitHub Copilot, Windsurf, Codex CLI, Gemini CLI.
Each needs an account of its own for the model; the matrix only needs the tool list and one test-prompt answer. macOS rows need the Mac
(rdavis) with the same list. Local-model clients (Ollama/LM Studio) are `ai-remote_PART_2`'s (AC.7).

## Seen on workstation11a, 2026-10-28 (`tools/mcp/evals/ws11a.mjs`, run.sh --wsl, WSL Node 24.22)

Detection read the real Windows profile; connect / disconnect ran on COPIES of the real settings files (the real files were not written).

| Client | Found | Config path exists | Connect on a copy | Other servers kept | Disconnect |
|---|---|---|---|---|---|
| Claude Desktop | yes | `%APPDATA%\Claude\claude_desktop_config.json` (confirmed) | ok, backup made | yes | restores server list |
| Visual Studio Code | yes | `%APPDATA%\Code\User\mcp.json` (confirmed) | ok (file had no content to back up) | yes | restores |
| Codex CLI | yes | `%USERPROFILE%\.codex\config.toml` (confirmed) | ok, backup made | yes | restores |
| Claude Code, Cursor, Windsurf, Gemini CLI | not installed | n/a | n/a | n/a | n/a |

Not done (needs the owner): a Studio build with Connect (no Rust toolchain on the workstation; nothing is installed there), so the
write through Studio, the restart of the AI app and the test prompt with a real model are unseen. Install list for the owner: Rust (MSVC)
to build Studio, then Claude Code, Cursor, Windsurf, Gemini CLI; Claude Desktop, VS Code and Codex are already there.
