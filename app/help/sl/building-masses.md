---
title: Izrisovanje stavbnih mas na lokaciji
summary: Narišite stavbno maso na parceli, ji dodajte etaže in višino etaže, si oglejte njeno bruto tlorisno površino, izberite, kako sedi na nagnjenem terenu, potisnite in povlecite njeno višino v 3D ter jo pošljite v BimCraft ali shranite kot datoteko IFC.
keywords: masa, zasnova mas, stavbna masa, količina, tloris, etaže, višina etaže, bruto tlorisna površina, GFA, BTP, nagib, podstavek, izkop in nasip, potisni in povleci, 3D, študija lokacije, zgodnje načrtovanje, IFC, razvoj, BimCraft, A-MASS
from: e5a67c16
---

Stavbna masa je tlorisni obris, število etaž in višina etaže: zgodnje vprašanje „koliko stavbe tu sploh gre in kaj to naredi s terenom“. Mase so na načrtu z imenom, številom etaž in bruto tlorisno površino, gredo v tisk PDF ter v izvoz DWG in DXF na slojih `A-MASS` in `A-MASS-TEXT` ter so shranjene v datoteki projekta.

## Narišite maso

1. V **Lastnostih**, pod **Stavbne mase**, kliknite **Nariši maso**. (Je tudi v meniju **Več** v orodni vrstici poleg **Površje**.)
2. Kliknite vogale tlorisnega obrisa. Klik blizu oglišča parcele ali geodetske točke vzame natančen položaj te točke.
3. Ponovno kliknite prvi vogal ali pritisnite {{key:Enter}}, da končate. {{key:Backspace}} odstrani zadnji vogal; {{key:Esc}} ustavi.

Nova masa ima tri etaže in višino etaže 12 ft (3.6 m) ter pripada parceli, v kateri je njena sredina.

## Etaže, višina in površina

Kliknite maso, da spremenite njeno **Ime**, **Namembnost**, **Etaže**, **Višino etaže** in **Parcelo**. **Višina** je število etaž, pomnoženo z višino etaže: vpišete višino, število etaž pa postane najbližje celo število etaž (nikoli manj kot ena). **Tlorisni obris** in **Bruto tlorisna površina** (tlorisni obris, pomnožen s številom etaž) se izračunata samodejno.

## Na nagnjenem terenu

Teren pod maso se prebere iz površja: obstoječi teren ali urejeni teren, kjer ste izbrali **Predlagani teren (urejen)**. **Na nagnjenem terenu** pove, kje je pritličje:

- **Stopničasto**: pri povprečnem terenu pod tlorisnim obrisom. Nizka stran se napolni do njega, visoka pa se odreže, in ti dve se skoraj izenačita.
- **Podstavek**: pri najvišjem terenu. Trdna osnova napolni nizko stran.
- **Izkop**: pri najnižjem terenu. Visoka stran se odreže v grič.

Lastnosti prikažejo razpon terena pod maso, **Nivo pritličja** in prostornino nasipa in izkopa med terenom in tem nivojem. Mesto tlorisnega obrisa, ki je zunaj površja, se izpusti, Lastnosti pa povedo, koliko jih je.

## V 3D pogledu

Mase so narisane v 3D pogledu lokacije, z črto okoli vsake etaže in njihovimi imeni nad streho. **Prikaži** ima potrditveno polje za **Stavbne mase**. Kliknite eno, da jo izberete. Ko je masa izbrana:

- povlecite streho gor ali dol, da jo potisnete ali povlečete po eno etažo naenkrat, ali pritisnite {{key:PageUp}} in {{key:PageDown}};
- celotni premik je en korak razveljavitve.

Ulični pogled **Vožnja** prikazuje tudi mase, **Sonce** pa na teren vrže njihove sence.

## Pošljite naprej

- **Mase kot IFC** shrani vsako maso kot datoteko IFC4: lokacijo, stavbo z njenimi etažami in maso kot stavbni element z njenimi številkami v naboru lastnosti `CadCraft_SiteMass`. Če je na projektu nastavljen koordinatni sistem, je datoteka postavljena na zemljevid in nosi zemljepisno širino in dolžino lokacije; brez njega ne pove ničesar o tem, kje je.
- **Razvij v BimCraftu** odpre BimCraft v novem zavihku z masami. Tam izbira mase pokaže njene številke in **Razvij to maso**, ki iz tlorisnega obrisa zgradi stene na vsaki etaži in tla pod stavbo, v enem koraku razveljavitve. Nič ni naloženo: datoteka potuje med dvema zavihkoma tega brskalnika.

Glejte tudi **Omejitve namenske rabe** in **Sončne ure**.
