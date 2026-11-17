---
title: WaterCraft: odjemi, pretok za gašenje, izpadi in starost vode
summary: Z dodatkom WaterCraft spremenite stranke v odjeme na vaših vodovodnih ceveh, preverite pretok, ki je na voljo pri vsakem hidrantu, ugotovite, kateri izpad cevi najbolj boli, in spremljajte starost vode ter klor čez en dan.
keywords: watercraft, oskrba z vodo, odjemi, stranke, faktor konice, vzorec odjema, pretok za gašenje, hidrant, preostali tlak, kritičnost, izpad, odsek z zapornim ventilom, starost vode, klor, preostanek, sledenje vira, slepi konec, csv, dodatek
from: 76809f01
---

WaterCraft je dodatek, ki deluje na vodovodnem omrežju, ki ste ga že narisali z orodji za vodovodne cevi. Na desni plošči doda zavihek s štirimi razdelki.

:::warning
Le pripomoček za izračune. Preverjen je bil z ročnimi izračuni na izmišljenih omrežjih, ne na pravem modelu podjetja za oskrbo z vodo. Vsak rezultat mora preveriti strokovnjak za vodovodno tehniko. Še ni črpalnih postaj, razpadanja drugega reda in scenarijev.
:::

## Kaj boste naredili

- Stranke postavite v omrežje kot odjeme.
- Poiščite hidrante, pri katerih je pretok manjši od potrebnega.
- Poiščite cevi, katerih izpad najbolj vpliva.
- Poiščite staro vodo in nizek klor.

## Koraki

1. Odprite {{ui:Nastavitve}} › {{ui:Dodatki}} in vklopite {{ui:WaterCraft (oskrba z vodo)}}. V desni plošči se prikaže zavihek {{ui:WaterCraft}}.
2. Najprej narišite zbiralnik, spojišča in cevi z orodji za vodovodne cevi (glejte [Vodovodne cevi](topic:water-mains)). Brez omrežja vas zavihek na to opozori.
3. Pod {{ui:Odjemi}} prilepite po eno stranko v vrstico: id, x, y, vrsta, količina. Izberite {{ui:Faktor konice}} in {{ui:Urni vzorec}} (stanovanjski dan, poslovni dan, enakomerno ali ohranite vzorec, kakršen je). Pritisnite {{ui:Preveri}}, da vidite, kam pade vsaka stranka (najbližje spojišče), nato {{ui:Vnesi v omrežje}}. Razveljavitev vrne odjeme nazaj.
4. Pod {{ui:Pretok za gašenje}} nastavite potrebni pretok in preostali tlak, izberite, ali se preostali tlak drži {{ui:Samo na hidrantu}} ali {{ui:Povsod v sistemu (strožje)}}, in pritisnite {{ui:Tek}}. Vsak hidrant je naveden od najslabšega, kot ustrezen ali prenizek.
5. Pod {{ui:Katera cev je najpomembnejša}} izberite {{ui:po ena cev}} ali {{ui:po en odsek z zapornim ventilom}} in pritisnite {{ui:Tek}}. Pri vsakem izpadu so prikazani odklopljeni odjem, odklopljena spojišča, spojišča, ki so novo pod najnižjim tlakom, in najnižji preostali tlak.
6. Pod {{ui:Starost vode in klor}} izberite, kaj spremljate (starost vode, klor ali sledenje vira), nastavite ure izvajanja in mejne vrednosti, ki jih želite, ter pritisnite {{ui:Tek}}. Spojišča zunaj vaših mejnih vrednosti so navedena.
7. Pod katero koli tabelo pritisnite {{ui:Shrani kot CSV}}, da jo shranite.

## Opombe

- Potrebni požarni pretok in poraba na gospodinjstvo ali na acre sta izhodiščni vrednosti, nista standarda. Uporabite podatke svojega podjetja za oskrbo z vodo.
- Cev, ki jo zaporni ventil delno prekriva, je zaprta v celoti, zato je prikazani izpad nekoliko slabši od resničnega.
- Razdelek o kakovosti vode pustite dovolj dolgo teči, da se dnevni vzorec ponovi, preden preberete zadnji dan.
- {{ui:Ustavi}} predčasno konča dolg tek; seznam nato prikaže le, kar je bilo opravljeno.
- Vaše omrežje ostane v tem projektu in na tem računalniku. Nič se ne pošilja nikamor.
