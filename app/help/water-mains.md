---
title: Water mains: pressures, flows and fire flow
summary: Draw a pressure network of junctions, reservoirs, tanks, pipes, pumps and pressure reducing valves on the plan; CivilCraft works out the heads, pressures and flows (Hazen–Williams, looped networks), the flow available for a fire, and a day of demand. A lab feature; every result needs an engineer's check.
section: tasks
order: 94
keywords: water, water main, water distribution, pressure network, pressure pipe, looped network, hazen-williams, c factor, head loss, residual pressure, fire flow, hydrant, demand, junction, reservoir, tank, pump, pump curve, pressure reducing valve, prv, check valve, extended period, epanet, inp, velocity
---

Water mains are the pressure side of a site: pipes that are always full, with water pushed through by a reservoir, a tank or a pump. CivilCraft works out the head and pressure at every junction and the flow in every pipe, including looped networks where the water has more than one way to go. It is in the lab while it is checked.

**A calculation aid only.** Every number needs a qualified engineer's check: the answer is only as good as the demands, the elevations, the pipe sizes and the roughness values you gave it, and a steady-state model knows nothing about water hammer, water quality or a fire pump's real behavior.

## Draw the network

1. Under **Surface** › {{ui:More}}, choose {{ui:Water mains…}}. The window stays open while you work on the plan.
2. Pick {{ui:Reservoir}} and click the plan where the supply is. Its head starts 100 ft (30 m) above the ground; change it in Properties.
3. Pick {{ui:Junction}} and click each place where water is drawn or pipes meet. A junction takes its elevation from the ground; type a different one in Properties to override it.
4. Pick {{ui:Pipe}}, click a node, then the node it joins. The tool stays on for the next pipe. A {{ui:Pump}} and a {{ui:Pressure reducing valve}} are drawn the same way, from the suction (or upstream) node to the delivery (or downstream) node. A {{ui:Tank}} is placed like a junction.
5. Select a junction and type its {{ui:Demand}} (gpm, or L/s in a metre project). Select a pipe and set its {{ui:Diameter}} (in, or mm) and, if you know it, its Hazen–Williams C.

Every change is one undo step. Delete removes the node and the pipes that end at it.

## What each part means

- **Pipe.** The length is measured along the plan unless you type one. C is the Hazen–Williams roughness (130 to start, change the default in the window). A minor loss coefficient K adds the losses of bends and fittings. Tick **Check valve** for a pipe that must not carry water backwards; a **Closed** pipe carries nothing.
- **Reservoir.** A source at a fixed head, the water level it holds above the datum. It gives or takes whatever the network needs.
- **Tank.** A level that changes over a day. In the steady results it is a source at its current level.
- **Pump.** One design point (flow and head) gives the usual curve through it: the head at zero flow is 133 % of the design head, and the head is zero at twice the design flow. A pump never pushes water backwards.
- **Pressure reducing valve.** Holds the pressure you set downstream while the supply is higher. When the supply is lower it is open and does not hold anything; if the water would run backwards it closes.

## Read the results

The window shows every node's head and pressure and every link's flow, velocity and head loss per 1,000 ft (or per km), with the junctions coloured on the plan: green is between your lowest and highest pressure, red below, amber above. Flow arrows show the direction. Select a node or pipe to read its numbers in Properties.

Under the tables is a list of what to look at: low or high pressure, a pipe faster than your limit, a junction cut off from every source, or a solver that did not settle. The same findings are in the Problems panel. Set the limits in the window (20 psi, 100 psi and 10 ft/s to start; 140 kPa, 700 kPa and 3 m/s in a metre project).

## Fire flow

{{ui:Fire flow…}} draws a flow at one junction and shows the pressure there and the lowest pressure anywhere in the network. It also finds the flow available at that junction while the weakest node in the network keeps the residual pressure you give. Other demands stay as they are.

## A day of demand

{{ui:A day of demand…}} runs the network hour by hour. Give the demand pattern in the file's settings (a list of multipliers that repeats); tanks fill and drain with the flow in and out, and a pump can follow an on/off pattern. A tank that reaches its highest or lowest level is named in the list: CivilCraft does not close its inlet or outlet for you, so read that as "this tank is too small or the pump too big".

## EPANET text

{{ui:Save as EPANET text (.inp)}} writes the network in the plain-text format many water programs read, and {{ui:Open EPANET text (.inp)…}} reads one. Only what CivilCraft models comes across: junctions, reservoirs, tanks, pipes, pumps with a head curve, pressure reducing valves, demand patterns and the times. Other valve types, pumps given by power, and other headloss formulas are named and left out. The file must use the same units as the project.

## Hydrants, valves and fittings

Select a junction and tick **Hydrant** to put one there; select a main and press **Add at the middle** to put a valve, an air valve, a blow-off or a meter on it. They are objects of the network: they move with it and one undo step removes them.

The layout also implies fittings, and CivilCraft lists them without being asked: a **tee** where three mains meet, a **cross** where four do, a **bend** (with its angle) where two mains turn by 5° or more, a **reducer** where two sizes meet, and a **cap** at a dead end. {{ui:Fittings schedule (CSV)}} counts them and the mains by size. This is what the layout implies, a take-off to check against your own details, not a list to order from.

Mains are laid at the ground less a cover (4 ft or 1.2 m) so they can be drawn and modelled in 3D; the pressures above never depend on it.

## On the plan and in files

The plan, the PDF and the DWG or DXF carry the mains on **C-WATR-MAIN** with their sizes on **C-WATR-TEXT**, hydrants on **C-WATR-HYDR**, valves on **C-WATR-VALV** and the fittings on **C-WATR-FITT**. LandXML out writes a water pipe network (a structure for each node, a pipe for each main, hydrants named); LandXML in reads one back as water mains, with no demands, pumps or valves, which LandXML does not carry. The IFC export writes the mains as pipe segments, hydrants, valves and fittings in one water system. These files have been checked against our own reader and writers; try them in your other programs and tell us what they say.

## What is not here yet

Water quality and age, controls and rules beyond a pump's on/off pattern, other valve types, demand by pressure, pipes with a changing diameter, and sewer flows over time. See [Not built yet](topic:not-built-yet). Sanitary design flows, which are a different calculation, are in [Sanitary design flows](topic:sanitary-design).
