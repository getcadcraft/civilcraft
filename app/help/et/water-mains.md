---
title: Veetorustikud: rõhud, vooluhulgad ja tuletõrje vooluhulk
summary: Joonista plaanile survevõrk sõlmedest, veehoidlatest, paakidest, torudest, pumpadest ja rõhku alandavatest ventiilidest; CivilCraft arvutab rõhukõrgused, rõhud ja vooluhulgad (Hazen–Williams, silmustatud võrgud), tuletõrjeks saadaoleva vooluhulga ning päevase tarbimise. Katsefunktsioon; iga tulemus vajab inseneri kontrolli.
keywords: vesi, veetorustik, veevarustus, survevõrk, survetoru, silmustatud võrk, hazen-williams, C-tegur, rõhukadu, jääkrõhk, tuletõrje vooluhulk, tuletõrjehüdrant, tarbimine, sõlm, veehoidla, paak, pump, pumba kõver, rõhku alandav ventiil, PRV, tagasilöögiklapp, pikaajaline periood, EPANET, inp, kiirus
from: df46bf6d
---

Veetorustikud on ala survepool: torud, mis on alati täis, ning vett surutakse läbi veehoidla, paagi või pumba abil. CivilCraft arvutab igas sõlmes rõhukõrgused ja rõhud ning igas torus vooluhulga, sealhulgas silmustatud võrkudes, kus veel on rohkem kui üks tee. Funktsioon on laboris, kuni seda kontrollitakse.

**Ainult arvutusabivahend.** Iga arv vajab kvalifitseeritud inseneri kontrolli: vastus on sama hea kui tarbimised, kõrgusmärgid, torude suurused ja karedusväärtused, mille andsid, ning püsiseisundi mudel ei tea veelöögist, veekvaliteedist ega tuletõrjepumba tegelikku käitumist.

## Võrgu joonistamine

1. **Pind** › {{ui:Veel}} all vali {{ui:Veevarustustorustik…}}. Aken jääb lahti, kuni plaanil töötad.
2. Vali {{ui:Veehoidla}} ja klõpsa plaanil kohas, kus veevarustus asub. Selle rõhukõrgus algab 100 ft (30 m) maapinnast kõrgemal; muuda seda **Omadustes**.
3. Vali {{ui:Sõlm}} ja klõpsa igal kohal, kus vett võetakse või torud kohtuvad. Sõlm võtab oma kõrgusmärgi maapinnast; sisesta **Omadustes** teine, et seda tühistada.
4. Vali {{ui:Toru}}, klõpsa sõlmel ja seejärel sõlmel, millega see ühendub. Tööriist jääb järgmise toru jaoks sisse. {{ui:Pump}} ja {{ui:Rõhku alandav ventiil}} joonistatakse samamoodi, imisest (või ülesvoolu) sõlmest survepoolse (või allavoolu) sõlmeni. {{ui:Paak}} paigutatakse nagu sõlm.
5. Vali sõlm ja sisesta selle {{ui:Tarbimine}} (gpm või meetrite projektis L/s). Vali toru ja määra selle {{ui:Läbimõõt}} (in või mm) ning, kui sa seda tead, selle Hazen–Williamsi C.

Iga muudatus on üks tagasivõtmise samm. Delete eemaldab sõlme ja torud, mis selles lõppevad.

## Mida iga osa tähendab

- **Toru.** Pikkus mõõdetakse mööda plaani, kui sa ei sisesta seda. C on Hazen–Williamsi karedus (alguses 130; vaikeväärtust saab muuta aknas). Väikese kadu koefitsient K lisab kõverate ja liitmike kaod. Märgi **Tagasilöögiklapp**, kui toru ei tohi vett tagasi kanda; **Suletud** toru ei kanna midagi.
- **Veehoidla.** Allikas fikseeritud rõhukõrgusel, veetase, mida ta hoiab nullpinnast kõrgemal. Ta annab või võtab nii palju, kui võrk vajab.
- **Paak.** Tase, mis muutub päeva jooksul. Püsiseisundi tulemustes on see allikas oma praegusel tasemel.
- **Pump.** Üks projekteerimispunkt (vooluhulk ja rõhukõrgus) annab sellest läbi tavapärase kõvera: rõhukõrgus nullvoolul on 133 % projekteerimisrõhukõrgusest ning rõhukõrgus on null kahekordsel projekteerimisvooluhulgal. Pump ei suru vett kunagi tagasi.
- **Rõhku alandav ventiil.** Hoiab allavoolu sinu seatud rõhku, kui tarne on kõrgem. Kui tarne on madalam, on see avatud ega hoia midagi; kui vesi jooksis tagasi, sulgub see.

## Tulemuste lugemine

Aknas on iga sõlme rõhukõrgus ja rõhk ning iga lüli vooluhulk, kiirus ja rõhukadu 1,000 ft kohta (või km kohta). Sõlmed on plaanil värvitud: roheline on sinu madalaima ja kõrgeima rõhu vahel, punane allpool ja kollane kõrgemal. Voolunooled näitavad suunda. Vali sõlm või toru, et lugeda selle arve **Omadustes**.

Tabelite all on loend, mida vaadata: madal või kõrge rõhk, toru, mis on kiirem kui su piir, sõlm, mis on lõigatud kõigist allikatest, või lahendaja, mis ei stabiliseerunud. Samad leiud on paneelil Probleemid. Piirid määratakse aknas (alguses 20 psi, 100 psi ja 10 ft/s; meetrite projektis 140 kPa, 700 kPa ja 3 m/s).

## Tuletõrje vooluhulk

{{ui:Tuletõrje vooluhulk…}} joonistab vooluhulga ühes sõlmes ja näitab seal olevat rõhku ning madalaimat rõhku kogu võrgus. Samuti leiab see sellesse sõlme saadaoleva vooluhulga, kui võrgu nõrgim sõlm hoiab sinu antud jääkrõhku. Muud tarbimised jäävad samaks.

## Päev tarbimist

{{ui:Üks päev tarbimist…}} käivitab võrgu tund-tunnilt. Anna tarbimismuster faili sätetes (korduv kordajate loend); paagid täituvad ja tühjenevad sissevoolu ja väljavoolu järgi ning pump võib järgida sisse/välja mustrit. Paak, mis jõuab oma kõrgeima või madalaima tasemeni, on loendis nimetatud: CivilCraft ei sulge selle sisselaskmist ega väljalaskmist sinu eest, seega loe seda nii: „see paak on liiga väike või pump liiga suur“.

## EPANETi tekst

{{ui:Salvesta EPANETi tekstina (.inp)}} kirjutab võrgu tavalises tekstivormingus, mida paljud veeprogrammid loevad, ja {{ui:Ava EPANETi tekst (.inp)…}} loeb ühe sisse. Tuleb kaasa ainult see, mida CivilCraft modelleerib: sõlmed, veehoidlad, paagid, torud, pumbad rõhukõvera järgi, rõhku alandavad ventiilid, tarbimismustrid ja ajad. Muud ventiilitüübid, võimsusega määratud pumbad ja muud rõhukao valemid nimetatakse ja jäetakse välja. Fail peab kasutama samu ühikuid, mis projekt.

## Hüdrandid, ventiilid ja liitmikud

Vali sõlm ja märgi **Hüdrant**, et sinna üks panna; vali magistraal ja vajuta **Lisa keskele**, et panna sinna ventiil, õhuventiil, tühjendusventiil või mõõtur. Need on võrgu objektid: nad liiguvad koos sellega ja üks tagasivõtmise samm eemaldab need.

Paigutus eeldab ka liitmikke, ning CivilCraft loetleb need küsimata: **T-tükk**, kus kolm magistraali kohtuvad, **rist**, kus neli, **kõver** (koos nurgaga), kus kaks magistraali pööravad vähemalt 5° võrra, **reduktsioon**, kus kaks suurust kohtuvad, ja **kork** surnud otsas. {{ui:Liitmike loend (CSV)}} loeb need ja magistraalid suuruse järgi. See on see, mida paigutus eeldab, koguste arvestus, mida kontrollida oma detailidega, mitte nimekiri, millest tellida.

Magistraalid paigutatakse maapinnast katvuse (4 ft või 1.2 m) võrra madalamale, et neid saaks 3D-s joonistada ja modelleerida; ülaltoodud rõhud ei sõltu sellest kunagi.

## Plaanil ja failides

Plaan, PDF ja DWG või DXF kannavad magistraale kihil **C-WATR-MAIN**, nende suurused kihil **C-WATR-TEXT**, hüdrandid kihil **C-WATR-HYDR**, ventiilid kihil **C-WATR-VALV** ja liitmikud kihil **C-WATR-FITT**. LandXML-väljund kirjutab veetorustiku võrgu (iga sõlme kohta rajatis, iga magistraali kohta toru, hüdrandid nimetatud); LandXML-sisend loeb selle tagasi veetorustikena, ilma tarbimiste, pumpade ja ventiilideta, mida LandXML ei kanna. IFC-eksport kirjutab magistraalid torulõikudena, hüdrandid, ventiilid ja liitmikud ühes veesüsteemis. Neid faile on kontrollitud meie enda lugeja ja kirjutajatega; proovi neid oma teistes programmides ja anna meile teada, mida nad ütlevad.

## Mida siin veel ei ole

Veekvaliteet ja vanus, juhtimine ja reeglid väljaspool pumba sisse/välja mustrit, muud ventiilitüübid, tarbimine rõhu järgi, muutuva läbimõõduga torud ja kanalisatsiooni vooluhulgad aja jooksul. Vt [Veel ehitamata](topic:not-built-yet). Sanitaarsed projekteerimisvoolud, mis on teine arvutus, on jaotises [Sanitaarsed projekteerimisvoolud](topic:sanitary-design).
