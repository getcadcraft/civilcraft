---
title: Jaunumi 0.7 versijā
summary: CivilCraft 0.7 pievieno Elektrolīniju darbvietu (gaisa līnijas un pazemes kabeļi ar jūsu bibliotēkām, izliece un spriegums, attāluma un izturības pārbaudes, vilkšanas tabulas, daudzumi, lapas un GIS), Ainavu darbvietu (augu sarakstu, stādījumu plānus un specifikācijas, ainavu reljefa veidošanu, bruģi, sienas un kāpnes, apūdeņošanas aprēķinu palīglīdzekli, ainavu lapas un brīvas formas objektus), ēku masas ar apbūves ierobežojumiem, ko ievadāt, un saules stundām, klotoīdu spirāles, koridorus, kas veidoti no daļām katrā pusē, USD eksportu un vairāk rīku MI asistentiem.
keywords: jaunumi, kas jauns, izlaiduma piezīmes, izmaiņu žurnāls, izmaiņas, 0.7, versija, jaunas funkcijas, ainava, ainavu darbvieta, augu saraksts, augi, stādīšana, augu specifikācija, dobe, dzīvžogs, reljefs, platforma, uzbērums, grāvis, augstuma atzīme, nogāzes analīze, ūdens uzkrāšanās, cietais segums, bruģis, taka, siena, bordiūra, rampa, kāpnes, apūdeņošana, smidzinātājs, pilienu, ainavu lapas, brīvas formas objekts, ēku masa, masēšana, bruto grīdas platība, apbūve, atkāpe, aploksne, debesu plakne, stāvu koeficients, pārklājums, saules stundas, ēna, ifc, izstrādāt BimCraft, spirāle, klotoīde, pāreja, elements, notekrīna, ietve, usd, asistenti, mērvienības, portugāļu
from: 3c9d79db
---

Šeit ir apkopots, kas mainījies CivilCraft 0.7 versijā salīdzinājumā ar 0.6. Lielākās jaunās daļas ir Elektrolīniju un Ainavu darbvietas un ēku masas.

## Jauns

### Ainavu darbvieta

- **Ainavu darbvieta tajā pašā objektā.** {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Ainavu darbvieta}} pievieno stādījumu, reljefa veidošanas, cietā seguma un apūdeņošanas rīkus objektam, kas jums jau ir: tie paši uzmērījuma punkti, virsmas un projekta fails. Lai atgrieztos, izvēlieties **Civilā** sadaļā **Darbvieta**. Skat. [Ainavu darbvieta](topic:landscape).
- **Augu saraksts.** Aptuveni 420 parastu mērenās joslas un Vidusjūras klimata koku, krūmu, dzīvžogu, zāļu, daudzgadīgo augu, segaugu un vīteņaugu ar to izmēriem stādot un pieaugušiem, izturības zonu, gaismu, ūdens vajadzību un stādu attālumu. Meklējiet pēc jebkura nosaukuma angļu, spāņu vai portugāļu valodā. Importējiet savu sarakstu kā CSV; tas tiek saglabāts kopā ar projektu. Iebūvētie izmēri ir tipiski un noapaļoti: pārbaudiet tos ar vietējo stādaudzētavu. Skat. [Augu saraksts](topic:plant-list).
- **Stādījumu plāni.** {{ui:Augs}} izvieto atsevišķus augus, kas atrodas uz zemes un seko vēlākai reljefa veidošanai; {{ui:Dobe}} aizpilda kontūru ar augu attālumu un maisījumu pēc procentiem, bet {{ui:Dzīvžogs}} izveido vienu vai divas rindas gar līniju. Augi plānā ir apzīmēti. Skat. [Stādījumu plāni un specifikācijas](topic:planting).
- **Augu specifikācija.** Vairāk › {{ui:Augu specifikācija…}} saskaita augus pēc sugas un stādīšanas izmēra. Saglabājiet to kā CSV vai XLSX vai nosūtiet uz TakeoffCraft cenu aprēķinam. Skat. [Augu specifikācija](topic:planting#the-plant-schedule).
- **Reljefa veidošana ainavai.** {{ui:Reljefs}} ietver platformas (līmeņotas vai krītošas), uzbērumus, ieplakas un reljefa apgabalus ar punktveida augstumiem un horizontālēm, ko velkat. Izrakumi un uzbērumi tiek rādīti, kamēr strādājat. **Nogāžu analīze** krāso virsmu pēc jūsu divām robežvērtībām, un **Tecējuma bultiņas un ūdens uzkrāšanās** parāda, kur ūdens tek un kur varētu uzkrāties. Viss tiek iekļauts tajā pašā projektētajā virsmā kā platformas un koridori. Skat. [Reljefa veidošana ainavai](topic:landscape-grading).
- **Bruģis, takas, sienas, bordiūras, rampas un kāpnes.** {{ui:Cietais segums}} zīmē bruģi ar šķērsnoslīpumu vai nogāzi uz noteku, rakstu un tā slāņiem; takas, kas seko reljefam; atbalsta un brīvi stāvošas sienas ar pakāpienveida pamatiem; bordiūras; un rampas un kāpnes, kas pārbaudītas pret jūsu ierobežojumiem. Atbalsta siena augstāka par 1,2 m (4 ft) tiek atzīmēta inženierim. Skat. [Bruģis, sienas un kāpnes](topic:hardscape).
- **Apūdeņošanas aprēķinu palīglīdzeklis.** {{ui:Laistīšana}} izvieto smidzinātājus, zarus, galveno līniju, vārstus, pilienu līnijas un pieslēguma punktu. {{ui:Pārbaudīt sistēmu…}} atrod zonas pēc caurulēm un aprēķina katras zonas plūsmu, spiedienu, kas nepieciešams pie tās vārsta un padevē (Hazen–Williams), nokrišņu daudzumu, darbības laiku, pārklājumu un materiālu sarakstu. Tas ir aprēķinu palīglīdzeklis, nevis projekta sertifikāts: apūdeņošanas projektētājs pārbauda katru rezultātu. Smidzinātāji ir vispārīgi veidi vai jūsu paši no faila. Skat. [Apūdeņošanas projektēšana](topic:irrigation).
- **Ainavu lapas.** Vairāk › {{ui:Ainavu lapas…}} izveido stādījumu, reljefa un apūdeņošanas plānus ar to leģendām, kā arī detaļu lapu ar sienu griezumiem, bruģa slāņiem un kāpnēm — vienā PDF failā. Skat. [Ainavu lapas](topic:landscape-sheets).
- **Brīvas formas objekti.** Vairāk › {{ui:Brīvas formas objekts…}} izvieto STL, OBJ vai bibliotēkas vienuma tīklu, kas izveidots citā lietotnē, piemēram, stādu kasti vai skulptūru. Tas atrodas uz zemes vai iegriežas tajā, un tā tilpums, laukums un pamata nospiedums tiek saskaitīti. Skat. [Brīvas formas objekti](topic:freeform-objects).
- **Ainavas IFC.** Vairāk › {{ui:Eksportēt ainavu IFC}} saglabā augus (kā augāju ar to īpašībām), cieto segumu un brīvas formas objektus IFC 4.3 formātā BIM modelim. Skat. [IFC](topic:planting#ifc).
- **No sākuma līdz beigām.** [Dārza projektēšana no sākuma līdz beigām](topic:landscape-walkthrough) izved cauri visai darbvietai parauga objektā.

### Elektrolīniju darbvieta

- **Gaisa līnijas un pazemes kabeļi jūsu objektā.** {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Elektrolīniju darbvieta}}: zīmējiet līniju pēc tās balstiem, kabeļus tranšejās, iekārtas un šķēršļus tajā pašā zemē un tajā pašā projekta failā. Skat. [Elektrolīniju darbvieta](topic:power-lines).
- **Jūsu pašu bibliotēkas.** Vadi, kabeļi, balsti, iekārtas (šķērsstieņi, izolatori, savienojumi, balsta trosītes, transformatori, skapji, mufes) un tranšeju veidi kategorijās, kuras jūs nosaucat, kopīgoti kā fails vai izklājlapa. Nav iebūvēts neviena valsts vai ražotāja katalogs; piemēri ir norādīti kā piemēri. Skat. [Jūsu elektrolīniju bibliotēka](topic:power-line-library).
- **Izliece un spriegums pie jūsu slodzes gadījumiem.** Temperatūra, vējš, ledus un ledus vienā pusē; sprieguma ierobežojumi kā daļa no pārraušanas izturības; precīza katenāra katrā laidumā, ieskaitot nogāzes; vadu vilkšanas tabulas. Skat. [Izliece un spriegums](topic:sag-and-tension).
- **Pārbaudes, vienmēr aktuālas.** Attālums virs zemes un šķēršļiem, fāžu attālums, izolatoru svārstības, pacelšanās, balstu slodzes ar izmēriem no jūsu bibliotēkas, balsta trosītes, stiprinājumi, pamati, trūkstoši dati, atvienoti kabeļi, pārslodzes un sprieguma kritums, atzīmēti plānā un līnijas profilā. Projektēšanas palīglīdzeklis: pārbauda inženieris. Skat. [Elektrolīniju pārbaudes](topic:power-line-checks).
- **Tabulas, lapas un GIS.** Vadu vilkšanas un balstu tabulas, daudzumi (CSV, Excel, TakeoffCraft), plāna un profila lapas ar pētījuma pārskatu vienā PDF, GIS slāņi ar katra aktīva datiem. Skat. [Elektrolīniju tabulas, daudzumi, lapas un GIS](topic:power-line-outputs).
- **Pēc pirmajiem mēģinājumiem.** Līnijas profils seko jūsu atlasītajai līnijai, tam ir saraksts **Līnija**, tas nolasa zemi, vadu un attālumu zem rādītāja un mēra starp diviem punktiem. Ainavas augi un sienas tiek uzskatīti par šķēršļiem zem līnijām; kabeļu maršruti un caurules tiek rādīti līnijas profilā un krustojas ar jūsu izvēlētu attāluma noteikumu; **Noteikumi…** blakus katram attālumam atver jūsu noteikumus; un noteikumu kopas ar bibliotēku tiek saglabātas kā pakas, ko kopīgot pa valstīm. Skat. [Elektrolīniju pārbaudes](topic:power-line-checks) un [Pakas](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Jūsu pašu failu formāti.** Elektrolīnijas tiek saglabātas CivilCraft projekta failā, bibliotēkas — `.cclines.json` vai CSV formātā, noteikumu kopas un pakas — savos JSON failos: atvērti formāti, ko ikviens var nolasīt vai pārveidot. `.DON` pētījuma fails ir papildu imports un eksports blakus tiem.
- **Pētījumu faili (.DON), netestēti.** Saglabājiet līniju kā `.DON` pētījuma failu citai līniju programmai vai nolasiet tās balstus; veidots pēc formāta lauku nosaukumiem, vēl nav testēts ar šo programmu. Skat. [Pētījumu faili](topic:power-line-study-file).

### Mērīšana

- **Mērīšanas rīks.** {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Mērīt}} (vai {{key:M}}) mēra plānā: katras malas garumu un azimutu, kopējo summu, garumu pa zemi un nogāzi, kā arī laukumu un perimetru, kad aizverat figūru. Projektā nekas netiek zīmēts. Skat. [Mērīt](topic:measure).

### Ēku masas

- **Zīmējiet ēku masas.** Rekvizītos, sadaļā **Ēku masas**, {{ui:Zīmēt masu}} (arī {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Masas}}). Piešķiriet masai stāvus un stāva augstumu un nolasiet tās bruto grīdas platību. Izvēlieties, kā tā atrodas uz slīpa reljefa (pakāpienveida, pamatnes vai izgriezta), un skatiet uzbērumu un izrakumu. Masas tiek rādītas plānā, PDF un DWG un DXF failos savos slāņos. Skat. [Ēku masu zīmēšana objektā](topic:building-masses).
- **Stumšana un vilkšana 3D.** 3D skatā velciet izvēlētās masas jumtu vai nospiediet {{key:PageUp}} un {{key:PageDown}}, lai mainītu to pa vienam stāvam vienā atsaukšanas solī. **Saule** met masu ēnas. Skat. [3D skatā](topic:building-masses#in-the-3d-view).
- **Apbūves ierobežojumi, ko ievadāt.** Atkāpes rindu pa rindai no ielas līnijas, augstuma ierobežojums, debesu apgaismojuma plakne, stāvu koeficients un apbūves blīvums. Apbūvējamā aploksne tiek zīmēta plānā, un katrai masai par katru ierobežojumu ir atzīme vai krusts. CivilCraft nesatur nekādus apbūves noteikumus: katrs skaitlis ir tāds, ko ievadāt no savas pašvaldības saistošajiem noteikumiem. Skat. [Masu pārbaude pret jūsu ievadītajiem apbūves ierobežojumiem](topic:zoning-limits).
- **Saules stundas.** Izvēlieties dienu vai sezonu un laika joslu pēc nosaukuma vai nobīdes un nolasiet tiešās saules stundas katrā katras masas sienā, stāvu pa stāvam, un ap tām esošajā zemē, zīmētas plānā. Saglabājiet sienas un zemi kā CSV. Projektam nepieciešama koordinātu sistēma. Skat. [Saules stundu aprēķināšana objektā](topic:sun-hours).
- **Masas kā IFC un tālāk uz BimCraft.** {{ui:Masas kā IFC}} saglabā masas kā IFC4, novietotas kartē, ja projektam ir koordinātu sistēma. {{ui:Izstrādāt BimCraft}} atver BimCraft jaunā cilnē ar masām, kur **Izstrādāt šo masu** izveido sienas katrā līmenī un grīdu no pamata nospieduma. Nekas netiek augšupielādēts. Skat. [Nosūtīt tālāk](topic:building-masses#send-it-on).

### Trases

- **Klotoīdu spirāles.** PI tabulā līknei ierakstiet garumu laukos **Spirāle ieejā** un **Spirāle izejā**: pieskare, spirāle, līkne, spirāle, pieskare, ar vienādiem vai dažādiem garumiem. Plānā tiek apzīmēti TS, SC, CS un ST, līkņu sarakstā ir θs un pieskares un ārējie attālumi, un pikets un nobīdes iet cauri spirālēm. Skat. [Spirāles](topic:alignment#spirals).
- **Spirāles LandXML.** LandXML raksta un nolasa klotoīdu spirāles. Trases ar spirālēm, ko CivilCraft agrāk importējot izlaida, tagad atveras. Skat. [LandXML apmaiņa](topic:landxml).

### Koridori

- **Katru pusi veidojiet no daļām.** Ieslēdziet **Katru pusi veidot no daļām**, lai katrai pusei būtu savs saraksts no centrālās līnijas uz āru: joslas, mala, notekrīna, bordiūra, stādījumu josla, ietve un sānu nogāze ar savu izrakumu un uzbērumu. Sāciet no {{ui:Lauku ceļš}} vai {{ui:Pilsētas iela}} un kopējiet vienu pusi uz otru. Šķērsgriezumos atzīmēta tecējuma līnija, bordiūra un gājēju josla, un projektētajā virsmā ir bordiūra. Skat. [Katru pusi veidot no daļām](topic:corridor#build-each-side-from-parts).
- **Šķērsnoliece pār spirālēm.** Līknei ar spirālēm šķērsnolieces pāreja iet pār spirāli: līmeņots šķērsprofils TS, pilna šķērsnoliece SC. Skat. [Šķērsnoliece](topic:corridor#superelevation).

### 3D faili

- **USD eksports.** 3D skatā {{ui:USD}} saglabā objektu kā `.usda`, `.usdc` vai `.usdz` īstā mērogā un ar tā projekta koordinātēm: virsmas, caurules un konstrukcijas kā tīklus, līnijas, katru trasi un uzmērījuma punktus ar to numuriem. Skat. [Eksportēt 3D objektu kā USD](topic:usd).

### MI asistenti

- **Vairāk asistentiem.** Ja asistenti ir ieslēgti {{ui:Iestatījumi}} › {{ui:CivilCraft}}, asistents tagad var arī nolasīt zemes gabalus, izrakumus, uzbērumus un profilus, pievienot uzmērījuma punktus, saglabāt projektu, eksportēt LandXML, DWG un USD un strādāt mapēs, kuras izvēlaties CadCraft Studio. Ainavu darbvieta pievieno rīkus augu meklēšanai, augu, dobju un dzīvžogu izvietošanai, reljefa veidošanai un apūdeņošanas pārbaudei. Failu serveris un komandrinda `cadcraft` atver saglabātos projektus bez loga. Skat. [Ļaujiet MI asistentam strādāt ar jūsu objektu](topic:assistants).

## Visās lietotnēs

- **Mērvienības.** {{ui:Iestatījumi}} › {{ui:Vispārīgi}} › {{ui:Mērvienības}} katrai no garuma, laukuma, tilpuma, leņķa un nogāzes ir savs saraksts ar precīziem izmēriem, ko dod mērvienību definīcijas (ASV uzmērījuma pēda ir atsevišķa mērvienība). Izslēdziet mērvienības, ko nekad neizmantojat, un tās pazūd no mērvienību sarakstiem; atzīmējiet ar zvaigznīti vienu, un jaunais darbs sākas ar to. Fails vienmēr saglabā savu mērvienību. CivilCraft projekta saraksts **Mērvienības** seko slēdžiem: garuma zvaigznīte sāk jaunus projektus metros (citādi pēdās, kas ir ASV uzmērījuma pēdas), laukuma vai tilpuma zvaigznīte nosaka mērvienību, kādā tiek ziņoti laukumi un tilpumi, un garuma lodziņš pieņem jebkuras mērvienības apzīmējumu, piemēram, `3 ch` vai `450 mm`. Skat. [Mērvienības, ievadītās vērtības un mērvienību saraksti](common:unit-lists).
- **Blīvāks izkārtojums un paneļi, ko var paslēpt.** {{ui:Iestatījumi}} › {{ui:Vispārīgi}} › {{ui:Izkārtojuma blīvums}} › {{ui:Kompakts}} ietilpina vairāk ekrānā (skārienekrāni un tālruņi saglabā lielās pogas). Katram sānu panelim ir šaura virsraksta josla: velciet to, lai piestiprinātu vai atbrīvotu paneli, nometiet to uz cita paneļa joslas, lai dalītos ar vienu rāmi kā cilnēm, piespraudiet, lai tas paslīdētu uz malu, vai paslēpiet un atgrieziet to no malas. Skat. [Paneļu izkārtošana](common:arrange-panels#make-the-layout-denser).
- **Dialogi pārvietojas.** Velciet dialogu aiz virsraksta joslas, lai to novietotu nost no zīmējuma; tas atgriežas tur, kur to atstājāt. Divreiz noklikšķiniet uz virsraksta joslas, lai to atkal centrētu. Skat. [Dialoga pārvietošana](common:arrange-panels#move-a-dialog).
- **Receptes MI asistentiem.** Desmit izstrādāti pieprasījumi jūsu pašu asistentam (sakārtot rasējumu, izdrukāt komplektu, pārbaudīt rasējumus, uzdot jautājumus modelim, saskaitīt apjomu aprēķinu, izmēģināt detaļas variantu…), katrs ar rīkiem, ko tas izsauc, un atļaujām, kas tam nepieciešamas, un katrs atkārtots mūsu testos. Lietotnes nesatur MI. Skat. [Receptes MI asistentiem](common:assistants-recipes).
- **Valodas.** **Português (Portugal)** ir jauns {{ui:Iestatījumi}} › {{ui:Vispārīgi}} › {{ui:Valoda}}. Tā, **Português (Brasil)**, **Español (México)** un **Bahasa Indonesia** tagad ir visi lietotņu vārdi kā melnraksti, ko vēl nav pārskatījis dzimtās valodas runātājs. Palīdzības temati ir angļu valodā, daži — spāņu valodā.
- **CadCraft Studio** norāda, kāpēc atjauninājumu pārbaude neizdevās (vēl nav faila jūsu sistēmai, nav tīkla, nepareizs paraksts), nevis tikai "Gatavs", un pārtrauc atgriezt Jaunumu kartīti, ko aizvērāt, līdz parādās jaunāka versija.

## Vēl nav šajā versijā

- **0.7 nav kodu parakstīta.** Parakstīšana un Microsoft Store pakotne pārcelta uz 0.8, jo sertifikāta pārbaude vēl nav pabeigta. Pārbaudiet SHA-256 blakus katram failam vietnē getcadcraft.com/download. Windows sistēmā, ja SmartScreen aptur instalētāju, izvēlieties {{ui:Vairāk informācijas}}, pēc tam {{ui:Palaist tik un tā}}. Mac datorā pirmajā reizē ar peles labo pogu noklikšķiniet uz CadCraft Studio un izvēlieties {{ui:Atvērt}}. CadCraft Studio vēl nav lietotņu veikalā, un iPad vai iPhone versijas vēl nav.
- Leņķu un nogāžu saraksti {{ui:Mērvienības}} tiek saglabāti, bet neviens lodziņš tos vēl nenolasa.
- Ražotāju apūdeņošanas smidzinātāji: tikai vispārīgi smidzinātāji un jūsu paši no faila. Ražotāju dati tiek ievietoti tikai ar viņu atļauju, un vēl neviena nav dota.
- BimCraft un ModelCraft satur augu sarakstu, bet to funkcija Novietot no bibliotēkas vēl nepiedāvā augus. Augi nonāk BimCraft caur ainavas IFC.
- Ainavu rīki asistentiem darbojas, kad ir atvērts CivilCraft logs; failu serverim un komandrindai tādu vēl nav.
- Ēku masas: nav fasādes dienasgaismas vai vēja, nav ēnas no kokiem vai citiem objektiem, kas nav zīmēti kā masa, nav jumta formu, un saules stundas rādās plānā, nevis 3D skatā. Izstrādāt BimCraft veido vienkāršas sienas un grīdu bez atverēm vai jumta.
- Elektrolīnijas: nav iebūvēts neviena valsts standarts (slodzes gadījumus, ierobežojumus un attālumus iestatāt jūs); nav vadu lēnās deformācijas, pazemes kabeļu termiskā novērtējuma, īssavienojuma, aizsardzības vai zemēšanas pētījumu; nav līniju 3D skatā vai IFC. `.DON` pētījuma fails nav testēts ar programmu, kas to nolasa.
- Spirāles, kas nav klotoīdas, spirāle starp divām līknēm un spirāles līnijās, kas nav trases. Spirāles ir pārbaudītas pret formulām un LandXML shēmu, bet vēl nav pret LandXML failu ar spirālēm no citas programmas.
- Koridoru elementi, kas mainās gar ceļu, reģioni un sānu nogāzes mērķi.
- Ūdensvadi un spiediena tīkli (nākamais civilais darbs), plūsmas, kas laika gaitā mainās, un saiknes starp ūdens un lietus kanalizācijas tīkliem.
- Loki zīmētās lūzumlīnijās. Standarta projektēšanas transportlīdzekļu tabulas: piegādātie pieci transportlīdzekļi ir apzīmēti kā vietturi. Objektu līnijas, kas kopīgotas starp projektiem, gaida komandas projektus.

Viss pārējais ir [Vēl nav veidots](topic:not-built-yet).
