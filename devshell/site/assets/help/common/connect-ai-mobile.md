---
title: Connect your AI on a phone or tablet
summary: How your own AI app reaches the CadCraft apps from a phone or tablet: through the hosted connector, with CadCraft Studio open on a computer. Includes the one-line test.
section: start
order: 66
keywords: ai, assistant, connect, android, ipad, phone, tablet, hosted connector, test
---

## What you will learn

An AI app on a phone or tablet cannot read a settings file on your computer, so it does not use the paste cards. It connects to a **hosted connector** instead, and CadCraft Studio must be open on a computer you own to answer.

## How

1. On the computer, open **CadCraft Studio › Connect your AI** and choose **Hosted connector**. Studio shows the address to add and asks you to sign in.
2. In your AI app, add a connector (a "remote" or "custom" connector) with that address and sign in when asked.
3. Keep Studio open. When it is closed the AI app says CadCraft is not reachable.

## Prove it works

In your AI app, paste this:

```
Use the CadCraft tools: list the apps you can reach, then open the sample drawing in my CadCraft folder and tell me how many objects it has, by layer.
```

## What it can and cannot do

The hosted connector carries only the tool calls and their answers for the apps and permissions you allowed. It never holds your files, and the answers are marked as data from your files, not as instructions. You can disconnect it in Studio at any time.
