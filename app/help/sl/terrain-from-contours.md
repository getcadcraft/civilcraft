---
title: Teren iz plastnic
summary: Naredite površje terena iz topografske karte: izberite sloje črt, povejte, od kod pride višina vsake črte, preverite križanja in podvojitve ter zgradite. Plastnice postanejo prelomnice, ravni trikotniki na grebenih in dolinah pa se popravijo. Karto, prenesena s slike ali PDF-ja, lahko določite z merilom in postavite z dvema znanima točkama.
keywords: plastnice, črte plastnic, teren iz plastnic, površje iz plastnic, topografska karta, geodetska karta, brez koordinat, prelomnice, ravni trikotniki, greben, dolina, vrh, križanje plastnic, podvojene plastnice, interval plastnic, merilo karte, dve točki, postavitev karte, DXF, DWG, shapefile
from: e6161653
---

Geodet včasih pošlje karto plastnic: črte z višinami, a brez točk. CivilCraft iz teh črt zgradi obstoječi teren.

## Uvoz plastnic

Karto odprite kot črtovje: risba DXF ali DWG, shapefile ali GeoJSON (**GIS** › {{ui:Uvozi}} ali datoteko spustite v tloris). Črte se uvozijo kot **kartni sloji**. Pod **Površje** › {{ui:Več}} izberite {{ui:Teren iz plastnic}}.

## Povejte, od kod je višina

Označite sloje, ki vsebujejo plastnice, nato izberite **Višina iz**:

- {{ui:Lastnih višin črt}}: črta, katere vsa oglišča imajo isto višino (3D polilinija ali polilinija z višino). Črta na 0 je ravninsko črtovje in nima višine.
- **Številsko polje** sloja (na primer ELEV), če je karta prišla s tem poljem.
- {{ui:Začetka in intervala, po vrstnem redu črt}}: za črte brez kakršne koli višine. Prva navedena črta dobi **Višino prve črte**, naslednja to plus **Interval plastnic** in tako naprej. Črte navedite od najnižje navzgor (ali jih v sloju prerazporedite).

## Preverjanje in nato gradnja

{{ui:Preveri}} navede, kaj je narobe, z besedami, preden se karkoli spremeni:

- črta **brez višine** ali z manj kot dvema točkama;
- **podvojena** črta (isti oblika dvakrat, tudi če je narisana v obratni smeri);
- dve črti, ki se **križata**, pri različnih višinah ali pri isti (tudi črta, ki seka samo sebe), z mestom;
- višina, ki **ni na intervalu** (tipkarska napaka, na primer 105.5 na karti z 1 m).

Označite {{ui:Izpusti črte, ki prečkajo drugo}}, da izpustite črto, ki seka največ drugih (nato naslednjo, dokler se nobena ne seka): zablodela črta, ki reže vse plastnice, je tista, ki gre, ne plastnice. **Poenostavi črte znotraj** zmanjša oglišča, ki so bližje ravni potezi od te razdalje.

{{ui:Zgradi teren}} doda črte k obstoječemu terenu kot prelomnice (en korak razveljavitve), tako da površje gre natanko skozi vsako plastnico. Ob označenem {{ui:Popravi ravne trikotnike na grebenih, dolinah in vrhovih}} in podanem intervalu CivilCraft dodatno doda točko znotraj vsakega ravnega trikotnika (trikotnika, katerega oglišča vsa ležijo na isti plastnici) pri višini, kamor se nadaljuje naklon ob njem, nikoli več kot pol intervala od plastnice. Brez tega se vrhovi grebenov, dna dolin in vrhovi pokažejo kot ravne plošče. Na preskusnem hribu se je napaka glede na pravo površje zmanjšala za četrtino; na grebenu za 40 %.

## Karta brez koordinat

Za karto plastnic, prerisano s slike ali PDF-ja, odprite **Določi merilo in postavi sloje z dvema znanima točkama**. Podajte dve točki na karti in kje dejansko ležita; označeni sloji se prilagodijo merilu, zasukajo in premaknejo (en korak razveljavitve; višine se ne spremenijo). Isti dve točki dasta merilo (prikazano v sporočilu) in zasuk.

Površje je tako dobro kot karta: med dvema plastnicama je ravnina, zato dejanski teren med njima ni znan. Pred zanašanjem na rezultat ga preverite s kotnimi točkami.
