---
title: Nacrtajte građevinske mase na lokaciji
summary: Nacrtajte masu zgrade na parceli, dajte joj spratove i visinu sprata, pogledajte njenu bruto površinu sprata, izaberite kako sedi na kosom terenu, gurajte i povlačite njenu visinu u 3D, i pošaljite je BimCraft-u ili sačuvajte kao IFC datoteku.
keywords: masa, masiranje, masa zgrade, zapremina, otisak, spratovi, visina sprata, bruto površina sprata, GFA, nagib, podijum, iskop i nasip, guranje i povlačenje, 3D, studija lokacije, rano projektovanje, IFC, razvoj, BimCraft, A-MASS
from: e5a67c16
---

Masa zgrade je otisak, broj spratova i visina sprata: rano pitanje „koliko zgrade stane ovde i šta to radi tlu“. Mase stoje na planu sa svojim nazivom, brojem spratova i bruto površinom sprata, ulaze u PDF štampu i u DWG i DXF izvoze na slojevima `A-MASS` i `A-MASS-TEXT`, i čuvaju se u datoteci projekta.

## Crtanje mase

1. U **Svojstva**, pod **Građevinske mase**, kliknite **Nacrtaj masu**. (Nalazi se i u meniju **Više** na traci sa alatkama, pored **Površina**.)
2. Kliknite temena otiska. Klik blizu temena parcele ili geodetske tačke uzima tačno mesto te tačke.
3. Kliknite prvo teme ponovo, ili pritisnite {{key:Enter}}, da završite. {{key:Backspace}} uklanja poslednje teme; {{key:Esc}} zaustavlja.

Nova masa ima tri sprata i visinu sprata od 12 ft (3.6 m), i pripada parceli u kojoj pada njena sredina.

## Spratovi, visina i površina

Kliknite masu da promenite **Naziv**, **Namena**, **Spratovi**, **Visina sprata** i **Parcela**. **Visina** je broj spratova puta visina sprata: upišite visinu i broj spratova postaje najbliži ceo broj (nikada manje od jednog). **Otisak** i **Bruto površina sprata** (otisak puta spratovi) izračunavaju se za vas.

## Na kosom terenu

Teren ispod mase čita se sa površine: postojeći teren, ili nivelisani teren gde ste izabrali **Predloženi teren (nivelisan)**. **Na kosom terenu** kaže gde ide prizemlje:

- **Stepenasto**: na prosečnom terenu ispod otiska. Nizak deo se nasipa do njega, a visoki deo se iskopava, pa se njih dvoje skoro izjednače.
- **Podijum**: na najvišem terenu. Čvrsta osnova nasipa nizak deo.
- **Iskop**: na najnižem terenu. Visoki deo se iskopava u brdo.

Svojstva prikazuju raspon terena ispod mase, **Kotu prizemlja**, i zapreminu nasipa i iskopa između terena i tog nivoa. Deo otiska koji je van površine se izostavlja, a Svojstva kažu koliko ih je.

## U 3D prikazu

Mase se crtaju u 3D prikazu lokacije, sa linijom oko svakog sprata i njihovim nazivima iznad krova. **Prikaz** ima polje za štikliranje **Građevinske mase**. Kliknite jednu da je izaberete. Sa izabranom masom:

- prevucite njen krov gore ili dole da je gurnete ili povučete za po jedan sprat, ili pritisnite {{key:PageUp}} i {{key:PageDown}};
- ceo potez je jedan korak za poništavanje.

Pogled ulice u **Vožnja** vidi i mase, a **Sunce** baca njihove senke na teren.

## Pošaljite dalje

- **Mase kao IFC** čuva svaku masu kao IFC4 datoteku: lokaciju, zgradu sa njenim spratovima i masu kao građevinski element sa njenim brojevima u skupu svojstava `CadCraft_SiteMass`. Sa postavljenim koordinatnim sistemom na projektu, datoteka se smesti na kartu i nosi geografsku širinu i dužinu lokacije; bez njega ne kaže ništa o tome gde je.
- **Razvij u BimCraft-u** otvara BimCraft u novoj kartici sa masama. Tamo izbor mase prikazuje njene brojeve i **Razvij ovu masu**, koje gradi zidove na svakom nivou i podnu ploču ispod zgrade iz otiska, u jednom koraku za poništavanje. Ništa se ne otprema: datoteka prelazi između dve kartice ovog pregledača.

Vidi takođe **Granice zoniranja** i **Sunčani sati**.
