---
title: Kaj je novega v različicah 0.8 in 0.8.1
summary: CivilCraft 0.8 dodaja Naredi dež (nevihtni tek čez vašo izravnavo), uravnoteženje zemeljskih del, iskalnik najboljše trase, zadrževalnike, napredek iz posnetkov, uvoznik naslova v lokacijo, ki ohrani lokacijo v projektu, ter okna za tla in brežine, križišča in označbe, izravnavo meritev, odprte kope, radijske zveze in železniške kretnice. 0.8.1 popravi branje datotek DWG.
keywords: kaj je novega, opombe ob izdaji, dnevnik sprememb, spremembe, 0.8, 0.8.1, različica, nove funkcije, dež, nevihta, zastajanje vode, prelivanje, zemeljska dela, uravnoteženje, izkop in nasip, odvoz, najboljša trasa, najcenejša pot, trasa, zadrževalnik, iztok, praznjenje, prosti bok, napredek, posnetek, dron, skladišče materiala, naslov v lokacijo, parcela, tla, poplava, stabilnost brežin, Bishop, posedek, križišče, označbe, znaki, preglednost, izravnava, najmanjši kvadrati, poligonski vlak, odprti kop, blokovni model, radijska zveza, Fresnel, kretnica, jeziki, težave, v živo, dwg
from: b0932cf0
---

To je, kar se je spremenilo v CivilCrafu 0.8 (2026-11-01) in 0.8.1 (2026-11-02), v primerjavi z 0.7. Veliki novi deli so orodja, ki preizkušajo vašo izravnavo in lokacijo (dež, zemeljska dela, poti, zadrževalniki, napredek), ter šest računskih oken za teren, ceste, meritve, rudnike, povezave in železnico.

## Novo

### Preizkusite izravnavo

- **Naredi dež.** {{ui:Naredi dež …}} (pod {{ui:Površje}}) na izravnan teren spusti nevihto. Vidite, kako voda odteka z ploščadi, zastaja v nizkih kotih in preliva čez zadrževalnike, ki so premajhni. Tek je animiran in prikaže prostornine, največji odtok ter CSV z vsakim zadrževalnikom. Privzeta celica je groba, zato je prvi pregled hiter; finejša celica je počasnejša. Zadrževalniki, ki se prelivajo, se prikažejo tudi v podoknu **Težave**.
- **Uravnoteženje zemeljskih del.** {{ui:Uravnoteženje zemeljskih del …}} dvigne ali spusti ploščad, dokler izkop ni enak nasipu, in prikaže tabelo odvoza med njima.
- **Najboljša trasa.** {{ui:Najboljša trasa …}}: izberite začetek in konec, CivilCraft pa poišče najcenejšo pot čez teren, ki ostane znotraj vaših omejitev naklona in krivin, nato iz nje ustvari traso.
- **Zadrževalniki.** {{ui:Zadrževalniki …}} iz vašega terena izračuna višine gladine in prostornine, sprejme iztočne naprave (odprtino, jez, V-zarez, prelivnik), prek zadrževalnika vodi nevihto in preveri zadržani največji pretok, čas praznjenja ter prosti bok.
- **Napredek iz posnetkov.** {{ui:Napredek iz posnetkov …}} primerja površja dronov ali skeniranj z različnih datumov z nekdanjim terenom in z načrtom: odstotek opravljenega glede na prostornino, preveč izkopane in preveč nasute površine, skladišča materiala ter kdaj bo delo končano pri tem tempu (označeno kot ocena).

### Poznajte lokacijo

- **Naslov v lokacijo.** {{ui:Naslov v lokacijo …}} združi odprte podatke o parceli, stavbi, namenski rabi, tleh, poplavah in terenu na eni lokaciji. Lokacijo lahko ohranite v datoteki projekta: vpisani naslov, vsak vir z datumom pridobitve in licenco ter vrnjene podatke. Ko projekt znova odprete ali delite, je lokacija še vedno tam, brez ponovnega pridobivanja. Lokacijo lahko shranite tudi kot datoteko lokacije ali pošljete v BimCraft. Glejte [Naslov v lokacijo](topic:address-to-site).

### Teren, ceste, meritve, rudniki, povezave in železnica

- **Tla in brežine.** {{ui:Tla in brežine …}} nariše profil tal med vrtinami, ki jih vpišete. Bishopova metoda nato poišče kritični krog na vašem terenu z gladino podzemne vode, dodatno obtežbo in potresnim koeficientom; posedek temeljne stope vključuje konsolidacijo, takojšnji posedek in časovni potek.
- **Križišča in označbe.** {{ui:Križišča in označbe …}} poveže kraka s krivinami robnikov (en polmer na krak ali trisredinske krivine), preglednost za projektno hitrost, preverjanje preglednih trikotnikov, prehode za pešce, črte ustavljanja, označbe in znake z razpredelnico znakov. Narisani so na načrtu in shranjeni kot .dxf s poimenovanimi sloji.
- **Izravnava meritev.** {{ui:Izravnava meritev …}} izvede izravnavo poligonskega vlaka ali mreže po metodi najmanjših kvadratov: izravnane koordinate, elipse napak, test hi-kvadrat in oznako na meritvi, ki se ne ujema. Vključene so proste mreže, zapiranje poligonskega vlaka po kompasnem pravilu in RW5, datoteke terenskih meritev GSI, JobXML ali CSV, izravnane točke pa se shranijo kot CSV.
- **Odprti kopi.** {{ui:Odprti kopi …}} spremeni vzorce vrtin v blokovni model in končno jamo znotraj vašega kota brežine, s časovnim razmerjem jalovine, tabelo po etažah ter krivuljo kakovosti in tonaže. Na voljo sta tudi ugnezdene jame glede na faktor prihodka in načrt proizvodnje z diskontiranim denarnim tokom.
- **Radijske zveze.** {{ui:Radijske zveze …}} preveri vidljivost nad vašim terenom z izbočenostjo Zemlje, prvo Fresnelovo cono, proračunom povezave, rezervo za zamiranje in izpadom zaradi večpotja ter poda višino jambora, ki bi odprla pot. Prav tako izračuna proračune izgub optičnih vlaken, količine trase in obtežbo stolpa z vetrom.
- **Železniške kretnice.** {{ui:Železniške kretnice …}} izdela kretnico iz številke križišča, prečne prehode med vzporednimi tiri in gabarit konstrukcije, nagnjen zaradi nadvišanja tira in razširjen v krivini. Kretnica je lahko na stacionaži trase.

Glejte [Tla, križišča, izravnava meritev, odprti kopi, radijske zveze in kretnice](topic:soils-roads-survey-mines-links).

## V vseh aplikacijah

- **Jeziki.** 54 jezikov, deset novih. Jeziki, razen angleščine, so strojni osnutki, dokler jih ne prebere izvorni govorec. Teme pomoči so večinoma še v angleščini.
- **Vrstice orodne vrstice.** {{ui:Nastavitve}} › {{ui:Splošno}} › {{ui:Vrstice orodne vrstice}}: Prelomi (kot prej), 2 vrstici ali 1 vrstica. Trak CivilCrafta prikaže najpogosteje uporabljeno orodje veliko, naslednja majhna, ostala pa za puščico ob imenu skupine.
- **Vhodne naprave.** Sledilna ploščica, pisalo, 3D-miška, krmilnik in MIDI lahko upravljajo aplikacije.
- **Težave.** Podokno **Težave**, ki opozarja v vseh aplikacijah, s preverjanji, ki berejo sklope predpisov.
- **V živo.** Pogled na to, kdo je kje v seji v živo.
- **Dodatki.** Seznam dodatkov, vključno z dodatki za osvetlitev.
- **Povežite svojo umetno inteligenco.** Vsak pomočnik, ki ga povežete, lahko upravlja orodja CivilCrafta. Priložena je opomba, da enokratno povezovanje znotraj CadCraft Studio in gostovani povezovalnik še nista pripravljena. Glejte [Naj pomočnik z umetno inteligenco dela na vaši lokaciji](topic:assistants).

## Popravljeno v 0.8.1

- **Odsek DWG classes.** Bil je prebran kot napačen tip (GitHub cadcraft#5). Popravljeno v aplikaciji CivilCraft, skupaj z aplikacijami CadCraft, BimCraft, ModelCraft in TakeoffCraft.
- **Preklop jezika med delovanjem.** Aplikacija CadCraft Studio in pakirane izdaje lahko med delovanjem menjajo jezik. Prej so bile samo v angleščini. Še ni preizkušeno na vseh platformah: sporočite nam, če se jezik ne spremeni.

## Še ni v tej različici

- **To so računski pripomočki.** Vsak rezultat v novih oknih potrebuje pregled inženirja. Trdnosti tal izhajajo iz tipičnih vrednosti za skupino tal, okno pa to pove.
- **Naredi dež.** Tek na vzorčnem zemljišču lahko pri finejši celici v brskalniku traja več kot dve minuti. Preizkušen je bil na ročno izračunanih primerih in na V-obliki zbiralnega območja, še ne na pravi izravnani lokaciji.
- **Naslov v lokacijo.** Bere odprte podatkovne datoteke, ki jih prinesete, in je bil preizkušen samo na naših lastnih datotekah. Drevesa niso vir. Pridobivanje virov za vas je odvisno od besedila o zasebnosti.
- **Napredek iz posnetkov.** Preizkušeno samo na izmišljenih posnetkih. Napredka na listih in označbah (MarkupCraft) ter primerjave skeniranja z modelom (BimCraft) še ni izdelano.
- **Tla in brežine.** Samo krožne drsne ploskve: brez iskanja klinastih ali blokovnih ploskev in brez natezne razpoke.
- **Križišča.** En polmer na krak, brez poti vožnje tovornjakov, in še ne gredo v koridor.
- **Terenske datoteke.** Bralniki so bili napisani po javnih opisih formatov in preizkušeni na datotekah, ki smo jih naredili sami. Iščemo prave datoteke merilnih instrumentov.
- **Povezave in železnica.** Radijske zveze: samo izguba v prostem prostoru in večpotje (brez slabljenja zaradi dežja ali antenskih diagramov). Ni železniškega standarda: vsaka mejna vrednost za železnico je začasna vrednost z osnutkovnimi številkami, ki jih noben železniški inženir še ni preveril.
- **Windows in macOS.** Različica 0.8 nima digitalnega podpisa kode. Windows lahko opozori, macOS pa zahteva desni klik in nato Odpri.

Vse drugo je v [Še ni izdelano](topic:not-built-yet). Za prejšnjo izdajo glejte [Kaj je novega v različici 0.7](topic:whats-new-0-7).
