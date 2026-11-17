---
title: Grindinys, sienos ir laiptai
summary: Grindinys su nuolydžiais į nuvedimo šulinį arba skersiniu nuolydžiu, raštas ir jo sluoksnių sandara; takai, sekantys gruntą; atraminės ir laisvai stovinčios sienos su laipsniuotais pamatais; bordiūrai; nuokalnės ir laiptai, patikrinti pagal ribas; IFC eksportas.
keywords: kietoji danga, grindinys, plytelės, terasa, nuolydžiai, nuvedimo šulinys, skersinis nuolydis, eglutės raštas, gulsčias raštas, takas, pėsčiųjų takas, atraminė siena, sodo siena, pamatas, viršutinė danga, bordiūras, apvada, nuokalnė, prieinamumas, laiptai, pakopos, pakopų paviršiai, laiptų aikštelė
from: 51475877
---

Kietoji danga apskaičiuojama iš naujo iš grunto kiekvieną kartą, todėl ji seka reljefą ir atsinaujina, kai keičiasi gruntas ar jo linija. Vilkite jos kampus plane kaip bet kurią liniją. Atidarykite ją iš {{ui:Kietosios dangos}} grupėje Kraštovaizdis.

## Grindinys

Spustelėkite kampus ir paspauskite {{key:Enter}}. Savybėse:

- **Lygis**: tuščias = grunto vidurkis po juo.
- **Nuolydžiai**: lygis, **skersinis nuolydis** (procentai į tam tikrą kryptį) arba **į nuvedimo šulinį**: CivilCraft paprašo spustelėti, kur yra nuvedimo šulinys, ir tada kiekvienas kampas kyla nuo šulinio nustatytu nuolydžiu. Plane rodyklės rodo nuolydžius.
- **Raštas** (tinklelis, gulsčias raštas, eglutės raštas) su vieneto dydžiu, siūle ir kampu; **Apvada** plotis. Lape siūlės, siauresnės nei milimetras, praleidžiamos.
- Grindinys yra projektinio paviršiaus dalis. Jo sluoksniai (plytelės, lovis, pagrindas) patenka į IFC ir kiekius.

## Takai

Spustelėkite palei taką ir paspauskite {{key:Enter}}. Jis seka gruntą, su savo **skersiniu nuolydžiu** į dešinę pusę. Takas, statesnis nei **Didžiausias leistinas nuolydis**, plane pažymimas `!` ten, kur jis yra, o Savybėse nurodoma, koks jis stačiausias.

## Sienos

Spustelėkite palei sieną ir paspauskite {{key:Enter}}. Siena būna **atraminė** arba **laisvai stovinti**. Be **Viršaus**, ji stovi savo **Aukščio** aukštyje virš grunto visoje ilgyje; įveskite viršų, kad ją išlaikytumėte lygiai. Jos **pamatas** yra nustatytu gyliu žemiau grunto ir laipsniais leidžiasi žemyn sveikais žingsniais, todėl tarp jų lieka lygus. Savybėse nurodomas sienos ilgis, aukščiai, veido plotas ir pamato žingsniai; plane prie kiekvieno galo žymimas sienos viršus ir apačia (TW / BW).

:::warning
Atraminė siena, aukštesnė nei 1,2 m (4 ft), pažymima: ją projektuoja inžinierius.
:::

## Bordiūrai

Spustelėkite palei bordiūrą ir paspauskite {{key:Enter}}; nustatykite jo plotį ir iškylos aukštį.

## Nuokalnės

Spustelėkite nuo apačios iki viršaus ir paspauskite {{key:Enter}}. Lygiai imami iš grunto kiekviename gale, nebent įvesite juos patys. Nuokalnė gauna aikštelę kas 750 mm (2.5 ft) pakilimo ir tikrinama pagal **Didžiausią leistiną nuolydį** (iš pradžių 1:12) bei mažiausią plotį; Savybėse nurodoma, kokio ilgio ji turėtų būti.

## Laiptai

Spustelėkite apatinės pakopos priekinį kraštą, tada vietą, kur laiptai pasiekia viršų, ir paspauskite {{key:Enter}}. Pakopų skaičius priklauso nuo aukščio ir **Didžiausio pakopos aukščio**; ėjimo plotis – pagal komforto taisyklę 2R + G ≈ 630 mm, bet niekada ne mažesnis nei **Mažiausias ėjimo plotis**; aikštelė kas **Daugiausia pakopų atkarpoje**. Savybėse nurodoma, ar jie telpa tarp dviejų taškų, ar kiek ilgesni jiems reikia.

:::note
Nuokalnių ir laiptų ribos yra pažymėtos kaip numatytosios reikšmės. Nustatykite tas, kurių reikalauja jūsų statybos reglamentas.
:::

## Iš CivilCraft

- Daugiau › {{ui:Eksportuoti kraštovaizdžio IFC}}: grindinys ir takai kaip `IfcPavement`, sienos kaip `IfcWall` (atraminės sienos kaip RETAININGWALL) su savo sluoksniais, bordiūrai kaip `IfcKerb`, nuokalnės kaip `IfcRamp`, laiptai kaip `IfcStair` su savo pakopų aukščiais ir paviršiais.
- Augalų žiniaraščio **Siųsti į TakeoffCraft** perduoda grindinio plotus ir sluoksnių tūrius, sienų veido plotus ir ilgius, bordiūrų ilgius bei laiptų pakopų skaičių.
- Detalių lape braižomas kiekvienos sienos pjūvis, kiekvieno grindinio konstrukcija ir kiekviena laiptų atkarpa. Žr. [Kraštovaizdžio lapai](topic:landscape-sheets).
