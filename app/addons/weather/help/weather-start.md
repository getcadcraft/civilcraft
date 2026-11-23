---
title: Weather files: getting started
summary: Find the weather stations nearest your model, read their design temperatures and degree-days, use them in Heating and cooling loads, explore the hourly year as a 3D surface and other charts, and fetch it as an EnergyPlus weather file.
section: start
order: 1
keywords: weather data, weather viewer, 3D surface, wind rose, psychrometric, wet bulb, enthalpy, sunrise, sunset, solar radiation, illuminance, weather file, epw, EnergyPlus, TMY, typical year, design temperature, degree-days, heating degree days, cooling degree days, climate, station, heat loss, cooling load, add-on
---

## What you'll do

1. Switch the add-on on in {{ui:Settings}} › {{ui:Add-ons}}, then open the **Weather files** tab.
2. Check **Where the model stands**. A model whose site has a latitude and longitude shows them. If yours has none, type the latitude and longitude. North and east are positive, so a place in California has a negative longitude.
3. Under **Nearest weather stations**, pick a station. The table shows how far away each one is, its winter and summer design temperatures and its heating degree-days.
4. Read the station's figures below the table: design temperatures at two levels, heating and cooling degree-days, the mean air temperature and a ground temperature, in °C and °F.
5. In BimCraft, press **Use in Heating and cooling loads**. Open the **Daylight** tab and press **Work out the loads**: the section now says which station its outside temperatures and degree-days came from.

## The hourly year

In BimCraft, press **Use the year in the EnergyPlus check** to fetch the station's year (an .epw file of about 1.5 MB) and hand it to the **Check with EnergyPlus** pane for a year's run. In every app, press **Save the .epw file** to keep it on your computer.

## Explore the year

Press **Explore the year** to open the station's 8,760 hours as a chart that fills the window.

- **3D surface** draws the chosen quantity as a surface: the days of the year one way, the hours of the day the other, the value as height and colour. Drag to turn it, drag with Shift to slide it, roll the wheel to move nearer. Keys 1 to 5 give five views: perspective, parallel, from above, along the year and along the day.
- **Quantity** lists every hourly column the file carries (temperatures, humidity, pressure, sun, daylight, wind, sky cover, visibility, rain and more) and five worked out from them: wet-bulb temperature, humidity ratio, enthalpy, dew-point depression and the height of the sun. **Previous** and **Next**, or the M key, step through them.
- **Cuts** slice the surface at a date, a time of day and a value. Click the surface to put the date and time cuts there, or drag a cut by its line. Alt+drag moves the value cut. The buttons jump to the solstices and equinoxes and to dawn, sunrise, solar noon, sunset and dusk. **Cut at a value** shows where the quantity is at or above a level, and the foot of the window counts those hours. **Show as a cut block** removes the part in front of the cuts.
- **Rolling average** smooths each hour over the days before and after it, up to 45 days each way.
- **Scale and colours** sets the scale by hand or fits it to the data, with six colour scales, colour steps, contour lines and the sunrise and sunset lines.
- **Motion** runs a cut through the year, the day or the values.
- **Flat map**, **Year and day**, **Wind rose**, **Hours at each value** and **By month** show the same year as a map with contour lines, two profiles, a wind rose for the year, a month, or daylight or night hours, a histogram and a monthly table.
- **Psychrometric chart** plots the hours by dry-bulb temperature and humidity ratio, under the saturation curve and the relative humidity curves, coloured by how many hours fall in each cell or by the chosen quantity. **Show a comfort range** draws a range of air temperature and relative humidity that you set, and counts the hours inside it; **By month** lists that count for each month. It is a plain range, not a comfort standard.
- **Sun path** draws where the sun stands in each daylight hour of the year, coloured by the chosen quantity, with the path of the cut date and the sun at the cut time.
- **Two stations** shows a second station under the first on the same scale, and the difference between them. Choose it under **Compare with**, or Shift+click it on the Stations map.
- **Stations** is a map of every station in the weather sets. Click one to open its year.
- **Units** switches between metric and US customary.
- **Save** keeps the chart as a picture (.png), the chart's numbers (.csv) or every hour of every quantity (.csv). **Settings** saves, loads or copies the whole view, or keeps it as your default.

- **Change the file** multiplies or shifts the chosen quantity for every hour, for example 2 K warmer or 10 % less sun, and **Save the changed .epw** writes a new weather file whose comment line says what was changed. Only that column changes: humidity does not follow a temperature change, and the design conditions in the file's header are not worked out again.
- **Copy a link to this view** gives an address that opens the same station, charts and settings for anyone who has switched this add-on on. Changes to the file and your own weather files are not carried by a link.

Times are the station's standard time, with no daylight saving. The keys are listed at the bottom of the viewer's left column.

## Your own weather file

Press **Open a weather file of your own (.epw)**. The file stays in this browser tab. You get the same figures and the same buttons.

## Where the figures come from

- **Design temperatures** are the station's published design conditions when the weather file carries them. When it does not, they are worked out of the single typical year, and the panel says so.
- **Degree-days** are counted from the hours of the typical year, against a base of 18.3 °C (65 °F).
- **Ground temperature** is the mean of the file's deepest ground temperatures, or the year's mean air temperature when the file has none.

## What it does not do

- It does not interpolate between stations or correct for height. It warns when the station is far away or much higher or lower than the site.
- It is not a compliance tool. An energy code may require its own weather file in software the authority has approved.
- A typical year is not a forecast and not the worst case.
