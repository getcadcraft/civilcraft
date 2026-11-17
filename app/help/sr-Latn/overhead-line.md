---
title: Nacrtaj dalekovod
summary: Postavi stubove na planu, pusti CivilCraft da odredi ulogu svakog stuba i deonice između zateznih stubova, i pomeraj stubove na planu ili na profilu linije.
keywords: dalekovod, stub, raspon, presek, zatezni stub, ugao, nosivi, profil, visina, traverza, zatega, zatega za stub
from: b8e5e272
---

## Nacrtaj ga

1. Imaj površ: teren ispod linije dolazi iz nje ([Izrada površi](topic:build-surface)). Stub bez terena ispod sebe se navodi pod **Provere**; umesto toga upiši njegov **Nivo terena** u Svojstvima.
2. Klikni {{ui:Vod}} u grupi Dalekovodi i klikni svaki stub na planu.
3. Dvaput klikni poslednji, ili pritisni {{key:Enter}}.

Linija dobija provodnik, stub i opremu koje si poslednji put koristio na ovom računaru (prvi put: primeri iz biblioteke). Promeni ih u Svojstvima.

## Linija u Svojstvima

Izaberi liniju (klikni raspon) da podesiš njen **Provodnik**, **Provodnika po kolu**, **Kola**, **Napon**, **Pravilo razmaka** koje mora da održava iznad terena, i opremu **Na svakom stubu** (poprečna traverza, izolatori, pribor). Tabela navodi njene **deonice** sa merodavnim rasponom, uobičajenim zatezanjem i slučajem opterećenja koji je merodavan.

## Stubovi

Klikni stub da ga izabereš. U Svojstvima:

- **Stub**: njegova stavka iz biblioteke. Kada je preslab, {{ui:Koristi …}} stavlja najmanji stub istog materijala u tvojoj biblioteci koji nosi opterećenje.
- **Uloga**: Automatski, Nosivi, Ugaoni ili Zatezni. Automatski znači: prvi i poslednji stubovi su zatezni; skretanje preko ugla iz pravila čini ugaoni stub; veće skretanje čini zatezni.
- **Visina iznad terena**: prazno uzima iz stavke biblioteke (njena dužina umanjena za dubinu u zemlji).
- **Na ovom stubu takođe**: dodatna oprema, kao **zatega** (vučna). Stub sa zategom prenosi vuču linije na svoju zategu.
- **Postojeći stub**: proverava se kao ostali, ali se izostavlja iz količina.

{{ui:Stub}} dodaje stub na rasponu najbližem tvom kliku. Prevuci stub na planu da ga pomeriš. Delete ga uklanja (linija zadržava najmanje dva).

Deonice idu između zateznih stubova: unutar deonice provodnik slobodno klizi kroz nosive stezaljke, pa jedno zatezanje važi za celu deonicu.

## Profil linije

Klikni {{ui:Profil}} (ili **Profil** u Svojstvima linije). Panel ispod plana prikazuje teren duž linije, svaki stub od terena do svog vrha, najnižu fazu provodnika pri **Slučaju opterećenja** koji izabereš, i razmak koji linija mora da održi, kao isprekidanu liniju. Raspon koji ne prolazi je crven; broj ispod svakog raspona je njegov najmanji razmak.

- **Vod** bira dalekovod koji se prikazuje. Biranje druge linije, ili njenog stuba, na planu prebacuje profil na nju.
- Pređi pokazivačem preko profila: vodilica ide za njim, a oznaka čita rastojanje duž linije, teren, provodnik i razmak tamo (i kaže kada je razmak ispod pravila linije).
- {{ui:Izmeri}} u traci profila: klikni dve tačke da dobiješ horizontalno rastojanje, visinsku razliku, pravo rastojanje i nagib između njih. Klik blizu terena, provodnika ili vrha stuba se privlači ka njemu. Klikni {{ui:Izmeri}} ponovo da zaustaviš.
- Prepreke koje linija preseca stoje iznad terena: nacrtane kao trake, biljke pejzaža kao svoje krošnje, zidovi kao trake (vidi [Provere dalekovoda](topic:power-line-checks#clearances)). Kablovske trase i cevi koje linija preseca označene su ispod terena na svom vrhu, sa svojim imenom.
- Prevuci stub u stranu da ga pomeriš duž linije.
- Prevuci njegov vrh gore ili dole da postaviš njegovu visinu iznad terena.
