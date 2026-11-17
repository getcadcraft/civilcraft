---
title: Menük, billentyűk és egér
summary: Válasszon olyan menüstílust, amely illeszkedik a megszokott munkamódjához, adjon bármely parancsnak saját billentyűt, mozgassa a parancsokat szalagfülek között, és állítsa be, mit csinál a görgő és az egérgombok az alaprajzon és 3D-ben.
keywords: menüstílus, menük, szalag, civil szalag, eszköztár, parancssor, klasszikus rajzolás, billentyűparancsok, gyorsbillentyűk, billentyűk, testreszabás, újrakiosztás, egér, görgő, invertálás, nagyítási irány, középső gomb, jobb gomb, eltolás, körbeforgatás, exportálás, importálás, váltás, ismerős
from: 07ac73a0
---

A CivilCraft parancsai mindig ugyanazok, akárhogyan érjük is el őket. A **menüstílus** csak azt határozza meg, hol helyezkednek el a képernyőn, milyen néven szerepelnek, és mely billentyűk indítják őket, így megtarthatja a megszokott munkamódját. A {{ui:Settings}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menus, keys and mouse}} menüpontban választhatja ki; a változás azonnal érvényes, és ez a böngésző megjegyzi.

## A három stílus

| Stílus | Mit kap |
|---|---|
| {{ui:CivilCraft}} | A CivilCraft saját eszköztára (Fájl, Exportálás, Felület, Tervezés, Szerkesztés, GIS, Nézet) és egybetűs billentyűk: {{key:A}} nyomvonal, {{key:G}} tereplépcső, {{key:P}} csövek, {{key:B}} töréselek, {{key:O}} határvonal, {{key:L}} jellemzővonal, {{key:R}} hossz-szelvény, {{key:X}} keresztszelvények, {{key:E}} lejtések, {{key:D}} 3D, {{key:F}} illesztés, {{key:V}} kijelölés. Ez az alapértelmezett. |
| {{ui:Drafting classic}} | Egy kis szalag ({{ui:Home}}, {{ui:Insert}}, {{ui:Output}}) és egy parancssor azoknak, akik parancsokat gépelnek: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (visszavonás), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Bárhol elkezdhet gépelni, a betűk a parancssorba kerülnek; az {{key:Enter}} futtatja, üres parancssornál az {{key:Enter}} megismétli az utolsó parancsot, az {{key:Esc}} pedig törli. A középső gomb eltolja a rajzot. |
| {{ui:Civil ribbon}} | Nagy gombokat tartalmazó lapok, ahogyan a civil tervezőprogramok csoportosítják az eszközeiket: {{ui:Home}} (terepadatok, tervezés létrehozása, hossz-szelvény- és keresztszelvény-nézetek), {{ui:Surfaces}}, {{ui:Modify}}, {{ui:Geolocation}}, {{ui:View}} és {{ui:Output}}, jobb oldalon a {{ui:File}} menüvel és gyorsgombokkal. Az egybetűs billentyűk megmaradnak. A középső gomb az alaprajzot tolja el; 3D-ben a középső gomb eltolja, a {{key:Shift}} és a középső gomb együtt pedig körbeforgatja. |

Minden stílus megtartja a {{key:Mod}} billentyűket: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Az a billentyű, amely a CivilCraft saját elrendezéséhez tartozik, de a stílusában másik parancsot kapott, nem csinál semmit, az állapotsor pedig megmondja, hova került a parancs („A Saját billentyűk között a tereplépcső: Ctrl+Alt+G”). A {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} és a nyilak mindig megtartják a jelentésüket, egy vonal rajzolása közben pedig a pontjai megtartják a billentyűiket ({{key:Backspace}}, {{key:Enter}}).
:::

## Készítse el a sajátját

1. Válassza ki a legközelebbi stílust, majd kattintson a {{ui:Customize…}} gombra.
2. A {{ui:Keys and menus}} lapon keressen rá egy parancsra (a keresőmező segít). Kattintson az {{ui:Add a key}} gombra, majd nyomja meg a billentyűt, vagy két billentyűt egymás után a kétbetűs billentyűhöz. Egy billentyű eltávolításához kattintson rá.
3. Szalag esetén a {{ui:Where it sits}} beállítás a parancsot egy másik fülre és panelre, a {{ui:File}} menübe vagy a {{ui:Keys only}} csoportba mozgatja.
4. A {{ui:Mouse}} lapon állítsa be a görgőt, azokat a gombokat, amelyek az alaprajzot tolják el, és azt, hogy az egyes gombok mit csinálnak a 3D-nézetben.
5. Adjon nevet, és kattintson a {{ui:Save}} gombra.

A beépített stílus mentése saját másolatot készít („Saját civil szalag”); a beépített stílus soha nem változik. Ha egy billentyűt két parancshoz rendelt, vagy olyan billentyűhöz, amely egy kétbetűs billentyű begépelése előtt futna le, az piros lesz, és a mentés előtt ki kell javítani.

## Egér

- **Egérgörgő**: {{ui:Scroll up zooms in}} (az alapértelmezett) vagy {{ui:Scroll up zooms out}}, és hogy milyen gyorsan, az alaprajzon és 3D-ben egyaránt. Az érintőpadon a csippentés mindig az ujjak mozgásának megfelelően nagyít.
- **Az alaprajz eltolása**: a középső gombbal, a jobb gombbal vagy mindkettővel. A {{key:Space}} és a húzás is eltol. A bal gomb mindig kijelöl és rajzol.
- **Húzás a 3D-nézetben**: a {{ui:Nézetenként saját}} megtartja a CivilCraft gombjait (a bal gomb körbeforgat, a jobb eltol). Vagy beállíthat minden gombhoz körbeforgatást, eltolást, nagyítást vagy semmit; a gombbal együtt nyomva tartott {{key:Shift}} felcseréli a körbeforgatást és az eltolást. Húzás nélküli kattintás továbbra is kijelöl.

## Vigye magával

A {{ui:Export}} a használt stílust egy kis `.ccinput.json` fájlba menti; az {{ui:Import…}} hozzáad egyet, például egy másik számítógépről vagy egy kollégától. Az importált fájl csak a CivilCraft saját parancsaira mutathat: minden más kimarad, és az állapotsor megszámolja. A {{ui:Delete this style}} eltávolít egy saját stílust.

:::note
Ezek a beállítások ebben a böngészőben maradnak. A stíluskártyák alatti {{ui:Use this style in every app}} beállítás miatt minden alkalmazás a neki megfelelő stílusban nyílik meg (saját eszköztárral, szalaggal vagy Klasszikus rajzolással), az egyes alkalmazásokban végzett módosításokkal együtt. A CivilCraftnak nincs menüsoros stílusa: ha minden alkalmazás számára egy másik alkalmazás menüsorát választják, a CivilCraft megtartja a saját eszköztárát.
:::

Kapcsolódó: [Billentyűzet és egér](topic:keyboard) · [CivilCraft beállításai](topic:settings) · [Átállás más civil szoftverekről](topic:coming-from)
