---
title: Tlakovanje, zidovi in stopnice
summary: Tlakovanje s padci proti odtoku ali prečnim nagibom, vzorec in njegova zgradba; poti, ki sledijo terenu; podporni in prostostoječi zidovi s stopničastimi temelji; robniki; klančine in stopnice, preverjene glede na mejne vrednosti; izvoz v IFC.
keywords: utrjene površine, tlakovanje, tlakovci, teras, terasa, padci, odtok, prečni nagib, riba, tekaška vez, pot, sprehajalna pot, podporni zid, vrtni zid, temeljna stopa, zaključna kapa, robnik, curb, obroba, klančina, dostopnost, stopnice, stopnišče, višine stopnic, gazišča, podest
from: 51475877
---

Utrjene površine se vsakič znova izračunajo iz terena, zato sledijo reliefu in se ponovno ustvarijo, kadar se teren ali njegova črta premakne. Vogale povlecite na tlorisu kot katero koli črto. Odprete jih prek {{ui:Utrjene površine}} v skupini Landscape.

## Tlakovanje

Kliknite vogale in pritisnite {{key:Enter}}. V **Lastnostih**:

- **Kota**: prazno = povprečna kota terena pod njim.
- **Padci**: kota, **prečni nagib** (v % v določeno smer) ali **do odtoka**: CivilCraft vas prosi, da kliknete, kam gre odtok, nato se vsak vogal dvigne od odtoka z določenim padcem. Puščice na tlorisu kažejo padce.
- **Vzorec** (mreža, tekaška vez, riba) z velikostjo enote, stikom in kotom; **Širina obrobe**. Na listu se stiki, ožji od milimetra, izpustijo.
- Tlakovanje je del predvidene površine. Njegove plasti (tlakovci, posteljica, podlaga) gredo v IFC in v količine.

## Poti

Kliknite vzdolž poti in pritisnite {{key:Enter}}. Pot sledi terenu, njen **prečni nagib** pa je na desni strani poti. Pot, ki je strmejša od **Največjega dovoljenega naklona**, je na tlorisu označena z `!`, v **Lastnostih** pa piše, kako strma postane.

## Zidovi

Kliknite vzdolž zidu in pritisnite {{key:Enter}}. Zid je **podporni** ali **prostostoječ**. Brez **Vrha** stoji njegova **Višina** nad terenom vzdolž celotne dolžine; vpišite vrh, da ga držite v ravni črti. Njegov **temelj** sega za določeno globino pod teren in se stopničasto spušča v celih stopnjah, zato je med njimi raven. Lastnosti podajo dolžino, višine, površino čela in stopnice temelja; na tlorisu oznake navajajo zgornji in spodnji rob zidu (TW / BW) na vsakem koncu.

:::warning
Podporni zid, višji od 1.2 m (4 ft), je označen: zasnuje ga inženir.
:::

## Robniki

Kliknite vzdolž robnika in pritisnite {{key:Enter}}; nastavite njegovo širino in izstopno višino.

## Klančine

Kliknite od spodaj navzgor in pritisnite {{key:Enter}}. Kote se vzamejo iz terena na vsakem koncu, razen če jih vpišete. Klančina dobi podest na vsakih 750 mm (2.5 ft) višinske razlike in se preveri glede na **Največji dovoljeni naklon** (privzeto 1:12) in najmanjšo širino; Lastnosti povedo, kako dolga bi morala biti.

## Stopnice

Kliknite sprednji rob spodnje stopnice, nato mesto, kjer stopnice dosežejo vrh, in pritisnite {{key:Enter}}. Število višin stopnic je odvisno od višine in **Največje višine stopnice**; gazišče po pravilu udobja 2R + G ≈ 630 mm, nikoli manj kot **Najmanjše gazišče**; podest na vsakih **Največ stopnic v enem kosu**. Lastnosti povedo, ali se stopnice prilegajo med obe točki ali koliko dolge morajo biti.

:::note
Mejne vrednosti za klančine in stopnice so označene privzete vrednosti. Nastavite tiste, ki jih zahteva vaš gradbeni predpis.
:::

## Zunaj programa CivilCraft

- Več › {{ui:Izvozi IFC krajinske ureditve}}: tlakovanje in poti kot `IfcPavement`, zidovi kot `IfcWall` (podporni zidovi kot RETAININGWALL) s svojimi plastmi, robniki kot `IfcKerb`, klančine kot `IfcRamp`, stopnice kot `IfcStair` z njihovimi višinami stopnic in gazišči.
- **Pošlji v TakeoffCraft** v razpredelnici rastlin prenese površine tlakovanja in prostornine plasti, površine čel zidov in njihove dolžine, dolžine robnikov ter število stopnic.
- List s podrobnostmi nariše prerez vsakega zidu, zgradbo vsakega tlakovanja in vsak kos stopnic. Glejte [Krajinski listi](topic:landscape-sheets).
