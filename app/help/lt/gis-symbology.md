---
title: Sluoksnio stilius pagal atributą
summary: Nuspalvinkite GIS sluoksnio objektus pagal lauko reikšmes (viena spalva kiekvienai reikšmei arba pagal skaičių intervalus), taškų dydį pagal skaičių, poligonų atspalvį ir legendą plane.
keywords: simbolika, stilius, spalva, kategorizuota, gradacinė, unikalios reikšmės, lygūs intervalai, kvantilis, natūralūs lūžiai, jenks, gradientas, legenda, dydis, taškai, choropletas, klasės, spalvų aklumas, gis
from: a3a69add
---

Atidarykite GIS sluoksnių sąraše sluoksnio **tris taškus** ir pasirinkite {{ui:Stilius pagal atributą…}}.

## Trys stiliai

- **Vienas simbolis:** sluoksnio spalva, kaip anksčiau.
- **Kategorizuotas:** viena spalva kiekvienai atskirai bet kurio lauko reikšmei. Iki aštuonių reikšmių gauna aštuonias Okabe-Ito spalvas (parinktas taip, kad išliktų skirtingos įprastiems spalvų aklumo tipams). Su daugiau reikšmių septynios dažniausios gauna po spalvą, o likusios dalijasi pilkos spalvos klasę **Kita**. Objektai be reikšmės yra pilki.
- **Gradacinis:** skaitinis laukas suskirstomas į nuo 2 iki 9 intervalų, kiekvienas su spalva iš gradiento. Reikšmė ant ribos patenka į žemesnį intervalą.

## Kaip pjaunami intervalai

| Metodas | Ribos |
|---|---|
| Lygūs intervalai | Intervalas nuo mažiausios iki didžiausios reikšmės padalytas į lygius plotius. Reikšmės nuo 0 iki 30 trijuose intervaluose: 0, 10, 20, 30. |
| Kvantilis | Maždaug vienodas objektų skaičius kiekviename intervale. Ribos skaičiuojamos iš surūšiuotų reikšmių įprasta tiesine interpoliacija: 1–10 dviejuose intervaluose riba yra 5.5. |
| Natūralūs lūžiai (Jenks) | Pjūviai, kurie palieka mažiausią sklaidą kiekviename intervale, todėl panašių reikšmių grupės lieka kartu. Daugiau nei 1,500 reikšmių atveju dirbama su 1,500 vienodai išdėstytų reikšmių ir apie tai pranešama. |

## Spalvos

Viridis ir Cividis eina nuo tamsaus iki šviesaus su tolygiu ryškumo pokyčiu, todėl intervalų tvarka aiški net pilkos spalvos atveju arba esant spalvų aklumui. Blues eina nuo šviesaus iki tamsaus. Raudona–mėlyna yra dvipusis gradientas reikšmėms apie vidurinę reikšmę. **Apversti spalvas** apverčia bet kurį iš jų. Prieš taikant dialogas išvardija intervalus ir kiekviename – objektų skaičių.

## Dydis, užpildas ir legenda

- **Taško dydis pagal** skaitinį lauką daro kiekvieno taško kvadratą didesnį, kuo didesnė reikšmė, tarp dviejų jūsų nurodytų dydžių (pusė kraštinės, milimetrais popieriuje).
- **Poligonų vidaus atspalvis** užpildo kiekvieną poligoną jo klasės spalva (skylės lieka tuščios). Atspalvis rodomas ekrane; spausdinimai ir DXF/DWG rodo spalvotus kontūrus.
- **Rodyti legendą plane** nubraižo klases, jų objektų skaičių ir dydžių intervalą plano apatiniame kairiajame kampe. Legenda rodoma ekrane; ji nepatenka į spausdinimą.
- Norėdami ženklinti objektus lauku, naudokite **Ženklinti su** tame pačiame meniu.

Stilius išsaugomas projekto faile. Versija, kuri nežino apie stilius, atidaro failą su sluoksnio spalva. Spausdinimai, DXF ir DWG perduoda klases kaip atskirus sluoksnius, pavadintus pagal sluoksnį ir klasę, spalva parenkama artimiausia iš devynių pagrindinių CAD spalvų. Sluoksnis, turintis daugiau nei 200,000 objektų, piešiamas viena spalva.
