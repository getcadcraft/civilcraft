---
title: Alustamine CivilCraftiga
summary: Mis on CivilCraft, kuidas seda avada ja esimesed kümme minutit näidisalaga: punktidest samakõrgusjoonteni, tee ja salvestatud projekt.
keywords: alustamine, esimene käivitus, näidisala, sissejuhatus, kiirjuhend, õpetus, alusta, uus projekt
from: c9b6dd8e
---

CivilCraft on CadCraft-perekonna tsiviil- ja alaprojekteerimise rakendus. See võtab mõõdistuspunktid ja teeb neist pinna (TIN) koos samakõrgusjoontega; seejärel saad paigutada trasse projekteeritud profiilidega, joonistada lihtsa tee koridori, planeerida hoonete platse maapinnaga lõikumiseni, kontrollida gravitatsioonilist torustikku oma reeglite järgi ja vaadata väljakaevamise ja täite mahte. See loeb ja kirjutab LandXML-i, ekspordib plaani DXF-ina ja plottib selle PDF-iks.

Kui oled kasutanud Civil 3D-d, on mõtted tuttavad: punktid, punktirühmad, murdejooned, trassid PI-de järgi, profiilid PVI-de järgi, koridorid, planeerimine, torustikud. Töötamise viis on teistsugune ja palju väiksem: käsurida, stiile ega joonisfaili pole. Loe [Teistest tsiviiltarkvaradest tulek](topic:coming-from) üks kord enne esimest päris tööd.

## Mida vajad

- Värske töölauabrauser: Chrome, Edge, Firefox või Safari. Vaata [Brauserid](common:browsers).
- Hiir või puuteplaat ja klaviatuur või puuteekraan: joonistamisel on seal ekraaninupud {{ui:Lõpeta}}, {{ui:Võta punkt tagasi}} ja {{ui:Loobu}} (vaata [Hiir, puuteplaat ja puude](topic:keyboard#mouse-trackpad-and-touch)).
- Plaan joonistatakse 2D-s brauseri canvas-elemendiga. [3D-vaade](topic:site-3d) kasutab brauseri WebGL-graafikat; kui see ei käivitu, ütleb olekuriba põhjuse ja plaan töötab ikka.
- Kontot ega üleslaadimist pole. Failid avanevad sinu arvutis ja salvestuvad allalaadimistena. Vaata [Sinu failid](common:your-files).

:::note
CivilCraft töötab praegu varajase brauserikoostuna, mida veel arendatakse. Töölauaversioonid pole veel saadaval ja pilvesalvestus pole veel saadaval. Kõik, mida teed, jääb sinu arvutisse, kuni salvestad või ekspordid.
:::

## CivilCraft'i avamine

1. Ava CivilCraft oma brauseris.
2. Oota, kuni ekraan täitub: ülal tööriistariba, vasakul paneel, keskel plaan ja paremal paneel **Omadused**.
3. Tühjal plaanil näed kasti pealkirjaga **Alusta mõõdistuspunktidega**. See loetleb esimesed sammud ja sisaldab linki {{ui:Ava näidisala}}.

Et CivilCraftit hiljem ilma ühenduseta kasutada, klõpsa rakenduse ribal {{ui:Salvesta võrguks}} ja oota {{ui:Valmis ka võrguta}}. See sisaldab seda abi, näidisala ning 3D- ja GIS-teeke. Vaata [Võrguta kasutamine](common:offline). Abi avamiseks kõrvale vajuta igal ajal {{key:F1}} või klõpsa {{ui:Abi}}.

## Esimesed kümme minutit: näidisala

Näidisala on väike mõõdistus USA jalgades: 276 punkti riigi tasandi koordinaatides, harjajoon, äärejoon voolujoonega ja kaks kaldeserva. See tuleb rakendusega kaasa, nii et saad järgida ilma oma failita.

1. Klõpsa plaanil olevas kastis {{ui:Ava näidisala}}.
   Avaneb dialoog **Impordi punktid**. See ütleb „276 punkti loeti vormingus PNEZD (päisereast), eraldatud komadega.“ ja näitab esimesi ridu.
2. Klõpsa {{ui:Impordi}}.
   Plaan täitub punktide, samakõrgusjoonte ja pinna servaga. Olekuriba all ütleb, et punktid imporditi ja mitu kolmnurka pinnal on (546).
3. Vaata vasakpaneelil jaotist **Punktid**. Punktid on rühmitatud kirjelduse esimese sõna järgi: CP, FL, GRD, RIDGE, TBN, TBS ja TREE.
4. Tabeli veerus **Pind** määra **FL**, **RIDGE**, **TBN** ja **TBS** väärtuseks {{ui:Murdejoon}}.
   Pind koostub kohe uuesti. Jaotises **Pind** on nüüd „Murdejooned: 4“ ja samakõrgusjooned painduvad järsult mööda voolujoont ja harjajoont, selle asemel et neid läbi lõigata.
5. Liiguta osuti plaani kohal. Olekuriba näitab osuti all ida- ja põhjakoordinaati ning seal olevat maapinna kõrgust.
6. Jaotises **Kuva** sea {{ui:Samakõrgusjooned iga}} väärtuseks 0.5 ft ja lülita sisse {{ui:Kõrgusvööndid}}. Ilmub värvivahemik koos legendiga märkeruutude all. Kui oled lõpetanud, lülita vööndid uuesti välja.

Nüüd on sul olemasoleva maapinna pind. Järgmisena tee.

## Lühikese tee paigutamine

1. Vajuta {{key:A}} (või klõpsa jaotises **Projekt** nuppu {{ui:Trass}}).
2. Klõpsa üle ala kolm punkti, üks teise järel. Punane joon liigub osutiga ja näitab järgmise sirglõigu pikkust ja suunda.
3. Lõpetamiseks vajuta {{key:Enter}}.
   Trass ilmub koos jaamadega. Paremal paneelil on **Trass**: selle pikkus, PI-tabel ja kõver keskmise PI juures (100 ft raadius või väiksem, kui 100 ft ei mahu).
4. Paremal paneelil jaotises **Projekteeritud profiil** klõpsa {{ui:Alusta maapinnast}}.
   Profiilivaade avaneb plaani alla, kus on olemasolev maapind ja sirge projekteeritud kalle algusest lõpuni.
5. Vajuta {{key:I}}, et lülitada sisse {{ui:Lisa PVI-d}}, ja klõpsa siis profiilivaates korra keskosa lähedal. Ilmub PVI.
6. Paremal PVI-tabelis kirjuta keskmise PVI lahtrisse **Kõvera L** kõvera pikkus (näiteks 100) ja vajuta {{key:Enter}}. Profiilil on nüüd vertikaalkõver, mille K-väärtus on märgistatud.
7. Jaotises **Koridor** märgi **Pühi lõiketüüp mööda projekteeritud profiili**.
   Tee planeeritakse maapinda: sõidurajad, äärevööndid ja külgkalded kuni maapinnani. Plokk **Pinnasetööd** näitab väljakaevamist ja täidet.

Ära muretse täpsete väärtuste pärast. Iga arvu saab muuta paremal paneelil ja {{key:Mod+Z}} võtab viimase muudatuse tagasi.

## Salvesta oma töö

1. Kirjuta vasakpaneeli ülaosas lahtrisse **Nimi** nimi.
2. Vajuta {{key:Mod+S}} (või klõpsa {{ui:Salvesta}}).
   Brauser laadib alla faili, mille nimi tuleb alast ja mille lõpp on `.civilcraft.json`. See sisaldab punkte, pinna seadeid, trasse, profiile, koridore, platse ja torusid.
3. Töö jätkamiseks klõpsa {{ui:Ava}} (või vajuta {{key:Mod+O}}) ja vali see fail või lohista see plaanile.

:::warning
Automaatset salvestamist pole. Kui sulged vahelehe salvestamata muudatustega, küsib brauser, kas lahkuda; kui lahkud, muudatused lähevad kaduma. Salvesta tihti.
:::

## Kuhu edasi

- [Impordi mõõdistuspunktid](topic:import-points) oma failidest.
- [Koosta ja täpsusta pind](topic:build-surface) murdejoonte ja piirjoonega.
- [Ekraan, osa kaupa](topic:workspace).
- [Klahvid ja hiir](topic:keyboard).
