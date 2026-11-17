---
title: Importo pikat e anketës
summary: Hap një skedar pikash CSV ose tekst, kontrollo radhën e kolonave në dialogun Importo pikat, rregullo rreshtat që nuk lexohen, dhe rendit pikat në grupe.
keywords: importo pika, csv, txt, pnezd, penzd, skedar pikash, anketë, pika cogo, grupe pikash, kolona, veriu lindja
from: ad33d88a
---

Një skedar pikash është një skedar tekst me një pikë për rresht: numri i pikës, veriu, lindja, lartësia dhe përshkrimi në ndonjë rend, të ndarë me presje, tab, pikëpresje ose hapësira. CivilCraft e lexon në shfletues dhe ndërton menjëherë një sipërfaqe prej tij.

## Para se të nisësh

- Dije rendin e kolonave të skedarit, nëse e di (PNEZD dhe PENZD duken njëlloj për një kompjuter).
- Dije njësitë e tij. CivilCraft nuk konverton: cakto **Njësitë** në panelin e majtë që të përputhen me skedarin (shih [Njësitë, stacionet dhe formatet e numrave](topic:units-and-stations)).
- Koordinatat mund të jenë të mëdha (veriu dhe lindja e sistemit shtetëror në miliona janë në rregull).

## Importo skedarin

1. Kliko {{ui:Hap}} në shiritin e veglave, ose shtyp {{key:Mod+O}}, dhe zgjidh skedarin. Mund ta tërheqësh edhe mbi plan.
   Dialogu **Importo pikat** hapet me emrin e skedarit, një listë **Kolonat** të vendosur te {{ui:Zbulo}}, një rresht përmbledhjeje dhe gjashtë pikat e para.
2. Lexo rreshtin e përmbledhjes. Ai thotë sa pika u lexuan, në cilin rend kolonash, si u gjet ai rend, dhe çfarë i ndan kolonat. Tri mënyrat që gjendet rendi:
   - "nga rreshti i titujve": rreshti i parë emëron kolonat e tij (Pika, Veriu, Lindja, Lartësia, Përshkrimi, ose X, Y, Z …). Kjo është më e sigurta.
   - "siç u zgjodh": zgjodhe një rend te **Kolonat**.
   - "e supozuar nga numri i kolonave dhe cilësimi i rreshtit të pikës (PNEZD) — kontrollo që veriu dhe lindja të mos jenë ndërruar": nuk kishte titull të përdorshëm. Nëse skedarët e tu kanë zakonisht lindjen e parë, cakto **Rreshtat e pikave** në P, E, N, Z, D te [cilësimet e CivilCraft](topic:settings).
3. Kontrollo tabelën e pamjes paraprake. Kolonat e saj janë gjithmonë **Pika**, **Veriu**, **Lindja**, **Lartësia**, **Përshkrimi**, çfarëdo rendi që përdor skedari. Veriu dhe lindja e një vendi real zakonisht kanë madhësi qartë të ndryshme: nëse duken të ndërruara, supozimi ishte i gabuar.
4. Nëse rendi është i gabuar, zgjidh të saktin te **Kolonat** (për shembull {{ui:PENZD — pika, lindja, veriu, lartësia, përshkrimi}}). Përmbledhja dhe pamja paraprake përditësohen menjëherë.
5. Shiko poshtë pamjes paraprake për **Rreshtat që nuk lexohen**. Çdo rresht emëron numrin e rreshtit në skedar, arsyen dhe fillimin e rreshtit. Shih [Rreshtat që nuk lexohen](topic:import-points#rows-that-are-not-read).
6. Kliko {{ui:Importo}}.
   Pikat shfaqen në plan, pamja zmadhohet tek ato dhe sipërfaqja ndërtohet. Shiriti i statusit thotë, për shembull, "U importuan 276 pika nga site.csv; sipërfaqja: 546 trekëndësha."

Nëse projekti nuk kishte ende emër, merr emrin e skedarit.

## Kontrollo grupet

Çdo pikë i takon një grupi të emëruar me **fjalën e parë të përshkrimit të saj**, me shkronja të mëdha: "GRD", "FL 12" dhe "fl" janë grupet GRD, FL dhe FL. Pikat pa përshkrim shkojnë në "(pa përshkrim)".

1. Shiko tabelën nën **Pikat** në panelin e majtë: grupi, numri i pikave dhe një zgjedhje **Sipërfaqe**.
2. Çdo grup fillon si {{ui:Pikat}}. Ndrysho vijat e rrjedhës, skajet e shtresës, majat dhe këmbët e pjerrësisë, kreshtat dhe vijat e ngjashme të kodifikuara në {{ui:Vijë thyerjeje}}. Vendos grupet që nuk duhet të formojnë terrenin (pikat e kontrollit, majat e pemëve, shtyllat e shërbimeve të matura në majë) në {{ui:Lënë jashtë}}.
3. Kliko një pikë në plan (me {{ui:Përzgjidh}}) për të parë numrin, koordinatat, lartësinë, përshkrimin dhe grupin e saj në panelin e djathtë.

:::warning
Një grup vijë thyerjeje bashkon **të gjitha** pikat e tij në **një** vijë, sipas radhës së numrit të pikës. Kjo funksionon kur çdo vijë e kodifikuar është matur në rend me kodin e vet. Dy vija rrjedhe të veçanta të kodifikuara të dyja "FL" bëhen një vijë që zig-zag mes tyre. Nëse kodet tuaja janë të përbashkëta, përdor veglën {{ui:Vijë thyerjeje}} për të klikuar pikat e çdo vije (shih [Ndërto dhe rafino sipërfaqen](topic:build-surface)).
:::

## Rreshtat që nuk lexohen

| Arsyeja e shfaqur | Çfarë do të thotë | Çfarë të bësh |
|---|---|---|
| "veriu ose lindja nuk është numër" | Një kolonë koordinate mban tekst | Kontrollo rendin e kolonave, ose një rresht teksti të rastësishëm në mes të skedarit |
| "lartësia nuk është numër" | Kolona e lartësisë mban tekst | Rend i gabuar kolonash, ose një përshkrim në kolonën e lartësisë |
| "nuk ka numër pike" | Kolona e pikës është bosh | Numëro pikën, ose zgjidh një rend pa P (NEZD, NEZ …): pikat numërohen atëherë 1, 2, 3 … |
| "pika 12 shfaqet dy herë (e para mbahet)" | Dy rreshta ndajnë një numër | Riemërto një nga to në skedar, nëse të dyja janë matje reale |
| "3 kolona, prisnim 5 (PNEZD)" | Rreshti është i shkurtër | Një rresht i prishur, ose rendi i gabuar i kolonave |

Një pikë me lartësi bosh mbahet, por nuk përdoret në sipërfaqe. Fakti **Pikat** tregon sa pika kanë lartësi.

Rreshtat që fillojnë me `#`, `;` ose `//` janë komente dhe kapërcehen. Rreshtat bosh kapërcehen.

## Zëvendëso ose shto pika

Importimi përsëri **zëvendëson** të gjitha pikat; nuk u shton atyre. Aksat, platformat, tubat, vijat e thyerjes së vizatuara dhe kufiri mbeten. Historia e zhbërjes pastrohet, kështu që ruaje projektin para se të mund të duash pikat e vjetra. Për të bashkuar dy skedarë, bashkoji në një redaktues teksti ose fletëllogaritës para importit (kujdes me numrat e përsëritur të pikave).

Pikat nuk mund të lëvizen, redaktohen ose fshihen brenda CivilCraft akoma. Rregulloji në skedar dhe importo përsëri.

## Të lidhura

- [Formatet e skedarëve të pikave](topic:point-file-formats): çdo rend kolonash dhe si njihen titujt.
- [Ndërto dhe rafino sipërfaqen](topic:build-surface).
