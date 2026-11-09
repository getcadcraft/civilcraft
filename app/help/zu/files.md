---
title: Amafayela ongawavula, ongawalondoloza nongawathumela
summary: Amafayela wamaphoyinti, i-LandXML namaphrojekthi e-CivilCraft angenayo; amaphrojekthi, i-LandXML, i-DXF ne-PDF aphumayo; okugcinwa yifayela ngalinye, lapho amafayela aya khona, nokushintsha lapho ungaxhunyiwe.
keywords: vula, londoloza, thumela, ngenisa, izinhlobo zamafayela, csv, txt, landxml, xml, dxf, pdf, json, landa, ifayela leprojekthi
from: a7debb61
---

I-CivilCraft ivula amafayela asuka kukhompyutha yakho futhi iwalondoloza ngokuwalanda ibuyele kuwo. Akulayishwa lutho futhi akugcinwa lutho kuseva. Bheka futhi [Amafayela akho](common:your-files).

## Okuvulayo

Chofoza {{ui:Open}} (noma cindezela {{key:Mod+O}}) bese ukhetha ifayela, noma hudula ifayela kusuka ku-{{pick:mac=Finder|windows=File Explorer|linux=isiphathi-mafayela sakho}} liye kupulani. Ifayela elilodwa ngesikhathi; amafayela angaphezu kwe-200 MB ayenqatshwa.

| Uhlobo | Amagama amafayela | Okwenzekayo |
|---|---|---|
| Ifayela lamaphoyinti | `.csv`, `.txt`, `.pnt`, `.xyz` (noma yiliphi ifayela lombhalo) | Ingxoxo **Ngenisa amaphoyinti** iyavuleka. Amaphoyinti afaka esikhundleni amaphoyinti ephrojekthi; imizila, amapedi namapayipi ahlala njengoba kunjalo. |
| LandXML | `.xml`, `.landxml` | Kudalwa **iphrojekthi entsha** kusuka kulelifayela (uzobuzwa kuqala uma ephrojekthini wamanje kukhona **Ushintsho olungalondolozwanga**). |
| Iphrojekthi ye-CivilCraft | `.civilcraft.json` (noma yiliphi `.json`) | Iphrojekthi ivuleka njengoba yalondolozwa (uzobuzwa kuqala uma ephrojekthini wamanje kukhona **Ushintsho olungalondolozwanga**). |

I-CivilCraft inquma ngokwesiqedo sefayela, bese ngokuqala kwalo: umbhalo oqala nge-`{` ufundwa njengephrojekthi, owaqala nge-`<` njenge-LandXML, konke okunye njengefayela lamaphoyinti. Ifayela ebhokisi lokuvula elibe lifiphele lingalethwa kupulani.

:::note
Ukungenisa ifayela lamaphoyinti kuphrojekthi esenamaphoyinti kuwashintsha ngaphandle kokubuza, futhi kuhlanze umlando wokuhlehlisa (ukuvula noma yiliphi ifayela kuba ukuqala okusha kokuhlehlisa). Uma umphezulu wavela ku-LandXML, ukungenisa amaphoyinti kuwubuyisela ube umphezulu owakhiwe kumaphoyinti. Londoloza kuqala uma usenokuthanda ukuba amaphoyinti endala abuyele.
:::

Imininingwane: [Izinhlobo zamafayela wamaphoyinti](topic:point-file-formats), [LandXML: okufundwayo nokubhalwayo](topic:landxml-reference).

## Okulondolozayo

{{ui:Save}} ({{key:Mod+S}}) ibhala amafayela amabili eceleni komunye, anesihloko segama elithi **Igama** kuphaneli yesobunxele: `<igama>.civilcraft.json`, iphrojekthi oqhubeka uyihlela, kanye no-`<igama>.ifc`, lo mklamo ofanayo ngesimo se-IFC 4.3 kwabanye bonke (bheka [Ukuthumela nokungenisa i-IFC](topic:ifc)). Ngayinye ilondoloza enye, futhi i-IFC iphinde ithwale ikhophi ecindezelwe yephrojekthi, ngakho i-IFC ethunyelwe yodwa isavula igcwele futhi ihlelekayo.

- **Ku-Studio** zombili amafayela abhalwa eduze komunye, endaweni yawo.
- **Ku-Chrome nakwi-Edge** ukulondoloza kokuqala kucela ifolda bese kubhalwa zombili kuyo; ukulondoloza okulandelayo kuya efoldeni efanayo. Khansela umbuzo wefolda ukuze ulande zombili kundawo.
- **Kwamanye amabrawuza** zombili amafayela ayalandwa, iphrojekthi kuqala.

Ukuvula noma yiliphi lalawa mafayela kufuna enye. Vula zombili ndawonye (noma hudula zombili), noma vula eyodwa: ku-Studio enye itholakala efoldeni efanayo; kubrawuza i-CivilCraft ikucela ukuthi uyengeze, noma uqhubeke nalowo onawo. Uma i-IFC ishintshwe yenye inhlelo ngemva kokuthi i-CivilCraft iyilondoloze, noma elinye lamafayela liyindala kunelinye, iphrojekthi ivuleka kusuka ekwakhiweni okusha kakhulu futhi iphaneli Yezinkinga ichaza okwenzekile, nge-**Londoloza manje** (ibhala kabusha zombili) kanye ne-**Bonisa ijiyomethri ye-IFC njengesisekelo sokubheka**. I-IFC eyodwa eshintshwe yenye inhlelo ivula kusuka ekhophini yayo yephrojekthi nalokho okusahambisana nayo: imizila eshintshiwe ithatha ijiyomethri yayo, izinto ezisusiwe ziyekwa ngaphandle, nezinye izinguquko zidwetshwe kodwa azithathwa. Ifayela lephrojekthi elisuka ngaphambi kuka-0.7.1 livuleka njengakuqala.

Ifayela lephrojekthi igcina:

- wonke amaphoyinti (inombolo, amakhoordinethi, ukuphakama, incazelo) negama lefayela lamaphoyinti ayevela kulo
- izilungiselelo zomphezulu: izinketho zamaqembu, imigqa yokwephula edwetshiwe, umngcele, umphetho wangaphandle omude kakhulu, nomnxantathu (TIN) ofundwe ku-LandXML
- izilungiselelo zokubonisa
- imizila nama-PI ayo, imisindo namabanga okuqala, amaphrofayili awo okuklama (ama-PVI namabanga wamajika) nezilungiselelo zekoridoro
- amapedi nenethiwekhi yamapayipi namathuluzi ayo

Ayigcini umlando wokuhlehlisa. Imiphezulu, ama-contour, imigqa yokukhanya kwemini nemithamo ayigcinwa; ayakhiwa kabusha kusuka kokokufaka okulondoloziwe lapho iphrojekthi ivuleka. Ifayela lephrojekthi elisuka kwi-CivilCraft entsha kakhulu alamukelwa, kube kukhona umyalezo oqukethe inguqulo yalo.

## Okuthumelayo

| Inkinobho | Ifayela | Okuqukethwe |
|---|---|---|
| {{ui:LandXML}} | `<igama>.xml` | LandXML 1.2: amaphoyinti, umhlaba okhona (nomphezulu oqhutshiwe uma ukhona) njengemiphezulu ye-TIN, imizila, amaphrofayili womhlaba nawokuklama, inethiwekhi yamapayipi |
| {{ui:DXF}} | `<igama>.dxf` | I-R12 DXF yemigqa yepulani njengoba ibonakala, emagatsheni aqanjiwe |
| {{ui:DWG}} | `<igama>.dwg` | Imigqa efanayo njengomdwebo we-DWG, ngefomethi okhetha kuyo (2000 kuya ku-2018) |
| {{ui:PDF}} | `<igama>.pdf` | Ukuphrintwa kwepulani ngevekthali esiqeshini, ngesikali okhetha sona |
| {{ui:GLB}} noma {{ui:OBJ}} (kwibha yombonopha we-3D) | `<igama>-3d.glb`, `<igama>-3d.obj` | Okubonwa yiwindi le-3D njengemodeli ye-3D: amamitha, u-Y uphezulu, isikali sangempela, kuzungezwe imvelaphi yendawo eqoshiwe |

Okushiywa yilokho ngakunye: [LandXML ethengiselanayo](topic:landxml), [Thumela ipulani ibe yi-DXF](topic:dxf-export) (ne-DWG nayo), [Phrinta ipulani ibe yi-PDF](topic:plot-pdf), [Thumela indawo ibe ngo-3D](topic:export-3d).

## Lapho amafayela aya khona

Amafayela alondoloziwe nathunyelwe aya lapho isiphequluli sakho sibeka khona okulandiwe, ngokuvamile efolda yeZilandiwe. Ukuze ukhethe ifolda njalo lapho ulanda:

:::chromium
Vula i-**Izilungiselelo** yesiphequluli, bese **Okulandiwe**, bese uvula i-**Buza ukuthi ulondoloze kuphi ifayela ngalinye ngaphambi kokulanda**.
:::

:::firefox
Vula **Izilungiselelo**, bese **Okujwayelekile**, bese ngaphansi kwe-**Amafayela nezinhlelo** khetha **Buza njalo ukuthi ulondoloze kuphi amafayela**.
:::

:::safari
Vula **Safari > Izilungiselelo > Okujwayelekile** bese usetha **Indawo yokulanda ifayela** ibe **Buza ngokulandwa ngakunye**.
:::

Umaulondoloza kabili ngegama elifanayo, isiphequluli singase sengeze inombolo kwelesibili, isibonelo `Indawo (1).civilcraft.json`. Vula okusha kakhulu ngesikhathi esilandelayo.

## Ku-inthanethi nangaphandle kwe-inthanethi

I-CivilCraft isebenza kukhompyutha yakho kunoma kanjani: ukuvula kufunda ifayela esiphequluleni, ukulondoloza kuyilanda. Ukuze uvule i-CivilCraft ngaphandle kokuxhumeka nakancane, yilondoloze ukuze isetshenziswe ngaphandle kwe-inthanethi kuqala:

1. Uma usexhunyiwe, chofoza {{ui:Save for offline}} embhalweni ophezulu wohlelo.
2. Inkinobho ibala ("Kulondolozwa 12 kwangu-30") bese ibonisa {{ui:Offline ready}}. I-CivilCraft incane (cishe ku-0.6 MB), ngakho lokhu kuthatha isikhashana. Ikhophi elondoloziwe ifaka lo siza nendawo yesampula.
3. Uma ungaxhunyiwe, vula leli kheli (noma isikhonkwane salo). Konke kuyasebenza, kubandakanya {{ui:Open the sample site}}.

Izimo ezinye zenkinobho:

- {{ui:Could not save}}: amanye amafayela awanqotshwanga. Hlola ukuxhumeka bese uyichofoza ukuze uzame futhi.
- {{ui:Offline not available}}: lewindi lesiphequluli alikwazi ukugcina ikhophi yangaphandle (amawindi azimele nezinye izikhompyutha ezilawulwayo ziyayivimbela). Sebenzisa iwindi elijwayelekile.

Chofoza {{ui:Offline ready}} ukuze ubone lapho ikhophi yalondolozwa khona, ngezinketho ezimbili: {{ui:Save again (get the newest version)}} kanye {{ui:Remove the offline copy}}. Londoloza futhi ngaphambi kokuvakasha endaweni ukuze ikhophi ihambisane nenguqulo entsha kakhulu. Okwengeziwe ku-[Ngaphandle kwe-inthanethi](common:offline).

:::offline
Usangaphandle kwe-inthanethi manje. Uma i-CivilCraft yalondolozwa ukuze isetshenziswe ngaphandle kwe-inthanethi, konke kuyasebenza, kubandakanya indawo yesampula. Uma kungenjalo, qhubeka usebenza kule thebhu, kodwa ungayilayishi kabusha uze uxhumeke futhi; ngaphandle kwekhophi elondoloziwe, {{ui:Open the sample site}} iyehluleka ngokuthi "Isampula alikwazanga ukulayishwa".
:::

:::tip
Ukuze usebenze esiza, londoloza i-CivilCraft ukuze isetshenziswe ngaphandle kwe-inthanethi bese uletha amafayela wamaphoyinti wakho ekhompyutheni ye-laptop uqobo. Amaphrojekthi nokuthunyelwa kulondolozwa njengokulandwa ngaphandle kokuxhumeka, ngakho ungangenisa izinhlolo zosuku, uhlole umphezulu bese uyilondoloza iphrojekthi esizeni.
:::

Ukulondoloza ku-inthanethi akukatholakali, nezinhlelo zedeskithophu azikakakhishwa. Njengamanje, amafayela olondoloza yiwona kopi yodwa: wagcine endaweni eqoqwa njalo.

## Izinhlelo ezisetshenziswa yifayela

Uma ulondoloza iphrojekthi enedatha evela kwinhlelo engeziwe (izihlahla zemithetho yezakhiwo, noma umthombo weKheli kuya esizeni), ifayelaliqopha izinhlelo ezingeziwe nezinguqulo zazo. Uma liveza kwikhompyutha engayinazo, ibha ephezu kwepulani iyasho lokho futhi ikunikeze ukuthi uyengeze kusuka kuhlu lwe-akhawunti yakho. Irekhodi liyinothi nje: ifayela liyavuleka noma kunjalo.

## Ukuhlehlisa kusuka ku-Studio

Ngaphakathi ku-CadCraft Studio, isinyathelo ngasinye oqeda kwi-CivilCraft siyatshelwa i-Studio, ukuze ukuhlehlisa kwayo kwephrojekthi kukwazi ukuthatha emuva isinyathelo sakamuva phakathi kwezinhlelo. I-Studio ihlehlisa isinyathelo kuphela uma isitaki sokuhlehlisa se-CivilCraft sihlala kanjena ngemva kwaso; uma uvule elinye ifayela, iyakuhlehlisa leli windi.

## Ukuvala nokushintsha okungalondolozwanga

Uma iphrojekthi inezinguquko ezingalondolozwanga bese uvala ithebhu, uyilayishe kabusha, noma uhamba ekhasini, isiphequluli sikubuza ukuthi ufuna ukuhamba. Umbhalo wawo nesimo sawo kungabo sesiphequluli, futhi i-CivilCraft ayikwazi ukuwushintsha. {{ui:New}}, nokuvula iphrojekthi noma ifayela le-LandXML, kubuza kwibhokisi le-CivilCraft **Ushintsho olungalondolozwanga**, ngo-{{ui:Cancel}}, {{ui:Don’t save}} kanye {{ui:Save a copy}}.
