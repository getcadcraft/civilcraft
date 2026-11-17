---
title: Narišite nadzemni vod
summary: Postavite stebre na tloris, naj CivilCraft določi vlogo vsakega stebra in odseke med končnimi stebri, ter premikajte stebre na tlorisu ali na profilu voda.
keywords: nadzemni vod, steber, drog, raspon, odsek, končni steber, kot, obešanje, profil, višina, prečna traverza, zateg, vrv, sidro
from: b8e5e272
---

## Narišite ga

1. Imejte površje: teren pod vodom pride iz njega ([Izdelava površja](topic:build-surface)). Steber brez terena pod seboj je naveden pod **Preverjanja**; namesto tega vnesite njegovo **Koto terena** v **Lastnostih**.
2. Kliknite {{ui:Vod}} v skupini Daljnovodi in kliknite vsak steber na tlorisu.
3. Dvakrat kliknite zadnjega ali pritisnite {{key:Enter}}.

Vod prevzame vodnik, steber in opremo, ki ste jo nazadnje uporabili na tem računalniku (prvič: primeri iz knjižnice). Spremenite jih v Lastnostih.

## Vod v Lastnostih

Izberite vod (kliknite na raspon), da nastavite njegov **Vodnik**, **Vodnike na tokokrog**, **Tokokroge**, **Napetost**, **Pravilo odmikov**, ki ga mora ohraniti nad terenom, in opremo **Na vsakem stebru** (prečna traverza, izolatorji, armature). Tabela navede njegove **odseke** z vsakim merodajnim rasponom, običajno napetostjo in obtežnim primerom, ki ga ureja.

## Stebri

Kliknite steber, da ga izberete. V Lastnostih:

- **Steber**: njegov element knjižnice. Ko je prešibek, {{ui:Uporabi …}} vstavi najmanjši steber istega materiala iz vaše knjižnice, ki nosi obremenitev.
- **Vloga**: Samodejno, Obešanje, Kot ali Končni. Samodejno pomeni: prvi in zadnji steber sta končna; zavoj nad kotom iz nabora pravil naredi kotni steber; večji zavoj naredi končni steber.
- **Višina nad terenom**: prazno jo vzame iz elementa knjižnice (njegova dolžina manj globina v tleh).
- **Tudi na tem stebru**: dodatna oprema, na primer **zateg** (vrv). Zategnjen steber prenese vlečno silo voda na svojo vrv.
- **Obstoječi steber**: preveri se kot drugi, vendar se izpusti iz količin.

{{ui:Podpora}} doda steber na raspon, ki je najbližji vašemu kliku. Povlecite steber na tlorisu, da ga premaknete. {{key:Delete}} ga odstrani (vod ohrani vsaj dva).

Odseki potekajo med končnimi stebri: znotraj odseka vodnik prosto teče skozi obešalne objemke, zato ena napetost velja za ves odsek.

## Vzdolžni profil voda

Kliknite {{ui:Profil}} (ali **Profil** v Lastnostih voda). Podokno pod tlorisom prikaže teren vzdolž voda, vsak steber od terena do vrha, najnižjo fazo vodnika pri **Obtežnem primeru**, ki ga izberete, in odmik, ki ga mora vod ohraniti, kot črtkano črto. Raspon, ki ne uspe, je rdeč; število pod vsakim rasponom je njegov najnižji odmik.

- **Vod** izbere nadzemni vod za prikaz. Izbira drugega voda ali enega od njegovih stebrov na tlorisu preklopi profil nanj.
- Premaknite kazalec nad profil: vodilna črta mu sledi, oznaka pa prikaže razdaljo vzdolž voda, teren, vodnik in odmik tam (in pove, kdaj je odmik pod pravilom voda).
- {{ui:Meri}} v vrstici profila: kliknite dve točki, da dobite razdaljo v širino, višinsko razliko, ravno razdaljo in naklon med njima. Klik blizu terena, vodnika ali vrha stebra se nanj prilepi. Za konec ponovno kliknite {{ui:Meri}}.
- Ovire, ki jih vod seka, stojijo nad terenom: narisane kot stolpci, rastline krajinskega oblikovanja kot njihova krošnja, zidovi kot stolpci (glejte [Preverjanja daljnovoda](topic:power-line-checks#clearances)). Kabelske trase in cevi, ki jih vod seka, so označene pod zemljo na njihovem vrhu, z imenom.

- Povlecite steber vstran, da ga premaknete vzdolž voda.
- Povlecite njegov vrh navzgor ali navzdol, da nastavite njegovo višino nad terenom.
