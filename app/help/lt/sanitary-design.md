---
title: Buitinių nuotekų projektinių debitų skaičiavimas ir kanalizacijos patikra
summary: Įveskite žmones ir plotą, kurie patenka į kiekvieną buitinio tinklo šulinį; CivilCraft juos sumuoja tinkle žemyn, apskaičiuoja smailės debitą su smailės koeficientu ir infiltracija bei tikrina kiekvieno vamzdžio pajėgumą ir greitį.
keywords: buitinės nuotekos, kanalizacija, buitinė kanalizacija, nuotekos, projektinis debitas, smailės debitas, smailės koeficientas, harmon, babbitt, infiltracija, gyventojai, vienam asmeniui, procentas pilnas, savaiminis valymas, greitis, vamzdžių parinkimas, projektinė lentelė
from: 73ba197a
---

Buitinių nuotekų projektiniai debitai veikia [vamzdynų tinkle](topic:pipe-network), kai jo {{ui:Tipas}} yra {{ui:Buitinis}}. Kai nieko nepasirinkta, dešinysis skydelis tada rodo **Buitinių nuotekų projektiniai debitai**, o lietaus nuotekų tinklas rodo lietaus nuotekų duomenis.

## Įveskite, kas patenka

1. Pasirinkite šulinį. Skyriuje **Buitinių nuotekų projektiniai debitai** įveskite {{ui:Čia patenkantys gyventojai}} ir {{ui:Čia patenkantis plotas}} (hektarais metrų projekte, akrais pėdų projekte).
2. Parduotuvėms, biurams ar pramonei įveskite ekvivalentinius gyventojus: plotas, padaugintas iš gyventojų skaičiaus hektarui (arba akrui), kurį naudoja jūsų agentūra. Plotas skaičiuojamas infiltracijai abiem atvejais.
3. Kartokite kiekvienam šuliniui, kur prisijungia gatvė ar sklypas. Šulinys, kur niekas neprisijungia, abu lieka 0.

Kiekvienas vamzdis neša viską, kas patenka į jo viršutinį šulinį ir virš jo. Pasirinkite šulinį, kad pamatytumėte, kas per jį praeina.

## Nustatymai

| Nustatymas | Ką reiškia |
|---|---|
| {{ui:Debitas vienam žmogui}} | vidutinis vieno žmogaus debitas per dieną: litrais (metrų projekte) arba JAV galonais (pėdų projekte) |
| {{ui:Infiltration}} | požeminis vanduo, kuris įsiskverbia: litrai per sekundę hektarui arba galonai per dieną akrui |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), arba Babbitt, 5 / P^0.2, kur P – gyventojų skaičius tūkstančiais |
| {{ui:Piko koeficientas ne mažesnis nei}} / {{ui:Didžiausias smailės koeficientas}} | koeficientas laikomas tarp šių dviejų ribų |
| {{ui:Manning n}} | pajėgumui ir greičiui |
| {{ui:Mažiausias greitis}} / {{ui:Didžiausias greitis}} | smailės debito gylyje vamzdyje |
| {{ui:Didžiausia pilnos talpos dalis}} | kiek pilnas vamzdis gali būti esant smailei, procentais nuo to, ką jis neša tekėdamas pilnas |

Pradinės reikšmės yra vietos rezervuotės, ne standartas. Naudokite reikšmes, kurias skelbia jūsų agentūra.

## Ką jis apskaičiuoja

Kiekvienam vamzdžiui, tvarka pagal tėkmę:

- smailės debitas = žmonės × debitas vienam žmogui × piko koeficientas + plotas × infiltracija
- pajėgumas tekant pilnam (Manningo lygtis vamzdžio nuolydžiui) ir kiek pilnas jį daro smailė
- normalusis smailės debito gylis ir greitis jame

Lentelė **Buitinių nuotekų rezultatai** rodo kiekvieno vamzdžio žmones, piko koeficientą, smailės debitą (L/s arba gpm ir kubinės pėdos per sekundę), procentą pilną ir greitį. Problemos išvardytos po ja: vamzdis, pilnesnis nei riba, lėtesnis nei mažiausias greitis (jis gali neišsivalyti pats), greitesnis nei didžiausias, arba be nuolydžio. {{ui:Parinkite vamzdžių dydžius šiems srautams}} parenka kiekvienam vamzdžiui mažiausią standartinį dydį (200 mm arba 8 coliai ir daugiau), kuris neša jo smailę pagal ribą; vienas {{key:Mod+Z}} tai anuliuoja.

:::note
Tai stacionarus smailės debitas, kurį apskaičiuoja projektinė lentelė, patikrintas pagal paskelbtą projektinę lentelę iki jos atspausdinto apvalinimo. Tai ne kanalizacijos modelis laike: be hidrogramų, talpyklų, siurblių ar perpylimų. Žr. [Dar nepadaryta](topic:not-built-yet).
:::

Greičiai naudoja Manningo lygtį su tuo pačiu n kiekviename gylyje. Kai kurių agentūrų dalinio pilnumo diagramos leidžia n keistis su gyliu, o tai duoda šiek tiek mažesnį greitį vamzdyje, tekančiame 60–70 procentų pilnu (apie 3 procentais mažiau).
