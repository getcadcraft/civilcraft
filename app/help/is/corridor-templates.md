---
title: Sniðmát gangs og landsniðmát
summary: Búðu til lítil, endurnýtanleg sniðmát (kantstein og rennustein, gangstétt, vegg, skurð), byggðu gang úr þeim eftir stöð með vinstri og hægri hlið aðskildum, skiptu veglínu í nokkra ganga og lagðu efni yfir land.
keywords: sniðmát, sniðmátasafn, sniðmátagerð, dæmigert þversnið, samsetning, undirsamsetning, hlutir, punktakóðar, endaskilyrði, jaðar, skurður, stoðveggur, kantsteinn, rennusteinn, gangstétt, svæði, stöðubil, nokkrir gangar, vinstri og hægri, landsniðmát, gróðurmold, slitlag, burðarlag, yfirlagning, efni, magn
from: ce70e58b
---

**Sniðmát** er lítið þversnið sem þú teiknar einu sinni og endurnýtir: punktar með frávikum, hallum og punktakóðum, og hlutar með efnum. Gang má byggja úr sniðmátum eftir stöð, þar sem hvor hlið hefur sín slitlagssniðmát og sitt eigið endaskilyrði, og sömu sniðmát má leggja yfir landlíkan.

:::warning
Dæmasniðmátin eru staðgenglar til að byrja með. Tölur þeirra eru ekki teknar úr neinum staðli eða stofnun. Verkfræðingur verður að yfirfara sérhvert sniðmát og sérhvert gildi sem þú gefur því áður en það er notað í hönnun.
:::

## Opna sniðmátin

Opnaðu {{ui:Yfirborð}} › {{ui:Meira}} › {{ui:Sniðmát gangs…}} (eða skrifaðu {{cmd:TEMPLATES}}). Glugginn hefur þrjá lista:

- **Í þessu verkefni**: sniðmátin sem gangar og landsniðmát verkefnisins nota. Þau eru vistuð í verkefnisskránni.
- **Safnið mitt**: sniðmát geymd í þessum vafra og boðin í sérhverju verkefni. Notaðu {{ui:Vista í Safnið mitt}} á verkefnissniðmát til að geyma það.
- **Dæmi**: tvær akreinar með lögum, kantsteinn og rennusteinn, gangstétt, jaðar, skurður, stoðveggur, gróðurmold undir landinu og slitlag á landinu. Hvert þeirra er merkt „Til yfirferðar hjá verkfræðingi“.

{{ui:Nota í þessu verkefni}} afritar sniðmát úr safni eða dæmum inn í verkefnið. {{ui:Flytja út sniðmát þessa verkefnis}} vistar þau sem `.cctemplates.json`-skrá, og {{ui:Flytja inn skrá}} les eina þeirra inn í verkefnið og Safnið mitt. Notaðu skrána til að deila sniðmátum eða færa þau yfir á aðra tölvu.

## Gerðu sniðmát

{{ui:Nýtt sniðmát}} (eða {{ui:Breyta}} á verkefnissniðmáti) opnar ritil sniðmátsins. Teiknaðu hægri hliðina, út frá 0,0-punkti sniðmátsins; vinstri hliðin notar sama sniðmát út til vinstri.

1. Gefðu því heiti og gerð: **Slitlag** (næsta sniðmát tengist við endann), **Endaskilyrði** (það mætir landinu) eða **Landsniðmát**.
2. Bættu við **gildum**: nefndum tölum eins og breidd `w` eða halla `s`. Talnareitur hvar sem er í sniðmátinu tekur tölu eða heiti gildis; `-t` er gildið `t` gert neikvætt. Gangur getur gefið hverri notkun sniðmátsins sín eigin gildi, þannig að eitt kantsteinssniðmát þjónar öllum kantshæðum.
3. Bættu við **punktum** í röð. Hver er staðsettur út frá fyrri punkti (eða 0,0-punktinum) eftir skorðu sinni:

| Skorða | Staðsetur punktinn |
|---|---|
| Frávik í halla | Frávik út á við og halli (hækkun á móti lárétri lengd; −0.02 fellur um 2%) |
| Frávik og hækkun | Frávik og hækkun |
| Beint upp eða niður | Aðeins hækkun |
| Hliðarhalli að landinu | Út frá punkti hans að landinu, við skurðhlutfallið þar sem landið er ofan og fyllingarhlutfallið þar sem það er neðan |
| Að landinu | Frávik, síðan beint upp eða niður að landinu |
| Stoðveggur | Veggur af þeirri þykkt sem þú gefur: í skurði mætir efri brún hans landinu við vegbrúnina, í fyllingu liggur vegurinn yfir honum og ytri hlið hans fellur að landinu |

   Hakaðu við **Efst** fyrir punktana sem fullgert yfirborð fer í gegnum. Síðasti efsti punkturinn er þar sem næsta sniðmát á þeirri hlið byrjar. **Mark** gerir ganginum kleift að færa punktinn: frávik hans eða hæð kemur af línu.
4. Bættu við **hlutum**: lokuðum formum í gegnum punktakóða (`0` er 0,0-punkturinn), hvert með heiti, efni og gerð. Flatarmál þeirra gefur rúmmálin.

Sniðmátið fylgir hverri breytingu í réttum mælikvarða, og listinn undir því segir hvað sé rangt (punktur sem mætir landinu áður en endinn kemur, gildi sem sniðmátið hefur ekki, hlutur án flatarmáls). {{ui:Bæta við þetta verkefni}} eða {{ui:Vista}} geymir það, sem eitt afturköllunarskref.

## Byggja gang úr sniðmátum

Veldu veglínu með gangi og kveiktu á {{ui:Byggja úr sniðmátum eftir stöð}} í eiginleikum hennar. Gangurinn byrjar með tveggja akreina og jaðardæmunum á báðum hliðum.

- **Svæði.** Hvert svæði byrjar á stöð og nær að næsta svæði. {{ui:Bæta við svæði}} bætir einu við; breyttu upphafsstöðinni í reitnum þess.
- **Vinstri og hægri aðskilin.** Hver hlið hvers svæðis hefur sinn eigin lista yfir **Slitlag**, frá miðlínu út á við, og sitt eigið **Endaskilyrði**: jaðar, skurð, vegg eða hvaða sniðmát sem er sem mætir landinu. Án endaskilyrðis endar hliðin á jaðri við skurðhalla og fyllingarhalla gangsins. {{ui:Afrita frá vinstri til hægri}} afritar hlið.
- **Gildi og mörk.** Undir hverju sniðmáti á hlið er reitur fyrir hvert gildi (tómt = gildi sniðmátsins sjálfs) og, fyrir punkt sem tekur mark, eiginlínuna eða miðlínu annars gangs sem færir hann.
- **Frá og Til** takmarka ganginn við hluta veglínunnar.

Þversnið, planlínur fyrir hvern punktakóða, tillöguyfirborðið, stikun og jarðvinna fylgja á eftir. Eiginleikar sýna rúmmál hvers hlutar eftir hlið og svæði (meðaltal endasvæða eftir miðlínu). Halli í beygjum og kantmörk gangsins eru ekki notuð meðan gangurinn er byggður úr sniðmátum.

## Nokkrir gangar á einni veglínu

Undir **Gangar á þessari veglínu** bætir {{ui:Bæta við gangi}} við gangi á restina af veglínunni: fyrsti gangurinn fær lokastöð á miðjunni (eða heldur sinni eigin), og nýi gangurinn byrjar þar með síðasta svæði sniðmáta fyrsta gangsins. Hver gangur hefur eigið heiti, stöðubil, sniðmát og jarðvinnu. Slökktu á einum með gátreitnum {{ui:Kveikt}}. Þar sem tvö bil skarast, mótar síðari gangurinn yfir þann fyrri.

## Landsniðmát

Landsniðmát leggur lög sniðmáts yfir land frá 0,0-punkti sínum: lag undir 0,0-punktinum fer niður í jarðveginn (gróðurmold sem á að fjarlægja), lag ofan við hann liggur á landinu (burðarlag og slitlag á bílastæði). Breidd og halla skiptir engu máli, aðeins dýpt hvers hlutar ofan eða neðan við 0,0-punktinn.

Opnaðu {{ui:Yfirborð}} › {{ui:Meira}} › {{ui:Landsniðmát…}} (eða skrifaðu {{cmd:TERRAINTEMPLATES}}); blokkin er líka í eiginleikum verkefnisins. {{ui:Bæta við landsniðmáti}} bætir einu við með gróðurmoldardæminu. Fyrir hvert þeirra velur þú:

- **sniðmátið** (gildi þess má breyta fyrir þetta eitt),
- **landið**: núverandi land eða tillögu yfirborðið,
- **formið** sem klippir það: allt landið, lóð, pall eða lokaða eiginlínu. Nokkur landsniðmát geta notað mismunandi form á sama landi.

Hvert lag sýnir þykkt sína, flatarmál í grunnmynd og rúmmál. Rúmmál er flatarmál í grunnmynd sinnum þykktin, þykktin mæld beint niður; flatarmálið er mælt á reit, og flatarmál eftir hallanum (sveigt) er gefið líka. Formin eru teiknuð á teikninguna á laginu C-TOPO-TMPL. Landsniðmát breyta ekki tillöguyfirborðinu.

## Efni og magn

Blokkin Jarðvinna verkefnisins sýnir **Efni úr sniðmátum**: sérhvern hluta gangs og sérhvert lag landsniðmáts með rúmmáli sínu. {{ui:Senda í TakeoffCraft}} skrifar þau í magnskrána eftir skurð og fyllingu, eitt atriði í hvert, í rúmjördum (cu yd) í fetaverkefnum eða í rúmmetrum.

## Skrár

Sniðmát, svæði, aukagangar og landsniðmát eru vistuð í verkefnisskránni. Verkefni sem notar ekkert af þessu er vistað alveg eins og áður, og eldri útgáfur CivilCraft opna verkefni sem nota þau (þær hunsa sniðmátin og byggja samsetningu gangsins sjálfa).
