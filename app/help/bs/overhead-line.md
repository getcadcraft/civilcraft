---
title: Crtanje nadzemnog dalekovoda
summary: Postavite stubove na planu, pustite CivilCraft da odredi ulogu svakog stuba i dionice između krajnjih stubova, te pomjerajte stubove na planu ili na uzdužnom profilu voda.
keywords: nadzemni dalekovod, stub, raspon, dionica, krajnji stub, ugao, ovjes, profil, visina, poprečna traverza, zatega, pridržni kabl
from: b8e5e272
---

## Crtanje

1. Imajte površ: teren ispod voda dolazi iz nje ([Izrada površi](topic:build-surface)). Stub bez terena ispod sebe navodi se pod **Provjere**; umjesto toga upišite njegov **Nivo terena** u Svojstvima.
2. Kliknite {{ui:Vod}} u grupi Dalekovodi i kliknite svaki stub na planu.
3. Dvaput kliknite posljednji, ili pritisnite {{key:Enter}}.

Vod dobija provodnik, stub i opremu koju ste zadnji put koristili na ovom računaru (prvi put: primjeri iz biblioteke). Promijenite ih u Svojstvima.

## Vod u Svojstvima

Odaberite vod (kliknite raspon) da postavite njegov **Provodnik**, **Provodnika po strujnom kolu**, **Strujna kola**, **Napon**, **Pravilo razmaka** koje mora držati iznad terena, i opremu **Na svakom stubu** (poprečna traverza, izolatori, spojnice). Tabela navodi njegove **dionice** sa mjerodavnim rasponom, uobičajenim zatezanjem i slučajem opterećenja koji ih upravlja.

## Stubovi

Kliknite stub da ga izaberete. U Svojstvima:

- **Stub**: njegova stavka iz biblioteke. Kad je preslab, {{ui:Koristi …}} stavlja najmanji stub istog materijala u vašoj biblioteci koji nosi opterećenje.
- **Uloga**: Automatski, Ovjesni, Ugaoni ili Krajnji. Automatski znači: prvi i posljednji stubovi su krajnji; skretanje veće od ugla postavljenog u skupu pravila čini ugaoni stub; veće skretanje krajnji.
- **Visina iznad terena**: prazno uzima iz stavke biblioteke (njena dužina umanjena za dubinu u tlu).
- **Na ovom stubu također**: dodatna oprema, kao **zatega** (pridržni kabl). Stub sa zategom prenosi vuču voda na svoju zategu.
- **Postojeći stub**: provjerava se kao ostali, ali se izostavlja iz količina.

{{ui:Stub}} dodaje stub na raspon najbliži vašem kliku. Povucite stub na planu da ga pomjerite. {{ui:Izbriši}} ga uklanja (vod zadržava najmanje dva).

Dionice idu između krajnjih stubova: unutar dionice provodnik slobodno prolazi kroz ovjesne stezaljke, pa jedno zatezanje važi za cijelu dionicu.

## Uzdužni profil voda

Kliknite {{ui:Uzdužni profil}} (ili **Uzdužni profil** u Svojstvima voda). Panel ispod plana prikazuje teren duž voda, svaki stub od terena do svog vrha, najnižu fazu provodnika pri **Slučaju opterećenja** koji izaberete, i razmak koji vod mora držati kao isprekidanu liniju. Raspon koji ne prolazi je crven; broj ispod svakog raspona je njegov najmanji razmak.

- **Vod** bira nadzemni vod za prikaz. Odabir drugog voda, ili jednog od njegovih stubova na planu, prebacuje profil na njega.
- Pomjerite pokazivač iznad profila: vodilica ga prati, a oznaka čita udaljenost duž voda, teren, provodnik i razmak na toj tački (i kaže kad je razmak ispod pravila voda).
- {{ui:Izmjeri}} u traci profila: kliknite dvije tačke da dobijete horizontalnu udaljenost, visinsku razliku, pravu udaljenost i nagib među njima. Klik blizu terena, provodnika ili vrha stuba se na njih privlači. Ponovo kliknite {{ui:Izmjeri}} da zaustavite.
- Prepreke koje vod presijeca stoje iznad terena: nacrtane kao trake, biljke iz Pejzaža kao njihova kruna, zidovi kao trake (vidi [Provjere dalekovoda](topic:power-line-checks#clearances)). Trase kablova i cijevi koje vod presijeca označene su ispod terena na svom vrhu, sa svojim imenom.

- Povucite stub u stranu da ga pomjerite duž voda.
- Povucite njegov vrh gore ili dolje da postavite njegovu visinu iznad terena.
