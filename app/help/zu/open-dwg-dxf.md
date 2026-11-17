---
title: Vula i-DWG noma i-DXF njengemigqa
summary: Vula imigqa yomdwebo esicwini, ingqimba ngayinye, usebenzise izigaba zobuningi, imigqa yesici enamagophe nemiphetho evaliwe yomphezulu, bese uguqula amabhulokhi wamaphoyinti ube amaphoyinti okuhlola.
keywords: ukuhlola, amazinga emibhalo, dwg, dxf, cad, umdwebo, imigqa, izigaba zobuningi, imigqa yokuphula, umngcele, polyline, 3d polyline, izingqimba, imephu yesisekelo, topo, umdwebo wokuhlola, amabhulokhi, izinkomba zamabhulokhi, amaphoyinti okuhlola kumabhulokhi, izici, amabhulokhi wamaphoyinti, indawo yokufaka
from: da0f4c58
---

Ukuhlolwa komhlaba kuvame ukufika njengomdwebo: izigaba zobuningi njengama-polyline ngokuphakama kwazo, imigqa yokuphula njengama-3D polyline, nomngcele wesayithi njenge-polyline evaliwe. I-CivilCraft ivula **model space** yomdwebo njengezingqimba epulanini, futhi ingaguqula lezo migqa ibe ngqo ibe umphezulu.

## Vula umdwebo

1. Chofoza {{ui:Imigqa}} eqenjini le-**Umphezulu** (noma {{ui:Vula}}, noma wehlise ifayela epulanini) bese ukhetha ifayela le-`.dwg` noma le-`.dxf`. Umdwebo ufundwa kulo kompyuta; akulayishwa lutho. I-DWG kusukela ngo-2000 kuya ku-2018 ne-ASCII DXF iyafundwa.
2. Ingxoxo ye-**Imigqa** ihlu izingqimba zomdwebo ezinemigqa, izimo ezivaliwe noma amaphoyinti, nokuthi zinezinga lokuphakama (**elevations**) na. Izingqimba ezivaliwe kumdwebo ziqala zingakhethiwe. Umbhalo, ama-hatch, izilinganiso nezinye izinto ezingezona imigqa ziyabalwa futhi ziyashiywa (ingxoxo ichaza ukuthi yiziphi).
3. Hlola **Amayunithi womdwebo**. Uma umdwebo usho amayunithi wawo, i-CivilCraft iwaguqula ibe ayephrojekthi (amamillimitha ibe ngamamitha, amamitha abe amafiti, namayintshi abe amafiti). Umdwebo wamafiti ufundwa njengamafiti e-US survey ngaphandle kokukala: lawo amabili ahluka ngamaphathikili angu-2 kuzigidi, futhi ukukala izixhumanisi zendawo ngalokho kungazihambisa ngamafiti. Uma umdwebo ungasho amayunithi wawo, izinombolo zawo zifundwa ngamayunithi ephrojekthi; khetha amayunithi afanele ohlwini uma engafanele.
4. Ku-**Sebenzisa ebusweni**, khetha okwenziwa yingqimba ngayinye komphezulu (noma shiya **Bonisa kuphela**). Izingqimba ezibizwa ngamagama afana nezigaba zobuningi (TOPO, CONT, CNTR) ezinokuphakama ziqala njengemigqa yokuphula.
5. Chofoza {{ui:Engeza}}. Izingqimba zivela ngaphansi kwe-**GIS layers** esicwini sesobunxele; ukusetshenziswa ngakunye kufakwa emphezulwini. Wonke amacala uyinyathelo elilodwa: {{key:Mod+Z}} iyabuyisela kanye kanye.

## Okungatholwa yingqimba ngayinye

| Ingqimba iqukethe | Sebenzisa ebusweni |
|---|---|
| Izigaba zobuningi (ama-polyline ngokuphakama) | Imigqa yokuphula ngokuphakama kwemigqa yayo, noma ngensimu ye-ELEV |
| Ama-3D polyline | Imigqa yokuphula ngokuphakama kwawo |
| Umphetho ovaliwe | Umngcele womphezulu (indawo evaliwe enkulu kakhulu, noma leyo oyikhethile) |
| Amaphoyinti anokuphakama | Amaphoyinti okuhlola, achazwe ngegama lengqimba |
| Imigqa ngokuphakama 0 (imigqa yepulani) | Akukho lutho: ihlala epulanini njengomdwebo wesisekelo |

Umdwebo owenziwe yi-CivilCraft ugcina imigqa yawo yesici njenge-3D polyline ekhumbula amagophe awo. Ingxoxo bese ikhombisa **Feature lines**: yishiye ikhethiwe ukuze uyibuyisele njengemigqa yesici namagophe nokusetshenziswa kwayo (inyathelo elilodwa lokuhlehlisa), noma uyikhiphe ukuze ifundwe njengemigqa njanoma iyiphi enye ingqimba.

Kamuva, sebenzisa {{ui:Sebenzisa ebusweni}} kumenyu yengqimba ngaphansi kwe-**GIS layers** ukwenza okufanayo ngengqimba obuyibonisile kuphela.

## Amaphoyinti okuhlola kumabhulokhi

Imidwebo yokuhlola ivame ukuthwala amaphoyinti wayo njengamabhulokhi: uphawu oluncane emgqeni ngamunye, nezici zenombolo yephoyinti, incazelo nokuphakama. Uma umdwebo unezinkomba zamabhulokhi, ingxoxo inesigaba se-**Amaphoyinti okuhlola kumabhulokhi**:

1. Khetha amabhulokhi okuthathwa (ithebula likhombisa ukuthi izinkomba zingaki ngayinye, zisezingqimbeni ezimaphi, nezici zazo), noma khetha izingqimba ukuze uthathe zonke izinkomba zamabhulokhi kuzo.
2. Khetha lapho **inombolo**, **incazelo** kanye **nokuphakama** kuvela khona kwephoyinti ngalinye: kusuka kwesici, egameni lebhulokhi noma lengqimba, izinombolo ezilandelanayo ezikhululekile, noma i-Z yendawo yokufaka. I-CivilCraft iqala ngezici ezivame ukuba khona (PT, DESC, ELEV nezinye ezifana nazo), futhi ithatha ukuphakama kusuka kwesici kuphela uma amabhulokhi ekwendaweni yezero.
3. Susa ukukhethwa kwezingqimba zemigqa uma ufuna amaphoyinti kuphela, bese uchofoza {{ui:Engeza}}.

Inkomba ngayinye ishintsha ibe yiphoyinti lokuhlola endaweni yayo yokufaka. Kubalwa kuphela izinkomba ezibekwe ku-model space; amabhulokhi angene ngaphakathi kwamanye amabhulokhi awabalwa. Izinombolo ezisevele kuphrojekthi, noma ezisetshenziswe kabili emdwebweni, zithola izinombolo ezintsha ngemva kwaleyo ephezulu kakhulu, futhi isici sokuphakama esingesona inombolo sishiya leliphoyinti lingenakuphakama; umugqa wesimo uyabala konke kokubili. Umdwebo awuguqulwa lutho, futhi iphoyinti ngalinye likhumbula ibhulokhi lalo: i-Properties yalo ibonisa **From block** nebhulokhi, ingqimba nesibambo. Ukungeza amaphoyinti kuyinyathelo elilodwa, ngakho {{key:Mod+Z}} iwasusa wonke.

## Amazinga abhalwe njengombhalo, nokuhlola

Amazinga okuphakama abhalwe njengombhalo (noma kusici sebhulokhi esingesona isibambo samaphoyinti okuhlola) akuyona imigqa. Isigaba se-**Amazinga okuhlola nokuhlola** singawathatha njengamaphoyinti okuhlola, futhi sidweba okungalungile emdwebweni: amayunithi, uhlelo lokuhlanganisa, ibanga kusukela ku-zero, izigaba ezilingene, amazinga angajwayelekile, namaphoyinti awephindiwe. Bheka [Hlola umdwebo wokuhlola lapho ungeniswa](topic:survey-check).

## Indlela umdwebo ufundwa ngayo

- Amajika, izindilinga, ama-ellipse, izingxenye ze-polyline ezigobile nama-spline ziba yimigqa emifushane eqondile (ngo-5° ngokuphezulu ngamunye).
- Izinkomba zamabhulokhi zidwetshwa lapho zibekwe khona, nezingxenye ezifakwe ngaphakathi; okuku-bhulokhi kwengqimba 0 kuthatha ingqimba yenkomba.
- Izinto ezidwetshwe kwenye indiza (ukuqondiswa kokuphakama okuhlukile) zibekwa ezindaweni zomhlaba.
- Into ngayinye ithola izinkundla ezintathu: LAYER, TYPE (uhlobo lwento) kanye ne-ELEV (ukuphakama kwayo uma amaphoyinti ayo onke evumelana).
- Izixhumanisi zithathwa njengoba zinjalo: umdwebo kufanele usebenzise izixhumanisi ezifanayo naphrojekthi (njengesifunda esifanayo se-state plane). Imidwebo exhunyiwe (xrefs) ayivulwa: yivule ngokwayo.

:::tip
Umdwebo wamakhonkothi unikeza umphezulu omuhle kakhulu ngamaphoyinti ambalwa okuphakama ezindaweni eziphakeme nasezindaweni ezijulile, lapho amakhonkothi wodwa eshiya izinxantathu ezilingene. Engeza njengamaphoyinti okuhlola, noma kusuka engqimbeni yamaphoyinti kumdwebo.
:::
