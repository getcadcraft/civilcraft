---
title: Odpravljanje težav
summary: Simptomi, vzroki in rešitve za težave, s katerimi se srečate v CivilCraftu, z natančnimi sporočili, ki jih prikaže program.
keywords: težave, napake, ne deluje, popravi, pomoč, sporočila, odpravljanje, zavrnjeno, manjka, napačno, zamenjano, manjkajo plastnice
from: a9f7dedc
---

Sporočila se prikažejo v vrstici stanja spodaj desno, v okvirjih v levem in desnem podoknu ter v pogovornih oknih. Tu so navedena tako, kot jih prikaže program.

## Odpiranje datotek

**„Ta datoteka je večja od 200 MB; CivilCraft za zdaj ne odpira tako velikih datotek.“**
Razdelite datoteko s točkami ali pred odpiranjem zmanjšajte količino podatkov.

**„Ni mogoče odpreti site.json: To ni datoteka projekta CivilCraft.“**
Datoteka se konča z `.json` ali se začne z `{`, vendar ni projekt CivilCraft. Datoteke s točkami se ne smejo začeti z `{`.

**„Ni mogoče odpreti … Ta datoteka projekta je iz novejšega CivilCraft (različica 2).“**
Projekt je shranila novejša različica. Odprite ga v njej ali iz njega izvozite LandXML.

**„Ni mogoče odpreti … To je XML, vendar ne LandXML (njegov korenski element je <…>).“**
Datoteka je druga vrsta XML. Izvozite LandXML iz drugega programa.

**„… nima točk, površij TIN ali tras, ki bi jih CivilCraft lahko prebral.“**
CivilCraft preskoči vse, kar je v datoteki (na primer samo mrežne površine ali samo spiralne trase). Preostanek sporočila pove, kaj je bilo v njej. Glejte [LandXML: kaj se bere in zapiše](topic:landxml-reference).

**„Vzorca ni bilo mogoče naložiti: …“**
{{ui:Odpri vzorčno lokacijo}} prebere datoteko s spletnega mesta CadCraft. Brez povezave deluje samo, če je bil CivilCraft shranjen za delo brez povezave (gumb v orodni vrstici prikazuje {{ui:Pripravljeno za delo brez povezave}}). Pojdite na splet, kliknite {{ui:Shrani za delo brez povezave}} in od takrat deluje tudi brez povezave. Glejte [Delo brez povezave](common:offline).

**{{ui:Shrani za delo brez povezave}} prikaže {{ui:Shranjevanje ni uspelo}}.**
Nekatere datoteke se niso prenesle. Preverite povezavo in znova kliknite gumb.

**{{ui:Shrani za delo brez povezave}} prikaže {{ui:Delo brez povezave ni na voljo}}.**
To okno brskalnika ne more hraniti kopije za delo brez povezave, ponavadi zato, ker je zasebno okno ali je računalnik upravljan. Odprite CivilCraft v običajnem oknu.

**Brez povezave se aplikacija sploh ne odpre.**
V tem brskalniku ni bila shranjena za delo brez povezave ali je brskalnik izbrisal podatke spletnega mesta (Safari to naredi za mesta, ki jih dlje časa niso obiskali, nekaj tednov). Pojdite na splet, odprite CivilCraft in kliknite {{ui:Shrani za delo brez povezave}}.

**Kopija za delo brez povezave je starejša različica.**
Kliknite {{ui:Pripravljeno za delo brez povezave}}, nato pa na spletu {{ui:Shrani znova (pridobi najnovejšo različico)}}.

**Datoteka je v oknu za odpiranje sivo.**
Okno prikazuje samo datoteke s točkami, LandXML in datoteke projektov glede na končnice. Namesto tega datoteko povlecite na načrt ali jo preimenujte v `.txt`.

## Uvoz točk

**„Iz te datoteke ni bilo mogoče prebrati nobenih točk.“**
Vrstni red stolpcev izberite ročno v **Stolpci**. Če nič ne deluje, odprite datoteko v urejevalniku besedila in preverite, ali je ena točka v vrstici in ali so v njej številke.

**Mesto je zrcaljeno, zasukano ali raztegnjeno v črto.**
Severna in vzhodna koordinata sta zamenjani. Povzetek je rekel „uganjeno iz števila stolpcev“. V **Stolpci** izberite PENZD namesto PNEZD (ali obratno) ali uvozite znova.

**Točke daleč od preostalih in načrt je pomanjšan na piko.**
Vrstica ima tipkarsko napako v koordinati ali datoteka meša koordinatne sisteme. Poiščite točko (kliknite jo in si oglejte njeno številko) ter popravite datoteko.

**Vrstice, navedene pod „Vrstice niso prebrane“.**
Glejte tabelo v [Uvoz točk izmere](topic:import-points#rows-that-are-not-read).

**Moje stare točke so izginile.**
Uvoz datoteke s točkami nadomesti vse točke in izbriše razveljavitev. Odprite shranjeni projekt, da jih dobite nazaj.

## Površje

**„Površje: Ni izdelano“ z rdečim okvirjem.**
V okvirju je razlog: „Površje potrebuje vsaj tri točke s kotami.“, „Vse točke so na eni črti: ni trikotnikov.“, „Ni točk s kotami.“, „Meja se ne prekriva s točkami.“ ali „V meji ni ostal noben trikotnik.“ Preverite vrstni red stolpcev, skupine točk (ali so {{ui:Izpuščeno}}?) in mejo.

**Plastnice režejo čez jarek ali greben naravnost.**
Ta črta ni prelomnica. Nastavite njeno skupino na {{ui:Prelomnica}} ali jo narišite z orodjem {{ui:Prelomnica}}. Glejte [Izdelava in izboljšava površja](topic:build-surface).

**Skupina prelomnic riše cik-cak.**
Skupina vsebuje več kot eno črto ali točke niso oštevilčene vzdolž črte. Nastavite skupino nazaj na {{ui:Točke}} in vsako črto narišite z orodjem {{ui:Prelomnica}}.

**Dolgi tanki trikotniki ob zunanjem robu.**
Narišite mejo ({{key:O}}) ali nastavite **Najdaljši zunanji rob**.

**Ni plastnic, čeprav je površje izdelano.**
Bodisi je {{ui:Plastnice}} izklopljeno pod **Prikaz** ali pa je interval tako majhen, da bi bilo več kot 2,000 nivojev plastnic. Izberite večji interval.

**Prelomnice ali meja ne spremenijo ničesar.**
Površje je prišlo iz LandXML („Površje (iz LandXML)“). Uporablja se takšno, kot je. Kliknite {{ui:Obnovi površje iz točk}}, da se zgradi iz točk.

**„Površja še ni: najprej odprite točke izmere.“**
Prelomnica, meja in ploščad potrebujejo obstoječi teren. Najprej uvozite točke.

**„Kliknite točko izmere s koto: prelomnica prevzame koti točk.“**
Orodje {{ui:Prelomnica}} izbira samo točke izmere. Povečajte pogled in kliknite točko (oranžen kvadrat pokaže tisto, ki jo bo orodje vzelo).

## Risanje

**Moja zadnja točka je izginila, ko sem dvakrat kliknil, da sem končal.**
V tej različici dvojni klik konča trasu, ploščad, prelomnico ali mejo, vendar izpusti točko, na katero ste dvakrat kliknili. Enkrat kliknite zadnjo točko in pritisnite {{key:Enter}}. Če se je to že zgodilo, uporabite {{key:Mod+Z}} in narišite znova.

**Risbe na tablici ne morem končati.**
Za dokončanje je potreben {{key:Enter}}; gumba na zaslonu še ni. Priključite tipkovnico. Glejte [Miška, sledilna ploščica in dotik](topic:keyboard#mouse-trackpad-and-touch).

**Povlek za postavitev točke namesto tega pomakne pogled.**
Povlek za več kot nekaj pikslov pomakne načrt v vsakem orodju. Kliknite brez premikanja.

**„Trasa potrebuje vsaj dve točki.“ / „Ploščad potrebuje vsaj tri oglišča.“ / „Cevni potek potrebuje vsaj dve konstrukciji.“**
Pritisnili ste {{key:Enter}} prezgodaj. Risba je zavržena; začnite znova.

**Tipke, kot sta A ali G, ne delujejo.**
Fokus še vedno ima besedilno polje ali seznam v podoknu, zato črke gredo tja. Enkrat kliknite načrt in nato pritisnite tipko. Na Macu je tipka za brisanje v brskalniku Backspace: za brisanje izbora uporabite Fn in Delete.

## Trase in profili

**„Krivulji pri PI 2 in PI 3 se prekrivata: … Uporabite manjše polmere.“**
Dve krivulji potrebujeta več prostora na tangenti, kot je med njunima PI. Zmanjšajte enega ali oba polmera v tabeli PI ali razmaknite PI.

**„PI 3 se obrne naravnost nazaj; krivulje ne more sprejeti.“**
Trasa se pri tem PI vrne sama vase. Premaknite ali odstranite PI.

**„Ta trasa nima terena, s katerega bi začela.“**
Trasa je zunaj površja. Premaknite jo na površje ali dodajte PVI s klikanjem, ko je vklopljeno {{ui:Dodaj lomne točke}}.

**„Vertikalna krivulja pri PVI 3 (L = …) se začne, preden se konča krivulja ali PVI pred njo.“ / „… sega čez naslednji PVI.“**
Skrajšajte dolžino krivulje ali razmaknite PVI.

**„PVI je že na …“**
Na tej postaji že obstaja PVI. Kliknite drugam ali povlecite obstoječega.

**Pogled profila je prazen: „Narišite trasu, da vidite njen profil.“**
Trase ni ali pa ima izbrana trasa napake.

## Koridorji in ploščadi

**„Koridor potrebuje projektni profil brez napak.“**
Začnite projektni profil ({{ui:Začni s terena}}) in popravite prekrivanja krivulj.

**„… bočni nakloni tečejo z površja, preden dosežejo teren.“ / „… črte naklona tečejo z površja, preden se z njim srečajo …“**
Izravnava doseže rob površja, preden doseže teren. Premaknite zasnovo z roba navznoter ali jo približajte terenu. Nova ploščad, narisana deloma zunaj površja, se lahko začne na koti 0: vpišite pravo koto.

**„Črte presečišča z terenom koridorja se križajo …“ / „Črta presečišča z terenom se seka sama …“**
Nakloni z različnih strani se zaletijo drug v drugega: ostre krivine, ozke ploščadi, globoki izkopi ali visoki nasipi. Uporabite večji polmer, ožji sestav, širšo ploščad ali strmejše nakline.

**„Še ni prostornin: ploščad mora izravnati brez težav.“**
Odpravite težave, navedene v rdečem okvirju nad tem.

**{{ui:Predvideno (izravnano)}} je sivo.**
Še nobena ploščad ali koridor nista izravnana.

## Cevi

**„P2 še nima dna cevi.“**
Kliknite {{ui:Nastavi njena dna po pravilih}} ali vpišite dna.

**„P1: ni terena pri S1, s katerega bi začela.“**
Zgornja konstrukcija je zunaj površja in nima roba. Vpišite zanjo kote roba.

**Vsaka cev je označena, potem ko sem premaknil konstrukcijo.**
Premik konstrukcije ne spremeni dna cevi. Kliknite {{ui:Nastavi vsa dna cevi po pravilih}}.

Vsa sporočila omrežja so pojasnjena v [Razporedite gravitacijski cevni sistem](topic:pipe-network#read-and-fix-problems).

## Shranjevanje in izvoz

**„Za izvoz še ni ničesar.“ / „Za izris še ni ničesar.“**
Projekt je prazen. Najprej uvozite točke.

**Shranjene datoteke ne najdem.**
Je v prenosih brskalnika (ponavadi v mapi Prenosi). Glejte [Datoteke, ki jih lahko odprete, shranite in izvozite](topic:files#where-the-files-go).

**Merilo PDF je na papirju napačno.**
Tiskajte pri 100 % ali dejanski velikosti, ne pa z „prilagodi strani“.

**V besedilu PDF so vprašaji.**
Imena ali opisi vsebujejo znake zunaj zahodnoevropskega nabora. Vrstica stanja jih prešteje. Preimenujte z navadnimi znaki.

**Izris je odrezan na robovih.**
Merilo je za list preveliko. Izberite merilo, označeno „(ustreza)“, večji list ali {{ui:Kar je na zaslonu}}.

**{{key:Mod+P}} je odprl pogovorno okno brskalnika za tiskanje.**
Stran ni imela fokusa. Zaprite pogovorno okno, kliknite načrt in znova pritisnite {{key:Mod+P}}, ali kliknite {{ui:PDF}}.

## Sama aplikacija

**Zaslon je prazen ali orodna vrstica ne naredi ničesar.**
Uporabite trenutno različico Chroma, Edgea, Firefoxa ali Safarija in ponovno naložite stran. Glejte [Brskalniki](common:browsers).

**Aplikacija je počasna z veliko datoteko s točkami.**
Izklopite {{ui:Trikotniki}}, {{ui:Oznake točk}} in {{ui:Višinski pasovi}}, uporabite pa večji interval plastnic. Zelo velika površja se po vsaki spremembi nekaj časa obnavljajo.

**Brskalnik vpraša „Zapustiti stran?“**
Projekt ima neshranjene spremembe. Ostanite, shranite z {{key:Mod+S}} in nato zapustite.
