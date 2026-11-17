---
title: Byggja og betrumbæta yfirborðið
summary: Hvernig CivilCraft þríhyrningar núverandi landið og hvernig þú mótar það með brotlínuhópum, teiknuðum brotlínum, ytri mörkum og lengstu ytri brún.
keywords: tin, yfirborð, þríhyrningun, brotlína, mörk, núverandi land, t.d., búa til yfirborð, delaunay, þríhyrningar, hámarksbrún, ytri mörk
from: b9eea3f3
---

CivilCraft hefur eitt núverandi landyfirborð fyrir hvert verkefni. Það er TIN (þríhyrnt óreglulegt net) byggt úr punktunum þínum, og það endurbyggist sjálfkrafa í hvert sinn sem inntak breytist. Engin „endurbyggja“-skipun er til og ekkert úrelt yfirborð.

## Hvað fer í yfirborðið

- Sérhvern punkt með hæð í hópi stilltum á {{ui:Punktar}}.
- Sérhvern hóp stilltan á {{ui:Brotalína}}, tengdan í punktanúmeraröð.
- Sérhverja brotlínu sem þú teiknar með tólinu {{ui:Brotalína}}.
- Ytri mörkin, ef þú teiknar þau.
- Stillinguna **Lengsta ytri brún**.

Þríhyrningar skerast aldrei yfir brotlínu: yfirborðið er þvingað til að fylgja henni, og síðan gert eins jafnt og hægt er í kringum hana (Delaunay alls staðar annars staðar).

## Gerðu kóðaðar línur að brotlínum

1. Í vinstra spjaldinu undir {{ui:Punktar}} finnurðu hópinn (til dæmis FL).
2. Stilltu **Yfirborð** valið á {{ui:Brotalína}}.
   Yfirborðið endurbyggist, línan er teiknuð í appelsínugulu (með {{ui:Brotlínur}} kveikt undir **Birting**), og **Brotlínur** í staðreyndum yfirborðsins hækkar um eina.
3. Athugaðu línuna á grunnmyndinni. Hún verður að liggja punkt við punkt í þeirri röð sem línan var mæld. Ef hún fer í sikksakk, þá heldur hópurinn fleiri en eina línu, eða punktarnir eru ekki númeraðir í röð: stilltu hópinn aftur á {{ui:Punktar}} og teiknaðu línurnar handvirkt (næsti kafli).

## Teiknaðu brotlínu gegnum punkta

1. Ýttu á {{key:B}}, eða smelltu á {{ui:Brotalína}} í hlutanum **Yfirborð**.
   Ábendingin segir „Brotalína: smelltu á mælipunkta í röð (hún tekur hæð þeirra). Enter lýkur.“
2. Færðu bendilinn nálægt punkti. Lítill appelsínugulur ferningur merkir punktinn sem hún tekur.
3. Smelltu á punkta línunnar hvern á eftir öðrum. Hver smellur nefnir punktinn og hæð hans í stöðustikunni.
4. Ýttu á {{key:Enter}} til að ljúka.
   Stöðustikan segir „Brotalína 1 bætt við; yfirborðið var endurbyggt.“

Smellir verða að lenda á mælipunkti sem hefur hæð; smellur annars staðar er hafnað með „Smelltu á mælipunkt með hæð: brotlína tekur hæð punktanna.“ {{key:Backspace}} fjarlægir síðasta punkt; {{key:Esc}} hættir við alla línuna.

:::warning
Ljúktu með {{key:Enter}}. Tvísmellur lýkur einnig, en í þessari útgáfu fjarlægir hann punktinn sem þú tvísmelltir á. Smelltu einu sinni á síðasta punktinn, og ýttu svo á {{key:Enter}}.
:::

Til að fjarlægja allar teiknaðar brotlínur í einu, smelltu á {{ui:Fjarlægja teiknaðar brotlínur}} í hlutanum **Yfirborð**. Til að fjarlægja aðeins þá síðustu, notaðu {{key:Mod+Z}}. Teiknaðar brotlínur er ekki enn hægt að velja eða breyta hverja fyrir sig.

## Teiknaðu ytri mörkin

Mörk klippa yfirborðið að svæðinu sem þú treystir, til dæmis mörkum mælingarinnar, svo að löng þríhyrningar yfir ómæld horn hverfi.

1. Ýttu á {{key:O}}, eða smelltu á {{ui:Mörk}}.
2. Smelltu á hornin í röð í kringum svæðið. Brotin lína sýnir formið.
3. Ýttu á {{key:Enter}}.
   Stöðustikan segir „Mörk sett; þríhyrningar utan þeirra eru horfnir.“ **Mörk** í staðreyndum yfirborðsins segir „Já“ og fjölda horna.

Atriði sem þarf að vita:

- Það er ein mörk. Ef þú teiknar aðra kemur hún í staðinn. {{ui:Fjarlægja afmörkunina}} tekur hana burt.
- Mörk geta aðeins klippt burt: mörk sem nær út fyrir punktana er klippt til baka að útlínum þeirra, með athugasemdinni „Mörkin ná út fyrir punktana; þau voru klippt til baka að útlínum þeirra.“
- Hornin fá hæðir sínar af yfirborðinu, svo jaðarinn fylgir landinu nákvæmlega.
- Faldar (innri) mörk eru ekki í boði enn.

## Klipptu löng ytri þríhyrninga

Án marka fyllir yfirborðið alla útlínu punktanna, þar með talin löng þunn þríhyrninga yfir íhvolfar brúnir.

1. Í **Yfirborð** skrifaðu lengd í **Lengsta ytri brún** og ýttu á {{key:Enter}}. Byrjaðu með um tvöföldu til þreföldu venjulegu bili milli mælinga.
2. Ytri þríhyrningar sem hafa ytri brún lengri en það eru fjarlægðir, og unnið er inn á við þar til hver ytri brún er nógu stutt. Brotlína er aldrei afhýdd.
3. Skrifaðu 0 til að halda öllum þríhyrningum aftur.

## Lestu skýrslu yfirborðsins

Undir staðreyndum yfirborðsins sýnir reitur hvað smiðurinn gerði. Með gulleitri stiku vinstra megin er hann upplýsingar; með rauðri stiku geymir hann villu og þá er ekkert yfirborð.

| Skilaboð | Merking |
|---|---|
| „3 punktar voru á sama stað og annar og tengdust honum.“ | Punktar nær en 0.0001 í grunnmynd urðu að einum hornpunkti (sá fyrsti var geymdur). |
| „2 staðir hafa tvær mismunandi hæðir …“ | Punktar hver ofan á öðrum, eða brotlínur sem skerast, eru ósammála um hæð. Hæð brotlínunnar vinnur, síðan sú fyrsta. |
| „1 bútur af brotlínu náðist ekki inn í yfirborðið.“ | Mjög stuttur eða næstum skarandi brotlínubútur passaði ekki; athugaðu þann stað. |
| „Yfirborð þarf að minnsta kosti þrjá punkta með hæðum.“ | Of fáir punktar: athugaðu röð dálkanna og hópana. |
| „Punktarnir liggja allir á einni línu: engir þríhyrningar.“ | Punktarnir hafa enga breidd, til dæmis ein mælilína. |
| „Mörkin skarast ekki við punktana.“ | Mörkin eru annars staðar, oft vegna ruglings á einingum eða hnitum. |
| „Engir þríhyrningar eru eftir innan markanna.“ | Mörkin eru of lítil eða á röngum stað. |

## Yfirborð lesið úr LandXML

Þegar þú opnar LandXML er fyrsta TIN-yfirborðið þess notað eins og það er: fyrirsögnin **Yfirborð** segir „Yfirborð (úr LandXML)“ og **Lengsta ytri brún** er grá. Meðan það yfirborð er í notkun breyta brotlínuhópar, teiknaðar brotlínur og ný mörk því ekki. Til að byggja yfirborðið úr punktum skráarinnar, smelltu á {{ui:Byggja yfirborðið upp aftur úr punktunum}}. {{key:Mod+Z}} skilar LandXML-yfirborðinu aftur.

## Tengt

- [Lestu hæðarlínur, hæðir og halla](topic:contours).
- [Flytja inn mælipunkta](topic:import-points).
