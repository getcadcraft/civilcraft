---
title: WaterCraft: nõudlus, tuletõrje vooluhulk, katkestused ja vee vanus
summary: Lisamooduliga WaterCraft muuda kliendid nõudluseks veetorustikul, kontrolli igal hüdrandil saadavat vooluhulka, vaata, millise torustiku katkestus kahjustab kõige rohkem, ja jälgi vee vanust ning kloori päeva jooksul.
keywords: watercraft, veejaotus, nõudlus, kliendid, tipufaktor, nõudluse ajakava, tuletõrje vooluhulk, hüdrant, jääkrõhk, kriitilisus, katkestus, ventiiliga lõik, vee vanus, kloor, jääk, allika jälgimine, läbisõiduta ots, csv, lisamoodul
from: 066fb17a
---

WaterCraft on lisamoodul, mis töötab veevõrgul, mille oled juba joonistanud veetorude tööriistadega. See lisab parempoolsele paneelile sakki, millel on neli jaotist.

:::warning
Ainult arvutusabi. See kontrolliti käsitsi arvutatud vastustega väljamõeldud võrkudel, mitte päris veevarustusettevõtte mudeliga. Vee insener peab iga tulemuse üle vaatama. Stsenaariumid, juhtimisreeglid, ventiilid ja väljaloetud andmed on oma teemadel „Stsenaariumid“ ja „Uuringud“ WaterCraft-lisamooduli abis.
:::

## Mida sa teed

- Paned kliendid võrku nõudlusena.
- Leiad hüdrandid, mis jäävad alla vajaliku vooluhulga.
- Leiad torud, mille katkestus on kõige olulisem.
- Leiad vana vee ja madala kloori.

## Sammud

1. Ava {{ui:Sätted}} › {{ui:Lisandmoodulid}} ja lülita sisse {{ui:WaterCraft (veejaotus)}}. Paremale paneelile ilmub {{ui:WaterCraft}} sakk.
2. Joonista kõigepealt veetorude tööriistadega reservuaar, sõlmpunktid ja torud (vt [Veetorustik](topic:water-mains)). Ilma võrguta ütleb sakk seda sulle.
3. Jaotises **Nõudlus** kleebi üks klient rea kohta: id, x, y, liik, kogus. Vali {{ui:Tipufaktor}} ja nõudluse ajakava (elamu päev, ärigraafik, ühtlane või säilita praegune). Vajuta {{ui:Kontrolli}}, et näha, kuhu iga klient jõuab (lähim sõlmpunkt), ja seejärel {{ui:Vii võrku}}. Tagasivõtmine eemaldab nõudlused.
4. Jaotises **Tuletõrje vooluhulk** määra vajalik vooluhulk ja jääkrõhk, vali, kas jääkrõhku hoitakse {{ui:Ainult hüdrandil}} või {{ui:Kogu süsteemis (rangem)}}, ja vajuta {{ui:Horisontaalne pikkus}}. Iga hüdrant on loetletud halvimast alustades, kas „vastab“ või „puudu“.
5. Jaotises **Milline toru on kõige olulisem** vali {{ui:üks toru korraga}} või {{ui:üks ventiiliga lõik korraga}} ja vajuta {{ui:Horisontaalne pikkus}}. Iga katkestus näitab ära lõigatud nõudluse, ära lõigatud sõlmpunktid, sõlmpunktid, mis jäid alla miinimumrõhu, ja jäänud madalaimat rõhku.
6. Jaotises **Vee vanus ja kloor** vali, mida jälgida (vee vanus, kloor või allika jälgimine), määra tundide arv ja soovitud piirid ning vajuta {{ui:Horisontaalne pikkus}}. Sõlmpunktid, mis jäävad väljapoole sinu piire, on loetletud.
7. Vajuta mis tahes tabeli all {{ui:Salvesta CSV-na}}, et see alles hoida.

## Märkused

- Vajalik tuletõrje vooluhulk ning tarbimine kodu või aakri kohta on algväärtused, mitte standardid. Kasuta oma veevarustusettevõtte enda arve.
- Toru, mida ventiil on osaliselt lõiganud, suletakse tervikuna, nii et näidatud katkestus on natuke halvem kui päris.
- Käivita vee kvaliteedi lõik piisavalt kaua, et päevane ajakava korduks enne viimase päeva lugemist.
- {{ui:Lõpeta}} lõpetab pika käigu varakult; loend näitab siis ainult seda, mis tehti.
- Su võrk jääb sellesse projekti ja sellesse arvutisse. Midagi ei saadeta kuhugi.
