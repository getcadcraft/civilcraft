---
title: Dhis oo hagaaji dusha
summary: Sida CivilCraft u saddex-geesayo dhulka jira, iyo sida loo qaabeeyo iyada oo la isticmaalayo kooxaha xariiqyada jebinta, xariiqyada la sawiray, xadka dibadda iyo cidhifka dibadda ee ugu dheer.
keywords: tin, dusha, saddex-geeska, xariiqa jebinta, xadka, dhulka jira, eg, abuur dusha, delaunay, saddex-geesaha, max edge, xadka dibadda
from: b9eea3f3
---

CivilCraft wuxuu leeyahay hal dusha dhulka jira mashruuc kasta. Waa TIN (triangulated irregular network) oo laga dhisay dhibcahaaga, waxaana si toos ah dib loo dhisaa marka kasta oo wax gelinta isbeddelo. Ma jiro amar "rebuild" ah, ma jiro dusha duugoobay.

## Waxa galaya dusha

- Dhibcaha kasta oo leh kor u kac kooxda loo dejiyay {{ui:Points}}.
- Kooxda kasta oo loo dejiyay {{ui:Breakline}}, oo lagu xidhay lambarka dhibcaha.
- Xariiq jebin kasta oo aad ku sawirtay qalabka {{ui:Breakline}}.
- Xadka dibadda, haddii aad sawirtay.
- Dejinta **Longest outside edge** (Cidhifka dibadda ee ugu dheer).

Saddex-geeskuna ma gudbaan xariiq jebin: dusha waa la qasbaa inuu raaco, ka dibna waxaa si siman loo sameeyaa oo ku wareegsan (Delaunay meelaha kale oo dhan).

## Ka dhig xariiqyada koodka leh xariiqyo jebin

1. Dhinaca bidix hoosta **Points** (Barood), hel kooxda (tusaale FL).
2. Deji doorashada **Surface** (Dusha) ee kooxda oo ah {{ui:Breakline}}.
   Dusha dib ayuu u dhisaa, xariiqa waxaa lagu sawiraa midabka liin-cad (orange) (oo {{ui:Breaklines}} shidan hoosta **Display** (Bandhig)), **Breaklines** (Khadadka jebinta) ee xogta dusha ayaa kor u kacda hal.
3. Hubi xariiqa qorshaha. Waa inuu ka socdaa dhibic ilaa dhibic, siday u kala horreeyeen xariiqa la rasaasay. Haddii uu u dhaco sida zig-zag, kooxdu waxay haysaa in ka badan hal xariiq, ama dhibcaha lambarradooda si sax ah uma kala horreeyaan: dib u deji kooxda {{ui:Points}} oo xariiqyada ku sawir gacanta (qaybta soo socota).

## Sawir xariiq jebin dhibcaha dhexdooda

1. Riix {{key:B}}, ama guji {{ui:Breakline}} kooxda **Surface** (Dusha).
   Calaamadda hagista ayaa sheegaysa in aad guujiso dhibcaha sahanka siday u kala horreeyaan (waxay qaadaan kor u kacooda). {{key:Enter}} wuu dhammaysiiyaa.
2. Dhaqaaq jiritaanka dhibic u dhow. Afar-geesle yar oo liin-cad ah ayaa calaamadeynaya dhibicda uu qaadan doono.
3. Guji dhibcaha xariiqa mid mid. Guji kasta wuxuu magacaabaa dhibcaha iyo kor u kaca bar-xaaladda.
4. Riix {{key:Enter}} si aad u dhammaysato.
   Bar-xaaladdu wuxuu sheegayaa "Breakline 1 added; the surface was rebuilt." (Xariiqa jebinta 1 waa lagu daray; dusha waa dib loo dhisay.)

Gujinta waa inay ku dhacaan dhibic sahan oo leh kor u kac; gujin meel kale waa la diidaa, oo waxaa la sheegaa: "Click a survey point with an elevation: a breakline takes the points’ elevations." (Guji dhibic sahan oo leh kor u kac: xariiq jebin wuxuu qaadaa kor u kaca dhibcaha.) {{key:Backspace}} wuxuu tirtiraa dhibicda ugu dambeysa; {{key:Esc}} wuxuu joojiyaa xariiqa oo dhan.

:::warning
Dhammaystir {{key:Enter}}. Laba jeer guji ayaa sidoo kale dhammaysta, laakiin dhismahan wuxuu tirtiraa dhibicda aad laba jeer gujisay. Guji dhibicda ugu dambeysa hal mar, ka dibna riix {{key:Enter}}.
:::

Si aad u tirtirto dhammaan xariiqyada jebinta la sawiray hal mar, guji {{ui:Remove drawn breaklines}} qaybta **Surface**. Si aad u tirtirto kaliya kii ugu dambeeyay, isticmaal {{key:Mod+Z}}. Xariiqyada la sawiray lama dooran karo ama lama tafatiri karo midmid ahaan weli.

## Sawir xadka dibadda

Xadku wuxuu jaraa dusha ilaa aagga aad isku halleyso, tusaale ahaan xuduudaha sahanka, si saddex-geesaha dheer ee ku fidsan geesaha aan la sahamin ay u baxaan.

1. Riix {{key:O}}, ama guji {{ui:Boundary}}.
2. Guji geesaha mid mid wareegga aagga. Xariiq jajab ah ayaa muujinaysa qaabka.
3. Riix {{key:Enter}}.
   Bar-xaaladdu wuxuu sheegayaa "Boundary set; triangles outside it are gone." (Xadka waa la dejiyay; saddex-geesaha ka baxsan waa la tirtiray.) **Boundary** (Xadka) ee xogta dusha wuxuu leeyahay "Yes" (Haa) iyo tirada geesaha.

Waxaad ogaataa:

- Waxaa jira hal xad oo keliya. Mid kale sawirista wuxuu beddelaa midka hore. {{ui:Remove the boundary}} ayaa tirtiraa.
- Waxa uu kaliya kala saari karaa: xad oo ka gudba dhibcaha ayaa lagu jaraa qaabkooda, oo waxaa la sheegaa "The boundary reaches past the points; it was cut back to their outline." (Xadku wuxuu ka gudbaa dhibcaha; waxaa lagu jaray qaabkooda.)
- Geesihiisu waxay qaataan kor u kacooda dusha, sidaas darteed cidhifku si sax ah ayuu u raacaa dhulka.
- Xadka qarsan (gudaha) weli ma diyaar aha.

## Jar saddex-geeskyada dibadda ee dheer

Haddii aanu xad jirin, dusha wuxuu buuxiyaa qaabka dhibcaha oo dhan, oo ay ku jiraan saddex-geesaha dheer ee khafiifka ah ee ku fidsan geesaha foorarka.

1. Hoosta **Surface** (Dusha), qor dherer ku jira **Longest outside edge** (Cidhifka dibadda ee ugu dheer) oo riix {{key:Enter}}. Ku bilow qiyaas ahaan laba ama saddex jeer masaafada rasaaska caadiga ah.
2. Saddex-geesaha dibadda kuwaas oo cidhifkooda dibadda uu ka dheer yahay taas waa la saaraa, si gudaha loo galo ilaa cidhifyada dibadda oo dhan ay gaabanaadaan. Cidhifka xariiq jebin weligiis lama jaro.
3. Qor 0 si aad mar kale u ilaaliso saddex-geesaha oo dhan.

## Akhri warbixinta dusha

Hoosta xogta dusha, sanduuq ayaa liistaa waxa dhisuhu sameeyay. Bar liin-cad oo bidixda ah wuxuu yahay macluumaad; bar cas wuxuu leeyahay khalad, oo dusha ma jiro.

| Fariinta | Macnaha |
|---|---|
| "3 points were at the same place as another and joined it." | Dhibcaha ka yar 0.0001 qorshaha waxay noqdeen hal geesood (kii ugu horreeyay ayaa la ilaaliyay). |
| "2 places have two different elevations …" | Dhibcaha isku dul saaran, ama xariiqyada jebinta oo isgoysa, kuma heshiiyaan dhererka. Kor u kaca xariiqa jebinta ayaa u guuleysta, ka dibna kii ugu horreeyay. |
| "1 breakline piece could not be forced into the surface." | Qayb xariiq jebin oo aad u gaaban ama ku dhow isku dhac ma mahan; hubi meeshaas. |
| "A surface needs at least three points with elevations." | Dhibcood yar: hubi tiirarka iyo kooxaha. |
| "The points are all on one line: no triangles." | Dhibcaha oo dhan waa hal xariiq: ma jiro saddex-geesood. Dhibcaha ma leh ballac, tusaale hal xariiq traverse. |
| "The boundary does not overlap the points." | Xadku meel kale ayuu ku yaal, badanaa khalad unit ama isku-xirka. |
| "No triangles are left inside the boundary." | Xadku aad buu u yar yahay ama meel khalad ah ayuu yaal. |

## Dusha laga akhriyay LandXML

Marka aad furto LandXML, TIN-ka koowaad ee faylka waa la isticmaalaa sida uu yahay: madaxa **Surface** wuxuu leeyahay "Surface (from LandXML)" (Dusha (laga soo qaadan LandXML)), **Longest outside edge** waa la xidhay (midab-cad). Intii dushaas la isticmaalayo, kooxaha xariiqyada jebinta, xariiqyada la sawiray iyo xad cusub ma beddelaan. Si aad dusha uga dhisto dhibcaha faylka, guji {{ui:Rebuild the surface from the points}}. {{key:Mod+Z}} wuxuu soo celinayaa dusha LandXML.

## Xidhiidh

- [Akhri xariiqyada heerka, kor u kacyada iyo jiifyada](topic:contours).
- [Soo geli dhibcaha sahanka](topic:import-points).
