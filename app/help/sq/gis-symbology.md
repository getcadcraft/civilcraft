---
title: Stilo një shtresë sipas një atributi
summary: Ngjyros elementët e një shtrese GIS sipas vlerave të një fushe (një ngjyrë për çdo vlerë, ose sipas intervaleve numerike), madhëso pikat sipas një numri, lyej poligonet dhe shfaq një legjendë në planimetri.
keywords: simbologji, stil, ngjyrë, kategorike, graduale, vlera unike, interval i barabartë, kuantil, prerje natyrore, jenks, gradient, ngjyra për daltonistë, legjendë, madhësi, pika, koroplet, klasa, gis
from: a3a69add
---

Hap menunë me **tre pikat** të një shtrese te lista e **Shtresave GIS** dhe zgjidh {{ui:Stilo sipas atributit…}}.

## Tre stile

- **Simbol i vetëm:** ngjyra e shtresës, si më parë.
- **Kategorike:** një ngjyrë për çdo vlerë të veçantë të çdo fushe. Deri në tetë vlera marrin tetë ngjyrat Okabe-Ito (zgjedhur që të mbeten të veçuara për llojet e zakonshme të verbërisë së ngjyrave); me më shumë vlera, shtatë më të shpeshtat marrin nga një ngjyrë secila dhe të tjerat ndajnë një klasë gri **Tjetër**. Elementët pa vlerë janë gri.
- **Graduale:** një fushë numrore ndahet në 2 deri në 9 intervale, secili me një ngjyrë nga një gradient. Një vlerë në një prag shkon në intervalin më të ulët.

## Si priten intervalet

| Metoda | Pragjet |
|---|---|
| Interval i barabartë | Intervali nga vlera më e vogël deri në më të madhen ndahet në gjerësi të barabarta. Vlerat 0 deri 30 në tre intervale: 0, 10, 20, 30. |
| Kuantil | Rreth të njëjtin numër elementesh në çdo interval. Pragjet lexohen nga vlerat e renditura me interpolimin e zakonshëm me vijë të drejtë: për 1 deri 10 në dy intervale, pragu është 5.5. |
| Prerje natyrore (Jenks) | Prerjet që lënë shpërndarjen më të vogël brenda çdo intervali, kështu që grumbujt e vlerave të ngjashme qëndrojnë bashkë. Mbi 1,500 vlera punon mbi 1,500 të shpërndara njëtrajtësisht dhe e thotë këtë. |

## Ngjyrat

Viridis dhe Cividis shkojnë nga e errët në të çelët me ndryshim të qëndrueshëm të ndriçimit, kështu që rendi i intervaleve lexohet edhe në gri ose me verbëri ngjyrash. Blues shkon nga e çelta në të errët. E kuqja në blu është një gradient dyanësh për vlera rreth një mesi. **Kthe ngjyrat** i kthen çdonjërin. Dialogu liston intervalet dhe numrin e elementeve në secilin para se ta aplikoni.

## Madhësia, mbushja dhe legjenda

- **Madhësia e pikës sipas** një fushe numrore e bën katrorin e çdo pike më të madh sa më e madhe vlera, midis dy madhësive që jepni ju (gjysma e brinjës, në milimetra në letër).
- **Lyej brendësinë e poligoneve** mbush çdo poligon me ngjyrën e klasës së tij (vrimat mbeten bosh). Lyerja është në ekran; printimet dhe DXF/DWG tregojnë konturet me ngjyra.
- **Shfaq një legjendë në planimetri** vizaton klasat, numrat e tyre dhe intervalin e madhësisë në këndin e poshtëm majtas të planimetrisë. Legjenda është në ekran; nuk hyn në printim.
- Për të etiketuar elementët me një fushë, përdor **Etiketo me** në të njëjtën menu.

Stili ruhet në skedarin e projektit. Një version që nuk i njeh stilet e hap skedarin me ngjyrën e shtresës. Printimet, DXF dhe DWG mbajnë klasat si shtresa të veçanta, të emërtuara sipas shtresës dhe klasës, në ngjyrën më të afërt nga nëntë ngjyrat bazë CAD. Një shtresë me më shumë se 200,000 elemente vizatohet në një ngjyrë.
