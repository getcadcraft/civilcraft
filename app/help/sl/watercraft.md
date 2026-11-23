---
title: WaterCraft: odjemi, požarni pretok, izpadi in starost vode
summary: Z dodatkom WaterCraft spremenite odjemalce v odjeme na vaših vodovodnih vodih, preverite pretok, ki je na voljo pri vsakem hidrantu, ugotovite, kateri izpad voda najbolj škoduje, in spremljajte starost vode ter klor skozi dan.
keywords: watercraft, distribucija vode, odjemi, odjemalci, faktor konice, vzorec porabe, požarni pretok, hidrant, preostali tlak, kritičnost, izpad, odsek z ventili, starost vode, klor, preostanek, sledenje izvoru, slepi konec, csv, dodatek
from: 066fb17a
---

WaterCraft je dodatek, ki deluje na vodovodnem omrežju, ki ste ga že narisali z orodji za vodovode. Doda zavihek v desno podokno s štirimi razdelki.

:::warning
Samo pomoč pri izračunu. Preverjeno je bilo z ročnimi rezultati na izmišljenih omrežjih, ne na pravem modelu podjetja za oskrbo z vodo. Vsak rezultat mora preveriti vodni inženir. Scenariji, pravila nadzora, ventili in terenske meritve imajo svoje teme, „Scenariji“ in „Študije“, v pomoči dodatka WaterCraft.
:::

## Kaj boste naredili

- Odjemalce postavite v omrežje kot odjeme.
- Poiščite hidrante, ki ne dosegajo potrebnega pretoka.
- Poiščite vode, katerih izpad najbolj škoduje.
- Poiščite staro vodo in nizek klor.

## Koraki

1. Odprite {{ui:Nastavitve}} › {{ui:Dodatki}} in vklopite {{ui:WaterCraft (distribucija vode)}}. V desnem podoknu se prikaže zavihek {{ui:WaterCraft}}.
2. Najprej z orodji za vodovode narišite rezervoar, vozlišča in cevi (glejte [Vodovodi](topic:water-mains)). Brez omrežja vam zavihek to pove.
3. Pod {{ui:Odjemi}} prilepite enega odjemalca na vrstico: id, x, y, vrsta, količina. Izberite {{ui:Faktor konice}} in {{ui:Urni vzorec}} (dnevni vzorec stanovanjskega, poslovnega, enakomerni ali ohranite obstoječi vzorec). Pritisnite {{ui:Preveri}}, da vidite, kam pade vsak odjemalec (najbližje vozlišče), nato {{ui:Vnesi v omrežje}}. Razveljavitev odjeme odstrani.
4. Pod {{ui:Pretok za gašenje}} nastavite potreben pretok in preostali tlak, izberite, ali se preostali tlak zadrži {{ui:Samo pri hidrantu}} ali {{ui:Povsod v sistemu (strože)}}, in pritisnite {{ui:Tek}}. Vsak hidrant je naveden od najslabšega, kot „ustreza“ ali „premalo“.
5. Pod {{ui:Kateri vod je najpomembnejši}} izberite {{ui:ena cev naenkrat}} ali {{ui:en odsek z ventili naenkrat}} in pritisnite {{ui:Tek}}. Vsak izpad prikaže odjem, ki je odrezan, vozlišča, ki so odrezana, vozlišča, ki so novo pod najmanjšim tlakom, in najnižji še preostali tlak.
6. Pod {{ui:Starost vode in klor}} izberite, kaj spremljati (starost vode, klor ali sledenje izvoru), nastavite število ur za izvedbo in želene omejitve ter pritisnite {{ui:Tek}}. Vozlišča zunaj vaših omejitev so navedena.
7. Pod katerokoli tabelo pritisnite {{ui:Shrani kot CSV}}, da jo shranite.

## Opombe

- Potreben požarni pretok in poraba na dom ali na aker sta začetni vrednosti, ne standarda. Uporabite lastne podatke vašega podjetja za oskrbo z vodo.
- Cev, ki jo delno reže ventil, je zaprta v celoti, zato je prikazan izpad nekoliko slabši od resničnega.
- Zaženite razdelek o kakovosti vode dovolj dolgo, da se dnevni vzorec ponovi, preden preberete zadnji dan.
- {{ui:Ustavi}} predčasno konča dolg zagon; seznam nato prikaže samo to, kar je bilo narejeno.
- Vaše omrežje ostane v tem projektu in na tem računalniku. Nikamor se ne pošilja ničesar.
