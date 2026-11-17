---
title: Kraglyn-kontroles
summary: Wat CivilCraft op elke lyn en kabel nagaan, altyd op datum: afstande, spasiëring, swaai, optrek, steunladings en dimensionering, toebehore, stutte, fondamente, ontbrekende data, verbindings, oorbelastings en spanningsverlies.
keywords: kontroles, afstand, grondafstand, hindernis, kruising, fasespasiëring, isolatorswaai, optrek, steunlading, nominale lading, dimensionering, fondasie, stut, tou, toebehore, dwarsarm, spanningsverlies, oorbelasting, ontbrekende data, ontkoppel
from: e6a0da47
---

**Kontroles** in die Kraglyne-afdeling lys elke probleem: rooi vir wat faal en amber vir waarskuwings. Klik op een om die lyn, steun, kabel of toerusting te kies waarna dit verwys; steune en spanne wat faal, word rooi omlyn op die plan terwyl die werkruimte oop is.

:::warning
'n Ontwerphulpmiddel: dit is kontroles van jou ontwerp teen jou eie reëls, nie 'n sertifisering nie.
:::

## Afstande

Die geleier se laagste fase word langs elke span gevolg by elke lasgeval. Die laagste afstand daarvan bo die grond moet die lyn se **Afstandreël** bereik. Waar 'n span 'n **hindernis** kruis (geteken met {{ui:Hindernis}}: 'n punt of 'n lyn, met sy hoogte bo die grond en sy eie afstandreël), word die afstand bo die hindernis se bokant op dieselfde manier nagegaan.

**Wat die Landskapwerkruimte bo die grond plaas, tel ook.** Enkele plante (hul kroon by volwasse breedte en hoogte), heinings en plantbeddens (die hoogste spesies daarin) en mure (hul bokant) is hindernisse onder 'n lyn, sonder dat dit weer geteken word. Hulle hou die reëls wat in {{ui:Lasgevalle en perke…}} gestel is: **Landskapplante onder 'n lyn** (die voorbeeldstelle gebruik *Bome en plante*, 3 m) en **Landskapmure onder 'n lyn** (*Gebou*); kies **Nie nagegaan nie** om hulle uit te laat. Die afstand word reguit op gemeet vanaf die bokant van die plant of muur tot by die geleier waar die span dit kruis; die sydelingse afstand na 'n kroon langs die lyn word nie nagegaan nie. Die skuif van 'n boom of die verhoging van 'n muur verander die kontroles dadelik.

Jou afstandreëls is jou eie: maak hulle oop met **Reëls…** langs enige **Afstandreël** (of {{ui:Lasgevalle en perke…}}) om by te voeg, te hernoem, te verander of te verwyder.

## Spasiëring en swaai

- **Fasespasiëring** benodig: k·√(deurhang + isolatorlengte) + U/150, met die warm geval se deurhang en die spanning U in kV (’n algemene vorm; k is van jou reëlstel). Vergelyk met die dwarsarm se fasespasiëring.
- **Isolatorswaai** op hangsteune, onder die windgeval: atan(dwars lading ÷ vertikale lading), teen die reëlstel se grootste swaai.
- **Optrek**: 'n hangsteun laer as sy bure kan in die koue opgetrek word; dit word gemerk.

## Steunladings en dimensionering

Vir elke steun en lasgeval, met elke geleier van die lyn:

- **Dwars**: wind per meter × die windspan (helfte van die twee spanne), plus 2·H·sin(draai ÷ 2) by 'n draai.
- **Langs die lyn**: die verskil van die twee kante se spannings by 'n eindpunt of hoek; by 'n hangsteun slegs onder ys aan een kant (elke span op sy eie gewerk, wat aan die veilige kant is).
- **Vertikaal**: die vertikale lading per meter × die gewigspan (tussen die laagste punte aan albei kante) plus die toerusting.

Die horisontale lading word na die steun se nominale punt geneem (ekwivalente lading = lading × aanhegtinghoogte ÷ hoogte van die nominale punt) en vergelyk met sy **nominale lading** × die reëlstel se faktor. Wanneer dit te swak is, word die kleinste steun van dieselfde materiaal in jou biblioteek wat dit dra, voorgestel. 'n Steun met 'n **stut** gee die horisontale lading aan die stut oor, wat lading ÷ sin(stuthoek) dra en teen sy eie gegradeerde lading nagegaan word.

Toebehore (klampe, isolators, dwarsarms) word teen hul gegradeerde lading nagegaan: 'n verankerende toebehoor dra die geleier se spanning, 'n hangtoebehoor sy aandeel van die vertikale en dwars lading. Die **fondasie** wat getoon word, is die steun se diepte in die grond en 'n gat net bietjie wyer as sy voet.

## Data, verbindings en stroom

- 'n Item met 'n benodigde veld leeg, of 'n sleutel wat nie in die biblioteek is nie.
- 'n Kabelroete-einde, of toerusting, wat met niks verbind is nie.
- **Spanningsverlies** en **stroom** vanaf elke bron (toerusting gemerk as bron) na die laste (kW en kragfaktor op toerusting), langs bogrondse spanne en kabels: √3·I·L·(R cos φ + X sin φ), met R by 20 °C. Meer as die kabel se stroomgraderig, of meer verlies as die reëlstel toelaat, word gemerk.
