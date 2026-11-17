---
title: Crtanje građevinskih masa na lokaciji
summary: Nacrtaj građevinsku masu na parceli, daj joj spratove i visinu sprata, vidi njenu bruto površinu spratova, izaberi kako sjedi na kosom terenu, gurni i povuci njenu visinu u 3D, i pošalji je BimCraftu ili je spasi kao IFC datoteku.
keywords: masa, masiranje, građevinska masa, zapremina, otisak, spratovi, visina sprata, bruto površina spratova, GFA, nagib, podijum, iskop i nasip, guranje povlačenje, 3D, studija lokacije, rani projekt, IFC, razvij, BimCraft, A-MASS
from: e5a67c16
---

Građevinska masa je otisak, broj spratova i visina sprata: rano pitanje „koliko građevine stane ovdje i šta to radi terenu”. Mase stoje na planu sa svojim nazivom, brojem spratova i bruto površinom spratova, ulaze u PDF ispis, a DWG i DXF izvozi se na slojevima `A-MASS` i `A-MASS-TEXT`, i čuvaju se u datoteci projekta.

## Nacrtaj masu

1. U **Svojstva**, pod **Građevinske mase**, klikni **Nacrtaj masu**. (Takođe je u meniju **Više** na traci sa alatima, pored **Površina**.)
2. Klikni uglove otiska. Klik blizu ugla parcele ili tačke geodetskog snimanja uzima tačno mjesto te tačke.
3. Klikni prvi ugao ponovo, ili pritisni {{key:Enter}}, da završiš. {{key:Backspace}} vraća posljednji ugao; {{key:Esc}} zaustavlja.

Nova masa ima tri sprata i visinu sprata od 12 ft (3.6 m), i pripada parceli u čijoj se sredini nalazi.

## Spratovi, visina i površina

Klikni masu da promijeniš njen **Naziv**, **Namjenu**, **Spratove**, **Visinu sprata** i **Parcelu**. **Visina** je broj spratova puta visina sprata: upiši visinu i broj spratova postaje najbliži cijeli broj (nikad manje od jednog). **Otisak** i **Bruto površina spratova** (otisak puta broj spratova) računaju se za tebe.

## Na kosom terenu

Teren pod masom čita se iz površine: postojeći teren, ili izravnati teren ako izabereš **Predloženi teren (izravnat)**. **Na kosom terenu** kaže gdje ide prizemni sprat:

- **Stepenasto**: na prosječnom terenu pod otiskom. Niska strana se nasipa do njega, a visoka se iskopa, i njih dvije se približno izjednače.
- **Podijum**: na najvišem terenu. Puna baza nasipa nisku stranu.
- **Iskop**: na najnižem terenu. Visoka strana se iskopa u brdo.

Svojstva pokazuju raspon terena pod masom, **Nivo prizemlja**, i zapreminu nasipa i iskopa između terena i tog nivoa. Mjesto otiska koje je van površine izostavlja se, a Svojstva kažu koliko ih je.

## U 3D prikazu

Mase se crtaju u 3D prikazu lokacije, sa linijom oko svakog sprata i njihovim nazivima iznad krova. **Prikaži** ima polje za potvrdu za **Građevinske mase**. Klikni jednu da je izabereš. Sa izabranom masom:

- prevuci njen krov gore ili dolje da je gurneš ili povučeš za jedan sprat, ili pritisni {{key:PageUp}} i {{key:PageDown}};
- cijelo pomjeranje je jedan korak poništavanja.

Pogled ulice iz **Vožnja** takođe vidi mase, a **Sunce** baca njihove sjenke na teren.

## Pošalji dalje

- **Mase kao IFC** spašava svaku masu kao IFC4 datoteku: lokaciju, zgradu sa njenim spratovima, i masu kao građevinski element sa njenim brojevima u skupu svojstava `CadCraft_SiteMass`. Sa koordinatnim sistemom postavljenim na projekt, datoteka je postavljena na mapu i nosi geografsku širinu i dužinu lokacije; bez njega ne kaže ništa o tome gdje je.
- **Razvij u BimCraftu** otvara BimCraft u novoj kartici sa masama. Tamo izbor mase prikazuje njene brojeve i **Razvij ovu masu**, koje gradi zidove na svakom nivou i pod ispod zgrade iz otiska, u jednom koraku poništavanja. Ništa se ne otprema: datoteka prelazi između dvije kartice ovog pregledača.

Vidi takođe **Zonska ograničenja** i **Sunčane sate**.
