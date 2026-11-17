---
title: Įrankių juostos apžvalga
summary: Kiekvienas CivilCraft įrankių juostos mygtukas, ką jis daro, jo klavišas ir kada jis yra pilkas arba atsisako veikti.
keywords: įrankių juosta, mygtukai, komandos, įrankiai, failas, eksportas, paviršius, projektavimas, redagavimas, vaizdas, meniu
from: 4c4352bc
---

Įrankių juosta eina per programos viršų septyniomis grupėmis. Kiekvienas mygtukas parodo savo patarimą ir klavišą, kai užvedate žymeklį.

## Failas

| Mygtukas | Klavišas | Ką daro |
|---|---|---|
| {{ui:New}} | nėra | Pradeda tuščią projektą. Pirmiausia klausia, jei yra neįrašytų pakeitimų. |
| {{ui:Open}} | {{key:Mod+O}} | Atidaro taškų failą (CSV, TXT), LandXML ar CivilCraft projektą. |
| {{ui:Save}} | {{key:Mod+S}} | Atsisiunčia projektą kaip `<name>.civilcraft.json`. |

## Eksportas

| Mygtukas | Klavišas | Ką daro |
|---|---|---|
| {{ui:LandXML}} | nėra | Atsisiunčia `<name>.xml`: taškus, paviršius, trasas, profilius ir vamzdynų tinklą kaip LandXML 1.2. „Dar nėra ko eksportuoti.“, kai projektas tuščias. |
| {{ui:DXF}} | nėra | Atsisiunčia `<name>.dxf`: plano linijinę grafiką kaip R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Atidaro **Spausdinti planą į PDF**. „Dar nėra ko spausdinti.“, kai projektas tuščias. |

## Paviršius

| Mygtukas | Klavišas | Ką daro |
|---|---|---|
| {{ui:Breakline}} | {{key:B}} | Spustelėkite geodezinius taškus eilės tvarka, {{key:Enter}} baigia. Lūžio linija perima taškų aukščius. |
| {{ui:Boundary}} | {{key:O}} | Spustelėkite išorinės ribos kampus, {{key:Enter}} baigia. Pakeičia bet kurią ribą. |

Abu rodo „Paviršiaus dar nėra: pirmiausia atidarykite geodezinius taškus.“, kai paviršiaus nėra.

## Projektavimas

| Mygtukas | Klavišas | Ką daro |
|---|---|---|
| {{ui:Alignment}} | {{key:A}} | Spustelėkite PI taškus eilės tvarka, {{key:Enter}} baigia. |
| {{ui:Pad}} | {{key:G}} | Spustelėkite aikštelės kampus, {{key:Enter}} baigia. Kaip ir paviršiaus įrankiai, įspėja, kai paviršiaus nėra; aikštelė gali būti išlyginama tik pagal paviršių. |
| {{ui:Pipes}} | {{key:P}} | Spustelėkite šulinius nuo aukštupio žemyn (spustelėkite esamą, kad prisijungtumėte), {{key:Enter}} baigia. |
| {{ui:Profile}} | {{key:R}} | Rodo arba slepia profilio vaizdą po planu. |

## Redagavimas

| Mygtukas | Klavišas | Ką daro |
|---|---|---|
| {{ui:Undo}} | {{key:Mod+Z}} | Anuliuoja paskutinį pakeitimą (iki 200). Yra pilkas, kai nėra ką anuliuoti. |
| {{ui:Redo}} | {{key:Mod+Y}} | Perdaro tai, kas buvo anuliuota. Yra pilkas, kai nėra ką perdaryti. |
| {{ui:Copy}} | {{key:Mod+C}} | Kopijuoja pasirinktus geodezinius taškus ir įdeda juos į iškarpinę kaip taškų eilutes, kurias priima skaičiuoklė. Pilkas, kol nepasirinkti taškai. |
| {{ui:Paste}} | {{key:Mod+V}} | Įklijuoja taškus: jie seka žymeklį, o spustelėjimas padeda juos su numeriais, kurių neturi joks kitas taškas. Skaičiuoklėje nukopijuotos taškų eilutės taip pat įklijuojamos. |
| {{ui:More}} | nėra | Atidaro meniu žemiau. |

{{ui:More}} meniu:

| Elementas | Klavišas | Ką daro |
|---|---|---|
| {{ui:Cut}} | {{key:Mod+X}} | Kopijuoja pasirinktus taškus ir juos ištrina (vienas anuliavimo žingsnis). |
| {{ui:Copy}} | {{key:Mod+C}} | Kaip {{ui:Copy}} mygtukas. |
| {{ui:Paste}} | {{key:Mod+V}} | Kaip {{ui:Paste}} mygtukas. |
| {{ui:Paste in place}} | {{key:Mod+Shift+V}} | Įklijuoja taškus jų pačių koordinatėmis, su numeriais, kurių neturi joks kitas taškas. |
| {{ui:Duplicate}} | {{key:Mod+D}} | Pasirinktų taškų kopija seka žymeklį; spustelėkite, kur ji turi būti. Iškarpinė nepaliečiama. |
| {{ui:Delete}} | {{key:Delete}} | Ištrina pasirinktus geodezinius taškus arba pasirinktą trasą, aikštelę, šulinį (su jo vamzdžiais), vamzdį ar PVI. |
| {{ui:Select all points}} | {{key:Mod+A}} | Pasirenka visus geodezinius taškus. |
| {{ui:Select none}} | {{key:Esc}} | Panaikina pasirinkimą. |

Elementas, kuris šiuo metu negali veikti, yra pilkas, o jo patarimas pasako kodėl. Išsamiau: [Pasirinkti, kopijuoti ir įklijuoti geodezinius taškus](topic:copy-paste-points).

Anuliavimas apima projekto, paviršiaus nustatymų ir geodezinių taškų pakeitimus (įklijavimą, iškirpimą, dubliavimą, ištrynimą). Jis neapima rodymo nustatymų, o bet kurio failo atidarymas ar importavimas jį išvalo.

## GIS

| Mygtukas | Klavišas | Ką daro |
|---|---|---|
| {{ui:Coordinates}} | nėra | Atidaro **Koordinačių sistemos** dialogą: nurodykite, kurioje sistemoje yra projektas, arba naudokite gruntines ar vietines koordinates. Žr. [Nustatyti projekto koordinačių sistemą](topic:coordinate-systems) ir [Gruntinės ir vietinės koordinatės](topic:ground-and-local-coordinates). |
| {{ui:Import}} | nėra | Importuoja GIS duomenis: shapefile, GeoJSON, GeoPackage, aukščių tinklelius ir LiDAR. Žr. [Importuoti GIS duomenis](topic:gis-import). |
| {{ui:Export}} | nėra | Eksportuoja kaip įrengtus duomenis GIS skyriui. Žr. [Eksportuoti kaip įrengtus duomenis GIS](topic:gis-export). |
| {{ui:Analyze}} | nėra | Atidaro GIS analizės skydelį: buferį, sluoksnių uždėjimą, erdvinį susiejimą, pasirinkimą pagal atributą, matavimą. Žr. [Analizuoti GIS sluoksnius](topic:gis-analysis). |
| {{ui:Attribute table}} | nėra | Paviršius › Daugiau. Atidaro GIS sluoksnio atributų lentelę: rūšiuoti, filtruoti, pasirinkti, redaguoti, pridėti laukus, skaičiuoti, įrašyti kaip CSV. Žr. [Dirbti su sluoksnio atributų lentele](topic:gis-table). |
| {{ui:Map}} | nėra | Atidaro **Žemėlapio sluoksniai** dialogą: georeferencinį paveikslėlį arba pridėtus žemėlapių serverius, nubraižytus po planu. Žr. [Rodyti žemėlapio sluoksnius po planu](topic:map-layers). |

GIS įrankiai įkeliami pirmą kartą, kai naudojate vieną iš šių mygtukų, atidarote GIS failą arba atidarote projektą, kuris turi koordinačių sistemą ar GIS sluoksnius.

## Vaizdas

| Mygtukas | Klavišas | Ką daro |
|---|---|---|
| {{ui:Select}} | {{key:V}} arba {{key:Esc}} | Spustelėkite, kad pasirinktumėte trasas, aikšteles, šulinius, vamzdžius ir taškus ({{key:Shift}} ir spustelėjimas ar vilkimas prideda taškus); vilkite rankenėles, kad perkeltumėte PI, aikštelės kampus ir šulinius. |
| {{ui:Fit}} | {{key:F}} | Priartina planą, kad rodytų paviršių, taškus, trasas ir aikšteles (3D vaizde: rodo viską). |
| {{ui:3D}} | {{key:D}} | Rodo vietą 3D virš plano arba grįžta į planą. Juosta virš 3D vaizdo nustato vaizdą, vertikalųjį perdėjimą, spalvinimą ir ką rodyti, ir eksportuoja GLB arba OBJ. Žr. [Žiūrėti vietą 3D](topic:site-3d). |

## Mygtukai skydeliuose

| Mygtukas | Kur | Ką daro |
|---|---|---|
| {{ui:Open the sample site}} | Langelis tuščiame plane | Įkelia pavyzdinį geodezinį matavimą (reikia ryšio, nebent CivilCraft įrašytas naudojimui neprisijungus) |
| {{ui:Remove the boundary}} | Kairysis skydelis, Paviršius | Pašalina išorinę ribą |
| {{ui:Remove drawn breaklines}} | Kairysis skydelis, Paviršius | Pašalina visas įrankiu nubrėžtas lūžio linijas (ne lūžio linijų grupes) |
| {{ui:Rebuild the surface from the points}} | Kairysis skydelis, Paviršius (tik LandXML paviršius) | Pašalina LandXML TIN ir kuria iš taškų; negalima anuliuoti |
| {{ui:Start from the ground}} | Dešinysis skydelis, Trasa | Pradeda projektinį profilį su PVI ant žemės abiejuose galuose |
| {{ui:Profile view}} | Dešinysis skydelis, Trasa | Atidaro šios trasos profilio vaizdą |
| {{ui:Add PVIs}} | Profilio juosta | Kol įjungta, spustelėjimas profilyje prideda PVI |
| {{ui:Set every invert from the rules}} | Dešinysis skydelis, Vamzdynų tinklas | Nustato visų vamzdžių dugnų aukščius pagal taisykles |
| {{ui:Set its inverts from the rules}} | Dešinysis skydelis, Vamzdis | Nustato šio vamzdžio dugnų aukščius pagal taisykles |
