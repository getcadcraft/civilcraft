---
title: Dhulka khadadka konturka laga sameeyo
summary: Samee dusha dhulka khariidad konturo ah: dooro layer-yada khadadka, sheeg meesha heerka khad kasta ka yimaado, hubi isgoysyada iyo isku-midka, kadibna dhis. Khadadka konturka waxay noqdaan breaklines, saddexagalada siman ee buuraha, dooxooyinka iyo qoorta ayaa la saxaa. Khariidad laga soo rogay sawir ama PDF waa la cabbiri karaa oo la meeleyn karaa laba nuqood oo la yaqaan.
keywords: konturada, khadadka konturka, dhulka laga sameeyo konturada, dusha laga sameeyo konturada, khariidadda topograafiga, khariidadda sahanka, aan koorsiyo lahayn, breaklines, saddexagalada siman, buur, dooxo, qoorta, isgoysyada konturada, konturada isku mid, fogaanta konturka, cabbirka khariidadda, laba nuqood, meel-geynta khariidadda, DXF, DWG, shapefile
from: e6161653
---

Sahamiyaha mararka qaarkood wuxuu soo diraa khariidad konturo: khadad leh heerar, laakiin aan barro lahayn. CivilCraft wuxuu dhulka jira ka dhisaa khadadkaas.

## Konturada soo geli

Fur khariidadda sida linework: sawir DXF ama DWG, shapefile ama GeoJSON (**GIS** › {{ui:Import}}, ama dhig faylka qorshaha dushiisa). Khadadka waxay u yimaadaan sida **layer-yada khariidadda**. Hoosta **Dusha** › {{ui:More}}, dooro {{ui:Terrain from contours}}.

## Sheeg meesha heerka khad kasta ka yimaado

Calaamadi layer-yada ku jira konturada, kadibna dooro **Heerka ka yimaada**:

- {{ui:The lines' own elevations}}: khad kasta oo dhammaan barradiisu leeyihiin heer isku mid ah (3D polyline, ama polyline leh heer). Khad heerkiisu yahay 0 waa khad qorshe ah oo aan heer lahayn.
- **Goob tiro** oo layer-ka ah (tusaale ELEV), haddii khariiddu lagu soo diray mid ka mid ah.
- {{ui:A start and an interval, in the order the lines are listed}}: khadadka aan heer lahayn. Khadka ugu horreeya ee liiska ku jira wuxuu helaa **Heerka khadka koowaad**, khadka xiga wuxuu helaa heerkaas oo lagu daray **Fogaanta konturka**, iwm. Liiska khadadka ka bilow kan ugu hooseeya ee kor u kaca (ama dib u habee layer-ka).

## Hubi, kadibna dhis

{{ui:Check}} wuxuu liistaa waxa khaldan, qoraal ahaan, ka hor intaan wax la beddelin:

- khad aan lahayn **heer** ama ka yar laba barood;
- khad **isku mid ah** (isla qaabka laba jeer, xitaa haddii si ka soo rogan loo sawiray);
- laba khad oo **isgoysa**, heerar kala duwan ama isku mid ah (khad isgoysa naftiisa sidoo kale), iyo meesha lagu sheegay;
- heer **aan ku jirin fogaanta** (qaladka qorista sida 105.5 khariidad 1 m ah).

Calaamadi {{ui:Leave out lines that cross another}} si aad u tirtirto khadka isgoysa inta badan (kadibna kan xiga, ilaa aan wax isgoyn). Khad sharaf-darro ah oo jari kara konturada oo dhan ayaa baabi'ayaa, ma aha konturada. **Simplify lines within** wuxuu yareeyaa barrooyinka u dhow khad toosan oo masaafadaas la siiyey.

{{ui:Build the ground}} wuxuu khadadka ku daraa dhulka jira breaklines ahaan (hal tallaabo oo ka noqosho), sidaas darteed dusha wuxuu marayaa konturo kasta si sax ah. Marka {{ui:Fix flat triangles on ridges, valleys and hilltops}} la calaamadiyo, la-na siiyo fogaanta, CivilCraft wuxuu sidoo kale ku daraa barro saddexagal siman kasta gudihiisa (saddexagal kaas oo geeskiisa oo dhan ku jira hal kontur) heerka ay wadada ku xigta sii socoto, markasta oo ka badnaan karin badh fogaan ah konturka. Haddii kale, buuraha dusheeda, dooxooyinka hoose iyo qoorta waxay u muuqdaan sida saxan siman. Buul tijaabo ah, khaladka ka soo horjeeda dusha run ahaaneed wuxuu hoos u dhacay rubuc; buuraha dheer, 40%.

## Khariidad aan koorsiyo lahayn

Khariidad konturo oo laga rogay sawir ama PDF, fur **Cabbir oo meel u geli layer-yada laba nuqood oo la yaqaan**. Bixi laba nuqood khariidadda, iyo meesha ay dhab ahaan ku yaalaan; layer-yada la calaamadiyey waa la cabbiraa, la wareejiyaa, lagana dhaqaajiyaa si ay u habboonaadaan (hal tallaabo oo ka noqosho; heerarka lama beddelo). Laba nuqoodkaas isla markaana cabbirka (fariinta ku jirta) iyo jeexjeexa (rotation) ayaa siiya.

Dusha waxay ahaan kartaa sida khariiddu tahay wanaagsan: between two contours waa diyaarad, sidaas darteed dhulka dhabta ah ee u dhexeeya lama yaqaan. Natiijada ku hubi barrooyinka sare ka hor intaadan isku hallayn.
