---
title: Delovno okolje Daljnovodi
summary: Nadzemne linije in podzemni kabli na vašem obstoječem projektu z vašimi knjižnicami, povesanjem in napetostjo pri vaših obtežnih primerih, preverjanji odmikov in trdnosti, tabelami napenjanja, količinami, listi in izvozom v GIS.
keywords: daljnovod, nadzemna linija, električna, distribucija, drogovi, podpore, vodnik, povesanje, napetost, napenjanje, odmik, podzemni kabel, jarek, delovno okolje, komunala
from: 638dd856
---

Delovno okolje Daljnovodi postavi nadzemne linije in podzemne kable na obstoječi projekt CivilCraft: enake geodetske točke, enak teren, enako datoteko projekta.

:::warning
Pripomoček za načrtovanje. Delovno okolje izračuna povesanje, napetost, odmike in obremenitve iz **vaših** obtežnih primerov in mejnih vrednosti; v njem ni vgrajen noben nacionalni standard. Inženir preveri vsak rezultat glede na veljavni standard, preden se karkoli zgradi.
:::

## Odprtje

Izberite {{ui:Površje}} › {{ui:Več}} › {{ui:Delovno okolje daljnovodov}} ali **Daljnovodi** pod Delovno okolje. Orodna vrstica nato prikaže skupino **Daljnovodi**; skupini Načrtovanje in GIS se umakneta. Za vrnitev izberite **Civil** pod Delovno okolje. CivilCraft si na tem računalniku zapomni delovno okolje, ki ste ga nazadnje uporabljali.

Levi panel na vrhu pridobi dva razdelka:

- **Daljnovodi**: vaši obtežni primeri in meje, linije in kabli v projektu ter **Preverjanja**, vedno posodobljena. Kliknite preverjanje, da izberete, na kaj se nanaša.
- **Knjižnica**: vaši lastni vodniki, kabli, podpore, oprema in tipi jarkov. Glejte [Vaša knjižnica daljnovodov](topic:power-line-library).

## Kaj je v skupini Daljnovodi

| Orodje | Kaj počne | Tema |
|---|---|---|
| **Linija** | Nadzemna linija: kliknite vsako podporo | [Risanje nadzemne linije](topic:overhead-line) |
| **Podpora** | Dodajte podporo na razpon | [Risanje nadzemne linije](topic:overhead-line) |
| **Kabel** | Trasa podzemnega kabla v jarku | [Podzemni kabli](topic:underground-cables) |
| **Oprema** | Omara, transformator, spojka ali vir, iz katerega se omrežje napaja | [Podzemni kabli](topic:underground-cables) |
| **Ovira** | Nekaj, kar linija seka: cesta, stavba, druga linija | [Preverjanja](topic:power-line-checks) |
| **Vzdolžni profil** | Profil linije: teren, podpore in vodnik pri vsakem obtežnem primeru | [Risanje nadzemne linije](topic:overhead-line#the-line-profile) |
| **Več** | Obtežni primeri in meje, tabele napenjanja, količine, listi in poročilo, GIS, študijske datoteke | [Povesanje in napetost](topic:sag-and-tension), [Izhodi](topic:power-line-outputs), [Študijske datoteke](topic:power-line-study-file) |

Vse, kar dodate, je en korak razveljavitve, shrani se v datoteko projekta in riše v tlorisu na slojih z imenom `C-POWR-…`, zato ga vsebujejo tudi izvozi v DXF, DWG in PDF.
