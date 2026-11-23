---
title: Outdoor noise: road, railway and industrial noise at your receivers
summary: Work out day, evening and night noise levels in dB(A) at points of the project from its roads, railways and industrial sources by CNOSSOS-EU, the EU's common method, with the ground from the project's terrain and barriers and buildings from its feature lines.
section: tasks
order: 110
keywords: lden, lnight, day-evening-night level, noise, outdoor noise, reflection, building, lateral diffraction, environmental noise, road noise, traffic noise, railway noise, industrial noise, cnossos, cnossos-eu, noise barrier, noise map, dB(A), laeq, receiver, facade
---

The {{ui:Outdoor noise}} tab works on the alignments, feature lines, survey points and existing-ground surface already in the project. Add the add-on first (Settings, Add-ons). Nothing in the project is changed and nothing is sent anywhere.

:::warning
A design aid; results are predictions, not measurements. The method is CNOSSOS-EU (Directive (EU) 2015/996, Annex II, as amended by Delegated Directive (EU) 2021/1226). The program has not yet been checked against the official software test cases for the method; an acoustician checks any result used for a decision.
:::

## Set the periods and the ground

Under {{ui:Periods and ground}}, give for the day, the evening and the night how often the weather bends sound down towards the ground on these paths (0 to 1). The method takes this from local weather records and gives no default, so use your own. Pick the type of ground between the sources and the receivers. Under {{ui:Reflections}}, choose how many times sound may bounce off barriers and façades on its way: the method asks for at least the first reflection.

## Make roads and railways sources

Under {{ui:Roads and railways}}, set an alignment to {{ui:Road}}. Pick the road surface, the gradient, and the vehicles per hour of each category in each period with their average speed. Railways take their trains and track the same way. Under {{ui:Train body}}, pick {{ui:Open flat-bed wagons}} for a line whose wagons have no side walls to reflect sound.

## Add point sources

Under {{ui:Point sources}}, add a fan, a pump or any other plant: its position, its height above the ground, its sound power in eight octave bands from 63 Hz to 8 kHz, and the hours it runs in each period.

## Barriers and buildings

Under {{ui:Barriers}}, set a feature line to {{ui:Barrier}} and give its height: it counts as a thin wall that high above the ground. Set a closed feature line to {{ui:Building}} and give its height: it counts as a block with a flat roof that high above the lowest ground at its corners.

Both block sound and reflect it. Give each one's {{ui:Absorption αr}} from the product's EN 1793-1 rating (0 to 0.99); leave it empty for a hard surface that reflects everything, the loudest case. A surface under 0.5 m high is not a reflector. The façade a receiver stands on (within 0.2 m) is not counted as a reflector for that receiver.

Sound also passes round the ends of a barrier and the sides of a building. The method counts these paths only from point sources, not from roads or railways. A barrier close to a railway also sends sound back and forth between itself and the train; this is added for a barrier within five times its height of the track.

## Receivers and results

Select survey points in the plan and press {{ui:Add the selected points}}, or type a position. Receivers are usually 4 m above the ground at a façade. Set your own limits for each period if you want warnings, then press {{ui:Work out the levels}}. The table gives each receiver's level in dB(A) for each period and its loudest source; {{ui:Save the results (CSV)}} saves it. A level over your limit is a warning in Problems at the receiver.

## Design levels and the graded surface

With {{ui:Use design levels and the graded surface}} on (the default), a road or track with a design profile puts its sound sources on that profile: 0.05 m above it for a road, 0.5 m and 4 m for a railway. Sound then travels over the graded surface, the existing ground with the corridors, pads and grading cut and filled in, so a road in a cutting is screened by its own slopes and a road on an embankment is not. A road without a design profile, or a station beyond its ends, stays on the existing ground. Turn it off to work on the existing ground only.

## Lden and Lnight

The table also gives Lden and Lnight as Directive 2002/49/EC (Annex I) defines them. Lden adds 5 dB to the evening and 10 dB to the night and averages the three periods over 24 hours; Lnight is the night level. Both are the incident sound: the reflection from the receiver's own façade is left out. Periods of 12, 4 and 8 hours are the default; the evening may be 2 or 3 hours with the day or the night longer, as the directive allows. Strategic noise maps use receivers 4 m above the ground (3.8 to 4.2 m) at the most exposed façade; a note says when a receiver is at another height. You can set a limit for Lden too.

## Heights of railway sound

Railway sound heights are taken above the track's design level where it has one, otherwise above the ground; the top of the rail is not drawn separately. The notes under the results say what applied to your project: how many reflected paths and paths round obstacles were found, which roads sit on their design profile, which ground was used, and any source or receiver inside a building.
