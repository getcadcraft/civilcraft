---
title: Preletne poti vozil
summary: Vozite vozilo s tremi prikolicami največ po karakteristični črti ali trasi, naprej ali vzvratno, ter poglejte površino, ki jo preleti, poti koles, krmiljenje in mesto, kjer se prikolica zaloma.
keywords: preletna pot, pot zavijanja, sledenje vozila, predloga zavijanja, projektno vozilo, tovornjak, avtobus, prikolica, polprikolica, vzvratna vožnja, zalomitev, členitev, zaklep krmiljenja, odmik zadnjih koles, pot koles, nakladalna rampa, polmer zavijanja
from: 8caafb8a
---

Preletna pot pelje vozilo po črti in prikaže tla, čez katera se premika njegovo telo. Uporabite jo za preverjanje, ali tovornjak lahko zavije v ovinku, doseže nakladalno rampo ali vzvratno postavi prikolico na mesto, ne da bi zapustil tlakovano površino.

## Vožnja vozila po črti

1. Narišite črto, po kateri vozilo vozi, v smeri vožnje: karakteristično črto (loki so v redu: med risanjem pritisnite {{key:C}}, glejte [Karakteristične črte](topic:feature-lines)) ali trasa.
2. Izberite jo in kliknite {{ui:Preletna pot…}} v njenih **Lastnostih**.
3. Pod **Začni z** izberite vozilo, nato nastavite njegove mere iz svojega projektnega vozila: širina, sprednji previs, medosje, zadnji previs, tir in **Zaklep krmiljenja**. Dodajte največ tri prikolice, vsako z mestom priklopa, dolžino od priklopa do osi, previsoma in **Največjo členitev**.
4. Izberite **Vožnjo**: naprej ali vzvratno. Kliknite {{ui:Odpelji}}.

:::warning
Vozila, s katerih začnete, so nadomestni podatki, ne standard. Mere nastavite po projektnem vozilu, ki ga uporablja vaš projekt.
:::

## Naprej in vzvratno

| Vožnja | Kaj sledi črti | Kaj CivilCraft izračuna |
|---|---|---|
| **Naprej** | Središče sprednje osi | Kam gredo zadnja os in vsaka prikolica, kot krmiljenja in členitve |
| **Vzvratno** | Središče zadnje osi (zadnji del prikolice) | Kam gre vsaka enota pred njo in krmiljenje, ki ga kabina potrebuje, da prikolico postavi tja |

Vzvratna vožnja se preverja tako: povejte, kam naj gre prikolica, in CivilCraft pove, ali kabina to zmore.

## Branje rezultata

Preletna pot je v tlorisu narisana oranžno: njen obris in črtkano poti najbolj zunanjih koles. Izberite jo (kliknite znotraj) in si v **Lastnostih** oglejte:

- **Prevožena dolžina**, največji kot **Krmiljenja** in **Členitve** glede na njune meje ter **Preletno površino**.
- Morebitne težave vzdolž črte z razdaljo: krmiljenje čez zaklep ali prikolica, ki se zavrti čez mejo členitve (se zaloma).
- **Vozilo vzdolž črte**: premaknite drsnik, da vidite vozilo na kateri koli točki, s krmiljenjem in členitvijo tam.

Spremenite črto, preletna pot sledi. {{ui:Uredi vozilo …}} spremeni mere; **Vožnja** preklaplja med naprej in vzvratno. Vsaka sprememba je en korak: {{key:Mod+Z}} jo razveljavi. {{key:Delete}} izbriše izbrano preletno pot (črta ostane).

Obris in poti koles gredo v PDF, DXF in DWG na sloj C-ROAD-SWPT.

## Kako se izračuna

Vsaka enota se zavrti okoli črte svoje zadnje osi in jo vleče točka pred njo (sprednja os ali priklop); to je nizkohitrostni model brez zdrsa, ki ga uporabljajo preverjanja preletnih poti. Preletna površina je seštevek obrisov telesa na vseh položajih. Ne modelira hitrosti, zdrsa gum, časa, ki ga krmiljenje potrebuje za zavijanje, krmiljenih prikolic ali proste višine pod karoserijo.
