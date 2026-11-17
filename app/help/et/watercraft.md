---
title: WaterCraft: tarbimised, tuletõrje vooluhulk, katkestused ja vee vanus
summary: WaterCraft-lisandmooduliga muudad kliendid oma veetorustiku tarbimisteks, kontrollid igas hüdrandis saadaolevat vooluhulka, näed, millise torustiku katkestus mõjutab kõige rohkem, ning jälgid vee vanust ja kloori päeva jooksul.
keywords: watercraft, veevarustus, tarbimised, kliendid, tipufaktor, tarbimismuster, tuletõrje vooluhulk, hüdrant, jääkrõhk, kriitilisus, katkestus, sulgventiiliga lõik, vee vanus, kloor, jääk, allika jälgimine, surnud ots, csv, lisandmoodul
from: 76809f01
---

WaterCraft on lisandmoodul, mis töötab veetorustiku võrgul, mille oled juba joonistanud tööriistadega Veetorustik. See lisab paremale paneelile vahekaardi, millel on neli osa.

:::warning
Ainult arvutusabi. Seda on kontrollitud käsitsi arvutatud vastustega väljamõeldud võrkudel, mitte tegeliku veevarustusettevõtte mudelil. Iga tulemuse peab üle vaatama veeinsener. Pumbajaamu, teise järku lagunemist ja stsenaariume veel ei ole.
:::

## Mida sa teed

- Lisa kliendid võrku tarbimistena.
- Leia hüdrandid, mille vooluhulk jääb alla vajaliku.
- Leia torustikud, mille katkestus on kõige olulisem.
- Leia vana vesi ja madal kloorisisaldus.

## Sammud

1. Ava {{ui:Sätted}} › {{ui:Lisandmoodulid}} ja lülita sisse {{ui:WaterCraft (veevarustus)}}. Paremale paneelile ilmub vahekaart {{ui:WaterCraft}}.
2. Joonista esmalt veetorustiku tööriistadega reservuaar, sõlmpunktid ja torud (vaata [Veetorustik](topic:water-mains)). Kui võrku pole, ütleb vahekaart seda sulle.
3. Jaotises {{ui:Tarbimised}} kleebi üks klient reale: id, x, y, liik, kogus. Vali {{ui:Tipufaktor}} ja {{ui:Tunnimuster}} (elamu päev, ärihoone päev, ühtlane või jäta muster muutmata). Vajuta {{ui:Kontrolli}}, et näha, kuhu iga klient jõuab (lähimasse sõlmpunkti), seejärel {{ui:Pane võrku}}. {{ui:Võta tagasi}} võtab tarbimised tagasi.
4. Jaotises {{ui:Tuletõrje vooluhulk}} määra vajalik vooluhulk ja jääkrõhk, vali, kas jääkrõhk hoitakse {{ui:Ainult hüdrandil}} või {{ui:Kogu süsteemis (rangem)}}, ning vajuta {{ui:Horisontaalne pikkus}}. Iga hüdrant on loetletud halvimast alustades, kas vastab nõuetele või on puudu.
5. Jaotises {{ui:Milline torustik on kõige olulisem}} vali {{ui:üks toru korraga}} või {{ui:üks sulgventiiliga lõik korraga}} ja vajuta {{ui:Horisontaalne pikkus}}. Iga katkestus näitab ära lõigatud tarbimist, ära lõigatud sõlmpunkte, sõlmpunkte, mis on nüüd alla miinimumrõhu, ja jäänud madalaimat rõhku.
6. Jaotises {{ui:Vee vanus ja kloor}} vali, mida jälgida (vee vanus, kloor või allika jälgimine), määra tundide arv ja soovitud piirid ning vajuta {{ui:Horisontaalne pikkus}}. Sõlmpunktid, mis jäävad väljapoole sinu piire, on loetletud.
7. Hoia mis tahes tabeli all tulemus alles, vajutades {{ui:Salvesta CSV-na}}.

## Märkused

- Vajalik tuletõrje vooluhulk ning tarbimine ühe kodu või aakri kohta on algväärtused, mitte standardid. Kasuta oma veeettevõtte enda näitajaid.
- Ventiiliga osaliselt lõigatud toru suletakse tervikuna, nii et näidatud katkestus on tegelikust veidi halvem.
- Käivita veekvaliteedi osa piisavalt kaua, et päevane muster kordub enne viimase päeva lugemist.
- {{ui:Lõpeta}} lõpetab pika käivituse varakult; loend näitab siis ainult tehtud osa.
- Su võrk jääb sellesse projekti ja sellesse arvutisse. Midagi ei saadeta kuhugi.
