---
title: Nustatyti projekto koordinačių sistemą
summary: Nurodykite, kokioje koordinačių sistemoje yra topografija, kad CivilCraft rodytų platumą ir ilgumą, dėliotų GIS failus bei žemėlapių sluoksnius ir rašytų .prj failus. Pasirinkite pagal kodą, pavadinimą, pačias koordinates arba iš .prj failo.
keywords: koordinačių sistema, crs, epsg, srid, valstybinė plokštuma, spcs, utm, nad83, wgs 84, projekcija, prj, wkt, datumas, platuma, ilguma, platuma ilguma, geografinis, tinklelis, georeferencija, georeferencavimas, priskirti koordinačių sistemą
from: 964250e2
---

Projekto koordinatės yra tik skaičiai, kol nenurodote, ką jie reiškia. Koordinačių sistemos nustatymas **niekada nieko nepajudina**: jis tik sako CivilCraft, kad, pavyzdžiui, E 6,150,000 N 2,080,000 yra Kalifornijos 6 zonos valstybinės plokštumos koordinatės US survey feet vienetais. Kai sistema žinoma:

- būsenos juostoje rodoma žymeklio platuma ir ilguma,
- kitose sistemose esantys GIS failai (shapefile, GeoJSON, GeoPackage, aukščių tinkleliai, LiDAR) konvertuojami į projektą atidarant,
- žemėlapių sluoksnius galima nubrėžti po planu ([Rodyti žemėlapių sluoksnius po planu](topic:map-layers)),
- eksportai į GIS formatus perduoda sistemą (`.prj` shapefile formatui, EPSG kodas GeoPackage ir GeoTIFF formatams).

## Pasirinkti sistemą

1. Grupėje {{ui:GIS}} įrankių juostoje pasirinkite {{ui:Koordinatės}}. Atsidaro dialogas **Koordinačių sistema**. Viršuje rašoma, kokioje sistemoje projektas yra dabar, arba **Nėra – koordinatės tik skaičiai**.
2. Raskite sistemą vienu iš šių būdų:
   - **Paieška**: įveskite EPSG kodą (`2277`, `EPSG:2277`) arba žodžius iš pavadinimo (`texas central`, `utm 14n`, `lambert-93`). Kodai rodomi nuo to, ką įvedėte; žodžiai rodo sistemas, kurių pavadinime yra visi žodžiai.
   - {{ui:Sistemos, kurioms tinka šios koordinatės}} (kai projekte yra taškų arba paviršius): CivilCraft apskaičiuoja projekto vidurį visose to projekto vieneto šeimos sistemose ir išvardija tas, kurių naudojimo sritis jį apima. Valstybinės plokštumos koordinatės paprastai tinka tik keliems zonoms: Teksaso projektas E 3,115,000 N 10,070,000 US survey feet tinka keturiems Texas Central variantams (NAD83, NAD83(2011), HARN, NSRS2007). Kiekviename įraše rodoma, kur būtų projekto vidurys.
   - **Arti (platuma, ilguma)** ir {{ui:Siūlyti}}: įveskite, kur yra vietovė, pavyzdžiui `30.27, -97.74` arba `30°16′N 97°44′W`, ir CivilCraft išvardija projektines sistemas, kurių sritis ją apima, pirmiausia nacionalinius ir valstijų tinklelius.
   - {{ui:Skaityti .prj failą…}}: atidarykite `.prj` failą, kuris pridedamas prie shapefile ar brėžinio. CivilCraft jį suderina su savo sąrašu pagal projekcijos matematiką (todėl `.prj` failas, kuriame datumas pavadintas kitaip, vis tiek suras tinkamą sistemą) ir nurodo, kuri tai yra; jei niekas tiksliai neatitinka, naudojamas paties failo aprašymas. Taip pat galite nutempti `.prj` ant dialogo arba atidaryti ar nutempti jį ant paties plano.
3. Spustelėkite sistemą sąraše. Skiltyje **Pasirinkta** rodomas jos pavadinimas, EPSG kodas, vienetas, kaip gerai jos datumas susietas su WGS 84, jos naudojimo sritis platumos ir ilgumos išraiškoje bei kur yra projekto vidurys.
4. Palikite pažymėtą **Tinklelis** (dauguma projektų; kitus žr. [Žemės ir vietinės koordinatės](topic:ground-and-local-coordinates)) ir spustelėkite {{ui:Taikyti}}.

Būsenos juostoje dabar rodoma žymeklio platuma ir ilguma šalia E ir N. Sistemos nustatymas yra vienas anuliavimo žingsnis: {{key:Mod+Z}} jį anuliuoja.

:::note
Vienetai turi sutapti: pėdomis išreikštas projektas priima sistemas US survey feet arba international feet, metrais išreikštas projektas – sistemas metrais. CivilCraft paaiškina atsisakymą („Projektas išreikštas pėdomis, bet ši sistema – metrais…“). Pėdų projektas su US survey foot sistema naudoja survey feet: projekto „ft“ reiškia sistemos pėdą. Geografinės sistemos (platuma ir ilguma, pavyzdžiui pati WGS 84) negali būti projekto sistema: brėžiniams reikia rytinių ir šiaurinių koordinačių.
:::

## Pakeisti arba pašalinti sistemą

Vėl atidarykite {{ui:Koordinatės}}, pasirinkite kitą sistemą ir spustelėkite {{ui:Taikyti}}. Kai projekte yra taškų arba projektas, CivilCraft klausia **Ar koordinatės jau yra…?**

- {{ui:Taip — niekas nejuda}}: skaičiai lieka tokie patys, keičiasi tik jų reikšmė. Naudokite, kai sena sistema buvo pasirinkta per klaidą.
- {{ui:Ne — konvertuoti}}: kiekvienas topografinis taškas, lūžio linija, riba, trasos PI, aikštelės kampas ir konstrukcija konvertuojami iš senos sistemos į naują vienu anuliavimo žingsniu. Paviršiaus, nuskaityto iš LandXML kaip trikampiai, konvertuoti negalima; pirmiausia jį iš naujo sukurkite iš taškų.

{{ui:Pašalinti sistemą}} pašalina sistemą (nieko nejuda). GIS sluoksniai, jau esantys projekte, lieka ten, kur buvo.

## Platuma ir ilguma būsenos juostoje

Kol projektas turi sistemą, būsenos juostoje rodoma žymeklio platuma ir ilguma WGS 84 sistemoje, pavyzdžiui `30°18′00.00″ N  97°42′00.00″ W`. Jei norite dešimtainių laipsnių, pasirinkite juos skiltyje {{ui:Parametrai}}, {{ui:CivilCraft}}, **Platuma ir ilguma** ([CivilCraft nustatymai](topic:settings)). Su žemės ar vietinėmis koordinatėmis rodinys pirmiausia eina per tą žingsnį, todėl jis teisingas žymeklio taškui.

## Datumo poslinkio kokybė

Platuma, ilguma, GeoJSON ir žemėlapių sluoksniai visi pateikiami WGS 84 sistemoje. Kiekvienos sistemos susiejimas su WGS 84 rodomas dialoge:

| Ką rodo dialogas | Ką tai reiškia |
|---|---|
| WGS 84 pati | Jokio poslinkio. |
| NAD83 laikoma WGS 84 | Abi sistemos daugumoje Šiaurės Amerikos skiriasi vienu ar dviem metrais, daugiausia keliais metrais. Tinka žemėlapių sluoksniams ir vietovės kontekstui; netinka geodezinei kontrolei. |
| Žinoma maždaug *n* m (EPSG skaičius) | Paskelbtas poslinkis; žemėlapių sluoksniai ir GeoJSON gali nukrypti maždaug tiek. |
| Šiam datumui nežinoma | Be tinklelio failo paskelbto poslinkio nėra: žemėlapių sluoksniai ir GeoJSON gali nukrypti šimtais metrų. |
| Iš tinklelio poslinkio failo … | Naudojamas tinklelio poslinkio failas (žr. žemiau): tinklelio viduje tikslumas maždaug 10 cm nuo NAD83. |

Projekto koordinatės niekada neeina per datumo poslinkį: jį patiria tik tai, kas konvertuojama į platumą ir ilgumą arba iš jos. Vertikalūs datumai ir geoidų modeliai nėra apdorojami (aukščiai niekada nekonvertuojami). Ten, kur geriausiam poslinkiui reikia tinklelio failo, sąraše pateikiamas grubesnis paskelbtas poslinkis, o dialoge rodomas jo tikslumas (pavyzdžiui, NAD27 sistemoms apie 20 m), kol nepridedate tinklelio.

## Tinklelio poslinkio failai

NAD27 sistemai koordinačių sistemos dialogo laukas **Tinklelio poslinkio failas** priartina platumą, ilgumą, GIS failus ir žemėlapių sluoksnius prie NAD83 maždaug 10 cm tikslumu, o ne maždaug 20 m:

- **Atsisiųskite** tinklelį, kurį pasiūlo sistemos sričiai (NADCON5 – žemyninei JAV, NADCON – Aliaskai, NTv2 – Kanadai), iš cdn.proj.org, PROJ viešojo tinklelio serverio. Siunčiamas tik tinklelio failo pavadinimas.
- Arba **Pridėti tinklelio failą…**, jei jį jau turite: NTv2 (`.gsb`) arba PROJ GeoTIFF tinklelis (`.tif`), iki 20 MB.

Tinklelis išsaugomas projekto faile, todėl keliauja kartu su projektu. Skiltyje nurodoma, ar projekto vidurys yra tinklelio viduje: už jo jokio poslinkio netaikoma, todėl naudokite tinklelį, kuris apima vietovę. **Nustoti naudoti tinklelį** grąžina grubų poslinkį. Kiekvienas pakeitimas – vienas žingsnis: {{key:Mod+Z}} jį anuliuoja.

GIS sluoksniai, jau esantys projekte, pakeitus tinklelį lieka ten, kur buvo; kad juos patalpintumėte per tinklelį, importuokite iš naujo. Projekto koordinatės niekada nepajuda.

## Ką patikrinome

- Kiekvienas konvertavimas palygintas su PROJ (pyproj 3.7.1 su PROJ 9.5.1), koordinačių biblioteka, kurią naudoja dauguma GIS programų, daugiau nei 330 sistemų: valstybinės plokštumos US survey feet ir feet vienetais, UTM šiaurės ir pietų, Lambert-93, British National Grid, GDA2020 MGA, Naujosios Zelandijos skersinė Merkatoriaus ir žiniatinklio Merkatoriaus. Rytinės ir šiaurinės koordinatės sutampa iki 1 cm su tuo pačiu datumo poslinkiu (dauguma – gerokai mažiau nei 1 mm), o projekcijos matematika sutampa su PROJ apibrėžimais iki 1 cm.
- `.prj` failai, kuriuos PROJ rašo abiem įprastomis formomis (ESRI ir OGC), buvo perskaityti atgal 105 sistemoms: 208 iš 210 tiksliai atitiko savo EPSG kodą, o kitos dvi – sistemą su ta pačia matematika tame pačiame elipsoide. CivilCraft rašomi `.prj` failai PROJ perskaitomi kaip ta pati sistema. ESRI `.prj` failų polinėms stereografinėms sistemoms (UPS, Aliaskos polinė) skaityti negalima; tas sistemas pasirinkite pagal kodą.
- Platuma ir ilguma būsenos juostoje naršyklėje sutapo su PROJ iki 0.01″.
