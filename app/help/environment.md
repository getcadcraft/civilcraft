---
title: Shade, solar yield and outdoor comfort
summary: Study the shade your building masses cast over a day or a season, see an animation of it, work out how much electricity solar panels on the roofs and walls would make in a typical year, see how comfortable the street beside a building is (UTCI), and get a screening reading of pedestrian wind comfort.
section: tasks
order: 97
keywords: shade study, shadow, sun hours, animation, solar, PV, photovoltaic, panels, yield, kWh, EPW, weather file, UTCI, thermal comfort, outdoor comfort, heat stress, wind
---

The **Environment** section sits under **Sun hours** in a mass's **Properties**. It uses the masses you have drawn as the buildings.

## Load a weather file

Choose a typical-year weather file (**.epw**) for your town. They are free from the EnergyPlus weather site and from climate.onebuilding.org. The file stays in your browser for this visit. The solar yield and the comfort study need it; the shade study works without it when the project has a coordinate system.

## Shade study

Pick a date (or tick **Season** and a last date and a step in days) and a time zone, then **Run shade study**. You get a map of the hours of sun, or of shade, on the ground round the masses; a table of how much of the ground is shaded through the day; and an animation of the day that you can play or step through. **Save map**, **Save animation frames** (all the frames on one picture) and **Save hours** (CSV) keep the results.

The ground is taken as flat at the level of the lowest mass. For shade on sloping ground use **Sun hours**, which reads the terrain.

## Solar yield

Set the panel efficiency, how much of each roof and wall is covered and the system losses, then **Run solar yield**. For every roof and wall you get the electricity a square metre of panel would make in a typical year, how much of it the neighbouring masses take away, and a total for each mass. The model is written out in plain words next to the button: it is a planning estimate from a typical year, not a guarantee.

## Outdoor comfort

**Run comfort** works out the Universal Thermal Climate Index (UTCI) for a standing person on open ground and beside the first mass (south, north, east and west sides), with the shade of every mass. It shows how much sky is seen, the average daytime UTCI, and the hours above 32 (heat stress) and below 0 (cold stress).

## Wind (screening)

**Run wind study** solves the air flow round your masses once for each wind direction that blows in your weather file (4, 8, 12 or 16 directions), over the surroundings you pick (open country, suburb or city centre), and then adds up the whole year's hourly wind. The map colours the ground by comfort class, from green (**sitting**) through **standing**, **strolling** and **walking** to red (**uncomfortable**): the activity whose limit speed (4, 6, 8 and 10 m/s) is exceeded for no more than 5 % of the hours. A second table gives the NEN 8100 grade (A to E) from the share of hours the wind passes 5 m/s. The gust factor multiplies the hourly mean to give an effective gust.

How it works, in plain words: a lattice-Boltzmann large-eddy flow solver (our own, in the library `lib/wind`) in a box round the buildings, a wind-speed profile that rises with height over the chosen roughness, and the speed about 1.5 m above the ground compared with the speed upstream at 10 m. **Screening** is fast and coarse; **Standard** uses more cells and runs for much longer. If the panel says the grid is coarse (under 10 cells over the tallest building), or the flow was still changing, believe the map less.

**What this is not.** The solver has been checked on textbook flows (a channel, a lid-driven cavity) and run on a cube to see that the wake and the speed-up at the corners look right. It has **not** been validated against wind-tunnel measurements of buildings, so every result is labelled as unvalidated. Do not use it for a design value, a wind load or a planning certificate: a wind engineer must run and confirm a proper study. The flat ground, smooth building walls, the weather-station roughness shortcut and the threshold table are simplifications; the thresholds can differ in the criteria your authority uses.

## Wind with OpenFOAM (add-on)

The built-in wind engine above is experimental. For a proper flow solver, switch on the **Pedestrian wind (OpenFOAM)** add-on in **Settings > Add-ons** (it is off until you do). It is GPL-licensed software of its own, kept apart from the rest of CadCraft, and it does not include OpenFOAM: you install that yourself. Then **Engine** in the wind block lists OpenFOAM.

What you set up, once:
1. **Install OpenFOAM** (the ESI v-series from openfoam.com; the add-on is tested with v2512). On Ubuntu or Debian (also inside WSL on Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, then `sudo apt install openfoam2512-default`. It installs under `/usr/lib/openfoam/openfoam2512`. CadCraft needs `blockMesh`, `snappyHexMesh` and `simpleFoam` to run. (The older `openfoam` 1912 package in Ubuntu's own archive also works, but its function objects crash; the add-on then reads the result files itself.)
2. **Start the helper** from the add-on's `runner` folder with Node.js: `node cc-openfoam-runner.mjs serve`. If OpenFOAM is not on the search path, give it a small `runner.json` with the path to OpenFOAM's `etc/bashrc` (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) and start it with `--config runner.json`. The helper listens on this computer only and prints a token.
3. **Paste the token** into the add-on's fields in the wind block (the address stays `http://127.0.0.1:8765`) and press **Check the helper**.

Then **Run wind study** works one case per wind direction in the weather file: your masses become a surface (STL) in a box sized by the usual guideline (5 building heights round and above, 10 behind), meshed with blockMesh and snappyHexMesh, run as steady k-epsilon RANS with an atmospheric boundary layer inlet over the roughness you pick, and the speed at 1.5 m is read back and turned into the same Lawson and NEN 8100 classes. Nothing leaves your computer.

**What has been checked.** The text above the results says it plainly and is part of every saved CSV. The add-on's case writing, result reading and the whole pipeline are tested without OpenFOAM, and a single cube has been run through real OpenFOAM at three mesh sizes (the numbers are in the project notes). It has **not** been validated against wind-tunnel measurements of buildings. It is a screening reading, not a design value and not a certificate. Standard k-epsilon over-predicts turbulence in front of buildings, the ground is flat, walls are smooth and there is no terrain or vegetation.

