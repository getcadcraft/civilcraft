---
title: Landlíkan úr hæðarlínum
summary: Búðu til yfirborð landsins úr hæðarkorti: veldu línulögin, segðu hvaðan hæð hverrar línu kemur, athugaðu skurðpunkta og tvítekningar og byggðu. Hæðarlínur verða brotalínur, með flötum þríhyrningum á hryggjum og dölum lagfærðum. Kort sem er rakið eftir mynd eða PDF má skala og staðsetja með tveimur þekktum punktum.
keywords: hæðarlínur, landlíkan úr hæðarlínum, yfirborð úr hæðarlínum, hæðarkort, mælikort, án hnita, brotalínur, flatir þríhyrningar, hryggur, dalur, tindur, skerandi hæðarlínur, tvítekningar hæðarlína, hæðarbil, skala kort, tveir punktar, staðsetja kort, DXF, DWG, shapefile
from: e6161653
---

Mælingamaður sendir stundum hæðarkort: línur með hæðum, en engir punktar. CivilCraft byggir núverandi landið úr þeim línum.

## Flytja hæðarlínurnar inn

Opnaðu kortið sem línur: DXF- eða DWG-teikningu, shapefile eða GeoJSON (**GIS** › {{ui:Flytja inn}}, eða dragðu skrána á grunnmynd). Línurnar koma inn sem **kortalög**. Undir **Yfirborð** › {{ui:Meira}}, veldu {{ui:Landlíkan úr hæðarlínum}}.

## Segðu hvaðan hver hæð kemur

Hakaðu við lögin sem halda hæðarlínum, og veldu **Hæð frá**:

- {{ui:Eigin hæðum línanna}}: lína sem hornpunktar hennar hafa allir sömu hæð (3D-fjöllína, eða fjöllína með hæð). Lína í 0 er grunnmyndarlína og hefur enga hæð.
- **Talnareitur** lagsins (til dæmis ELEV), ef kortið fylgdi slíkum.
- {{ui:Upphafi og bili, í þeirri röð sem línurnar eru skráðar}}: fyrir línur án nokkurrar hæðar. Fyrsta skráða línan fær **hæð fyrstu línu**, sú næsta hana að viðbættu **hæðarbili**, og svo framvegis. Skráðu línurnar frá þeirri lægstu upp (eða raðaðu þeim upp á nýtt í laginu).

## Athuga, síðan byggja

{{ui:Athuga}} skráir það sem er rangt, með orðum, áður en nokkuð breytist:

- lína með **enga hæð** eða færri en tvo punkta;
- **tvítekin** lína (sama lögun tvisvar, jafnvel teiknuð í öfuga átt);
- tvær línur sem **skerast**, í ólíkri hæð eða sömu hæð (lína sem sker sjálfa sig líka), ásamt staðnum;
- hæð sem er **ekki á bilinu** (innsláttarvilla eins og 105.5 á korti með 1 m bili).

Hakaðu við {{ui:Sleppa línum sem skerast við aðra}} til að sleppa línunni sem sker flestar hinar (síðan þeirri næstu, þar til engin sker): villulína sem sker hverja hæðarlínu er sú sem fer, ekki hæðarlínurnar. **Einfalda línur innan** grisjar hornpunkta sem eru nær beinni keyrslu en þeirri fjarlægð nemur.

{{ui:Byggja landið}} bætir línunum við núverandi landið sem brotalínum (ein afturköllun), þannig að yfirborðið fer nákvæmlega í gegnum hverja hæðarlínu. Með {{ui:Laga flata þríhyrninga á hryggjum, dölum og tindum}} hakað við og gefið upp hæðarbil bætir CivilCraft einnig punkti inn í hvern flatan þríhyrning (þríhyrning þar sem öll hornin liggja á einni hæðarlínu) í þeirri hæð sem hallinn við hliðina heldur áfram í, og aldrei meira en hálfu hæðarbili frá hæðarlínunni. Án þess verða hryggjatoppar, dalbotnar og tindar að flötum plötum. Á prófunarhæð minnkaði skekkjan miðað við hið rétta yfirborð um fjórðung; á hrygg um 40 %.

## Kort án hnita

Fyrir hæðarkort sem er rakið eftir mynd eða PDF, opnaðu **Skala og staðsetja lögin eftir tveimur þekktum punktum**. Gefðu upp tvo punkta á kortinu og hvar þeir eru í raun; lögin sem valin eru eru sköluð, snúin og færð til að passa (ein afturköllun; hæðum er ekki breytt). Sömu tveir punktar gefa mælikvarðann (sem sýndur er í skilaboðunum) og snúninginn.

Yfirborðið er jafngott og kortið: milli tveggja hæðarlína er það slétt plan, þannig að raunverulegt land þar á milli er ekki þekkt. Athugaðu niðurstöðuna við punkthæðir áður en þú treystir á hana.
