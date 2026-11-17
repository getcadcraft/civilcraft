---
title: Pontfelhők drónról vagy szkennerről
summary: A Pontfelhők bővítménnyel nyisson meg LAS vagy LAZ fájlt több millió ponttal, nézze meg az egészet, tisztítsa meg, sorolja terepre, növényzetre és épületekre, és ebből készítse el a terepet, a szintvonalakat és a térfogatokat.
keywords: pontfelhő, las, laz, drón, fotogrammetria, recap, lidar, szkennelés, terep, osztályozás, zaj, anyaghalom, térfogat, bevágás és feltöltés, szintvonalak, törésvonal, eye-dome, ortomozaik, ortó, ráterítés, térképréteg, las exportálás, laz exportálás, tömörítés
from: e4a4901f
---

A legtöbb felhasználónak erre nincs szüksége, ezért ez bővítmény. Kapcsolja be a Beállítások › Bővítmények menüben a {{ui:Pontfelhők}} opciót; ekkor a jobb oldali panelen megjelenik a {{ui:Pontfelhők}} lap. A fájl a böngészőben kerül beolvasásra, és csempékre darabolva a böngésző saját tárolójában (vagy egy kiválasztott mappában) tárolódik. **Semmi nem kerül feltöltésre.**

:::warning
Ezen a lapon megjelenő minden érték az adatokból számított szám, nem tanúsítvány. Kitalált helyszínen teszteltük, még nem valódi drónos felmérésen: az első eredményeket óvatosan olvassa, és jelezze, amit talál. A terep, a szintvonalak és a térfogatok értékéről az okleveles szakember dönt.
:::

## Pontfelhő megnyitása

A {{ui:Pontfelhő megnyitása}} alatt válasszon LAS vagy LAZ fájlt. A lap megmutatja, hány pontot tartalmaz, mi a koordinátarendszere és mértékegysége, és mennyi hely kell a felépítéshez; nyomja meg a {{ui:Pontfelhő felépítése}} gombot. A felépítés megszakítható, és a {{ui:Folytatás}} gombbal folytatható (ugyanazt a fájlt kell újra kiválasztani). A fájl nem változik. Egy 100 millió pontos fájl munkaállomáson percek alatt felépül, és nagyjából a fájl méretének megfelelő helyet igényel.

A {{ui:Pontfelhők ezen a számítógépen}} alatt nyithat meg vagy távolíthat el pontfelhőt. A {{ui:Pontfelhők tárolása mappában…}} (Chrome, Edge és a Studio alkalmazás) a csempéket egy kiválasztott mappában tartja, például a Dokumentumok mappában lévő CadCraft pontfelhő-mappában, így egy 10 GB-os pontfelhőnek nem kell beférnie a böngésző tárhelyébe; a korábban felépített pontfelhők ott maradnak, ahol készültek. Újraindítás után a böngésző újra kéri az engedélyt: nyomja meg a {{ui:Mappa … újbóli használata}} gombot.

## Megtekintés

A {{ui:Megtekintés 3D-ben}} durva csempékből rajzolja ki a pontfelhőt, és közelítéskor finomítja; egyszerre legfeljebb {{ui:Legtöbb kirajzolt pont}} (2,5 millió; telefonon 500 ezer). Színezés a fájl saját színe, magasság, osztály, intenzitás vagy maradék szerint. Az {{ui:Eye-dome megvilágítás}} a mélység szerint árnyékolja a széleket, így a forma normálvektorok nélkül is látszik (telefonon ki van kapcsolva); a {{ui:Pontok zsugorodnak távolság szerint}} a távoli pontokat kisebbre, a közeliket nagyobbra rajzolja; a {{ui:Pontméret}} a méretet állítja be. A tervrajzon a pontfelhő a rajz alatt raszterként jelenik meg, és nagyításkor a kiválasztott része **finomodik**.

## Tisztítás

A {{ui:Tisztítás}} alatt húzzon lasszót, téglalapot vagy sokszöget a tervrajzon (3D-ben a felülnézetből: 3D-ben a körvonal függőlegesen lefelé kerül, ezért csak felülről pontos). A lap az alkalmazás **előtt** megmutatja, hány pont van benne: {{ui:Ezeknek a pontoknak a törlése}}, {{ui:Osztályuk módosítása}}, {{ui:Törölt pontok visszaállítása}} vagy {{ui:Kivágás ehhez a határhoz}}. A {{ui:Visszavonás}} és az {{ui:Ismétlés}} a szerkesztési naplóban lépked; maga a fájl sosem változik. A {{ui:Zajszűrő…}} a kóbor pontokat alacsony pontként (7-es osztály) vagy magas zajként (18-as osztály) jelöli meg.

## Osztályozás

A {{ui:Terep keresése}} csempénként dolgozik, és a terepi pontokat (2-es osztály) és az alacsony pontokat jelöli meg; a tűrés 0,15 m, a felmérési minőségű kapcsoló bekapcsolása esetén 0,08 m. Jelzi azokat a csempeillesztéseket, amelyek nem egyeznek. A {{ui:Növényzet és épületek osztályozása}} ezután az alacsony, közepes és magas növényzetet és az épületeket jelöli meg a terep feletti magasság és a környezet lapossága alapján. Gépi tanulás nincs benne, ezért a fák alatti laposteteji fészer tévesen is besorolható: ellenőrizze.

## Terep, szintvonalak, törésvonalak

A {{ui:Terep felépítése}} a terepi pontokból létrehozza a meglévő terepet, és a projekthez adja, ugyanúgy, mint a LAS-importálás (egy visszavonási lépés). Ezután összeveti vele a pontokat: megadja az átlagot, az RMS-t, a 95. percentilist, a tűrésen belüli hányadot és a tíz legnagyobb eltérésű helyet, mindegyik mellett {{ui:Ugrás ide}} gombbal. A {{ui:Maradék}} színezés mutatja, hol térnek el egymástól a terep és a pontfelhő.

A **törésvonalat** (szegélyt, árkot vagy töltésperemet) a pontfelhőn kell kijelölni: a {{ui:Törésvonal kijelölése a pontfelhőn}} a 3D nézetben minden kattintásnál a legközelebbi kirajzolt pontot veszi, a {{ui:Törésvonal kijelölése a tervrajzon}} pedig minden kattintásnál a legközelebbi pontfelhő-pontot (előnyben a terepi pontot); a vonalat dupla kattintással vagy az Enter billentyűvel kell lezárni. A következő {{ui:Terep felépítése}} ezt használja. A {{ui:Szintvonalak megjelenítése}} kis képen rajzolja ki a szintvonalakat a pontfelhő fölé, és beállítja a projekt szintközét.

## Térfogatok

A {{ui:Anyaghalom térfogata…}} kiszámítja a felszín feletti térfogatot egy alap fölött, a rajzolt határon belül. A határt vízszintes terepen rajzolja meg a halom körül, majd válassza ki az alapot: a legalacsonyabb határpontot, egy síkot, sima görbe alapot, a határon átfutó felületet vagy begépelt szintet. Lejtős vagy görbe terepen a síkot vagy a görbe alapot használja, mert a legalacsonyabb pont túl magasnak mutatja. A többi fölé emelkedő határpontokat (a vonalon álló fa) az alapból kihagyja. A {{ui:Repülésről repülésre}} két pontfelhő közötti bevágást és feltöltést ad. Mindkettő menthető CSV-ként.

## Ortomozaik

A {{ui:Ortomozaik (felülnézeti kép)}} alatt válassza ki a drón ortomozaikját a hozzá tartozó világfájllal és a `.prj` fájllal, ha vannak: GeoTIFF, vagy PNG, vagy JPEG. Ez a projekt **térképrétege** lesz, így a tervrajz a rajza alatt mutatja, a 3D nézet (szín: {{ui:Térkép}}) pedig a felépített terepre festi, ezért előbb a {{ui:Terep felépítése}} szükséges. A lap megmutatja, mekkora részét fedi le a pontfelhőnek, és figyelmeztet, ha nem fed le semmit: a gyakori ok eltérő koordinátarendszer, ezért a `.prj` fájlt mellé kell adni. Ha nincs `.prj`, a program megkérdezi, hol vannak a koordináták. A kép a projektfájlban marad; a 200 MB-nál nagyobb GeoTIFF-et elutasítja, a nagyon nagy mozaikot pedig 16 megapixelre csökkenti, ezért nagy felmérésnél előbb vágja ki a mozaikot a helyszínre.

## Exportálás

Az {{ui:Exportálás}} a megtisztított, osztályozott pontfelhőt új fájlként írja ki (az összes pontot, a tiszta osztályokat vagy csak a terepet). Az {{ui:Fájltípus}} alatt válassza ki:

- **LAS 1.4 (nem tömörített)**: 6-os pontformátum, vagy 7-es színnel.
- **LAZ (tömörített)**: ugyanezek a pontok veszteség nélkül tömörítve, így minden pont pontosan visszajön. 0-s vagy 2-es pontformátumban íródik (színnel a 2-es), LAS 1.4 fájlban. A kitalált 300 m-es helyszínen a LAZ a LAS 1.4 fájl körülbelül egyötöde volt. A 0-s és 2-es LAZ formátum csak a 0–31 osztályokat tartalmazza: a magasabb osztályú pontot a program üzenettel elutasítja, ezért az ilyen pontfelhőt LAS 1.4-ként kell exportálni.

A LAZ-t a CadCraft saját tömörítője írja, a közzétett LAZ-specifikáció alapján. Ellenőriztük, hogy a saját olvasónk és két független LAZ-olvasó (a laz-perf, amelyet az alkalmazás a LAZ-fájlok megnyitásához használ, és a laspy a lazrs-sel) minden pontot pontosan visszaolvas, és hogy a laspy által készített LAZ-fájlok bájtra azonosak, amikor a pontjaikat újra kiírjuk. Más programokkal még nem próbáltuk, ezért ha valamelyik nem nyit meg egy fájlt, jelezze, melyiket.

Ha a böngésző fokozatosan tud fájlt írni, előbb válassza ki a fájlt, és egy nagyon nagy pontfelhő csempénként íródik bele, a memóriában való összegyűjtés helyett; egyébként a fájl összegyűjtve és letöltve készül, ami néhány száz megabájtig megfelelő.

## Amit nem tesz meg

Csak LAS és LAZ fájlokat olvas (az E57, a PLY és a PCD még nincs bekötve ebbe a lapba, és egy repülés több fájlját nem fűzi össze), nem vetíti át újra a pontfelhőt (a projekt rendszerét és méterét veszi alapul), nem olvassa az Autodesk RCP vagy RCS fájljait, nem készít felületet fényképekből, és nem keres magától oszlopokat, szegélyeket vagy csöveket.
