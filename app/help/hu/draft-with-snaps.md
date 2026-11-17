---
title: Rajzolás fogással, kijelölt sarkokkal és mozgatás, másolás, forgatás
summary: Helyezzen nyomvonalakat, tereplépcsőket, telkeket és jellemzővonalakat pontosan a meglévő pontokra és sarkokra, írja be vagy válassza ki a sarok keleti és északi koordinátáját, fordítsa az érintőt két pont felé, és mozgasson, másoljon vagy forgasson egy objektumot távolsággal vagy szöggel.
keywords: fogás, fogások, objektumfogás, fogás pontra, fogás sarokra, PI, csúcs, sarok, kijelölés, célkereszt, keleti, északi, koordináták, beírt koordináták, érintő, irány, irányszög, mozgatás, másolás, forgatás, transzformáció, forgatott másolás, kettőzés, alt, szabad pont, rajzolás
from: 49864dda
---

Új a 0.9 verzióban: rajzoláskor a kurzor a terven már meglévő pontokra és sarkokra ugrik, és egy tereplépcső, telek vagy jellemzővonal sarka beírható vagy kiválasztható. Ez a témakör a három eszközt végigvezeti.

## Amit csinálni fog

- Rajzoljon fogással, hogy egy új nyomvonal, tereplépcső, telek vagy vonal pontosan valami meglévőn kezdődjön és végződjön.
- Állítsa be egy sarok keleti és északi koordinátáját beírással, vagy válasszon helyet a terven.
- Fordítson egy nyomvonal érintőjét két kiválasztott pont felé.
- Mozgasson, másoljon vagy forgasson el egy teljes objektumot.

## Lépések

1. Válasszon rajzoló eszközt, például a {{ui:Nyomvonal}}, {{ui:Tereplépcső}}, {{ui:Telek}} vagy {{ui:Jellemzővonal}} eszközt. Vigye a mutatót egy felmérési pont, nyomvonal PI, tereplépcső-, telek- vagy tömegsarok, jellemzővonal-csúcs vagy csapadékvíz-műtárgy közelébe. Megjelenik egy jelölő felirattal (PI, Sarok, Csúcs, Műtárgy vagy Pont és a száma), valamint az a keleti és északi koordináta, amelyre a pont kerül. Kattintson a pont elhelyezéséhez.
2. Szabad elhelyezéshez tartsa lenyomva az {{key:Alt}} billentyűt kattintás közben. A fogás kikapcsol.
3. Válasszon ki egy tereplépcsőt, telket vagy jellemzővonalat. A **Tulajdonságok** alatt a {{ui:Sarkok}} rész minden sarkot listáz, mindegyik mellett egy Keleti és egy Északi mezővel. Írjon be új számokat, vagy nyomja meg a sarok melletti célkereszt gombot, és kattintson egy helyre a terven. A sarok felveszi azt a keleti és északi koordinátát. A kiválasztás megszakításához nyomja meg az {{key:Esc}} billentyűt. A célkereszt csak a terven működik: előbb zárja be a 3D-nézetet.
4. Egy érintő fordításához válasszon ki egy nyomvonalat. A **Tulajdonságok** alatt a {{ui:Érintő két pontból}} részben válassza ki az érintőt, nyomja meg az {{ui:Első pont}} gombot, és kattintson a terven; nyomja meg a {{ui:Második pont}} gombot, és kattintson újra; majd nyomja meg az {{ui:Irány beállítása}} gombot. Az érintő úgy fordul, hogy az első ponttól a második felé fusson, és megtartja a hosszát.
5. Mozgatáshoz, másoláshoz vagy forgatáshoz válasszon ki egy nyomvonalat, tereplépcsőt, telket vagy jellemzővonalat. A **Tulajdonságok** alatt a {{ui:Mozgatás, másolás és forgatás}} részben írja be a {{ui:Mozgatás keletre}} és a {{ui:Mozgatás északra}} értéket (a negatív számok nyugat és dél felé mutatnak), majd nyomja meg a {{ui:Mozgatás}} vagy a {{ui:Másolás}} gombot. Vagy nyomja meg a {{ui:Távolság két pontból}} gombot, és kattintson arra a pontra, ahonnan mozgatja, és arra, ahová mozgatja.
6. Forgatáshoz írja be a szöget a {{ui:Forgatás az óramutató járásával ellentétesen}} mezőbe (fokban), majd nyomja meg a {{ui:Forgatás}} vagy az {{ui:Elforgatott másolás}} gombot. A forgatás a sarkok középpontja körül történik, hacsak a szög melletti célkeresztel nem választ ki egy forgatási pontot.

## Megjegyzések

- A másolat az eredetit helyben hagyja, és utána a másolat van kijelölve.
- Minden mozgatás, másolás, forgatás, kiválasztott sarok és elforgatott érintő egy visszavonási lépés.
- A fogás a kurzortól 10 képernyőpixelen belül érvényesül. A fogásjelölő csak egy helyet ajánl fel; semmi sem változik, amíg nem kattint.
- Ugyanez a célkereszt található a nyomvonal PI-sorain is. Lásd: [Nyomvonalak](topic:alignment), [Telkek](topic:parcels) és [Jellemzővonalak](topic:feature-lines).
