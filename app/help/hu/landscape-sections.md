---
title: Tájépítészeti metszetek és a közzétételi készlet
summary: Metszetvonalak, amelyek a meglévő és a tervezett terepet, az alapozásos falakat, a burkolatok és az ültetett területek rétegrendjét, a lépcsőket és a kifejlett méretű növényeket metszik, a saját lapjaikon; egy közzétételi készlet lapjegyzékkel, laponként egy PDF-fel és laponként egy DWG-vel.
keywords: metszet, keresztmetszet, homlokzat, metszetjel, metszetvonal, közzététel, lapkészlet, lapjegyzék, rajzjegyzék, PDF-készlet, laponként DWG
from: 7271ac50
---

{{ui:Szintek}} › {{ui:Metszetvonal}}: Adja meg a kezdő- és a végpontot. A metszetek neve A, B, C… (a nevüket a **Tulajdonságok** alatt lehet átnevezni). A metszet a vonala mentén megrajzolja:

- a meglévő terepet (szaggatott vonallal) és a tervezett terepet;
- a falakat az alapozásukkal, ahol a vonal metszi őket;
- a burkolatok és a sétányok rétegrendjét, valamint az ültetett területek takarását (mulcs) és termőföldjét (levágás után), a kész felület alá lógva;
- a lépcsőket szelvényben;
- a vonal megadott távolságán belül lévő növényeket, kifejlett méretükben, körvonalként.

A **Tulajdonságok** állítja be ezt a távolságot és a függőleges eltúlzást. A lapok párbeszédpanelen a **Metszetek** gomb külön lapokra teszi őket, lapon legfeljebb négy, mindegyik egy szabványos, beleférő léptékben.

## A közzétételi készlet

{{ui:Közzétételi készlet (.zip)}} a lapok párbeszédpanelen egyetlen .zip fájlt készít:

- egy PDF-et, amely a **lapjegyzékkel** nyílik, utána minden tájépítészeti lap következik, L-1, L-2… számozással (ültetés, tereprendezés, öntözés, részletek, metszetek, munkalapok);
- laponként egy DWG-t az alaprajzi lapokhoz, a lap rétegeivel (az `L-*` nevek megmaradnak), és egy DWG-t minden metszetrajzhoz.

Minden metszetvonal az alaprajzon megmondja, melyik lapon van (`A / L-5`). A számot minden alkalommal a készletből számítjuk ki, így a metszetek hozzáadása, törlése vagy átnevezése újraszámozza őket.
