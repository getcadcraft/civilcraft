---
title: Deji nidaamka koordinaatada mashruuca
summary: Sheeg nidaamka koordinaatada sahanka, si CivilCraft u muujiyo latitude iyo longitude, u dhigo faylasha GIS iyo layers-ka khariidadda, oo u qoro faylasha .prj. Dooro koodka, magaca, koordinaatada laftooda ama fayl .prj.
keywords: nidaamka koordinaatada, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, projection, prj, wkt, datum, latitude, longitude, lat long, juqraafi, grid, georeference, georeferencing, deji nidaamka koordinaatada
from: 964250e2
---

Koordinaatada mashruuca waa tiro caadi ah ilaa aad sheegto waxay macnaheeda yihiin. Dejinta nidaamka koordinaatada **weligeed ma dhaqaajiso wax**: waxay u sheegtaa CivilCraft in, tusaale ahaan, E 6,150,000 N 2,080,000 yihiin koordinaatada state plane ee California aagga 6 oo ku qoran fiit sahan oo US ah. Markay taas garato:

- bar-xaaladdu waxay muujinaysaa latitude iyo longitude ee tusaha,
- faylasha GIS ee nidaamyo kale (shapefiles, GeoJSON, GeoPackage, shabakadaha dhererka, LiDAR) waxaa loo beddelaa mashruuca markay furmaan,
- layers-ka khariidadda ayaa lagu sawiri karaa hoosta qorshaha ([Muuji layers-ka khariidadda hoosta qorshaha](topic:map-layers)),
- dhoofinta qaababka GIS waxay qaadaa nidaamka (`.prj` shapefiles-ka, koodka EPSG ee GeoPackage iyo GeoTIFF).

## Dooro nidaamka

1. Dooro {{ui:Isku-xirka}} kooxda {{ui:GIS}} ee toolbar-ka. Wada-hadalka **Nidaamka koordinaatada** ayaa furmaa. Sare waxay sheegaysaa nidaamka mashruucu hadda ku jiro, ama **Midna — koordinaatadu waa tiro oo keliya**.
2. Hel nidaamka mid ka mid ah siyaabahan:
   - **Raadi**: ku qor koodka EPSG (`2277`, `EPSG:2277`) ama erayo ka mid ah magaca (`texas central`, `utm 14n`, `lambert-93`). Koodhadhku waxay ka bilaabmaan kii aad qortay; erayadu waxay soo bandhigaan nidaamyada magacooda ku leh erayada oo dhan.
   - {{ui:Nidaamyada koordinaatadani ku habboon yihiin}} (marka mashruucu leeyahay barood ama dusha): CivilCraft wuxuu akhrisaa dhexda mashruucaaga nidaam kasta oo ka mid ah qoyska cutubka mashruuca, kana liiskeeya kuwa aagooda isticmaalka uu ku jiro. Koordinaatada state plane badanaa waxay ku habboon yihiin kaliya meelo yar: mashruuc ku yaal Texas oo ah E 3,115,000 N 10,070,000 fiit sahan oo US ah wuxuu ku habboon yahay afarta nooc ee Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Qoraal kasta wuxuu muujinayaa halka dhexda mashruucaaga ku dhacdo.
   - **Ag ku dhow (lat, long)** iyo {{ui:Soo jeedi}}: ku qor meesha goobtu ku taal, tusaale ahaan `30.27, -97.74` ama `30°16′N 97°44′W`, CivilCraft wuxuu liiskeeyaa nidaamyada mashruuca aagooda ku jira, shabakadaha qaranka iyo gobolka ayaa hore.
   - {{ui:Akhri fayl .prj…}}: fur `.prj` ku timid shapefile ama naqshad. CivilCraft wuxuu ku isbarbardhigaa liistiisa xisaabta isbeddelka (haddii `.prj` uu datum kale magac ku siiyo, weli wuu helaa nidaamka saxda ah) wuxuuna sheegayaa kan uu yahay; haddii midna aanu si sax ah u iswaafaqin, waxaa la isticmaalaa sharaxaadda faylka laftiisa. Waxaad sidoo kale dhigi kartaa `.prj` wada-hadalka, ama fur ama dhig qorshaha keligiis.
3. Guji nidaam liiska ku jira. Hoosta **La doortay** waxay muujinaysaa magaca, koodka EPSG, cutubka, sida datum-kiisu ugu xidhan yahay WGS 84, aagga isticmaalka ee latitude iyo longitude, iyo meesha dhexda mashruucaaga ku dhacdo.
4. Ka tag **Shabakad** oo dooran (inta badan mashruucyada; eeg [Dhulka iyo koordinaatada maxalliga ah](topic:ground-and-local-coordinates) kuwa kale) oo dooro {{ui:Codso}}.

Bar-xaaladda hadda waxay muujinaysaa latitude iyo longitude ee tusaha, oo ku xiga E iyo N. Dejinta nidaamka waa hal tallaabo oo ka noqo: {{key:Mod+Z}} ayaa soo celinaysa.

:::note
Cutubyadu waa inay isku mid noqdaan: mashruuc fiit ah wuxuu qaataa nidaamyo fiit sahan oo US ah ama fiit caalami ah; mashruuc mitir ah wuxuu qaataa nidaamyo mitir ah. CivilCraft wuxuu sharxaa diidmada (\"Mashruucu waa fiit, laakiin nidaamkan waa mitir…\"). Mashruuc fiit ah oo leh nidaam fiit sahan oo US ah wuxuu isticmaalaa fiit sahan: \"ft\" ee mashruuca waxay macnaheedu tahay fiitka nidaamka. Nidaamyada juqraafiga (latitude iyo longitude, sida WGS 84 laftiisa) ma noqon karaan nidaamka mashruuca: naqshadaha waxay u baahan yihiin bari iyo waqooyi.
:::

## Beddel ama ka saar nidaamka

Mar kale fur {{ui:Isku-xirka}}, dooro nidaam kale oo dooro {{ui:Codso}}. Marka mashruucu leeyahay barood ama naqshad, CivilCraft wuxuu weydiinayaa **Koordinaatadu horay ma ku jiraan …?**

- {{ui:Haa — wax ma guuraan}}: tirooyinku way sidoodaan ahaadaan, oo kaliya macnahoodu wuu beddelaa. Isticmaal markii nidaamkii hore si khalad ah loo doortay.
- {{ui:Maya — beddel}}: barta sahan kasta, khadka jebinta, xuduudka, PI-ga jidka, geeska pad-ka iyo qaab-dhismeed waxaa loo beddelaa nidaamkii hore oo ku cusub, hal tallaabo oo ka noqo. Dusha laga akhriyay LandXML oo saddexagallo ah lama beddeli karo; marka hore ka dhis barahaaga.

{{ui:Ka saar nidaamka}} waxay nidaamka ka saartaa (wax ma guuraan). Layers-ka GIS ee horay ugu jiray mashruuca waxay ku sii jiraan meeshooda.

## Latitude iyo longitude bar-xaaladda

Inta mashruucu nidaam leeyahay, bar-xaaladdu waxay muujinaysaa latitude iyo longitude ee tusaha ee WGS 84, tusaale ahaan `30°18′00.00″ N  97°42′00.00″ W`. Dooro darajooyin tobanle halkii ay ka ahaan lahayd hoosta {{ui:Dejinta}}, {{ui:CivilCraft}}, **Latitude iyo longitude** ([Dejinta CivilCraft](topic:settings)). Koordinaatada dhulka ama maxalliga ah marka tahay, akhriska marka hore wuxuu maraa tallaabadaas, sidaas darteed waa sax barta hoosta tusaha.

## Sida uga wanaagsan tahay isbeddelka datum-ka

Latitude, longitude, GeoJSON iyo layers-ka khariidadda dhammaantood waxay ku yaallaan WGS 84. Xidhiidhka nidaam kasta ee WGS 84 wuxuu muuqdaa wada-hadalka:

| Wixii wada-hadalku sheegayo | Waxa ay micnaheedu yahay |
|---|---|
| WGS 84 laftiisa | Isbeddel ma jiro. |
| NAD83 waxaa loo qaadaa sidii WGS 84 | Labadoodu waxay kala duwan yihiin mitir ama laba inta badan Waqooyiga Ameerika, ugu badnaan dhowr mitir. Waa wanaagsan layers-ka khariidadda iyo xaaladda goobta; ma aha xakameynta sahanka. |
| Waa la yaqaan ilaa *n* m (qiimaha EPSG) | Isbeddel la daabacay; layers-ka khariidadda iyo GeoJSON way ka dhex dhacaan sidaas. |
| Datum-kan lama yaqaan | Isbeddel la daabacay ma jiro iyada oo aan fayl shabakad lahayn: layers-ka khariidadda iyo GeoJSON waxay ka dhex dhaci karaan boqolaal mitir. |
| Faylka isbeddelka shabakadda … | Fayl isbeddel shabakad ayaa la isticmaalayaa (hoos): dhawr 10 cm oo NAD83 gudaha shabakadda. |

Koordinaatadaada mashruuca ma mari doonaan isbeddel datum: kaliya waxa loo beddelo latitude iyo longitude ama laga beddelo. Datum-yada toosan iyo moodelada geoid ma la maaraynayo (dhererka weligood ma la beddelo). Meel ay isbeddelka ugu fiican u baahan tahay fayl shabakad, liiska waxa uu leeyahay isbeddel la daabacay oo qiyaas ah, wada-hadalkuna wuxuu muujinayaa saxnaanteeda (tusaale ahaan nidaamyada NAD27 qiyaastii 20 m), ilaa aad ku darto shabakadda.

## Faylasha isbeddelka shabakadda

Nidaam NAD27 ah, **Faylka isbeddelka shabakadda** ee wada-hadalka nidaamka wuxuu latitude iyo longitude, faylasha GIS iyo layers-ka khariidadda u geliyaa dhawr 10 cm oo NAD83 halkii ay ka ahaayeen qiyaastii 20 m:

- **Soo deji** shabakadda ay soo jeedinayso aagga nidaamka (NADCON5 Mareykanka isku xiran, NADCON Alaska, NTv2 Kanada) cdn.proj.org, server-ka shabakadaha dadweynaha ee PROJ. Magaca faylka shabakadda ayaa keliya la diraa.
- Ama **Ku dar fayl shabakad…** haddii aad hore u haysatid: NTv2 (`.gsb`) ama shabakadda PROJ GeoTIFF (`.tif`), ilaa 20 MB.

Shabakadda waxaa lagu kaydiyaa faylka mashruuca, sidaas darteed wuu raacaa mashruuca. Qaybtu waxay sheegaysaa in dhexda mashruucu gudaha shabakadda ku jirto iyo in kale: dibadda midkood, isbeddel ma la codsado, sidaas darteed isticmaal shabakad goobta daboolaysa. **Jooji isticmaalka shabakadda** wuxuu dib ugu celinayaa isbeddelka qiyaasta ah. Isbeddel kasta waa hal tallaabo: {{key:Mod+Z}} ayaa ka noqoonaysa.

Layers-ka GIS ee horay ugu jiray mashruuca way sii jiraan meeshooda marka shabakaddu beddelto; dib u soo dhoof si aad ugu dhigto shabakadda. Koordinaatada mashruuca weligood ma dhaqaaqdo.

## Waxa la hubiyay

- Beddelaad kasta waxaa loo barbardhigay PROJ (pyproj 3.7.1 oo leh PROJ 9.5.1), maktabadda koordinaatada ee inta badan barnaamijyada GIS isticmaalaan, oo ku saabsan in ka badan 330 nidaam: state plane fiit sahan oo US ah iyo fiit, UTM waqooyi iyo koonfur, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator iyo web Mercator oo ka mid ah. Bari iyo waqooyiga waxay ku heshiiyaan 1 cm isla isbeddelka datum-ka (inta badan ka hooseeya 1 mm), xisaabaadka projection-ka ayaa heshiiya qeexidda PROJ 1 cm ilaa.
- Faylasha `.prj` ee PROJ qoray labada qaab ee caadiga ah (ESRI iyo OGC) ayaa dib loo akhriyay 105 nidaam: 208 ka 210 waxay iswaafaqeen koodkooda EPSG ee saxda ah, labada kale nidaam leh xisaab isku mid ah oo ellipsoid isku mid ah. Faylasha `.prj` ee CivilCraft qoro PROJ ayaa akhrisa nidaam isku mid ah. Faylasha `.prj` ESRI ee nidaamyada polar stereographic (UPS, Alaska polar) ma akhrin karaan; dooro nidaamyadaas koodka.
- Latitude iyo longitude bar-xaaladda ayaa iswaafaqay PROJ ilaa 0.01″ browser-ka.
