---
title: Velja, afrita og líma mælipunkta
summary: Veldu mælipunkta með smelli, Shift og reit eða alla í einu; afritaðu, klipptu, límdu, límdu á sama stað, tvöfaldaðu og eyddu þeim með nýjum punktanúmerum sem rekast aldrei á; límdu punktaraðir til og frá töflureikni.
keywords: afrita, líma, klippa, tvöfalda, eyða punktum, velja punkta, velja allt, reitval, gluggi, klippiborð, töflureikni, csv, endurnúmera, punktanúmer, líma á sama stað, klóna, stikun
from: 78a6aea7
---

Mælipunkta má afrita og líma innan verkefnis, á milli verkefna í tveimur vafraflipum og til og frá töflureikni. Sérhver breyting er eitt afturköllunarskref og yfirborðið byggist upp aftur úr nýju punktunum strax.

## Velja punkta

Með {{ui:Velja}} ({{key:V}}):

- **Smelltu** á punkt til að velja hann (og aðeins hann). Númer hans birtast undir **Eiginleikar**.
- {{key:Shift}} og **smelltu** bætir punkti við valið, eða tekur hann úr því.
- {{key:Shift}} og **dragðu** dregur reit: punktarnir inni í honum bætast við valið. Dragðu um punktana í staðinn og það verður lassó; sjá [Lassóval á mælipunktum](topic:lasso-selection). Drag án {{key:Shift}} hliðrar teikningunni, eins og venjulega.
- {{key:Mod+A}} (eða {{ui:Meira}} › {{ui:Velja alla punkta}}) velur alla punkta.
- {{key:Esc}} (eða {{ui:Meira}} › {{ui:Velja ekkert}}) hreinsar valið.

Valdir punktar eru með hring. Þegar fleiri en einn er valinn sýnir **Eiginleikar** hversu margir þeir eru, númer þeirra, hæðarsvið og hópa.

## Afrita, klippa og eyða

- {{ui:Afrita}} eða {{key:Mod+C}} afritar valda punkta. CivilCraft geymir afritið og setur það líka á kerfisklippiborðið sem punktaraðir, svo þú getir límt það beint í töflureikni eða textaskrá.
- {{ui:Meira}} › {{ui:Klippa}} eða {{key:Mod+X}} afritar þá og eyðir þeim í einu skrefi.
- {{ui:Meira}} › {{ui:Eyða}} eða {{key:Delete}} eyðir þeim. {{key:Mod+Z}} skilar þeim aftur.

Raðirnar eru punktur, norður, austur, hæð, lýsing (P,N,E,Z,D), aðskildar með kommum, með þremur aukastöfum. Til að fá austur á undan norðri stillirðu **Punktaraðir** í [Stillingum CivilCraft](topic:settings). Lýsing sem töflureiknir myndi lesa sem formúlu (byrjar á =, +, - eða @) fær apostrófu fyrir framan, svo hún verði áfram texti.

## Líma

1. Ýttu á {{key:Mod+V}} eða smelltu á {{ui:Líma}}. Punktarnir fylgja bendlinum sem litlir krossar, með punktalínu til baka þangað sem þeir komu frá.
2. Smelltu þar sem þeir eiga að fara. Miðja afrituðu punktanna lendir á smellinum.
3. Eða ýttu á {{key:Enter}} til að setja þá á eigin hnit, eða {{key:Esc}} til að hætta við.

{{ui:Meira}} › {{ui:Líma á sama stað}} eða {{key:Mod+Shift+V}} límir á eigin hnit strax. Límdu punktarnir eru valdir á eftir, svo þú getir afritað, fært eða eytt þeim aftur.

:::note
Að smella á {{ui:Líma}} á tækjastikunni les kerfisklippiborðið. Í fyrsta skiptið gæti vafrinn spurt hvort CivilCraft megi sjá klippiborðið. Ef þú neitar líma tækjastikuhnappurinn aðeins afrit CivilCraft sjálfs; {{key:Mod+V}} límir samt raðir úr töflureikni án þess að spyrja.
:::

## Punktanúmer rekast aldrei á

Tveir punktar deila aldrei númeri. Þegar þú límir:

- Límdur punktur heldur númeri sínu ef enginn punktur í verkefninu hefur það. Þannig að eftir **Klippa** límast punktarnir aftur með sínum eigin númerum, og punktar afritaðir úr öðru verkefni halda sínum þar sem þeir eru lausir.
- Límdur punktur sem númerið er tekið hjá fær nýja heila tölu: einni hærri en hæsta númer í notkun, talið upp.
- Stöðustikan segir hvað gerðist, til dæmis „1 hélt númeri sínu; 9 fengu ný númer: 10–18 urðu 277–285“.

Í [Stillingum CivilCraft](topic:settings) getur þú valið **Alltaf ný númer**, og númer sem nýju númerin byrja á, til dæmis 5000 fyrir hönnunarpunkta.

:::warning
Punktahópar sem byggja yfirborðið sem **brotlínu** tengja punkta sína í númeraröð. Límd afrit af brotlínupunktum (til dæmis FL-mælingar) fá ný, hærri númer og tengjast endanum á þeirri brotlínu, mögulega með löngu stökki. Athugaðu teikninguna eftir að þú límir slíka punkta, eða settu hópinn þeirra á {{ui:Punktar}}.
:::

## Tvöfalda

{{ui:Meira}} › {{ui:Tvöfalda}} eða {{key:Mod+D}} býr til afrit af völdum punktum sem fylgir bendlinum: smelltu þar sem það á að fara. Afritin fá alltaf ný númer, og klippiborð CivilCraft er skilið eftir eins og það var.

## Úr töflureikni eða textaskrá

Veldu raðir af punktum í töflureikni (punktur, norður, austur, hæð, lýsing) og afritaðu þær. Í CivilCraft ýtir þú á {{key:Mod+V}} og smellir þar sem þær eiga að fara, eða ýtir á {{key:Mod+Shift+V}} til að setja þær á eigin hnit, sem er venjulega það sem þú vilt fyrir raunveruleg mælingagögn.

Raðirnar eru lesnar nákvæmlega eins og [punktaskrá](topic:point-file-formats): kommur, tabbar eða bil, og hausröð ef hún er til staðar. Án hausraðar kemur dálkaröðin frá **Punktaraðir** í [Stillingum CivilCraft](topic:settings).

Þegar bæði eru til staðar ákveður CivilCraft eftir því hvort er nýrra: raðir á kerfisklippiborðinu sem eru ólíkar síðasta afriti CivilCraft voru afritaðar seinna, þannig að þær eru límdar. Texti sem hefur engar punkta er hunsaður og afrit CivilCraft sjálfs er límt í staðinn.

## Á milli verkefna og flipa

Afritið er geymt í þessum vafra, þannig að annar flipi CivilCraft getur límt það, jafnvel eftir að fyrsti flipinn lokast. Punktar afritaðir í metraverkefni og límdir í fetaverkefni halda númerunum sínum eins og þau eru: ekkert er umbreytt, og stöðustikan segir það.

## Hvað er ekki afritað

Aðeins mælipunktar eru afritaðir í bili. Veglínur, pallar, pípunet, brotlínur og mörk er ekki hægt að afrita eða líma ennþá. Límning getur ekki fært núverandi punkta: notaðu {{ui:Klippa}} og líma, eða færðu einn punkt í einu ([Breyta mælipunkti](topic:edit-points)).
