---
title: Shtrimi, muret dhe shkallët
summary: Shtrim me pjerrësi drejt një kanali ose pjerrësi tërthore, një model dhe ndërtimi i tij; shtigje që ndjekin terrenin; mure mbajtëse dhe të lira me themele shkallëzuar; bordura; rampa dhe shkallë të kontrolluara sipas kufijve të tyre; eksport IFC.
keywords: elemente të ngurta, shtrim, pllaka shtrimi, shesh, teracë, pjerrësi, kanal, pjerrësi tërthore, spinë peshku, lidhje shtrirëse, shteg, rrugë këmbësore, mur mbajtës, mur kopshti, themel, kurorë, bordurë, skajizim, rampë, qasshmëri, shkallë, hapa, pllajë
from: 51475877
---

Elementet e ngurta llogariten sërish nga terreni sa herë, kështu që ndjekin terrenin dhe rigjenerohen kur terreni ose vija e tij lëviz. Tërhiq këndet e tyre në plan si çdo vijë. Hapi nga {{ui:Elemente të ngurta}} në grupin Peizazh.

## Shtrimi

Kliko këndet dhe shtyp {{key:Enter}}. Te **Vetitë**:

- **Kota**: bosh = mesatarja e terrenit nën të.
- **Pjerrësia**: nivel, një **pjerrësi tërthore** (% drejt një drejtimi) ose **drejt një kanali**: CivilCraft të kërkon të klikosh ku shkon kanali, pastaj çdo cep ngrihet nga kanali me pjerrësinë. Shigjetat në plan tregojnë pjerrësitë.
- **Modeli** (rrjetë, lidhje shtrirëse, spinë peshku) me madhësinë e njësisë, nyjen dhe këndin; gjerësia e **Skajizimit**. Në një fletë, nyjet më të afërta se një milimetër lihen jashtë.
- Shtrimi është pjesë e sipërfaqes së propozuar. Shtresat e tij (pllakat, shtrati, baza) hyjnë në IFC dhe në sasi.

## Shtigjet

Kliko përgjatë shtegut dhe shtyp {{key:Enter}}. Ai ndjek terrenin, me **Pjerrësinë tërthore** të tij në anën e djathtë. Një shteg më i pjerrët se **Pjerrësia më e lejuar** shënohet me `!` në plan aty ku është, dhe Vetitë tregojnë sa pjerrët bëhet.

## Muret

Kliko përgjatë murit dhe shtyp {{key:Enter}}. Muri është **mbajtës** ose **i lirë**. Pa **Majë**, ai qëndron **Lartësinë** e tij mbi terren gjatë gjithë rrugës; shkruaj një majë për ta mbajtur të niveluar. **Themeli** i tij ndodhet një thellësi të caktuar nën terren dhe zbret me hapa të plotë, kështu që mbetet i nivelët midis tyre. Vetitë japin gjatësinë, lartësitë, sipërfaqen e fasadës dhe hapat e themelit; plani shënon majën dhe bazën e murit (TW / BW) në çdo skaj.

:::warning
Një mur mbajtës më i lartë se 1.2 m (4 ft) shënohet: një inxhinier e projekton.
:::

## Bordurat

Kliko përgjatë bordurës dhe shtyp {{key:Enter}}; cakto gjerësinë dhe lartësinë e saj mbi nivel.

## Rampat

Kliko nga fundi deri në majë dhe shtyp {{key:Enter}}. Kotat vijnë nga terreni në çdo skaj, përveç nëse i shkruan vetë. Një rampë merr një pllajë çdo ngritje 750 mm (2.5 ft) dhe kontrollohet sipas **Pjerrësisë më të lejuar** (1:12 si fillim) dhe një gjerësie minimale; Vetitë thonë sa e gjatë duhet të jetë.

## Shkallët

Kliko përballë skajit të hapit të poshtëm, pastaj aty ku shkallët arrijnë majën, dhe shtyp {{key:Enter}}. Numri i ngritjeve vjen nga lartësia dhe **Ngritja më e madhe**; hapësira nga rregulli i rehatisë 2R + G ≈ 630 mm, kurrë nën **Hapësirën më të vogël**; një pllajë çdo **Ngritje për volé, më së shumti**. Vetitë thonë nëse ato futen midis dy pikave ose sa më të gjata duhen.

:::note
Kufijtë për rampat dhe shkallët janë parazgjedhje të etiketuara. Vendos ato që kërkon kodi i ndërtimit tënd.
:::

## Jashtë CivilCraft

- Më shumë › {{ui:Eksporto IFC të peizazhit}}: shtrimet dhe shtigjet si `IfcPavement`, muret si `IfcWall` (muret mbajtëse si RETAININGWALL) me shtresat e tyre, bordurat si `IfcKerb`, rampat si `IfcRamp`, shkallët si `IfcStair` me ngritjet dhe hapat e tyre.
- **Dërgo te TakeoffCraft** nga lista e bimëve mbart sipërfaqet e shtrimit dhe vëllimet e shtresave, sipërfaqet e fasadave të mureve dhe gjatësitë, gjatësitë e bordurave dhe numrat e shkallëve.
- Fleta e detajeve vizaton seksionin e çdo muri, ndërtimin e çdo shtrimi dhe çdo volé shkallësh. Shih [Fletët e peizazhit](topic:landscape-sheets).
