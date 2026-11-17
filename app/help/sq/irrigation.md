---
title: Projektimi i ujitjes
summary: Mjet llogaritjeje, jo projekt i vulosur: spërkatës, linja anësore, linja kryesore, valvula dhe linja pikuese në vend; zona të gjetura nga tubat; humbja e presionit sipas Hazen–Williams, presioni më i keq, rrjedha dhe presioni kundrejt furnizimit, shpejtësitë e reshjeve, kohët e punës, mbulimi dhe lista e materialeve.
keywords: ujitje, sprinkler, spërkatës, spërkatje, rotor, grykë rrotulluese, fshikëzues, pikim, linjë pikuese, emetues, valvul, zonë, stacion, kontrollues, linja kryesore, linja anësore, pika e lidhjes, furnizim me ujë, presion, psi, kpa, rrjedhë, gpm, humbje fërkimi, hazen williams, shpejtësia e reshjeve, kohë pune, mbulim, kokë më kokë, lista e materialeve
from: 7d6342c1
---

:::warning
Ky është mjet llogaritjeje, jo projekt i vulosur: një projektues ujitjeje kontrollon çdo rezultat përpara se të ndërtohet diçka.
:::

## Vendos sistemin

1. Te seksioni **Ujitja** në të majtë, zgjidh **Spërkatësin**, **Harkun** e tij dhe ku fillon harku, dhe madhësitë e tubave për linjat anësore dhe linjën kryesore.
2. {{ui:Ujitje}} › {{ui:Pika e lidhjes}}: kliko ku bashkohet furnizimi me ujë. Cakto **presionin** e tij, **rrjedhën e disponueshme** dhe humbjet e matësit dhe të valvulës anti-kthim te Vetitë.
3. {{ui:Ujitje}} › {{ui:Valvul}}: kliko ku shkon valvula e çdo zone. Një valvul fillon një zonë.
4. {{ui:Ujitje}} › {{ui:Spërkatës}}: kliko për të vendosur spërkatësit; çdo klikim vendos një.
5. {{ui:Ujitje}} › {{ui:Tub anësor}}: kliko nga një valvul përmes spërkatësve të tij dhe shtyp {{key:Enter}}. {{ui:Linja kryesore}}: nga pika e lidhjes te çdo valvul.

Fundet e tubave ngjiten në spërkatës, valvula, furnizim dhe fundet e tubave të tjerë, kështu që rrjeti lidhet. Një zonë është gjithçka që arrihet nga valvula e saj përmes linjave anësore; linja kryesore mbart një zonë në çdo kohë.

## Pikimi

{{ui:Ujitje}} › {{ui:Linjë pikuese}}: kliko përgjatë linjës, duke filluar aty ku ushqehet (fundi i një linje anësore ose një valvul). Cakto **rrjedhën e emetuesit** dhe **distancën** te Vetitë; rrjedha e saj është emetuesit përgjatë saj.

## Kontrolli

{{ui:Ujitje}} › {{ui:Kontrollo sistemin…}} liston çdo zonë:

| Kolona | Si llogaritet |
|---|---|
| Rrjedha | Rrjedhat e spërkatësve (dhe të linjave pikuese) të mbledhura |
| Te valvula | Presioni i punës i spërkatësit më të keq plus humbjet e tubave deri tek ai (Hazen–Williams, diametri i brendshëm i tubit, ndryshimi i lartësisë) dhe humbja përmes valvulës |
| Te furnizimi | Njëjtë plus humbja e linjës kryesore që mbart atë zonë, dhe humbja e matësit dhe e valvulës anti-kthim |
| Reshjet | Rrjedha e spërkatësve mbi sipërfaqen që ujitin në distancën kokë më kokë |
| Minuta në javë | Për të aplikuar cilësimin **Ujit në javë** |
| Problemet | Shpejtësi mbi kufirin, një spërkatës jashtë intervalit të presionit, spërkatje dhe rotorë në një valvul, presion ose rrjedhë e pamjaftueshme në furnizim, spërkatës pa zonë, unaza |

Zgjidh një valvul për të parë shifrat e zonës së saj dhe spërkatësin e saj më të keq të rrethuar në plan. Lista e materialeve numëron spërkatësit sipas llojit dhe harkut, tubat sipas madhësisë, valvulat, linjën pikuese dhe emetuesit, dhe stacionet e kontrolluesit. **Ruaj si CSV** i mban të dyja.

Cilësimet në seksionin Ujitja: **Hazen–Williams C** (150 për tub të ri plastik), **rrjedha më e shpejtë** në një tub (1.5 m/s), **humbja përmes valvulës** dhe **Ujit në javë**. Ato janë parazgjedhje të etiketuara.

## Mbulimi

{{ui:Ujitje}} › {{ui:Shfaq mbulimin}} tregon sa nga sipërfaqja mbetet e thatë nga spërkatësit, sa ujitet nga dy ose më shumë, dhe cilët spërkatës nuk arrijnë një fqinj (distanca kokë më kokë).

## Spërkatësit

Spërkatësit e listuar janë llojet **gjenerike** të shkruara nga CadCraft nga shpejtësitë e projektuara të reshjeve (spërkatje fikse, grykë rrotulluese, rotorë me ingranazhe, fshikëzues, mikro-spërkatje, emetues), jo produkte të ndonjë prodhuesi. **Shto spërkatës nga një skedar…** lexon spërkatësit e tu (një listë JSON me hedhjen, rrjedhën ose shpejtësinë e reshjeve të çdo spërkatësi dhe intervalin e presionit); ruhen me projektin. Të dhënat e publikuara të një prodhuesi futen vetëm me lejen e regjistruar të atij prodhuesi.

Nën spërkatësit gjenerikë lista ka **spërkatës tipikë** (emrat e tyre përfundojnë me "vlera tipike"): madhësi grykash të spërkatjeve fikse, grykave rrotulluese dhe rotorëve me ingranazhe, mikro-spërkatjeve, fshikëzuesve dhe emetuesve, me një rreze, një rrjedhë dhe një interval presioni. Ato llogariten nga CadCraft nga matematika e publikuar (ekuacioni i grykës për rrjedhën, shkallëzimi i hedhjes së jetit për rrezen) dhe klasa nominale rrjedhash, nga burime të hapura vetëm; asnjë tabelë prodhuesi nuk kopjohet. Zgjidh një dhe zgjedhësi tregon bazën dhe licencën e tij. Një projekt që përdor një të tillë mban spërkatësin dhe burimin e tij në skedarin e projektit. Janë për planifikim: kontrollo të dhënat e vetë spërkatësit real përpara ndërtimit.
