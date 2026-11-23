---
title: Hellulögn, veggir og þrep
summary: Hellulögn með halla að niðurfalli eða þverhalla, mynstur og uppbygging hennar; stígar sem fylgja landinu; stoð- og frístandandi veggir með þrepuðum undirstöðum; kantsteinar; rampar og þrep yfirfarin gegn sínum mörkum; IFC út.
keywords: harðyfirborð, hellulögn, hellur, verönd, pallur, halli, niðurfall, þverhalli, síldarbein, hlaupandi lögn, stígur, göngustígur, stoðveggur, garðveggur, undirstaða, veggtoppur, kantsteinn, kantur, kantlögn, rampur, aðgengi, þrep, stigi, stigahæðir, stigaspor, pallur
from: d34b4466
---

Harðyfirborð er reiknað aftur út frá landinu í hvert skipti, þannig að það fylgir landslaginu og endurreiknast þegar landið eða lína þess breytist. Dragðu horn þess á grunnmyndinni eins og hverja aðra línu. Opnaðu það úr {{ui:Harðyfirborð}} í hópnum Landslag.

## Hellulögn

Smelltu á hornin og ýttu á {{key:Enter}}. Í **Eiginleikum**:

- **Hæð**: tómt = meðalhæð landsins undir henni.
- **Halli**: flatt, **þverhalli** (% í tiltekna átt) eða **að niðurfalli**: CivilCraft biður þig um að smella þar sem niðurfallið á að vera, síðan hækkar hvert horn frá niðurfallinu um hallann. Örvar á grunnmynd sýna hallana.
- **Mynstur** (grind, hlaupandi lögn, síldarbein) með stærð einingar, samskeytum og horni; **Kantur** breidd. Á blaði eru samskeyti sem eru nær en einum millimetra ekki tekin með.
- Hellulögnin er hluti af breytta yfirborðinu. Lögin hennar (hellur, undirlag, grunnur) fara í IFC og í magntölurnar.

## Stígar

Smelltu meðfram stígnum og ýttu á {{key:Enter}}. Hann fylgir landinu, með **þverhalla** sínum til hægri hliðar. Stígur sem er brattari en **Steepest allowed** er merktur `!` á grunnmyndinni þar sem hann er, og Eiginleikar segja hversu bratt hann verður.

Þar sem stígur mætir vegi sem gangur byggir, stöðvast hann við ytri brún vegarins, í hæð gangstígsins eða axlarinnar þar, í breytta yfirborðinu og í þrívíddarsýninni. Stígur sem sker veg er mótaður og sýndur sem tvö stykki, og endi sem er teiknaður allt að tvöfaldri breidd stígsins stuttur frá veginum er framlengdur að brún hans. Grunnmyndin sýnir ennþá stíginn eins og þú teiknaðir hann, og lengd hans og flatarmál telja alla línuna. Sjá [Draga vegagang](topic:corridor).

## Veggir

Smelltu meðfram veggnum og ýttu á {{key:Enter}}. Veggur er **stoðveggur** eða **frístandandi**. Án **Efri brúnar** stendur hann **Hæð** sinni yfir landinu alla leiðina; sláðu inn efri brún til að halda honum láréttum. **Undirstaða** hans situr í fastri dýpt undir landinu og þrepast niður í heilum þrepum, þannig að hún er lárétt á milli þeirra. Eiginleikar gefa lengd hans, hæðir, flatarmál andlits og þrep undirstöðunnar; grunnmyndin merkir efri og neðri brún veggjar (TW / BW) við hvorn enda.

:::warning
Stoðveggur hærri en 1.2 m (4 ft) er merktur: verkfræðingur hannar hann.
:::

## Kantsteinar

Smelltu meðfram kantsteininum og ýttu á {{key:Enter}}; stilltu breidd hans og hæð upp úr yfirborðinu.

## Rampar

Smelltu frá botni að toppi og ýttu á {{key:Enter}}. Hæðirnar koma úr landinu við hvorn enda nema þú slærð þær inn. Rampinn fær pall á hverri hækkun upp á 750 mm (2.5 ft) og er borinn saman við **Steepest allowed** (1:12 til að byrja með) og lágmarksbreidd; Eiginleikar segja hversu löng hann þyrfti að vera.

## Þrep

Smelltu á framkant neðsta þreps, síðan þar sem þrepin ná efst, og ýttu á {{key:Enter}}. Fjöldi stigahæða kemur úr hæðinni og **Hæsta stigahæð**; stigasporið úr þægindareglunni 2R + G ≈ 630 mm, aldrei undir **Minnsta stigaspor**; pall á hverri **Hámark stigahæða í stiga**. Eiginleikar segja hvort þrepin passa milli punktanna tveggja eða hversu mikið lengri þau þurfa.

:::note
Mörk fyrir rampa og þrep eru merkt sjálfgefin gildi. Stilltu þau sem byggingarreglugerðin þín krefst.
:::

## Út úr CivilCraft

- Meira › {{ui:Flytja út landslags-IFC}}: hellulögn og stígar sem `IfcPavement`, veggir sem `IfcWall` (stoðveggir sem RETAININGWALL) með lögum sínum, kantsteinar sem `IfcKerb`, rampar sem `IfcRamp`, þrep sem `IfcStair` með stigahæðum sínum og stigaspori.
- Plöntuskráin: **Senda í TakeoffCraft** flytur hellulagnaflötin og rúmmál laga, flatarmál andlits veggja og lengdir þeirra, lengdir kanta og fjölda þrepa.
- Teikniblaðið sýnir þversnið hvers veggjar, uppbyggingu hverrar hellulagnar og hvern stiga. Sjá [Landslagsblöð](topic:landscape-sheets).
