---
title: Thumela isayithi ku-3D
summary: Londoloza okubonwa yi-3D view njenge-GLB noma i-OBJ ngamanye ama-3D programs, ngamamitha nge-Y iphezulu, ezungeze isiqalo sendawo esirekhodwa yifayela.
keywords: glb, gltf, obj, thumela 3d, thumela 3d, thumela imodeli, injini yegemu, ukubona, isibuki se-3d, amamitha, y up, isiqalo, isiqalo sendawo, indiza yesifunda
from: 07d23992
---

Umbono we-3D uthumela okubonisayo njengemodeli ye-3D okwazi ukuvulwa yenye inhlelo: isibuki se-3D, isakhi semodeli, injini yegemu noma ithuluzi lokubonisa.

## Thumela

1. Vula umbono we-3D ({{key:D}}) bese ukhetha okuboniswayo nge-{{ui:Bonisa}}. Okufihliwe akuthunyelwe.
2. Chofoza {{ui:GLB}} noma {{ui:OBJ}} kubha.
   Ifayela landelwa njenge-"*igama lephrojekthi*-3d.glb" noma "-3d.obj", futhi ibha yesimo ibonisa isiqalo.

## Okuqukethwe yamafayela

| | GLB | OBJ |
|---|---|---|
| Imiphezulu | Amagridi ane-normals nemibala yamabhendi noma yomphezulu | Amagridi ane-normals (akukho mibala) |
| Amapayipi nezakhiwo | Amagridi ajikelezile, ezinenkinga zibomvu | Amagridi ajikelezile |
| Amakhonthuwa, imigqa yokuphula, imizila, amatiki, imigqa yekhoridoro namaphedi | Imigqa, ngalinye iqoqo ngombala walo | Okurekhodiwe kwemigqa (`l`) |
| Amaphoyinti okuhlola | Amaphoyinti | Okurekhodiwe kwamaphoyinti (`p`) |

Iqoqo ngalinye ligcina igama lalo ("Umhlaba okhona", "Amapayipi", "Amakhonthuwa amakhulu" njalo njalo), ukuze ukwazi ukuwufihla noma uwenze ngesitayela kuhlelo olunye.

## Amayunithi, ama-axis nesiqalo

- **Amamitha.** Iphrojekthi yamafidi iguqulwa kusuka emafidini esurvey ye-US (1 ft = 1200/3937 m).
- **Y iphezulu**, isivumelwano ejwayelekile salezi fomethi: i-easting ibe +X, ukuphakama kube +Y, ne-northing ibe −Z.
- **Isikali sangempela.** Ukukhulisa okuqondile kombono akusetshenziswa.
- **Isiqalo sendawo.** Izixhumanisi zendiza yesifunda ziyizigidigidi zamafidi, zikhulu kakhulu kumanani e-single-precision alawa mafomethi agcina, ngakho ifayela libhalwa ngokuhlobene nesiqalo esiseduze: isiqalo somhlaba okhona ngokwawo nge-easting ne-northing, nokuphakama kwawo okuphansi kakhulu kuzungezwe phansi. Isiqalo, ngamayunithi ephrojekthi, siqoshwa efayeleni: ku-GLB njenge-`extras` esigabeni nasenodini layo eliphezulu, ku-OBJ njengomugqa wekhomenti eseduze kwendawo ephezulu (`# origin easting … northing … elevation …`). Ukuze ubuyisele imodeli ezixhumanisweni zephrojekthi, engeza isiqalo (emva kokuguqula amamitha abuyele emafidini kuphrojekthi yamafidi).

## Akukakhiwa okwamanje

- Ukuthumela umbono okhulisiwe, noma ukuthumela ngamayunithi ephrojekthi esikhundleni samamitha.
- Izingubo, ifayela lempahla ye-OBJ (.mtl) nezici zento ngayinye (amagama amapayipi nezakhiwo akutholakali ngaphandle kwe-CivilCraft kuphela).
- Ukuthumela ikhoridoro njengezinto eziqinile ezihlukene, noma umbono wephrofayili nge-3D.
