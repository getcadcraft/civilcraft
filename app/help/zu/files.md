---
title: Amafayela ongawavula, ongawalondoloza nongawathumela ngaphandle
summary: Ngenisa amafayela amaphoyinti, amafayela e-LandXML namaprojekthi e-CivilCraft; amaprojekthi, i-LandXML, i-DXF ne-PDF aphuma; okugcinwayo ngamunye, lapho amafayela aya khona, nokushintsha ngaphandle kwe-inthanethi.
keywords: vula, londoloza, thumela ngaphandle, ngenisa, amafomethi amafayela, csv, txt, landxml, xml, dxf, pdf, json, landa, ifayela leprojekthi
from: 82bff559
---

I-CivilCraft ivula amafayela avela kwikhompyutha yakho futhi ilondoloza ngokulanda amafayela ababuyela kuyo. Akukho okulayishwa futhi akukho okugcinwa kuseva. Bheka futhi [Amafayela akho](common:your-files).

## Okuvulayo

Chofoza {{ui:Vula}} (noma cindezela {{key:Mod+O}}) bese ukhetha ifayela, noma hudula ifayela phezu kwepulani kusuka ohlelweni lwakho lwamafayela: {{pick:mac=Finder|windows=File Explorer|linux=isiphathi-mafayela sakho}}. Ifayela elilodwa ngesikhathi; amafayela angaphezu kuka-200 MB ayenqatshwa. Ifayela le-LandXML noma leprojekthi elingaphezu kuka-32 MB lifundwa ngezingxenye ezingu-4 MB cishe, hhayi njengombhalo owodwa; ngenkathi i-LandXML ivulwa, lindele ukuthi isebenzisa cishe izikhathi ezingu-13 ubukhulu balelo fayela enkumbulweni (ifayela le-69 MB lisebenzise cishe i-0.9 GB ekuhloleni kwethu).

| Uhlobo | Amagama amafayela | Okwenzekayo |
|---|---|---|
| Ifayela lamaphoyinti | `.csv`, `.txt`, `.pnt`, `.xyz` (noma yimuphi ifayela lombhalo) | Ifasitela **Ngenisa amaphoyinti** liyavuleka. Amaphoyinti afaka esikhundleni samaphoyinti eprojekthi; ama-alignment, ama-pad namapayipi ayahlala. |
| LandXML | `.xml`, `.landxml` | **Iprojekthi entsha** yenziwa kusuka kulelo fayela (uyabuzwa kuqala uma eyamanje inezinguquko ezingalondolozwanga). |
| Iprojekthi ye-CivilCraft | `.civilcraft.json` (noma yimuphi `.json`) | Iprojekthi ivulwa njengoba yalondolozwa (uyabuzwa kuqala uma eyamanje inezinguquko ezingalondolozwanga). |

I-CivilCraft ikhetha ngokuphela kwefayela, bese ngezinhlamvu zalo zokuqala: umbhalo oqala nge-`{` ufundwa njengeprojekthi, owaqala nge-`<` njenge-LandXML, konke okunye njengefayela lamaphoyinti. Ifayela ibhokisi lokuvula elilikhanyisela ngemvi lingasalahlwa phezu kwepulani.

:::note
Ukungenisa ifayela lamaphoyinti kuprojekthi esenamaphoyinti kuwashintsha ngaphandle kokubuza, futhi kusula umlando wokubuyisela (ukuvula noma yiliphi ifayela kuqala kabusha umlando wokubuyisela). Uma uphawu lwendawo lwavela ku-LandXML, ukungenisa amaphoyinti kuyibuyisela ibe yindawo eyakhiwe kumaphoyinti. Londoloza kuqala uma ungase ufune amaphoyinti adala emuva.
:::

Imininingwane: [Amafomethi amafayela amaphoyinti](topic:point-file-formats), [LandXML: okufundwayo nokubhalwayo](topic:landxml-reference).

## Okulondolozayo

{{ui:Londoloza}} ({{key:Mod+S}}) ibhala amafayela amabili aseceleni komunye, aqanjwe ngegama elithi **Igama** kwipaneli yesobunxele: `<name>.civilcraft.json`, iprojekthi oqhubeka uyihlela, kanye `<name>.ifc`, ukwakheka okufanayo njenge-IFC 4.3 kwabanye abasebenzisi (bheka [Ukuthumela nokungenisa i-IFC](topic:ifc)). Ifayela ngalinye lirekhoda elinye, futhi i-IFC iphinde ithwele ikhophi ecindezelwe yeprojekthi, ngakho i-IFC ethunyelwe yodwa isavulwa iphelele futhi ihleleka.

- **Ku-Studio** amafayela amabili abhalwa eduze komunye, endaweni efanayo.
- **Ku-Chrome ne-Edge** ukulondoloza kokuqala kubuza ifolda bese kubhala kokubili kuyo; ukulondoloza okulandelayo kuya endaweni efanayo. Khansela umbuzo wefolda ukuze ulande kokubili.
- **Kwamanye amabhrawuza** kokubili kuyalandwa, iprojekthi ifayela kuqala.

Ukuvula noma iyiphi kwalawa mafayela kufuna elinye. Vula bobabili ndawonye (noma yiyiphi kwawo), noma vula elilodwa: ku-Studio elinye litholakala kwifolda efanayo; ebhrawuzeni i-CivilCraft iyabuza ukuthi uyengeze, noma iqhubeke nalelo olinalo. Uma i-IFC ishintshwe yenye inhlelo ngemva kokuthi i-CivilCraft iyilondoloze, noma elinye lamafayela lidala kunelinye, iprojekthi ivulwa kusuka kwidizayini entsha, futhi i-**Iphaneli Yezinkinga** itshela okwenzekile, nge-**{{ui:Londoloza manje}}** (ibhala kabusha amafayela amabili) kanye ne-**Bonisa ijometri ye-IFC njengesisekelo**. I-IFC eyodwa eshintshwe yenye inhlelo ivulwa kusuka kwikhophi yayo yeprojekthi nalokho okusahambisana nakho: ama-alignment ashintshwe athatha ijometri yawo, izinto ezisusiwe ziyakhishwa, nezinye izinguquko zayo zibhalwe ohlwini, azithathwa. Ifayela leprojekthi elisuka ngaphambi kuka-0.7.1 livulwa njengakuqala.

Ifayela leprojekthi ligcina:

- wonke amaphoyinti (inombolo, izixhumanisi, ukuphakama, incazelo) negama lefayela lamaphoyinti ayevela kulo
- izilungiselelo zendawo: izinqumo zamaqembu, imigqa yokuhlukanisa eyedwetshwe, umngcele, eyona ngaphandle ende kakhulu, kanye ne-TIN efundwe kwi-LandXML
- izilungiselelo zokubonisa
- ama-alignment nama-PI awo, iradiyasi nesiteshi sokuqala, amaphrofayili awo edizayini (ama-PVI nobude bamagoqo) kanye nezilungiselelo zekhorido
- ama-pad nenethiwekhi yamapayipi nemithetho yayo

Ayigcini umlando wokubuyisela. Izindawo zendawo, amakhonturu, imigqa yemini nama-volumu azigcinwa; ziyakhiwa kabusha kusuka kokokufaka okulondoloziwe lapho iprojekthi ivulwa. Ifayela leprojekthi elisuka kwi-CivilCraft entsha liyenqatshwa ngomlayezo obhala inguqulo yalo.

## Okuthumelayo

| Inkinobho | Ifayela | Okuqukethwe |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: amaphoyinti, umhlaba okhona (nomhlaba ohlelwe uma ukhona) njengezindawo ze-TIN, ama-alignment, amaphrofayili womhlaba nedizayini, inethiwekhi yamapayipi |
| {{ui:DXF}} | `<name>.dxf` | I-DXF R12 yemigqa yepulani njengoba ibonakala, ezendaweni ezinamagama |
| {{ui:DWG}} | `<name>.dwg` | Imigqa efanayo njengomdwebo we-DWG, ngefomethi okhetha yona (2000 kuya ku-2018) |
| {{ui:PDF}} | `<name>.pdf` | Ipulothi ye-vector yepulani eshidini, ngesikali okhetha sona |
| {{ui:GLB}} noma {{ui:OBJ}} (kubha yombono we-3D) | `<name>-3d.glb`, `<name>-3d.obj` | Okubonwa yimbono ye-3D njengemodeli ye-3D: mamitha, Y phezulu, isikali sangempela, kuzungezwe imvelaphi yendawo eqoshiwe |

Okungafakiwe kwakho ngakunye: [Ukushintshana nge-LandXML](topic:landxml), [Thumela ipulani ku-DXF](topic:dxf-export) (ne-DWG futhi), [Hlaka ipulani ibe yi-PDF](topic:plot-pdf), [Thumela indawo ku-3D](topic:export-3d).

## Lapho amafayela aya khona

Amafayela alondoliwe nathunyelwe aya lapho isiphequluli sakho sibeka khona okulandiwe, ngokuvamile kwi-Downloads. Ukuze ukhethe ifolda njalo:

:::chromium
Vula **Izilungiselelo** zesiphequluli, bese **Okulandiwe**, bese uvula **Buza ukuthi ulondoloze kuphi yonke ifayela ngaphambi kokulanda**.
:::

:::firefox
Vula **Izilungiselelo**, bese **Okuvamile**, bese ngaphansi kwe-**Amafayela nezinhlelo zokusebenza** khetha **Buza njalo ukuthi ulondoloze kuphi amafayela**.
:::

:::safari
Vula **Safari > Izilungiselelo > Okuvamile** bese usetha **Indawo yokulanda ifayela** ibe **Buza kokulandwa ngakunye**.
:::

Uma ulondoloza kabili ngegama elifanayo, isiphequluli singase sengeze inombolo efayeleni lesibili, isibonelo `Site (1).civilcraft.json`. Vula elisha kakhulu ngesikhathi esilandelayo.

## Ku-inthanethi nangaphandle kwayo

I-CivilCraft isebenza kuphela kwikhompyutha yakho kunoma ngabe kunjani: ukuvula kufunda ifayela kusiphequluli, ukulondoloza kulanda. Ukuze uvule i-CivilCraft ngaphandle kokuxhumeka:

1. Uxhunyiwe, chofoza {{ui:Londoloza ngaphandle kwe-inthanethi}} kubha yesicelo phezulu.
2. Inkinobho ibala ikhuphuka ("Ilondoloza 12 kwangu-30") bese ibonisa {{ui:Ilungele ukusetshenziswa ngaphandle kwe-inthanethi}}. I-CivilCraft incane (cishe 0.6 MB), ngakho lokhu kuthatha isikhashana. Ikhophi elondoliwe lifaka lo msizo nesayithi sesampula.
3. Ngaphandle kokuxhumeka, vula ikheli elifanayo (noma isimaki salo). Konke kuyasebenza, kubandakanya {{ui:Vula isayithi lesampula}}.

Ezinye izimo zenkinobho:

- {{ui:Akukwazanga ukulondoloza}}: amanye amafayela awazange alandwe. Hlola ukuxhumeka bese uchofoza ukuze uzame futhi.
- {{ui:Ayikho ingaphandle kwe-inthanethi}}: leli windi lesiphequluli alikwazi ukugcina ikhophi engaphandle kwe-inthanethi (amawindi angasese namanye amakhompyutha alawulwayo ayivimbela). Sebenzisa iwindi elijwayelekile.

Chofoza {{ui:Ilungele ukusetshenziswa ngaphandle kwe-inthanethi}} ukubona ukuthi ikhophi yalondolozwa nini, ngezinketho ezimbili: {{ui:Londoloza futhi (thola inguqulo entsha kakhulu)}} kanye {{ui:Susa ikopi engaphandle kwe-inthanethi}}. Londoloza futhi ngaphambi kokuvakasha esizeni ukuze ikhophi ihambisane nokwakhiwa kwamanje. Okwengeziwe ku-[Ngaphandle kwe-inthanethi](common:offline).

:::offline
Usengaphandle kwe-inthanethi manje. Uma i-CivilCraft yalondolozelwa ukusetshenziswa ngaphandle kwe-inthanethi, konke kuyasebenza, kubandakanya isayithi lesampula. Uma kungenjalo, qhubeka usebenza kule thebhu, kodwa ungayilayishi kabusha uze uxhumeke kabusha; ngaphandle kwekhophi elondoliwe, {{ui:Vula isayithi lesampula}} yehluleka ngomlayezo othi "Isampula ayikwazanga ukulayishwa".
:::

:::tip
Ngokusetshenziswa emkhakheni, londoloza i-CivilCraft ukuze isetshenziswe ngaphandle kwe-inthanethi bese ulethe amafayela amaphoyinti akho ku-laptop ngqo. Amaprojekthi nokuthunyelwa kulondolozwa njengokulandwa ngaphandle kokuxhumeka, ngakho ungangenisa izinkomba zosuku, uhlole umhlaba, bese ulondoloza iprojekthi esizeni.
:::

Ukugcinwa kwe-cloud akukatholakali, futhi amabhilidi e-desktop akakakhishwa. Njengamanje, amafayela olondoloza yiwona kuphela ikhophi: wagcine endaweni ene-backup.

## Izengezo ifayela elisebenzisayo

Lapho ulondoloza iprojekthi enedatha evela kwisengezo (amabhokisi emithetho yokwakha, noma umthombo othi Ikheli kuya esizeni), ifayela lirekhoda izengezo namanguqulo awo. Uma uyivula kukhompyutha engenalo, ibha ephezu kwepulani iyasho lokho futhi ikunikeze ukuyengeza kusuka kuhlu lwe-akhawunti yakho. Irekhodi linguMbhalo nje; ifayela liyavuleka noma kunjalo.

## Ukubuyisela emuva kusuka ku-Studio

Ngaphakathi kwe-CadCraft Studio, isinyathelo ngasinye oqeda kuCivilCraft sitshelwa ku-Studio, ngakho ukubuyisela okusezingeni leprojekthi kungabuyisela isinyathelo sakamuva ngaphezu kwezinhlelo zokusebenza. Studio ibuyisela isinyathelo kuphela uma isitaki sokubuyisela se-CivilCraft sisemi ngendlela efanayo nalapho sisishiye khona; ngemva kokuvula elinye ifayela iwindi lalo liyadlulwa.

## Ukuvala ngezinguquko ezingalondolozwanga

Lapho iprojekthi inezinguquko ezingalondolozwanga bese uvala ithebhu, uyilayishe kabusha, noma ushiye ikhasi, isiphequluli sibuza ukuthi ufuna ukushiya. Umbhalo walo nokubukeka kwawo kungokwesiphequluli futhi akunakushintshwa yi-CivilCraft. {{ui:Entsha}}, nokuvula iprojekthi noma ifayela le-LandXML, kubuza ebhokisini le-CivilCraft elithi **Izinguquko ezingalondolozwanga**, elinazo {{ui:Khansela}}, {{ui:Ungalondolozi}} kanye {{ui:Londoloza ikhophi}}.
