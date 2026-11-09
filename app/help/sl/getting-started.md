---
title: Začetek dela z aplikacijo CivilCraft
summary: Kaj počne CivilCraft, kako ga odprete in prvih deset minut z vzorčnim zemljiščem: od točk do plastnic, ceste in shranjenega projekta.
keywords: začetek, prvi zagon, vzorčno zemljišče, uvod, hitri začetek, učbenik, začni, nov projekt
from: c9b6dd8e
---

CivilCraft je aplikacija za načrtovanje civilnih del in lokacij iz družine CadCraft. Iz geodetskih točk ustvari površje (TIN) s plastnicami, nato vam omogoča zarisovanje trase s projektnimi profili, preprosto cestno telo, izravnavo gradbenih ploščadi do dnevne linije, preverjanje gravitacijskega cevnega omrežja glede na vaša pravila in prikaz količin izkopa in nasipa. Bere in zapisuje LandXML, načrt izvaža v DXF in ga izriše v PDF.

Če ste uporabljali Civil 3D, bodo ideje znane: točke, skupine točk, prelomnice, trase po PI-jih, profili po PVI-jih, koridorji, izravnava, cevna omrežja. Način dela je drugačen in veliko manjši: ni ukazne vrstice, ni slogov in ni risbene datoteke. Pred prvim pravim delom preberite [Prehod z druge civilne programske opreme](topic:coming-from) enkrat.

## Kaj potrebujete

- Nedavni namizni brskalnik: Chrome, Edge, Firefox ali Safari. Glejte [Brskalniki](common:browsers).
- Miško ali sledilno ploščico ter tipkovnico ali zaslon na dotik: risanje ima tam gumbe na zaslonu {{ui:Končaj}}, {{ui:Razveljavi točko}} in {{ui:Prekliči}} (glejte [Miška, sledilna ploščica in dotik](topic:keyboard#mouse-trackpad-and-touch)).
- Načrt riše v 2D na platno brskalnika. [Pogled 3D](topic:site-3d) uporablja grafiko WebGL v brskalniku; če se ne zažene, vrstica stanja pove, zakaj, načrt pa še vedno deluje.
- Brez računa in brez nalaganja. Datoteke se odprejo na vašem računalniku in shranijo kot prenosi. Glejte [Vaše datoteke](common:your-files).

:::note
Aplikacija CivilCraft danes deluje kot zgodnja spletna različica, ki še nastaja. Namiznih različic še ni, shranjevanja v oblak še ni. Vse, kar ustvarite, ostane na vašem računalniku, dokler tega ne shranite ali izvozite.
:::

## Odprite CivilCraft

1. Odprite CivilCraft v brskalniku.
2. Počakajte, da se zaslon napolni: orodna vrstica čez vrh, podokno na levi, načrt na sredini in podokno **Lastnosti** na desni.
3. Na praznem načrtu vidite okno z naslovom **Začnite z geodetskimi točkami**. Našteva prve korake in ima povezavo {{ui:Odpri vzorčno zemljišče}}.

Če želite CivilCraft pozneje uporabljati brez povezave, v aplikacijski vrstici kliknite {{ui:Shrani za delo brez povezave}} in počakajte na {{ui:Pripravljeno za delo brez povezave}}. Vključuje to pomoč, vzorčno zemljišče ter knjižnici za 3D in GIS. Glejte [Delo brez povezave](common:offline). Tipko {{key:F1}} ali {{ui:Pomoč}} pritisnite kadarkoli, da to pomoč odprete ob aplikaciji.

## Prvih deset minut: vzorčno zemljišče

Vzorčno zemljišče je majhna meritev v ameriških čevljih: 276 točk v koordinatah state plane, greben, jarek s tokovnico in dva vrha brežine. Priloženo je aplikaciji, zato lahko sledite brez lastne datoteke.

1. Kliknite {{ui:Odpri vzorčno zemljišče}} v okencu na načrtu.
   Odpre se pogovorno okno **Uvoz točk**. Piše: „276 točk prebranih kot PNEZD (iz vrstice z glavo), ločenih z vejicami.“ in prikaže prve vrstice.
2. Kliknite {{ui:Uvozi}}.
   Načrt se napolni s točkami, plastnicami in robom površja. Vrstica stanja na dnu pove, da so bile točke uvožene, in koliko trikotnikov ima površje (546).
3. Oglejte si levo podokno pod **Točke**. Točke so razvrščene po prvi besedi njihovega opisa: CP, FL, GRD, RIDGE, TBN, TBS in TREE.
4. V stolpcu **Površje** te tabele nastavite **FL**, **RIDGE**, **TBN** in **TBS** na {{ui:Prelomnica}}.
   Površje se takoj ponovno zgradi. Dejstva o **Površju** zdaj pravijo „Prelomnice: 4“, plastnice pa se ob tokovnici in grebenu ostro upognejo namesto da bi ju sekale.
5. Premaknite kazalec nad načrt. Vrstica stanja pokaže vzhodno (E) in severno (N) koordinato pod kazalcem ter višino terena tam.
6. V razdelku **Prikaz** nastavite {{ui:Plastnice na vsakih}} na 0.5 ft in vklopite {{ui:Višinski pasovi}}. Pod potrditvenimi polji se prikaže barvna lestvica z legendo. Ko končate, pasove znova izklopite.

Zdaj imate obstoječe površje terena. Naslednja je cesta.

## Zarišite kratko cesto

1. Pritisnite {{key:A}} (ali kliknite {{ui:Trasa}} v skupini **Zasnova**).
2. Kliknite tri točke čez lokacijo, eno za drugo. Rdeča črta sledi kazalcu in pokaže dolžino ter azimut naslednje tangente.
3. Pritisnite {{key:Enter}}, da končate.
   Trasa se prikaže s stacionažo. Desno podokno prikaže **Trasa**: njeno dolžino, tabelo PI-jev in krivino na srednjem PI-ju (polmer 100 ft oziroma manjši, če 100 ft ne gre).
4. V desnem podoknu pod **Projektni profil** kliknite {{ui:Začni s terena}}.
   Pogled profila se odpre pod načrtom z obstoječim terenom in ravnim projektnim naklonom od konca do konca.
5. Pritisnite {{key:I}}, da vklopite {{ui:Dodaj lomne točke}}, nato kliknite enkrat v pogled profila blizu sredine. Pojavi se PVI.
6. V tabeli PVI na desni vpišite dolžino krivine (na primer 100) v polje **Krivina L** srednjega PVI-ja in pritisnite {{key:Enter}}. Profil zdaj ima vertikalno krivino z oznako njene vrednosti K.
7. Pod **Koridor** označite **Pomakni sestav vzdolž projektnega profila**.
   Cesta se izravna v teren: vozni pasovi, bankine in stranski nakloni do dnevne linije. Blok **Zemeljska dela** prikazuje izkop in nasip.

Ne skrbite za natančne vrednosti. Vsako število lahko spremenite v desnem podoknu, {{key:Mod+Z}} pa razveljavi zadnjo spremembo.

## Shranite delo

1. V vrhu levega podokna vpišite ime v **Ime**.
2. Pritisnite {{key:Mod+S}} (ali kliknite {{ui:Shrani}}).
   Brskalnik prenese datoteko, poimenovano po lokaciji, s končnico `.civilcraft.json`. Vsebuje točke, nastavitve površja, trase, profile, koridorje, ploščadi in cevi.
3. Če želite nadaljevati pozneje, kliknite {{ui:Odpri}} (ali pritisnite {{key:Mod+O}}) in izberite to datoteko ali jo spustite na načrt.

:::warning
Samodejnega shranjevanja ni. Če zaprete zavihek z neshranjenimi spremembami, vas brskalnik vpraša, ali želite oditi; če odidete, so spremembe izgubljene. Shranjujte pogosto.
:::

## Kam naprej

- [Uvoz geodetskih točk](topic:import-points) s svojimi datotekami.
- [Izdelava in izpopolnitev površja](topic:build-surface) s prelomnicami in mejo.
- [Zaslon, del za delom](topic:workspace).
- [Tipke in miška](topic:keyboard).
