---
title: WaterCraft: patēriņš, ugunsdzēsības plūsma, pārtraukumi un ūdens vecums
summary: Ar WaterCraft papildinājumu pārvērsiet patērētājus ūdensvada pieprasījumos, pārbaudiet pieejamo plūsmu pie katra hidranta, redziet, kurš maģistrāles pārtraukums nodara vislielāko kaitējumu, un sekojiet ūdens vecumam un hloram visas dienas garumā.
keywords: watercraft, ūdens sadale, pieprasījumi, patērētāji, maksimālās plūsmas koeficients, pieprasījuma modelis, ugunsdzēsības plūsma, hidrants, atlikušais spiediens, kritiskums, pārtraukums, nošķirts posms, ūdens vecums, hlors, atlikums, avota izsekošana, strupceļš, csv, papildinājums
from: 066fb17a
---

WaterCraft ir papildinājums, kas darbojas ar ūdens tīklu, ko jau esat uzzīmējis ar Ūdensvadu rīkiem. Tas pievieno cilni labās puses panelī ar četrām sadaļām.

:::warning
Tikai aprēķinu palīglīdzeklis. To pārbaudīja pret manuāliem atrisinājumiem izdomātos tīklos, nevis reālā komunālā modelī. Ūdens inženierim jāpārbauda katrs rezultāts. Scenāriji, vadības noteikumi, vārsti un lauka mērījumi ir savas tēmas, "Scenāriji" un "Pētījumi", WaterCraft papildinājuma palīdzībā.
:::

## Ko jūs darīsiet

- Ievietot patērētājus tīklā kā pieprasījumus.
- Atrast hidrantus, kas nesasniedz nepieciešamo plūsmu.
- Atrast maģistrāles, kuru zudums ir vissvarīgākais.
- Atrast vecu ūdeni un zemu hlora līmeni.

## Soļi

1. Atveriet {{ui:Iestatījumi}} › {{ui:Papildinājumi}} un ieslēdziet {{ui:WaterCraft (ūdens sadale)}}. Labās puses panelī parādās cilne {{ui:WaterCraft}}.
2. Vispirms uzzīmējiet rezervuāru, mezglus un caurules ar Ūdensvadu rīkiem (skatiet [Ūdensvadi](topic:water-mains)). Bez tīkla cilne jums to pateiks.
3. Sadaļā {{ui:Pieprasījumi}} ielīmējiet vienu patērētāju katrā rindā: id, x, y, veids, daudzums. Izvēlieties {{ui:Maksimālās plūsmas koeficients}} un {{ui:Stundu modelis}} (mājsaimniecības diena, komercdiena, vienmērīgs vai saglabājiet esošo modeli). Nospiediet {{ui:Pārbaudīt}}, lai redzētu, kur katrs patērētājs nonāk (tuvākais mezgls), tad {{ui:Ievietot tīklā}}. {{ui:Atsaukt}} atņem pieprasījumus atpakaļ.
4. Sadaļā {{ui:Ugunsdzēsības plūsma}} iestatiet nepieciešamo plūsmu un atlikušo spiedienu, izvēlieties, vai atlikums tiek turēts {{ui:Tikai pie hidranta}} vai {{ui:Visā sistēmā (stingrāk)}}, un nospiediet {{ui:Projekcija}}. Katrs hidrants tiek uzskaitīts, sliktākais pirmais, kā atbilst vai trūkst.
5. Sadaļā {{ui:Kura maģistrāle ir svarīgākā}} izvēlieties {{ui:pa vienai caurulei}} vai {{ui:pa vienam nošķirtam posmam}} un nospiediet {{ui:Projekcija}}. Katrs pārtraukums rāda atslēgto pieprasījumu, atslēgtos mezglus, jaunus mezglus zem minimālā spiediena un zemāko atlikušo spiedienu.
6. Sadaļā {{ui:Ūdens vecums un hlors}} izvēlieties, ko sekot (ūdens vecums, hlors vai avota izsekošana), iestatiet stundas un vēlamos ierobežojumus, un nospiediet {{ui:Projekcija}}. Mezgli ārpus jūsu ierobežojumiem tiek uzskaitīti.
7. Zem jebkuras tabulas nospiediet {{ui:Saglabāt kā CSV}}, lai to paturētu.

## Piezīmes

- Nepieciešamā ugunsdzēsības plūsma un patēriņš uz mājokli vai uz akru ir sākuma vērtības, nevis standarti. Izmantojiet sava komunālā uzņēmuma skaitļus.
- Caurule, ko daļēji aizver vārsts, tiek slēgta pilnībā, tāpēc parādītais pārtraukums ir nedaudz sliktāks nekā reālais.
- Palaidiet ūdens kvalitātes sadaļu pietiekami ilgi, lai ikdienas modelis atkārtotos, pirms lasāt pēdējo dienu.
- {{ui:Apturēt}} beidz garu palaišanu agri; saraksts tad rāda tikai to, kas paveikts.
- Jūsu tīkls paliek šajā projektā un šajā datorā. Nekas netiek nosūtīts nekur.
