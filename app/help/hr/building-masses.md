---
title: Crtanje građevnih masa na lokaciji
summary: Nacrtajte građevnu masu na čestici, dodijelite joj etaže i visinu etaže, pogledajte bruto površinu etaža, odaberite kako sjedi na kosom terenu, gurajte i povlačite njezinu visinu u 3D-u te je pošaljite u program BimCraft ili spremite kao IFC datoteku.
keywords: masa, masiranje, građevna masa, volumen, tlocrt, etaže, visina etaže, GFA, bruto površina, nagib, podnožje, iskop i nasip, guranje i povlačenje, 3D, studija lokacije, rani projekt, IFC, razvoj, BimCraft, A-MASS
from: e5a67c16
---

Građevna masa je tlocrt, broj etaža i visina etaže: rano pitanje „koliko građevine ovdje stane i što ona radi s terenom“. Mase se nalaze na planu s nazivom, brojem etaža i bruto površinom, ulaze u PDF ispis te DWG i DXF izvoze na slojevima `A-MASS` i `A-MASS-TEXT`, i spremaju se u datoteku projekta.

## Nacrtajte masu

1. U **Svojstvima**, pod **Građevne mase**, kliknite **Nacrtaj masu**. (Također je u izborniku **Više** na alatnoj traci, uz **Teren**.)
2. Kliknite kutove tlocrta. Klik blizu kuta čestice ili geodetske točke preuzima njezino točno mjesto.
3. Kliknite prvi kut ponovno ili pritisnite {{key:Enter}} za završetak. {{key:Backspace}} vraća zadnji kut; {{key:Esc}} zaustavlja.

Nova masa ima tri etaže i visinu etaže 12 ft (3.6 m), a pripada čestici u čijoj se sredini nalazi.

## Etaže, visina i površina

Kliknite masu da promijenite njezin **Naziv**, **Namjenu**, **Etaže**, **Visinu etaže** i **Česticu**. **Visina** je broj etaža puta visina etaže: upišite visinu, a broj etaža postane najbliži cijeli broj (nikad manje od jedan). **Tlocrtna površina** i **Bruto površina etaža** (tlocrtna površina puta broj etaža) izračunavaju se za vas.

## Na kosom terenu

Teren ispod mase čita se iz terena: postojećeg terena ili uređenog terena ako ste odabrali **Projektirani teren (uređen)**. **Na kosom terenu** kaže gdje ide prizemlje:

- **Stepenasto**: na prosječnom terenu ispod tlocrta. Niska strana nasipa se do njega, a visoka se iskopa, pa se njih dvoje gotovo izjednače.
- **Podnožje**: na najvišem terenu. Čvrsta osnova ispunjava nisku stranu.
- **Iskop**: na najnižem terenu. Visoka strana odsijeca se u brdo.

Svojstva pokazuju raspon terena ispod mase, **Kotu prizemlja** i volumen nasipa i iskopa između terena i te kote. Dio tlocrta koji je izvan terena se izostavlja, a Svojstva kažu koliko ga je.

## U 3D prikazu

Mase se crtaju u 3D prikazu lokacije, s linijom oko svake etaže i njihovim nazivima iznad krova. **Prikaži** ima potvrdni okvir za **Građevne mase**. Kliknite jednu da je odaberete. Dok je masa odabrana:

- povucite njezin krov gore ili dolje da je gurnete ili povučete za jednu etažu, ili pritisnite {{key:PageUp}} i {{key:PageDown}};
- cijeli pomak je jedan korak poništavanja.

Ulični prikaz **Vožnja** također vidi mase, a **Sunce** baca njihove sjene na teren.

## Pošaljite dalje

- **Mase kao IFC** sprema svaku masu kao IFC4 datoteku: lokaciju, zgradu s njezinim etažama i masu kao građevni element s brojkama u skupu svojstava `CadCraft_SiteMass`. Ako je za projekt postavljen koordinatni sustav, datoteka se smješta na kartu i nosi geografsku širinu i dužinu lokacije; bez njega ne govori ništa o tome gdje je.
- **Razvij u programu BimCraft** otvara BimCraft u novoj kartici s masama. Tamo odabir mase prikazuje njezine brojke i **Razvij ovu masu**, koja izrađuje zidove na svakoj razini i podnu ploču ispod zgrade iz tlocrta, u jednom koraku poništavanja. Ništa se ne učitava na poslužitelj: datoteka putuje između dviju kartica ovog preglednika.

Vidi također **Ograničenja prostorne namjene** i **Sunčani sati**.
