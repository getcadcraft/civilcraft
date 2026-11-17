---
title: LandXML keitimas
summary: Atidarykite LandXML iš kitos civilinės programinės įrangos kaip naują projektą, eksportuokite taškus, paviršius, trasas, profilius ir vamzdynų tinklą kaip LandXML 1.2 ir žinokite, kas neišeina.
keywords: landxml, xml, importas, eksportas, keitimas, tin, paviršius, trasa, profilis, vamzdynų tinklas, sąveika, duomenų keitimas
from: 870d5ece
---

LandXML yra atviras keitimo formatas, kurį skaito ir įrašo dauguma civilinių programų. CivilCraft nuskaito ir įrašo LandXML 1.2. Jei naudojote Civil 3D, jo LandXML importo ir eksporto langai yra artimiausi atitikmenys; čia pasirinkimų nereikia, o pastabos nurodo, kas buvo praleista.

## LandXML failo atidarymas

1. Spustelėkite {{ui:Atidaryti}} (arba paspauskite {{key:Mod+O}}), pasirinkite `.xml` arba `.landxml` failą arba jį nuleiskite ant plano.
2. Jei dabartiniame projekte yra neįrašytų pakeitimų, CivilCraft pirmiausia klausia. Pasirinkite {{ui:Įrašyti kopiją}}, {{ui:Neįrašyti}} arba {{ui:Atšaukti}}.
3. Sukuriamas **naujas projektas**. Būsenos juostoje rašoma, kas buvo nuskaityta, pavyzdžiui: „Atidaryta site.xml: 412 taškų, 2 paviršiai, 3 trasos.“
4. Pažiūrėkite į langelį po **Paviršiaus** faktais. Jame išvardijama viskas, kas buvo praleista ar pakeista, pavyzdžiui:
   - „Atidarytas tik pirmas paviršius („EG“); faile yra dar 1.“
   - „Trasa „Ramp A“ turi elementų, kurių CivilCraft dar negali nubrėžti (ne linijų, lankų ar klotoidinių spiralių); ji praleista.“
   - „Vamzdynų tinklo taisyklių faile nebuvo; naudojamos vietos rezervo reikšmės – nustatykite savo skiltyje Projektas.“

Kas virsta kuo:

| Faile | CivilCraft |
|---|---|
| Vienetai (Imperial arba Metric) | Projekto **vienetai** (pėdos arba metrai) |
| Projekto pavadinimas | Projekto **pavadinimas** |
| CgPoints | Projekto taškai; aprašymas (arba kodas) nurodo grupę |
| Pirmas TIN paviršius | Esamas gruntas, naudojamas kaip yra („Paviršius (iš LandXML)“) |
| Kiekviena trasa iš linijų, lankų ir klotoidinių spiralių | Trasa su PI, spinduliais ir spiralių ilgiais, atkurta iš kreivių |
| Pirmas kiekvienos trasos projektinis profilis | Jo projektinis profilis su parabolinėmis vertikaliosiomis kreivėmis |
| Pirmas vamzdynų tinklas | Vamzdynų tinklas su kraštais, duobėmis ir invertais |
| Charakteringųjų linijų plano elementai iš linijų ir lankų | Charakteringos linijos, lankai išlaikomi; iš kitos programos jos pradeda kaip **Tik nubraižyta** |

Pilnas elementų ir atributų sąrašas pateiktas [LandXML: kas nuskaitoma ir įrašoma](topic:landxml-reference).

:::note
Paviršius, nuskaitytas iš LandXML, neperstatomas, kai keičiate taškų grupes ar braižote lūžio linijas. Spustelėkite {{ui:Atkurti paviršių iš taškų}} skiltyje **Paviršius**, kad jį sukurtumėte iš taškų ({{key:Mod+Z}} grąžina LandXML paviršių).
:::

## LandXML eksportas

1. Spustelėkite {{ui:LandXML}} grupėje **Eksportas**.
2. Naršyklė atsisiunčia `<name>.xml`. Būsenos juostoje rašoma, kas buvo įtraukta, pavyzdžiui: „Eksportuotas LandXML 1.2: 276 taškai, 2 paviršiai, 1 trasa, vamzdynų tinklas. Aikštelės čia nėra LandXML dalis; yra formuojamas paviršius.“

Faile yra:

- **Vienetai**: JAV geodezinės pėdos arba metrai.
- **CgPoints**: kiekvienas taškas su jo numeriu kaip pavadinimu, aprašymu ir grupe kaip kodu.
- **Paviršiai**: esamas gruntas kaip TIN su lūžio linijomis ir išorine riba kaip šaltinio duomenys; ir, kai aikštelės ar koridoriai formuoja gruntą, antras TIN paviršius pavadinimu „Proposed“.
- **Trasos**: linijos, lankai ir klotoidinės spiralės su stotimis, kiekviena su profiliu, kuriame yra palei ją paimtas esamas gruntas ir projektinis profilis (PVI ir parabolinės kreivės), kai jame yra bent du PVI.
- **PipeNetworks**: konstrukcijos su kraštais, duobėmis ir invertu kiekvienam vamzdžiui, bei vamzdžiai su skersmeniu, ilgiu ir nuolydžiu.
- **PlanFeatures**: kiekviena charakteringa linija kaip linijos ir lankai su aukščiu kiekviename gale bei tuo, kam ji naudojama.

## Kas nekeliauja

- Aikštelės ir koridoriai kaip objektai. Jų rezultatas yra „Proposed“ paviršiuje.
- Trasos su klaidomis (pvz., persidengiančios kreivės): praleidžiamos ir įskaičiuojamos būsenos pranešime.
- Vamzdžiai be abiejų invertų ir tinklai su mažiau nei dviem konstrukcijomis.
- Kraštas, paimtas iš paviršiaus, įrašomas kaip fiksuotas kraštas. Atidarius iš naujo, konstrukcija išlaiko tą skaičių, net jei paviršius pasikeičia.
- Tinklo taisyklės (mažiausias nuolydis, gruntas virš vamzdžio, kritimas): LandXML joms vietos neturi.
- Rodymo nustatymai ir taškų grupių paviršiaus pasirinkimai: tam įrašykite CivilCraft projektą.

Atidarant CivilCraft neskaito spiralių, kitų nei klotoidinės, tinklelio paviršių, taškų, kurie tik nurodo kitus taškus, sklypų, spiralių charakteringose linijose, kelių ar geodezinių duomenų. Kiekvienas jų nurodomas pastabose, niekada neatspėjamas.

## Grįžtamieji ciklai

Norėdami perduoti darbą kam nors, naudojančiam kitą civilinę programinę įrangą, ir gauti jį atgal, eksportuokite LandXML, leiskite jam redaguoti ir atidarykite jo LandXML kaip naują projektą. Savo `.civilcraft.json` taip pat saugokite: tai vienintelis failas, kuriame išsaugoma viskas, ką žino CivilCraft.
