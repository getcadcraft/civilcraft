---
title: Tilvísun í tækjastikuna
summary: Sérhver hnappur á tækjastikunni í CivilCraft, hvað hann gerir, flýtilykill hans, og hvenær hann er óvirkur eða hafnar aðgerð.
keywords: tækjastika, hnappar, skipanir, verkfæri, skrá, útflutningur, yfirborð, hönnun, breyting, sýn, valmynd
from: 4c4352bc
---

Tækjastikan liggur þvert yfir efst í forritinu í sjö hópum. Sérhver hnappur sýnir ábendingu sína og flýtilykil þegar þú bendir á hann.

## Skrá

| Hnappur | Flýtilykill | Hvað hann gerir |
|---|---|---|
| {{ui:Nýtt}} | engin | Býr til autt verkefni. Spyr fyrst ef óvistaðar breytingar eru til. |
| {{ui:Opna}} | {{key:Mod+O}} | Opnar punktaskrá (CSV, TXT), LandXML eða CivilCraft-verkefni. |
| {{ui:Vista}} | {{key:Mod+S}} | Hleður niður verkefninu sem `<name>.civilcraft.json`. |

## Útflutningur

| Hnappur | Flýtilykill | Hvað hann gerir |
|---|---|---|
| {{ui:LandXML}} | engin | Hleður niður `<name>.xml`: punktum, yfirborðum, veglínum, langsniðum og pípunetinu sem LandXML 1.2. „Ekkert til að flytja út enn.“ þegar verkefnið er autt. |
| {{ui:DXF}} | engin | Hleður niður `<name>.dxf`: línuverki grunnmyndarinnar sem R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Opnar **Teikna grunnmynd í PDF**. „Ekkert til að teikna enn.“ þegar verkefnið er autt. |

## Yfirborð

| Hnappur | Flýtilykill | Hvað hann gerir |
|---|---|---|
| {{ui:Brotalína}} | {{key:B}} | Smelltu á mælipunkta í röð, {{key:Enter}} til að ljúka. Brotalínan tekur hæðir punktanna. |
| {{ui:Mörk}} | {{key:O}} | Smelltu á horn ytri marka, {{key:Enter}} til að ljúka. Kemur í stað allra marka. |

Bæði sýna „Ekkert yfirborð er enn til: opnaðu fyrst mælipunkta.“ þegar ekkert yfirborð er til.

## Hönnun

| Hnappur | Flýtilykill | Hvað hann gerir |
|---|---|---|
| {{ui:Veglína}} | {{key:A}} | Smelltu á PI-punktana í röð, {{key:Enter}} til að ljúka. |
| {{ui:Pallur}} | {{key:G}} | Smelltu á horn pallsins, {{key:Enter}} til að ljúka. Eins og yfirborðsverkfærin varar hann við þegar ekkert yfirborð er til; pallur mótast aðeins á yfirborði. |
| {{ui:Pípur}} | {{key:P}} | Smelltu á mannvirki frá uppstreymi niður (smelltu á fyrirliggjandi til að tengja það), {{key:Enter}} til að ljúka. |
| {{ui:Langsnið}} | {{key:R}} | Sýnir eða felur langsniðssýnina undir grunnmyndinni. |

## Breyting

| Hnappur | Flýtilykill | Hvað hann gerir |
|---|---|---|
| {{ui:Afturkalla}} | {{key:Mod+Z}} | Afturkallar síðustu breytingu (allt að 200). Óvirkur þegar ekkert er til að afturkalla. |
| {{ui:Endurgera}} | {{key:Mod+Y}} | Endurgerir það sem var afturkallað. Óvirkur þegar ekkert er til að endurgera. |
| {{ui:Afrita}} | {{key:Mod+C}} | Afritar valda mælipunkta og setur þá á klippiborðið sem punktaraðir sem töflureiknir taka við. Óvirkur þar til punktar eru valdir. |
| {{ui:Líma}} | {{key:Mod+V}} | Límir punkta: þeir fylgja bendlinum, og smellur setur þá niður með númerum sem enginn annar punktur hefur. Punktaraðir afritaðar í töflureikni límast líka. |
| {{ui:Meira}} | engin | Opnar valmyndina hér að neðan. |

Valmyndin {{ui:Meira}}:

| Atriði | Flýtilykill | Hvað hann gerir |
|---|---|---|
| {{ui:Klippa}} | {{key:Mod+X}} | Afritar valda punkta og eyðir þeim (eitt skref til baka). |
| {{ui:Afrita}} | {{key:Mod+C}} | Eins og {{ui:Afrita}}-hnappurinn. |
| {{ui:Líma}} | {{key:Mod+V}} | Eins og {{ui:Líma}}-hnappurinn. |
| {{ui:Líma á sama stað}} | {{key:Mod+Shift+V}} | Límir punktana á sínum eigin hnitum, með númerum sem enginn annar punktur hefur. |
| {{ui:Tvöfalda}} | {{key:Mod+D}} | Afrit af völdum punktum fylgir bendlinum; smelltu þar sem það á að fara. Klippiborðið helst óbreytt. |
| {{ui:Eyða}} | {{key:Delete}} | Eyðir völdum mælipunktum, eða völdu veglínunni, palli, mannvirki (ásamt pípum þess), pípu eða PVI. |
| {{ui:Velja alla punkta}} | {{key:Mod+A}} | Velur alla mælipunkta. |
| {{ui:Velja ekkert}} | {{key:Esc}} | Hreinsar valið. |

Atriði sem getur ekki virkað núna er óvirkt og ábendingin segir hvers vegna. Nánar: [Velja, afrita og líma mælipunkta](topic:copy-paste-points).

Afturköllun nær yfir breytingar á hönnuninni, stillingum yfirborðsins og mælipunktunum (líma, klippa, tvöfalda, eyða). Hún nær ekki yfir birtingarstillingar, og að opna eða flytja inn skrá eyðir henni.

## GIS

| Hnappur | Flýtilykill | Hvað hann gerir |
|---|---|---|
| {{ui:Hnit}} | engin | Opnar **Hnitakerfi**-gluggann: segðu hvaða kerfi verkefnið er í, eða notaðu landhnit eða staðbundin hnit. Sjá [Stilla hnitakerfi verkefnisins](topic:coordinate-systems) og [Landhnit og staðbundin hnit](topic:ground-and-local-coordinates). |
| {{ui:Flytja inn}} | engin | Flytur inn GIS-gögn: shapefile, GeoJSON, GeoPackage, hæðargrindur og LiDAR. Sjá [Flytja inn GIS-gögn](topic:gis-import). |
| {{ui:Flytja út}} | engin | Flytur út gögn eins og byggt var fyrir GIS-deild. Sjá [Flytja út eins og byggt gögn fyrir GIS](topic:gis-export). |
| {{ui:Greina}} | engin | Opnar GIS-greiningarspjaldið: jaðar, yfirlögn, rúmfræðileg tenging, val eftir eigind, mæling. Sjá [Greina GIS-lög](topic:gis-analysis). |
| {{ui:Eigindatafla}} | engin | Í Yfirborð › Meira. Opnar eigindatöflu GIS-lags: raða, sía, velja, breyta, bæta við reitum, reikna, vista sem CSV. Sjá [Vinna með eigindatöflu lags](topic:gis-table). |
| {{ui:Kort}} | engin | Opnar **Kortalög**-gluggann: landfræðilega staðsetta mynd, eða kortaþjóna sem þú bætir við, teiknaða undir grunnmyndinni. Sjá [Sýna kortalög undir grunnmyndinni](topic:map-layers). |

GIS-verkfærin hlaðast í fyrsta sinn sem þú notar einn af þessum hnöppum, opnar GIS-skrá, eða opnar verkefni sem hefur hnitakerfi eða GIS-lög.

## Sýn

| Hnappur | Flýtilykill | Hvað hann gerir |
|---|---|---|
| {{ui:Velja}} | {{key:V}} eða {{key:Esc}} | Smelltu til að velja veglínur, palla, mannvirki, pípur og punkta ({{key:Shift}} og smellur eða dráttur bætir við punktum); dragðu grip til að færa PI-punkta, horn palla og mannvirki. |
| {{ui:Passa}} | {{key:F}} | Aðdráttur á grunnmynd til að sýna yfirborðið, punkta, veglínur og palla (í 3D-sýn: sýnir allt). |
| {{ui:3D}} | {{key:D}} | Sýnir svæðið í 3D yfir grunnmyndinni, eða fer aftur á grunnmyndina. Stikan yfir 3D-sýninni stillir sýnina, ýkingu, litun og hvað sést, og flytur út GLB eða OBJ. Sjá [Skoða svæðið í 3D](topic:site-3d). |

## Hnappar í spjöldunum

| Hnappur | Staðsetning | Hvað hann gerir |
|---|---|---|
| {{ui:Opna sýnissvæðið}} | Reiturinn á auðri grunnmynd | Hleður inn sýnismælingunni (krefst tengingar, nema CivilCraft sé vistað til notkunar án nettengingar) |
| {{ui:Fjarlægja afmörkunina}} | Vinstra spjald, Yfirborð | Tekur ytri mörkin burt |
| {{ui:Fjarlægja teiknaðar brotlínur}} | Vinstra spjald, Yfirborð | Fjarlægir allar brotlínur sem teiknaðar eru með verkfærinu (ekki brotlínuhópana) |
| {{ui:Byggja yfirborðið upp aftur úr punktunum}} | Vinstra spjald, Yfirborð (aðeins LandXML-yfirborð) | Fleygir LandXML TIN og byggir upp úr punktunum; ekki hægt að afturkalla |
| {{ui:Byrja á landinu}} | Hægra spjald, Veglína | Byrjar hönnunarlengdarsnið með PVI á landinu í hvorum enda |
| {{ui:Sýn langsniðs}} | Hægra spjald, Veglína | Opnar langsniðssýnina fyrir þessa veglínu |
| {{ui:Bæta við PVI}} | Sniðstikan | Meðan hún er niðurtekin, bætir smellur í sniðinu við PVI |
| {{ui:Setja alla botnkóta eftir reglunum}} | Hægra spjald, Pípunet | Setur botnkóta allra pípa eftir reglunum |
| {{ui:Setja botnkóta hennar eftir reglunum}} | Hægra spjald, Pípa | Setur botnkóta þessarar pípu eftir reglunum |
