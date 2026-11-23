---
title: WaterCraft: paklausa, gaisrinis debitas, nutraukimai ir vandens amžius
summary: Su WaterCraft priedu paverskite vartotojus paklausa vandentiekio magistralėse, patikrinkite debitą, prieinamą kiekviename hidrante, sužinokite, kurio magistralės nutraukimas labiausiai kenkia, ir sekite vandens amžių bei chloro kiekį per parą.
keywords: watercraft, vandens paskirstymas, paklausa, vartotojai, piko koeficientas, paklausos profilis, gaisrinis debitas, hidrantas, liekamasis slėgis, kritiškumas, nutraukimas, uždaromas ruožas, vandens amžius, chloras, likutis, šaltinio sekimas, akligatvis, csv, priedas
from: 066fb17a
---

WaterCraft yra priedas, kuris veikia su vandens tinklu, kurį jau nubrėžėte naudodami vandentiekio magistralių įrankius. Jis prideda skirtuką dešiniajame skydelyje su keturiomis skiltimis.

:::warning
Tik skaičiavimo pagalbinė priemonė. Ji patikrinta palyginus su rankiniais atsakymais išgalvotuose tinkluose, o ne tikrame komunalinio ūkio modelyje. Kiekvieną rezultatą turi patikrinti vandens inžinierius. Scenarijai, valdymo taisyklės, vožtuvai ir lauko duomenys turi savo temas – „Scenarijai“ ir „Tyrimai“ – WaterCraft priedo žinyne.
:::

## Ką darysite

- Pridėsite vartotojus į tinklą kaip paklausą.
- Rasite hidrantus, kuriuose debito nepakanka.
- Rasite magistrales, kurių nutraukimas labiausiai svarbus.
- Rasite senas vandens atsargas ir mažą chloro kiekį.

## Žingsniai

1. Atidarykite {{ui:Parametrai}} › {{ui:Priedai}} ir įjunkite {{ui:WaterCraft (vandens paskirstymas)}}. Dešiniajame skydelyje atsiranda skirtukas {{ui:WaterCraft}}.
2. Pirmiausia nubrėžkite rezervuarą, mazgus ir vamzdžius naudodami vandentiekio magistralių įrankius (žr. [Vandentiekio magistralės](topic:water-mains)). Be tinklo skirtukas tai jums pasakys.
3. Skiltyje {{ui:Paklausos}} įklijuokite po vieną vartotoją eilutėje: id, x, y, rūšis, kiekis. Pasirinkite {{ui:Piko koeficientas}} ir {{ui:Valandinis profilis}} (gyvenamoji diena, komercinė diena, lygi arba palikite esamą profilį). Paspauskite {{ui:Tikrinti}}, kad pamatytumėte, kur patenka kiekvienas vartotojas (artimiausias mazgas), tada {{ui:Įdėti į tinklą}}. Anuliavimas pašalina paklausas.
4. Skiltyje {{ui:Gaisrinis debitas}} nustatykite reikalingą debitą ir liekamąjį slėgį, pasirinkite, ar liekamasis slėgis palaikomas {{ui:Tik prie hidranto}}, ar {{ui:Visoje sistemoje (griežčiau)}}, ir paspauskite {{ui:Ilgis}}. Kiekvienas hidrantas išvardijamas nuo blogiausio, kaip atitinka arba trūksta.
5. Skiltyje {{ui:Kuri magistralė svarbiausia}} pasirinkite {{ui:po vieną vamzdį}} arba {{ui:po vieną uždaromą ruožą}} ir paspauskite {{ui:Ilgis}}. Kiekvienas nutraukimas rodo atjungtą paklausą, atjungtus mazgus, naujai žemiau mažiausio slėgio patekusius mazgus ir likusį mažiausią slėgį.
6. Skiltyje {{ui:Vandens amžius ir chloras}} pasirinkite, ką sekti (vandens amžių, chlorą ar šaltinio pėdsaką), nustatykite valandas ir norimas ribas, ir paspauskite {{ui:Ilgis}}. Išvardijami mazgai, esantys už jūsų ribų.
7. Bet kurios lentelės apačioje paspauskite {{ui:Įrašyti kaip CSV}}, kad ją išsaugotumėte.

## Pastabos

- Reikalingas gaisrinis debitas ir vartojimas vienam namui ar akrui yra pradinės reikšmės, o ne standartai. Naudokite savo komunalinės įmonės reikšmes.
- Vamzdis, iš dalies nukirstas vožtuvu, uždaromas visas, todėl rodomas nutraukimas šiek tiek blogesnis nei tikras.
- Vandens kokybės skiltį paleiskite pakankamai ilgai, kad dienos profilis pasikartotų, prieš skaitydami paskutinę dieną.
- {{ui:Sustabdyti}} ankstina ilgą skaičiavimą; sąraše tada rodoma tik tai, kas buvo atlikta.
- Jūsų tinklas lieka šiame projekte ir šiame kompiuteryje. Niekas niekur neišsiunčiama.
