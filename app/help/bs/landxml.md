---
title: Razmjena LandXML
summary: Otvorite LandXML iz drugog građevinskog softvera kao novi projekat, izvezite tačke, površine, trase, profile i mrežu cijevi kao LandXML 1.2, i znajte šta ne prelazi.
keywords: landxml, xml, uvoz, izvoz, razmjena, tin, površina, trasa, profil, mreža cijevi, interoperabilnost, razmjena podataka
from: 870d5ece
---

LandXML je otvoreni format za razmjenu koji većina građevinskih programa čita i piše. CivilCraft čita i piše LandXML 1.2. Ako ste koristili Civil 3D, njegovi dijalozi za uvoz i izvoz LandXML-a su najbliži; ovdje nema izbora koji treba napraviti, a napomene vam kažu šta je izostavljeno.

## Otvaranje LandXML datoteke

1. Kliknite {{ui:Otvori}} (ili pritisnite {{key:Mod+O}}) i izaberite datoteku `.xml` ili `.landxml`, ili je prevucite na plan.
2. Ako tekući projekat ima nespašene promjene, CivilCraft prvo pita. Izaberite {{ui:Spasi kopiju}}, {{ui:Ne spašavaj}} ili {{ui:Otkaži}}.
3. Pravi se **novi projekat**. Statusna traka kaže šta je pročitano, na primjer „Otvoreno site.xml: 412 tačaka, 2 površine, 3 trase.“
4. Pogledajte okvir ispod činjenica o **Površini**. Navodi sve što je preskočeno ili promijenjeno, na primjer:
   - „Otvorena je samo prva površina („EG“); datoteka ima još 1.“
   - „Trasa „Ramp A“ ima elemente koje CivilCraft još ne može nacrtati (nisu linije, lukovi ni klotoidne spirale); preskočena je.“
   - „Pravila mreže cijevi nisu bila u datoteci; koriste se privremene vrijednosti — postavite svoja u odjeljku Projekat.“

Šta postaje šta:

| U datoteci | U CivilCraft-u |
|---|---|
| Jedinice (Imperial ili Metric) | **Jedinice** projekta (stope ili metri) |
| Naziv projekta | **Naziv** projekta |
| CgPoints | Tačke projekta; opis (ili kod) daje grupu |
| Prva TIN površina | Postojeći teren, korišten kakav jeste („Surface (from LandXML)“) |
| Svaka trasa linija, lukova i klotoidnih spirala | Trasa sa svojim PI-jevima, radijusima i dužinama spirala, obnovljena iz krivina |
| Prvi projektovani profil svake trase | Njen projektovani profil, sa paraboličnim vertikalnim krivinama |
| Prva mreža cijevi | Mreža cijevi, sa rubovima, sabirnim jamama i invertima |
| Karakteristične linije linija i lukova | Karakteristične linije, lukovi zadržani; iz drugog programa počinju kao **Samo nacrtano** |

Puni spisak elemenata i atributa je u [LandXML: šta se čita i piše](topic:landxml-reference).

:::note
Površina pročitana iz LandXML-a se ne obnavlja kada promijenite grupe tačaka ili nacrtate linije loma. Kliknite {{ui:Ponovo izgradi površinu iz tačaka}} u odjeljku **Površina** da je izgradite iz tačaka umjesto toga ({{key:Mod+Z}} vraća površinu iz LandXML-a).
:::

## Izvoz LandXML-a

1. Kliknite {{ui:LandXML}} u grupi **Izvoz**.
2. Pregledač preuzima `<naziv>.xml`. Statusna traka kaže šta je ušlo, na primjer „Izvezen LandXML 1.2: 276 tačaka, 2 površine, 1 trasa, mreža cijevi. Platoi ovdje nisu dio LandXML-a; nivelisana površina jeste.“

Datoteka sadrži:

- **Jedinice**: američke geodetske stope ili metri.
- **CgPoints**: svaka tačka sa brojem kao nazivom, svojim opisom i grupom kao kodom.
- **Površine**: postojeći teren kao TIN, sa svojim linijama loma i vanjskom granicom kao izvornim podacima; i, kada platoi ili koridori nivelišu, drugu TIN površinu nazvanu „Proposed“.
- **Trase**: linije, lukovi i klotoidne spirale sa svojim stacionažama, svaka sa profilom koji sadrži postojeći teren uzet duž nje i projektovani profil (PVI-jevi i parabolične krivine) kada ima najmanje dva PVI-ja.
- **PipeNetworks**: objekti sa svojim rubovima, sabirnim jamama i invertom po cijevi, te cijevi sa prečnikom, dužinom i nagibom.
- **PlanFeatures**: svaka karakteristična linija kao linije i lukovi sa kotom na svakom kraju, i za šta se koristi.

## Šta ne ide na put

- Platoi i koridori kao objekti. Njihov rezultat je u površini „Proposed“.
- Trase sa greškama (na primjer preklapajuće krivine): izostavljene, i prebrojane u statusnoj poruci.
- Cijevi bez oba inverta, i mreže sa manje od dva objekta.
- Rub uzet iz površine zapisuje se kao fiksni rub. Kad se ponovo otvori, objekat zadržava taj broj čak i ako se površina promijeni.
- Pravila mreže (najmanji nagib, pokrivka, pad): LandXML za njih nema mjesta.
- Postavke prikaza i izbori površine za grupe tačaka: za njih spasite CivilCraft projekat.

Pri otvaranju, CivilCraft ne čita spirale osim klotoidnih, mrežaste površine, tačke koje samo upućuju na druge tačke, parcele, spirale u karakterističnim linijama, puteve ili podatke geodetskog snimanja. Svaka se navodi u napomenama, nikada se ne pogađa.

## Povratne razmjene

Da predate rad nekome ko koristi drugi građevinski softver i dobijete ga nazad, izvezite LandXML, neka ga uredi, i otvorite njegov LandXML kao novi projekat. Zadržite i vlastiti `.civilcraft.json`: to je jedina datoteka koja čuva sve što CivilCraft zna.
