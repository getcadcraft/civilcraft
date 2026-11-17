---
title: Ukuwa nokungcindezeleka
summary: Izimo zakho zomthwalo (izinga lokushisa, umoya, iqhwa) nemikhawulo yokungcindezeleka, indlela i-CivilCraft ebala ngayo ukungcindezeleka kwesigaba ngasinye, namathebula okufaka umugqa.
keywords: ukuwa, ukungcindezeleka, isimo somthwalo, izinga lokushisa, umoya, iqhwa, iqhwa elingalingani, ruling span, equivalent span, ushintsho lwesimo, catenary, ithebula lokufaka umugqa, amandla okuqhekeka, ukucindezeleka kwansuku zonke
from: f8876c35
---

## Izimo zomthwalo nemikhawulo

{{ui:More}} › {{ui:Load cases and limits…}} ihlela imithetho egcina yonke intambo kuphrojekthi ilandela.

- **Izimo zomthwalo**: izinga lokushisa, ingcindezi yomoya ku-conductor (Pa), kanye neqhwa elisuka phakathi (mm, nobuningi bawo). Icala lokuqala ingesokuqala.
- **Imikhawulo yokungcindezeleka**: ingxenye yamandla okuqhekeka e-conductor, ngokungcindezeleka okungezansi noma ngokungcindezeleka okukhulu kakhulu esekelweni, ngesimo esisodwa somthwalo. Noma nika ukungcindezeleka okungezansi ngokwakho.
- **Izikhala ezivumelekile**: isikhala e-conductor agcina phezu komhlaba, umgwaqo, isakhiwo nezinye. Engeza, qamba kabusha futhi susa: zakho. Ngaphansi kwazo, khetha imithetho ye-**Izitshalo zomhlaba ngaphansi komugqa**, **Izindonga zomhlaba ngaphansi komugqa** kanye **Ukuwela okungaphansi komhlaba**.
- **Izimo ezisetshenziswa ukuhlola**: yiliphi icala elinika ukuwa okukhulu kakhulu (kushisa), ukuswinga kwe-insulator (umoya), iqhwa, kanye neqhwa ohlangothini olulodwa lwesekelo.
- **Izinto**: inani lokuhlukana kwezigxobo k, ukuswinga okukhulu kakhulu kwe-insulator, isinamba esiqinile ezimbalwa kanye nezingcindezi zezikhala, ama-engile okuguqula okwenza izikhala zesekelo namakhoni, ubude obuncane bokumbozwa kwezingcingo ezingaphansi komhlaba, nokwehla kwevolthi okukhulu kakhulu.

## Amaphakhi: imithetho nomtapo wezwe

Akukho mithetho yezwe efakwe ku-CivilCraft. **Iphakhi** igcina isethi yemithetho notapo lwayo kufayela elilodwa (`.cclinepack.json`), lezwe, lomnikazi wenethiwekhi noma lenkampani:

- **Londoloza njengephakhi…** ku-{{ui:Load cases and limits…}} ibhala isethi yemithetho ebonisiwe notapo lwakho (noma, uma notapo lwakho lungekho okwamanje, izinto esezisetshenziswa yiprojekthi). Thayipha **Izwe noma isifunda** kuqala.
- **Vula isethi yemithetho noma iphakhi…** ifunda iphakhi, ifayela lemithetho noma ifayela lotapo. Imithetho yephakhi ibonakala kwingxoxo (chofoza **Sebenzisa** ukuze uyisebenzise) nezinto zalo ziya notapweni lwakho.
- Amaphakhi abelwana ngawo abantu abanye adweshwa ku-ikhasi lezengezo ngaphansi kwe-**Amaphakhi emigqa kagesi**. Amaphakhi amabili esibonelo akhombisa ifomethi; akusiwo imithetho yanoma yisiphi isizwe.

Iphakhi ngalinye liyahlolwa lapho livulwa, njengenoma yiliphi ifayela. Hlola ngayinye inani ngokwesilinganiso esisebenzayo ngaphambi kokuthi kwakhiwe lutho.

Kukhona amasethi emithetho esibonelo amabili okuqala ngawo: **Isibonelo: isimo sezulu esibandayo** no **Isibonelo: isimo sezulu esithambile**. Izinombolo zawo azivela kunoma yisiphi isilinganiso: setha amanani ayo ayinikeza isilinganiso sakho. {{ui:Save rules}} no {{ui:Open rules…}} zabelana ngesethi yemithetho njengefayela.

## Indlela ukungcindezeleka okubalwa ngayo

Kuso ngasinye isigaba phakathi kwezindawo ezimile:

1. **Ibanga elilawulayo** ngu √(ΣL³ ÷ ΣL) walo amabanga.
2. Umkhawulo ngamunye uguqulwa ube ukungcindezeleka okuqondile esimweni sokuqala ngokusebenzisa **ukulinganisa kwoshintsho lwesimo** ebangeni elilawulayo: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Okuqinile kakhulu kubeka ukungcindezeleka.
3. Ukungcindezeleka kwesimo ngasinye somthwalo kulandela kulelo elilodwa, futhi isimo sesikhala ngasinye siyi-**catenary** eqondile phakathi kwamaphoyinti ayo amabili okuxhuma (kuhlanganise nezikhala ezisezintabeni): ukuwa kusuka kumugqa wesihloko, ubude, nokungcindezeleka ekugcineni ngakunye.

Umthwalo ngemitha ngesimo: isisindo nqo iqhwa (indawo yeqhwa × ubuningi × g) ngokuma; ingcindezi yomoya × ububanzi beqhwa ngokuthuthukela phansi.

## Amathebula okufaka umugqa

{{ui:More}} › {{ui:Stringing tables…}} ibala, ngesigaba ngasinye, ukungcindezeleka okuqondile kanye nokuwa kwesikhala ngasinye ngezinga lokushisa ngalinye lesethi yemithetho (ukusuka ku-−5 °C kuya ku-40 °C ngo-5 °C ukuqala), emoyeni onganyakazi. Yigcine, kanye nethebula lezinsika, njenge-CSV.

Akubalwa: ukuhamba kancane kwe-conductor eminyakeni, nokunwebeka kwe-conductor entsha. Yengeze ngezinga lokushisa oqamba ngalo.
