---
title: Razmjena LandXML
summary: Otvorite LandXML iz drugog građevinskog softvera kao novi projekt, izvezite točke, površine, trase, profile i mrežu cijevi kao LandXML 1.2 i saznajte što ne putuje.
keywords: landxml, xml, uvoz, izvoz, razmjena, tin, površina, trasa, profil, mreža cijevi, interoperabilnost, razmjena podataka
from: 870d5ece
---

LandXML je otvoreni format za razmjenu koji većina građevinskih programa čita i zapisuje. CivilCraft čita i zapisuje LandXML 1.2. Ako ste koristili Civil 3D, njegovi dijalozi za uvoz i izvoz LandXML-a su najbliža usporedba; ovdje nema izbora koje treba napraviti, a bilješke vam kažu što je izostavljeno.

## Otvaranje LandXML datoteke

1. Kliknite {{ui:Otvori}} (ili pritisnite {{key:Mod+O}}) i odaberite datoteku `.xml` ili `.landxml`, ili je ispustite na plan.
2. Ako trenutačni projekt ima nespremljene promjene, CivilCraft prvo pita. Odaberite {{ui:Spremi kopiju}}, {{ui:Ne spremaj}} ili {{ui:Odustani}}.
3. Stvara se **novi projekt**. Statusna traka kaže što je pročitano, na primjer „Otvoren site.xml: 412 točaka, 2 površine, 3 trase.“
4. Pogledajte okvir ispod činjenica o odjeljku **Teren**. Navodi sve što je preskočeno ili promijenjeno, na primjer:
   - „Otvorena je samo prva površina („EG“); datoteka ima još 1.“
   - „Trasa „Ramp A“ ima elemente koje CivilCraft još ne može crtati (nisu linije, lukovi ni klotoidne prijelaznice); preskočena je.“
   - „Pravila mreže cijevi nisu bila u datoteci; koriste se zamjenske vrijednosti. Postavite svoja u odjeljku Projekt.“

Što postaje što:

| U datoteci | U programu CivilCraft |
|---|---|
| Jedinice (Imperial ili Metric) | **Jedinice** projekta (stope ili metri) |
| Naziv projekta | **Naziv** projekta |
| CgPoints | točke projekta; opis (ili oznaka) daje skupinu |
| Prva TIN površina | postojeći teren, korišten kakav jest („Površina (iz LandXML-a)“) |
| Svaka trasa linija, lukova i klotoidnih prijelaznica | trasa s PI-jevima, radijusima i duljinama prijelaznica rekonstruiranim iz krivina |
| Prvi projektirani profil svake trase | njezin projektirani profil, s paraboličkim vertikalnim krivinama |
| Prva mreža cijevi | mreža cijevi, s rubovima poklopaca, sabirnim jamama i dnima cijevi |
| Značajne linije linija i lukova | značajne linije, lukovi zadržani; iz drugog programa počinju kao **Samo nacrtano** |

Puni popis elemenata i atributa nalazi se u [LandXML: što se čita i zapisuje](topic:landxml-reference).

:::note
Površina pročitana iz LandXML-a se ne izrađuje ponovno kad mijenjate skupine točaka ili crtate linije loma. Kliknite {{ui:Ponovno izradi teren iz točaka}} u odjeljku **Teren** da je izradite iz točaka umjesto toga ({{key:Mod+Z}} vraća LandXML površinu).
:::

## Izvoz LandXML-a

1. Kliknite {{ui:LandXML}} u grupi **Izvoz**.
2. Preglednik preuzima `<name>.xml`. Statusna traka kaže što je ušlo, na primjer „Izvezen LandXML 1.2: 276 točaka, 2 površine, 1 trasa, mreža cijevi. Platoi ovdje nisu dio LandXML-a; uređena površina jest.“

Datoteka sadrži:

- **Units**: US survey stope ili metre.
- **CgPoints**: svaku točku s brojem kao imenom, njezinim opisom i skupinom kao oznakom (code).
- **Surfaces**: postojeći teren kao TIN, s linijama loma i vanjskom granicom kao izvornim podacima; i, kad platoi ili koridori uređuju teren, drugu TIN površinu nazvanu „Proposed“.
- **Alignments**: linije, lukovi i klotoidne prijelaznice sa stacionažama, svaka s profilom koji sadrži postojeći teren uzorkovan duž nje i projektirani profil (PVI i paraboličke krivine) kad ima barem dvije PVI točke.
- **PipeNetworks**: građevine s njihovim rubovima poklopaca, sabirnim jamama i dnom cijevi po cijevi, te cijevi s promjerom, duljinom i nagibom.
- **PlanFeatures**: svaka značajna linija kao linije i lukovi s kotom na svakom kraju i za što se koristi.

## Što ne putuje

- Platoi i koridori kao objekti. Njihov rezultat je u površini „Proposed“.
- Trase s greškama (na primjer preklapajuće krivine): izostavljene, i brojene u statusnoj poruci.
- Cijevi bez obje dna cijevi i mreže s manje od dvije građevine.
- Rub poklopca uzet s površine zapisuje se kao fiksni rub. Kad se ponovno otvori, građevina zadržava taj broj čak i ako se površina promijeni.
- Pravila mreže (najmanji nagib, nadsloj, pad): LandXML za njih nema mjesto.
- Postavke prikaza i izbori površina za skupine točaka: za to spremite CivilCraft projekt.

Pri otvaranju CivilCraft ne čita prijelaznice osim klotoidnih, mreže površina, točke koje samo upućuju na druge točke, parcele, prijelaznice u značajnim linijama, ceste ili podatke snimanja. Svaka je navedena u bilješkama, nikad pogođena.

## Povratni tokovi

Da biste posao predali nekome tko koristi drugi građevinski softver i dobili ga natrag, izvezite LandXML, pustite ih da urede i otvorite njihov LandXML kao novi projekt. Zadržite i vlastitu `.civilcraft.json` datoteku: to je jedina datoteka koja čuva sve što CivilCraft zna.
