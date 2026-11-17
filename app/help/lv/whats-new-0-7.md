---
title: Jaunumi 0.7 versijā (iepriekšējā)
summary: CivilCraft 0.7 pievieno Elektrolīniju darbvietu (gaisvadu līnijas un pazemes kabeļi ar jūsu pašu bibliotēkām, izlieces un spriegums, brīvā attāluma un izturības pārbaudes, vadu izvilkšanas tabulas, daudzumi, lapas un GIS), Ainavu darbvietu (augu saraksts, stādīšanas plāni un specifikācijas, ainavu vertikālo plānošanu, bruģējumu, sienas un kāpnes, laistīšanas aprēķinu palīglīdzekli, ainavu lapas un brīvas formas objektus), ēku masas ar jūsu ierakstītajām zonējuma robežām un saules stundām, klotoīdu spirāles, koridorus, veidotus no daļām katrā pusē, USD eksportu un vairāk rīku MI asistentiem.
keywords: jaunumi 0.7, iepriekšējā versija, izlaiduma piezīmes, izmaiņu žurnāls, izmaiņas, 0.7, versija, jaunas funkcijas, ainava, ainavu darbvieta, augu saraksts, augi, stādīšana, augu specifikācija, dobe, dzīvžogs, vertikālā plānošana, platforma, uzbērums, grāvis, atzīmes augstums, nogāzes analīze, ūdens uzkrāšanās, bruģējums, taka, siena, apmale, rampa, kāpnes, laistīšana, aplaistītājs, pilienveida, ainavu lapas, brīvas formas objekts, ēkas masa, masas, bruto stāvvietu platība, zonējums, atkāpe, aploksne, debesu plakne, stāvu platības koeficients, apbūve, saules stundas, ēna, ifc, izstrādāt bimcraft, spirāle, klotoīds, pāreja, mezgls, apmale, notekrēsls, gājēju celiņš, usd, asistenti, mērvienības, portugāļu
from: 797d2f2f
---

Šis ir tas, kas ir mainījies CivilCraft 0.7 versijā, salīdzinot ar 0.6. Lielākās jaunās daļas ir Elektrolīniju un Ainavu darbvietas un ēku masas.

## Jaunumi

### Ainavu darbvieta

- **Ainavu darbvieta tajā pašā objektā.** {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Ainavu darbvieta}} pievieno stādīšanas, vertikālās plānošanas, cietā seguma un laistīšanas rīkus objektam, kas jums jau ir: tie paši uzmērījumu punkti, virsmas un projekta fails. Lai atgrieztos, izvēlieties **Civil** sadaļā **Darbvieta**. Skatiet [Ainavu darbvieta](topic:landscape).
- **Augu saraksts.** Aptuveni 420 izplatītu mērenās un Vidusjūras joslas koku, krūmu, dzīvžogu, zāles, daudzgadīgo augu, segaugu un kāpjošu augu, ar izmēriem stādot un briedumā, izturības zonu, gaismas, ūdens un attāluma prasībām. Meklējiet pēc jebkura nosaukuma angļu, spāņu vai portugāļu valodā. Savu sarakstu importējiet kā CSV; tas tiek saglabāts ar projektu. Iebūvētie izmēri ir tipiski un noapaļoti: pārbaudiet tos ar vietējo stādaudzētavu. Skatiet [Augu saraksts](topic:plant-list).
- **Stādīšanas plāni.** {{ui:Augs}} novieto atsevišķus augus, kas stāv uz zemes un seko vēlākai vertikālajai plānošanai, {{ui:Dobe}} aizpilda kontūru ar augu attālumu un maisījumu pēc procentiem, un {{ui:Dzīvžogs}} izveido vienu vai divas rindas gar līniju. Augi plānā ir apzīmēti. Skatiet [Stādīšanas plāni un specifikācijas](topic:planting).
- **Augu specifikācija.** Ainavu darbvieta › {{ui:Vairāk}} › {{ui:Augu specifikācija…}} saskaita augus pēc sugas un stādīšanas izmēra. Saglabājiet to kā CSV vai XLSX vai nosūtiet uz TakeoffCraft cenu aprēķinam. Skatiet [Augu specifikācija](topic:planting#the-plant-schedule).
- **Vertikālā plānošana ainavai.** {{ui:Reljefs}} piedāvā platformas (līmenas vai krītošas), uzbērumus, grāvjus un vertikālās plānošanas zonas ar atzīmes augstumiem un horizontālēm, ko velciet. Izrakums un uzbērums rādās, kamēr strādājat. **Nogāzes analīze** iekrāso virsmu pēc jūsu divām robežvērtībām, un **Plūsmas bultiņas un ūdens uzkrāšanās** rāda, kur ūdens tek un kur tas uzkrātos. Viss ietilpst tajā pašā plānotajā virsmā kā laukumi un koridori. Skatiet [Vertikālā plānošana ainavai](topic:landscape-grading).
- **Bruģējums, takas, sienas, apmales, rampas un kāpnes.** {{ui:Cietais segums}} zīmē bruģējumu ar šķērskritumu vai kritumu uz noteku, rakstu un tā slāņus; takas, kas seko zemei; atbalsta un brīvi stāvošas sienas ar pakāpjveida pamatiem; apmales; un rampas un kāpnes, kas pārbaudītas pret jūsu noteiktajām robežvērtībām. Atbalsta siena augstāka par 1,2 m (4 ft) tiek atzīmēta inženierim. Skatiet [Bruģējums, sienas un kāpnes](topic:hardscape).
- **Laistīšanas aprēķinu palīglīdzeklis.** {{ui:Laistīšana}} novieto izsmidzinātājus, laterāles, maģistrālo līniju, vārstus, pilienveida līnijas un pieslēguma punktu. {{ui:Pārbaudīt sistēmu…}} atrod zonas no caurulēm un aprēķina katras zonas plūsmu, spiedienu, kas nepieciešams tās vārstā un padevē (Hazen–Williams), nokrišņus, darbības laiku, pārklājumu un materiālu sarakstu. Tas ir aprēķinu palīglīdzeklis, nevis projekta sertifikācija: laistīšanas projektētājs pārbauda katru rezultātu. Izsmidzinātāji ir vispārīgi veidi vai jūsu paši no faila. Skatiet [Laistīšanas projektēšana](topic:irrigation).
- **Ainavu lapas.** Vairāk › {{ui:Ainavu lapas…}} izveido stādīšanas, vertikālās plānošanas un laistīšanas plānus ar to leģendām un detaļu lapu ar sienu griezumiem, bruģējuma konstrukcijām un kāpnēm, kā vienu PDF. Skatiet [Ainavu lapas](topic:landscape-sheets).
- **Brīvas formas objekti.** Vairāk › {{ui:Brīvas formas objekts…}} novieto STL, OBJ vai bibliotēkas vienumu tīklu, kas izveidots citā lietotnē, piemēram, puķu kasti vai skulptūru. Tas stāv uz zemes vai iegriežas tajā, un tā tilpums, laukums un pamatnes platība tiek saskaitīti. Skatiet [Brīvas formas objekti](topic:freeform-objects).
- **Ainavas IFC.** Vairāk › {{ui:Eksportēt ainavu IFC}} saglabā augus (kā augu veģetāciju ar savām īpašībām), cieto segumu un brīvas formas objektus kā IFC 4.3 BIM modelim. Skatiet [IFC](topic:planting#ifc).
- **No sākuma līdz beigām.** [Dārza projektēšana no sākuma līdz beigām](topic:landscape-walkthrough) izstaigā visu darbvietu paraugobjektā.

### Elektrolīniju darbvieta

- **Gaisvadu līnijas un pazemes kabeļi jūsu objektā.** {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Elektrolīniju darbvieta}}: zīmējiet līniju pēc tās balstiem, kabeļus tranšejās, iekārtas un šķēršļus, tajā pašā zemē un tajā pašā projekta failā. Skatiet [Elektrolīniju darbvieta](topic:power-lines).
- **Jūsu pašu bibliotēkas.** Vadītāji, kabeļi, balsti, iekārtas (šķērsstieņi, izolatori, armatūra, vantis, transformatori, skapji, savienojumi) un tranšeju tipi jūsu nosauktās kategorijās, kopīgoti kā fails vai izklājlapa. Nevienas valsts vai ražotāja katalogs nav iebūvēts; piemēri norāda, ka tie ir piemēri. Skatiet [Jūsu elektrolīniju bibliotēka](topic:power-line-library).
- **Izliece un spriegums saskaņā ar jūsu slodzes gadījumiem.** Temperatūra, vējš, ledus un ledus vienā pusē; spriegumu robežas kā daļa no plīsuma izturības; precīza katenāra katrā laidumā, ieskaitot nogāzes; vadu izvilkšanas tabulas. Skatiet [Izliece un spriegums](topic:sag-and-tension).
- **Pārbaudes vienmēr atjauninātas.** Brīvais attālums virs zemes un šķēršļiem, fāžu attālums, izolatora novirze, pacelšanās, balstu slodzes ar izmēru noteikšanu no jūsu bibliotēkas, vantis, armatūra, pamati, trūkstoši dati, atvienoti kabeļi, pārslodzes un sprieguma kritums, atzīmēti plānā un līnijas profilā. Aprēķinu palīglīdzeklis: inženieris to pārbauda. Skatiet [Elektrolīniju pārbaudes](topic:power-line-checks).
- **Tabulas, lapas un GIS.** Vadu izvilkšanas un balstu tabulas, daudzumi (CSV, Excel, TakeoffCraft), plāna un profila lapas ar pētījuma pārskatu vienā PDF, GIS slāņi ar katra objekta datiem. Skatiet [Elektrolīniju tabulas, daudzumi, lapas un GIS](topic:power-line-outputs).
- **Pēc pirmajiem mēģinājumiem.** Līnijas profils seko atlasītajai līnijai, tam ir saraksts **Līnija**, tas nolasa zemi, vadītāju un brīvo attālumu zem kursora un izmēra attālumu starp diviem punktiem. Ainavas augi un sienas zem līnijām ir šķēršļi; kabeļu maršruti un caurules rādās līnijas profilā un krustojas ar brīvā attāluma noteikumu, ko izvēlaties; **Noteikumi…** blakus katram brīvajam attālumam atver jūsu noteikumus; un noteikumu kopas ar bibliotēku saglabājas kā komplekti, ko kopīgot pēc valsts. Skatiet [Elektrolīniju pārbaudes](topic:power-line-checks) un [Komplekti](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Jūsu pašu failu formāti.** Elektrolīnijas tiek saglabātas CivilCraft projekta failā, bibliotēkas `.cclines.json` vai CSV formātā, noteikumu kopas un komplekti savos JSON failos: atvērti formāti, ko ikviens var nolasīt vai konvertēt. `.DON` izpētes fails ir papildu imports un eksports blakus tiem.
- **Izpētes faili (.DON), netestēti.** Saglabājiet līniju kā `.DON` izpētes failu citai līniju programmai vai nolasiet tās balstus; veidots pēc formāta lauku nosaukumiem, vēl nav testēts ar šo programmu. Skatiet [Izpētes faili](topic:power-line-study-file).

### Mērīšana

- **Mērīšanas rīks.** {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Mērīt}} (vai {{key:M}}) mēra plānā: katras puses garumu un virzienu, kopējo summu, garumu pa zemi un nogāzi, un laukumu un perimetru, kad aizverat formu. Projektā nekas netiek zīmēts. Skatiet [Mērīt](topic:measure).

### Ēku masas

- **Zīmējiet ēku masas.** Rekvizītos sadaļā **Ēku masas**: {{ui:Zīmēt masu}} (vai {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Masas}}). Piešķiriet masai stāvus un stāva augstumu un nolasiet tās bruto stāvvietu platību. Izvēlieties, kā tā novietojas slīpā zemē (pakāpieni, pamats vai izrakums) un redziet uzbērumu un izrakumu. Masas rādās plānā, PDF un DWG un DXF failos savos slāņos. Skatiet [Ēku masu zīmēšana objektā](topic:building-masses).
- **Stumjiet un velciet 3D.** 3D skatā velciet izvēlētās masas jumtu vai nospiediet {{key:PageUp}} un {{key:PageDown}}, lai mainītu to pa vienam stāvam, vienā atsaukšanas solī. {{ui:Saule}} met masu ēnas. Skatiet [3D skatā](topic:building-masses#in-the-3d-view).
- **Zonējuma robežas, ko ierakstāt.** Atkāpes rindu pa rindai no ielas līnijas, augstuma ierobežojums, debesu iedarbības plakne, stāvu platības koeficients un apbūve. Iespējamā aploksne tiek zīmēta plānā, un katrai masai ir atzīme vai krusts par katru robežu. CivilCraft nesatur nekādu zonējuma kodu: katrs skaitlis ir tāds, ko jūs ierakstāt no sava noteikuma. Skatiet [Pārbaudiet masas pret jūsu ierakstītajām zonējuma robežām](topic:zoning-limits).
- **Saules stundas.** Izvēlieties dienu vai sezonu un laika joslu pēc nosaukuma vai nobīdes, un nolasiet tiešās saules stundas uz katras sienas katrā masā, stāvu pa stāvam, un apkārtējā zemē, zīmētas plānā. Saglabājiet sienas un zemi kā CSV. Projektam nepieciešama koordinātu sistēma. Skatiet [Saules stundu aprēķins objektā](topic:sun-hours).
- **Masas kā IFC un tālāk uz BimCraft.** {{ui:Masas kā IFC}} saglabā masas kā IFC4, novietotas kartē, ja projektam ir koordinātu sistēma. {{ui:Izstrādāt BimCraft}} atver BimCraft jaunā cilnē ar masām, kur **Izstrādāt šo masu** veido sienas katrā līmenī un grīdu no pamatnes. Nekas netiek augšupielādēts. Skatiet [Nosūtīt tālāk](topic:building-masses#send-it-on).

### Trases

- **Klotoīda spirāles.** Ierakstiet garumu laukos **Spirāle ieejā** un **Spirāle izejā** PI tabulā līkumam: tangente, spirāle, līkums, spirāle, tangente, ar vienādiem vai dažādiem garumiem. Plāns apzīmē TS, SC, CS un ST, līkumu sarakstā ir θs un tangentes un ārējie attālumi, un pikets un nobīdes iet cauri spirālēm. Skatiet [Spirāles](topic:alignment#spirals).
- **Spirāles LandXML.** LandXML raksta un nolasa klotoīda spirāles. Trases ar spirālēm, ko CivilCraft agrāk izlaida importējot, tagad atveras. Skatiet [LandXML apmaiņa](topic:landxml).

### Koridori

- **Katru pusi veidojiet no daļām.** Ieslēdziet **Katru pusi veidot no daļām**, lai katrai pusei būtu savs saraksts no centrālās līnijas uz āru: joslas, celmala, notekrēsls, apmale, stādījumu josla, gājēju celiņš un sānu nogāze ar savu izrakumu un uzbērumu. Sāciet no {{ui:Lauku ceļš}} vai {{ui:Pilsētas iela}} un kopējiet vienu pusi uz otru. Šķērsgriezumi atzīmē caurtecēšanas līniju, apmali un gājēju celiņu, un apstrādātā virsma ietver apmali. Skatiet [Katru pusi veidot no daļām](topic:corridor#build-each-side-from-parts).
- **Virsaugstuma pāreja pāri spirālēm.** Līkumā ar spirālēm virsaugstuma pārejas posms iet pāri spirālei: līmens šķērsprofils TS, pilns virsaugstums SC. Skatiet [Virsaugstums](topic:corridor#superelevation).

### 3D faili

- **USD eksports.** 3D skatā {{ui:USD}} saglabā objektu kā `.usda`, `.usdc` vai `.usdz` īstā mērogā un ar projekta koordinātēm: virsmas, caurules un konstrukcijas kā tīkli, līnijas, katra trase un uzmērījumu punkti ar to numuriem. Skatiet [Eksportēt 3D objektu kā USD](topic:usd).

### MI asistenti

- **Vairāk asistentiem.** Ja asistenti ir ieslēgti {{ui:Iestatījumi}} › {{ui:CivilCraft}}, asistents tagad var arī nolasīt zemes gabalus, izrakumu un uzbērumu un profilus, pievienot uzmērījumu punktus, saglabāt projektu, eksportēt LandXML, DWG un USD un strādāt mapēs, ko izvēlaties CadCraft Studio. Ainavu darbvieta pievieno rīkus augu meklēšanai, augu, kontūru un dzīvžogu novietošanai, vertikālajai plānošanai un laistīšanas pārbaudei. Failu serveris un komandrindas `cadcraft` atver saglabātos projektus bez loga. Skatiet [Ļaujiet MI asistentam strādāt ar jūsu objektu](topic:assistants).

## Visās lietotnēs

- **Mērvienības.** {{ui:Iestatījumi}} › {{ui:Vispārīgi}} › {{ui:Mērvienības}} katram garumam, laukumam, tilpumam, leņķim un nogāzei ir savs saraksts ar precīziem izmēriem, ko dod mērvienību definīcijas (ASV pārbaudes pēda ir atsevišķa mērvienība). Izslēdziet mērvienības, ko nekad nelietojat, un tās pazūd no sarakstiem; atzīmējiet vienu ar zvaigzni, un jauns darbs sākas tajā. Fails vienmēr saglabā savu mērvienību. CivilCraft projekta **Mērvienības** saraksts seko slēdžiem; garuma zvaigzne sāk jaunus projektus metros (citādi pēdās, kas ir ASV pārbaudes pēdas), laukuma vai tilpuma zvaigzne nosaka mērvienību, kādā tiek ziņoti laukumi un tilpumi, un garuma lodziņš pieņem jebkuras mērvienības apzīmējumu, piemēram, `3 ch` vai `450 mm`. Skatiet [Mērvienības, ierakstītās vērtības un mērvienību saraksti](common:unit-lists).
- **Blīvāks izkārtojums un paneļi, kas sakārtojas.** {{ui:Iestatījumi}} › {{ui:Vispārīgi}} › {{ui:Izkārtojuma blīvums}} › {{ui:Kompakts}} ietilpina ekrānā vairāk (skārienekrāni un tālruņi saglabā lielās pogas). Katram sānu panelim ir šaura virsraksta josla: velciet to, lai piestiprinātu vai atbrīvotu paneli, nometiet uz cita paneļa joslas, lai dalītos vienā rāmī kā cilnēs, piespraudiet, lai tas nobīdās uz malu, vai paslēpiet un atgrieziet no malas. Skatiet [Panelu izkārtošana](common:arrange-panels#make-the-layout-denser).
- **Dialogi kustas.** Velciet dialogu aiz tā virsraksta joslas, lai tas nenosegtu zīmējumu; tas atgriežas tur, kur to atstājāt. Veiciet dubultklikšķi uz virsraksta joslas, lai to atkal centrētu. Skatiet [Dialoga pārvietošana](common:arrange-panels#move-a-dialog).
- **Receptes MI asistentiem.** Desmit sagatavotas pieprasījumi jūsu asistentam (sakārtot zīmējumu, izdrukāt komplektu, pārbaudīt zīmējumus, uzdot jautājumus modelim, saskaitīt tāmi, izmēģināt detaļas variantu…), katrs ar rīkiem, ko tas izsauc, un atļaujām, kas tam nepieciešamas, un katrs atkārtots mūsu testos. Lietotnes nesatur MI. Skatiet [Receptes MI asistentiem](common:assistants-recipes).
- **Valodas.** **Português (Portugal)** ir jauna sadaļā {{ui:Iestatījumi}} › {{ui:Vispārīgi}} › {{ui:Valoda}}. Tā, **Português (Brasil)**, **Español (México)** un **Bahasa Indonesia** tagad ir ar visiem lietotņu vārdiem, kā melnraksti, ko dzimtā valodas runātājs vēl nav pārskatījis. Palīdzības tēmas ir angļu valodā, dažas spāņu valodā.
- **CadCraft Studio** pasaka, kāpēc atjauninājumu pārbaude neizdevās (vēl nav faila jūsu sistēmai, nav tīkla, nederīgs paraksts), nevis tikai “Gatavs”, un vairs neatgriež Jaunumu kartīti, ko aizvērāt, kamēr nav jaunāka izlaiduma.

## Vēl nav šajā versijā

- **0.7 nav koda parakstīta.** Parakstīšana un Microsoft Store pakotne pārcelta uz 0.8, jo sertifikāta validācija vēl nav saņemta. Pārbaudiet SHA-256 blakus katram failam vietnē getcadcraft.com/download. Operētājsistēmā Windows, ja SmartScreen aptur instalētāju, izvēlieties {{ui:Papildinformācija}}, tad {{ui:Palaist tomēr}}. Macintosh datorā pirmo reizi ar peles labo pogu noklikšķiniet uz CadCraft Studio un izvēlieties {{ui:Atvērt}}. CadCraft Studio vēl nav lietotņu veikalā, un iPad vai iPhone versijas vēl nav.
- Leņķu un nogāžu sarakstus {{ui:Mērvienības}} saglabā, bet neviens lauks tos vēl nenolasa.
- Ražotāju laistīšanas izsmidzinātāji: tikai vispārīgi izsmidzinātāji un jūsu paši no faila. Ražotāju dati tiek ievietoti tikai ar viņu atļauju, un tādas vēl nav saņemtas.
- BimCraft un ModelCraft nes augu sarakstu, bet to Novietot no bibliotēkas vēl nepiedāvā augus. Augi nonāk BimCraft caur ainavas IFC.
- Ainavu rīki asistentiem darbojas ar atvērtu CivilCraft logu; failu serveris un komandrinda tos vēl nesatur.
- Ēku masas: nav fasādes dienasgaismas vai vēja, nav ēnas no kokiem vai no kaut kā, kas nav zīmēts kā masa, nav jumta formu, un saules stundas rādās plānā, nevis 3D skatā. Izstrādāt BimCraft veido vienkāršas sienas un grīdu, bez atverēm vai jumta.
- Elektrolīnijas: nav iebūvēta nevienas valsts standarta (jūs iestatāt slodzes gadījumus, robežas un attālumus); nav vadītāju lēnas deformācijas, aprakto kabeļu termiskā novērtējuma, īssavienojuma, aizsardzības vai zemējuma pētījumu; nav līniju 3D skatā vai IFC. `.DON` izpētes fails nav testēts ar programmu, kas to nolasa.
- Spirāles, kas nav klotoīdas, spirāle starp diviem līkumiem un spirāles raksturlīnijās. Spirāles pārbaudītas pret formulām un LandXML shēmu, bet vēl nav pārbaudītas pret LandXML failu ar spirālēm no citas programmas.
- Koridoru konstrukcijas, kas mainās gar ceļu, reģioni un mērķi sānu nogāzei.
- Ūdensvada maģistrāles un spiediena tīkli (nākamais civilais darbs), plūsmas, kas mainās laikā, un saites starp ūdens un lietus kanalizācijas tīkliem.
- Loki zīmētās lūzumlīnijās. Standarta projektēšanas transportlīdzekļu tabulas: pieci iekļautie transportlīdzekļi ir vietturi. Raksturlīnijas, kas kopīgotas starp projektiem, gaida komandu projektus.

Viss pārējais ir sadaļā [Vēl nav izveidots](topic:not-built-yet).
