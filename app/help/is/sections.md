---
title: Sýnilínur og þversnið
summary: Taktu þversnið hornrétt á veglínu, sjáðu landið, hönnunina og skurð og fyllingu á hverri stöð, og fáðu rúmmál með meðaltali endaflatarma.
keywords: massaflutningur, massaskýringarmynd, jafnvægispunktur, rýrnun, þensla, flutningsfjarlægð, aðflutningur, úrgangur, þversniðsblöð, þversnið, snið í PDF, þversnið, sýnilínur, þversniðssýn, skurður, fylling, flatarmál, meðaltal endaflatarma, rúmmál endaflatarma, jarðvinna, stöð, útfærsla, CSV
from: 09639ce2
---

Þversnið sýnir veginn eins og hann verður byggður: þvert yfir veglínuna á einni stöð, núverandi land, hönnunina (gangurinn eða byggingarflötin mótuð inn) og skurðinn og fyllinguna þar á milli.

## Bæta við sýnilínum

1. Veldu veglínu. Í **Eiginleikum**, undir **Sýnilínur**, smelltu á {{ui:Bæta við sýnilínum}}.
2. Stilltu **Á hverju bili** (bilið: 50 ft eða 20 m til að byrja með), **Breidd vinstra megin** og **Breidd hægra megin** (hversu langt hvert þversnið nær frá miðlínunni).
3. Til að taka þversnið á ákveðinni stöð skaltu slá hana inn í **Bæta við stöð** (til dæmis `2+35`) og ýta á {{key:Enter}}.

Þversnið eru tekin á hverju heilu margfeldi bilsins, við báða enda veglínunnar, við upphaf og enda hverrar sveigju (PC og PT), og á þeim stöðvum sem þú bætir við. Sýnilínurnar birtast á grunnmyndinni sem gráar línur þvert yfir veglínuna; þær fara einnig út í DXF, DWG og PDF á laginu C-ROAD-SCTN. Hver breyting er eitt skref: {{key:Mod+Z}} afturkallar því.

## Þversniðssýnin

Opnaðu hana með {{ui:Þversniðssýn}} í **Eiginleikum** veglínunnar, {{ui:Þversnið}} undir **Yfirborð** › {{ui:Meira}}, eða með {{key:X}}. Hún tekur sæti langsniðssýnarinnar undir grunnmyndinni.

- Flettu milli þversniða með örvunum í stikunni sinni, stöðvalistanum, eða {{key:Left}} og {{key:Right}} þegar þversniðssýnin hefur fókus ({{key:Home}} og {{key:End}} fyrir fyrsta og síðasta).
- Gráa línan er núverandi land, rauða línan er hönnunin. Skurður er litaður appelsínugulur, fylling grænn. Gangpunktar eru merktir: CL (miðlína), EOP (brún yfirborðs), SH (öxl) og DL (dagsbirta).
- Hausinn gefur stöðina, skurð- og fyllingarflatarmál þessa þversniðs og ýkingu hæðar. **Passa** fyllir rúðuna; veldu 1× til að sjá þversniðið í réttum mælikvarða.
- Þykka línan á grunnmyndinni sýnir hvaða þversnið er á skjánum.
- **Aðdráttur og hliðrun:** músarhjólið zoomar að bendlinum, og dragðu til að færa sýnina. {{ui:Passa}} (eða {{key:F}}, eða tvísmellur) passar allt þversniðið aftur.

## Mæla í þversniði

1. Smelltu á {{ui:Mæla}} í þversniðsstikunni, eða ýttu á {{key:M}}. Vísbendingin segir „Smelltu á fyrsta punktinn, síðan þann annan.“
2. Smelltu á tvo punkta. Hvor smellur festist við enda línu eða gangpunkt (CL, EOP, SH, DL); haltu inni {{key:Alt}} fyrir frjálsan punkt.
3. Lestuglugginn gefur láréttu fjarlægðina (ΔH), lóðréttu fjarlægðina (ΔV), hallann í prósentum með hlutfalli sínu og beinu lengdina, í einingum verkefnisins.

Smelltu aftur til að byrja nýja mælingu. {{key:Esc}} hreinsar hana, og {{key:M}} slekkur á Mæla.

## Þversniðsblöð

{{ui:Snið á blöðum (PDF)}} undir **Sýnilínur** setur hvert þversnið á PDF-síður, í röðum frá vinstri til hægri og ofan frá og niður í stöðuröð. Veldu **Pappír**, **Mælikvarði grunnmyndar** (láréttur mælikvarði þversniðanna) og **Ýking langsniðs** (1×, 2×, 5× eða 10×); glugginn segir hversu mörg þversnið passa á síðu og hversu margar síður það gerir.

Hvert þversnið sýnir rist með útfærslum og hæðum, landið (strikað), hönnunina, skurð og fyllingu litaða (appelsínugult og grænt), gangpunktana, og undir henni stöð þess og skurð- og fyllingarflatarmál. Hvert þversnið á blöðunum er teiknað í sömu stærð, nógu hátt fyrir það stærsta; þegar það passar ekki á síðuna í þinni ýkingu notar CivilCraft það stærsta sem passar og segir frá því. Titilstrimillinn nefnir veglínuna, stöðvarnar á síðunni, mælikvarðana og „Blað 1 af 3“.

## Hvað skurður og fylling eru mæld að

Gangur getur haft lög undir yfirborðinu: yfirborðslög, íhluti sniðmáts, braut. Veldu **Rúmmál mælt að** í þversniðsstikunni til að ákveða hvað skurður og fylling ná að:

- **Neðra yfirborð** (upphafið): að neðri brún þessara íhluta, þannig að skurðurinn nær yfir dýpt yfirborðsuppbyggingarinnar.
- **Efra yfirborð**: aðeins að efri brún hönnunarinnar, eins og áður þegar íhlutir voru taldir með.

Flatarmálin í hausnum, rúmmálin hér að neðan, CSV-skráin og massaflutningurinn fylgja þessu vali, og það er vistað með verkefninu.

## Rúmmál með meðaltali endaflatarma

Á milli tveggja nágrannaþversniða er rúmmálið meðaltal flatarmála þeirra margfaldað með fjarlægðinni milli stöðvanna. Stikan sýnir samtölurnar fyrir veglínuna, og {{ui:CSV}} sækir flatarmál og rúmmál hvers þversniðs með keyrandi samtölum (rúmyardar fyrir verkefni í fetum, rúmmetrar fyrir metrísk verkefni).

**Eiginleikar** sýna sömu samtölur við hlið rúmmála í rist-aðferðinni úr [Jarðvinnurúmmál](topic:volumes). Þetta eru tvær mismunandi nálganir: þéttari þversnið færa þær nær hvor annarri, og á beinum vegi á sléttu landi eru þær eins.

:::note
Skurður og fylling eru aðeins taldir innan mótuðu svæðanna (dagsbirtulína gangs eða byggingarflatar), eins og ristaaðferðin gerir. Án gangs eða byggingarflatar er hönnunin landið, þannig að þversnið sýnir engan skurð eða fyllingu.
:::

## Massaflutningur

**Massaflutningur** undir **Sýnilínur** teiknar massaflutningsmyndina úr sömu endaflatarmálsrúmmálunum: eftir stöðvunum, keyrandi samtala skurðar að frádreginni fyllingu.

- **Rýrnun (−) eða þensla (+) skurðarins** segir hvað rúmmetri af skurði verður þegar hann er lagður sem fylling: −10 % (upphafsgildið, bráðabirgðagildi) þýðir að hann rýrnar í 0.9; berg sem þenst út gæti verið +5 %. Notaðu tölu úr jarðtækniskýrslunni þinni.
- Þar sem línan rís er vegurinn í skurði; þar sem hún fellur, í fyllingu. Yfir núlli (litað appelsínugult) færist jarðvegur upp eftir stöðvunum; undir núlli (grænt), niður eftir stöðvunum.
- **Jafnvægispunktar** eru þar sem línan sker núll: á milli tveggja þeirra jafnast skurður og fylling. Taflan listar hvern jafnaðan kafla, rúmmálið sem er fært (hæsti eða lægsti punktur hans) og meðalflutningsfjarlægðina (litaða flatarmálið deilt með því rúmmáli).
- Þar sem línan endar utan núlls er það sem eftir er **úrgangur** (fyrir ofan) eða **aðflutningur** (fyrir neðan). Á þeim síðasta kafla telst aðeins jarðvegur fyrir ofan þá hæð sem hún endar í sem færður.

**CSV** vistar massastærðina við hvert þversnið, kaflana og stuðulinn.
