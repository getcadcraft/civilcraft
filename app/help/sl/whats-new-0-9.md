---
title: Kaj je novega v 0.9 (prej)
summary: Predloge koridorjev in terena, lovljenje ter gumbi Izberi med risanjem, analiza GIS s tabelo atributov, študije sence, sončne donosnosti, udobja in vetra za lokacijo, 3D pogled Upodobitev ter dodatka Oblaki točk in WaterCraft.
keywords: kaj je novega 0.9, prejšnja izdaja, kaj je novega, 0.9, opombe ob izdaji, predloge koridorjev, predloge terena, urejevalnik predlog, tipični prerez, več koridorjev, lovljenje, izberi, premakni, kopiraj, zasukaj, tangenta, upodobitev, 3D upodobitev, analiza gis, pas, prekrivanje, prostorska združitev, tabela atributov, slog po atributu, študija sence, sončna donosnost, utci, udobje na prostem, študija vetra, openfoam, oblaki točk, las, laz, watercraft, požarni pretok, hidrant, starost vode, klor, odjemi, namigi, postavitev, dnevnik sprememb, spremembe, 0.8, 0.8.1, različica, nove funkcije, dež, zastajanje vode, prelivanje, zemeljska dela, uravnoteženje, prevoz, najboljša trasa, zadrževalnik, iztok, praznjenje, prosti bok, napredek, geodetski posnetek, dron, kup materiala, naslov v lokacijo, parcela, tla, poplava, stabilnost pobočja, Bishop, posedanje, križišče, označbe, prometni znaki, preglednost, izravnava, najmanjši kvadrati, poligonski vlak, odprti kop, blokovni model, radijska zveza, Fresnel, kretnica, križni prehod, jeziki, težave, v živo, dwg
from: 4664522c
---

To je, kaj se je spremenilo v CivilCraft 0.9 v primerjavi z 0.8.1. CivilCraft 0.9 je del CadCraft Studio 0.9 in njegovih osmih aplikacij. Glavni deli so predloge koridorjev in terena, lovljenje med risanjem, analiza GIS, študije sonca na lokaciji, sončne donosnosti, udobja in vetra ter dva dodatka: Oblaki točk in WaterCraft.

## Novo

### Predloge koridorjev in terena

- **Predloge koridorjev.** Odprite {{ui:Površje}} › {{ui:Več}} › {{ui:Predloge koridorjev…}} (ali vpišite {{cmd:TEMPLATES}}). Predloga je majhen prečni prerez s sestavnimi deli, odmiki, nakloni, materiali in kodami točk. Hranite jih v projektu, v {{ui:Moja knjižnica}} ali kot datoteko `.cctemplates.json`. Urejevalnik predlog prikazuje risbo v pravem merilu in med vpisovanjem navaja težave.
- **Gradnja iz predlog po stacionaži.** Izberite traso in v njenih **Lastnostih** vklopite {{ui:Gradi iz predlog po stacionaži}}. Vsaka stran vsakega območja ima svoj seznam vozišč in svoje končno stanje. {{ui:Dodaj koridor}} pod {{ui:Koridorji na tej trasi}} postavi več koridorjev na eno traso.
- **Predloge terena.** {{ui:Površje}} › {{ui:Več}} › {{ui:Predloge terena…}} (ali vpišite {{cmd:TERRAINTEMPLATES}}) položi plasti materialov, kot so humus ali vozišče in nosilna plast, na teren, s površino in prostornino za vsako plast. Glejte [Predloge koridorjev in terena](topic:corridor-templates).

### Risanje

- **Lovljenje.** Orodja Trasa, Ploščad, Parcela, Masa, Karakteristična črta, Meri, Meja in Zbirno območje se lovijo na geodetske točke, PI, vogale, oglišča in objekte, z napisom ob oznaki. Držite {{key:Alt}} za prosto točko.
- **Gumbi Izberi, tangenta ter premakni, kopiraj, zasukaj.** Vogali ploščadi, parcele in karakteristične črte imajo polja za vzhodno (E) in severno (N) koordinato ter gumb Izberi s križcem. **Lastnosti** imajo tudi {{ui:Tangenta iz dveh točk}} za trase in {{ui:Premakni, kopiraj in zasukaj}} za trase, ploščadi, parcele in karakteristične črte. Glejte [Risanje s lovljenjem, izbranimi vogali ter premikanjem, kopiranjem in zasukom](topic:draft-with-snaps).
- **Pogled upodobitve v 3D.** Gumb {{ui:Upodobitev}} na vrstici 3D nariše teren z naravnimi barvami, nebom, meglo in mehkimi senčami. Model ne spremeni. Meni {{ui:Sonce}} ima zdaj gumba {{ui:Uporabi}} in {{ui:Zapri}}. Glejte [Ogled lokacije v 3D](topic:site-3d).
- **Podokna se odprejo po en razdelek naenkrat.** Levo podokno in podokno Lastnosti odprejo en razdelek in zaprejo ostale, ploščice traku Krajina, ki držijo več orodij, pa so razdeljeni gumbi.

### Analiza GIS

- **Analiziraj.** {{ui:Površje}} › {{ui:Več}} › {{ui:Analiziraj}} ponuja pas (buffer), prekrivanje, prostorsko združitev, izbor po atributu ali obliki ter meritev. Vsako orodje ustvari nov sloj v enem koraku razveljavitve.
- **Tabela atributov.** Meni s tremi pikami sloja ima {{ui:Tabela atributov…}} in {{ui:Slog po atributu…}}. Glejte [Analiza slojev GIS](topic:gis-analysis) in [Delo s tabelo atributov sloja](topic:gis-table).

### Lokacija: sonce, sončna energija, udobje in veter

- **Razdelek Okolje.** Izberite maso: razdelek {{ui:Okolje}} je pod {{ui:Ure sonca}} v njenih **Lastnostih**. Ima študijo sence (zemljevid, tabelo, animacijo, CSV), sončni donos iz vremenske datoteke tipičnega leta (.epw) in zunanje udobje (UTCI).
- **Veter, samo presejanje.** {{ui:Zaženi študijo vetra}} pobarva teren od sedenja do neudobnega za vsako smer vetra v vremenski datoteki. Ni preverjeno, podokno to tudi pove.
- **Dodatek Veter za pešce (OpenFOAM).** Izklopljen, dokler ga ne vklopite v {{ui:Nastavitve}} › {{ui:Dodatki}}. OpenFOAM je programska oprema, ki jo namestite sami. Glejte [Senca, sončni donos in zunanje udobje](topic:environment).

### Oblaki točk (dodatek)

- Vklopite {{ui:Oblaki točk}} v {{ui:Nastavitve}} › {{ui:Dodatki}}; v desnem podoknu se prikaže zavihek Oblaki točk. Odprite datoteko LAS ali LAZ, jo očistite, razvrstite na teren, rastje in stavbe, zgradite teren, plastnice in prostornine ter izvozite LAS ali LAZ. Glejte [Oblaki točk iz drona ali skenerja](topic:point-clouds).

### WaterCraft (dodatek)

- Vklopite {{ui:WaterCraft (distribucija vode)}} v {{ui:Nastavitve}} › {{ui:Dodatki}}; prikaže se zavihek WaterCraft. Ima odjeme odjemalcev, požarni pretok pri vsakem hidrantu, kateri izpad voda najbolj škoduje ter starost vode in klor, vsak shranjen kot CSV. Glejte [WaterCraft: odjemi, požarni pretok, izpadi in starost vode](topic:watercraft).

### Skupno delo

- V seji v živo vidite kazalce in imena drug drugega v načrtu. Rastline knjižnice: CivilCraft Krajina začne s privzeto zbirko knjižnice, {{ui:CivilCraft krajina}}.

## V vseh aplikacijah

- Namigi se prikažejo kot pojavna okna Bootstrap, začetni nasvet pa se lahko zapre.
- Vrstica zavihkov podokna, ki se ne prilega, se pomika namesto da bi bila odrezana.
- Naslovi zavihkov brskalnika se glasijo `<document> - CivilCraft | CadCraft`.
- {{ui:Nastavitve}} imajo razdelek Postavitev, kjer so postavitve spustni seznam dvovrstičnih izbir.
- Enote mase in temperature so v {{ui:Nastavitve}} › {{ui:Globalno}} › {{ui:Enote}}.
- Seznam jezikov prikazuje jezike, za katere ima ta različica datoteke. Jeziki razen angleščine so strojni osnutki.

## Popravljeno

- Dodatkov za iskanje naslova in preverjanje EnergyPlus ni bilo mogoče vklopiti; zdaj je mogoče.
- Pomoč zdaj pove, da dodatek Oblaki točk zapiše očiščen oblak kot LAS 1.4 ali LAZ.
- Klik na lastno ročico izbranega objekta več ne sproži vlečenja ročice, ki je ustavilo čakajoči Izberi.

## Iskrene omejitve

- Primeri predlog koridorjev so nadomestne vrednosti brez standarda; inženir jih mora preveriti. Predloge terena ne dodajo površja in se ne rišejo v 3D ali v pogledu prereza. Drugi koridor na trasi ni v izvozu IFC. Med dvema predlogama po stacionaži ni zožitve.
- Oblaki točk so bili preizkušeni na izmišljenih datotekah, ne na pravem snemanju z dronom. Berejo se samo LAS in LAZ.
- Analiza GIS je bila preizkušena na izmišljenih slojih.
- Senca, sonce in udobje so načrtovalne ocene; veter je nepreverjeno presejanje. Nič od tega ni projektna vrednost.
- WaterCraft je pomoč pri izračunih, preverjena na izmišljenih omrežjih. Vodni inženir odloči, kaj številke veljajo.
- Jeziki poleg angleščine so strojni osnutki.
- Namestitveni programi za Windows niso podpisani s kodo, slika diska za macOS pa ni notarizirana.

Vse drugo je v [Še ni izdelano](topic:not-built-yet). Za prejšnjo izdajo glejte [Kaj je novega v 0.7](topic:whats-new-0-7).

## Prej: 0.8 in 0.8.1

To je, kaj se je spremenilo v CivilCraft 0.8 (2026-11-01) in 0.8.1 (2026-11-02) v primerjavi z 0.7. Glavni novi deli so orodja, ki preizkusijo vaše izravnave in lokacijo (dež, zemeljska dela, poti, zadrževalniki, napredek), ter šest oken za izračune za teren, ceste, geodezijo, rudnike, povezave in železnico.

### Novo

**Preizkusite izravnavo**

- **Naredi dež.** {{ui:Naredi dež …}} (pod {{ui:Površje}}) spusti nevihto na izravnani teren. Gledate, kako voda odteka s ploščadi, se zbira v nizkih kotih in prelije čez premajhne zadrževalnike. Zagon je animiran in da prostornine, največji iztok ter CSV vsakega zadrževalnika. Privzeta celica je groba, da je prvi pogled hiter; finejša celica je počasnejša. Zadrževalniki, ki se prelivajo, se prikažejo tudi v podoknu Težave.
- **Uravnoteženje zemeljskih del.** {{ui:Uravnoteženje zemeljskih del …}} dvigne ali spusti ploščad, dokler izkop ni enak nasipu, in prikaže tabelo prevozov med njima.
- **Najboljša trasa.** {{ui:Najboljša trasa …}}: izberite začetek in konec, CivilCraft poišče najcenejšo pot čez teren, ki ostane znotraj vaših omejitev naklona in krivin, nato iz nje naredi traso.
- **Zadrževalniki.** {{ui:Zadrževalniki …}} izračuna stopnjo in akumulacijo iz vašega terena, vzame iztočne naprave (odprtina, jez, V-zareza, preliv), vodi nevihto skozi zadrževalnik in preveri zadržani konični pretok, čas praznjenja ter prosti bok.
- **Napredek iz posnetkov.** {{ui:Napredek iz posnetkov …}} primerja površja z dronov ali skenerjev z različnih datumov s terenom, kakršen je bil, in s projektom: odstotek dokončanosti po prostornini, preveč izkopane in preveč zasute površine, kupi materiala ter kdaj se delo konča pri tem tempu (označeno kot ocena).

**Spoznajte lokacijo**

- **Naslov v lokacijo.** {{ui:Naslov v lokacijo …}} združi odprte podatke o parceli, stavbi, namenski rabi, tleh, poplavah in terenu na eni lokaciji. Lokacijo lahko hranite v projektni datoteki: vneseni naslov, vsak vir z dnem, ko ste ga prenesli, in njegovo licenco ter kaj je bilo vrnjeno. Ko projekt znova odprete ali delite, je lokacija še vedno tam, brez ponovnega prenosa. Lokacijo lahko shranite tudi kot datoteko lokacije ali pošljete v BimCraft. Glejte [Naslov v lokacijo](topic:address-to-site).

**Teren, ceste, geodezija, rudniki, povezave in železnica**

- **Tla in brežine.** {{ui:Tla in brežine …}} nariše profil tal med vrtinami, ki jih vnesete. Bishopova metoda nato poišče kritični krog na vašem terenu z gladino podzemne vode, dodatno obtežbo in koeficientom potresa; posedanje temelja dobi konsolidacijo, takojšnje posedanje in čas.
- **Križišča in označbe.** {{ui:Križišča in označbe …}} sestavi kraka skupaj z zaokrožitvami robnikov (en polmer na krak ali trikotne zaokrožitve s tremi središči), preglednost za projektno hitrost, preverjanje preglednostnih trikotnikov, prehode za pešce, ustavitvene črte, označbe in prometne znake z razporedom znakov. Narisani so v načrtu in shranjeni kot .dxf z imenovanimi sloji.
- **Izravnava meritev.** {{ui:Izravnava meritev …}} izvede izravnavo poligonskega vlaka ali mreže po metodi najmanjših kvadratov: izravnane koordinate, elipse napak, hi-kvadrat test in oznako meritve, ki se ne ujema. Vključene so proste mreže, zapiranje poligonskega vlaka po pravilu kompasa ter terenske datoteke RW5, GSI, JobXML ali CSV, izravnane točke pa se shranijo kot CSV.
- **Odprti kopi.** {{ui:Odprti kopi …}} spremeni vzorce vrtanja v blokovni model in končni kop znotraj vašega kota nagiba, s koeficientom jalovine, tabelo po etažah ter krivuljo vsebnosti in tonaže. Tudi gnezdeni kopi po faktorju prihodkov in načrt proizvodnje z diskontiranim denarnim tokom sta na voljo.
- **Radijske zveze.** {{ui:Radijske zveze …}} preveri vidljivost čez vaš teren z upognjenostjo Zemlje, prvo Fresnelovo cono, proračunom zveze, rezervo za zamiranje in izpadom zaradi večpotnosti ter poda višino jambora, ki bi očistila pot. Naredi tudi proračune izgub optičnih vlaken, količine trase in veter na stolpu.
- **Železniške kretnice.** {{ui:Železniške kretnice …}} naredi kretnico iz številke križišča (frog), križne prehode med vzporednimi tiri in profil objekta, nagnjen z nadvišanjem in razširjen na krivini. Kretnica je lahko na stacionaži trase.

Glejte [Tla, križišča, izravnava meritev, kopi, radijske zveze in kretnice](topic:soils-roads-survey-mines-links).

### V vseh aplikacijah

- **Jeziki.** 54 jezikov, deset novih. Jeziki razen angleščine so strojni osnutki, dokler jih ne prebere izvorni govorec. Teme pomoči so še večinoma v angleščini.
- **Vrstice orodne vrstice.** {{ui:Nastavitve}} › {{ui:Splošno}} › {{ui:Vrstice orodne vrstice}}: Prelomi (kot prej), 2 vrstici ali 1 vrstica. Trak CivilCraft prikaže najbolj uporabljeno orodje veliko, naslednja majhna, ostala za puščico imena skupine.
- **Vhodne naprave.** Sledilna ploščica, pisalo, 3D miška, krmilnik in MIDI lahko upravljajo aplikacije.
- **Težave.** Podokno Težave opozarja v vseh aplikacijah, s preverjanji, ki berejo regulativne pakete.
- **V živo.** Pogled na to, kdo je kje v seji v živo.
- **Dodatki.** Seznam dodatkov, med njimi dodatki za osvetlitev.
- **Povežite svojo umetno inteligenco.** Vsak pomočnik, ki ga povežete, lahko upravlja orodja CivilCraft. Izdaja vsebuje opombo, da povezovanje z enim klikom znotraj CadCraft Studio in gostujoči konektor še nista pripravljena. Glejte [Naj pomočnik z umetno inteligenco dela z vašo lokacijo](topic:assistants).

### Popravljeno v 0.8.1

- **Razdelek razredov DWG.** Bil je prebran kot napačen tip (GitHub cadcraft#5). Popravljeno v CivilCraft skupaj s CadCraft, BimCraft, ModelCraft in TakeoffCraft.
- **Preklapljanje jezika med delovanjem.** CadCraft Studio in pakirane izdaje lahko med delovanjem spremenijo jezik. Prej so bile samo v angleščini. Še ni preizkušeno na vseh platformah: sporočite nam, če se jezik ne spremeni.

### Še ni v tej različici

- **To so pomoči pri izračunih.** Vsak rezultat v novih oknih potrebuje pregled inženirja. Trdnosti tal se začnejo pri tipičnih vrednostih za skupino tal, okno to tudi pove.
- **Naredi dež.** Zagon na vzorčni lokaciji lahko v brskalniku pri finejši celici traja več kot dve minuti. Preverjeno je bilo z ročnimi primeri in V-obliko zbirnega območja, še ne na pravi izravnani lokaciji.
- **Naslov v lokacijo.** Bere odprte podatkovne datoteke, ki jih prinesete, in je bil preizkušen samo na naših lastnih datotekah. Drevesa niso vir. Prenašanje virov za vas čaka na besedilo o zasebnosti.
- **Napredek iz posnetkov.** Preizkušeno samo na izmišljenih posnetkih. Napredek na listih in označbah (MarkupCraft) ter primerjava skeniranja z modelom (BimCraft) nista izdelana.
- **Tla in brežine.** Samo krožne ploskve: brez iskanja klina ali bloka in brez napetostne razpoke.
- **Križišča.** En polmer na krak, brez voznih poti tovornjakov, in še ne vstopijo v koridor.
- **Terenske datoteke.** Bralniki so bili napisani po javnih opisih formatov in preizkušeni na datotekah, ki smo jih naredili. Želimo si pravih datotek instrumentov.
- **Povezave in železnica.** Radijske zveze: samo izguba v prostem prostoru in večpotnost (brez slabljenja zaradi dežja ali antenskih diagramov), in ni železniškega standarda: vsaka železniška omejitev je nadomestna, z osnutkovnimi številkami, ki jih noben železniški inženir ni preveril.
- **Windows in macOS.** 0.8 ni podpisan s kodo. Windows lahko opozori, macOS pa zahteva desni klik in nato Odpri.
