---
title: WaterCraft: pieprasījumi, ugunsdzēsības plūsma, pārtraukumi un ūdens vecums
summary: Ar WaterCraft papildinājumu pārvērtiet klientus par pieprasījumiem savās ūdensvada maģistrālēs, pārbaudiet plūsmu, kas pieejama katrā hidrantā, redziet, kura maģistrāles pārtraukums visvairāk kaitē, un sekojiet ūdens vecumam un hloram visas dienas garumā.
keywords: watercraft, ūdens sadale, pieprasījumi, klienti, maksimālās plūsmas koeficients, pieprasījuma profils, ugunsdzēsības plūsma, hidrants, atlikumspiediens, kritiskums, pārtraukums, noslēgvārstu posms, ūdens vecums, hlors, atlikums, avota izsekošana, strupceļš, csv, papildinājums
from: 76809f01
---

WaterCraft ir papildinājums, kas darbojas ar ūdens tīklu, ko jau esat uzzīmējis ar ūdensvada maģistrāļu rīkiem. Tas pievieno cilni labās puses panelim ar četrām sadaļām.

:::warning
Tikai aprēķinu palīglīdzeklis. Tas pārbaudīts pret rokas aprēķiniem uz izdomātiem tīkliem, nevis uz reāla komunālā uzņēmuma modeļa. Katru rezultātu jāpārbauda ūdensapgādes inženierim. Sūkņu stacijas, otrās kārtas sabrukums un scenāriji vēl nav iekļauti.
:::

## Ko jūs darīsiet

- Pievienojiet tīklam klientus kā pieprasījumus.
- Atrodiet hidrantus, kuros plūsma ir mazāka par nepieciešamo.
- Atrodiet maģistrāles, kuru atslēgšana visvairāk ietekmē.
- Atrodiet vecu ūdeni un zemu hlora līmeni.

## Soļi

1. Atveriet {{ui:Iestatījumi}} › {{ui:Papildinājumi}} un ieslēdziet {{ui:WaterCraft (ūdensapgāde)}}. Labās puses panelī parādās cilne {{ui:WaterCraft}}.
2. Vispirms uzzīmējiet rezervuāru, mezglus un caurules ar ūdensvada maģistrāļu rīkiem (skatiet [Ūdensvada maģistrāles](topic:water-mains)). Bez tīkla cilne jums to pateiks.
3. Sadaļā {{ui:Pieprasījumi}} ielīmējiet vienu klientu katrā rindā: id, x, y, veids, daudzums. Izvēlieties {{ui:Maksimālās plūsmas koeficients}} un {{ui:Stundu profils}} (dzīvojamā diena, komercdiena, vienmērīgs vai saglabāt profilu, kā tas ir). Nospiediet {{ui:Pārbaudīt}}, lai redzētu, kur katrs klients nonāk (tuvākajā mezglā), tad {{ui:Ievietot tīklā}}. Atsaukt atgriež pieprasījumus.
4. Sadaļā {{ui:Ugunsdzēsības plūsma}} iestatiet nepieciešamo plūsmu un atlikumspiedienu, izvēlieties, vai atlikumspiediens tiek noturēts {{ui:Tikai pie hidranta}} vai {{ui:Visā sistēmā (stingrāk)}}, un nospiediet {{ui:Projekcija}}. Katrs hidrants ir uzskaitīts, sākot ar sliktāko, kā atbilst vai nepietiek.
5. Sadaļā {{ui:Kura maģistrāle ir svarīgākā}} izvēlieties {{ui:pa vienai caurulei}} vai {{ui:pa vienam noslēgvārstu posmam}}, un nospiediet {{ui:Projekcija}}. Katrā pārtraukumā redzams atslēgtais pieprasījums, atslēgtie mezgli, mezgli, kas tagad ir zem minimālā spiediena, un zemākais atlikušais spiediens.
6. Sadaļā {{ui:Ūdens vecums un hlors}} izvēlieties, ko sekot (ūdens vecums, hlors vai avota izsekošana), iestatiet darbības stundas un vēlamās robežvērtības un nospiediet {{ui:Projekcija}}. Tiek uzskaitīti mezgli ārpus jūsu robežvērtībām.
7. Jebkuras tabulas apakšā nospiediet {{ui:Saglabāt kā CSV}}, lai to saglabātu.

## Piezīmes

- Nepieciešamā ugunsdzēsības plūsma un patēriņš vienā mājā vai akrā ir sākuma vērtības, nevis standarti. Izmantojiet sava ūdensapgādes uzņēmuma datus.
- Caurule, ko daļēji šķeļ vārsts, tiek slēgta visa, tāpēc parādītais pārtraukums ir nedaudz sliktāks nekā reālais.
- Ilgi palaidiet ūdens kvalitātes sadaļu, līdz dienas profils atkārtojas, pirms lasāt pēdējo dienu.
- {{ui:Apturēt}} agrīni beidz garu projekciju; saraksts tad rāda tikai to, kas paveikts.
- Jūsu tīkls paliek šajā projektā un šajā datorā. Nekas nekur netiek nosūtīts.
