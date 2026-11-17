---
title: Einingar, stöðvar og talnasnið
summary: Fet- og metraverkefni, hvernig stöðvar, hallar, hliðarhallar, stefnur, flatarmál, rúmmál og lagnastærðir eru skrifaðar og slegnar inn, og hvað breyting á einingum gerir.
keywords: slá inn lengd, reikningur, reiknivél, summa, brot, fet og tommur, 4+7/16, einingar, fet, US survey feet, metrar, metrakerfi, enskt kerfi, stöðvasnið, stöðvasetning, halli, prósenta, hliðarhalli, h:v, stefna, rúmyardar, rúmmetrar, þvermál
from: 0b9b5b6b
---

## Einingar verkefnis

Verkefni er í **US feet** eða **metrum** (**Einingar** í vinstra spjaldinu). Sérhvert hnit, hæð, lengd og stöð í verkefninu er í þeirri einingu.

:::warning
Þegar **Einingum** er breytt breytast merkimiðar, stöðvasnið, sjálfgildi og hvernig skrár eru skrifaðar. Það breytir **engri** tölu. Svæði sem var mælt í fetum og skipt yfir í metra heldur sömu tölum, nú lesnum sem metrum. Stöðustikan segir: „Einingarnar eru nú metrar. Hnitin voru ekki umreiknuð.“ Stilltu einingarnar þannig að þær passi við gögnin þín áður en þú hannar.
:::

Þetta fer eftir einingunum:

| | US feet | Metrar |
|---|---|---|
| Stöðvasnið | `12+34.56` (100 ft stöðvar) | `1+234.567` (1000 m stöðvar) |
| Hæðarlínubil í boði | 0.25 til 20 ft | 0.1 til 10 m |
| Flatarmál | sq ft | sq m |
| Rúmmál | cu yd | cu m |
| Þvermál lagna og mannvirkja | tommur | millimetrar |
| Sjálfgefinn radíus beygju | 100 ft | 30 m |
| Stöðvamerki á teikningunni | á 50 ft fresti, merkimiðar á 100 ft fresti | á 20 m fresti, merkimiðar á 100 m fresti |
| Útprentunarkvarðar | 1" = 5' til 1" = 1000' | 1:50 til 1:10000 |
| Lengdareining í LandXML | USSurveyFoot | meter |

Nýtt verkefni byrjar í fetum, eða í metrum þegar lengdareiningin sem er merkt í {{ui:Stillingar}} › {{ui:Almennt}} › {{ui:Einingar}} er metrísk. Listinn **Einingar** sýnir einingarnar sem eru kveiktar þar, og alltaf eigin einingu verkefnisins. Ef flatarmáls- eða rúmmálseining er merkt þar (acres, hectares, acre-feet …), eru flatarmál og rúmmál skráð í henni í stað dálksins hér að ofan. Sjá [Einingar, slegin gildi og einingalistar](common:unit-lists).

Þegar þú opnar LandXML tekur verkefnið einingar skrárinnar. Skrá í alþjóðlegum fetum opnast sem fetaverkefni; tölurnar eru ekki breyttar.

## Slá inn lengdir og summur

Sérhver reitur sem tekur lengd eða hæð les meira en venjulega tölu: ýttu á {{key:Enter}} og reiturinn sýnir niðurstöðuna í einingum verkefnisins.

| Þú slærð inn | Í fetaverkefni | Í metraverkefni |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | sömu lengdir í metrum |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | í fetum | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, og hinar í US survey feet | sömu lengdir í metrum |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | summan, í fetum | summan, í metrum |

Sérhver lengdareining úr sameiginlegu einingatöflunni virkar, með nákvæmri stærð sinni: fet verkefnis eru US survey feet, þannig að `10 US ft` er 10 og `3 ch` (keðjan með alþjóðlegum fæti) er 197.9996. Notaðu `+ - * /` og sviga, og `abs`, `round`, `ceil` og `floor`. Bandstrik skrifað inn í lengd er hluti hennar (`24'-6"`, `6-1/2`); með bili umhverfis það dregur það frá (`24' - 6"` = 23.5 ft). Venjuleg tala margfaldar eða deilir lengd, og er lengd í einingum verkefnisins þegar hún er lögð við lengd. Ef CivilCraft getur ekki lesið það sem þú slóst inn er reiturinn merktur og stöðustikan segir hvar.

Stöðvar eru ekki summur: `10+00` í stöðvareit er stöð 10+00. Hallar í prósentum, punktanúmer og lýsingar eru lesin eins og þau eru.

## Stöðvar

Stöð er fjarlægð eftir veglínu, skrifuð með plúsmerki:

- Fet: hlutinn fyrir plúsinn er hundruð feta. `12+34.56` er 1,234.56 ft.
- Metrar: hlutinn fyrir plúsinn er þúsundir metra. `1+234.567` er 1,234.567 m.
- Neikvæðar stöðvar halda mínusmerkinu fyrir framan: `-0+50.00`.

Hvar sem þú slærð inn stöð (**Upphafsstöð**, **Stöð** PVI) geturðu slegið hana inn með plúsnum (`12+34.56`) eða sem venjulega tölu (`1234.56`). Bil eru hunsuð.

## Hallar og hlíðar

- **Hallar** (langsnið, lagnir, halli akreina og vegaxla) eru í prósentum: `+1.25%` hækkar upp eftir stöðvunum, `-0.50%` lækkar.
- **Hliðarhallar** (skurður og fylling flatar, skurður og fylling vegarbeltis) eru lárétt á móti lóðréttu: `3` þýðir 3 : 1, þrjár einingar lárétt fyrir eina upp eða niður.
- **K** fyrir lóðrétta beygju er lengd hennar deilt með breytingu hallans í prósentum.

## Stefnur og horn

Stefnur eru fjórðungsstefnur í gráðum, mínútum og sekúndum: `N 63°12'05" E`. Beygjuvik (Δ) nota sömu gráður, mínútur og sekúndur, með „vinstri“ eða „hægri“.

## Frávik

Frávik frá veglínu eru hornrétt fjarlægðir frá henni, merkt **L** (vinstri) eða **R** (hægri) horft upp eftir stöðvunum.

## Birting talna

- Hnit og hæðir sýna 2 aukastafi í spjöldum og stöðustikunni (3 fyrir valinn mælipunkt).
- Flatarmál og rúmmál eru hópuð eftir þúsundum: `128,250 sq ft`, `454.9 cu yd`.
- Hnit eru aldrei hópuð, svo hægt sé að afrita þau eins og þau eru.

## Hnit

CivilCraft vinnur á flötu plani: austur til hægri, norður upp. Hönnunarvinna fer alltaf fram í vörpuðum hnitum (ríkjavarpi, UTM eða staðbundnu neti). Þú getur sagt CivilCraft í hvaða hnitakerfi þau eru og hvort þau eru netshnit, landhnit eða staðbundin hnit; það sýnir þá breiddar- og lengdargráður og setur GIS-skrár og kortalög á sinn stað, en það breytir aldrei einingum eða færir hnitin þín af sjálfsdáðum. Sjá [Stilla hnitakerfi verkefnisins](topic:coordinate-systems) og [Landhnit og staðbundin hnit](topic:ground-and-local-coordinates). Stór gildi ríkjavarps (milljónir feta) eru í lagi; CivilCraft vinnur innra með sér miðað við svæðið til að halda nákvæmni.
