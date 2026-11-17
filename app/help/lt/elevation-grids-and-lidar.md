---
title: Aukščių tinkleliai ir LiDAR
summary: Sudarykite esamą reljefą iš DEM (GeoTIFF arba ASCII tinklelio) arba LiDAR taškų (LAS, LAZ) – pasirinkite plotą, retinkite duomenis, pasirinkite klases ir patikrinkite aukščių vienetus – ir grąžinkite paviršių kaip GeoTIFF aukščių tinklelį.
keywords: dem, dtm, aukščių tinklelis, geotiff, tif, ascii tinklelis, asc, lidar, las, laz, taškų debesis, klasės, žemė, retinimas, nodata, rastras, eksportuoti geotiff, gis
from: c8b2d18a
---

Viešieji aukščių duomenys ateina dviem būdais: **aukščių tinkleliai** (DEM: vienas aukštis kiekvienam kvadratiniam langeliui, dažniausiai GeoTIFF `.tif` arba ASCII tinklelis `.asc`) ir **LiDAR taškai** (milijonai lazerio atspindžių `.las` faile arba `.laz`, jei suspausta). CivilCraft paverčia bet kurį iš jų geodeziniais taškais arba paviršiumi naršyklėje: niekas neįkeliama.

## Atidaryti failą

1. Spustelėkite {{ui:Open}} (arba {{ui:Import}} GIS grupėje) ir pasirinkite failą arba nuvilkite jį į planą. ASCII tinkleliui pasirinkite ir jo `.prj` failą, kad CivilCraft žinotų koordinačių sistemą.
2. Importo dialogas rodo, ką failas sako apie save: dydį, langelius ar taškus, koordinačių sistemą, platumą ir ilgumą bei aukščių intervalą. LiDAR atveju pirmiausia kiekvienas taškas perskaitomas kartą, kad būtų suskaičiuotos **klasės** (eigos juosta rodo progresą; {{ui:Cancel}} sustabdo).

GeoTIFF su trimis ar keturiais kanalais (raudonas, žalias, mėlynas) yra paveikslėlis, o ne aukščiai: jis patenka į žemėlapio sluoksnius.

## Pasirinkti, ką importuoti

- **Plotas**: {{ui:The project’s extents and a margin}} (įveskite paraštę), {{ui:What the plan shows now}} arba {{ui:The whole file}}. Skaitoma tik ta failo dalis.
- **Retinti iki**: taškų tarpai projekto vienetais. Eilutė po nustatymais rodo, kiek taškų tai duoda, kai rašote. Tinkleliui CivilCraft palieka kas antrą, trečią … langelį, todėl aukščiai lieka tiksliai tokie, kokie yra faile; langeliai niekada nevidurkinami. LiDAR atveju plotas suskaidomas į kvadratus tokio dydžio ir kiekviename paliekamas vienas taškas: {{ui:The point nearest each cell’s center}} (numatytasis), {{ui:The lowest point in each cell}} (geras, kai faile nėra žemės klasės: žemė yra po medžiais) arba {{ui:The average of each cell’s points}}.
- **Klasės** (LiDAR): žemės klasė (2) pažymima, kai ji faile yra; pastatai, medžiai ir triukšmas neįtraukiami. Kai žemės klasės nėra, pažymamos visos klasės, ir dialogas tai nurodo.
- **Žemė** (LiDAR, 0,8): dronų debesyje nėra žemės klasės. Kai jos faile nėra, dialogas pradeda nuo {{ui:Find the ground myself (drone clouds, no ground class)}}: skaitomos visos klasės, išskyrus triukšmą, paliekamas žemiausias taškas kiekviename langelyje, o tada CivilCraft pašalina pastatus, medžius ir atsitiktinius žemus taškus progresyviu morfologiniu filtru (Zhang ir kt., 2003), kurį galite valdyti: **Didžiausias pašalinamas objektas** (didžiausio pastato plotis; langai didėja, kol jį uždengia; 0 reiškia 20 langelių) ir **Didžiausias žemės šlaitas**. Darbas atliekamas žemiausių taškų tinklelyje, todėl debesis iš dešimčių milijonų taškų nekainuoja daugiau nei jo langelių skaičius (retinimas – vienas srautinis praėjimas). Tarpas yra langelio dydis: didesnis – greitesnis ir mažiau praleidžia mažų objektų, nei galima tikėtis; mažesnis išsaugo daugiau žemės detalių. Ataskaita nurodo, kiek taškų išsaugota kaip žemė, kiek langelių pašalinta kaip objektai ir kiek atsitiktinių žemų taškų atmesta. Sumodeliuotame 300 m dronų tyrime su penkiais pastatais, 70 medžių ir 200 žemų nuokrypių išsaugoti taškai buvo ne toliau kaip 3 cm nuo tikro reljefo, o joks stogas ar lajos taškas neišsaugotas.
- **Aukščiai faile**: metrai, pėdos arba JAV geodeziniai pėdos. Kai failas tai nurodo, jo vienetas jau pasirinktas. Kai nenurodo, turite pasirinkti: dialogas rodo aukščių intervalą abiem būdais, kad galėtumėte nustatyti, kuris tinka vietovei.
- **Importuoti kaip** (tik tinkleliams): {{ui:Survey points (description DEM)}} arba {{ui:The surface itself (a grid of triangles)}}.

Vienas importas gali imti ne daugiau kaip 500 000 taškų. Kai pasirinkimas duotų daugiau, dialogas nurodo, kiek per daug ir koks tarpas tiktų, o {{ui:Import}} lieka išjungtas.

Spustelėkite {{ui:Import}}. Eigos juosta rodo skaitymą; {{ui:Cancel}} jį sustabdo, ir niekas nepasikeičia.

:::warning
Vertikalieji vienetai – dažna klaidų priežastis. Daugelio valstybinės plokštumos DEM rytų ir šiaurės koordinatės yra pėdomis, o aukščiai – metrais. Palyginkite dialogo rodomą intervalą su tuo, ką žinote apie vietovę.
:::

## Ką gaunate

- **Geodeziniai taškai**: sunumeruoti po jūsų aukščiausio taško numerio, su aprašymu `DEM` (tinkleliams) arba `LIDAR`, todėl jie sudaro vieną taškų grupę skiltyje **Taškai** ir kuria paviršių kaip bet kurie kiti taškai. Taškų importas yra vienas žingsnis: {{key:Mod+Z}} juos pašalina.
- **Pats paviršius**: tinklelio TIN, du trikampiai kiekviename langelyje, dalijami pietvakarių–šiaurės rytų įstrižaine. Trikampis, kurio kampas neturi duomenų, paliekamas laukan, todėl duomenų tuštumos lieka tuštumomis. Paviršius lygus tinklelio taškams ir yra plokštuma kiekviename trikampyje tarp jų. Jis pakeičia projekto paviršių (dialogas klausia pirma); {{key:Mod+Z}} grąžina ankstesnį paviršių. Kairiojo skydelio antraštė rodo **Paviršius (iš aukščių tinklelio)**.

## Koordinačių sistemos

- Jei projektas turi koordinačių sistemą, o failas nurodo kitą, kiekvienas taškas konvertuojamas į projekto sistemą (ir į jo žemės ar vietines koordinates, jei jos yra).
- Jei projektas neturi sistemos, o failo sistema yra projekto vienetais (pėdos ar metrai), dialogas siūlo ją padaryti projekto koordinačių sistema tame pačiame anuliavimo žingsnyje kaip ir taškai.
- Jei failas yra platumos ir ilgumos arba metrais pėdų projekte, dialogas prašo pirma pasirinkti projekto koordinačių sistemą.
- Jei failas nenurodo, jo skaičiai laikomi projekto koordinatėmis. Galite pasirinkti failo sistemą.

## Eksportuoti paviršių kaip GeoTIFF

1. Spustelėkite {{ui:Export}} GIS grupėje.
2. GeoTIFF dalyje pasirinkite paviršių (esamą žemę arba suprojektuotą paviršių) ir langelio dydį. Numatytasis imamas iš vidutinės paviršiaus trikampio kraštinės. Dialogas rodo rašomo tinklelio dydį.
3. Spustelėkite {{ui:Download GeoTIFF}}.

Failas yra viena 32 bitų slankiojo kablelio aukščių juosta projekto vienetais, paviršiaus apimtyje; langeliai už paviršiaus yra „nėra duomenų“ (−3.4028235e38). Kiekvieno langelio reikšmė yra paviršiaus aukštis langelio centre. Koordinatės yra **tinklelio** koordinatės: projektas žemės ar vietinėse koordinatėse konvertuojamas atgal į tinklelį. Failas nurodo projekto koordinačių sistemą pagal EPSG kodą; sistema be EPSG kodo neįrašoma, o dialogas perspėja, kad apie tai reikia pranešti GIS skyriui.

## Kas patikrinta

- GeoTIFF ir ASCII tinklelių skaitytuvai patikrinti su GDAL (per rasterio) – biblioteka, kurią naudoja dauguma GIS programų: 32 bitų slankiojo kablelio ir 16 bitų sveikųjų tinkleliai, plytelės ir juostos, DEFLATE ir LZW, nodata, mastelis ir poslinkis, pixel-is-point, UTM tinklelis, valstybinės plokštumos tinklelis JAV geodeziniais pėdomis ir platumos bei ilgumos tinklelis – kiekviena reikšmė sutapo.
- LAS ir LAZ skaitytuvai patikrinti su laspy: LAS 1.2 ir 1.4, taškų formatai 0, 1, 3, 6, 7 ir 8, su koordinačių sistema ir be jos, bei LAZ, rašytas LASzip suderinamu varikliu – kiekvienas taškas sutapo.
- Konvertuotos koordinatės patikrintos su PROJ iki 1 mm.
- Eksportuoti GeoTIFF perskaityti GDAL: koordinačių sistema, langelių padėtys, nodata, vienetai ir reikšmės sutampa su paviršiumi iki 0,0001.
- Nieko čia neatidaryta kitose GIS ar CAD programose.

## Dar nepadaryta

- Vertikalaus datumo keitimai (geoidų modeliai): aukščiai naudojami tokie, kokie yra faile.
- Bangų formos duomenys, LiDAR atspindžiai ne pagal klasę, spalvos ir intensyvumai.
- Kelios juostos, apžvalgos (overviews) ar failai didesni nei 200 MB.
- LAS ar LAZ rašymas iš paviršiaus ar šio įrankio (priedas [Taškų debesys](topic:point-clouds) rašo išvalytą debesį kaip LAS 1.4 arba LAZ).
