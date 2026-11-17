---
title: Nacrtajte dalekovod
summary: Postavite stupove na tlocrt, pustite CivilCraft da odredi ulogu svakog stupa i dionice između zateznih stupova te premještajte stupove na tlocrtu ili na profilu dalekovoda.
keywords: dalekovod, stup, pol, raspon, dionica, zatezni stup, kutni stup, ovjesni stup, profil, visina, poprečna traverza, zatega, zatega
from: b8e5e272
---

## Nacrtajte ga

1. Imajte teren: tlo ispod voda dolazi iz njega ([Izradite teren](topic:build-surface)). Stup bez tla ispod sebe navodi se pod **Provjere**; umjesto toga upišite njegovu **Kotu tla** u Svojstvima.
2. Kliknite {{ui:Vod}} u grupi **Dalekovodi** i kliknite svaki stup na tlocrtu.
3. Dvaput kliknite zadnji ili pritisnite {{key:Enter}}.

Vod dobiva vodič, stup i opremu koju ste zadnji put koristili na ovom računalu (prvi put: primjeri iz knjižnice). Promijenite ih u Svojstvima.

## Vod u Svojstvima

Odaberite vod (kliknite raspon) da postavite njegov **Vodič**, **Vodiča po strujnom krugu**, **Strujne krugove**, **Napon**, **Pravilo slobodnog razmaka** koje mora držati iznad terena te opremu **Na svakom stupu** (poprečna traverza, izolatori, pribor). Tablica popisuje njegove **dionice** s mjerodavnim rasponom, uobičajenom napetošću i slučajem opterećenja koji ih određuje.

## Stupovi

Kliknite stup da ga odaberete. U Svojstvima:

- **Stup**: njegova stavka knjižnice. Kad je preslab, {{ui:Koristi …}} stavlja najmanji stup istog materijala u vašoj knjižnici koji nosi opterećenje.
- **Uloga**: Automatski, Ovjesni, Kutni ili Zatezni. Automatski znači: prvi i zadnji stupovi su zatezni; zaokret veći od kuta iz pravila čini kutni stup, a veći zaokret zatezni.
- **Visina iznad tla**: prazno uzima iz stavke knjižnice (njezina duljina umanjena za dubinu u tlu).
- **Na ovom stupu također**: dodatna oprema, poput **zatege**. Stup sa zategom prenosi vuču voda na svoju zategu.
- **Postojeći stup**: provjerava se kao i ostali, ali se izostavlja iz količina.

{{ui:Stup}} dodaje stup na raspon najbliži vašem kliku. Povucite stup na tlocrtu da ga pomaknete. Delete ga uklanja (vod zadržava najmanje dva).

Dionice idu između zateznih stupova: unutar dionice vodič slobodno prolazi kroz ovjesne stezaljke, pa jedna napetost vrijedi za cijelu dionicu.

## Profil dalekovoda

Kliknite {{ui:Profil}} (ili **Profil** u Svojstvima voda). Ploča ispod tlocrta prikazuje teren duž voda, svaki stup od tla do vrha, najnižu fazu vodiča pri **Slučaju opterećenja** koji odaberete te razmak koji vod mora držati kao isprekidanu liniju. Raspon koji ne prolazi je crven; broj ispod svakog raspona je njegov najmanji razmak.

- **Vod** bira dalekovod za prikaz. Odabir drugog voda ili jednog njegovih stupova na tlocrtu prebacuje profil na njega.
- Pomaknite pokazivač nad profil: vodilica ga prati, a oznaka čita udaljenost duž voda, teren, vodič i razmak u toj točki (i kaže je li razmak ispod pravila voda).
- {{ui:Mjeri}} na traci profila: kliknite dvije točke da dobijete udaljenost preko, razliku visina, pravu udaljenost i nagib između njih. Klik blizu terena, vodiča ili vrha stupa hvata se na njih. Ponovno kliknite {{ui:Mjeri}} za zaustavljanje.
- Prepreke koje vod prelazi uzdižu se s terena: nacrtane kao trake, biljke iz krajobraza kao krošnje, zidovi kao trake (vidi [Provjere dalekovoda](topic:power-line-checks#clearances)). Trase kabela i cijevi koje vod prelazi označene su ispod terena pri njihovu vrhu, s nazivom.

- Povucite stup u stranu da ga pomaknete duž voda.
- Povucite njegov vrh gore ili dolje da postavite visinu iznad tla.
