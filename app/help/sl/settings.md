---
title: Nastavitve CivilCraft
summary: Izberite vrstni red stolpcev za kopirane in prilepljene vrstice točk ter za ugibanje stolpcev datoteke, kako se prilepljene točke številčijo, kaj kažejo oznake točk, indikator vogala, navpična povečava v 3D, kako se prikazujeta zemljepisna širina in dolžina ter ali kartni sloji prihajajo iz interneta.
keywords: nastavitve, prednastavitve, vrstni red stolpcev, pnezd, penzd, vrstice točk, preštevilčenje, številke točk, začetna številka, oznake točk, oznake, opis, kota, kocka pogleda, ikona osi, indikator vogala, kompas, navpična povečava, 3d, zemljepisna širina, zemljepisna dolžina, dms, decimalne stopinje, kartni sloji, internet, zasebnost
from: 64b9cb92
---

Nastavitve odprete z {{ui:Nastavitve}} z zobnikom v orodni vrstici aplikacije ali {{key:Mod+,}}. Prvi zavihek, {{ui:CivilCraft}}, hrani nastavitve, ki pripadajo tej aplikaciji; {{ui:Splošno}} hrani tiste, ki jih delijo vse aplikacije CadCraft (tema, orodna vrstica, podokna). Nastavitve CivilCraft obstajajo samo v aplikaciji: tu jih spreminjate, ta brskalnik pa si jih zapomni. {{ui:Ponastavi nastavitve CivilCraft}} vrne vsako nastavitev na privzete vrednosti.

## Vrstice točk

**P, N, E, Z, D** (privzeto) ali **P, E, N, Z, D**: točka, severno, vzhodno, kota, opis ali vzhodno pred severnim. Uporabi se na treh mestih:

- **Kopiraj**: vrstice, ki jih CivilCraft postavi v odložišče za preglednico.
- **Prilepi**: vrstice, prilepljene iz preglednice ali besedilne datoteke brez glave.
- **Uvoz**: ugib v pogovornem oknu **Uvoz točk**, kadar datoteka nima glave (datoteka s štirimi stolpci se prebere kot PENZ, s tremi kot ENZ). Glejte [Oblike datotek točk](topic:point-file-formats).

Glava, ki poimenuje svoje stolpce, vedno zmaga, prav tako pa izbira v seznamu **Stolpci** v pogovornem oknu za uvoz.

## Številke za prilepljene točke

- **Ohrani proste številke** (privzeto): prilepljena točka ohrani svojo številko, kadar je nobena točka nima; samo sporne točke dobijo nove številke.
- **Vedno nove številke**: vsaka prilepljena točka dobi novo številko, tudi če je njena lastna prosta.

**Nove številke se začnejo pri**: pustite prazno, da se šteje naprej od ena več kot najvišja številka v uporabi. Vpišite številko, na primer 5000, da dobijo nove točke številke od 5000 navzgor; številke, ki so že v uporabi, se preskočijo. Nobeni dve točki na noben način ne dobita iste številke. Glejte [Izbira, kopiranje in lepljenje geodetskih točk](topic:copy-paste-points#point-numbers-never-clash).

## Oznake točk

Kaj kaže oznaka točke, kadar je {{ui:Oznake točk}} vklopljena pod **Prikaz**: **Številka**, **Številka in kota** ali **Številka, kota in opis** (privzeto). Izvozi DXF, DWG in PDF kažejo enake oznake kot zaslon.

## Indikator vogala

Kaj je v kotu tlorisa in pogleda 3D: **Kocka pogleda** (privzeto), **Ikona osi** ali **Nič**.

- **Kocka pogleda** (desno zgoraj). Na tlorisu prikazuje zgornjo stran s kompasnim obročem: N je mrežni sever (gor na tlorisu). Kliknite katero koli drugo stran, rob ali oglišče kocke ali jo povlecite, in [pogled 3D](topic:site-3d) se odpre z gledanjem od tam. {{ui:Domov}} na kocki tlorisa prilagodi tloris.
- V pogledu 3D se kocka obrne s pogledom: kliknite stran, rob ali oglišče za gledanje od tam, povlecite kocko za kroženje, povlecite kompasni obroč za obračanje okoli navpične osi, kliknite črko za gledanje s te strani ter uporabite {{ui:Domov}} za izometrični pogled na celotno lokacijo. Kadar gledate naravnost v stran, majhne puščice preskočijo na naslednjo stran, ukrivljene puščice pa obrnejo pogled za četrt obrata.
- **Ikona osi** (spodaj levo): majhna oznaka X (vzhod) in Y (sever) na tlorisu, X, Y in Z (gor) v 3D.

## Navpična povečava v 3D

Kako močno pogled 3D raztegne višine: **1×**, **2×** (privzeto), **3×**, **5×** ali **10×**. Seznam na vrstici pogleda 3D je ista nastavitev, zato sprememba enega spremeni oba. Prostornine, profili in izvozi 3D ostanejo v pravem merilu.

## Zemljepisna širina in dolžina

Kako vrstica stanja kaže zemljepisno širino in dolžino kazalca, kadar ima projekt koordinatni sistem: **stopinje, minute in sekunde** (privzeto, na primer `30°18′00.00″ N`) ali **decimalne stopinje** (`30.300000° N`). Glejte [Nastavitev koordinatnega sistema projekta](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Kartni sloji iz interneta

**Izklopljeno** (privzeto) ali **Vklopljeno**. Ko je vklopljeno, CivilCraft zahteva od kartnih strežnikov, ki ste jih dodali, slike območja na zaslonu. Vaša risba ostane na tem računalniku; strežnik vidi območje in vaš internetni naslov. Ko je izklopljeno, se noben kartni strežnik ne vpraša za ničesar, tudi če projekt, ki ga odprete, ga imenuje; georeferencirana slika iz datoteke deluje v obeh primerih. Glejte [Prikaz kartnih slojev pod tlorisom](topic:map-layers).

## Pomočniki

**Dovoli AI pomočnikom in skriptom uporabo CivilCraft** (na začetku izklopljeno) omogoča pomočniku na vašem računalniku dostop do odprte lokacije prek CadCraft Studio: **Preberi** opiše lokacijo in da točke, kote površja, stacionaže, profile, prostornine in parcele; **Uredi** mu omogoča izbiranje in dodajanje geodetskih točk; **Shrani** in **Izvozi** mu omogočata shranjevanje projekta ter zapis LandXML ali DWG. **Mape, ki jih sme uporabljati** (v Studiu) so mesta, kamor sme shranjevati in izvažati. **Dejavnost** našteje njegove klice. Glejte [Naj AI pomočnik dela z vašo lokacijo](topic:assistants).
