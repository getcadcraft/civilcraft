---
title: DWG ar DXF atidarymas kaip linijų grafika
summary: Atidarykite brėžinio linijų grafiką plane sluoksnis po sluoksnio, naudokite jo horizontales, 3D polilinijas ir uždarus kontūrus paviršiui bei paverskite jo taškų blokus geodeziniais taškais.
keywords: geodezinė patikra, aukščiai tekstu, dwg, dxf, cad, brėžinys, linijų grafika, horizontalės, lūžio linijos, riba, polilinija, 3D polilinija, sluoksniai, pagrindinis žemėlapis, topo, geodezinis brėžinys, blokai, blokų nuorodos, geodeziniai taškai iš blokų, atributai, taškų blokai, įterpimo taškas
from: da0f4c58
---

Topografinė geodezinė nuotrauka dažnai ateina kaip brėžinys: horizontalės kaip polilinijos savo aukštyje, lūžio linijos kaip 3D polilinijos, sklypo kontūras kaip uždara polilinija. CivilCraft atidaro brėžinio **modelio erdvę** kaip sluoksnius plane ir gali tiesiai iš tų linijų paversti paviršių.

## Atidarykite brėžinį

1. Spustelėkite {{ui:Linijinė grafika}} grupėje **Paviršius** (arba {{ui:Atidaryti}}, arba numeskite failą ant plano) ir pasirinkite `.dwg` ar `.dxf` failą. Brėžinys nuskaitomas šiame kompiuteryje; nieko neįkeliama. Skaitomi DWG nuo 2000 iki 2018 ir ASCII DXF.
2. Dialogas **Linijinė grafika** išvardija brėžinio sluoksnius, kuriuose yra linijų, uždarų figūrų ar taškų, ir ar jie turi **aukščius**. Sluoksniai, išjungti brėžinyje, pradžioje nepažymėti. Tekstas, brūkšniuotės, matmenys ir kiti ne linijų objektai suskaičiuojami ir praleidžiami (dialogas nurodo, kurie).
3. Patikrinkite **Brėžinio vienetai**. Kai brėžinys nurodo savo vienetus, CivilCraft konvertuoja juos į projekto vienetus (milimetrus į metrus, metrus į pėdas, colius į pėdas). Pėdomis išreikštas brėžinys nuskaitomas kaip JAV geodezinės pėdos be mastelio keitimo: skirtumas – 2 dalys per milijoną, o valstijos plokštumos koordinačių mastelio keitimas perkeltų jas per pėdas. Kai brėžinys nenurodo savo vienetų, jo skaičiai nuskaitomi projekto vienetais; pasirinkite teisingus vienetus sąraše, jei jie neteisingi.
4. Skiltyje **{{ui:Naudoti paviršiui}}** pasirinkite, ką kiekvienas sluoksnis duoda paviršiui (arba palikite **Tik rodyti**). Sluoksniai, pavadinti kaip horizontalės (TOPO, CONT, CNTR), turintys aukščius, pradžioje tampa lūžio linijomis.
5. Spustelėkite {{ui:Pridėti}}. Sluoksniai atsiranda kairiajame skydelyje po **GIS sluoksniai**; kiekvienas naudojimas įdedamas į paviršių. Kiekviena dalis yra atskiras žingsnis: {{key:Mod+Z}} atšaukia jas po vieną.

## Ką gali duoti kiekvieno tipo sluoksnis

| Sluoksnyje yra | Naudoti paviršiui |
|---|---|
| Horizontalės (polilinijos savo aukštyje) | Lūžio linijos savo aukštyje arba ELEV lauko aukštyje |
| 3D polilinijos | Lūžio linijos savo aukščiais |
| Uždaras kontūras | Paviršiaus riba (didžiausia uždara figūra arba jūsų pasirinkta) |
| Taškai su aukščiu | Geodeziniai taškai, apibūdinti sluoksnio pavadinimu |
| Linijos 0 aukštyje (plano linijų grafika) | Nieko: jis lieka plane kaip pagrindinis brėžinys |

Brėžinys, kurį parašė CivilCraft, laiko savo charakteringas linijas 3D polilinijomis, kurios prisimena savo lankus. Tada dialogas rodo **Charakteringos linijos**: palikite pažymėtą, kad jos grąžintų kaip charakteringas linijas su lankais ir naudojimais (vienas atšaukimo žingsnis), arba nuimkite žymą, kad jos būtų nuskaitytos kaip linijų grafika, kaip bet kuris kitas sluoksnis.

Vėliau pasirinkite {{ui:Naudoti paviršiui}} sluoksnio meniu skiltyje **GIS sluoksniai**, kad tai padarytumėte sluoksniui, kurį tik rodėte.

## Geodeziniai taškai iš blokų

Geodeziniuose brėžiniuose taškai dažnai pateikiami kaip blokai: mažas simbolis kiekvienam matavimui, su atributais taško numeriui, aprašui ir aukščiui. Kai brėžinyje yra blokų nuorodų, dialoge yra skyrius **Geodeziniai taškai iš blokų**:

1. Pažymėkite blokus, kuriuos imti (lentelė nurodo, kiek nuorodų turi kiekvienas, kuriuose sluoksniuose ir kokius atributus), arba pažymėkite sluoksnius, kad imtų kiekvieną blokų nuorodą juose.
2. Pasirinkite, iš kur ateina kiekvieno taško **numeris**, **aprašas** ir **aukštis**: atributas, bloko ar sluoksnio pavadinimas, kiti laisvi numeriai arba įterpimo taško Z. CivilCraft pradeda nuo tikėtinų atributų (PT, DESC, ELEV ir panašių) ir paima aukštį iš atributo tik tada, kai blokai stovi nulyje.
3. Nuimkite linijų grafikos sluoksnių žymas, jei norite tik taškų, tada spustelėkite {{ui:Pridėti}}.

Kiekviena nuoroda tampa vienu geodeziniu tašku savo įterpimo taške. Skaičiuojamos tik nuorodos, įdėtos modelio erdvėje; blokai, įdėti į kitus blokus, neskaičiuojami. Numeriai, jau esantys projekte arba panaudoti brėžinyje du kartus, gauna naujus numerius po didžiausio, o aukščio atributas, kuris nėra skaičius, palieka tą tašką be aukščio; būsenos juosta suskaičiuoja abu. Brėžinys niekada nekeičiamas, o kiekvienas taškas prisimena savo bloką: jo Ypatybėse rodoma **Iš bloko** su bloku, sluoksniu ir identifikatoriumi. Taškų pridėjimas yra vienas žingsnis, todėl {{key:Mod+Z}} pašalina visus.

## Aukščiai tekstu ir patikra

Aukščiai, užrašyti tekstu (arba bloko atribute, kuris nėra geodezinio taško blokas), nėra linijų grafika. Skyrius **Geodezinių aukščių ir patikra** gali juos paimti kaip geodezinius taškus ir išvardija, kas atrodo neteisingai brėžinyje: vienetai, koordinačių sistema, atstumas nuo nulio, plokščios horizontalės, keisti aukščiai, dvigubi taškai. Žr. [Geodezinio brėžinio patikra importuojant](topic:survey-check).

## Kaip nuskaitomas brėžinys

- Lankai, apskritimai, elipsės, išlenkti polilinijų segmentai ir splainai tampa trumpomis tiesiomis atkarpomis (ne daugiau kaip kas 5°).
- Blokų nuorodos piešiamos ten, kur įdėtos, įdėti blokai taip pat; ką bloko turinys laiko sluoksnyje 0, perima nuorodos sluoksnį.
- Objektai, nubrėžti kitoje plokštumoje (kitokia ištempimo kryptis), patalpinami pasaulio koordinatėse.
- Kiekvienas objektas gauna tris laukus: LAYER, TYPE (objekto tipas) ir ELEV (jo aukštis, kai visi jo taškai turi vieną aukštį).
- Koordinatės imamos tokios, kokios yra: brėžinys turi naudoti tas pačias koordinates kaip projektas (pavyzdžiui, tą pačią valstijos plokštumos zoną). Susieti brėžiniai (xref) neatidaromi: atidarykite juos atskirai.

:::tip
Horizontalių brėžinys geriausiai duoda paviršių su keliais taškiniais aukščiais kalvų viršūnėse ir įdubose, kur vien horizontalės palieka plokščius trikampius. Pridėkite juos kaip geodezinius taškus arba iš taškų sluoksnio brėžinyje.
:::
