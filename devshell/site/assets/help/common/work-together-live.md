---
title: Work together live
summary: Share the file open in an app so teammates edit it with you on your own network with a short code, and join someone else's session. Invite links over the internet are not open yet.
section: tasks
order: 90
keywords: live, studio live, work together, collaborate, share live, join, code, qr, invite link, link, host, approve, guest, network, relay, license, many people, limit, allow anyway, slow, recent edits, edit log, who changed, history
---

## What you will learn

How to share a file live from CadCraft Studio, let people in, and join a session someone else shares. What you see in the drawing itself while you work together is on the app's own page about live sessions.

## Share the file you have open

1. Open the file in its app inside CadCraft Studio on a computer.
2. Choose {{ui:Live}} in the app's bar, type the name others should see, then choose {{ui:Share live}}.
3. Studio shows a code like `K7-Q4M2X` with a picture to scan and the computer's address. Give the code to the people you want to invite.

Your file stays on your computer. Only you save it, and everyone sees your saves.

## Let people in

Nobody gets in without you. When someone knocks, a card shows their name and device and whether they came on this network or through the internet:

- {{ui:Edit}} lets them change the file with you.
- {{ui:View only}} lets them watch; anything they try to change is taken back.
- {{ui:Deny}} turns them away.

The list under {{ui:In the session}} shows everyone. Change a person's role there, or {{ui:Remove}} them: they keep a copy of what they had, and they can't come back without a new invitation.

## When many people join

A session's usual size is up to 20 people besides you. It is not a hard limit: how many people can work well together depends on their computers, the file and the network, so Studio asks you before a session grows past it instead of deciding for you.

When someone knocks and would make more than 20, their card says so, and Studio explains what to expect: every change goes to everyone, so with many people each change takes longer to reach each person, and slower laptops and connections fall behind first. Then you choose:

- {{ui:Allow anyway}} lets more people in for this session. Each person still waits for your {{ui:Edit}}, {{ui:View only}} or {{ui:Deny}}.
- {{ui:Keep it at 20}} turns away the people waiting over the limit; they are told you are keeping the session small.

To allow more before anyone knocks, choose {{ui:Allow more people…}} under {{ui:In the session}}. {{ui:Back to 20}} puts the usual size back. Your choice lasts for this session only; the next one starts at 20 again.

If things slow down, fewer people, a quieter file (fewer people changing it at the same moment) or a better connection (a cable instead of Wi-Fi) helps.

## Codes on your own network

- A code works for 10 minutes. {{ui:New code}} makes another; {{ui:Stop inviting}} closes it. People already in stay.
- {{ui:One-time code}} lets one person in per code.
- After 3 wrong codes in a row, Studio closes the code and makes a new one, and tells you.

Sessions on your own network are free, for everyone.

## Invite links over the internet: not open yet

Invite links aren't open yet. Sessions on your own network are free. Today the {{ui:Over the internet}} part of the {{ui:Live}} panel says so in a plain sentence instead of offering a link.

When invite links open, this is how they will work:

1. Under {{ui:Over the internet}}, choose how long the link works (1 hour, 8 hours, or until you end the session), then {{ui:Invite by link}}.
2. Copy the link and send it like a meeting link.

The link's secret part (after `#`) never reaches getcadcraft.com: the site only passes on encrypted messages it can't read, and you still approve each person. {{ui:New link}} makes the old one stop working at once; {{ui:Stop the link}} ends it.

Making an invite link will need you signed in, with a commercial license in force for the app. Guests will need nothing: no account, no license.

## Join someone else's session

1. In CadCraft Studio's home screen, find {{ui:Join a live session}}.
2. Type the code the host gave you, or type the address shown under their code followed by the code. (Once invite links open, you will paste the host's link here too.)
3. Type your name and choose {{ui:Join}}. Studio opens the right app; it fills with the host's file once the host lets you in.

Without Studio, scan the picture under the host's code with a device on the same network: the app opens in the browser.

In CadCraft, if you already have the same file open in a Studio window, you can join from that window instead: choose {{ui:Live}}, then under {{ui:Join with the drawing open here}} type the code or the address and code, and choose {{ui:Join here}}. Only the changes made since the file was opened travel. If the host's drawing is a different one, it replaces the one in that window; your file on disk stays as it is.

:::note
Guest, hotel and school Wi-Fi often keep devices apart, so a code can't find the host there. Use a network that lets devices see each other, such as the office network. Invite links, for when you are not on the same network, are not open yet.
:::

## Who changed what: Recent edits

The Live panel lists **Recent edits**: who made each change and what it was (the step's name, such as Line or Move), newest first, with how long ago. {{ui:Show more}} lists more of them. With something selected in CadCraft or MarkupCraft, the panel also says who changed it last, and {{ui:Only what is selected}} keeps just the edits that touched it.

The list is made in your own window from the session's edits while the session runs. It is gone when the session ends: it is never saved in the file or sent anywhere. Everyone in the session can see who made each change. If you joined after people had started, or were away for a while, the edits from before are not in your list, and the panel says so.

## Assistants in a session

If someone turned on assistants in their app's settings, their AI assistant can ask to work in the session too. The host's own assistant joins at once; anyone else's waits for the host, with a card saying whose assistant it is: {{ui:Allow}} or {{ui:Deny}}. An assistant edits like its person, with its own undo, and leaves the session when its person leaves.

## When the session ends

The host chooses {{ui:End the session}}, or closes the file. Everyone else keeps an unsaved copy of the file as it was: save it if you want to keep it. {{ui:Leave}} does the same for you alone.
