---
title: Run an engine on a model
summary: The Engines panel runs the shared calculation engines (schematics, pipe and power networks, motion, queues, schedule and cost, requirements, risk, live data, circuits, boards, systems, PLC) on a model you paste.
section: tasks
order: 40
keywords: engines, schematic, network, power, load flow, robot, kinematics, queue, simulation, schedule, critical path, requirements, risk, fault tree, modbus, circuit, spice, board, pcb, modelica, plc
---

Some calculations are the same in every app, so they live in one panel instead of eight. Open **Engines** from the button in the bar at the top, or press {{key:Mod+K}} and type "engines".

## Run one

1. Choose an engine from the list: schematics, pipe networks and power systems, motion and robots, queues, schedule and cost, requirements, risk, live data, circuits, boards, systems or controls.
2. Choose a worked example, or replace the text with your own model. Most engines read JSON; circuits, systems and controls read their own text (a circuit deck, Modelica, structured text).
3. Press {{ui:Run}}. The results come back as tables, with the engine's own problems above them and the limits of its method below.

{{ui:Reset}} puts the example text back.

## Controls on a model, or on the 3D scene

The controls engine also takes a JSON input that ties a structured-text program to something it can sense and command. {{ui:The program bound to a flow model}} is the queues engine's model. In ModelCraft, {{ui:The program bound to the 3D scene}} ties it to the placements (groups and components) of the open model: a sensor reads `Name.x`, `Name.y`, `Name.z`, `Name.rotZ` or `Name.hidden`, a command writes one of them, and the program decides. Position sensors are whole numbers, so give each a `scale` (1000 turns metres into millimetres); a command is on or off, and `values` says what off and on mean (`[0, 2]` puts the placement at 0 or 2 m). A run changes nothing in the model: the results table shows where each placement would end up. Add `"keep": true` to write the final state into the model as one undo step. A placement that is not in the model is reported by name.

## Things to know

- Everything runs in this page. Nothing is uploaded, and nothing is saved in your file.
- Problems the engine finds also appear in the Problems panel, under their own source.
- The examples are small on purpose, with answers you can check by hand. They are a way to see what an engine does, not a design.
- The results are calculation aids. A person who is responsible for the design checks them.
