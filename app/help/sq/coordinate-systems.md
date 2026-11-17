---
title: Vendos sistemin e koordinatave të projektit
summary: Thuaj në cilin sistem koordinatash është rilevimi, që CivilCraft të shfaqë gjerësinë dhe gjatësinë, të vendosë skedarët GIS dhe shtresat e hartës, dhe të shkruajë skedarë .prj. Zgjidh sipas kodit, emrit, vetë koordinatave ose nga një skedar .prj.
keywords: sistem koordinatash, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, projeksion, prj, wkt, datum, gjerësi, gjatësi, gjerësi gjatësi, gjeografik, rrjet, georeferencim, cakto sistemin e koordinatave
from: 964250e2
---

Koordinatat e një projekti janë thjesht numra derisa të thoni çfarë do të thonë. Vendosja e sistemit të koordinatave **nuk zhvendos asgjë kurrë**: i thotë CivilCraft-it që, për shembull, E 6,150,000 N 2,080,000 janë koordinata state plane të zonës 6 të Kalifornisë në US survey feet. Pasi ta dijë:

- shiriti i statusit tregon gjerësinë dhe gjatësinë e treguesit,
- skedarët GIS në sisteme të tjera (shapefile, GeoJSON, GeoPackage, rrjete kotash, LiDAR) konvertohen në projekt sapo hapen,
- shtresat e hartës mund të vizatohen nën plan ([Shfaq shtresat e hartës nën plan](topic:map-layers)),
- eksportet në formate GIS mbajnë sistemin (një `.prj` për shapefile, kodi EPSG për GeoPackage dhe GeoTIFF).

## Zgjidh sistemin

1. Zgjidh {{ui:Koordinatat}} në grupin {{ui:GIS}} të shiritit të veglave. Hapet dialogu **Sistemi i koordinatave**. Në krye thotë në çfarë është projekti tani, ose **Asnjë — koordinatat janë thjesht numra**.
2. Gjeje sistemin me një nga këto mënyra:
   - **Kërkimi**: shkruani kodin EPSG (`2277`, `EPSG:2277`) ose fjalë nga emri (`texas central`, `utm 14n`, `lambert-93`). Kodet listohen nga ajo që shkruat; fjalët listojnë sistemet emri i të cilave i ka të gjitha fjalët.
   - {{ui:Sistemet ku përshtaten këto koordinata}} (kur projekti ka pika ose sipërfaqe): CivilCraft lexon mesin e projektit në çdo sistem të familjes së njësive të projektit dhe liston ato sisteme zona e përdorimit të të cilave e përmban atë. Koordinatat state plane zakonisht përshtaten vetëm me disa zona: një projekt në Texas me E 3,115,000 N 10,070,000 US survey feet përshtatet me katër variantet e Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Çdo hyrje tregon ku do të binte mesi i projektit tuaj.
   - **Afër (gjerësi, gjatësi)** dhe {{ui:Sugjero}}: shkruani ku ndodhet vendi, për shembull `30.27, -97.74` ose `30°16′N 97°44′W`, dhe CivilCraft liston sistemet e projektuara zona e të cilave e përmban, me rrjetet kombëtare dhe shtetërore të para.
   - {{ui:Lexo një skedar .prj…}}: hapni `.prj`-në që vjen me një shapefile ose një vizatim. CivilCraft e përputh me listën e vet sipas matematikës së projeksionit (kështu që një `.prj` që emëron ndryshe datumin e gjen sistemin e duhur) dhe thotë cili është; kur asnjë nuk përputhet saktësisht, përdoret përshkrimi i vetë skedarit. Mund ta lëshoni gjithashtu një `.prj` mbi dialog, ose ta hapni ose lëshoni një mbi plan vetë.
3. Kliko një sistem në listë. Nën **Zgjedhur** shfaqet emri, kodi EPSG, njësia, sa mirë është lidhur datumi i tij me WGS 84, zona e përdorimit në gjerësi dhe gjatësi, dhe ku bie mesi i projektit tuaj.
4. Lëre **Rrjet** të zgjedhur (shumica e projekteve; shih [Terreni dhe koordinatat lokale](topic:ground-and-local-coordinates) për të tjerat) dhe zgjidh {{ui:Apliko}}.

Shiriti i statusit tani tregon gjerësinë dhe gjatësinë e treguesit pranë L dhe V. Vendosja e sistemit është një hap zhbërjeje: {{key:Mod+Z}} e kthen mbrapsht.

:::note
Njësitë duhet të përputhen: një projekt në këmbë merr sisteme në US survey feet ose në international feet, një projekt në metra merr sisteme në metra. CivilCraft shpjegon një refuzim ("Projekti është në këmbë, por ky sistem është në metra…"). Një projekt në këmbë me sistem US survey foot përdor survey feet: "ft" i projektit do të thotë këmba e sistemit. Sistemet gjeografike (gjerësi dhe gjatësi, si vetë WGS 84) nuk mund të jenë sistem i një projekti: vizatimet kanë nevojë për lindje dhe veri.
:::

## Ndrysho ose hiq sistemin

Hap përsëri {{ui:Koordinatat}}, zgjidh një sistem tjetër dhe zgjidh {{ui:Apliko}}. Kur projekti ka pika ose projektim, CivilCraft pyet **A janë koordinatat në … tashmë?**

- {{ui:Po — asgjë nuk zhvendoset}}: numrat mbeten ashtu si janë dhe ndryshon vetëm kuptimi i tyre. Përdoreni kur sistemi i vjetër u zgjodh gabimisht.
- {{ui:Jo — konverto ato}}: çdo pikë rilevimi, vijë e thyerjes, kufi, PI e aksit rrugor, qoshe platforme dhe strukturë konvertohet nga sistemi i vjetër në të riun, në një hap zhbërjeje. Një sipërfaqe e lexuar nga LandXML si trekëndësha nuk mund të konvertohet; ndërtojeni përsëri nga pikat fillimisht.

{{ui:Hiq sistemin}} e heq sistemin (asgjë nuk zhvendoset). Shtresat GIS që janë tashmë në projekt mbeten aty ku janë.

## Gjerësia dhe gjatësia në shiritin e statusit

Ndërsa projekti ka një sistem, shiriti i statusit tregon gjerësinë dhe gjatësinë e treguesit në WGS 84, për shembull `30°18′00.00″ N  97°42′00.00″ W`. Për gradë dhjetore zgjidhni {{ui:Cilësimet}}, {{ui:CivilCraft}}, **Gjerësia dhe gjatësia** ([Cilësimet e CivilCraft](topic:settings)). Me koordinata terreni ose lokale, leximi kalon fillimisht nëpër atë hap, kështu që është i saktë për pikën nën tregues.

## Sa mirë është zhvendosja e datumit

Gjerësia, gjatësia, GeoJSON dhe shtresat e hartës janë të gjitha në WGS 84. Lidhja e secilit sistem me WGS 84 tregohet në dialog:

| Çfarë thotë dialogu | Çfarë do të thotë |
|---|---|
| WGS 84 vetë | Asnjë zhvendosje fare. |
| NAD83 merret si WGS 84 | Të dyja ndryshojnë me një ose dy metra në pjesën më të madhe të Amerikës së Veriut, me disa metra më së shumti. Mirë për shtresat e hartës dhe kontekstin e vendit; jo për pikat e kontrollit të rilevimit. |
| Njohur për rreth *n* m (shifra e EPSG) | Një zhvendosje e publikuar; shtresat e hartës dhe GeoJSON mund të devijojnë për rreth aq. |
| Nuk njihet për këtë datum | Nuk ka zhvendosje të publikuar pa një skedar rrjeti: shtresat e hartës dhe GeoJSON mund të devijojnë me qindra metra. |
| Nga skedari i zhvendosjes së rrjetit … | Një skedar zhvendosjeje rrjeti është në përdorim (më poshtë): brenda rreth 10 cm nga NAD83 brenda rrjetit. |

Koordinatat e vetë projektit tuaj nuk kalojnë kurrë nëpër zhvendosje datumi: vetëm ajo që konvertohet në ose nga gjerësia dhe gjatësia. Datumet vertikale dhe modelet e gjeoidit nuk trajtohen (kotat nuk konvertohen kurrë). Aty ku zhvendosja më e mirë kërkon një skedar rrjeti, lista jep një zhvendosje më të trashë të publikuar dhe dialogu tregon saktësinë e saj (sistemet NAD27, për shembull, rreth 20 m), derisa të shtoni rrjetin.

## Skedarët e zhvendosjes së rrjetit

Për një sistem NAD27, **Skedari i zhvendosjes së rrjetit** në dialogun e sistemit të koordinatave e sjell gjerësinë dhe gjatësinë, skedarët GIS dhe shtresat e hartës brenda rreth 10 cm nga NAD83 në vend të rreth 20 m:

- **Shkarko** rrjetin që sugjeron për zonën e sistemit (NADCON5 për Shtetet e Bashkuara të ngjitura, NADCON për Alaskën, NTv2 për Kanadanë) nga cdn.proj.org, serveri publik i rrjeteve të PROJ. Vetëm emri i skedarit të rrjetit dërgohet.
- Ose **Shto një skedar rrjeti…** që keni tashmë: NTv2 (`.gsb`) ose një rrjet GeoTIFF PROJ (`.tif`), deri në 20 MB.

Rrjeti ruhet në skedarin e projektit, kështu që udhëton me projektin. Seksioni thotë nëse mesi i projektit është brenda rrjetit: jashtë tij, nuk aplikohet fare zhvendosje, prandaj përdorni një rrjet që mbulon vendin. **Ndalo përdorimin e rrjetit** kthehet te zhvendosja e trashë. Çdo ndryshim është një hap: {{key:Mod+Z}} e zhbën.

Shtresat GIS që janë tashmë në projekt mbeten aty ku janë kur ndryshon rrjeti; importojini përsëri për t'i vendosur përmes rrjetit. Koordinatat e vetë projektit nuk zhvendosen kurrë.

## Ç'u kontrollua

- Çdo konvertim u krahasua me PROJ (pyproj 3.7.1 me PROJ 9.5.1), bibliotekën e koordinatave që përdor shumica e programeve GIS, në mbi 330 sisteme: state plane në US survey feet dhe feet, UTM veri dhe jug, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator dhe web Mercator, midis të tjerave. Lindja dhe veriu përputhen deri në 1 cm me të njëjtën zhvendosje datumi (shumica shumë më pak se 1 mm), dhe matematika e projeksionit përputhet me përkufizimet e vetë PROJ deri në 1 cm.
- Skedarët `.prj` të shkruar nga PROJ në dy format e zakonshme (ESRI dhe OGC) u lexuan përsëri për 105 sisteme: 208 nga 210 u përputhën me kodin e tyre të saktë EPSG dhe të tjerët dy me një sistem me të njëjtën matematikë në të njëjtin elipsoid. Skedarët `.prj` që shkruan CivilCraft lexohen nga PROJ si i njëjti sistem. Skedarët ESRI `.prj` për sistemet stereografike polare (UPS, polar i Alaskës) nuk mund të lexohen; zgjidhni ato sisteme sipas kodit.
- Koordinatat e gjerësisë dhe gjatësisë në shiritin e statusit u përputhën me PROJ deri në 0.01″ në shfletues.
