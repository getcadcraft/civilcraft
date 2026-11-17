---
title: A Távvezetékek munkaterület
summary: Légvezetékek és földkábelek a helyszínén, saját könyvtárakkal, lehajlás és feszítőerő a saját terhelési eseteiben, szabad magassági és szilárdsági ellenőrzések, huzalfeszítési táblázatok, mennyiségek, lapok és GIS-export.
keywords: távvezeték, légvezeték, villamos, elosztás, oszlopok, tartók, vezető, lehajlás, feszítőerő, huzalfeszítés, szabad magasság, földkábel, árok, munkaterület, közmű
from: 638dd856
---

A Távvezetékek munkaterület a meglévő CivilCraft helyszínre helyezi a légvezetékeket és a földkábeleket: ugyanazokat a felmérési pontokat, ugyanazt a terepet, ugyanazt a projektfájlt használja.

:::warning
Tervezési segédeszköz. A munkaterület a lehajlást, a feszítőerőt, a szabad magasságokat és a terheléseket a saját terhelési eseteinek és határértékeinek alapján számítja; egyetlen ország szabványa sincs beépítve. Mérnöknek kell minden eredményt a vonatkozó szabvánnyal ellenőriznie, mielőtt bármi épülne.
:::

## Megnyitás

Válassza a {{ui:Felület}} › {{ui:Továbbiak}} › {{ui:Távvezetéki munkaterület}} menüpontot, vagy a Munkaterület alatt a **Távvezetékek** lehetőséget. Az eszköztáron ekkor megjelenik a **Távvezetékek** csoport; a Tervezés és a GIS csoport háttérbe lép. A Munkaterület alatt a **Civil** választásával lehet visszatérni. A CivilCraft emlékszik arra a munkaterületre, amelyet ezen a számítógépen utoljára használt.

A bal oldali panel tetején két szakasz jelenik meg:

- **Távvezetékek**: a terhelési esetek és határértékek, a projektben lévő vezetékek és kábelek, valamint az **Ellenőrzések**, mindig naprakészen. Kattintson egy ellenőrzésre, hogy kijelölje, amire vonatkozik.
- **Könyvtár**: a saját vezetők, kábelek, tartók, berendezések és árokfajták. Lásd: [A saját távvezeték-könyvtár](topic:power-line-library).

## Mi van a Távvezetékek csoportban

| Eszköz | Mit csinál | Témakör |
|---|---|---|
| **Légvezeték** | Légvezeték: kattintson minden tartóra | [Légvezeték rajzolása](topic:overhead-line) |
| **Tartó** | Tartó hozzáadása egy fesztávon | [Légvezeték rajzolása](topic:overhead-line) |
| **Kábel** | Földkábel-útvonal egy árokban | [Földkábelek](topic:underground-cables) |
| **Berendezés** | Szekrény, transzformátor, kötés, vagy az a forrás, ahonnan a hálózat táplálkozik | [Földkábelek](topic:underground-cables) |
| **Akadály** | Valami, amit a vezeték keresztez: út, épület, másik vezeték | [Ellenőrzések](topic:power-line-checks) |
| **Hossz-szelvény** | A vezeték hossz-szelvénye: terep, tartók és a vezető minden terhelési esetben | [Légvezeték rajzolása](topic:overhead-line#the-line-profile) |
| **További** | Terhelési esetek és határértékek, huzalfeszítési táblázatok, mennyiségek, lapok és jelentés, GIS, vizsgálati fájlok | [Lehajlás és feszítőerő](topic:sag-and-tension), [Kimenetek](topic:power-line-outputs), [Vizsgálati fájlok](topic:power-line-study-file) |

Minden, amit hozzáad, egy visszavonási lépés, a projektfájlban mentődik, és a tervrajzon a `C-POWR-…` nevű rétegeken jelenik meg, így a DXF-, DWG- és PDF-exportok is tartalmazzák.
