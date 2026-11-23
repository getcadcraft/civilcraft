---
title: Tlakovanje, zidovi in stopnice
summary: Tlakovanje s padci do odtoka ali s prečnim naklonom, vzorec in njegova sestava; poti, ki sledijo terenu; podporni in prosto stoječi zidovi s stopničastimi temelji; robniki; klančine in stopnice, preverjene glede na omejitve; izvoz IFC.
keywords: utrjene površine, tlakovanje, tlakovci, vrtna terasa, terasa, padci, odtok, prečni naklon, riba kost, zamikana vezava, pot, sprehajalna pot, podporni zid, vrtni zid, temelj, venec, robnik, obrobje, klančina, dostopnost, stopnice, stopnišče, stopničaste višine, gazišča, podest
from: d34b4466
---

Utrjene površine se vsakič znova izračunajo iz terena, zato sledijo reliefu in se ponovno ustvarijo, ko se teren ali njegova črta premakne. Njegove vogale povlecite v tlorisu kot katero koli črto. Odprite jih iz {{ui:Utrjene površine}} v skupini Krajina.

## Tlakovanje

Kliknite vogale in pritisnite {{key:Enter}}. V **Lastnostih**:

- **Nivo**: prazno = povprečje terena pod njim.
- **Padci**: vodoravno, **prečni naklon** (v % v določeni smeri) ali **do odtoka**: CivilCraft vas prosi, da kliknete, kam gre odtok, nato se vsak vogal dvigne od odtoka s padcem. Puščice v tlorisu prikazujejo padce.
- **Vzorec** (mreža, zamikana vezava, riba kost) z velikostjo enote, stikom in kotom; širina **Obrobja**. Na listu se stiki, ki so bližje kot milimeter, izpustijo.
- Tlakovanje je del predvidenega površja. Njegovi sloji (tlakovci, posteljica, nosilna plast) gredo v IFC in v količine.

## Poti

Kliknite vzdolž poti in pritisnite {{key:Enter}}. Pot sledi terenu, z **Prečnim naklonom** na svoji desni strani. Pot, strmejša od **Najstrmejše dovoljene**, je v tlorisu označena z `!` na mestu, kjer je, **Lastnosti** pa povedo, kako strma je.

Kjer pot naleti na cesto, zgrajeno s koridorjem, se ustavi na zunanjem robu ceste, na nivoju pločnika ali bankine tam, v predvidenem površju in v pogledu 3D. Pot, ki seka cesto, se izravna in prikaže kot dva kosa, konec, narisan do dvakratne širine poti pred cesto, pa se podaljša do njenega roba. Načrt še vedno prikazuje pot tako, kot ste jo narisali, njena dolžina in površina pa štejeta celotno črto. Glejte [Cestni koridor s potegom](topic:corridor).

## Zidovi

Kliknite vzdolž zidu in pritisnite {{key:Enter}}. Zid je **podporni** ali **prosto stoječ**. Brez **Vrha** stoji njegova **Višina** nad terenom vzdolž celotne dolžine; vnesite vrh, da ga držite v nivoju. Njegov **temelj** je na nastavljeni globini pod terenom in se spušča v celih stopnicah, tako da med njimi ostane v nivoju. **Lastnosti** navajajo njegovo dolžino, višine, površino lica in stopnice temelja; načrt na vsakem koncu označi vrh in dno zidu (TW / BW).

:::warning
Podporni zid, višji od 1.2 m (4 ft), je označen: zanj zasnuje načrt inženir.
:::

## Robniki

Kliknite vzdolž robnika in pritisnite {{key:Enter}}; nastavite njegovo širino in višino nad površino.

## Klančine

Kliknite od spodaj navzgor in pritisnite {{key:Enter}}. Nivoji pridejo iz terena na vsakem koncu, razen če jih vnesete sami. Klančina dobi podest na vsakih 750 mm (2.5 ft) višinske razlike in je preverjena glede na **Najstrmejše dovoljeno** (na začetku 1:12) in najmanjšo širino; **Lastnosti** povedo, kako dolga bi morala biti.

## Stopnice

Kliknite sprednji rob spodnje stopnice, nato mesto, kjer stopnice dosežejo vrh, in pritisnite {{key:Enter}}. Število stopničastih višin je odvisno od višine in **Največje višine stopnice**; globina gazišča izhaja iz pravila udobja 2R + G ≈ 630 mm, nikoli pa ne pod **Najmanjšo globino gazišča**; podest je na vsakih **Največ stopnic v enem tiru**. **Lastnosti** povedo, ali se stopnice prilegajo med obema točkama ali koliko daljše morajo biti.

:::note
Omejitve za klančine in stopnice so označene kot privzete vrednosti. Nastavite tiste, ki jih zahteva vaš gradbeni predpis.
:::

## Izven CivilCraft

- Več › {{ui:Izvozi IFC krajinske ureditve}}: tlakovanje in poti kot `IfcPavement`, zidovi kot `IfcWall` (podporni zidovi kot RETAININGWALL) s svojimi sloji, robniki kot `IfcKerb`, klančine kot `IfcRamp`, stopnice kot `IfcStair` s svojimi stopničastimi višinami in gazišči.
- **Pošlji v TakeoffCraft** v razporedu rastlin prenese površine tlakovanja in prostornine slojev, površine lic in dolžine zidov, dolžine robnikov ter števila stopnic.
- List podrobnosti nariše prerez vsakega zidu, sestavo vsakega tlakovanja in vsak tir stopnic. Glejte [Listi krajine](topic:landscape-sheets).
