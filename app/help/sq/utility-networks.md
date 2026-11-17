---
title: Rrjetet e shërbimeve dhe OpenStreetMap
summary: Linja uji, kanalizimi, ujërave të shiut, gazit, energjisë dhe telekomunikimit me material, madhësi, mbulesë dhe pronar; të dhënat OpenStreetMap nga një skedar Overpass JSON; kryqëzime, prerje hendeku dhe vëllime; shtresa shërbimesh në DWG, DXF dhe PDF; segmente tubash dhe kabllosh IFC.
keywords: rrjet shërbimesh, rrjet, utility, osm, openstreetmap, overpass, tub, kabllo, gaz, kanalizim, ujë shiu, telekomunikim, energji, ujë, hidrant, pusetë, hendek, kryqëzim, largësi e lirë, mbulesë, thellësi, dwg, ifc, me koordinata gjeografike, shtresa
from: 8a85dace
---

Vizato shërbimet nëntokësore të një vendi si një rrjet për çdo shërbim, kontrollo se ku kryqëzohen dhe eksporto ato si shtresa vizatimi dhe si IFC.

## Krijo linjat

Hap **Sipërfaqe, Më shumë, Rrjetet e shërbimeve...**

- **Krijo një linjë nga përzgjedhja** e kthen aksin, vijën e veçantë ose tubin e përzgjedhur në një linjë të shërbimit që zgjedh ti. Pastaj plotëso materialin, madhësinë (mm), mbulesën (thellësinë deri në majën e tubit ose kablit) dhe pronarin në tabelë.
- **Lexo të dhënat OpenStreetMap** lexon një skedar Overpass JSON që ke ruajtur (një pyetje me `out geom;`). Projekti së pari duhet të ketë një sistem koordinatash, sepse pozicionet e OpenStreetMap janë gjerësi dhe gjatësi gjeografike. Lexohen tubacionet (sipas substancës), kabllot nëntokësorë të energjisë dhe telekomunikimit, hidrantët, pusetat dhe kanalet e ujërave të shiut; çdo gjë tjetër numërohet si e lënë jashtë dhe thuhet në mesazh. Linjat ajrore lihen jashtë.
- **Shto hartën OpenStreetMap** shton hartën OpenStreetMap nën planimetri. Shfaqet vetëm kur shtresat e hartave nga interneti janë të ndezura në Cilësimet.

## Kontrollet dhe daljet

- **Kryqëzimet**: linjat e shërbimeve të ndryshme që kryqëzohen në planimetri renditen me lartësinë e lirë midis tyre aty ku ka sipërfaqe terreni; minimumi është një vlerë vendmbajtëse që vendos ti, jo numri i një standardi.
- **Hendeku**: çdo linjë merr një hendek (madhësia e tubit plus largësia e lirë nga secila anë, pjerrësia e anës, shtrati) me një vëllim. Totali shfaqet në dritare dhe në CSV.
- **Vizatimi**: linjat dhe pikat janë në shtresa shërbimesh (për shembull U-WATR-RUN, U-POWR-RUN), kështu arrijnë në PDF, DXF dhe DWG.
- **IFC**: linjat hyjnë në eksportin IFC si segmente tubash dhe segmente kabllosh, me hidrantë, valvula dhe odat, me një sistem për çdo shërbim, në sistemin e koordinatave të projektit.

## Të dhënat OpenStreetMap

Të dhënat OpenStreetMap janë të drejta autori të kontribuuesve të OpenStreetMap dhe licencohen sipas ODbL. Atribuimi shtohet në vizatim, në CSV dhe në IFC. Nëse ndan një skedar që përmban të dhëna OpenStreetMap, ruaj atribuimin dhe lexo kushtet e ndarjes me të njëjtat kushte të licencës.

## Çfarë nuk është bërë ende

Linjat nuk vizatohen ende pikë pas pike në planimetri me një mjet, dhe kryqëzimet nuk vizatohen ende në pamjen e profilit gjatësor (llogaritja është ndërtuar). Thellësitë, madhësitë dhe largësitë e lira fillojnë si vlera vendmbajtëse: përdor numrat e standardit tënd.
