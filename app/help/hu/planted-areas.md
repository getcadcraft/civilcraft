---
title: Területi növényzet: gyepek, ágyak, rétek, talajtakarók
summary: A területi növényzet objektumként: szerkezettel (humuszréteg, takarás, fólia, szegély), növénykeverékkel és opcionális kész szinttel; burkolat, falak és lépcsők körül automatikusan levágódnak, és nettó területet, térfogatokat, szegélyhosszt és növényszámokat adnak.
keywords: területi növényzet, gyep, pázsit, ágy, szegély, rét, talajtakaró, humuszréteg, takarás, fólia, gyomgátló fólia, kész szint, mennyiségek, nettó terület, levágás
from: 2617ec0e
---

{{ui:Területek}} a Tájépítészet csoportban **gyepet**, **ültetett ágyat**, **rétet** vagy **talajtakarót** rajzol: kattintson a sarkaira, majd nyomja meg az {{key:Enter}} billentyűt. Az ágy vagy a talajtakaró a Növények szakaszban kiválasztott növénnyel indul; a gyep nem tartalmaz növényt.

## Mit tartalmaz

- **Szerkezet**: humuszréteg vastagsága, takarás vastagsága, gyomgátló fólia, és szegély (acél, fa, tégla, beton, műanyag vagy nincs). A tipikus vastagságok be vannak töltve; adja meg a sajátját.
- **Keverék**: fajok (fajtával és mérettel együtt) és arányuk, ágyhoz hasonlóan, a távolság vagy sűrűség szerint kitöltve.
- **Kész szint**: hagyja üresen, és a terület követi a talajt; adjon meg szintet, és a terület terepmódosítóvá válik (lásd: [Terepmódosítók és szintek](topic:ground-modifiers)).
- **Levágás burkolat, falak és lépcsők körül** (alapértelmezés szerint bekapcsolva): ahol burkolat, járda, fal, szegélykő, rámpa vagy lépcső átfedi a területet, ott az a rész kimarad. Növény nem kerül alájuk, és szélüktől a távolság felénél közelebb sem.

## Mennyiségek

A Tulajdonságok a **nettó területet** (a levágás után, pontosan mérve), a kerületet, a **szegélyhosszt** (csak a terület saját szélén, nem ott, ahol a kemény burkolat vágja), a humuszréteg- és takarásköbtartalmat, a fólia területét és a növényszámokat mutatja keverékenként. A növénykimutatás a terület növényeit számolja; a TakeoffCraft mennyiségi fájlja a területet, a humuszt, a takarást, a fóliát és a szegélyt kapja; a tájépítészeti IFC egy IfcGeographicElement-et ír mennyiségi készlettel.
