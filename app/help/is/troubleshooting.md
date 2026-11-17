---
title: Úrræðaleit
summary: Einkenni, orsakir og lausnir á vandamálum sem notendur lenda í í CivilCraft, með nákvæmum skilaboðum sem forritið sýnir.
keywords: vandamál, villur, virkar ekki, lagfæra, hjálp, skilaboð, úrræðaleit, hafnað, vantar, rangt, víxlað, hæðarlínur vantar
from: a9f7dedc
---

Skilaboð birtast í stöðustikunni neðst hægra megin, í reitum í vinstra og hægra spjaldinu og í gluggunum. Þau eru tilvitnuð hér eins og forritið sýnir þau.

## Opna skrár

**„Þessi skrá er yfir 200 MB; CivilCraft opnar ekki svo stórar skrár enn sem komið er.“**
Skiptu punktaskránni, eða grisjaðu gögnin áður en þú opnar hana.

**„Ekki tókst að opna site.json: Þetta er ekki CivilCraft-verkefnaskrá.“**
Skráin endar á `.json` eða byrjar á `{`, en er ekki CivilCraft-verkefni. Punktaskrár mega ekki byrja á `{`.

**„Ekki tókst að opna … Þessi verkefnaskrá er úr nýrri CivilCraft (útgáfu 2).“**
Verkefnið var vistað í nýrri útgáfu. Opnaðu það þar, eða fluttu út LandXML úr því.

**„Ekki tókst að opna … Þetta er XML en ekki LandXML (rótarelement þess er <…>).“**
Skráin er önnur gerð af XML. Fluttu út LandXML úr hinu forritinu.

**„… hefur enga punkta, TIN-yfirborð eða stefnulínur sem CivilCraft getur lesið.“**
Allt í skránni er eitthvað sem CivilCraft sleppir (til dæmis aðeins grindaryfirborð, eða aðeins spíralstefnulínur). Restin af skilaboðunum segir hvað var þar. Sjá [LandXML: hvað er lesið og skrifað](topic:landxml-reference).

**„Sýnishornið var ekki hlaðið: …“**
{{ui:Opna sýnishornið}} les skrá af CadCraft-vefsíðunni. Án tengingar virkar það aðeins ef CivilCraft var vistað til notkunar án nettengingar (hnappurinn í forritastikunni sýnir {{ui:Tilbúið án nettengingar}}). Farðu á netið, smelltu á {{ui:Vista til notkunar án nettengingar}}, og þá virkar það án nettengingar héðan í frá. Sjá [Án nettengingar](common:offline).

**{{ui:Vista til notkunar án nettengingar}} sýnir {{ui:Ekki tókst að vista}}.**
Sumar skrár sóttust ekki. Athugaðu tenginguna og smelltu aftur á hnappinn.

**{{ui:Vista til notkunar án nettengingar}} sýnir {{ui:Notkun án nettengingar er ekki í boði}}.**
Þessi vafragluggi getur ekki geymt afrit án nettengingar, líklega vegna þess að hann er einkagluggi eða tölvan er stýrð. Opnaðu CivilCraft í venjulegum glugga.

**Án nettengingar opnast forritið alls ekki.**
Það var ekki vistað til notkunar án nettengingar í þessum vafra, eða vafrinn eyddi gögnum síðunnar (Safari gerir það fyrir síður sem ekki hafa verið heimsóttar í nokkrar vikur). Farðu á netið, opnaðu CivilCraft og smelltu á {{ui:Vista til notkunar án nettengingar}}.

**Afritið án nettengingar er eldri útgáfa.**
Smelltu á {{ui:Tilbúið án nettengingar}}, og síðan á {{ui:Vista aftur (sækja nýjustu útgáfu)}} þegar þú ert tengdur.

**Skrá er grá í opnunarglugganum.**
Glugginn sýnir aðeins punktaskrár, LandXML og verkefnaskrár eftir endingum. Dragðu skrána inn á teikninguna í staðinn, eða endurnefndu hana í `.txt`.

## Flytja inn punkta

**„Engir punktar gátu verið lesnir úr þessari skrá.“**
Veldu dálkaröðina í **Dálkar** handvirkt. Ef ekkert virkar skaltu opna skrána í textaritli og athuga að hún sé einn punktur á línu með tölum í.

**Landið lítur út fyrir að vera speglað, snúið eða teygt í línu.**
Norður- og austurhnit hafa víxlast. Yfirlitið sagði „áætlað út frá fjölda dálka“. Veldu PENZD í stað PNEZD (eða öfugt) í **Dálkar**, eða fluttu inn aftur.

**Punktar langt frá hinum, og teikningin zoomaðist út í punkt.**
Lína hefur innsláttarvillu í hnitum, eða skráin blandar saman hnitakerfum. Finndu punktinn (smelltu á hann til að sjá númer hans) og lagaðu skrána.

**Línur skráðar undir „Ekki lesnar línur“.**
Sjá töfluna í [Flytja inn mælipunkta](topic:import-points#rows-that-are-not-read).

**Gömlu punktarnir mínir eru horfnir.**
Innflutningur á punktaskrá kemur í stað allra punkta og hreinsar afturköllun. Opnaðu vistaða verkefnið til að fá þá aftur.

## Yfirborðið

**„Yfirborð: Ekki byggt“ með rauðum reit.**
Reiturinn segir hvers vegna: „Yfirborð þarf að minnsta kosti þrjá punkta með hæðum.“, „Punktarnir liggja allir á einni línu: engir þríhyrningar.“, „Engir punktar með hæðum.“, „Jaðarinn skarast ekki við punktana.“ eða „Engir þríhyrningar eru eftir innan jaðarsins.“ Athugaðu dálkaröðina, punktahópana (eru þeir {{ui:Sleppt}}?) og jaðarinn.

**Hæðarlínur skera þvert yfir skurð eða hrygg.**
Sú lína er ekki brotalína. Settu hópinn hennar á {{ui:Brotalína}}, eða teiknaðu hana með verkfærinu {{ui:Brotalína}}. Sjá [Byggja og fínstilla yfirborðið](topic:build-surface).

**Brotalínuhópur teiknar sikksakk.**
Hópurinn inniheldur fleiri en eina línu, eða punktar hans eru ekki númeraðir eftir línunni. Settu hópinn aftur á {{ui:Punktar}} og teiknaðu hverja línu með verkfærinu {{ui:Brotalína}}.

**Löng, mjó þríhyrningar meðfram ytri jaðri.**
Teiknaðu jaðar ({{key:O}}) eða stilltu **Lengsta ytri jaðar**.

**Engar hæðarlínur, þótt yfirborðið sé byggt.**
Annaðhvort er {{ui:Hæðarlínur}} slökkt undir **Birting**, eða bilið er svo lítið að hæðarlínurnar yrðu fleiri en 2.000. Veldu stærra bil.

**Brotalínur eða jaðar breyta engu.**
Yfirborðið kom úr LandXML („Yfirborð (úr LandXML)“). Það er notað eins og það er. Smelltu á {{ui:Byggja yfirborðið upp aftur úr punktunum}} til að byggja úr punktunum í staðinn.

**„Það er ekkert yfirborð ennþá: opnaðu fyrst mælipunkta.“**
Brotalína, jaðar og flötur þurfa núverandi landyfirborð. Fluttu inn punkta fyrst.

**„Smelltu á mælipunkt með hæð: brotalína tekur hæðir punktanna.“**
Verkfærið {{ui:Brotalína}} velur aðeins mælipunkta. Aðdráttu inn og smelltu á punkt (appelsínugur reitur sýnir þann sem verður tekinn).

## Teikning

**Síðasti punkturinn minn hvarf þegar ég tvísmellti til að ljúka.**
Í þessari útgáfu lýkur tvísmellur veglínu, fleti, brotalínu eða jaðri en sleppir punktinum sem þú tvísmelltir á. Smelltu einu sinni á síðasta punktinn og ýttu á {{key:Enter}}. Notaðu {{key:Mod+Z}} ef það gerðist þegar, og teiknaðu síðan aftur.

**Ég get ekki lokið teikningu á spjaldtölvu.**
Lokun krefst {{key:Enter}}; það er enginn hnappur á skjánum ennþá. Tengdu lyklaborð. Sjá [Mús, snertiborð og snerting](topic:keyboard#mouse-trackpad-and-touch).

**Dráttur til að setja punkt hliðrar teikningunni í staðinn.**
Dráttur yfir nokkra pixla hliðrar teikningunni í öllum verkfærum. Smelltu án þess að hreyfa.

**„Veglína þarf að minnsta kosti tvo punkta.“ / „Flötur þarf að minnsta kosti þrjú horn.“ / „Lagnaleið þarf að minnsta kosti tvö mannvirki.“**
Þú ýttir á {{key:Enter}} of snemma. Teikningin er felld niður; byrjaðu aftur.

**Takkar eins og A eða G gera ekkert.**
Textareitur eða listi í spjaldi hefur enn fókus, þannig að stafirnir fara þangað. Smelltu einu sinni á teikninguna og ýttu síðan á takkann. Á Mac er eyðingartakkinn Backspace fyrir vafrann: notaðu Fn og delete til að eyða völdu.

## Veglínur og langsnið

**„Beygjurnar við PI 2 og PI 3 skarast: … Notaðu minni radíusa.“**
Tvær beygjur þurfa meiri jaðarlínu en er á milli PI-anna. Lækkaðu annan eða báða radíusa í PI-töflunni, eða færðu PI-in lengra í sundur.

**„PI 3 beygir beint til baka; það getur ekki tekið beygju.“**
Veglínan snýr við á sjálfri sér við þann PI. Færðu eða fjarlægðu PI-ið.

**„Þessi veglína hefur ekkert land undir sér til að byrja á.“**
Veglínan er utan yfirborðsins. Færðu hana á yfirborðið, eða bættu við PVI-um með því að smella með {{ui:Bæta við PVI}} virkt.

**„Lóðrétta beygjan við PVI 3 (L = …) byrjar áður en beygjan eða PVI-ið á undan henni endar.“ / „… nær yfir næsta PVI.“**
Styttu lengd beygjunnar eða færðu PVI-in í sundur.

**„Það er nú þegar PVI við …“**
Það er PVI á þeirri stöð. Smelltu annars staðar, eða dragðu núverandi PVI.

**Langsniðssýnin er tóm: „Teiknaðu veglínu til að sjá langsnið hennar.“**
Það er engin veglína, eða valda veglínan hefur villur.

## Vegarbelti og fletir

**„Vegarbeltið þarf hönnunarlangsnið án villna.“**
Byrjaðu hönnunarlangsnið ({{ui:Byrja á landinu}}) og lagaðu allar skaranir beygna.

**„… hliðarhallar fara út af yfirborðinu áður en þeir mæta landinu.“ / „… hallalínur fara út af yfirborðinu áður en þær mæta því …“**
Mótunin nær jaðri yfirborðsins áður en hún mætir landinu. Færðu hönnunina inn frá jaðrinum, eða færðu hana nær landinu. Nýr flötur sem er teiknaður að hluta utan yfirborðsins getur byrjað í hæð 0: sláðu inn raunverulega hæð.

**„Dagsljóslínur vegarbeltisins skerast …“ / „Dagsljóslínan sker sig sjálfa …“**
Hlíðar frá mismunandi hliðum rekast hver á aðra: þröngar beygjur, mjóir fletir, djúpir skurðir eða háar fyllingar. Notaðu stærri radíus, mjórra þversnið, breiðari flöt eða brattari hlíðar.

**„Engin rúmmál enn: flötur þarf að mótast án vandamála.“**
Lagaðu vandamálin sem eru talin upp í rauða reitnum fyrir ofan.

**{{ui:Tillaga (mótuð)}} er grár.**
Enginn flötur eða vegarbelti er mótað ennþá.

## Lagnir

**„P2 hefur engar botnhæðir ennþá.“**
Smelltu á {{ui:Setja botnkóta hennar eftir reglunum}} eða sláðu inn botnhæðirnar.

**„P1: ekkert land við S1 til að byrja á.“**
Mannvirkið ofan straums er utan yfirborðsins og hefur enga brún. Sláðu inn brún fyrir það.

**Hver lögn er merkt eftir að ég færði mannvirki.**
Að færa mannvirki breytir ekki botnhæðum. Smelltu á {{ui:Setja alla botnkóta eftir reglunum}}.

Öll skilaboð lagnanets eru útskýrð í [Skipuleggja þyngdarlagnanet](topic:pipe-network#read-and-fix-problems).

## Vistun og útflutningur

**„Ekkert til að flytja út ennþá.“ / „Ekkert til að prenta ennþá.“**
Verkefnið er tómt. Fluttu inn punkta fyrst.

**Ég finn ekki vistuðu skrána.**
Hún er í niðurhölum vafrans (venjulega möppunni Niðurhal). Sjá [Skrár sem þú getur opnað, vistað og flutt út](topic:files#where-the-files-go).

**PDF-kvarðinn er rangur á pappír.**
Prentaðu í 100% eða raunstærð, ekki „passa á síðu“.

**Spurningarmerki í PDF-texta.**
Nöfn eða lýsingar nota stafi utan vestur-evrópska stafasettsins. Stöðuskilaboðin telja þá. Endurnefndu með einföldum stöfum.

**Teikningin er klippt af við jaðrana.**
Kvarðinn er of stór fyrir blaðið. Veldu kvarðann merktan „(fits)“, stærra blað, eða {{ui:Það sem er á skjánum}}.

**{{key:Mod+P}} opnaði prentglugga vafrans.**
Síðan hafði ekki fókus. Lokaðu glugganum, smelltu á teikninguna og ýttu aftur á {{key:Mod+P}}, eða smelltu á {{ui:PDF}}.

## Forritið sjálft

**Skjárinn er auður eða verkstikan gerir ekkert.**
Notaðu nýja útgáfu af Chrome, Edge, Firefox eða Safari, og endurhlaðaðu. Sjá [Vafrar](common:browsers).

**Forritið er hægt með stóra punktaskrá.**
Slökktu á {{ui:Þríhyrningar}}, {{ui:Merkingar punkta}} og {{ui:Hæðarbil}}, og notaðu stærra hæðarlínubil. Mjög stór yfirborð taka stund að byggjast upp aftur eftir hverja breytingu.

**Vafrinn spyr „Yfirgefa síðu?“**
Verkefnið hefur óvistaðar breytingar. Vertu áfram, vistaðu með {{key:Mod+S}}, og farðu síðan.
