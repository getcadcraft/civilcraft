---
title: Eiginlínur
summary: Teiknaðu þrívíddarlínur sem þú mótar hornpunkt fyrir hornpunkt, búðu til þrepaðar útfærslur þeirra og notaðu þær sem brotalínur landsins eða sem hallandi flatir í hönnuninni.
keywords: bogi, feril, radíus, 3D-bogi, skrúfulína, bogadur kantsteinn, hallayfirlag, kótayfirlag, hallaörvar, eiginlína, halli, halli, kóti, þrepuð útfærsla, útfærsla, brotalína, kantsteinn, skurður, vegöxl, hallandi flötur, dagsbirta, landmótun, 3D-fjöllína
from: d55b25fb
---

Eiginlína er lína með kóta á hverjum hornpunkti: kantsteinn, rennslislína skurðar, efri brún vegöxlar, jaðar hallandi flatar. Þú setur kóta hennar með tölu eða halla, afritar hana til hliðar með þrepi upp eða niður, og velur hvað yfirborðin gera við hana.

## Teikna eina

1. Veldu **Yfirborð** › {{ui:Meira}} › {{ui:Eiginlína}}, eða ýttu á {{key:L}}.
2. Smelltu á hornpunkta hennar á grunnmyndinni. Smellur á mælipunkt tekur stað punktsins og kóta hans; annars staðar fær hornpunkturinn kóta fyrirliggjandi lands á þeim stað.
3. Ýttu á {{key:Enter}} til að ljúka opinni línu, eða smelltu aftur á fyrsta hornpunktinn til að loka henni.

Nýja línan er valin og byrjar sem brotalína fyrirliggjandi lands, liggjandi á landinu.

## Bogar

Hluti getur verið bogi á grunnmynd sem endar í mismunandi kótum: kantsteinsbeygja, bogadur skurður, rampa sem beygir. Halli hans er jafn eftir boganum og lengd hans er mæld eftir ferlinum.

- **Meðan teiknað er:** ýttu á {{key:C}} (á snertiskjá, {{ui:Bogi}} á stikunni yfir grunnmyndinni) til að kveikja á bogum. Eftir hornpunkt smellirðu á punkt á ferlinum, og síðan þar sem boginn endar. Ýttu aftur á {{key:C}} fyrir beina hluta. {{key:Backspace}} fellir fyrst punktinn á ferlinum niður.
- **Eftir á:** í **Eiginleikum** skrifarðu radíus og í reitinn **Bogi** hjá hornpunktinum hvernig hann beygir, til dæmis `50 L` eða `50 R` (til vinstri eða hægri þegar þú gengur eftir línunni), og ýtir á {{key:Enter}}. Tæmdu reitinn til að gera hlutann beinan aftur. Radíus minni en helmingur hlutans er hafnað.

Valda línan sýnir radíus hvers boga við hliðina á halla hans. **Lengd** er eftir bogunum á grunnmynd; **3D-lengd** telur líka hækkun og lækkun með. Þrepaðar útfærslur halda boganum: bogi á ytri hlið beygju stækkar, bogi á innri hlið minnkar, og útfærsla sem fer yfir miðju bogans er hafnað.

Yfirborðin, þrívíddarsýnin, DXF og DWG taka hvern boga sem stutta beina búta sem haldast innan 0.01 frá ferlinum. LandXML geymir þá sem boga (sjá **Bogar í öðrum skrám** hér að neðan).

## Stilla kóta og halla

**Eiginleikar** sýnir hornpunktana með fjarlægð þeirra eftir línunni, **Kóta** þeirra og **Halli að næsta** (í prósentum). Skrifaðu annað hvort og ýttu á {{key:Enter}}:

- Kóti færir aðeins þann hornpunkt.
- Halli stillir kótann á fjarenda hlutans; hornpunktarnir á eftir haldast þar sem þeir eru, þannig að halli næsta hluta breytist.

Einnig í **Eiginleikum**:

| Aðgerð | Hvað hún gerir |
|---|---|
| **Hækka eða lækka allt um** | Bætir hæðinni sem þú skrifar við alla hornpunkta. |
| {{ui:Kótar úr landinu}} | Setur alla hornpunkta aftur á fyrirliggjandi land (hornpunktar utan yfirborðsins halda sínum kóta og eru taldir upp). |
| {{ui:Einn halli, frá fyrsta til síðasta}} | Heldur fyrsta og síðasta kóta og setur hornpunktana þar á milli á einn jafnan halla. |

Valda línan sýnir kóta sína við hornpunktana og halla sína eftir hlutunum á grunnmyndinni. Dragðu hornpunkt með {{ui:Velja}} til að færa hann; kóti hans helst.

## Þrepaðar útfærslur

Undir **Þrepuð útfærsla** skrifarðu **Fjarlægð** (jákvæð til hægri við stefnu línunnar, neikvæð til vinstri), síðan hæð (upp eða niður um) eða halla í prósentum, og smellir á {{ui:Búa til útfærslulínuna}}. Afritið er ný eiginlína: til dæmis bakhlið kantsteins 0.5 ft til hliðar og 0.5 ft hærri, eða jaðar skurðar 6 ft út við 2 %. Fjarlægð sem myndi bretta afritið yfir sjálft sig í þéttri beygju er hafnað.

## Hallar og kótar á skjánum

Ýttu á {{key:E}}, eða hakaðu við **Hallar og kótar á eiginlínum** undir Birting, til að sjá halla hverrar eiginlínu eftir hverjum hluta (með lítilli ör sem bendir niður brekkuna) og kóta hennar við hornpunktana. Þetta birtist aðeins á skjánum: ekkert er bætt við teikninguna, og PDF, DXF og DWG haldast óbreytt. Stuttir hlutar og þéttir hornpunktar eru ómerktir þar til þú þysjar inn. Valda línan sýnir alltaf sína eigin halla og kóta.

## Í langsniðssýninni

Eiginlína sem sker veglínu birtist í langsniðssýn þeirrar veglínu, með heiti sínu og kóta á skurðpunktinum; línur sem liggja við hlið hennar er líka hægt að sýna. Sjá [Hanna lóðrétt langsnið](topic:profile).

## Hvað yfirborðin gera við hana

Veldu **Notkun**:

| Notkun | Hvað gerist |
|---|---|
| Brotalína fyrirliggjandi lands | Fyrirliggjandi land liggur í gegnum línuna í sínum kótum, eins og teiknuð brotalína. |
| Mótað inn í hönnunina | **Lokuð** lína verður hallandi flötur: tillögu-yfirborðið innan hennar er mótað að jaðrinum. Kveiktu á **Dagsbirta niður í land** til að keyra skurð- og fyllingarhallar (lárétt á móti 1 lóðrétt) frá jaðrinum niður í landið, eins og flötur gerir; hver halli byrjar í kóta jaðarsins þar. |
| Aðeins teiknuð | Hún helst á grunnmyndinni og fer út í DXF, DWG og PDF (lag C-GRAD-FEAT, 3D-fjöllínur), en yfirborðin hunsa hana. |

Rúmmál, snið og þrívíddarsýnin taka með eiginlínur sem eru mótaðar inn í hönnunina, eins og flatir. Hver breyting er eitt skref: {{key:Mod+Z}} afturkallar hana.

## Deila línum með teyminu

Í teikningu sem er opnuð úr skýjaskrám þínum í CadCraft Studio, í teymisáætlun, hefur **Eiginleikar** verkefnisins (án þess að nokkuð sé valið) hlutann **Teymi** með {{ui:Línur teymisins…}}: línurnar sem teymið þitt hefur deilt, hver með sinni útgáfu, án þess að velja eiginlínu fyrst. Veldu línu til að deila henni, senda nýja útgáfu, sækja útgáfu teymisins eða hætta að deila. Utan þessarar stillingar segir hlutinn hvað hann þarfnast.

## Bogar í öðrum skrám

| Skrá | Hvað gerist við eiginlínu með bogum |
|---|---|
| CivilCraft-verkefni | Varðveitt nákvæmlega. |
| LandXML | Skrifuð sem grunnmyndareiginleiki með línum og bogum og kótum þeirra, og lesin aftur með bogum sínum. Eiginlína úr öðru forriti kemur inn sem **Aðeins teiknuð**: veldu **Notkun** hennar til að setja hana í yfirborð. |
| DWG og DXF | 3D-fjöllína getur ekki geymt boga, þannig að línan er skrifuð sem stuttir bútar innan 0.01 frá hverjum boga. CivilCraft skráir líka í teikninguna hvaða bútar voru bogar: þegar þú opnar teikninguna sem línuverk, skilar {{ui:Eiginlínur}} línunum aftur sem eiginlínum með bogum sínum. Önnur forrit sjá venjulega 3D-fjöllínu. |
