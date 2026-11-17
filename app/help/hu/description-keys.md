---
title: Leíró kulcsok és vonalkódok
summary: Alakítson terepi kódokat pontcsoportokká leírásokkal, és kapcsoljon kódozott pontokat vonalakká (kezdés, vég, zárás), amelyekből töréselemek lesznek.
keywords: leíró kulcsok, terepi kódok, vonalkódok, ábrák, vonalrajz, kezdés, vég, zárás, pontcsoportok, kódok, felmérési kódok, adatgyűjtő, töréselemek, szegély, burkolat széle
from: b3d1af8d
---

A felmérő csapatok a terepen minden pontot kódolnak: `EP` a burkolat széléhez, `TC` a szegély tetejéhez, `BLDG` egy épület sarkához. A kód a pont leírásának első szava. A CivilCraft a kód szerint csoportosítja a pontokat, és a kód után álló vonalkódokból vonalakat készít.

## Vonalkódok

A vonalkód a terepi kód utáni szó:

| Leírás | Jelentés |
|---|---|
| `EP B` | Új burkolatszél-vonal kezdése ebben a pontban |
| `EP` | Az aktuális EP-vonal folytatása |
| `EP E` | Az aktuális EP-vonal befejezése ebben a pontban |
| `BLDG C` | Az épület zárása: ez a pont visszakapcsolódik a vonal első pontjához |

Az azonos kódú pontok pontszám szerinti sorrendben kapcsolódnak össze. A különböző kódok különböző vonalak, akkor is, ha egy csoportban vannak, így az `EP1` és `EP2` egyszerre két élet ad. Az a kód, amely nem használ vonalkódot, az összes pontján át kapcsolódik, ahogy a korábbi verziókban.

A **Töréselek** csoportban használt vonalak töréselemekké lesznek, vonalanként egyre, így a résekkel megszakított szegély nem nyúlik át a résen. Más csoportok vonalai a terven rajzolódnak (V-NODE-LINE réteg), és DXF, DWG és PDF formátumban is kimennek.

A kezdés, a vég és a zárás szavai: `B`, `BEG`, `START`; `E`, `END`; és `C`, `CLO`, `CLOSE`. Ezeket megváltoztathatja, vagy kikapcsolhatja a vonalkódokat az alábbi párbeszédpanelen.

## Leíró kulcsok

A leíró kulcs egy kódot pontcsoporttá, használattá és hosszú leírássá alakít.

1. A **Pontok** alatt kattintson a {{ui:Kódkulcsok és vonalkódok}} gombra.
2. Kattintson az {{ui:Kulcs hozzáadása}} gombra, és töltse ki a sort:
   - **Kód**: a megfeleltetendő terepi kód. A `*` tetszőleges karaktereket, a `?` egy karaktert jelöl, így az `EP*` az EP, EP1 és EP12 kódokat is elkapja.
   - **Csoport**: a pontcsoport, amelybe ezek a pontok kerülnek (üres = maga a kód). Az `EP*` kulcs `EP` csoporttal az EP1 és EP2 pontokat egy csoportba teszi, miközben külön vonalak maradnak.
   - **Használat**: Pontok, Töréselek vagy Kihagyva, arra az esetre, amikor a csoport először megjelenik (vagy hagyja a **Pontok** táblázatra).
   - **Leírás**: a hosszú név, amely a pont **Tulajdonságai** között látszik.
3. A **Pontok** oszlop számolja, hány pontot fog meg az egyes kulcsok, miközben gépel. Az első illeszkedő kulcs nyer.
4. Kattintson az {{ui:Alkalmaz}} gombra. A csoportok, a felület és a terv egy lépésben követik: a {{key:Mod+Z}} visszavonja.

Egy csoport megtartja a **Pontok** táblázatban megadott használatát; a kulcs használata csak az újonnan megjelenő csoportra vonatkozik. A kulcsok és a vonalkódok a projektfájlban mentődnek.
