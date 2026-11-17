---
title: Odprite DWG ali DXF kot črtovje
summary: Odprite črtovje risbe na tlorisu, sloj za slojem, uporabite njene plastnice, 3D polilinije in zaprte obrise za površje ter njene točke blokov spremenite v geodetske točke.
keywords: preverjanje geodetskih podatkov, višine besedila, dwg, dxf, cad, risba, črtovje, plastnice, prelomnice, meja, polilinija, 3D polilinija, sloji, podlaga, topo, geodetska risba, bloki, sklici na bloke, geodetske točke iz blokov, atributi, točkovni bloki, vstavitvena točka
from: da0f4c58
---

Topografska izmera pogosto pride kot risba: plastnice kot polilinije na svoji višini, prelomnice kot 3D polilinije, meja mesta kot zaprta polilinija. CivilCraft odpre **prostor modela** risbe kot sloje na tlorisu in lahko te črte neposredno spremeni v površje.

## Odprite risbo

1. Kliknite {{ui:Črtovje}} v skupini **Površje** (ali {{ui:Odpri}}, ali spustite datoteko na tloris) in izberite datoteko `.dwg` ali `.dxf`. Risba se bere na tem računalniku; nič se ne naloži. Berejo se DWG od 2000 do 2018 in ASCII DXF.
2. Pogovorno okno **Črtovje** navede sloje risbe, ki vsebujejo črte, zaprte oblike ali točke, in ali imajo **višine**. Sloji, ki so v risbi izklopljeni, so na začetku nekljukani. Besedilo, šrafure, kote in drugi predmeti, ki niso črtovje, se preštejejo in izpustijo (pogovorno okno pove, kateri).
3. Preverite **Enote risbe**. Ko risba pove svoje enote, CivilCraft jih pretvori v enote projekta (milimetre v metre, metre v čevlje, palce v čevlje). Risba v čevljih se prebere kot ameriški geodetski čevlji brez skaliranja: razlikujeta se za 2 dela na milijon, skaliranje koordinat državne ravnine pa bi jih premaknilo za čevlje. Kadar risba ne pove svojih enot, se njene številke preberejo v enotah projekta; izberite pravilne enote na seznamu, če niso.
4. V **Uporabi za površje** izberite, kaj vsak sloj da površju (ali pustite **Samo prikaži**). Sloji, poimenovani kot plastnice (TOPO, CONT, CNTR), ki imajo višine, se začnejo kot prelomnice.
5. Kliknite {{ui:Dodaj}}. Sloji se prikažejo pod **GIS sloji** v levem podoknu; vsaka uporaba se vnese v površje. Vsak del je svoj korak: {{key:Mod+Z}} jih odstranjuje po enega.

## Kaj lahko da vsaka vrsta sloja

| Sloj vsebuje | Uporaba za površje |
|---|---|
| Plastnice (polilinije na višini) | Prelomnice na lastni višini črte ali na polju ELEV |
| 3D polilinije | Prelomnice na njihovih lastnih višinah |
| Zaprt obris | Meja površja (največja zaprta oblika ali tista, ki ste jo izbrali) |
| Točke z višino | Geodetske točke, opisane z imenom sloja |
| Črte na višini 0 (črtovje tlorisa) | Nič: ostane na tlorisu kot osnovna risba |

Risba, ki jo je zapisal CivilCraft, ima svoje karakteristične črte kot 3D polilinije, ki si zapomnijo svoje loke. Pogovorno okno nato prikaže **Karakteristične črte**: pustite jo kljukano, da jih vrnete kot karakteristične črte z njihovimi loki in uporabami (en korak razveljavitve), ali jo odkljukajte, da se preberejo kot črtovje kot vsak drug sloj.

Pozneje uporabite {{ui:Uporabi za površje}} v meniju sloja pod **GIS sloji**, da naredite isto za sloj, ki ste ga samo prikazali.

## Geodetske točke iz blokov

Geodetske risbe pogosto nosijo svoje točke kot bloke: majhen simbol pri vsakem posnetku, z atributi za številko točke, opis in višino. Ko ima risba sklice na bloke, ima pogovorno okno razdelek **Geodetske točke iz blokov**:

1. Kljukajte bloke, ki jih želite vzeti (tabela pove, koliko sklicev ima vsak, na katerih slojih in katere atribute), ali kljukajte sloje, da vzamete vse sklice blokov na njih.
2. Izberite, od kod pridejo **številka**, **opis** in **višina** vsake točke: iz atributa, iz imena bloka ali sloja, iz naslednjih prostih številk ali iz Z vstavitvene točke. CivilCraft začne pri verjetnih atributih (PT, DESC, ELEV in podobnih) in vzame višino iz atributa samo, kadar so bloki na ničli.
3. Odkljukajte sloje črtovja, če želite samo točke, nato kliknite {{ui:Dodaj}}.

Vsak sklic postane ena geodetska točka na svoji vstavitveni točki. Štejejo samo sklici, postavljeni v prostoru modela; bloki, gnezdeni v drugih blokih, ne. Številke, ki so že v projektu ali so v risbi uporabljene dvakrat, dobijo nove številke za najvišjo; atribut višine, ki ni število, pusti tisto točko brez višine; vrstica stanja šteje oboje. Risba se ne spremeni, vsaka točka pa si zapomni svoj blok: njene Lastnosti prikažejo **Iz bloka** z blokom, slojem in ročajem. Dodajanje točk je en korak, zato {{key:Mod+Z}} vse odstrani.

## Višine, zapisane kot besedilo, in preverjanje

Višine točk, zapisane kot besedilo (ali v atributu bloka, ki ni blok geodetske točke), niso črtovje. Razdelek **Višine točk in preverjanje** jih lahko vzame kot geodetske točke in navede, kaj se zdi narobe z risbo: enote, koordinatni sistem, oddaljenost od ničle, ploske plastnice, nenavadne višine, podvojene točke. Glejte [Preverjanje geodetske risbe ob uvozu](topic:survey-check).

## Kako se risba prebere

- Loki, krogi, elipse, polilinijski segmenti z izbočenjem in zlepki postanejo kratki ravni kosi (največ na vsakih 5°).
- Bloki so narisani tam, kjer so postavljeni, tudi gnezdeni; kar blok nosi na sloju 0, prevzame sloj sklica.
- Predmeti, narisani v drugi ravnini (drugačna smer izvleka), so postavljeni v svetovne koordinate.
- Vsak predmet dobi tri polja: LAYER, TYPE (vrsta predmeta) in ELEV (njegova višina, kadar vse njegove točke delijo eno).
- Koordinate se vzamejo, kakor so: risba mora uporabljati iste koordinate kot projekt (na primer isto cono državne ravnine). Povezane risbe (zunanji sklici) se ne odprejo: odprite jih posebej.

:::tip
Risba s plastnicami da najboljše površje z nekaj točkami višin na vrhovih in v dolinah, kjer plastnice same pustijo ravne trikotnike. Dodajte jih kot geodetske točke ali iz sloja točk v risbi.
:::
