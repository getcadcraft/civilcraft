---
title: Plano spausdinimas į PDF
summary: Spausdinkite viską ar dabartinį vaizdą į vektorinį PDF standartiniame lape inžineriniu ar metriniu mastelių, sluoksnių spalvomis ar juoda.
keywords: spausdinimas, braižymas, pdf, lapas, mastelis, popieriaus dydis, plano lapas, publikavimas, antraštės blokas, šiaurės rodyklė, mastelio juosta
from: 9af396ca
---

{{ui:PDF}} atspausdina planą į vektorinį PDF vienu lapu su antraštės juosta, šiaurės rodykle ir mastelio juosta. PDF sukuriamas naršyklėje ir atsisiunčiamas; jis neperduodamas per naršyklės spausdinimo langą.

## Braižymas

1. Nustatykite planą skiltyje **Rodymas**: rodomą paviršių, horizontalių intervalą ir tai, kas įjungta. Braižymas seka šiuos nustatymus.
2. Jei norite tik dalies sklypo, priartinkite ir perslinkite planą iki jos.
3. Spustelėkite {{ui:PDF}} grupėje **Eksportas** arba paspauskite {{key:Mod+P}}. Atsidaro langas **Plano spausdinimas į PDF**.
4. Pasirinkite **Plotas**: {{ui:Viskas}} arba {{ui:Kas matoma ekrane}}.
5. Pasirinkite **Popierius**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 arba A1. Pėdų projektas pradedamas Tabloid, metrų – A3. Lapai visada gulsčiai.
6. Pasirinkite **Mastelis**. Sąraše didžiausias tinkantis mastelis pažymimas žyma „(fits)“ ir pasirenkamas.
   - Pėdos: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metrai: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Pasirinkite **Spalvos**: {{ui:Sluoksnių spalvos}} arba {{ui:Juoda}}.
8. Perskaitykite eilutę po pasirinkimais. Joje nurodomas ploto dydis popieriuje ir lapo dydis, pavyzdžiui: „Plotas yra 297 × 222 mm, kai 1" = 40', lape 432 × 279 mm (gulsčias).“
9. Spustelėkite {{ui:Atsisiųsti PDF}}.
   Naršyklė atsisiunčia `<name>.pdf`. Būsenos juostoje rašoma „Nubraižyta <name>.pdf, 1" = 40'.“

Jei plotas didesnis už lapą pasirinktame mastelyje, braižinys centruojamas ir kraštai nukertami. Pasirinkite mastelį, pažymėtą „(fits)“, arba didesnį lapą.

## Kas yra lape

- Planas, centruotas braižymo srityje, kaip tikri vektoriai: horizontalės, žymos, trasos su stacionavimu, koridoriai, aikštelės ir dienos šviesos linijos, vamzdžiai, taškai.
- Linijų storiai pagal sluoksnį: trasos, aikštelės ir vamzdžiai storesni; trikampiai ir smulkios horizontalės – plonesni.
- Antraštės juosta palei apačią su projekto **Pavadinimu**, mastelio, horizontalių intervalo ir paviršiaus (esamo ar suprojektuoto) pastaba; dešinėje – data ir versija.
- Šiaurės rodyklė viršutiniame dešiniajame kampe (plano šiaurė nukreipta aukštyn) ir mastelio juosta antraštės juostoje.
- Žemėlapio sluoksniai po planu (paveikslėlis, žemėlapio plytelės ar žemėlapio paslauga), kai pažymėta **Žemėlapio sluoksniai po planu**: jie nubraižomi kaip vienas paveikslėlis visai braižymo sričiai 150 taškų colyje, po linijomis, o žemėlapio šaltinio nuoroda dedama antraštės juostoje. CivilCraft iki 8 sekundžių laukia žemėlapio paveikslėlių, kurie dar ateina; jei kai kurių vis dar trūksta, būsenos juostoje tai nurodoma.

Tekstui naudojamas PDF įmontuotas Helvetica šriftas. Simboliai, nepriklausantys Vakarų Europos rinkiniui (Windows-1252), spausdinami kaip „?“, o būsenos pranešime jie suskaičiuojami.

## Kas nespausdinama

- Aukščio juostos.
- Profilio vaizdas. Profilių braižymas dar nepasiekiamas.
- Daugiau nei vienas lapas (trasai naudokite [plano ir profilio lapus](topic:plan-profile-sheets)), vaizdo langai, pasirinktas antraštės blokas ar vertikalūs lapai.

:::note
Dialoge nurodoma, kad nuolydžio rodyklės rodomos tik ekrane. Šioje versijoje nuolydžio rodyklės, įjungtos skiltyje **Rodymas**, spausdinamos (ir eksportuojamos į DXF). Prieš spausdinimą jas išjunkite, jei jų nenorite.
:::

## Spausdinimas popieriuje

Atidarykite atsisiųstą PDF bet kuria PDF peržiūros programa ir spausdinkite 100 % (tikru dydžiu), kad mastelis liktų tikslus. „Pritaikyti prie puslapio“ keičia mastelį.
