---
title: Connect your AI on Linux
summary: Let your own AI app work with the CadCraft apps: one click in CadCraft Studio, or a short paste for each AI app. Includes the one-line test that proves it works.
section: start
order: 65
keywords: ai, assistant, connect, mcp, claude, cursor, vs code, windsurf, codex, gemini, set up, test, linux
---

## What you will learn

How to let the AI app you already use (Claude, Cursor, Visual Studio Code, Windsurf, Codex, Gemini…) reach your CadCraft apps, how to check that it works in under a minute, and how to take it out again. The apps contain no AI; your AI app asks them to do things, and you decide what it may do. (For those who search for it: this uses the Model Context Protocol, "MCP".)

## The easy way

Open **CadCraft Studio › Connect your AI**. Studio looks for the AI apps on this computer, shows you in plain words what it would add to each one's settings, and writes it only after you press **Yes**. **Disconnect** takes it out again. Nothing secret is written into the AI app's settings.

## Prove it works

In your AI app, paste this:

```
Use the CadCraft tools: list the apps you can reach, then open the sample drawing in my CadCraft folder and tell me how many objects it has, by layer.
```

It should list the CadCraft apps it can reach and then give you a count by layer. It only reads, so it needs no extra permission beyond the **Read** that is on to begin with. In Studio, **Check the connection** tests each step without the AI and says which one failed.

## Or paste it yourself

One card for each AI app. Each one adds a single entry named `cadcraft` and nothing else.

### Claude Desktop

1. Open ~/.config/Claude/claude_desktop_config.json (it is made if it does not exist; keep anything already in it).
2. Add the CadCraft entry below (inside "mcpServers" if the file has one).
3. Restart Claude Desktop completely, then ask it the test prompt.

```json
{
  "mcpServers": {
    "cadcraft": {
      "command": "npx",
      "args": [
        "-y",
        "@getcadcraft/mcp",
        "connect"
      ]
    }
  }
}
```

**Undo:** Delete the "cadcraft" entry from ~/.config/Claude/claude_desktop_config.json.

### Claude Code

1. Open a terminal.
2. Run the command below.
3. Start Claude Code and ask it the test prompt.

```sh
claude mcp add cadcraft --scope user -- npx -y @getcadcraft/mcp connect
```

**Undo:** claude mcp remove cadcraft --scope user

### Cursor

1. Open ~/.cursor/mcp.json (it is made if it does not exist; keep anything already in it).
2. Add the CadCraft entry below (inside "mcpServers" if the file has one).
3. Start Cursor and ask it the test prompt.

```json
{
  "mcpServers": {
    "cadcraft": {
      "command": "npx",
      "args": [
        "-y",
        "@getcadcraft/mcp",
        "connect"
      ]
    }
  }
}
```

**Undo:** Delete the "cadcraft" entry from ~/.cursor/mcp.json.

:::tip
This path comes from the AI app's public guides. If it does not match your install, use Studio's Connect, which looks first.
:::

### Windsurf

1. Open ~/.codeium/windsurf/mcp_config.json (it is made if it does not exist; keep anything already in it).
2. Add the CadCraft entry below (inside "mcpServers" if the file has one).
3. Start Windsurf and ask it the test prompt.

```json
{
  "mcpServers": {
    "cadcraft": {
      "command": "npx",
      "args": [
        "-y",
        "@getcadcraft/mcp",
        "connect"
      ]
    }
  }
}
```

**Undo:** Delete the "cadcraft" entry from ~/.codeium/windsurf/mcp_config.json.

:::tip
This path comes from the AI app's public guides. If it does not match your install, use Studio's Connect, which looks first.
:::

### Visual Studio Code

1. Open ~/.config/Code/User/mcp.json (it is made if it does not exist; keep anything already in it).
2. Add the CadCraft entry below (inside "servers" if the file has one).
3. Start Visual Studio Code and ask it the test prompt.

```json
{
  "servers": {
    "cadcraft": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@getcadcraft/mcp",
        "connect"
      ]
    }
  }
}
```

**Undo:** Delete the "cadcraft" entry from ~/.config/Code/User/mcp.json.

:::tip
This path comes from the AI app's public guides. If it does not match your install, use Studio's Connect, which looks first.
:::

### Codex CLI

1. Open ~/.codex/config.toml (it is made if it does not exist; keep anything already in it).
2. Add the CadCraft entry below (inside "mcp_servers" if the file has one).
3. Start Codex CLI and ask it the test prompt.

```toml
[mcp_servers.cadcraft]
command = "npx"
args = ["-y","@getcadcraft/mcp","connect"]
```

**Undo:** Delete the "cadcraft" entry from ~/.codex/config.toml.

:::tip
This path comes from the AI app's public guides. If it does not match your install, use Studio's Connect, which looks first.
:::

### Gemini CLI

1. Open ~/.gemini/settings.json (it is made if it does not exist; keep anything already in it).
2. Add the CadCraft entry below (inside "mcpServers" if the file has one).
3. Start Gemini CLI and ask it the test prompt.

```json
{
  "mcpServers": {
    "cadcraft": {
      "command": "npx",
      "args": [
        "-y",
        "@getcadcraft/mcp",
        "connect"
      ]
    }
  }
}
```

**Undo:** Delete the "cadcraft" entry from ~/.gemini/settings.json.

:::tip
This path comes from the AI app's public guides. If it does not match your install, use Studio's Connect, which looks first.
:::

## Browser AI and phones

AI apps in a web browser, and on phones and tablets, cannot read a settings file on your computer. They use the **hosted connector** instead (needs CadCraft Studio open on a computer). Studio › Connect your AI shows the link.

## If it does not work

- **The AI app does not list CadCraft:** restart it fully (quit, not just close the window), then check the entry is in its settings.
- **"Could not reach CadCraft Studio":** open Studio and the app you want; each app has Settings › Assistants to turn on.
- **It can look but not change:** Edit, Save and Export are separate permissions you turn on per app in Studio.
