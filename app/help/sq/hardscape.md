---
title: Shtrimi, muret dhe shkallët
summary: Shtrim me pjerrësi drejt një kulluesi ose pjerrësi tërthore, një model dhe strukturën e tij; shtigje që ndjekin terrenin; muret mbajtëse dhe të pavarura me themele shkallëzuese; bordurat; rampat dhe shkallët të kontrolluara sipas kufijve të tyre; IFC jashtë.
keywords: elemente të ngurta, shtrim, pllaka, shesh, teraca, pjerrësi, kullues, pjerrësi tërthore, kockë peshku, lidhje e shtrirë, shteg, rrugë këmbësore, mur mbajtës, mur kopshti, themel, mbulesë muri, bordurë, kufizim, rampë, qasshmëri, shkallë, hapa, ngritje, shkelje, platformë pushimi
from: d34b4466
---

Elementët e ngurta llogariten përsëri nga terreni çdo herë, kështu ndjekin terrenin dhe rillogariten kur terreni ose vija e tij lëviz. Zvarrit kthesat e tij në plan si çdo vijë. Hape nga {{ui:Elemente të ngurta}} në grupin Peizazh.

## Shtrimi

Kliko kthesat dhe shtyp {{key:Enter}}. Te Vetitë:

- **Kota**: bosh = mesatarja e terrenit nën të.
- **Pjerrësitë**: horizontale, një **pjerrësi tërthore** (një % drejt një drejtimi) ose **drejt një kulluesi**: CivilCraft të kërkon të klikosh ku shkon kulluesi, pastaj çdo kënd ngrihet nga kulluesi me pjerrësinë. Shigjetat në plan tregojnë pjerrësitë.
- **Modeli** (rrjetë, lidhje e shtrirë, kockë peshku) me përmasën e njësisë, fugën dhe këndin; gjerësia e **Kufizimit**. Në një fletë, fugat më të afërta se një milimetër lihen jashtë.
- Shtrimi është pjesë e sipërfaqes së propozuar. Shtresat e tij (pllakat, shtrati, baza) hyjnë në IFC dhe në sasi.

## Shtigjet

Kliko përgjatë shtegut dhe shtyp {{key:Enter}}. Ai ndjek terrenin, me **Pjerrësinë tërthore** nga ana e djathtë. Një shteg më i pjerrët se **Pjerrësia më e madhe e lejuar** shënohet me `!` në plan aty ku është, dhe Vetitë thonë sa i pjerrët bëhet.

Aty ku një shteg takon një rrugë të ndërtuar nga një koridor, ai ndalon te skaji i jashtëm i rrugës, në nivelin e trotuarit ose bankinës aty, në sipërfaqen e propozuar dhe në pamjen 3D. Një shteg që kryqëzon një rrugë nivelohet dhe shfaqet si dy pjesë, dhe një fund i vizatuar deri në dyfishin e gjerësisë së shtegut më shkurt se rruga vazhdon deri te skaji i saj. Plani ende tregon shtegun ashtu si e vizatove, dhe gjatësia dhe sipërfaqja e tij llogarisin gjithë vijën. Shih [Shtrirja e një koridori rrugor](topic:corridor).

## Muret

Kliko përgjatë murit dhe shtyp {{key:Enter}}. Një mur është **mbajtës** ose **i pavarur**. Pa **Majë**, ai qëndron mbi terren me **Lartësinë** e vet përgjatë gjithë gjatësisë; shkruaj një majë për ta mbajtur nivelin. **Themeli** i tij ndodhet në një thellësi të caktuar nën terren dhe zbret me hapa të plotë, kështu mbetet horizontal midis tyre. Vetitë japin gjatësinë, lartësitë, sipërfaqen e faqes dhe hapat e themelit; plani shënon majën dhe bazën e murit (TW / BW) në çdo skaj.

:::warning
Një mur mbajtës më i lartë se 1.2 m (4 ft) shënohet: e projekton një inxhinier.
:::

## Bordurat

Kliko përgjatë bordurës dhe shtyp {{key:Enter}}; vendos gjerësinë dhe lartësinë mbi rrugë.

## Rampat

Kliko nga fundi deri në majë dhe shtyp {{key:Enter}}. Nivelet vijnë nga terreni në çdo skaj, përveç nëse i shkruan. Një rampë merr një platformë pushimi çdo ngritje prej 750 mm (2.5 ft) dhe kontrollohet sipas **Pjerrësisë më të madhe të lejuar** (1:12 në fillim) dhe një gjerësie minimale; Vetitë thonë sa gjatë duhet të jetë.

## Shkallët

Kliko skajin e përparmë të shkallës së poshtme, pastaj aty ku shkallët arrijnë majën, dhe shtyp {{key:Enter}}. Numri i ngritjeve del nga lartësia dhe **Ngritja më e madhe**; hapësira e shkelisë nga rregulli i rehatisë 2R + G ≈ 630 mm, kurrë nën **Hapësirën më të vogël**; një platformë pushimi çdo **Ngritje për fluturim, më së shumti**. Vetitë thonë nëse ato futen mes dy pikave ose sa më gjatë kanë nevojë.

:::note
Kufijtë për rampat dhe shkallët janë vlera fillestare të shënuara. Vendos ato që kërkon kodi juaj i ndërtimit.
:::

## Jashtë CivilCraft

- Më shumë › {{ui:Eksporto IFC të peizazhit}}: shtrimi dhe shtigjet si `IfcPavement`, muret si `IfcWall` (muret mbajtës si RETAININGWALL) me shtresat e tyre, bordurat si `IfcKerb`, rampat si `IfcRamp`, shkallët si `IfcStair` me ngritjet dhe pllakat e tyre.
- **Dërgo te TakeoffCraft** i tabelës së bimëve mbart sipërfaqet e shtrimit dhe vëllimet e shtresave, sipërfaqet e faqeve dhe gjatësitë e mureve, gjatësitë e bordurave dhe numrat e shkallëve.
- Fleta e detajeve vizaton prerjen e çdo muri, strukturën e çdo shtrimi dhe çdo fluturim shkallësh. Shih [Fletët e peizazhit](topic:landscape-sheets).
