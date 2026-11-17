---
title: Athuga mæliteikningu við innflutning
summary: Lesa hæðir sem eru skrifaðar sem texti eða í eigindum blokka sem mælipunkta, og athuga DWG eða DXF fyrir röngum einingum, engu hnitakerfi, fjarlægum upphafspunkti, flötum hæðarlínum, undarlegum hæðum og tvöföldum punktum áður en landið er byggt úr henni.
keywords: mæliathugun, innflutningsathugun, mælihæðir, textahæðir, hæðir sem texti, eigindi, einingar, hnitakerfi, fjarri upphafi, hæðarlínur á núlli, útlagar, tvöfaldir punktar, vandamál, landslagsarkitekt, mæliteikning
from: d46acd24
---

Mæliteikning getur litið rétt út og samt verið röng fyrir landið: einingar hennar gætu verið giskaðar, hæðarlínur hennar gætu legið flatar í hæð 0, eða hæðir hennar gætu verið skrifaðar sem texti sem er alls ekki rúmfræði. Kaflinn **Hæðir mælinga og athugun** í glugganum {{ui:Línur}} (sjá [Opna DWG eða DXF sem línur](topic:open-dwg-dxf)) les þessar hæðir og segir þér hvað virðist rangt áður en nokkuð er bætt við.

## Hæðir skrifaðar sem texti eða í eigindum

Margar mæliteikningar gefa hæðarpunkt sem lítinn texta við hlið krossar, eins og `104.37` eða `EL 104.37`, eða sem eigind punktblokkar. Þetta eru ekki línur, svo línulesarinn sleppir þeim. Kaflinn sýnir hversu margar hann fann og leyfir þér að taka þær sem **mælipunkta**:

1. Hakaðu við **Taka … hæðir sem mælipunkta**. Þær byrja óhakaðar, því ekki er hver tala á teikningu hæð.
2. Texti er lesinn þegar hann er hæð ein og sér: tala með aukastaf (`104.37`, `+104,37`, `-3.50`), eða tala á eftir `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` eða `LEVEL`, með valkvæðu `m`, `ft` eða `'` á eftir. Heil tala ein og sér (`12`) er lesin sem lóðar- eða blaðnúmer, ekki hæð; texti eins og `GATE 3` eða dagsetning er aldrei lesinn. Sniðskipanir í texta eru hunsaðar.
3. Fyrir eigindi blokka skaltu velja **Eigind blokkar sem geymir hæðina**. CivilCraft finnur merki sem heitir ELEV, Z, LEVEL, RL eða svipað af sjálfsdáðum; veldu annað af listanum ef teikningin notar sitt eigið. Valið er munað fyrir það skráarheiti á þessari tölvu, þannig að þegar hún er opnuð aftur byrjar hún á sama merki. Merki sem þú velur tekur líka heilar tölur sem hæðir.
4. Smelltu á {{ui:Bæta við}}. Punktarnir fá númer á eftir hæsta númeri í verkefninu, hver punktur er lýstur með lagi sínu (eða blokk), og hæðirnar eru umreiknaðar í einingar verkefnisins eins og restin af teikningunni. Allt er þetta eitt skref: {{key:Mod+Z}} tekur punktana burt.

Textinn er á sínum eigin innsetningarpunkti (eða jöfnunarpunkti hans ef hann hefur hann). Texti inni í blokkum er ekki lesinn og teikningin er aldrei breytt.

## Athugunin

Athugunin keyrir á því sem þú ert við það að flytja inn og skráir það sem hún finnur, eina línu fyrir hverja tegund vandamáls:

| Hún segir | Hvað það þýðir |
|---|---|
| **Einingar ekki tilgreindar** | Teikningin segir ekki hvaða einingar hún notar, svo tölur hennar eru lesnar sem einingar verkefnisins. Athugaðu eina fjarlægð sem þú þekkir. |
| **Einingar umreiknaðar** | Einingar teikningarinnar eru ólíkar einingum verkefnisins og eru skalaðar (athugasemd, ekki galli). |
| **Gögnin spanna … km** eða **… m** | Umfangið er meira en 200 km eða minna en hálfur metri, sem yfirleitt þýðir röng eining (millimetrar lesnir sem metrar, eða öfugt). |
| **Ekkert hnitakerfi** | Verkefnið hefur ekkert. Þetta er viðvörun þegar gögnin liggja langt frá núlli, eins og hnit í landsneti gera. Sjá [Hnitakerfi](topic:coordinate-systems). |
| **Fjarri upphafspunkti** | Gögnin liggja meira en 100 km frá núlli. Langt frá núlli missa 3D-sýnir og útflutningar nákvæmni og nötra. |
| **Hæðarlínulag … hefur enga hæð** | Lag sem heitir eins og hæðarlínur (TOPO, CONT, CNTR, CONTOUR) heldur línum í hæð 0, þannig að landið sem byggt er úr þeim yrði flatt. |
| **Hæðir nákvæmlega 0** | Sumar hæðir eru 0 meðan dæmigerð hæð er langt frá því: líklega vantar hæðir. |
| **Hæðir langt frá hinum** | Nokkrar hæðir liggja langt utan við hinar (fundið út frá miðju allra hæðanna, þannig að bratt svæði með breitt svið er ekki merkt), eða yfir 9.000 m eða undir -11.000 m. |
| **Punktar ofan á öðrum punkti** | Tveir punktar á sama stað með sömu hæð, eða með ólíkum hæðum. |

Eftir að þú smellir á {{ui:Bæta við}} fara sömu línur í **Vandamál**, ein fyrir hverja tegund, með skráarheitinu, svo þú getir snúið aftur til þeirra. Athugunin dæmir teikninguna; hún breytir engu í henni og hindrar þig ekki í að nota teikninguna.

:::tip
Þegar athugunin segir að hæðarlínur séu flatar í 0 og hæðir séu skrifaðar sem texti, taktu hæðirnar sem mælipunkta: þær bera oft raunverulegu hæðirnar sem hæðarlínurnar vantar.
:::

## Það sem er ekki athugað

Athugunin ber teikninguna ekki saman við aðra mælingu og getur ekki sagt hvaða hnitakerfi teikningin er í: hún segir þér aðeins að ekkert sé stillt.
