---
title: Projekti koordinaatsüsteemi määramine
summary: Ütle, mis koordinaatsüsteemis mõõdistus on, et CivilCraft näitaks laiuskraadi ja pikkuskraadi, paigutaks GIS-failid ja kaardikihid ning kirjutaks .prj-faile. Vali koodi, nime, koordinaatide enda või .prj-faili järgi.
keywords: koordinaatsüsteem, crs, epsg, srid, riigi tasandikoordinaadid, spcs, utm, nad83, wgs 84, projektsioon, prj, wkt, datum, laiuskraad, pikkuskraad, lat long, geograafiline, ruudustik, georefereerimine, koordinaatsüsteemi määramine
from: 964250e2
---

Projekti koordinaadid on lihtsad arvud, kuni ütled, mida need tähendavad. Koordinaatsüsteemi määramine **ei liiguta midagi**: see ütleb CivilCraftile näiteks, et I 6,150,000 P 2,080,000 on Kalifornia 6. tsooni riigi tasandikoordinaadid USA mõõdistusjalgades. Kui see on teada:

- olekuriba näitab kursori laiuskraadi ja pikkuskraadi,
- teistes süsteemides olevad GIS-failid (shapefile, GeoJSON, GeoPackage, kõrgusruudustikud, LiDAR) teisendatakse avamisel projektiks,
- kaardikihte saab joonistada plaani alla ([Kaardikihtide näitamine plaani all](topic:map-layers)),
- GIS-vormingutesse eksportimine kannab süsteemi kaasa (shapefile'i jaoks `.prj`, GeoPackage'i ja GeoTIFFi jaoks EPSG-kood).

## Süsteemi valimine

1. Vali tööriistariba rühmas {{ui:GIS}} {{ui:Koordinaadid}}. Avaneb dialoog **Koordinaatsüsteem**. Üleval öeldakse, mis on projekt praegu, või **Puudub — koordinaadid on lihtsalt arvud**.
2. Leia süsteem ühel neist viisidest:
   - **Otsing**: sisesta EPSG-kood (`2277`, `EPSG:2277`) või sõnu nimest (`texas central`, `utm 14n`, `lambert-93`). Koodid loetletakse sisestatu järgi; sõnade järgi loetletakse süsteemid, kelle nimes on kõik sõnad.
   - {{ui:Need koordinaadid sobivad süsteemidega}} (kui projektil on punkte või pind): CivilCraft loeb projekti keskkohta kõigis projekti ühikuperekonna süsteemides ja loetleb need, mille kasutusala seda hõlmab. Riigi tasandikoordinaadid sobivad tavaliselt vaid mõnele tsoonile: Texase projekt I 3,115,000 P 10,070,000 USA mõõdistusjalgades sobib neljale Texas Centrali variandile (NAD83, NAD83(2011), HARN, NSRS2007). Iga kirje näitab, kus projekti keskpunkt selles asuks.
   - **Lähedal (laiuskraad, pikkuskraad)** ja {{ui:Soovita}}: sisesta, kus objekt asub, näiteks `30.27, -97.74` või `30°16′N 97°44′W`, ja CivilCraft loetleb projitseeritud süsteemid, mille ala seda hõlmab, riigi- ja osariigi ruudustikud esimesena.
   - {{ui:Loe .prj-fail…}}: ava shapefile'iga või joonisega kaasas olnud `.prj`. CivilCraft seob selle oma loendiga projektsiooniarvutuse järgi (nii et `.prj`, mis nimetab datumi teisiti, leiab siiski õige süsteemi) ja ütleb, milline see on; kui täpset vastet ei leita, kasutatakse faili enda kirjeldust. `.prj`-faili võib lohistada ka dialoogile või avada ja lohistada plaanile eraldi.
3. Klõpsa loendis süsteemil. Jaotises **Valitud** näidatakse nime, EPSG-koodi, ühikut, seda, kui hästi on selle datum seotud WGS 84-ga, selle kasutusala laiuskraadis ja pikkuskraadis ning kus projekti keskpunkt selles asub.
4. Jäta **Ruudustik** valituks (enamiku projektide puhul; teiste kohta vaata [Maapinna ja kohalikud koordinaadid](topic:ground-and-local-coordinates)) ja vali {{ui:Rakenda}}.

Olekuriba näitab nüüd kursori laiuskraadi ja pikkuskraadi I ja P kõrval. Süsteemi määramine on üks võtmistagasi samm: {{key:Mod+Z}} võtab selle tagasi.

:::note
Ühikud peavad klappima: jalgades projekt võtab süsteeme USA mõõdistusjalgades või rahvusvahelistes jalgades, meetrites projekt võtab süsteeme meetrites. CivilCraft selgitab keeldumist („Projekt on jalgades, kuid see süsteem on meetrites …“). Jalgades projekt USA mõõdistusjala süsteemiga kasutab mõõdistusjalgu: projekti „ft“ tähendab süsteemi jalga. Geograafilisi süsteeme (laiuskraad ja pikkuskraad, nagu WGS 84 ise) ei saa projekti süsteemiks määrata: joonistel on vaja idakoordinaate ja põhjakoordinaate.
:::

## Süsteemi muutmine või eemaldamine

Ava {{ui:Koordinaadid}} uuesti, vali teine süsteem ja vali {{ui:Rakenda}}. Kui projektil on punkte või projekt, küsib CivilCraft **Kas koordinaadid on juba … süsteemis?**

- {{ui:Jah — midagi ei liigu}}: numbrid jäävad samaks ja muutub ainult nende tähendus. Kasuta seda, kui vana süsteem valiti eksikombel.
- {{ui:Ei — teisenda need}}: iga mõõdistuspunkt, murdejoon, piir, trassi PI, platsi nurk ja rajatis teisendatakse vanast süsteemist uude ühe võtmistagasi sammuna. LandXML-ist loetud pinda kolmnurkadena ei saa teisendada; koosta see esmalt uuesti punktidest.

{{ui:Eemalda süsteem}} eemaldab süsteemi (midagi ei liigu). Projektis juba olevad GIS-kihid jäävad oma kohale.

## Laiuskraad ja pikkuskraad olekuribal

Kui projektil on süsteem, näitab olekuriba kursori laiuskraadi ja pikkuskraadi WGS 84 järgi, näiteks `30°18′00.00″ N  97°42′00.00″ W`. Kümnendkraadid saab valida jaotises {{ui:Sätted}}, {{ui:CivilCraft}}, **Laiuskraad ja pikkuskraad** ([CivilCrafti sätted](topic:settings)). Maapinna või kohalike koordinaatide korral läbib näit kõigepealt selle sammu, nii et see on õige kursori all oleva punkti kohta.

## Datumi nihke täpsus

Laiuskraad, pikkuskraad, GeoJSON ja kaardikihid on kõik WGS 84-s. Iga süsteemi side WGS 84-ga on näidatud dialoogis:

| Mida dialoog ütleb | Mida see tähendab |
|---|---|
| WGS 84 ise | Nihet ei ole üldse. |
| NAD83 võetakse WGS 84 järgi | Need erinevad enamikus Põhja-Ameerikas meetri või kahe võrra, kõige rohkem mõne meetri. Sobib kaardikihtide ja asukohakonteksti jaoks, mitte mõõdistusvõrgu jaoks. |
| Umbes *n* m täpne (EPSG andmed) | Avaldatud nihe; kaardikihid ja GeoJSON võivad olla umbes nii palju valed. |
| Selle datumi kohta ei ole teada | Avaldatud nihet ei ole ilma ruudustiku failita: kaardikihid ja GeoJSON võivad olla valed sadade meetrite võrra. |
| Ruudustiku nihkefailist … | Kasutusel on ruudustiku nihkefail (allpool): ruudustiku sees umbes 10 cm piires NAD83-st. |

Projekti enda koordinaadid ei läbi kunagi datumi nihet: ainult see, mis teisendatakse laiuskraadiks või sealt tagasi, läbib selle. Vertikaalseid datume ja geoidimudeleid ei käsitleta (kõrgusi ei teisendata kunagi). Kui parim nihe vajab ruudustiku faili, näitab loend karedamat avaldatud nihet ja dialoog näitab selle täpsust (NAD27 süsteemidel näiteks umbes 20 m), kuni lisad ruudustiku.

## Ruudustiku nihkefailid

NAD27 süsteemi puhul viib dialoogis **Ruudustiku nihkefail** laiuskraadi, pikkuskraadi, GIS-failid ja kaardikihid umbes 10 cm piires NAD83-st, mitte umbes 20 m piires:

- **Laadi alla** ruudustik, mida see soovitab süsteemi alale (NADCON5 USA mandriosale, NADCON Alaskale, NTv2 Kanadale) cdn.proj.org-ist, PROJ-i avalikust ruudustikuserverist. Saadetakse ainult ruudustiku failinimi.
- Või **Lisa ruudustiku fail…**, kui sul on see juba olemas: NTv2 (`.gsb`) või PROJ GeoTIFF-ruudustik (`.tif`), kuni 20 MB.

Ruudustik salvestatakse projektifaili, nii et see liigub projektiga kaasas. Jaotis ütleb, kas projekti keskpunkt on ruudustikus: väljaspool seda ei rakendata nihet üldse, seega kasuta ruudustikku, mis katab objekti. **Lõpeta ruudustiku kasutamine** läheb tagasi karedale nihkele. Iga muudatus on üks samm: {{key:Mod+Z}} võtab selle tagasi.

GIS-kihid, mis on projektis juba olemas, jäävad oma kohale, kui ruudustik muutub; impordi need uuesti, et need paigutada ruudustiku kaudu. Projekti enda koordinaadid ei liigu kunagi.

## Mida kontrolliti

- Iga teisendust võrreldi PROJ-iga (pyproj 3.7.1 koos PROJ 9.5.1-ga), koordinaatide teegiga, mida enamik GIS-programme kasutab, enam kui 330 süsteemil: riigi tasandikoordinaadid USA mõõdistusjalgades ja jalgades, UTM põhja- ja lõunapoolkeral, Lambert-93, British National Grid, GDA2020 MGA, Uus-Meremaa Transverse Mercator ja veebi-Mercator muuhulgas. Idakoordinaadid ja põhjakoordinaadid klapivad 1 cm täpsusega sama datumi nihkega (enamik alla 1 mm) ning projektsiooniarvutused klapivad PROJ-i enda määratlustega 1 cm täpsusega.
- PROJ-i kirjutatud `.prj`-failid mõlemas levinud vormis (ESRI ja OGC) loeti tagasi 105 süsteemi jaoks: 210st 208 klappisid täpselt oma EPSG-koodiga ja kaks teised samade arvutustega samal ellipsoidil oleva süsteemiga. CivilCrafti kirjutatud `.prj`-faile loeb PROJ samaks süsteemiks. ESRI `.prj`-faile polaarstereograafilistele süsteemidele (UPS, Alaska polaarsüsteem) ei saa lugeda; vali need süsteemid koodi järgi.
- Olekuriba laiuskraad ja pikkuskraad klappisid brauseris PROJ-iga 0.01″ täpsusega.
