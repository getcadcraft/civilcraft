---
title: Veitunet og OpenStreetMap
summary: Lagnir fyrir vatn, skólp, regnvatn, gas, rafmagn og fjarskipti með efni, stærð, dýpi og eiganda; OpenStreetMap-gögn úr Overpass JSON-skrá; þverun, skurðsnið og rúmmál; þjónustulög í DWG, DXF og PDF; IFC-hluti fyrir pípur og kapla.
keywords: veitur, veitukerfi, net, osm, openstreetmap, overpass, pípa, kapall, gas, skólp, regnvatn, fjarskipti, rafmagn, vatn, brunahani, brunnur, skurður, þverun, frírými, dýpi, dwg, ifc, staðsett, lög
from: 8a85dace
---

Teiknaðu jarðlagðar veitur svæðisins sem eitt net fyrir hverja þjónustu, athugaðu hvar þær þvera hver aðra og fluttu þær út sem teikningalög og sem IFC.

## Búa til lagnir

Opnaðu **Yfirborð, Meira, Veitunet...**

- **Búa til lögn úr valinu** breytir völdu legu, eiginlínu eða pípu í lögn fyrir þá þjónustu sem þú velur. Fylltu síðan út efni, stærð (mm), dýpi (fjarlægðin að efri hluta pípu eða kapals) og eiganda í töflunni.
- **Lesa OpenStreetMap-gögn** les Overpass JSON-skrá sem þú vistaðir (fyrirspurn með `out geom;`). Verkefnið þarf fyrst hnitakerfi, því staðsetningar í OpenStreetMap eru breiddar- og lengdargráður. Leiðslur (eftir efni), jarðstrengir fyrir rafmagn og fjarskipti, brunahanar, brunnar og regnvatnsrásir eru lesin; allt annað er talið sem sleppt og það kemur fram í skilaboðunum. Loftlínur eru sleppt.
- **Bæta við OpenStreetMap-korti** bætir OpenStreetMap-korti undir grunnmyndina. Það birtist aðeins þegar kortalög af netinu eru kveikt í Stillingum.

## Athuganir og útkeyrsla

- **Þverun**: lagnir ólíkra þjónusta sem þvera hver aðra á grunnmynd eru skráðar með frírýminu á milli þeirra þar sem yfirborð landsins er til staðar; lágmarkið er vísigildi sem þú stillir, ekki tala úr staðli.
- **Skurður**: hver lögn fær skurð (stærð pípu auk frírýmis til beggja hliða, hliðarhalli, undirlag) með rúmmáli. Heildin birtist í glugganum og í CSV-skránni.
- **Teikning**: lagnir og punktar eru á þjónustulögum (til dæmis U-WATR-RUN, U-POWR-RUN), svo þau berast í PDF, DXF og DWG.
- **IFC**: lagnir fara í IFC-útflutninginn sem pípuhlutar og kapalhlutar, ásamt brunahönum, lokum og brunnum, eitt kerfi fyrir hverja þjónustu, í hnitakerfi verkefnisins.

## OpenStreetMap-gögn

OpenStreetMap-gögn eru höfundarréttarvarin af framlagsaðilum OpenStreetMap og eru leyfð samkvæmt ODbL. Heimildin er bætt við teikninguna, CSV-skrána og IFC-skrána. Ef þú deilir skrá sem inniheldur OpenStreetMap-gögn skaltu halda heimildinni og lesa skilmála leyfisins um deilingu áfram.

## Það sem er ekki gert

Lagnir eru ekki enn teiknaðar punkt fyrir punkt á grunnmyndinni með verkfæri, og þverun er ekki enn teiknuð í langsniðinu (útreikningurinn er tilbúinn). Dýpi, stærðir og frírými eru vísigildi í upphafi: notaðu tölur úr þínum eigin staðli.
