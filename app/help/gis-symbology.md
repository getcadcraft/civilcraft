---
title: Style a layer by an attribute
summary: Colour the features of a GIS layer by the values of a field (one colour per value, or by number ranges), size points by a number, tint polygons and show a legend on the plan.
section: tasks
order: 144
keywords: symbology, style, colour, color, categorized, graduated, unique values, equal interval, quantile, natural breaks, jenks, ramp, colour blind, legend, size, points, choropleth, classes, gis
---

Open a layer's **three dots** menu in the GIS layers list and choose {{ui:Style by attribute…}}.

## Three styles

- **Single symbol:** the layer colour, as before.
- **Categorized:** one colour per distinct value of any field. Up to eight values get the eight Okabe-Ito colours (chosen to stay apart for the common kinds of colour blindness); with more values the seven most common get a colour each and the rest share a grey **Other** class. Features with no value are grey.
- **Graduated:** a number field is cut into 2 to 9 ranges, each with a colour from a ramp. A value on a break goes into the lower range.

## How the ranges are cut

| Method | Breaks |
|---|---|
| Equal interval | The range from the smallest to the largest value split into equal widths. Values 0 to 30 in three ranges: 0, 10, 20, 30. |
| Quantile | About the same number of features in each range. The breaks are read from the sorted values with the usual straight-line interpolation: for 1 to 10 in two ranges the break is 5.5. |
| Natural breaks (Jenks) | The cuts that leave the least spread inside each range, so clumps of similar values stay together. On more than 1,500 values it works on 1,500 evenly spaced ones and says so. |

## Colours

Viridis and Cividis run from dark to light with a steady change in lightness, so the order of the ranges can be read even in grey or with colour blindness. Blues is light to dark. Red to blue is a two-way ramp for values around a middle. **Reverse the colours** flips any of them. The dialog lists the ranges and the number of features in each before you apply it.

## Size, fill and legend

- **Point size by** a number field makes each point's square larger the larger the value, between the two sizes you give (half the side, in millimetres on paper).
- **Tint the inside of polygons** fills each polygon in its class colour (holes stay empty). The tint is on screen; plots and DXF/DWG show the coloured outlines.
- **Show a legend on the plan** draws the classes, their counts and the size range in the lower left of the plan. The legend is on screen; it is not in a plot.
- To label features with a field, use **Label with** in the same menu.

The style is saved in the project file. A build that does not know about styles opens the file with the layer colour. Plots, DXF and DWG carry the classes as separate layers named after the layer and the class, in the nearest of the nine basic CAD colours. A layer of more than 200,000 features is drawn in one colour.
