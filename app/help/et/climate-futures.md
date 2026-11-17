---
title: "Kliimaprognoosid: 2050 ja 2080 üleujutus, kuumus ja metsatulekahju"
summary: Muuda Aadress alaks tööriistas ala üleujutustaset tuleviku kliima jaoks, hinda metsatulekahju ohtu ja muuda ilmafail ning võrdle praegust ja tulevikku kliimaandmepaketist (SSP2-4.5 ja SSP5-8.5, 2050 ja 2080).
keywords: kliima, kliimamuutus, tulevik, 2050, 2080, ssp, cmip6, stsenaarium, merepind, üleujutus, baasüleujutuskõrgus, bfe, fema, kuumus, ilmafail, epw, morf, metsatulekahju, metsapõlengud
from: b0d2ee38
---

Kliimanäitajad tulevad **andmepaketist**, mitte rakendusest. Lülita sisse lisandmoodul {{ui:Kliimaprognoosid}} (Sätted › Lisandmoodulid) või laadi oma andmepaketi fail plokki {{ui:Tuleviku kliima}}.

:::warning
Lisandmooduliga kaasas olev pakett on **näidis**: kolm kohta (Denver, Miami, Johannesburg), üks kliimamudel ja viis aastat igas 20-aastases perioodis. See on tööriistade proovimiseks, **mitte projekteerimiseks**. Täispakett koostatakse failiga `tools/climate/build-pack.mjs` NASA NEX-GDDP-CMIP6 andmetest.
:::

## Kus see asub

Pind › Veel › Aadress alaks. Sea punkt, lisa kihid (FEMA üleujutuskiht annab baasüleujutuskõrguse) ja vajuta nuppu, mis ala loeb. Ala ridade all on plokk {{ui:Tuleviku kliima}}: vali **Stsenaarium** (SSP2-4.5 või SSP5-8.5) ja **Aasta** (2050 = 2041-2060, 2080 = 2071-2090, mõlemad võrreldes aastatega 1995-2014). Kasutatakse paketi kohta, mis on punktile kõige lähemal, või sinu valitud kohta; kui ükski koht pole lähedal, kasutatakse globaalseid keskmisi muutusi ja paneel ütleb seda.

## Kujunduse üleujutustase

Praegune tase on FEMA baasüleujutuskõrgus, kui üleujutuskihil see oli (jalgades, NAVD 88), muidu sisesta oma. Vali üleujutuse tüüp (rannik, jõgi või tugev vihm või mõlemad), ala üleujutussügavus vihmaosa jaoks ja vaba kõrgus, kui soovid. {{ui:Tõsta üleujutustaset}} näitab praegust ja tulevast taset kõrvuti, merepinna ja vihma osi ning eeldusi: kogu merepinna tõus lisatakse rannikutasemele; jõevool tõuseb ühe-ühele koos kõige märjema päeva sademetega ning sügavus järgib voolu astmel 0.6 (Manning, lai kanal); osad liidetakse.

:::warning
Muutuse hinnang, mitte üleujutuse uuring. Kujunduslik üleujutustase on ametiasutuse või sinu insener.
:::

## Metsatulekahju ohtlikkus (ainult hinnang)

Lähim taimkate, sellest üles tõusev nõlv ja kaugus annavad ribasid kõige madalamast äärmuslikuni, praegu ja tulevikus (tuleviku puhul korrutatakse see paketi tuleilmaindeksi muutusega). **Ainult hinnang:** meie oma suhteline skaala, et näha, kas ala vajab korralikku metsatulekahju hindamist; see ei ole normikohane hinnang.

## Kuumus: tulevikuilmafail

Vali praegune `.epw`-fail ja {{ui:Koosta tuleviku ilmafail}}: see morfeeritakse avaldatud nihke ja venitamise meetodil (Belcher, Hacker ja Powell 2005) ning kuumust võrreldakse (keskmine ja kõige kuumem temperatuur, projekteerimistemperatuurid, tunnid üle 30 °C ja 35 °C, kraadpäevad). {{ui:Salvesta tuleviku ilmafail}} salvestab selle Keskkonna paneelile, BimCrafti energiakontrollile või sinu enda tööriistadele.

## Kust arvud pärinevad

NASA NEX-GDDP-CMIP6 (allamastaabitud CMIP6 mudeli väljund, CC BY 4.0 mudeli kohta) temperatuuri, niiskuse, päikesepaiste, vihma ja tuleilma jaoks; IPCC AR6 globaalne keskmine merepinna tõusu jaoks, kui pakett ei sisalda kohalikke andmeid. Paneel näitab paketi allikat, litsentsi ja kuupäeva.
