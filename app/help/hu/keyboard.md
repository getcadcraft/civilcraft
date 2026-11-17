---
title: Billentyűk és egér
summary: Minden billentyűparancs, valamint egér-, érintőpad- és érintőképernyő-művelet a CivilCraftban, csoportosítva, a böngésző- és platformkülönbségekkel.
keywords: billentyűzet, billentyűparancsok, gyorsbillentyűk, billentyűk, egér, érintőpad, érintés, eltolás, nagyítás, csippentés, görgő, jobb klikk, mac, Command-billentyű
from: a9756f46
---

Az egybetűs billentyűk akkor működnek, ha nem ír be szöveget egy mezőbe. A {{key:Mod}} billentyűs parancsok Mac-en a Command-ot, máshol a Ctrl-t használják. Lásd még: [Billentyűk a böngészőben](common:keys).

## Fájlok és szerkesztés

| Billentyű | Művelet |
|---|---|
| {{key:Mod+O}} | Pontfájl, LandXML vagy projekt megnyitása |
| {{key:Mod+S}} | A projekt mentése (egy `.civilcraft.json` fájlt tölt le) |
| {{key:Mod+P}} | A terv plottolása PDF-be (a plottolási párbeszédpanelt nyitja meg, nem a böngésző nyomtatását) |
| {{key:Mod+Z}} | Visszavonás |
| {{key:Mod+Y}} | Ismétlés |
| {{key:Delete}} | A kijelölt mérési pontok, nyomvonal, tereplépcső, műtárgy, csővezeték vagy PVI törlése |
| {{key:Mod+C}} | A kijelölt mérési pontok másolása (táblázatkezelőnek szóló pontsorként is) |
| {{key:Mod+X}} | A kijelölt mérési pontok kivágása |
| {{key:Mod+V}} | Pontok beillesztése: a mutatót követik, kattintson oda, ahová kerülnek |
| {{key:Mod+Shift+V}} | Beillesztés helyben: a pontok saját koordinátáin |
| {{key:Mod+D}} | A kijelölt pontok kettőzése: egy másolat a mutatót követi |
| {{key:Mod+A}} | Minden mérési pont kijelölése |
| {{key:Esc}} | Kijelölés megszüntetése (és egy beillesztés megszakítása) |

{{key:Mod+S}}, {{key:Mod+O}} és {{key:Mod+P}} akkor is működik, ha egy mezőbe ír. {{key:Mod+Z}} és {{key:Mod+Y}} egy szövegmezőben a gépelését vonja vissza, szokás szerint, ugyanígy a {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} és {{key:Mod+A}}: mezőben a szöveget másolják, kivágják, beillesztik és kijelölik. Ha az oldalon (egy panelben) szöveg van kijelölve, a {{key:Mod+C}} azt a szöveget másolja. A {{key:Mod+Shift+Z}} a CivilCraftban nem tesz semmit: használja a {{key:Mod+Y}} billentyűt vagy a {{ui:Ismétlés}} gombot.

:::mac
A Mac billentyűzeten a **delete** feliratú billentyű a böngészőben {{key:Backspace}}. A kijelölés törléséhez nyomja meg a {{key:Delete}} billentyűt (Fn + delete), vagy válassza a {{ui:Törlés}} elemet az eszköztár {{ui:Továbbiak}} menüjéből.
:::

## Eszközök

| Billentyű | Eszköz |
|---|---|
| {{key:V}} | {{ui:Kijelölés}} |
| {{key:M}} | {{ui:Mérés}}: távolságok, területek és lejtések a terven ([Mérés](topic:measure)) |
| {{key:A}} | {{ui:Nyomvonal}} |
| {{key:G}} | {{ui:Tereplépcső}} |
| {{key:P}} | {{ui:Csövek}} |
| {{key:B}} | {{ui:Töréselő}} |
| {{key:O}} | {{ui:Határvonal}} |
| {{key:R}} | Profilnézet megjelenítése vagy elrejtése |
| {{key:I}} | A {{ui:PVI-k hozzáadása}} be- vagy kikapcsolása (ha a profilnézet zárva van, megnyitja) |
| {{key:F}} | {{ui:Illesztés}}: minden megjelenítése |
| {{key:D}} | {{ui:3D}}: a telek megjelenítése 3D-ben, vagy visszatérés a tervre |
| {{key:E}} | Lejtések és magasságok megjelenítése vagy elrejtése minden jellemzővonal mentén (csak a képernyőn) |

Az aktív eszköz billentyűjének újbóli megnyomása visszavisz a {{ui:Kijelölés}} eszközre. A Shift-tel írt betűk nem tesznek semmit.

## Rajzolás közben

| Billentyű | Művelet |
|---|---|
| {{key:Enter}} | A nyomvonal, tereplépcső, csővezeték-szakasz, töréselő vagy határvonal befejezése |
| {{key:Backspace}} | Az utoljára kattintott pont eltávolítása |
| {{key:C}} | Jellemzővonal: ívek be- vagy kikapcsolása (egy csúcs után kattintson a görbe egy pontjára, majd a végére) |
| {{key:Esc}} | A rajzolás (vagy a beillesztés) megszakítása; újra megnyomva (vagy ha nincs semmi rajzolva) visszavált a {{ui:Kijelölés}} eszközre, és törli a kijelölést |

## Tervnézet

| Billentyű vagy művelet | Eredmény |
|---|---|
| Görgő | Nagyítás vagy kicsinyítés a mutatónál |
| Húzás üres területen | Eltolás (bármely eszközzel; rövid kattintás még kattint; a {{key:Shift}} lenyomva téglalap-kijelölést rajzol) |
| Húzás a középső gombbal | Eltolás |
| Húzás a jobb gombbal | Eltolás (nem nyílik menü) |
| {{key:Space}} és húzás | Eltolás |
| Kattintás | Kijelölés (a {{ui:Kijelölés}} eszközzel), vagy pont elhelyezése (rajzoló eszközzel) |
| {{key:Shift}} és kattintás | Mérési pont hozzáadása a kijelöléshez, vagy kivétele onnan |
| {{key:Shift}} és húzás | Téglalap rajzolása: a benne lévő mérési pontok hozzáadódnak a kijelöléshez. Húzzon köréjük, hogy [lasszó](topic:lasso-selection) legyen |
| {{key:Space}} lasszó rajzolása közben | Ablak, majd keresztező ablak, majd kerítés |
| Kattintás beillesztéskor | A beillesztett pontok oda kerülnek ({{key:Enter}} a saját koordinátáikra helyezi őket) |
| Fogópont húzása | Egy PI, tereplépcső-sarok vagy műtárgy mozgatása (egy visszavonási lépés) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Eltolás, ha a terv kapta a fókuszt (előbb kattintson rá) |
| {{key:Plus}} és {{key:Minus}} | Nagyítás és kicsinyítés középen, ha a terv kapta a fókuszt |

A = billentyű ugyanúgy nagyít, mint a {{key:Plus}}, így nem kell Shift-et használni.

## Profilnézet

| Művelet | Eredmény |
|---|---|
| Kattintás, ha a {{ui:PVI-k hozzáadása}} be van kapcsolva | PVI hozzáadása ott |
| Kattintás egy PVI-re | Kijelölés |
| PVI húzása | Mozgatás (egy visszavonási lépés) |
| {{key:Delete}} vagy {{key:Backspace}} | A kijelölt PVI eltávolítása ({{key:Backspace}} csak akkor, ha a profilnézet kapta a fókuszt) |

A profilnézet nem nagyít és nem tol el.

## Képernyő és súgó

| Billentyű | Művelet |
|---|---|
| {{key:F1}} | Ez a súgó megnyitása vagy bezárása (az oldalsó panel); az alkalmazássávi {{ui:Súgó}} ugyanezt teszi |
| {{key:Esc}} | A súgópanel bezárása, ha nyitva van |
| {{key:Ctrl+Shift+F}} | Képernyőmódok váltakoztatása: teljes képernyő, teljes képernyő a sávok elrejtésével, normál |
| {{key:Esc}} | Kilépés a teljes képernyőből (a böngésző saját billentyűje) |

A {{key:F1}} a CivilCraft előtt eléri a súgót, így bármely eszközben működik. Sok Mac-billentyűzeten nyomja meg az fn-t az F1-gyel, vagy kattintson a {{ui:Súgó}} gombra. A {{key:Ctrl+Shift+F}} minden platformon a Control billentyűt használja, Mac-en is. A súgó kereséséhez lásd: [A súgó használata](common:help).

## Egér, érintőpad és érintés

:::mouse
- A görgő a mutatónál nagyít. Egy szabadon forgó görgőjű egér gyorsan nagyít: rövid fordulatokat adjon neki.
- Eltolás bármely húzással üres területen, a középső gombbal, a jobb gombbal, vagy a {{key:Space}} és húzással.
:::

:::mac
Mac érintőpadon:

- A két ujjas görgetés **nagyít** (nem tol el), a csippentés is nagyít.
- Eltoláshoz nyomja le és húzza üres területen egy ujjal, vagy tartsa lenyomva a {{key:Space}} billentyűt és húzzon.
- A két ujjas kattintás (jobb klikk) nem nyit menüt, és önmagában nem csinál semmit.
:::

:::touch
Érintőképernyőn:

- Az első érintés a gombokat és menüsorokat ujjnyi méretűre nagyítja.
- Koppintás kijelöléshez vagy pont elhelyezéséhez; egy húzott ujj üres területen eltol. Egy koppintás kicsit remeghet: csak akkor tol el, ha az ujj nagyjából 10 képpontot mozdult.
- Két ujjal csippentsen a nagyításhoz, és mozgassa együtt az eltoláshoz.
- Egy fogópontot vagy PVI-t egy ujjal húzzon. A fogópontok körül egy ujjnyi hely van.
- Nyomvonal, tereplépcső, töréselő, határvonal, csővezeték-szakasz, jellemzővonal vagy parcella rajzolásakor a terv fölötti sáv felkínálja a {{ui:Kész}} ({{key:Enter}}), a {{ui:Pont visszavonása}} ({{key:Backspace}}) és a {{ui:Mégse}} ({{key:Esc}}) gombot. Hosszú nyomás (fél másodpercig mozdulatlanul) is befejez.
- A {{ui:Kijelölés}} eszközben egy mérési pontra hosszan nyomva hozzáadja a kijelöléshez, vagy kiveszi onnan, a {{key:Shift}} + kattintás módjára.
- A 3D nézetben egy ujj forgat, két ujj csippent és tol, koppintás választ.
- Érintéskor nincs egérmozgás-kiemelés, ezért az állapotsor kijelzői csak akkor frissülnek, ha egy ujj le van nyomva.
:::

## Elsőbbséget élvező böngészőbillentyűk

Vannak billentyűk, amelyek a böngészőhöz tartoznak, és soha nem érik el a CivilCraftot, például {{key:Mod+W}} (fül bezárása), {{key:Mod+T}} (új fül), {{key:Mod+N}} (új ablak) és {{key:F11}} (teljes képernyő Windows és Linux böngészőkben). A CivilCraft ezeket nem használja. Ha egy parancsikon helyett a böngészőben nyit meg valamit, kattintson egyszer a tervre, hogy az oldal kapja a fókuszt, és próbálja újra.

## Hol található a Mozgatás

Nincs Mozgatás parancs: válassza a {{ui:Kijelölés}} eszközt, és húzzon egy pontot vagy csúcsot, vagy szerkessze a koordinátáit a {{ui:Tulajdonságok}} alatt. Lásd: [Pontok szerkesztése](topic:edit-points).
