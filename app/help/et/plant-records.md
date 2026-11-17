---
title: Taimekirjed, sordid ja tarnitavad suurused
summary: Sinu projekti enda taimenimekiri tabelina: sordid, tarnitavad suurused (konteiner, juurepall, vart, puhas tüvi), tihedus, spetsifikatsioonimärkmed, CSV sisse ja välja; iga paigutatud taim nimetab suuruse; taimesümbolid mõõtkava järgi ning oma sümbolid ja 3D-mudelid.
keywords: taimetabel, taimede andmebaas, sort, tarnitav suurus, konteiner, juurepall, paljasjuur, vart, puhas tüvi, tihedus, taimed ruutmeetril, spetsifikatsioon, spetsifikatsiooni märkused, taimesümbol, plokk, oma sümbol, 3D-taim, detailsusaste, mõõtkava
from: 12251beb
---

Ava {{ui:Plant table}} haljastuse grupi menüüst {{ui:More}} või jaotisest Taimed. Iga rida on taimekirje sinu projekti enda nimekirjas (taimenimekirjast olev kirje kopeeritakse sisse, kui selle lisad). Iga muudatus kontrollitakse nagu imporditud fail ja on üks tagasivõtu samm.

## Veerud

- **Botaaniline nimi**, **Tavanimi**, **Tüüp**, **Kõrgus** ja **Laius** täiskasvanuna (meetrites).
- **Vahekaugus** (keskpunktist keskpunktini) või **Tihedus** (taimi m²). Istutusala kirje, millel on tihedus ja puudub vahekaugus, täidetakse selle tihedusega oma mustri järgi (kolmnurkne või ruudukujuline).
- **Tarnitavad suurused**: üks kirje iga suuruse kohta, eraldatud `;`-ga. Iga kirje on id, liik (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) ning mis tahes neist: maht `10L`, kõrgus `h0.6`, laius `s0.4`, ümbermõõt `g14-16` (cm), puhas tüvi `st1.8`. Näide: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Sordid**: nimed, eraldatud `;`-ga. Sort säilitab oma suurused ja märkmed, kui imporditud failis need olid.
- **Spetsifikatsiooni märkused**.

{{ui:Duplicate}} kopeerib rea uue võtme alla; {{ui:Save as CSV}} ja {{ui:Save as a plants file}} kirjutavad nimekirja välja (sordide CSV-read paiknevad liigi all, koos `cultivar_of`-ga). CSV- või taimefaili import ühendab selle olemasolevaga.

## Sinu oma teegi taimenimekiri

Logi sisse oma CadCrafti kontoga (Sätted, Sinu lisamoodulid, Logi sisse) ja taimetabel saab kasutada nimekirja, mida hoiad teegis:

- {{ui:From my Library list}} toob sisse sinu enda taimeüksused (ka need, mis ootavad veel ülevaatust). Taim, mis sul siin juba on, uuendatakse teegist; siia lisatud sordid, tarnitavad suurused, tihedus ja spetsifikatsioon säilivad.
- {{ui:Save as a plant list}} salvestab iga rea sinu enda teegi taimeüksusena, üks üksus liigi kohta: uus taim on uus üksus, muudetud taim on uus versioon, muutumatu jäetakse rahule. Märgi enne ära kast: salvestamine annab taimed avalikuks CC0 all. Inimese poolt veel usaldamata kasutaja esimest avalikku üleslaadimist kontrollib keegi enne, kui see ilmub, nagu iga üleslaadimist.

Teek hoiab põhilist taimekirjet. Sordid, tarnitavad suurused, tihedus ja spetsifikatsioonimärkmed jäävad projekti ja taimefaili ({{ui:Save as a plants file}}); dialoog ütleb iga salvestamisega, mitu rida see mõjutab.

## Paigutatud taim nimetab suuruse

Vali taim, hekk või istutusala või istutatud ala segurida: kui kirjel on sorte või tarnitavaid suurusi, valib {{ui:Cultivar and size}} ühe. Taimeloend loendab siis liigi, sordi ja suuruse järgi ning silt võib neid näidata: `{botanical} '{cultivar}' {size}` või `{full}`.

## Taimesümbolid mõõtkava järgi

{{ui:Plant graphics}} (Haljastus › Veel) määrab, kuidas taimi plaanil joonistatakse: **automaatne** (jämedam kui 1:500 ring taime laiuse ulatuses, 1:200 kuni 1:500 vahel kontuur keskpunktiga, peenem detailne sümbol; mõlemat mõõtkava saab muuta) või üks tase kõigile mõõtkavadele. Lehtede dialoogis on sellele komplektile oma **Taim detailsus plaanil**.

Kirje jaotises Taimed: {{ui:Own symbol…}} loeb SVG-faili või DXF/DWG-joonise ploki ning joonistab selle taime laiuse ulatuses detailsel tasemel. {{ui:Own 3D model…}} loeb OBJ-, STL- või GLB-faili; taimede graafikas vali **Iga kirje oma mudel**, et seda 3D-s näha. Failid on piiratud (512 KB SVG-d, 2000 kujundit, 50 000 kolmnurka) ja hoitakse projektis. SVG teisendusi ei rakendata (sind teavitatakse, kui fail neid sisaldab). Vt [Taimede graafika, oma sümbolid ja 3D-taimed](topic:plant-graphics) tasemete, piirangute ja selle kohta, mida GLB võib sisaldada.
