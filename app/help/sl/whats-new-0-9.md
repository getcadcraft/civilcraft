---
title: Kaj je novega v 0.9
summary: Predloge koridorjev in terena, prijemi in gumbi za izbiro med risanjem, analiza GIS s tabelo atributov, študije sence, sončnega donosa, udobja in vetra za mesto, pogled Upodobitev v 3D ter dodatka Oblaki točk in WaterCraft.
keywords: kaj je novega, 0.9, opombe ob izdaji, predloge koridorjev, predloge terena, urejevalnik predlog, tipični prerez, več koridorjev, prijem, prijemi, izbira, premakni, kopiraj, zasukaj, tangenta, upodobitev, 3D upodobitev, analiza gis, pas okoli, prekrivanje, prostorsko združevanje, tabela atributov, slog po atributu, študija sence, sončni donos, utci, udobje na prostem, študija vetra, openfoam, oblaki točk, las, laz, watercraft, pretok za gašenje, hidrant, starost vode, klor, odjemi, namigi, postavitev, kaj je novega, opombe ob izdaji, dnevnik sprememb, spremembe, 0.8, 0.8.1, različica, nove funkcije, dež, meteorna voda, zajezitev vode, preliv, zemeljska dela, uravnoteženje, izkop in nasip, odvoz, najboljša pot, najmanjši strošek, trasa, zadrževalnik, iztok, upadanje, prosti bord, napredek, meritev, dron, deponija, naslov v lokacijo, parcela, tla, poplava, stabilnost pobočja, bishop, posedanje, križišče, označbe, znaki, preglednost, izravnava, najmanjši kvadrati, poligonski vlak, odprti kop, blokovni model, radijska zveza, fresnel, kretnica, križanje, jeziki, težave, live, dwg
from: d7ac5b14
---

To so spremembe v CivilCraft 0.9 v primerjavi z 0.8.1. CivilCraft 0.9 je del CadCraft Studio 0.9 in njegovih osmih aplikacij. Veliki deli so predloge koridorjev in terena, prijemi med risanjem, analiza GIS, študije sonca mesta, sončnega donosa, udobja in vetra ter dva dodatka: Oblaki točk in WaterCraft.

## Novo

### Predloge koridorjev in terena

- **Predloge koridorjev.** Odprite {{ui:Površje}} › {{ui:Več}} › {{ui:Predloge koridorjev…}} (ali vpišite {{cmd:TEMPLATES}}). Predloga je majhen prerez s komponentami, odmiki, nagibi, materiali in kodami točk. Hranite jih v projektu, v {{ui:Moja knjižnica}} ali kot datoteko `.cctemplates.json`. Urejevalnik predlog prikazuje risbo v pravi velikosti in navaja težave, medtem ko tipkate.
- **Gradnja iz predlog po stacionaži.** Izberite trasо in vklopite {{ui:Gradi iz predlog po stacionaži}} v njenih Lastnostih. Vsaka stran vsake regije ima svoj seznam tlakovanja in svoj končni pogoj. {{ui:Dodaj koridor}} pod {{ui:Koridorji na tej trasi}} postavi več koridorjev na eno trasо.
- **Predloge terena.** {{ui:Površje}} › {{ui:Več}} › {{ui:Predloge terena…}} (ali vpišite {{cmd:TERRAINTEMPLATES}}) položi plasti materialov, kot so humus ali tlakovanje in podlaga, na teren, z površino in prostornino za vsako plast. Glejte [Predloge koridorjev in predloge terena](topic:corridor-templates).

### Risanje

- **Prijemi.** Orodja Trasa, Ploščad, Parcela, Masa, Karakteristična črta, Meri, Meja in Prispevno območje se prilepijo na geodetske točke, PI-je, vogale, oglišča in objekte, z oznako ob markerju. Držite {{key:Alt}} za prosto točko.
- **Gumbi za izbiro, tangenta ter premik, kopiranje in zasukanje.** Pri ploščadi, parceli in vogalih karakteristične črte so polja za vzhodno (E) in severno (N) koordinato ter gumb za izbiro s križcem. Lastnosti imajo tudi {{ui:Tangenta iz dveh točk}} za trase in {{ui:Premakni, kopiraj in zasukaj}} za trase, ploščadi, parcele in karakteristične črte. Glejte [Risanje s prijemi, izbranimi vogali ter premikanjem, kopiranjem in zasukom](topic:draft-with-snaps).
- **Pogled Upodobitev v 3D.** Gumb {{ui:Upodobitev}} na vrstici 3D nariše teren z naravnimi barvami, nebom, meglo in mehkimi sencami. Model ne spremeni. Meni {{ui:Sonce}} ima zdaj gumba {{ui:Uporabi}} in {{ui:Zapri}}. Glejte [Ogled mesta v 3D](topic:site-3d).
- **Plošče se odpirajo po en razdelek naenkrat.** Leva plošča in plošča Lastnosti odpreta en razdelek in zaprejo druge, ploščice traku krajinske ureditve, ki držijo več orodij, pa so razdeljeni gumbi.

### Analiza GIS

- **Analiziraj.** {{ui:Površje}} › {{ui:Več}} › {{ui:Analiziraj}} ponuja pas okoli, prekrivanje, prostorsko združevanje, izbiro po atributu ali obliki in merjenje. Vsako orodje ustvari nov sloj v enem koraku razveljavitve.
- **Tabela atributov.** Meni s tremi pikami sloja ima {{ui:Tabela atributov…}} in {{ui:Slog po atributu…}}. Glejte [Analiza slojev GIS](topic:gis-analysis) in [Delo s tabelo atributov sloja](topic:gis-table).

### Mesto: sonce, sončni donos, udobje in veter

- **Razdelek okolje.** Izberite maso: razdelek {{ui:Okolje}} je pod {{ui:Ure sonca}} v njenih Lastnostih. Vsebuje študijo sence (zemljevid, tabelo, animacijo, CSV), sončni donos iz vremenske datoteke tipičnega leta (.epw) in zunanje udobje (UTCI).
- **Veter, samo za presejanje.** {{ui:Zaženi študijo vetra}} pobarva teren od sedenja do neudobnega za vsako smer vetra v vremenski datoteki. Ni preverjeno in plošča to pove.
- **Dodatek za veter na pešcih (OpenFOAM).** Izklopljen, dokler ga ne vklopite v {{ui:Nastavitve}} › {{ui:Dodatki}}. OpenFOAM je programska oprema, ki jo namestite sami. Glejte [Senca, sončni donos in zunanje udobje](topic:environment).

### Oblaki točk (dodatek)

- Vklopite {{ui:Oblaki točk}} v {{ui:Nastavitve}} › {{ui:Dodatki}}; v desni plošči se prikaže zavihek Oblaki točk. Odprite datoteko LAS ali LAZ, jo očistite, razvrstite na teren, rastlinje in stavbe, zgradite teren, plastnice in prostornine ter izvozite LAS ali LAZ. Glejte [Oblaki točk z drona ali skenerja](topic:point-clouds).

### WaterCraft (dodatek)

- Vklopite {{ui:WaterCraft (oskrba z vodo)}} v {{ui:Nastavitve}} › {{ui:Dodatki}}; prikaže se zavihek WaterCraft. Ima odjeme strank, pretok za gašenje pri vsakem hidrantu, kateri izpad cevi je najpomembnejši, ter starost vode in klor, vsako shranjeno kot CSV. Glejte [WaterCraft: odjemi, pretok za gašenje, izpadi in starost vode](topic:watercraft).

### Skupno delo

- V seji Live vidite kazalce in imena drug drugega v načrtu. Knjižnične rastline: CivilCraft krajinska ureditev začne iz svoje privzete zbirke knjižnice, {{ui:CivilCraft krajinska ureditev}}.

## V vseh programih

- Namigi se prikazujejo kot Bootstrap pojavna okna, začetni namig pa je mogoče zapreti.
- Vrstica zavihkov plošče, ki se ne prilega, se pomika namesto da bi bila odrezana.
- Naslovi zavihkov brskalnika se glasijo `<document> - CivilCraft | CadCraft`.
- {{ui:Nastavitve}} ima razdelek Postavitev, kjer so postavitve spustni seznam dvovrstičnih izbir.
- Enote teže in temperature so v {{ui:Nastavitve}} › {{ui:Globalno}} › {{ui:Enote}}.
- Seznam jezikov prikazuje jezike, za katere ima izdelava datoteke. Jeziki razen angleščine so strojni osnutki.

## Popravljeno

- Dodatka za iskanje naslova in preverjanje EnergyPlus ni bilo mogoče vklopiti; zdaj je mogoče.
- Pomoč zdaj pove, da dodatek Oblaki točk zapiše očiščen oblak kot LAS 1.4 ali LAZ.
- Klik na lastno ročico izbranega predmeta ne sproži več vleka ročice, ki je ustavila čakajoč izbor s križcem.

## Iskrene omejitve

- Primeri predlog koridorjev so nadomestni in ne temeljijo na nobenem standardu; inženir jih mora preveriti. Predloge terena ne dodajo površja in se ne risejo v 3D ali v pogledu prereza. Drugi koridor na trasi ni v izvozu IFC. Med dvema predlogama po stacionaži ni prehoda.
- Oblaki točk so bili preizkušeni na izmišljenih datotekah, ne na pravem posnetku z drona. Berejo se samo LAS in LAZ.
- Analiza GIS je bila preizkušena na izmišljenih slojih.
- Senca, sonce in udobje so ocene za načrtovanje; veter je neoverjen pregled. Nič od tega ni projektna vrednost.
- WaterCraft je pripomoček za izračune, preverjen na izmišljenih omrežjih. Vodnoinženir odloča, kaj so številke vredne.
- Jeziki poleg angleščine so strojni osnutki.
- Namestitveni programi za Windows niso podpisani s kodo, slika diska za macOS ni notarizirana.

## Prej: 0.8 in 0.8.1

To so spremembe v CivilCraft 0.8 (2026-11-01) in 0.8.1 (2026-11-02) v primerjavi z 0.7. Veliki novi deli so orodja, ki preizkušajo vaše niveliranje in mesto (dež, zemeljska dela, poti, zadrževalniki, napredek), ter šest računskih oken za teren, ceste, meritve, rudnike, povezave in železnico.

### Novo

**Preizkusite niveliranje**

- **Naredi dež …** ({{ui:Površje}}) spusti nevihto na niveliran teren. Spremljate, kako voda odteka s ploščadi, zajezi v nizkih kotih in preliva čez prevelike zadrževalnike. Tek je animiran in prikaže prostornine, največji iztok ter CSV vsakega zadrževalnika. Privzeta celica je groba, da je prvi pogled hiter; finejša celica je počasnejša. Zadrževalniki, ki se prelivajo, se prikažejo tudi v plošči Težave.
- **Uravnoteženje zemeljskih del …** dvigne ali spusti ploščad, dokler izkop ni enak nasipu, in pokaže tabelo odvoza med njima.
- **Najboljša trasa …**: izberite začetek in konec; CivilCraft poišče najcenejšo pot čez teren, ki ostane v vaših mejah nagiba in krivine, nato iz nje naredi trasо.
- **Zadrževalniki …** izračuna stopnjo in shranjevanje iz vašega terena, sprejme iztočne naprave (odprtina, jez, V-zareza, preliv), pelje nevihto skozi zadrževalnik in preveri zadržani največji pretok, čas upadanja ter prosti bord.
- **Napredek iz posnetkov …** primerja površja dronov ali skeniranj iz različnih datumov z zemljo, kakršna je bila, in z načrtom: odstotek dokončanja po prostornini, območja, izkopana preveč in zasuta preveč, deponije ter kdaj delo konča s tem tempom (označeno kot ocena).

**Poznajte mesto**

- **Naslov v lokacijo …** združi odprte podatke o parcelah, stavbah, prostorski ureditvi, tleh, poplavah in terenu na eni lokaciji. Lokacijo lahko hranite v datoteki projekta: vpisani naslov, vsak vir z dnem, ko ste ga prenesli, in njegovo licenco, ter kaj je prišlo nazaj. Ko ponovno odprete ali delite projekt, je lokacija še tam, brez ponovnega prenosa. Shranite jo lahko tudi kot datoteko lokacije ali pošljete v BimCraft. Glejte [Naslov v lokacijo](topic:address-to-site).

**Teren, ceste, meritve, rudniki, povezave in železnica**

- **Tla in brežine …** nariše profil tal med vrtinami, ki jih vpišete. Bishopova metoda nato išče kritični krog na vašem terenu, z gladino podzemne vode, dodatno obtežbo in koeficientom potresa; posedanje temelja dobi konsolidacijo, takojšnje posedanje in čas.
- **Križišča in označbe …** sestavi kraka z robnimi krivinami (en polmer na krak ali trikrožni loki), preglednost za projektno hitrost, preverjanje trikotnikov preglednosti, prehode za pešce, ustavne črte, označbe in znake s seznamom znakov. Narisani so na načrtu in shranjeni kot .dxf z imenovanimi sloji.
- **Izravnava meritev …** izvede izravnavo poligonskega vlaka ali mreže po metodi najmanjših kvadratov: izravnane koordinate, elipse napak, test hi-kvadrat in oznako meritve, ki se ne ujema. Prosta omrežja, zapiranje poligonskega vlaka po kompasnem pravilu ter datoteke terenskih meritev RW5, GSI, JobXML ali CSV so vključeni, izravnane točke pa se shranijo kot CSV.
- **Odprti kopi …** spremeni vrtalne vzorce v blokovni model in končni kop znotraj vašega kota pobočja, z razmerjem jalovine, tabelo po etažah ter krivuljo stopnje in tonaže. Na voljo so tudi gnezdeni kopi po faktorju prihodka in proizvodni načrt z diskontiranim denarnim tokom.
- **Radijske zveze …** preveri vidljivost nad vašim terenom z ukrivljenostjo Zemlje, prvo Fresnelovo cono, proračunom povezave, rezervo pred zamiranjem in izpadom zaradi večpotnosti ter poda višino jambora, ki bi odprla pot. Ima tudi proračune izgub v optičnih vlaknih, količine poti in veter na stolpu.
- **Železniške kretnice …** izdelajo kretnico iz njene številke križišča (frog), križnice med vzporednimi tiri in konstrukcijski profil, nagnjen zaradi previšanja in razširjen v krivini. Kretnica je lahko na postaji trase.

Glejte [Tla, križišča, izravnava meritev, odprti kopi, radijske zveze in kretnice](topic:soils-roads-survey-mines-links).

### V vseh programih

- **Jeziki.** 54 jezikov, deset novih. Jeziki razen angleščine so strojni osnutki, dokler jih ne prebere izvorni govorec. Pomoč je večinoma še v angleščini.
- **Vrstice orodne vrstice.** {{ui:Nastavitve}} › {{ui:Splošno}} › {{ui:Vrstice orodne vrstice}}: Prelomi (kot prej), 2 vrstici ali 1 vrstica. Trak CivilCraft prikaže najbolj uporabljeno orodje veliko, naslednja majhna, ostala pa za puščico imena skupine.
- **Vhodne naprave.** Sledilna ploščica, pisalo, 3D miška, krmilnik in MIDI lahko upravljajo aplikacije.
- **Težave.** Plošča Težave opozarja v vseh aplikacijah, s preverjanji, ki berejo pakete predpisov.
- **Živo.** Pogled na to, kdo je kje v seji Live.
- **Dodatki.** Seznam dodatkov, z dodatki za osvetlitev.
- **Povežite svojo umetno inteligenco.** Vsak pomočnik, ki ga povežete, lahko upravlja orodja CivilCraft. Pride z opombo, da povezovanje z enim klikom v CadCraft Studio in gostujoči povezovalnik še nista pripravljena. Glejte [Naj pomočnik z umetno inteligenco dela z vašim mestom](topic:assistants).

### Popravljeno v 0.8.1

- **Razdelek classes DWG.** Prebran je bil kot napačen tip (GitHub cadcraft#5). Popravljeno v CivilCraft skupaj s CadCraft, BimCraft, ModelCraft in TakeoffCraft.
- **Menjava jezika med delovanjem.** CadCraft Studio in pakirane izdaje lahko menjajo jezik med delovanjem. Prej so bile samo v angleščini. Še ni preizkušeno na vseh platformah: sporočite nam, če se jezik ne spremeni.

### Še ni v tej različici

- **To so pripomočki za izračune.** Vsak rezultat v novih oknih potrebuje preverjanje inženirja. Začetne trdnosti tal izhajajo iz tipičnih vrednosti za skupino tal, okno pa to pove.
- **Naredi dež.** Zagon na vzorčnem mestu lahko v brskalniku traja več kot dve minuti pri finih celicah. Preverjen je bil na ročnih primerih in V-obliki prispevnega območja, še ne na pravem niveliranem mestu.
- **Naslov v lokacijo.** Bere odprte datoteke podatkov, ki jih prinesete, in je bil preizkušen samo na naših lastnih datotekah. Drevesa niso vir. Pridobivanje virov za vas čaka na besedilo o zasebnosti.
- **Napredek iz posnetkov.** Preizkušeno samo na izmišljenih posnetkih. Napredek na listih in označbah (MarkupCraft) ter primerjava s skeniranjem z modelom (BimCraft) nista izdelana.
- **Tla in brežine.** Samo krožne ploskve: brez iskanja klina ali bloka in brez nateznih razpok.
- **Križišča.** En polmer na krak, brez vrtenja tovornjakov, in še ne gredo v koridor.
- **Datoteke terenskih meritev.** Bralniki so bili napisani po javnih opisih formatov in preizkušeni na datotekah, ki smo jih naredili. Želimo prave datoteke instrumentov.
- **Povezave in železnica.** Radijske zveze: samo izguba v prostem prostoru in večpotnost (brez zamiranja zaradi dežja ali vzorcev anten), in brez železniškega standarda: vsaka omejitev železnice je nadomestna, z osnutkovnimi številkami, ki jih noben železniški inženir ni preveril.
- **Windows in macOS.** 0.8 ni podpisan s kodo. Windows lahko opozori, macOS pa zahteva desni klik in nato Odpri.

Vse drugo je v [Še ni izdelano](topic:not-built-yet). Za prejšnjo izdajo glejte [Kaj je novega v 0.7](topic:whats-new-0-7).
