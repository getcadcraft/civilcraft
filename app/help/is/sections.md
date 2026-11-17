---
title: Sýnilínur og þversnið
summary: Skerðu þversnið hornrétt á veglínu, sjáðu landið, hönnunina og skurð og fyllingu við hverja stöð, og fáðu rúmmál með meðaltali endaflatarmála.
keywords: massaflutningur, massarit, jafnvægispunktur, rýrnun, þensla, flutningsfjarlægð, aðföng, losun, þversniðsblöð, þversnið, snið pdf, þversnið, sýnilínur, þversniðssýn, skurður, fylling, flatarmál, meðaltal endaflatarmála, rúmmál endaflatarmála, jarðvinna, stöð, frávik, csv
from: 5060173c
---

Þversnið sýnir veginn eins og hann verður byggður: þvert á veglínuna á einni stöð, núverandi land, hönnunina (ganginn eða undirstöðuna sem mótuð er inn) og skurðinn og fyllinguna þar á milli.

## Bæta við sýnilínum

1. Veldu veglínu. Í **Eiginleikum**, undir **Sýnilínur**, smelltu á {{ui:Bæta við sýnilínum}}.
2. Stilltu **Á** (bilið: 50 ft eða 20 m til að byrja með), **Breidd vinstri** og **Breidd hægri** (hversu langt hvert þversnið nær frá miðlínunni).
3. Til að skera þversnið á tiltekinni stöð skaltu skrifa hana í **Bæta við stöð** (til dæmis `2+35`) og ýta á {{key:Enter}}.

Þversnið eru skorin á sérhverjum heilum margfeldi bilsins, á báðum endum veglínunnar, í upphafi og enda hvers boga (PC og PT), og á þeim stöðvum sem þú bætir við. Sýnilínurnar birtast á grunnmyndinni sem grá línur þvert yfir veglínuna; þær fara líka út í DXF, DWG og PDF á laginu C-ROAD-SCTN. Sérhver breyting er eitt skref: {{key:Mod+Z}} afturkallar hana.

## Þversniðssýnin

Opnaðu hana með {{ui:Þversniðssýn}} í **Eiginleikum** veglínunnar, {{ui:Þversnið}} undir **Yfirborð** › {{ui:Meira}}, eða {{key:X}}. Hún kemur í stað langsniðssýnarinnar undir grunnmyndinni.

- Farðu í gegnum þversniðin með örvunum í stikunni hennar, stöðvalistanum, eða {{key:Left}} og {{key:Right}} þegar þversniðssýnin hefur fókus ({{key:Home}} og {{key:End}} fyrir það fyrsta og síðasta).
- Gráa línan er núverandi land, rauða línan hönnunin. Skurður er skyggður appelsínugulur, fylling græn. Punktar gangsins eru merktir: CL (miðlína), EOP (brún slitlags), SH (öxl) og DL (útlína).
- Hausinn gefur stöðina, skurð- og fyllingarflatarmál þessa þversniðs og lóðrétta ofhækkun. **Passa** fyllir spjaldið; veldu 1× til að sjá þversniðið í réttum mælikvarða.
- Þykka línan á grunnmyndinni sýnir hvaða þversnið er á skjánum.

## Þversniðablöð

{{ui:Snið á blöðum (PDF)}} undir **Sýnilínur** setur hvert þversnið á PDF-síður, í röðum frá vinstri til hægri og ofan frá niður eftir stöðvaröð. Veldu **Pappír**, **Mælikvarða grunnmyndar** (láréttan mælikvarða þversniðanna) og **Ofhækkun langsniðs** (1×, 2×, 5× eða 10×); glugginn segir hversu mörg þversnið komast á síðu og hversu margar síður það gerir.

Hvert þversnið sýnir rist með frávikum og hæðum, landið (strikað), hönnunina, skurð og fyllingu skyggð (appelsínugult og grænt), punkta gangsins og undir henni stöð þess og skurð- og fyllingarflatarmál. Hvert þversnið á blöðunum er teiknað jafnstórt, nógu hátt fyrir það stærsta; þegar það passar ekki á síðuna við ofhækkunina þína notar CivilCraft það stærsta sem passar og segir frá því. Titilræman nefnir veglínuna, stöðvarnar á þeirri síðu, mælikvarðana og „Blað 1 af 3“.

## Rúmmál með meðaltali endaflatarmála

Milli tveggja nálægra þversniða er rúmmálið meðaltal flatarmálanna tveggja sinnum fjarlægðin milli stöðvanna. Stikan sýnir samtölur fyrir veglínuna, og {{ui:CSV}} sækir flatarmál og rúmmál hvers þversniðs með hlaupandi samtölum (rúmyard fyrir fetaverkefni, rúmmetrar fyrir metraverkefni).

**Eiginleikar** sýna sömu samtölur við hliðina á rúmmálum úr ristaaðferðinni úr [Jarðvinnurúmmál](topic:volumes). Þetta eru ólíkar nálganir: þéttari þversnið færa þær nær hvor annarri, og á beinum vegi á sléttu landi eru þær þær sömu.

:::note
Skurður og fylling eru aðeins talin innan skyggðu svæðanna (útlínulína gangs eða undirstöðu), eins og ristaaðferðin gerir. Án gangs eða undirstöðu er hönnunin landið, svo þversnið sýnir enga skurði né fyllingu.
:::

## Massaflutningur

**Massaflutningur** undir **Sýnilínur** teiknar massaflutningsritið út frá sömu rúmmálum með endaflatarmáli: eftir stöðvunum, hlaupandi samtala skurðar mínus fyllingar.

- **Rýrnun (−) eða þensla (+) skurðarins** segir hvað rúmyard af skurði verður þegar hann er lagður sem fylling: −10 % (upphafsgildið, bráðabirgðagildi) þýðir að hann minnkar í 0,9; berg sem þenst út gæti verið +5 %. Notaðu tölu jarðtæknaskýrslu þinnar.
- Þar sem línan hækkar er vegurinn í skurði; þar sem hún lækkar, í fyllingu. Yfir núlli (skyggt appelsínugult) færist jarðvegur upp eftir stöð; undir núlli (grænt), niður eftir stöð.
- **Jafnvægispunktar** eru þar sem línan sker núll: á milli tveggja þeirra jafnast skurður og fylling. Taflan telur upp hvert jafnvægt bil, rúmmálið sem flutt er (hæsti eða lægsti punktur þess) og meðalflutningsfjarlægðina (skyggða flatarmálið deilt með því rúmmáli).
- Þar sem línan endar utan núlls er það sem eftir er **úrgangur** (fyrir ofan) eða **lán** (fyrir neðan). Á þeim síðasta kafla telst aðeins jarðvegurinn fyrir utan þá hæð sem hún endar á sem fluttur.

**CSV** vistar massaordinatuna við hvert þversnið, kaflana og stuðulinn.
