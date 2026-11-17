---
title: Ogled lokacije v 3D
summary: Odprite pogled 3D, kroženje, pomik in povečavo, nastavite navpično povečavo in barvanje, izberite, kaj se prikaže, ter kliknite trase, ploščadi, karakteristične črte, prelomnice, cevi, objekte in točke za izbiro.
keywords: oznake, 3d oznake, oznake, obrnjene proti kameri, oznake postaj, oznake plastnic, oznake točk, drapiranje, pogled iz zraka, kartni sloji na površju, 3d, tri d, pogled 3D, kocka pogleda, kompas, kroženje, perspektiva, vzporedna projekcija, izometrija, iso, navpična povečava, teren, model, model lokacije, vožnja, vizualizacija, upodobitev, cevi v 3D, objekti, jaški, koridor v 3D, cesta v 3D, vozna površina, vozni pasovi, robniki, pločniki, rastline v 3D, drevesa v 3D, grmi, žive meje, krajinsko 3D, rampe v 3D, stopnice, zidovi, tlakovanje, trdo tlakovanje 3D
from: a16bafe1
---

Pogled 3D prikaže lokacijo kot en model: obstoječi teren in izravnano površje, plastnice, položene nanju, prelomnice in rob površja, vsako trasa na njenem projektnem profilu z oznakami stacionaž, karakteristične črte koridorja in samo cesto (vozne pasove, bankine, jarke, robnike, pasove in pločnike, vsak v svoji barvi), ploščadi s svojimi črtami preseka, omrežje cevi s cevmi in objekti na njihovih pravih kotah ter iz delovnega okolja Landscape rastline, tlakovanje, poti, zidove, robnike, rampe in stopnice. Bere isti projekt kot tloris, zato se vsaka sprememba pokaže v obeh.

## Odprite pogled 3D

1. Odprite geodetske točke (ali LandXML ali datoteko projekta), da obstaja površje. Same rastline, tlakovanje ali rampe so dovolj, da se tudi odpre.
2. Pritisnite {{key:D}} ali kliknite {{ui:3D}} v skupini {{ui:Pogled}} orodne vrstice.
   Pogled 3D se odpre čez tloris in gleda celotno lokacijo z jugovzhoda. Prvič se naloži nekaj trenutkov.
3. Ponovno pritisnite {{key:D}} ali znova kliknite {{ui:3D}}, da se vrnete na tloris. Izbira orodja za risanje, kot je {{ui:Trasa}} ali {{ui:Ploščad}}, prav tako preklopi nazaj na tloris, saj risanje poteka tam.

## Premikanje

| Za | Naredite to |
|---|---|
| Kroženje | Povlecite z levim ali srednjim gumbom |
| Pomik | Povlecite z desnim gumbom ali pritisnite {{key:Shift}} in povlecite |
| Povečava | Zavrtite kolešček; povečava gre proti kazalcu |
| Kroženje na sledilni ploščici | Podrsajte z dvema prstoma ({{key:Shift}} in podrsanje premakne) |
| Povečava na sledilni ploščici | Stisnite |
| Dotik | En prst kroži; dva prsta stisnete za povečavo in premaknete za pomik |
| Tipke (pogled ima fokus) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} krožijo, s {{key:Shift}} premikajo; {{key:Plus}} in {{key:Minus}} povečujeta |

Vrstica nad pogledom ima ostalo:

- Seznam pogledov: **Iso**, **Zgoraj**, **Spodaj**, **Spredaj** (gleda proti severu), **Zadaj**, **Levo**, **Desno**.
- {{ui:Perspektiva}}: pritisnjeno je perspektivni pogled; kliknite za vzporedno projekcijo (brez skrajšanja).
- {{ui:Obseg}}: znova prikaže vse. {{key:F}} stori isto, medtem ko je pogled 3D odprt.

## Kocka pogleda

Kocka pogleda v desnem zgornjem kotu se obrne s pogledom. Kliknite stran, rob ali oglišče za gledanje na lokacijo od tam (kamera se obrne gladko, razen če vaš sistem zahteva zmanjšano gibanje). Povlecite kocko za kroženje. Kompasni obroč pod njo kaže sever (mrežni sever, +Y): povlecite obroč, da obrnete lokacijo okoli navpične osi, ali kliknite N, E, S ali W za gledanje s te strani. {{ui:Domov}}, majhna hiška v njenem zgornjem levem kotu, se vrne na izometrični pogled celotne lokacije. S tipkovnico: {{key:Tab}} do kocke, puščice izberejo stran, rob ali oglišče, {{key:Enter}} gleda od tam.

Na tlorisu ista kocka kaže zgornjo stran. Kliknite katero koli drugo stran, rob ali oglišče (ali jo povlecite), da odprete pogled 3D z gledanjem od tam: to je najhitrejša pot v 3D iz dane smeri. Za zamenjavo kocke z majhno ikono osi ali za njeno skrivanje glejte **Indikator vogala** v [Nastavitve CivilCraft](topic:settings).

## Povečajte višine

Lokacije so običajno veliko širše kot višje, zato so višine privzeto raztegnjene za **2×**. Izberite **1×**, **2×**, **3×**, **5×** ali **10×** v seznamu na vrstici ali pod **Navpična povečava v 3D** v [Nastavitve CivilCraft](topic:settings) (oba sta ena nastavitev). Spremeni se samo pogled: prostornine, profili in izvozi ostanejo v pravem merilu.

## Barvanje površin

- **Pasovi višin**: enaki pasovi in barve kot pasovi višin na tlorisu (število pasov se nastavi pod **Prikaz** v levem podoknu). Vsak rob pasu je natančno prirezan pri svoji višini.
- **Ena barva**: obstoječi teren in izravnana površina vsak v enotni barvi.
- **Kartni sloji**: kartni sloji, prikazani pod tlorisom (georeferencirana slika, kartne ploščice ali kartni servis; glejte [Kartni sloji](topic:map-layers)), položeni na površja kot list, tako da zračna fotografija pokaže na hribih. Slike, ki še prihajajo, se zapolnjujejo, ko pridejo. Brez prikazanega kartnega sloja površja ohranijo svoje pasove višin, pogled pa to pove. Slika je za zaslon: izvoza GLB in OBJ je ne vsebujeta.

Kadar sta prikazani obe površini, je obstoječi teren prosojen nad izravnano površino, tako da vidite izkop (teren nad projektom) in nasip.

## Izberite, kaj se prikaže

Kliknite {{ui:Pokaži}} na vrstici in označite ali počistite:

| Element | Kaj je |
|---|---|
| Obstoječi teren | Površje, zgrajeno iz geodetskih točk (ali prebrano iz LandXML) |
| Izravnana površina | Obstoječi teren z vgrajenimi koridorji in ploščadmi (samo kadar jih ni) |
| Robovi trikotnikov | Vsak rob TIN kot črte |
| Plastnice | Tanke in debele plastnice vsake prikazane površine pri intervalu tlorisa |
| Rob površja | Zunanji rob vsake prikazane površine pri njenih kotah |
| Prelomnice | Vsaka prelomnica pri svojih kotah |
| Trase in postaje | Vsaka trasa na projektnem profilu (na terenu, kjer ni profila) z oznakami na vsakih 50 ft ali 20 m |
| Karakteristične črte koridorja | Rob vozišča, bankina in črta preseka na obeh straneh |
| Vozne površine | Cesta, ki jo gradi vsak koridor iz svoje sestave: vozni pasovi, bankine, jarki, robniki, pasovi in pločniki, vsak v svoji barvi, na izravnani površini |
| Rastline | Vsaka rastlina ter rastline v gredicah in živih mejah kot preprosta telesa po velikosti iz seznama rastlin: drevo je deblo in okrogla krošnja (stožec za iglavec, čop na visokem deblu za palmo), grmi, rastline za živo mejo, trajnice in pokrovnice so kupole, trave so šopi, plezalke so tanki stebrički. Stojijo na izravnani površini (ali obstoječem terenu) v velikosti, ki jo kaže tloris: zrele ali ob sajenju |
| Trdo tlakovanje | Tlakovanje in poti z njihovimi padci, zidovi, robniki, stopnice in rampe, ki se vzpenjajo v odsekih z vmesnimi ravnimi podesti |
| Ploščadi in črte preseka | Vsak obris ploščadi pri njeni koti in njena črta preseka |
| Cevi in objekti | Cevi kot okrogle cevi med njihovimi dnem in vrhom, objekti od roba do usedalnika |
| Geodetske točke | Pika pri vsaki točki s koto (sprva izklopljeno) |
| GIS sloji | GIS sloji, prikazani na tlorisu, v svojih barvah: črte in obrisi pri svojih kotah, drugi položeni na obstoječi teren (mu sledijo natančno); točke kot majhni križci. Oblike brez kot zunaj površja so izpuščene, pogled pa pove, koliko jih je |
| Oznake | Imena in vrednosti, ki so vedno obrnjene k vam: ime vsake trase na njenem začetku in stacionaže na vsakih 100 ft (ali 100 m), kota vsake debele plastnice, ploščadi, karakteristične črte in objekti po imenu, in ko je označeno **Geodetske točke**, številka in kota vsake točke |

Oznake ostanejo enako velike in pokončne, ne glede na to, kako jih obračate ali povečujete, in hrib pred oznako jo skrije. Kjer bi se stiskale, se pokažejo najpomembnejše, ostale pa počakajo, da povečate: najprej trase, nato objekti, ploščadi, karakteristične črte, stacionaže, plastnice in točke, bližnje najprej. So samo na zaslonu; izvozi in izrisi jih izpustijo.

Vaše izbire, navpična povečava in barvanje se shranijo v tem brskalniku.

Cesta je zgrajena na obstoječem terenu. Ko imate trasa in koridor, a še ni geodetskih točk ali površja, se cesta nariše na ravnem nadomestnem terenu: na povprečni koti njenega projektnega profila ali nivojsko na koti 0, kadar profila ni. Opozorilo na dnu pogleda 3D in v lastnostih koridorja to pove. Gre samo za sliko: prostornine ali prerezi iz nje ne izhajajo. Odprite geodetske točke ali površje in cesta se sama premakne na pravi teren.

Navpična povečava raztegne teren, ne rastlin: stojijo na povečanem terenu v svoji pravi višini in razpetosti, zato drevo izgleda kot drevo pri vsaki nastavitvi. Rastline so preproste oblike, ne podrobni modeli: na tisoče jih ostane hitrih za kroženje in povečavo.

## Cevi in objekti

- Cev se nariše z notranjim dnem pri dnu, ki ga nastavite, in notranjim vrhom (temenom) za en notranji premer više. Premeri so v palcih v projektu v čevljih in v milimetrih v metričnem projektu, kot v desnem podoknu.
- Objekt teče od svojega roba (vpisanega ali s površja) navzdol do usedalnika (najnižje dno minus globina usedalnika). Brez katerega koli dna se nariše 5 ft (1.5 m) globoko.
- Cevi in objekti s težavo (glejte preverjanje omrežja v desnem podoknu) so narisani rdeče.
- Cev brez dna se ne nariše; opomba na dnu pogleda pove, koliko jih je.

## Izbira iz pogleda 3D

Kliknite trasa (ali njeno cesto), ploščad, karakteristično črto, cev, objekt, geodetsko točko, rastlino, rampo ali drugo trdo tlakovanje. Izbere se točno tako, kot bi kliknili na tlorisu: njene lastnosti se odprejo v desnem podoknu, kjer jih lahko urejate, in v 3D je narisana v barvi izbire nad vsem. Kar izberete na tlorisu, je v 3D prav tako označeno. Namig ob kazalcu imenuje, kar ste kliknili, z njegovo vzhodno koordinato, severno koordinato in koto. Cevi in objekti se lahko kliknejo tudi tam, kjer so pod zemljo; črte, skrite za hribom, skozi hrib ni mogoče klikniti.

Kliknite prelomnico, da vidite, katera je: označena je, vrstica stanja pa jo poimenuje (prelomnice nimajo lastnih lastnosti).

Kliknite teren, da v namigu preberete vzhodno koordinato, severno koordinato in koto tam.

## Vožnja vzdolž trase

Kliknite **Vožnja** na vrstici 3D in izberite trasa. Pogled se premakne na voznikov sedež: 3.5 ft (1.07 m) nad cesto, na njenem projektnem profilu (na obstoječem terenu vzdolž središnice, kadar ga še nima), gleda naprej vzdolž nje.

- **Predvajaj** ali {{key:Space}} vozi z hitrostjo, ki jo izberete (10 do 65 mph ali 15 do 100 km/h); {{key:Space}} znova ustavi. Na koncu se ustavi; **Predvajaj** nato začne znova od začetka.
- Drsnik skoči na katero koli stacionažo; {{key:Left}} in {{key:Right}} premakneta za 10 ft (5 m) nazaj in naprej.
- Vlečenje v pogledu ustavi in dovoli ogled naokoli.
- **Ustavi** ali {{key:Esc}} vrne pogled tja, kjer je bil.

Navpična povečava velja tudi med vožnjo: nastavite jo na 1×, da vidite cesto, kot bo.

## Svetloba s sonca

Odprite **Sonce** na vrstici 3D in označite **Svetloba s sonca**. Vpišite datum, uro in njen časovni pas (odmik od UTC: poleti tisti z letnim časom), ter zemljepisno širino in dolžino lokacije. Kadar ima projekt koordinatni sistem, se izpolnita iz njega.

Lokacija je nato osvetljena tam, kjer je sonce, s **Senca** čez teren, koridor in ploščadi; meni pove azimut sonca in kako visoko je oziroma da je pod obzorjem. Položaji izhajajo iz sončnih enačb NOAA. Sence padajo pravilno pri katerikoli povečavi, a se ustavijo na robu lokacije: hribi in stavbe onstran njega nobene ne mečejo.

## Izvoz pogleda 3D

Kliknite {{ui:GLB}} ali {{ui:OBJ}} na vrstici. Kar pogled kaže, se shrani v pravem merilu (brez povečave), v metrih, z osjo Y navzgor. Podrobnosti: [Izvoz lokacije v 3D](topic:export-3d).
