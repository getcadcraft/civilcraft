---
title: Proveri geodetski crtež pri uvozu
summary: Čitaj kote napisane tekstom ili u atributima blokova kao geodetske tačke i proveri DWG ili DXF za pogrešne jedinice, nedostatak koordinatnog sistema, udaljen početak, ravne izohipse, neobične kote i dupla mesta pre nego što iz njega izgradite teren.
keywords: provera geodetskog crteža, provera pri uvozu, geodetske kote, kote tekstom, atributi, jedinice, koordinatni sistem, daleko od početka, izohipse na nuli, odstupanja, dupli tačke, problemi, pejzažni arhitekta, geodetski crtež
from: d46acd24
---

Geodetski crtež može izgledati ispravno, a biti pogrešan za teren: njegove jedinice mogu biti pogođene, njegove izohipse mogu ležati ravno na visini 0, ili su kote napisane kao tekst koji uopšte nije geometrija. Odeljak **Geodetske kote i provera** u dijalogu {{ui:Linework}} (videti [Otvori DWG ili DXF kao linije](topic:open-dwg-dxf)) čita te kote i kaže šta izgleda pogrešno pre nego što bilo šta bude dodato.

## Kote napisane kao tekst ili u atributima

Mnogi geodetski crteži daju kotu tačke kao mali tekst pored krsta, kao `104.37` ili `EL 104.37`, ili kao atribut tačkastog bloka. To nisu linije, pa čitač linija ih izostavlja. Odeljak navodi koliko ih je našao i dozvoljava da ih uzmete kao **geodetske tačke**:

1. Štiklirajte **Uzmi … kota kao geodetske tačke**. Ta polja su na početku neštiklirana, jer nije svaki broj u crtežu visina.
2. Tekst se čita kada je kota sama za sebe: broj sa decimalnim delom (`104.37`, `+104,37`, `-3.50`), ili broj posle `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` ili `LEVEL`, uz opcioni `m`, `ft` ili `'` iza njega. Sam ceo broj (`12`) čita se kao broj parcele ili lista, a ne kao kota; tekst poput `GATE 3` ili datum se nikada ne čita. Kodovi za oblikovanje teksta se ignorišu.
3. Za atribute blokova izaberite **Atribut bloka koji sadrži kotu**. CivilCraft sam pronalazi oznaku ELEV, Z, LEVEL, RL ili sličnu; izaberite drugu sa spiska ako crtež koristi svoju. Izbor se pamti za to ime datoteke na ovom računaru, pa se ponovno otvaranje započinje sa istom oznakom. Oznaka koju izaberete uzima i cele brojeve kao kote.
4. Kliknite {{ui:Add}}. Tačke se numerišu posle najvećeg broja u projektu, svaka tačka se opisuje svojim slojem (ili svojim blokom), a visine se pretvaraju u jedinice projekta kao i ostatak crteža. Sve to je jedan korak: {{key:Mod+Z}} uklanja tačke.

Tekst stoji na sopstvenoj tački umetanja (ili na tački poravnanja, ako je ima). Tekst unutar blokova se ne čita, a crtež se nikada ne menja.

## Provera

Provera se izvodi nad onim što tek treba da uvezete i navodi šta nalazi, po jedan red za svaku vrstu problema:

| Kaže | Šta to znači |
|---|---|
| **Jedinice nisu navedene** | Crtež ne kaže koje su mu jedinice, pa se njegovi brojevi čitaju kao jedinice projekta. Proverite jedno rastojanje koje znate. |
| **Jedinice pretvorene** | Jedinice crteža se razlikuju od jedinica projekta i skaliraju se (napomena, a ne greška). |
| **Podaci zauzimaju … km** ili **… m** | Obuhvat je veći od 200 km ili manji od pola metra, što obično znači pogrešnu jedinicu (milimetri pročitani kao metri, ili obrnuto). |
| **Nema koordinatnog sistema** | Projekat ga nema. Upozorenje je kada su podaci daleko od nule, kao što su koordinate državne ravni ili nacionalne mreže. Videti [Koordinatni sistemi](topic:coordinate-systems). |
| **Daleko od početka** | Podaci leže više od 100 km od nule. Daleko od nule, 3D prikazi i izvozi gube preciznost i tresu se. |
| **Sloj izohipsi … nema visinu** | Sloj nazvan kao izohipse (TOPO, CONT, CNTR, CONTOUR) sadrži linije na visini 0, pa bi teren izgrađen iz njih bio ravan. |
| **Kote tačno 0** | Neke kote su 0, dok je tipična kota daleko od toga: verovatno nedostaju visine. |
| **Kote daleko od ostalih** | Nekoliko kota leži daleko izvan ostalih (meri se prema sredini svih kota, pa strmo mesto sa širokim rasponom nije označeno), ili iznad 9,000 m ili ispod -11,000 m. |
| **Tačke na drugoj tački** | Dve tačke na istom mestu sa istom kotom, ili sa različitim kotama. |

Nakon što kliknete {{ui:Add}}, isti redovi odlaze u **Problemi**, po jedan za svaku vrstu, sa imenom datoteke, da biste mogli da se vratite na njih. Provera ocenjuje crtež; ništa u njemu ne menja i ne sprečava vas da ga koristite.

:::tip
Kada provera kaže da su izohipse ravne na 0 i da postoje kote napisane tekstom, uzmite kote kao geodetske tačke: one često nose stvarne visine koje izohipsama nedostaju.
:::

## Šta se ne proverava

Provera ne upoređuje crtež sa drugim snimanjem i ne može da kaže u kom je koordinatnom sistemu crtež: samo kaže da nijedan nije podešen.
