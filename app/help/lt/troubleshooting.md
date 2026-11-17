---
title: "Trikčių šalinimas"
summary: "Simptomai, priežastys ir sprendimai problemoms, su kuriomis žmonės susiduria CivilCraft, su tiksliais programos rodomais pranešimais."
keywords: "problemos, klaidos, neveikia, taisymas, pagalba, pranešimai, trikčių šalinimas, atmesta, trūksta, neteisinga, sukeisti, horizontalės nerodomos"
from: a9f7dedc
---

Pranešimai rodomi būsenos juostoje apačioje dešinėje, kairiojo ir dešiniojo skydelių langeliuose bei dialoguose. Čia jie cituojami taip, kaip rodo programa.

## Failų atidarymas

**„Šis failas didesnis nei 200 MB; CivilCraft tokių didelių failų dar neatidaro.“**
Padalykite taškų failą arba prieš atidarymą sumažinkite duomenų kiekį.

**„Nepavyko atidaryti site.json: Tai nėra CivilCraft projekto failas.“**
Failas baigiasi `.json` arba prasideda `{`, bet nėra CivilCraft projektas. Taškų failai neturi prasidėti `{`.

**„Nepavyko atidaryti … Šis projekto failas sukurtas naujesne CivilCraft versija (versija 2).“**
Projektą įrašė naujesnė versija. Atidarykite jį ten arba iš jo eksportuokite LandXML.

**„Nepavyko atidaryti … Tai XML, bet ne LandXML (jo šakninis elementas yra <…>).“**
Tai kitokio tipo XML. Eksportuokite LandXML iš kitos programos.

**„… neturi taškų, TIN paviršių ar trasų, kurias CivilCraft gali nuskaityti.“**
Visa, kas faile yra, CivilCraft praleidžia (pavyzdžiui, tik tinklelio paviršius arba tik spiralines trasas). Likusioje pranešimo dalyje nurodoma, kas ten buvo. Žr. [LandXML: kas nuskaitoma ir rašoma](topic:landxml-reference).

**„Pavyzdžio nepavyko įkelti: …“**
{{ui:Atidaryti pavyzdinę vietovę}} nuskaito failą iš CadCraft svetainės. Be ryšio tai veikia tik tada, jei CivilCraft buvo įrašytas naudojimui neprisijungus (programos juostos mygtukas rodo {{ui:Paruošta neprisijungus}}). Prisijunkite prie interneto, spustelėkite {{ui:Įrašyti neprisijungus}}, ir nuo to laiko jis veiks neprisijungus. Žr. [Neprisijungus](common:offline).

**{{ui:Įrašyti neprisijungus}} rodo {{ui:Nepavyko įrašyti}}.**
Kai kurie failai nebuvo atsisiųsti. Patikrinkite ryšį ir vėl spustelėkite mygtuką.

**{{ui:Įrašyti neprisijungus}} rodo {{ui:Naudojimas neprisijungus negalimas}}.**
Šis naršyklės langas negali saugoti kopijos neprisijungus, dažniausiai todėl, kad tai privatus langas arba kompiuterį valdo administratorius. Atidarykite CivilCraft įprastame lange.

**Neprisijungus programa visai neatsidaro.**
Šioje naršyklėje ji nebuvo įrašyta naudoti neprisijungus arba naršyklė išvalė svetainės duomenis (Safari taip elgiasi su svetainėmis, kuriose kelias savaites nesilankyta). Prisijunkite prie interneto, atidarykite CivilCraft ir spustelėkite {{ui:Įrašyti neprisijungus}}.

**Kopija neprisijungus yra senesnė versija.**
Spustelėkite {{ui:Paruošta neprisijungus}}, tada, esant prisijungus, – {{ui:Įrašyti dar kartą (gauti naujausią versiją)}}.

**Failas atidarymo lange neaktyvus.**
Lange rodomi tik taškų, LandXML ir projektų failai pagal jų galūnes. Vietoj to vilkite failą ant plano arba pervardinkite jį į `.txt`.

## Taškų importavimas

**„Iš šio failo nepavyko nuskaityti nė vieno taško.“**
Rankiniu būdu pasirinkite stulpelių tvarką lauke **Stulpeliai**. Jei niekas nepadeda, atidarykite failą teksto redaktoriuje ir patikrinkite, ar kiekvienoje eilutėje yra vienas taškas su skaičiais.

**Vietovė atrodo veidrodiškai atvaizduota, pasukta arba ištempta į liniją.**
Šiaurinė ir rytinė koordinatės sukeistos. Santraukoje buvo parašyta „nuspėta pagal stulpelių skaičių“. Lauke **Stulpeliai** pasirinkite PENZD vietoj PNEZD (arba atvirkščiai) arba importuokite iš naujo.

**Taškai toli nuo kitų, o planas nutolo iki taško.**
Eilutėje koordinatėje yra rašybos klaida arba faile sumaišytos koordinačių sistemos. Raskite tašką (spustelėkite jį, kad pamatytumėte numerį) ir ištaisykite failą.

**Eilutės, išvardytos po „Neperskaitytos eilutės“.**
Žr. lentelę [Importuoti geodezinius taškus](topic:import-points#rows-that-are-not-read).

**Mano seni taškai dingo.**
Importuojant taškų failą, visi taškai pakeičiami ir anuliavimo istorija išvaloma. Norėdami juos susigrąžinti, atidarykite įrašytą projektą.

## Paviršius

**„Paviršius: nesukurtas“ su raudonu langeliu.**
Langelyje nurodyta priežastis: „Paviršiui reikia bent trijų taškų su aukščiais.“, „Visi taškai yra vienoje linijoje: trikampių nėra.“, „Nėra taškų su aukščiais.“, „Riba nesutampa su taškais.“ arba „Ribos viduje neliko trikampių.“ Patikrinkite stulpelių tvarką, taškų grupes (ar jos {{ui:Neįtraukta}}?) ir ribą.

**Horizontalės tiesiai kerta griovį ar kalvagūbrį.**
Ta linija nėra lūžio linija. Nustatykite jos grupę į {{ui:Lūžio linija}} arba nubrėžkite ją įrankiu {{ui:Lūžio linija}}. Žr. [Sukurti ir patikslinti paviršių](topic:build-surface).

**Lūžio linijų grupė braižo zigzagą.**
Grupėje yra daugiau nei viena linija arba jos taškai nenumeruoti pagal liniją. Grupę grąžinkite į {{ui:Taškai}} ir kiekvieną liniją nubrėžkite įrankiu {{ui:Lūžio linija}}.

**Ilgi plonai trikampiai išorėje.**
Nubrėžkite ribą ({{key:O}}) arba nustatykite **Ilgiausią išorinę kraštinę**.

**Horizontalių visai nėra, nors paviršius sukurtas.**
Arba {{ui:Horizontalės}} išjungtos skiltyje **Rodymas**, arba intervalas toks mažas, kad būtų daugiau nei 2,000 horizontalių lygių. Pasirinkite didesnį intervalą.

**Lūžio linijos ar riba nieko nekeičia.**
Paviršius atėjo iš LandXML („Paviršius (iš LandXML)“). Jis naudojamas kaip yra. Spustelėkite {{ui:Atkurti paviršių iš taškų}}, kad jį sukurtumėte iš taškų.

**„Paviršiaus dar nėra: pirmiausia atidarykite geodezinius taškus.“**
Lūžio linijai, ribai ir aikštelei reikia esamo žemės paviršiaus. Pirmiausia importuokite taškus.

**„Spustelėkite geodezinį tašką su aukščiu: lūžio linija perima taškų aukščius.“**
Įrankis {{ui:Lūžio linija}} renkasi tik geodezinius taškus. Priartinkite ir spustelėkite tašką (oranžinis kvadratas rodo, kurį tašką jis paims).

## Braižymas

**Baigiant dvigubu spustelėjimu dingo mano paskutinis taškas.**
Šioje versijoje dvigubas spustelėjimas baigia trasą, aikštelę, lūžio liniją ar ribą, bet pašalina tašką, kurį dvigubai spustelėjote. Paskutinį tašką spustelėkite vieną kartą ir paspauskite {{key:Enter}}. Jei taip jau nutiko, naudokite {{key:Mod+Z}} ir nubrėžkite iš naujo.

**Planšetėje negaliu baigti braižymo.**
Baigti reikia klavišu {{key:Enter}}; ekrano mygtuko dar nėra. Prijunkite klaviatūrą. Žr. [Pelė, jutiklinė panelė ir lietimas](topic:keyboard#mouse-trackpad-and-touch).

**Vilkimas, norint padėti tašką, vietoj to slenka vaizdą.**
Vilkimas daugiau nei keliais pikseliais slenka planą visuose įrankiuose. Spustelėkite nejudindami.

**„Trasai reikia bent dviejų taškų.“ / „Aikštelei reikia bent trijų kampų.“ / „Vamzdžių linijai reikia bent dviejų konstrukcijų.“**
{{key:Enter}} paspaudėte per anksti. Braižinys atmetamas; pradėkite iš naujo.

**Klavišai, pavyzdžiui A ar G, nieko nedaro.**
Skydelyje vis dar pažymėtas teksto laukas arba sąrašas, todėl raidės patenka į jį. Vieną kartą spustelėkite planą ir tada paspauskite klavišą. „Mac“ kompiuteryje naršyklėje trynimo klavišas yra Backspace: pasirinkimui ištrinti naudokite Fn ir delete.

## Trasos ir profiliai

**„Kreivės PI 2 ir PI 3 persidengia: … Naudokite mažesnius spindulius.“**
Dviem kreivėms reikia daugiau liestinės, nei yra tarp jų PI. Sumažinkite vieno ar abiejų spindulius PI lentelėje arba patraukite PI toliau vieną nuo kito.

**„PI 3 staigiai grįžta atgal; jame negali būti kreivės.“**
Trasa tame PI grįžta pati į save. Perkelkite arba pašalinkite PI.

**„Šiai trasai nėra žemės, nuo kurios pradėti.“**
Trasa nėra ant paviršiaus. Perkelkite ją ant paviršiaus arba pridėkite PVI spustelėdami, kai įjungtas {{ui:Pridėti PVI}}.

**„Vertikali kreivė PVI 3 (L = …) prasideda, kol dar nesibaigė ankstesnė kreivė ar PVI.“ / „… eina už kito PVI.“**
Sutrumpinkite kreivės ilgį arba patraukite PVI toliau vieną nuo kito.

**„Jau yra PVI ties …“**
Toje stotyje PVI jau yra. Spustelėkite kitur arba vilkite esamą.

**Profilio rodinys tuščias: „Nubrėžkite trasą, kad pamatytumėte jos profilį.“**
Trasos nėra arba pasirinktoje yra klaidų.

## Koridoriai ir aikštelės

**„Koridoriui reikia projektinio profilio be klaidų.“**
Pradėkite projektinį profilį ({{ui:Pradėti nuo grunto}}) ir ištaisykite kreivių persidengimus.

**„… šoniniai nuolydžiai nuvažiuoja nuo paviršiaus, prieš susitikdami su žeme.“ / „… nuolydžių linijos nuvažiuoja nuo paviršiaus, prieš su juo susitikdamos …“**
Vertikalusis planavimas pasiekia paviršiaus kraštą, prieš susitikdamas su žeme. Perkelkite projektą nuo krašto į vidų arba priartinkite jį prie žemės. Nauja aikštelė, nubrėžta iš dalies už paviršiaus ribų, gali prasidėti 0 aukštyje: įveskite tikrą aukštį.

**„Koridoriaus ribinės linijos kertasi …“ / „Ribinė linija kertasi pati su savimi …“**
Nuolydžiai iš skirtingų pusių susikerta: ankštos kreivės, siauros aikštelės, gilios išpjovos ar aukšti įpylimai. Naudokite didesnį spindulį, siauresnį skerspjūvį, platesnę aikštelę ar statesnius nuolydžius.

**„Tūrių dar nėra: aikštelė turi būti planuojama be problemų.“**
Ištaisykite problemas, išvardytas raudoname langelyje virš jo.

**{{ui:Projektuojamas (su nuolydžiais)}} yra neaktyvus.**
Dar nėra nė vienos aikštelės ar koridoriaus, kurie būtų suplanuoti.

## Vamzdžiai

**„P2 dar neturi dugno aukščių.“**
Spustelėkite {{ui:Nustatyti jo dugnų aukščius pagal taisykles}} arba įveskite dugnų aukščius.

**„P1: nuo S1 nėra žemės, nuo kurios pradėti.“**
Aukštupio konstrukcija nėra ant paviršiaus ir neturi viršutinio krašto. Įveskite jai viršutinį kraštą.

**Po to, kai perkėliau konstrukciją, pažymėtas kiekvienas vamzdis.**
Konstrukcijos perkėlimas nekeičia dugnų aukščių. Spustelėkite {{ui:Nustatyti visus dugnų aukščius pagal taisykles}}.

Visi tinklo pranešimai paaiškinti [Gravitacinio vamzdynų tinklo sudarymas](topic:pipe-network#read-and-fix-problems).

## Įrašymas ir eksportavimas

**„Eksportuoti dar nėra ko.“ / „Spausdinti dar nėra ko.“**
Projektas tuščias. Pirmiausia importuokite taškus.

**Nerandu įrašyto failo.**
Jis yra naršyklės atsisiuntimuose (paprastai aplanke Atsisiuntimai). Žr. [Failai, kuriuos galite atidaryti, įrašyti ir eksportuoti](topic:files#where-the-files-go).

**PDF mastelis ant popieriaus neteisingas.**
Spausdinkite 100% arba tikru dydžiu, o ne „pritaikyti prie lapo“.

**Klaustukai PDF tekste.**
Pavadinimuose ar aprašymuose naudojami simboliai, kurių nėra Vakarų Europos rinkinyje. Būsenos pranešime jie suskaičiuojami. Pervardinkite paprastais simboliais.

**Spaudinys apkarpytas kraštuose.**
Mastelis per didelis lapui. Pasirinkite mastelį, pažymėtą „(tinka)“, didesnį lapą arba {{ui:Kas matoma ekrane}}.

**{{key:Mod+P}} atvėrė naršyklės spausdinimo langą.**
Puslapis nebuvo aktyvus. Uždarykite langą, spustelėkite planą ir vėl paspauskite {{key:Mod+P}} arba spustelėkite {{ui:PDF}}.

## Pati programa

**Ekranas tuščias arba įrankių juosta nieko nedaro.**
Naudokite dabartinę Chrome, Edge, Firefox ar Safari versiją ir įkelkite puslapį iš naujo. Žr. [Naršyklės](common:browsers).

**Programa lėta su dideliu taškų failu.**
Išjunkite {{ui:Trikampiai}}, {{ui:Taškų žymos}} ir {{ui:Aukščių juostos}} ir naudokite didesnį horizontalių intervalą. Labai dideli paviršiai po kiekvieno pakeitimo atkuriami šiek tiek ilgiau.

**Naršyklė klausia „Palikti svetainę?“**
Projekte yra neįrašytų pakeitimų. Likite, įrašykite su {{key:Mod+S}}, tada išeikite.
