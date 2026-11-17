---
title: Vertikalus planavimas kraštovaizdžiui
summary: Aikštelės, pylimėliai, grioveliai ir laisvo planavimo zonos su taškiniais aukščiais ir horizontalėmis, kurias tempiate; iškasa ir pylimas atnaujinami iš karto; nuolydžių analizė, tėkmės rodyklės ir stovintis vanduo – viskas įtraukta į CivilCraft projektinį paviršių.
keywords: atraminė siena, atraminės sienos, vertikalus šonas, siena vietoj nuolydžio, šono nuolydis, nuolydis kiekvienam šonui, pylimas, planavimas, kraštovaizdžio planavimas, terasa, pylimėlis, kauburys, griovelis, taškinis aukštis, taškinis lygis, horizontalės, redaguoti horizontales, iškasa ir pylimas, žemės darbai, nuolydžių analizė, prieinamumas, statūs nuolydžiai, tėkmės rodyklės, drenažas, stovintis vanduo, balos
from: e1559eb9
---

Viskas čia suplanuota į **projektinį paviršių** tuo pačiu planavimu, kaip aikštelės ir koridoriai. **Esamas gruntas** niekada nekeičiamas, o Žemės darbai jį visą įskaito. Planavimo meniu yra grupėje Kraštovaizdis.

## Aikštelės

{{ui:Planiravimas}} › {{ui:Platforma}}, tada spustelėkite kampus ir paspauskite {{key:Enter}}. Platforma pradedama nuo vidutinio grunto aukščio po ja; įveskite **Aukštį**, kad jį nustatytumėte, arba jį išvalykite, kad vėl sektų gruntą. **Nuolydis** procentais ir **Nuolydžio kryptis** laipsniais (0 = rytai, 90 = šiaurė) ją pasvirina. Jos šonai suplanuojami iki grunto pagal **Iškasos nuolydį** ir **Pylimo nuolydį** (horizontaliai iki 1).

## Šonų nuolydžiai ir atraminės sienos

Skiltyje **Šonai ir atraminės sienos** aikštelės, platformos ar pylimėlio savybėse kiekvienas šonas gali būti suplanuotas savaip. 1 šonas eina nuo pirmojo spustelėto kampo iki antrojo, 2 šonas – nuo antrojo iki trečiojo, ir taip toliau.

- **Visi šonai**: **Nuolaidus** naudoja aukščiau nurodytus iškasos ir pylimo nuolydžius visuose šonuose; **Vertikalūs: atraminės sienos** deda sieną kiekviename šone.
- Kiekvienam šonui: **Nuolydžiai kaip aukščiau**, **Savi nuolydžiai** (įveskite iškasos ir pylimo nuolydį tam šonui) arba **Vertikalus (atraminė siena)**.
- Nuolydį įveskite kaip `3` arba `3:1` (horizontaliai iki 1 vertikaliai), `33%` arba `18.4°`; jis rodomas kaip H:1. Aikštelės **Iškasos nuolydis** ir **Pylimo nuolydis** priima tą patį.
- Vertikalus šonas neturi nuolaidos: atraminė siena eina palei kraštą, nuo aikštelės žemyn iki esamo grunto (pylime) arba nuo grunto žemyn iki aikštelės (iškasoje). **Sienos storis** (iš pradžių 0.3 m arba 1 ft) yra tiek, kiek gruntas nutolsta nuo aikštelės krašto iki esamo grunto. Iškasos ir pylimo tūriuose neįskaitoma nuolaida, kurios tas šonas nebeturi.
- Ten, kur siena susitinka su nuolydžio šonu, nuolydis apsisuka aplink sienos galą; dvi sienos susijungia įstrižai.
- Laukeliuose po jais: sienų ilgis, matomas paviršius (aukštis × ilgis), aukščiausias ir vidutinis aukštis.

Plane kiekvienos sienos išorinis veidas nubraižomas trumpomis žymėmis per jį, o aukštis – abiejuose galuose ir aukščiausiame taške (atraminių sienų sluoksnyje, kuris taip pat patenka į DXF ir DWG). 3D rodinys rodo sienas kaip kietus kūnus (**Rodyti** › Atraminės sienos), o GLB, OBJ ir USD eksportai jas įtraukia. Pjūviai per kraštą rodo pakopą.

**Įspėjimai** (Savybėse ir Problemų skydelyje): siena, aukštesnė nei **Įspėti, kai sienos aukštis viršija** (iš pradžių 1.0 m arba 3.3 ft), – "gali reikėti inžinerinės sienos ar leidimo; patikrinkite vietos taisykles"; ir, kai įvedate **Didžiausią nuolydį, kurį laiko gruntas**, bet kuris šonas, kurio iškasos ar pylimo nuolydis yra statesnis nei tas. Tai įspėjimai: planavimas vis tiek sukuriamas. Kiekvienas pakeitimas yra vienas žingsnis {{key:Mod+Z}}.

## Pylimėliai

{{ui:Planiravimas}} › {{ui:Pylimėlis}}: kauburys, kurio viršus yra jo **Aukštis** virš vidutinio grunto po juo, o šonai suplanuoti iki grunto.

## Grioveliai

{{ui:Planiravimas}} › {{ui:Griovelis}}, tada spustelėkite palei griovelį **taip, kaip teka vanduo**, ir paspauskite {{key:Enter}}. Nustatykite jo **Gylį**, **Dugno plotį** (0 – V formos) ir **Šono nuolydį**. Be **Nuolydžio**, jo dugnas seka gruntą, gylis yra žemiau jo ir niekada nekyla aukštyn; įveskite nuolydį, kad jis turėtų vienodą nuolydį nuo savo pradžios.

## Taškiniai aukščiai ir horizontalės

1. {{ui:Planiravimas}} › {{ui:Vertikalaus planavimo zona}}: spustelėkite formuojamos zonos kontūrą.
2. {{ui:Planiravimas}} › {{ui:Taško aukštis}}: spustelėkite zonos viduje. Įveskite jo aukštį Savybėse arba naudokite ▲ ▼ mygtukus.
3. {{ui:Planiravimas}} › {{ui:Redaguoti horizontalę}}: spustelėkite horizontalę zonos viduje, kad paimtumėte ją kaip liniją, kurią galima pertvarkyti.

Pažymėkite tašką ar horizontalę ir **vilkite** ją (arba jos taškus) plane: paviršius seka, kai atleidžiate, kaip vienas anuliavimo žingsnis. Zonos viduje gruntas perkuriamas nuo jos krašto (kur jis susitinka su esamu gruntu), taškinių aukščių ir redaguotų horizontalių.

## Iškasa ir pylimas tiesiogiai

Kiekvieno planavimo objekto Savybėse rodoma jo **Iškasa** ir **Pylimas**, taip pat visos vietovės, pagal tinklelio metodą, kurį naudoja Žemės darbai, kai keičiate. Problemos (nukrypimas nuo paviršiaus, kontūras, kertantis pats save) išvardijamos ten.

## Planavimo patikros

Kairiajame skydelyje esančioje skiltyje **Planavimo patikros**:

- **Nuolydžių analizė** nuspalvina paviršių pagal nuolydį: iki švelnios ribos, tarp jų ir statesnis nei statumo riba (iš pradžių 5 % ir 33.3 % – įprastai 1:20 prieinamiems maršrutams ir 1:3 šienavimui). Legenda nurodo, kiek ploto patenka į kiekvieną. Statūs plotai atspausdinami ir ant brėžinių.
- **Tėkmės rodyklės ir stovintis vanduo** parodo, kuria kryptimi teka vanduo, ir apibrėžia kiekvieną vietą, kur jis stovėtų, su gyliu; skyrius nurodo, kiek tokių vietų, kuri giliausia ir kiek vandens jose susikaupia.

Patikros skaito projektinį paviršių, kai kas nors suplanuota, o kitu atveju – esamą gruntą.
