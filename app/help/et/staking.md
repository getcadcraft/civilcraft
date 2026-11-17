---
title: Koosta paigamärkimise aruanne
summary: Loetle trassi vaiad pikettidel ja nihetel või trassi lähedal asuvad mõõdistuspunktid koos pikettide, nihete, põhja- ja idakoordinaatide, projekti- ja maapinna kõrgusmärkide ning kaevandi või täite väärtustega. Salvesta aruanne CSV või PDF-ina.
keywords: paigamärkimine, vaiaaruanne, kaevandi leht, kalde leht, pikett, nihe, märkimine, kaevand, täide, paigutus, ehitusaegne paigamärkimine, tegelik teostus, as-built
from: d8a4e9f1
---

Vali trass ja klõpsa selle **Omadustes** nupul **Paigamärkimise aruanne**.

## Vaiad pikettidel ja nihetel

1. **Algus** ja **lõpp**: pikettid, millele vaiad märkida (1+50 või 150).
2. **Iga**: intervall. Vaiad paigutatakse selle iga kordse juurde, mõlemas otsas ning (kui märkeruut on märgitud) kohtadesse, kus trassi kõverad algavad ja lõppevad.
3. **Nihked**: trassi vasakul ja paremal pool, vaadates pikettide kasvavas suunas: `12 L, 0, 12 R`, `L12 CL R12` või `-12, 0, 12` (vasak on miinus). Koridoriga trass algab sõidutee ja õlgade servadest.
4. **Nummerda alates** ja **eesliitega** annavad vaiadele nime: 1, 2, 3 või S101, S102.

## Trassi lähedal asuvad mõõdistuspunktid

Vali **trassi lähedal asuvad mõõdistuspunktid** ja kui lähedal. Iga selle kauguse piires olev punkt saab oma pikettide ja nihke, seal oleva projekti ning enda kõrguse maapinnana: see on kontroll punktide kohta, mis on märgitud või mõõdetud tegelikult teostatuna.

## Mida aruanne ütleb

| Veerg | Mida see tähendab |
|---|---|
| Punkt | Vaia nimi või mõõdistuspunkti number |
| Pikett, nihe | Asukoht trassil: L vasak, R parem |
| Põhjakoordinaat, idakoordinaat | Selle koordinaadid |
| Proj. kõrgusmärk | Kaevatud koridori pind seal (ühest päevajoonest teise), muidu projektiprofiil telgjoonel |
| Maapinna kõrgusmärk | Olemasolev pind seal või mõõdistuspunkti enda kõrgus |
| Kaevand/täide | C, kui maapind on projektist kõrgemal (kaeva maha), F, kui madalamal (täida), sajandiku täpsusega |

Vaial, millel puudub projekti kõrgusmärk (väljaspool koridori või trassil, millel pole telgjoonest eemal kõrgusmärki), ei ole kaevandit ega täidet; dialoog ütleb, mitu neid on.

## Salvesta

- **CSV**: pealkirjarida, seejärel ülal toodud veerud ning kaevand või täide märgiga arvuna (maapind miinus projekt) tabelarvutustele ja andmekogujatele.
- **PDF**: tabelilehed valitud paberil, üks vaia rea kohta, kaevandid oranžina ja täited roheliselt, teiste lehtedega ühtse pealkirjaribaga.

:::note
Vaiad arvutatakse projektis oleva kavandi põhjal. Enne ehitamist kontrolli neid kinnitatud plaanidega.
:::
