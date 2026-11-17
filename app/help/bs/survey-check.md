---
title: Provjeri geodetski crtež pri uvozu
summary: Čitaj kote napisane kao tekst ili u atributima blokova kao geodetske tačke, i provjeri DWG ili DXF za pogrešne jedinice, nepostojeći koordinatni sistem, udaljen početak, ravne izohipse, neobične kote i dvostruke tačke prije nego izgradiš teren iz njega.
keywords: provjera geodetskog snimanja, provjera uvoza, geodetske kote, kote tačaka, kote kao tekst, atributi, jedinice, koordinatni sistem, daleko od početka, izohipse na nuli, odstupanja, dvostruke tačke, problemi, pejzažni arhitekta, geodetski crtež
from: d46acd24
---

Geodetski crtež može izgledati ispravno, a biti pogrešan za teren: jedinice su mu možda pogođene, izohipse mogu ležati ravno na visini 0, ili kote mogu biti napisane kao tekst koji uopšte nije geometrija. Odjeljak **Geodetske kote i provjera** u dijalogu {{ui:Linije}} (vidi [Otvori DWG ili DXF kao linije](topic:open-dwg-dxf)) čita te kote i kaže šta izgleda pogrešno prije nego išta bude dodano.

## Kote napisane kao tekst ili u atributima

Mnogi geodetski crteži daju kotu tačke kao mali tekst pored križića, kao što je `104.37` ili `EL 104.37`, ili kao atribut tačkastog bloka. To nisu linije, pa ih čitač linija izostavlja. Odjeljak navodi koliko ih je pronašao i omogućava da ih uzmete kao **geodetske tačke**:

1. Označi **Uzmi … kote kao geodetske tačke**. Početno nisu označene, jer nije svaki broj u crtežu visina.
2. Tekst se čita kada je kota sama za sebe: broj s decimalnim dijelom (`104.37`, `+104,37`, `-3.50`), ili broj iza `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` ili `LEVEL`, uz opcionalno `m`, `ft` ili `'` iza njega. Cijeli broj sam (`12`) čita se kao broj parcele ili lista, a ne kao kota; tekst kao što je `GATE 3` ili datum se nikada ne čita. Kodovi za oblikovanje teksta se ignorišu.
3. Za atribute blokova odaberi **Atribut bloka koji sadrži kotu**. CivilCraft sam pronalazi oznaku ELEV, Z, LEVEL, RL ili sličnu; odaberi drugu s liste ako crtež koristi svoju. Izbor se pamti za taj naziv datoteke na ovom računaru, pa se ponovnim otvaranjem počinje od iste oznake. Oznaka koju odaberete uzima i cijele brojeve kao kote.
4. Klikni {{ui:Dodaj}}. Tačke se numerišu nakon najvećeg broja u projektu, svaka tačka se opisuje svojim slojem (ili svojim blokom), a visine se pretvaraju u jedinice projekta kao i ostatak crteža. Sve je to jedan korak: {{key:Mod+Z}} uklanja tačke.

Tekst se nalazi na svojoj tački umetanja (ili tački poravnanja kada je ima). Tekst unutar blokova se ne čita, a crtež se nikada ne mijenja.

## Provjera

Provjera se izvodi nad onim što se spremate uvesti i navodi šta nalazi, po jedan red za svaku vrstu problema:

| Kaže | Šta znači |
|---|---|
| **Jedinice nisu navedene** | Crtež ne kaže koje su mu jedinice, pa se njegovi brojevi čitaju kao jedinice projekta. Provjeri jednu udaljenost koju poznaješ. |
| **Jedinice pretvorene** | Jedinice crteža razlikuju se od jedinica projekta i skaliraju se (napomena, a ne greška). |
| **Podaci obuhvataju … km** ili **… m** | Obuhvat je veći od 200 km ili manji od pola metra, što obično znači pogrešnu jedinicu (milimetri pročitani kao metri, ili obrnuto). |
| **Nema koordinatnog sistema** | Projekat ga nema. Upozorenje je kada podaci leže daleko od nule, kao koordinate državne ravnine ili nacionalne mreže. Vidi [Koordinatni sistemi](topic:coordinate-systems). |
| **Daleko od početka** | Podaci leže više od 100 km od nule. Daleko od nule, 3D prikazi i izvozi gube preciznost i trzaju. |
| **Sloj izohipsi … nema visinu** | Sloj nazvan kao izohipse (TOPO, CONT, CNTR, CONTOUR) sadrži linije na visini 0, pa bi teren iz njih bio ravan. |
| **Kote tačno 0** | Neke kote su 0, dok je tipična kota daleko od toga: vjerovatno nedostaju visine. |
| **Kote daleko od ostalih** | Nekoliko kota leži daleko van ostalih (provjereno prema sredini svih kota, pa strma lokacija sa širokim rasponom nije označena), ili iznad 9,000 m ili ispod -11,000 m. |
| **Tačke na drugoj tački** | Dvije tačke na istom mjestu, s istom kotom ili s različitim kotama. |

Nakon što kliknete {{ui:Dodaj}}, isti redovi idu u **Problemi**, po jedan za svaku vrstu, s nazivom datoteke, pa se možete vratiti na njih. Provjera ocjenjuje crtež; ništa u njemu ne mijenja i ne sprječava vas da ga koristite.

:::tip
Kada provjera kaže da su izohipse ravne na 0 i da postoje kote napisane kao tekst, uzmi kote kao geodetske tačke: često nose stvarne visine koje linijama izohipsi nedostaju.
:::

## Šta se ne provjerava

Provjera ne upoređuje crtež s drugim snimanjem i ne može reći u kojem je koordinatnom sistemu crtež: samo kaže da nijedan nije postavljen.
