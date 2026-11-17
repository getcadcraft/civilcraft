---
title: Razmena LandXML
summary: Otvorite LandXML iz drugog građevinskog softvera kao novi projekat, izvezite tačke, površi, osovine, profile i mrežu cevi kao LandXML 1.2, i saznajte šta ne prelazi.
keywords: landxml, xml, uvoz, izvoz, razmena, tin, površ, osovina trase, profil, mreža cevi, interoperabilnost, razmena podataka
from: 870d5ece
---

LandXML je otvoreni format za razmenu koji većina građevinskih programa čita i upisuje. CivilCraft čita i upisuje LandXML 1.2. Ako ste koristili Civil 3D, njegovi dijalozi za uvoz i izvoz LandXML-a su najbliži; ovde nema izbora koje treba praviti, a beleške vam kažu šta je ostalo napolju.

## Otvaranje LandXML datoteke

1. Kliknite {{ui:Otvori}} (ili pritisnite {{key:Mod+O}}) i izaberite datoteku `.xml` ili `.landxml`, ili je prevucite na plan.
2. Ako tekući projekat ima nesačuvane izmene, CivilCraft pita prvo. Izaberite {{ui:Sačuvaj kopiju}}, {{ui:Ne čuvaj}} ili {{ui:Otkaži}}.
3. Pravi se **novi projekat**. Statusna traka kaže šta je pročitano, na primer „Otvoren site.xml: 412 tačaka, 2 površi, 3 osovine.“
4. Pogledajte okvir ispod činjenica o **Površi**. Navodi sve što je preskočeno ili promenjeno, na primer:
   - „Otvorena je samo prva površ („EG“); u datoteci je još 1.“
   - „Osovina „Ramp A“ ima elemente koje CivilCraft još ne može da crta (nisu linije, lukovi ni klotoidne spirale); preskočena je.“
   - „Pravila mreže cevi nisu bila u datoteci; koriste se privremena pravila, postavite svoja pod Projekat.“

Šta postaje šta:

| U datoteci | U CivilCraft-u |
|---|---|
| Jedinice (Imperial ili Metric) | **Jedinice** projekta (stope ili metri) |
| Ime projekta | Ime projekta |
| CgPoints | Tačke projekta; opis (ili kod) daje grupu |
| Prva TIN površ | Postojeći teren, korišćen kakav jeste („Surface (from LandXML)“) |
| Svaka osovina od linija, lukova i klotoidnih spirala | Osovina sa svojim PI, poluprečnicima i dužinama spirala obnovljena iz krivina |
| Prvi projektovani profil svake osovine | Njen projektovani profil, sa paraboličnim vertikalnim krivinama |
| Prva mreža cevi | Mreža cevi, sa obodima, sump-ovima i invert-ima |
| Linije objekata od linija i lukova | Linije objekta, lukovi zadržani; iz drugog programa počinju kao **Samo nacrtano** |

Potpun spisak elemenata i atributa je u [LandXML: šta se čita i upisuje](topic:landxml-reference).

:::note
Površ učitana iz LandXML-a se ne obnavlja kad menjate grupe tačaka ili crtate linije prelamanja. Kliknite {{ui:Ponovo izgradi površinu iz tačaka}} u odeljku **Površ** da je napravite iz tačaka umesto toga ({{key:Mod+Z}} vraća LandXML površ).
:::

## Izvoz LandXML-a

1. Kliknite {{ui:LandXML}} u grupi **Izvoz**.
2. Pregledač preuzima `<ime>.xml`. Statusna traka kaže šta je ušlo, na primer „Izvezen LandXML 1.2: 276 tačaka, 2 površi, 1 osovina, mreža cevi. Podloge ovde nisu deo LandXML-a; nivelisana površ jeste.“

Datoteka sadrži:

- **Jedinice**: US survey stope ili metre.
- **CgPoints**: svaku tačku sa brojem kao imenom, opisom i grupom kao kodom.
- **Površi**: postojeći teren kao TIN, sa linijama prelamanja i spoljnom granicom kao izvornim podacima; i, kad podloge ili koridori nivelišu, drugu TIN površ nazvanu „Proposed“.
- **Osovine**: linije, lukove i klotoidne spirale sa stacionažama, svaku sa profilom koji sadrži postojeći teren uzorkovan duž nje i projektovani profil (PVI i paraboličke krivine) kad ima najmanje dve PVI.
- **PipeNetworks**: objekte sa njihovim obodima, sump-ovima i dnom (invert) po cevi, i cevi sa prečnikom, dužinom i nagibom.
- **PlanFeatures**: svaku liniju objekta kao linije i lukove sa kotom na svakom kraju, i čemu služi.

## Šta ne prelazi

- Podloge i koridori kao objekti. Njihov rezultat je u površi „Proposed“.
- Osovine sa greškama (na primer preklapajuće krivine): izostavljene i prebrojane u statusnoj poruci.
- Cevi bez oba invert-a, i mreže sa manje od dva objekta.
- Obod uzet sa površi se upisuje kao fiksni obod. Kad se ponovo otvori, objekat zadržava taj broj, čak i ako se površ promeni.
- Pravila mreže (najmanji nagib, pokrivenost, pad): LandXML za njih nema mesta.
- Podešavanja prikaza i izbor površi za grupe tačaka: sačuvajte projekat CivilCraft-a za to.

Pri otvaranju CivilCraft ne čita spirale osim klotoidnih, mrežaste površi, tačke koje samo upućuju na druge tačke, parcele (Parcels), spirale u linijama objekata, puteve (Roadways) ili podatke snimanja (Survey). Svaka je navedena u beleškama, nikad se ne pogađa.

## Povratni put

Da predate rad nekome ko koristi drugi građevinski softver i da ga dobijete nazad, izvezite LandXML, neka ga izmeni, i otvorite njegov LandXML kao novi projekat. Čuvajte i sopstveni `.civilcraft.json`: to je jedina datoteka koja čuva sve što CivilCraft zna.
