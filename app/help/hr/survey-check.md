---
title: Provjerite geodetski nacrt pri uvozu
summary: Pročitajte kote zapisane kao tekst ili u atributima blokova kao točke snimanja i provjerite DWG ili DXF zbog pogrešnih jedinica, nedostatka koordinatnog sustava, udaljenog ishodišta, ravnih izohipsa, neobičnih kota i udvojenih točaka prije nego što iz njega izgradite teren.
keywords: provjera snimke, provjera uvoza, kote snimanja, kote na točkama, tekstualne kote, kote kao tekst, atributi, jedinice, koordinatni sustav, daleko od ishodišta, izohipse na nuli, odstupanja, udvojene točke, problemi, krajobrazni arhitekt, geodetski nacrt
from: d46acd24
---

Geodetski nacrt može izgledati ispravno, a ipak biti neispravan za teren: njegove jedinice mogu biti pogođene, izohipse mogu ležati ravno na visini 0, ili kote mogu biti zapisane kao tekst koji uopće nije geometrija. Odjeljak **Kote snimanja i provjera** u dijaloškom okviru {{ui:Linije}} (vidi [Otvaranje DWG ili DXF datoteke kao linija](topic:open-dwg-dxf)) čita te kote i kaže što izgleda neispravno prije nego što se bilo što doda.

## Kote zapisane kao tekst ili u atributima

Mnogi geodetski nacrti daju kotu na točki kao mali tekst uz križić, poput `104.37` ili `EL 104.37`, ili kao atribut bloka točke. To nisu linije, pa ih čitač linija ispušta. Odjeljak navodi koliko ih je pronađeno i omogućuje da ih uzmete kao **točke snimanja**:

1. Označite **Uzmi … kote kao točke snimanja**. Na početku nisu označene, jer nije svaki broj na nacrtu visina.
2. Tekst se čita kada je kota sama za sebe: broj s decimalnim dijelom (`104.37`, `+104,37`, `-3.50`) ili broj iza `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` ili `LEVEL`, uz opcionalno `m`, `ft` ili `'` iza njega. Cijeli broj sam za sebe (`12`) čita se kao broj čestice ili lista, a ne kao kota; tekst poput `GATE 3` ili datum se nikada ne čita. Kodovi za oblikovanje teksta se zanemaruju.
3. Za atribute blokova odaberite **Atribut bloka koji sadrži kotu**. CivilCraft sam pronalazi oznaku ELEV, Z, LEVEL, RL ili sličnu; odaberite drugu s popisa ako nacrt koristi svoju. Izbor se pamti za taj naziv datoteke na ovom računalu, pa se pri ponovnom otvaranju počinje s istom oznakom. Oznaka koju odaberete uzima i cijele brojeve kao kote.
4. Kliknite {{ui:Dodaj}}. Točke se numeriraju nakon najvećeg broja u projektu, svaka točka opisuje se sa svojim slojem (ili svojim blokom), a visine se pretvaraju u jedinice projekta kao i ostatak nacrta. Sve je to jedan korak: {{key:Mod+Z}} uklanja točke.

Tekst se nalazi na vlastitoj točki umetanja (ili na točki poravnanja ako je ima). Tekst unutar blokova se ne čita, a nacrt se nikada ne mijenja.

## Provjera

Provjera se izvodi na onome što ćete uvesti i navodi što pronalazi, jedan redak za svaku vrstu problema:

| Kaže | Što znači |
|---|---|
| **Jedinice nisu navedene** | Nacrt ne navodi koje su mu jedinice, pa se njegovi brojevi čitaju kao jedinice projekta. Provjerite jednu udaljenost koju znate. |
| **Jedinice pretvorene** | Jedinice nacrta razlikuju se od jedinica projekta i prilagođene su mjerilom (napomena, a ne greška). |
| **Podaci obuhvaćaju … km** ili **… m** | Opseg je veći od 200 km ili manji od pola metra, što obično znači pogrešnu jedinicu (milimetri čitani kao metri ili obrnuto). |
| **Nema koordinatnog sustava** | Projekt ga nema. To je upozorenje kada su podaci daleko od nule, kao što su koordinate državne ravnine ili nacionalne mreže. Vidi [Koordinatni sustavi](topic:coordinate-systems). |
| **Daleko od ishodišta** | Podaci su više od 100 km od nule. Daleko od nule, 3D prikazi i izvozi gube preciznost i trzaju. |
| **Sloj izohipsi … nema visinu** | Sloj imenovan kao izohipse (TOPO, CONT, CNTR, CONTOUR) sadrži linije na visini 0, pa bi teren izgrađen iz njih bio ravan. |
| **Kote točno 0** | Neke kote su 0, dok je tipična kota daleko od toga: vjerojatno nedostaju visine. |
| **Kote daleko od ostalih** | Nekoliko kota leži daleko izvan ostalih (mjereno u odnosu na sredinu svih kota, pa strma lokacija s velikim rasponom nije označena), ili iznad 9,000 m ili ispod -11,000 m. |
| **Točke na drugoj točki** | Dvije točke na istom mjestu s istom kotom ili s različitim kotama. |

Nakon što kliknete {{ui:Dodaj}}, isti se redci šalju u **Problemi**, po jedan za svaku vrstu, s nazivom datoteke, da se možete vratiti na njih. Provjera ocjenjuje nacrt; ne mijenja ga, i ne sprječava vas da ga upotrijebite.

:::tip
Kada provjera kaže da su izohipse ravne na 0 i da postoje kote zapisane kao tekst, uzmite kote kao točke snimanja: često nose stvarne visine koje izohipsama nedostaju.
:::

## Što se ne provjerava

Provjera ne uspoređuje nacrt s drugom snimkom i ne može utvrditi u kojem je koordinatnom sustavu nacrt: samo vam kaže da nijedan nije postavljen.
