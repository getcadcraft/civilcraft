---
title: Hellulögn, veggir og þrep
summary: Hellulögn með halla að niðurfalli eða þverhalla, mynstur og lagskipting hennar; stígar sem fylgja landinu; stoðveggir og veggir sem standa einir með þrepuðum undirstöðum; kantsteinar; rampar og þrep yfirfarin með tilliti til marka þeirra; IFC út.
keywords: harðyfirborð, hellulögn, hellur, verönd, pallur, halli, niðurfall, þverhalli, síldarbein, hlaupandi, stígur, göngustígur, stoðveggur, garðveggur, undirstaða, þekja, kantsteinn, kantur, kantlína, rampa, aðgengi, þrep, stigi, upphækkanir, trappaflötur, lending
from: 51475877
---

Harðyfirborð er reiknað aftur út frá landinu í hvert skipti, þannig að það fylgir landslaginu og endurnýjast þegar landið eða lína þess hreyfist. Dragðu hornin á teikningunni eins og hvaða línu sem er. Opnaðu það frá {{ui:Harðyfirborð}} í hópnum Landslag.

## Hellulögn

Smelltu á hornin og ýttu á {{key:Enter}}. Í Eiginleikum:

- **Kóti**: autt = meðalland undir henni.
- **Halli**: flatt, **þverhalli** (% í átt) eða **að niðurfalli**: CivilCraft biður þig að smella þar sem niðurfallið á að vera, og síðan rís hvert horn frá niðurfallinu með hallanum. Örvar á teikningunni sýna hallann.
- **Mynstur** (reiti, hlaupandi, síldarbein) með einingastærð, fúgu og horni; **Kantlína** breidd. Á blaði eru fúgur styttri en einn millimetri sleppt.
- Hellulögnin er hluti af fyrirhuguðu yfirborði. Lög hennar (hellur, undirlag, burðarlag) fara í IFC og magntölurnar.

## Stígar

Smelltu meðfram stígnum og ýttu á {{key:Enter}}. Hann fylgir landinu, með **þverhalla** sínum til hægri handar. Stígur brattari en **Brattasti leyfði** er merktur `!` á teikningunni þar sem hann er, og Eiginleikar segja hversu bratt hann verður.

## Veggir

Smelltu meðfram veggnum og ýttu á {{key:Enter}}. Veggur er **stoðveggur** eða **sjálfstæður**. Án **Efri brúnar** stendur hann í **Hæð** sinni yfir landinu allan tímann; skrifaðu inn efri brún til að halda honum láréttum. **Undirstaða** hans situr í ákveðinni dýpt undir landinu og þrepast niður í heilum þrepum, þannig að hún helst lárétt á milli þeirra. Eiginleikar gefa lengd hans, hæðir, flatarmál framhliðar og þrep undirstöðunnar; teikningin merkir efri og neðri brún veggjar (TW / BW) við hvorn enda.

:::warning
Stoðveggur hærri en 1.2 m (4 ft) er merktur: verkfræðingur hannar hann.
:::

## Kantsteinar

Smelltu meðfram kantsteininum og ýttu á {{key:Enter}}; stilltu breidd hans og hæð yfir yfirborðinu.

## Rampar

Smelltu frá neðri enda upp á efri enda og ýttu á {{key:Enter}}. Kótarnir koma úr landinu við hvorn enda nema þú skrifir þá inn. Rampi fær lendingu á hverjum 750 mm (2.5 ft) hækkun og er yfirfarinn með tilliti til **Brattasti leyfði** (1:12 í upphafi) og lágmarksbreiddar; Eiginleikar segja hversu löng hann þyrfti að vera.

## Þrep

Smelltu á framkant neðsta þreps, síðan þar sem þrepin ná efst, og ýttu á {{key:Enter}}. Fjöldi upphækkana kemur úr hæðinni og **Hæsta upphækkun**; gangdýptin úr þægindareglunni 2R + G ≈ 630 mm, aldrei minni en **Minnsta gangdýpt**; lending á hverjum **Mest upphækkanir í hverjum stiga**. Eiginleikar segja hvort þau passa milli punktanna tveggja eða hversu miklu lengri þau þurfa.

:::note
Mörkin fyrir rampa og þrep eru merkt sem sjálfgefin gildi. Stilltu þau sem byggingarreglugerðin þín krefst.
:::

## Út úr CivilCraft

- Meira: {{ui:Flytja út landslags-IFC}}: hellulögn og stígar sem `IfcPavement`, veggir sem `IfcWall` (stoðveggir sem RETAININGWALL) með lögum sínum, kantsteinar sem `IfcKerb`, rampar sem `IfcRamp`, þrep sem `IfcStair` með upphækkunum og trappaflötum.
- **Senda í TakeoffCraft** á gróðurlistanum ber með sér flatarmál hellulagnar og rúmmál laga, flatarmál framhliða og lengdir veggja, kantsteinslengdir og fjölda þrepa.
- Smáatriðablaðið teiknar þversnið hvers veggjar, lagskiptingu hverrar hellulagnar og hvern stiga. Sjá [Landslagsblöð](topic:landscape-sheets).
