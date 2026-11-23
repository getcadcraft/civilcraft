Stations are ranked by great-circle distance from the model's site. Nothing is interpolated between stations: you pick one, and the panel warns when it is more than 60 km away or 300 m higher or lower than the site.

Design temperatures are the station's published design conditions when the weather file carries them (the file's design-conditions line, read by its Heating and Cooling headings). When a file carries none, they are the temperatures that one typical year stays above (or below) for 99.6 %, 99 %, 1 % and 0.4 % of its hours, and the panel says so, because one year can differ from long-term figures by a degree or two.

Degree-days are counted from the 8,760 hours of the typical year: each day's mean temperature against a base of 18.3 °C (65 °F), summed over the year. The ground temperature is the mean of the file's deepest ground temperatures, or the year's mean air temperature when the file has none.

In the year viewer, each hour is plotted as the file gives it: day of the year by hour of the day. The rolling average is the plain mean of the same hour over the chosen number of days before and after, wrapping round the end of the year. Contour lines are found by marching squares over the day-by-hour grid. The wet-bulb temperature, humidity ratio and enthalpy use the psychrometric equations of the ASHRAE Handbook of Fundamentals, with each hour's own pressure. Sunrise, sunset, the twilights and the height of the sun use the published series for the sun's declination and the equation of time, from the station's latitude, longitude and time zone.

The weather file format is the published EnergyPlus weather format. The reader refuses a file with missing hours or missing temperatures rather than filling them in.
