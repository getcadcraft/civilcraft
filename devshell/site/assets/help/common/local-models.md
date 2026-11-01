---
title: Use an AI that runs on your own computer
summary: Work with a local AI model and no network: through an AI app that can use tools, .
section: start
order: 66
keywords: ai, assistant, local, offline, ollama, lm studio, llama.cpp, jan, air-gapped, private, model, ask box
---

## What you will learn

How to use an AI model that runs on your own computer, so nothing you ask leaves it. This suits firms that cannot send drawings to an outside service. The apps contain no AI; the model asks them to do things, and you decide what it may do.

## How

Use an AI app on this computer that can use tools. LM Studio, Jan and llama.cpp's server can each use tools through the Model Context Protocol ("MCP"). Add the single `cadcraft` entry shown in **Connect your AI**, open CadCraft Studio, then ask your question in that app.

| Program | Can use tools through MCP |
|---|---|
| LM Studio | Yes |
| llama.cpp (llama-server) | Yes, start it with `--jinja` |
| Jan | Yes, turn on tool calling for the model |
| Ollama | Not on its own: use it as the model, with Jan or an editor in front |

This list is taken from each program's own documentation. It has not yet been tried with every program on every system.

## Good to know

- Raise the model's context length before you start; the default in some programs is small and tool descriptions will not fit.
- Small models call tools less reliably than large hosted ones. If the answer says what it would do but nothing changes, try a larger model or a model marked as able to use tools.
- Everything else stays the same: the permission levels, **Suggest** mode, the folders you allowed and the activity list. A model on this computer sends nothing out.
