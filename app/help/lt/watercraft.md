---
title: WaterCraft: poreikiai, gaisrinis debitas, atjungimai ir vandens amžius
summary: Su WaterCraft priedu paverskite vartotojus vandentiekio magistralių poreikiais, patikrinkite, koks debitas galimas prie kiekvieno hidranto, sužinokite, kurios magistralės atjungimas labiausiai skaudina, ir sekite vandens amžių bei chloro kiekį per parą.
keywords: watercraft, vandens paskirstymas, poreikiai, vartotojai, piko koeficientas, poreikio modelis, gaisrinis debitas, hidrantas, likutinis slėgis, kritiškumas, atjungimas, sklendėmis atskirtas ruožas, vandens amžius, chloras, likutis, šaltinio sekimas, aklavietė, csv, priedas
from: 76809f01
---

WaterCraft yra priedas, kuris veikia su vandens magistralių įrankiais jau nubrėžtu vandens tinklu. Dešiniajame skydelyje jis prideda skirtuką su keturiais skyriais.

:::warning
Tai tik skaičiavimo pagalbinė priemonė. Ji patikrinta lyginant su rankiniais atsakymais išgalvotuose tinkluose, o ne su tikru komunalinės įmonės modeliu. Kiekvieną rezultatą turi patikrinti vandens inžinierius. Stiprinimo siurblinių, antros eilės skilimo ir scenarijų dar nėra.
:::

## Ko sieksite

- Įtraukti vartotojus į tinklą kaip poreikius.
- Rasti hidrantus, kuriuose debito nepakanka jūsų poreikiui.
- Rasti magistrales, kurių atjungimas labiausiai svarbus.
- Rasti seną vandenį ir mažą chloro kiekį.

## Žingsniai

1. Atidarykite {{ui:Parametrai}} › {{ui:Priedai}} ir įjunkite {{ui:WaterCraft (vandens paskirstymas)}}. Dešiniajame skydelyje atsiranda skirtukas {{ui:WaterCraft}}.
2. Pirmiausia nubrėžkite rezervuarą, mazgus ir vamzdžius vandens magistralių įrankiais (žr. [Vandens magistralės](topic:water-mains)). Be tinklo skirtukas nurodys tai padaryti.
3. Skyriuje {{ui:Poreikiai}} įklijuokite po vieną vartotoją kiekvienoje eilutėje: id, x, y, rūšis, kiekis. Pasirinkite {{ui:Piko koeficientas}} ir {{ui:Valandinis modelis}} (gyvenamosios dienos, komercinės dienos, pastovus arba palikti modelį, kaip yra). Spauskite {{ui:Tikrinti}}, kad pamatytumėte, kur patenka kiekvienas vartotojas (artimiausias mazgas), tada spauskite {{ui:Įtraukti į tinklą}}. {{ui:Anuliuoti}} panaikina poreikius.
4. Skyriuje {{ui:Gaisrinis debitas}} nustatykite reikalingą debitą ir likutinį slėgį, pasirinkite, ar likutinis slėgis laikomas {{ui:Tik prie hidranto}} ar {{ui:Visoje sistemoje (griežčiau)}}, ir spauskite {{ui:Ilgis}}. Kiekvienas hidrantas pateikiamas pradedant blogiausiu, kaip „atitinka“ arba „trūksta“.
5. Skyriuje {{ui:Kuri magistralė svarbiausia}} pasirinkite {{ui:po vieną vamzdį}} arba {{ui:po vieną sklendėmis atskirtą ruožą}} ir spauskite {{ui:Ilgis}}. Kiekvienas atjungimas rodo atjungtą poreikį, atjungtus mazgus, mazgus, kurie naujai nukrenta žemiau minimalaus slėgio, ir likusį mažiausią slėgį.
6. Skyriuje {{ui:Vandens amžius ir chloras}} pasirinkite, ką sekti (vandens amžių, chlorą ar šaltinio sekimą), nustatykite valandas, kurias skaičiuoti, ir norimas ribas, ir spauskite {{ui:Ilgis}}. Mazgai, išeinantys už jūsų ribų, pateikiami sąraše.
7. Bet kurioje lentelėje spauskite {{ui:Įrašyti kaip CSV}}, kad ją išsaugotumėte.

## Pastabos

- Reikalingas gaisrinis debitas ir vartojimas vienam namui ar akrui yra pradinės reikšmės, o ne standartai. Naudokite savo komunalinės įmonės duomenis.
- Vamzdis, iš dalies užspaustas sklende, uždaromas visas, todėl rodomas atjungimas šiek tiek blogesnis nei tikras.
- Vandens kokybės skyrių paleiskite pakankamai ilgai, kad paros modelis pasikartotų, prieš skaitydami paskutinę dieną.
- {{ui:Sustabdyti}} nutraukia ilgą skaičiavimą anksčiau; sąraše rodoma tik tai, kas jau atlikta.
- Jūsų tinklas lieka šiame projekte ir šiame kompiuteryje. Niekas nieko nesiunčia.
