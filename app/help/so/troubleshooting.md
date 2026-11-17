---
title: Xallinta dhibaatooyinka
summary: Calaamadaha, sababaha iyo xalalka dhibaatooyinka dadku ku kulmaan CivilCraft, oo leh fariimaha saxda ah ee app-ku muujiyo.
keywords: dhibaatooyin, khalad, ma shaqeeyo, hagaaji, caawimaad, fariimo, xalin, diidan, maqan, khaldan, is-beddelay, kontuurrada maqan
from: a9f7dedc
---

Fariimaha waxay ka muuqdaan status bar-ka hoose ee midig, sanduuqyada panel-yada bidix iyo midig, iyo wada-hadallada. Halkan waxaa lagu soo xigtay sida app-ku muujiyo.

## Fur faylasha

**"Faylkan wuxuu ka weyn yahay 200 MB; CivilCraft weli ma furo faylal weyn sidan."**
Kala qaybi faylka barooyinka, ama yaraee xogta ka hor intaadan furin.

**"Could not open site.json: This is not a CivilCraft project file."**
Faylku wuxuu ku dhammaadaa `.json` ama wuxuu ku bilaabmaa `{` laakiin ma aha mashruuc CivilCraft. Faylasha barooyinka waa inaysan ku bilaabmin `{`.

**"Could not open … This project file is from a newer CivilCraft (version 2)."**
Mashruucii waxaa kaydiyay dhismo cusub. Ku fur halkaas, ama ka dhoofi LandXML.

**"Could not open … This is XML but not LandXML (its root element is <…>)."**
Faylku waa nooc kale oo XML ah. Ka dhoofi LandXML barnaamijka kale.

**"… has no points, TIN surfaces or alignments CivilCraft can read."**
Waxa faylka ku jira oo dhan waa wax CivilCraft ka boodo (tusaale, dusha shabakad oo keliya, ama jeexyo spiral oo keliya). Qaybta kale ee fariintu waxay sheegtaa waxa ku jiray. Eeg [LandXML: waxa la akhrinayo iyo la qorayo](topic:landxml-reference).

**"The sample could not be loaded: …"**
{{ui:Fur goobta tusaalaha}} wuxuu akhrinayaa fayl ka yimid goobta CadCraft. Xidhiidh la'aan ahaan wuxuu shaqeeyaa kaliya haddii CivilCraft loo kaydiyay shaqada khadka ka baxsan (badhanka app bar-ka wuxuu muujinayaa {{ui:Khadka ka baxsan diyaar}}). Khadka ku xirmo, guji {{ui:Kaydi khadka ka baxsan}}, kadibna wuxuu shaqeeyaa khadka ka baxsan ilaa markaas. Eeg [Khadka ka baxsan](common:offline).

**{{ui:Kaydi khadka ka baxsan}} wuxuu muujinayaa {{ui:Lama kaydin karin}}.**
Faylal qaarkood lama soo dejin. Hubi xiriirka oo mar kale guji badhanka.

**{{ui:Kaydi khadka ka baxsan}} wuxuu muujinayaa {{ui:Khadka ka baxsan lama heli karo}}.**
Daaqaddan browser-ka ma kaydin karto nuqul khadka ka baxsan, sababtoo ah waa daaqad gaar ah ama kombiyuutarka waa la maamulo. Ku fur CivilCraft daaqad caadi ah.

**Khadka ka baxsan, app-ku ma furmo gebi ahaanba.**
Browser-kan lama kaydin khadka ka baxsan, ama browser-ku wuu nadiifiyay xogta goobta (Safari wuu sidaas sameeyaa goobaha aan la booqan toddobaadyo badan). Khadka ku xirmo, ku fur CivilCraft oo guji {{ui:Kaydi khadka ka baxsan}}.

**Nuqulka khadka ka baxsan waa dhismo hore.**
Guji {{ui:Khadka ka baxsan diyaar}}, kadibna {{ui:Dib u kaydi (hel nooca ugu dambeeya)}} isagoo khadka ku xirnaan.

**Fayl ayaa cas ahaan u muuqda sanduuqa furista.**
Sanduuqu wuxuu liistaa kaliya faylasha barooyinka, LandXML iyo mashruucyada iyada oo loo eegayo dhamaadkooda. Fayl ku-jiid sawirka dhexdiisa halkii, ama magacdii u beddel `.txt`.

## Soo dhoofinta barooyinka

**"No points could be read from this file."**
Dooro habka tiirarka **Tiirarka** gacanta. Haddii waxba shaqayn, fur faylka tafatire qoraal oo hubi inuu yahay hal barood sadar kasta, lambarro ku jira.

**Sawirka wuu rogan yahay, leexan yahay ama toos u fidsan yahay.**
Waqooyi (northing) iyo bari (easting) waa is-beddelay. Soo koobidda waxay tidhi "guessed from the column count". Dooro PENZD halkii PNEZD (ama mid kale) **Tiirarka** ku jira, ama mar kale soo dhoofi.

**Barooyin aad uga fog kuwa kale, sawirkana wuxuu u yimid nuqul yar.**
Sadar ayaa khalad ku leh koorodinad, ama faylku wuxuu isku qasay nidaamyo koorodinadyo oo kala duwan. Hel barta (riix si aad lambarkeeda u aragto) oo hagaaji faylka.

**Safafka ku qoran "Rows not read".**
Eeg miiska ku jira [Soo dhoofi barooyinka sahan dhulka](topic:import-points#rows-that-are-not-read).

**Barooyintaydii hore way lumeen.**
Soo dhoofinta faylka barooyinka waxay beddeshaa dhammaan barooyinka, waxayna tirtirtaa soo celinta. Fur mashruucaaga la kaydiyay si aad ugu soo celiso.

## Dusha

**"Surface: Not built" oo sanduuq cas leh.**
Sanduuqu wuxuu sheegayaa sababta: "A surface needs at least three points with elevations.", "The points are all on one line: no triangles.", "No points with elevations.", "The boundary does not overlap the points." ama "No triangles are left inside the boundary." Hubi tiirarka, kooxaha barooyinka (ma {{ui:Laga reebay}} baa?), iyo xadka.

**Kontuurrada waxay gooyaan dhuumaha ama buurta toos ah.**
Xariiqaas ma aha xarriiqa jabinta. Kooxdiisa dejii {{ui:Xarriiqa jabinta}}, ama samee adigoo isticmaalaya qalabka {{ui:Xarriiqa jabinta}}. Eeg [Dhis oo hagaaji dusha](topic:build-surface).

**Kooxda xarriiqa jabinta waxay samaysay zig-zag.**
Kooxdu waxay ka kooban tahay in ka badan hal xariiq, ama barooyinkeedu lambarro iskuma raacaan jeexda. Kooxda dib ugu celi **Barood** oo samee xariiq kasta adigoo isticmaalaya qalabka {{ui:Xarriiqa jabinta}}.

**Saddex-geesood dheer oo cirro ah dibadda.**
Samee xadka ({{key:O}}) ama dejii **Xaddiga dibadda ee ugu dheer**.

**Kontuur ma jiro, in kasta oo dusha la dhisay.**
Mid mid ah: {{ui:Kontuurrada}} waa demaa **Bandhigga** hoosta, ama fardaha waa yar tahay inta ay ku jiri doonaan in ka badan 2,000 heer kontuur. Dooro fardo weyn.

**Xarriiqyada jabinta ama xadku waxba ma beddelo.**
Dusha waxaa laga keenay LandXML ("Surface (from LandXML)"). Sidii ayuu yahay ayaa la isticmaalaa. Guji {{ui:Dib u dhis dusha barooyinka}} si aad uga dhisto barooyinka.

**"There is no surface yet: open survey points first."**
Xarriiqa jabinta, xadka iyo pad-ku waxay u baahan yihiin dusha dhulka ee hore. Marka hore soo dhoofi barooyinka.

**"Click a survey point with an elevation: a breakline takes the points’ elevations."**
Qalabka {{ui:Xarriiqa jabinta}} wuxuu kaliya doortaa barooyinka sahan dhulka. Ku weyne oo guji barta (dhibic orange ah ayaa muujinaysa midda ay qaadan doonto).

## Naqshadeynta

**Barta u dambeysay way baxday markaan labo jeer gujiyay si aan dhammeeyo.**
Dhismahan, labo jeer gujinta waxay dhammaysaa jeexda, pad-ka, xarriiqa jabinta ama xadka, laakiin waxay tirtirtaa barta aad labo jeer guujiyey. Guji barta u dambeysay mar, kadibna riix {{key:Enter}}. Haddii ay horey u dhacday, isticmaal {{key:Mod+Z}}, kadibna mar kale naqshadee.

**Ma dhammayn karo naqshad taableedh ku jira.**
Dhammaynta waxay u baahan tahay {{key:Enter}}; weli badhan shaashad ma jirto. Ku xir kiiboodh. Eeg [Mowshirka, mowshirka-cabbirka iyo taabashada](topic:keyboard#mouse-trackpad-and-touch).

**Jiidista si aad barta u dhigto waxay kor u dhaqdhaqaysaa.**
Jiidid ka weyn dhowr pixel waxay dhaqaajinaysaa sawirka qalabka kasta. Guji adigoon dhaqaajin.

**"An alignment needs at least two points." / "A pad needs at least three corners." / "A pipe run needs at least two structures."**
Waxaad riixday {{key:Enter}} hore intaan dhammayn. Naqshadda waa la tirtiray; mar kale bilow.

**Furayaasha sida A ama G wax ma sameeyaan.**
Sanduuqa qoraalka ama liiska panel-ka ayaa weli fiiro haya, sidaas awgeed xarfaha ayaa u gudbaya halkaas. Guji sawirka mar, kadibna riix furaha. Mac-ka, furaha tirtirka waa Backspace browser-ka: isticmaal Fn iyo delete si aad wax u tirtirto.

## Jeexyada iyo muuqaalka dherer

**"The curves at PI 2 and PI 3 overlap: … Use smaller radii."**
Labo wareeg u baahan yihiin tangent ka badan intii u dhexaysay PI-yadooda. Hoos u dhig mid ama labadaba radius-ka miiska PI, ama ka fogee PI-yada.

**"PI 3 turns straight back; it cannot take a curve."**
Jeexdu waxay ku soo noqotaa naftiisa PI-gaas. Ka guuri ama ka saar PI-ga.

**"This alignment has no ground under it to start from."**
Jeexdu waa ka baxsan dusha. Ku guuri dusha dushiisa, ama ku dar PVI-yo adigoo guuji {{ui:Ku dar PVI-yo}} oo furan.

**"The vertical curve at PVI 3 (L = …) starts before the curve or PVI before it ends." / "… runs past the next PVI."**
Gaabi dhererka wareegga ama ka fogee PVI-yada.

**"There is already a PVI at …"**
PVI ayaa horey u jirtay meeshaas. Guji meel kale, ama jiid midka jira.

**Muuqaalka dherer waa faarug: "Draw an alignment to see its profile."**
Ma jiro jeex, ama jeexda la doortay wuxuu leeyahay khaladaad.

## Koridoorada iyo pad-yada

**"The corridor needs a design profile without errors."**
Bilow muuqaal naqshadeyn ({{ui:Ka bilow dhulka}}) oo hagaaji isku dhacyada wareegyada.

**"… side slopes run off the surface before meeting the ground." / "… slope lines run off the surface before meeting it …"**
Hagaynta waxay gaadhaa xadka dusha ka hor intaysan gaadhin dhulka. Naqshadda ka soo geli xadka, ama ku soo dhowaan dhulka. Pad cusub oo qayb ka mid ah ka baxsan dusha wuxuu ku bilaabmi karaa sare-joog 0: ku qor sare-joog dhab ah.

**"The corridor’s daylight lines cross …" / "The daylight line crosses itself …"**
Dhinacyada kala duwan waxay isku dhacaan: wareegyo adag, pad-yo cidhiidhi ah, gooyn qoto dheer ama buuxin sare. Isticmaal radius weyn, qaab cidhiidhi ah, pad ballaaran ama jiifyo ka sarreeya.

**"No volumes yet: a pad needs to grade without problems."**
Hagaaji dhibaatooyinka ku qoran sanduuqa cas ee ka sarreeya.

**{{ui:Proposed (graded)}} waa la qarriyay.**
Pad ama koridoor weli lama hagaaseyn.

## Tuubooyinka

**"P2 has no inverts yet."**
Guji {{ui:Dejii jooggeeda hoose xeerarka}} ama ku qor hoose-jooga.

**"P1: no ground at S1 to start from."**
Qaabka soo-shubka ayaa ka baxsan dusha oo ma leh xaashi. Ku qor xaashi.

**Tuubo kasta waa la calaamadeeyay markaan qaab dhaqaajiyay.**
Dhaqaajinta qaabku ma beddelo hoose-joogga. Guji {{ui:Dejii hoos u dhaca kasta xeerarka}}.

Fariimaha shabakada oo dhan waxaa lagu sharxay [Dejii shabakadda tuubooyinka xagasha](topic:pipe-network#read-and-fix-problems).

## Kaydinta iyo dhoofinta

**"Nothing to export yet." / "Nothing to plot yet."**
Mashruucu waa maran yahay. Marka hore soo dhoofi barooyinka.

**Faylka la kaydiyay ma helo.**
Waxa uu ku jiraa download-yada browser-ka (badanaa folder-ka Downloads). Eeg [Faylasha aad furi, kaydin iyo dhoofin karto](topic:files#where-the-files-go).

**Miisaanka PDF waa khalad warqadda.**
Daabac 100% ama cabbirka dhabta ah, ma aha "fit to page".

**Calaamadaha su'aasha ku jira PDF-ka.**
Magacyada ama sharaxaadaha waxay isticmaalaan xarfo ka baxsan jaadka Yurub ee galbeed. Fariintu waxay tirinaysaa. Dib u magacee xarfo caadi ah.

**Sawirka waa la jaraa geeska.**
Miisaanku waa weyn yahay warqadda. Dooro miisaan ku qoran "(fits)", warqad weyn, ama {{ui:Waxa shaashadda ku jira}}.

**{{key:Mod+P}} wuxuu furay wada-hadalka daabacaadda browser-ka.**
Bogga ma lahayn fiiro. Xidh wada-hadalka, guji sawirka, kadibna riix {{key:Mod+P}} mar kale, ama guji {{ui:PDF}}.

## App-ka laftiisa

**Shaashadu waa madhan tahay ama qalabka waxba ma sameeyo.**
Isticmaal nooca hadda ee Chrome, Edge, Firefox ama Safari, kadibna dib u soo rog. Eeg [Browser-yada](common:browsers).

**App-ku wuu gaabiyaa faylka barooyinka weyn.**
Demee {{ui:Saddexagallada}}, {{ui:Calaamadaha barta}} iyo {{ui:Xagaaga heerarka}}, oo isticmaal fardo kontuur weyn. Dusha waaweyn waxay qaadaan wakhti mar kasta markaad isbeddelo.

**Browser-ku wuxuu weydiinayaa "Leave site?"**
Mashruucu wuxuu leeyahay isbeddel aan la kaydin. Sug, kaydi {{key:Mod+S}}, kadibna ka bax.
