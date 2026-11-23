---
title: Dangos, sienos ir laiptai
summary: Danga su nuolydžiais į nuvedimo angą arba skersiniu nuolydžiu, raštas ir konstrukcija; takai, sekantys gruntą; laikančiosios ir atskiros sienos su laipsniuotais pamatais; bordiūrai; nuokalnės ir laiptai, tikrinami pagal ribas; IFC eksportas.
keywords: kietoji danga, grindinys, plytelės, terasa, nuolydžiai, nuvedimo anga, skersinis nuolydis, žuvikaulis, gulsčioji klotinė, takas, pėsčiųjų takas, laikančioji siena, sodo siena, pamatas, viršutinė danga, bordiūras, apvadas, nuokalnė, prieinamumas, laiptai, pakopos, žingsniai, aikštelė
from: d34b4466
---

Kietoji danga kiekvieną kartą skaičiuojama iš naujo pagal gruntą, todėl ji seka reljefą ir atsinaujina, kai keičiasi gruntas ar jo linija. Tempkite jos kampus plane kaip bet kurią liniją. Atidarykite ją iš {{ui:Kietosios dangos}} Kraštovaizdžio grupėje.

## Danga

Spustelėkite kampus ir paspauskite {{key:Enter}}. Ypatybėse:

- **Lygis**: tuščias = po ja esančio grunto vidurkis.
- **Nuolydžiai**: lygūs, **skersinis nuolydis** (procentais į nurodytą kryptį) arba **į nuvedimo angą**: CivilCraft paprašys spustelėti, kur eina nuvedimo anga, tada kiekvienas kampas kyla nuo angos pagal nuolydį. Plane nuolydžius rodo rodyklės.
- **Raštas** (tinklelis, gulsčioji klotinė, žuvikaulis) su vieneto dydžiu, siūle ir kampu; **Apvado** plotis. Lape siūlės, siauresnės nei milimetras, nepaliekamos.
- Danga yra projektuojamo paviršiaus dalis. Jos sluoksniai (plytelės, klojimo sluoksnis, pagrindas) patenka į IFC ir kiekius.

## Takai

Spustelėkite palei taką ir paspauskite {{key:Enter}}. Jis seka gruntą, o jo **Skersinis nuolydis** nukreiptas į dešinę pusę. Takas, statesnis nei **Didžiausias leistinas nuolydis**, plane pažymimas `!` toje vietoje, o Ypatybėse nurodoma, koks jis yra.

Kur takas susitinka su koridoriaus sukurtu keliu, jis sustoja ties kelio išoriniu kraštu, šaligatvio ar pakraščio lygyje, projektuojamame paviršiuje ir 3D rodinyje. Takas, kertantis kelią, suvedamas ir rodomas kaip dvi dalys, o galas, nubrėžtas iki dvigubo tako pločio atstumo nuo kelio, tęsiamas iki jo krašto. Plane takas rodomas toks, kokį nubrėžėte, o jo ilgis ir plotas skaičiuojami visai linijai. Žr. [Kelio koridorius išilgai trasos](topic:corridor).

## Sienos

Spustelėkite palei sieną ir paspauskite {{key:Enter}}. Siena yra **laikanti** arba **atskira**. Jei **Viršus** nenurodytas, ji visur stovi **Aukščio** atstumu virš grunto; įveskite viršų, kad siena išliktų lygi. Jos **pamatas** yra nustatytu gyliu žemiau grunto ir laipsniškai leidžiasi sveikais žingsniais, todėl tarp jų lieka lygus. Ypatybėse nurodomas sienos ilgis, aukščiai, priekinio paviršiaus plotas ir pamato žingsniai; plane kiekviename gale pažymimas sienos viršus ir apačia (TW / BW).

:::warning
Laikanti siena, aukštesnė nei 1.2 m (4 ft), pažymima: ją projektuoja inžinierius.
:::

## Bordiūrai

Spustelėkite palei bordiūrą ir paspauskite {{key:Enter}}; nustatykite jo plotį ir aukštį virš dangos.

## Nuokalnės

Spustelėkite iš apačios į viršų ir paspauskite {{key:Enter}}. Lygiai imami iš grunto kiekviename gale, nebent įvesite juos patys. Nuokalnė gauna aikštelę kas 750 mm (2.5 ft) pakilimo ir tikrinama pagal **Didžiausią leistiną nuolydį** (pradžioje 1:12) bei mažiausią plotį; Ypatybėse nurodoma, koks ilgis jai reikėtų.

## Laiptai

Spustelėkite apatinio laiptelio priekinį kraštą, tada vietą, kur laiptai pasiekia viršų, ir paspauskite {{key:Enter}}. Pakopų skaičius priklauso nuo aukščio ir **Didžiausio pakopos aukščio**; žingsnio gylis – pagal patogumo taisyklę 2R + G ≈ 630 mm, bet ne mažesnis nei **Mažiausias žingsnio gylis**; aikštelė kas **Daugiausia pakopų vienoje atkarpoje**. Ypatybėse nurodoma, ar laiptai telpa tarp dviejų taškų, ar kiek ilgesnių jiems reikia.

:::note
Nuokalnių ir laiptų ribos pažymėtos kaip numatytosios reikšmės. Nustatykite tas, kurių reikalauja jūsų statybos reglamentas.
:::

## Iš CivilCraft į kitas programas

- Daugiau › {{ui:Eksportuoti kraštovaizdžio IFC}}: danga ir takai kaip `IfcPavement`, sienos kaip `IfcWall` (laikančios sienos kaip RETAININGWALL) su savo sluoksniais, bordiūrai kaip `IfcKerb`, nuokalnės kaip `IfcRamp`, laiptai kaip `IfcStair` su pakopomis ir žingsniais.
- Augalų žiniaraščio **Siųsti į TakeoffCraft** perduoda dangos plotus ir sluoksnių tūrius, sienų priekinių paviršių plotus ir ilgius, bordiūrų ilgius bei laiptų skaičių.
- Detalių lape braižomas kiekvienos sienos pjūvis, kiekvienos dangos konstrukcija ir kiekvienas laiptų ruožas. Žr. [Kraštovaizdžio lapai](topic:landscape-sheets).
