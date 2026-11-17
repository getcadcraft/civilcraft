---
title: Shfaq shtresat e hartës nën planimetri
summary: Vendosni një imazh të gjeoreferencuar, pllaka hartash, një server WMS ose WMTS ose një shërbim harte nën planimetri si kontekst vendi, me cilësimin e internetit, opacitetin, renditjen dhe atribucionin.
keywords: shtresa harte, sfond harte, hartë bazë, sfond, ajror, ortofoto, imazh, satelit, raster, world file, pgw, jgw, tfw, wld, geotiff, imazh i gjeoreferencuar, xyz, pllaka, hartë slippy, wms, wmts, getcapabilities, shërbim harte, rest, mapserver, imageserver, usgs, national map, atribucion, opacitet
from: 32d7718e
---

Shtresat e hartës janë imazhe që vizatohen nën projektin tuaj: një foto ajrore me world file-in e saj, ose harta nga servera në internet. Janë kontekst vendi vetëm në ekran; **nuk** janë në printimet PDF, eksportet DXF ose DWG, ose pamjen 3D.

Zgjidhni {{ui:Harta}} te grupi {{ui:GIS}}. Dialogu **Shtresat e hartës** liston shtresat e projektit dhe shton të reja. Shtresat e hartës kanë nevojë për sistemin koordinativ të projektit ([Vendosni sistemin koordinativ të projektit](topic:coordinate-systems)), përveç një imazhi, world file-i i të cilit përdor koordinatat e vetë projektit.

## Cilësimi i internetit

CivilCraft nuk i kërkon kurrë asgjë një serveri harte derisa ta lejoni: {{ui:Cilësimet}}, {{ui:CivilCraft}}, **Shtresat e hartës nga interneti**: **Joaktiv** (fillimi) ose **Aktiv**.

:::note
Kur është aktiv, CivilCraft i kërkon serverave të hartave që shtoni imazhe të zonës në ekran. Vizatimi juaj mbetet në këtë kompjuter; serveri e sheh zonën dhe adresën tuaj të internetit.
:::

Ndërsa është joaktiv, shtresat nga interneti listohen në dialog por janë të zbehura, me arsyen, dhe asgjë nuk vizatohet ose kërkohet. Hapja e një projekti që emëron servera hartash gjithashtu nuk i kontakton ata. Një imazh nga një skedar punon në çdo rast. Butoni {{ui:Hap Cilësimet}} i dialogut ju çon atje.

## Një imazh i gjeoreferencuar (funksionon pa internet)

1. Te **Shto një shtresë**, mbajeni **Imazh i gjeoreferencuar** dhe zgjidhni skedarët: imazhin (PNG ose JPEG) **së bashku me** world file-in e tij (`.pgw` për PNG, `.jgw` për JPEG, ose `.wld`) dhe, nëse ka, `.prj`-in e tij. Mund t'i lëshoni edhe mbi planimetri të gjitha bashkë.
2. Pa një `.prj`, CivilCraft pyet cilin sistem përdor world file-i: {{ui:Sistemi i projektit}} (më i zakonshmi), {{ui:Zgjidh një sistem…}}, ose, në një projekt pa sistem, **Koordinatat e projektit**.
3. Imazhi shfaqet nën planimetri dhe {{ui:Përshtat}} e përfshin.

Një GeoTIFF RGB (një foto ajrore e ruajtur si GeoTIFF) mban vetë vendosjen dhe sistemin e vet: hapeni vetëm. Imazhi mbahet **brenda skedarit të projektit** (deri në 25 MB); një më i madh refuzohet me madhësinë e tij, prandaj ruajeni një kopje më të vogël (më pak piksele, ose JPEG).

## Pllaka, WMS, WMTS dhe shërbime harte

Ndizeni fillimisht **Shtresat e hartës nga interneti**. Pastaj, te **Shto një shtresë**:

| Nga | Çfarë ngjitni | Çfarë bën CivilCraft |
|---|---|---|
| URL pllake | Një shabllon me `{z}`, `{x}` dhe `{y}` (ose `{-y}`), dhe `{s}` për një shkronjë serveri, për shembull `https://tile.example.org/{z}/{x}/{y}.png`. Jepini një emër dhe atribucionin e tij. | Pllaka në web Mercator për zonën dhe zmadhimin në ekran. |
| Server WMS | Adresa e serverit, ose lidhja e tij GetCapabilities. Zgjidhni {{ui:Merr shtresat}}, pastaj shtresën. | Një imazh i zonës në ekran, i kërkuar me kodin EPSG të projektit kur serveri e ofron, përndryshe në web Mercator ose WGS 84. |
| Server WMTS | Adresa e serverit, ose `WMTSCapabilities.xml` e tij. Zgjidhni {{ui:Merr shtresat}}, pastaj shtresën dhe grupin e matricës së pllakave. | Pllaka nga grupi në sistemin e projektit kur ka një, përndryshe web Mercator. |
| Shërbim harte ArcGIS (REST) | Një URL që mbaron me `/MapServer` ose `/ImageServer`. Zgjidhni {{ui:Lexo shërbimin}}. | Shërbimet web Mercator me cache vizatohen nga pllakat e tyre; të tjerët kërkohen si një imazh i zonës në ekran. |

Asnjë server nuk vjen i caktuar. Shembuj publikë, të gjithë nga USGS National Map (domen publik):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Shërbim harte: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (gjithashtu `USGSImageryOnly` për foto ajrore)

Shumë departamente GIS të qyteteve dhe qarqeve publikojnë WMS ose shërbimet e tyre të hartave; faqet e tyre GIS japin adresën. Një server që kërkon hyrje ose një çelës nuk punon: CivilCraft nuk dërgon emra përdoruesi, fjalëkalime ose çelësa.

## Si vizatohen shtresat

- Imazhet në një sistem tjetër nga ai i projektit shtrembërohen në të: imazhi priet në copa, secila vendoset ashtu që të jetë brenda një të katërtës së pikselit të ekranit nga ku e vendos një konvertim i saktë.
- Pllakat zgjidhen për zonën në ekran dhe zmadhimin: kurrë më shumë se 64 për një pamje, 6 njëkohësisht. Kur lëvizni ose zmadhoni, kërkesat për pamjen e vjetër anulohen. Rreth 200 pllaka mbahen në memorie (asgjë nuk ruhet në disk).
- Një imazh WMS ose shërbimi harte kërkohet pasi pamja pushon së lëvizuri; derisa të arrijë, i fundit mbetet në vend.
- Atribucioni i çdo shtrese në ekran shfaqet i vogël në këndin e poshtëm djathtas të planimetrisë.

## Ndryshoni, renditni dhe hiqni shtresat

Në dialog çdo shtresë ka një kuadrat për ta shfaqur ose fshehur, një rrëshqitës **Opaciteti**, shigjeta për ta vizatuar më herët (më poshtë) ose më vonë (sipër), një buton zmadhimi (për imazhet) dhe një buton heqjeje. Shtresa e parë në listë vizatohet në fund. Çdo ndryshim është një hap zhbërjeje.

## Kur një shtresë nuk shfaq asgjë

Arsyeja shfaqet një herë në rreshtin e gjendjes dhe mbetet nën emrin e shtresës në dialog:

| Mesazhi | Çfarë të bëni |
|---|---|
| "Off: map layers from the internet are off in Settings." | Ndizni **Shtresat e hartës nga interneti**. |
| "Needs the project's coordinate system" | Vendoseni te {{ui:Koordinatat}}. |
| "The server did not allow this page to use its images (CORS), or could not be reached." | Serveri nuk i lejon faqet e uebit të përdorin imazhet e tij, ose është jashtë funksionit. Pas katër refuzimeve CivilCraft ndalon kërkesat; fshihni dhe shfaqni shtresën për ta provuar përsëri. |
| "The server answered 404 …" / "The server sent text/xml, not an image: …" | URL-ja, shtresa ose stili është gabim, ose mesazhi i serverit thotë çfarë kërkon. |
| "This layer is not offered in the project's system, web Mercator or WGS 84" | Serveri nuk mund të vizatojë aty ku CivilCraft mund ta vendosë. |

## Çfarë u kontrollua

- Numrat e pllakave u kontrolluan me pllakëzimin standard web Mercator; përgjigjet WMS 1.1.1 dhe 1.3.0, WMTS dhe shërbimi harte u lexuan nga skedarë të shkruar me dorë dhe nga përgjigje reale të ruajtura nga serverat USGS National Map dhe terrestris OpenStreetMap; kërkesat WMS 1.3.0 vendosin gjerësinë gjeografike të parë për EPSG:4326, siç thotë standardi.
- Shtrembërimi u krahasua me një konvertim të saktë për çdo piksel përmes numrave të PROJ: brenda 0.13 px për pllaka, imazhe WMS dhe një imazh në madhësi qarku, në shkallën e vendit dhe të zmadhuar.
- Një imazh me world file-in e tij dhe një GeoTIFF RGB i shkruar nga GDAL (përmes rasterio) u vizatuan aty ku thotë vendosja e tyre, u kontrollua piksel pas pikseli në shfletues.
- Në shfletues, kundër një serveri zëvendësues në kompjuterin e testimit: pllakat bien në pllakën ku PROJ e vendos çdo pikë, një imazh WMS bie brenda 2 px, më së shumti 6 kërkesa njëkohësisht, dhe me cilësimin joaktiv asnjë kërkesë nuk del nga faqja. Shërbimi harte i USGS National Map u lexua dhe u vizatua live në shfletues një herë (pllakat arritën dhe u vizatuan, me tekstin e tij të të drejtave); serverat e tjerë publikë u lexuan vetëm nga përgjigje të ruajtura.
