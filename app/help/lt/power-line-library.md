---
title: Jūsų elektros linijų biblioteka
summary: Kurkite savo laidininkus, požeminius kabelius, atramas, įrangą ir tranšėjų tipus kategorijose, kurias pavadinate, ir dalykitės jais kaip failais.
keywords: biblioteka, laidininkas, kabelis, stulpas, atrama, skersinis, izoliatorius, tvirtinimo detalė, laikiklis, transformatorius, spintelė, jungė, tranšėja, kategorija, csv, importas, eksportas
from: 88733744
---

Elektros linijų darbo srities skiltyje **Biblioteka** laikomi visi elementai, kuriuos gali naudoti linija ar kabelis. Niekas joje nėra susieta su šalimi ar gamintoju: elementus kuriate patys, su kuriais dirbate.

## Trys elementų rūšys

| Rūšis | Kur laikoma | Ar galite jį keisti? |
|---|---|---|
| **Pavyzdžiai** | Pateikiami kartu su CivilCraft, su bendrais skaičiais, apskaičiuotais pagal medžiagų savybes | Ne: pirmiausia {{ui:Kopijuoti į mano biblioteką}} |
| **Projekte** | Atėjo kartu su jūsų atverstu projekto failu | Ne: pirmiausia {{ui:Kopijuoti į mano biblioteką}} |
| **Mano** | Jūsų pačių elementai, saugomi šioje naršyklėje | Taip, ir pakeitimai įrašomi iš karto |

Kiekvienas projektas saugo kiekvieno naudojamo elemento kopiją, todėl projektas atsidaro bet kuriame kompiuteryje su savo laidininkais ir stulpais.

:::warning
Pavyzdiniai elementai yra tik pavyzdžiai: patikrinkite kiekvieną skaičių pagal savo tiekėjo duomenis. Požeminių kabelių srovės nominalioji vertė tyčia nenurodyta, nes ji priklauso nuo to, kaip kabelis nutiestas.
:::

## Sukurkite elementą

1. **Biblioteka** skiltyje pasirinkite **Rūšį** (oro laidininkai, požeminiai kabeliai, atramos, įranga ar tranšėjų tipai).
2. Spustelėkite {{ui:Naujas elementas}} arba pasirinkite pavyzdį ir spustelėkite {{ui:Kopijuoti į mano biblioteką}} arba {{ui:Dubliuoti}}.
3. Užpildykite jo laukus. Laukai, pažymėti `*`, yra tie, kurių reikia patikroms; elementas, kuriam trūksta vieno iš jų, pažymimas `!` ir, kai linija jį naudoja, rodomas skiltyje **Patikros**.
4. Nurodykite jam **Kategoriją**, lygius atskirdami `/`: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. Medis seka jūsų kategorijas.

Kiekvienai rūšiai reikia:

| Rūšis | Reikalinga patikroms |
|---|---|
| Oro laidininkas | skerspjūvis, skersmuo, masė metrui, tempiamasis stipris, tamprumo modulis, šiluminis plėtimasis |
| Požeminis kabelis | gyslos, skerspjūvis, įtampa, skersmuo, varža, srovės nominalioji vertė |
| Atrama | bendras ilgis, nominalioji apkrova (imama taške žemiau viršaus), gylis žemėje |
| Įranga | jos tipas; nominalioji apkrova skersiniams, detalėms ir laikikliams; fazių tarpas ir nusvyrimas skersiniams; ilgis izoliatoriams; kampas laikikliams |
| Tranšėjos tipas | gylis, plotis, danga virš kabelių |

## Dalijimasis

- {{ui:Įrašyti mano biblioteką}} įrašo visus jūsų elementus į vieną `.cclines.json` failą; {{ui:Atidaryti biblioteką…}} nuskaito vieną tokį failą atgal (elementai su tuo pačiu raktu pakeičiami).
- {{ui:Įrašyti kaip CSV}} įrašo rūšį, kurią žiūrite, kaip skaičiuoklės lentelę; {{ui:Atidaryti biblioteką…}} nuskaito tos rūšies CSV atgal. Stulpeliai gali būti bet kokia tvarka; kabliataškiais atskirtame faile gali būti dešimtainis kablelis.
