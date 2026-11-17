---
title: Žemėlapių sluoksnių rodymas po planu
summary: Įdėkite georeferencinį paveikslėlį, žemėlapio plytelių, WMS ar WMTS serverį ar žemėlapio paslaugą po planu kaip vietovės kontekstą, su interneto nustatymu, nepermatomumu, tvarka ir autorystės nurodymu.
keywords: žemėlapių sluoksniai, pagrindinis žemėlapis, fonas, aerofotografija, ortofotografija, vaizdai, palydovinis, rastras, pasaulio failas, pgw, jgw, tfw, wld, geotiff, georeferencinis paveikslėlis, xyz, plytelės, slippy map, wms, wmts, getcapabilities, žemėlapio paslauga, rest, mapserver, imageserver, usgs, national map, autorystė, nepermatomumas
from: 32d7718e
---

Žemėlapių sluoksniai – tai paveikslėliai, piešiami po jūsų projektu: aerofotografija su pasaulio failu arba žemėlapiai iš interneto serverių. Jie rodomi tik ekrane kaip vietovės kontekstas: jie **nėra** PDF spaudiniuose, DXF ar DWG eksportuose ar 3D vaizde.

Pasirinkite {{ui:Žemėlapis}} grupėje {{ui:GIS}}. Langas **Žemėlapių sluoksniai** išvardija projekto sluoksnius ir leidžia pridėti naujus. Žemėlapių sluoksniams reikia projekto koordinačių sistemos ([Nustatykite projekto koordinačių sistemą](topic:coordinate-systems)), išskyrus paveikslėlį, kurio pasaulio failas naudoja paties projekto koordinates.

## Interneto nustatymas

CivilCraft niekada neprašo žemėlapio serverio ko nors, kol neleisite: {{ui:Parametrai}}, {{ui:CivilCraft}}, **Žemėlapių sluoksniai iš interneto**: **Išjungta** (pradinė reikšmė) arba **Įjungta**.

:::note
Kai įjungta, CivilCraft prašo pridėtų žemėlapių serverių paveikslėlių ekrane matomai vietovei. Jūsų brėžinys lieka šiame kompiuteryje; serveris mato vietovę ir jūsų interneto adresą.
:::

Kol išjungta, interneto sluoksniai lange išvardijami pilka spalva su priežastimi, ir nieko nepiešiama bei neprašoma. Atidarius projektą, kuriame nurodyti žemėlapių serveriai, jie taip pat nekontaktuojami. Paveikslėlis iš failo veikia bet kuriuo atveju. Lango mygtukas {{ui:Atidaryti parametrus}} nuveda į nustatymus.

## Georeferencinis paveikslėlis (veikia neprisijungus)

1. Skiltyje **Pridėti sluoksnį** palikite **Georeferencinis paveikslėlis** ir pasirinkite failus: paveikslėlį (PNG arba JPEG) **kartu su** jo pasaulio failu (`.pgw` PNG, `.jgw` JPEG arba `.wld`) ir, jei yra, jo `.prj`. Taip pat galite juos kartu nuleisti ant plano.
2. Jei nėra `.prj`, CivilCraft klausia, kokia sistema naudojama pasaulio faile: {{ui:Projekto sistema}} (dažniausiai), {{ui:Pasirinkite sistemą…}} arba, projekte be sistemos, **Projekto koordinatės**.
3. Paveikslėlis atsiranda po planu, o {{ui:Pritaikyti}} jį įtraukia.

RGB GeoTIFF (aerofotografija, išsaugota kaip GeoTIFF) turi savo vietą ir sistemą: atidarykite jį atskirai. Paveikslėlis saugomas **projekto faile** (iki 25 MB); didesnis atmetamas su savo dydžiu, todėl išsaugokite mažesnę kopiją (mažiau taškų arba JPEG).

## Plytelės, WMS, WMTS ir žemėlapių paslaugos

Pirmiausia įjunkite **Žemėlapių sluoksniai iš interneto**. Tada skiltyje **Pridėti sluoksnį**:

| Iš | Ką įklijuoti | Ką daro CivilCraft |
|---|---|---|
| Plytelių URL | Šablonas su `{z}`, `{x}` ir `{y}` (arba `{-y}`), ir `{s}` serverio raidei, pavyzdžiui `https://tile.example.org/{z}/{x}/{y}.png`. Suteikite jam pavadinimą ir autorystės nurodymą. | Plytelės web Mercator projekcijoje, vietovei ir mastelio lygiui ekrane. |
| WMS serveris | Serverio adresas arba jo GetCapabilities nuoroda. Pasirinkite {{ui:Gauti sluoksnius}}, tada sluoksnį. | Vienas vietovės ekrano paveikslėlis, prašomas pagal projekto EPSG kodą, kai serveris jį siūlo, kitaip web Mercator arba WGS 84. |
| WMTS serveris | Serverio adresas arba jo `WMTSCapabilities.xml`. Pasirinkite {{ui:Gauti sluoksnius}}, tada sluoksnį ir plytelių matricų rinkinį. | Plytelės iš rinkinio projekto sistemoje, kai ji yra, kitaip web Mercator. |
| ArcGIS žemėlapio paslauga (REST) | URL, baigiantis `/MapServer` arba `/ImageServer`. Pasirinkite {{ui:Nuskaityti paslaugą}}. | Talpykloje esančios web Mercator paslaugos piešiamos iš savo plytelių; kitos prašomos vieno vietovės paveikslėlio ekrane. |

Serveriai iš anksto nepridedami. Viešieji pavyzdžiai, visi iš USGS National Map (viešas domenas):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Žemėlapio paslauga: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (taip pat `USGSImageryOnly` aerofotografijoms)

Daugelis miestų ir apskričių GIS skyrių skelbia savo WMS ar žemėlapių paslaugas; jų GIS puslapiuose nurodomas adresas. Serveris, kuris reikalauja prisijungimo ar rakto, neveikia: CivilCraft nesiunčia vartotojo vardų, slaptažodžių ar raktų.

## Kaip piešiami sluoksniai

- Paveikslėliai kitoje sistemoje nei projekto perkeliami į ją: paveikslėlis supjaustomas į dalis, kiekviena padedama taip, kad būtų ne toliau kaip ketvirtis ekrano pikselio nuo vietos, kur ją padėtų tikslus perskaičiavimas.
- Plytelės parenkamos vietovei ekrane ir mastelio lygiui: niekada daugiau nei 64 vaizdui, po 6 vienu metu. Kai slenkate ar keičiate mastelį, užklausos senam vaizdui atšaukiamos. Atmintyje laikoma apie 200 plytelių (diske nieko neįrašoma).
- WMS ar žemėlapio paslaugos paveikslėlis prašomas, kai vaizdas nustoja judėti; kol jis atkeliauja, paskutinis lieka vietoje.
- Kiekvieno sluoksnio autorystės nuoroda ekrane rodoma smulkiai plano apatiniame dešiniajame kampe.

## Keiskite, tvarkykite ir šalinkite sluoksnius

Lange kiekvienas sluoksnis turi žymimąjį langelį rodyti ar slėpti, **Nepermatomumo** slankiklį, rodykles, kad piešti anksčiau (žemiau) arba vėliau (viršuje), mastelio mygtuką (paveikslėliams) ir šalinimo mygtuką. Pirmasis sąrašo sluoksnis piešiamas apačioje. Kiekvienas pakeitimas yra vienas anuliavimo žingsnis.

## Kai sluoksnis nieko nerodo

Priežastis pasirodo būsenos eilutėje vieną kartą ir lieka po sluoksnio pavadinimu lange:

| Pranešimas | Ką daryti |
|---|---|
| Išjungta: žemėlapių sluoksniai iš interneto išjungti Parametruose. | Įjunkite **Žemėlapių sluoksniai iš interneto**. |
| Reikia projekto koordinačių sistemos | Nustatykite ją skiltyje {{ui:Koordinatės}}. |
| Serveris neleido šiam puslapiui naudoti jo paveikslėlių (CORS) arba nepavyko jo pasiekti. | Serveris neleidžia tinklalapiams naudoti jo paveikslėlių arba jis neveikia. Po keturių atmetimų CivilCraft nustoja prašyti; paslėpkite ir parodykite sluoksnį, kad bandytumėte iš naujo. |
| Serveris atsakė 404 … / Serveris atsiuntė text/xml, o ne paveikslėlį: … | URL, sluoksnis ar stilius neteisingas, arba serverio pranešimas nurodo, ko jis nori. |
| Šis sluoksnis nepasiūlytas projekto sistemoje, web Mercator ar WGS 84 | Serveris negali piešti ten, kur CivilCraft gali jį padėti. |

## Kas patikrinta

- Plytelių numeriai patikrinti pagal standartinį web Mercator plytelių išdėstymą; WMS 1.1.1 ir 1.3.0, WMTS ir žemėlapių paslaugų atsakymai nuskaityti iš rankiniu būdu parašytų failų ir iš tikrų atsakymų, išsaugotų iš USGS National Map ir terrestris OpenStreetMap serverių; WMS 1.3.0 užklausose platuma eina pirma EPSG:4326, kaip nurodo standartas.
- Perkėlimas palygintas su tiksliu kiekvieno pikselio perskaičiavimu pagal PROJ skaičius: ne toliau kaip 0.13 px plytelėms, WMS paveikslėliams ir apskrities dydžio paveikslėliui, esant vietovės mastui ir nutolus.
- Paveikslėliai su pasaulio failu ir RGB GeoTIFF, parašytas GDAL (per rasterio), nupiešti ten, kur nurodo jų vieta, patikrinta pikselis po pikselio naršyklėje.
- Naršyklėje, prieš bandymo kompiuteryje esantį pakaitinį serverį: plytelės nusileidžia ten, kur PROJ deda kiekvieną tašką; WMS paveikslėlis nusileidžia per 2 px; vienu metu vykdoma ne daugiau nei 6 užklausos; su išjungtu nustatymu jokia užklausa neišeina iš puslapio. Aukščiau nurodyta USGS National Map žemėlapio paslauga taip pat buvo nuskaityta ir gyvai nupiešta naršyklėje vieną kartą (jos plytelės atkeliavo ir buvo nupieštos, su autorių teisių tekstu); kiti vieši serveriai nuskaityti tik iš išsaugotų atsakymų.
