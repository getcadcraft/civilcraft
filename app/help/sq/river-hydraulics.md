---
title: Profilet e sipërfaqes së ujit të lumit
summary: Modeloni një lum nga sipërfaqja e tokës dhe llogaritni profilet e qëndrueshme të sipërfaqes së ujit me metodën e hapit standard: nivelet e ujit, energjia, shpejtësitë, numrat e Froude dhe shtrirja e përmbytjes në plan. Një veçori laboratorike; çdo rezultat kërkon shqyrtimin e një inxhinieri.
keywords: digë, zonë e papërfillshme rrjedhjeje, redaktori i prerjeve, lum, hidraulikë, profil i sipërfaqes së ujit, mbrapështim, hapi standard, rrjedhje e qëndrueshme, 1d, prerje tërthore, manning, rugozitet, përçueshmëri, thellësi kritike, thellësi normale, froude, linja e energjisë, shtrirja e përmbytjes, fushë përmbytjeje, mbushja, pikat e brigjeve, gjatësitë e segmenteve, ngushtim, zgjerim, nënkritike, superkritike, regjim i përzier, shkallë hidraulike
from: fb8bf425
---

CivilCraft llogarit profile të qëndrueshme, njëdimensionale të sipërfaqes së ujit përgjatë një lumi: për çdo rrjedhje që jepni, nivelin e ujit në çdo prerje tërthore, nga ekuilibri i energjisë midis prerjeve fqinje (metoda e hapit standard). Është në laborator ndërsa kontrollohet.

**Vetëm ndihmë projektimi.** Nivelet e ujit kërkojnë shqyrtimin e një inxhinieri të kualifikuar përpara se dikush të mbështetet mbi to: një model 1D është aq i mirë sa prerjet, vlerat e rugozitetit, gjatësitë e segmenteve dhe kufijtë e tij, dhe nuk di asgjë për urat, tombinatët ose rrjedhjen që del nga lumi.

## Vizatoni lumin

1. Ndërtoni fillimisht sipërfaqen ekzistuese të tokës (pikat, vijat e thyerjes, ose një TIN që keni hapur).
2. Te **Surface** › {{ui:More}}, zgjidhni {{ui:River}}.
3. Klikoni përgjatë boshtit të lumit **nga lart poshtë** (nga lart drejt poshtë), pastaj shtypni {{key:Enter}} ose klikoni dy herë.

CivilCraft pret një prerje katrore me boshtin çdo 50 m (200 ft), 100 m (300 ft) në çdo anë, nga toka. Stacionet e lumit matën nga skaji i poshtëm, kështu që rriten lart. Brigjet fillojnë si një supozim 10 m (30 ft) në çdo anë të pikës më të ulët të çdo prerjeje.

Për të shtuar një prerje aty ku lumi ngushtohet ose ndodhet një strukturë, përzgjidhni lumin, klikoni {{ui:Add a section}} dhe tërhiqni një vijë prerjeje përtej tij (në çdo drejtim: kthehet që të shkojë majtas në djathtas duke parë poshtë).

## Konfiguroni lumin

Përzgjidhni lumin për ta parë te **Veti**:

- **Flow regime**: nënkritike (rasti i zakonshëm: llogaritet lart nga kufiri i poshtëm), superkritike (llogaritet poshtë nga kufiri i sipërm) ose e përzier (të dyja, pastaj ajo me forcën specifike më të madhe në çdo prerje; një pamje paraprake).
- **Flow profiles**: një emër dhe një rrjedhje për secilin (për shembull një rrjedhje 10-vjeçare dhe 100-vjeçare), dhe kufiri te skaji i poshtëm (dhe te skaji i sipërm kur regjimi nuk është nënkritik): **Normal depth** me një pjerrësi energjie (pjerrësia e shtratit është një supozim i parë), një lartësi të njohur të sipërfaqes së ujit **Known water surface**, ose **Critical depth**.
- **Sections from the ground**: distanca, sa larg majtas dhe djathtas, supozimi i brigjeve dhe dy vlerat e n të Manning-ut; {{ui:Cut sections again}} zëvendëson prerjet (një hap zhbërjeje).
- **Tabela e prerjeve**: për çdo prerje, zhvendosjet e brigjeve majtas dhe djathtas, n-ja e kanalit dhe n-ja e tejmbushjes, gjatësitë e segmenteve deri te prerja e ardhshme poshtë (tejmbushja majtas, kanali, tejmbushja djathtas; të matura nga plani për të filluar) dhe koeficientët e ngushtimit dhe zgjerimit (0.1 dhe 0.3 për të filluar: kalime të buta). {{ui:Edit}} hap redaktorin e prerjes (më poshtë); një pikë pas tij do të thotë se prerja ka një digë ose një zonë të papërfillshme.

Çdo ndryshim është një hap zhbërjeje ({{key:Mod+Z}}).

## Redaktoni një prerje: brigjet, digat dhe zonat e papërfillshme

{{ui:Edit}} mbi një prerje vizaton tokën e saj dhe ju lejon të tërhiqni atë që lexon zgjidhësi: **brigjet majtas dhe djathtas** (ata e ndajnë prerjen në tejmbushjen majtas, kanalin kryesor dhe tejmbushjen djathtas), një **digë** në secilën anë dhe **zona të papërfillshme rrjedhjeje**. Çdo dorezë mund të zhvendoset edhe me tastet me shigjeta, dhe çdo numër mund të shkruhet pranë grafikut. {{ui:Apply}} është një hap zhbërjeje.

- Një **digë** ka një vend (zhvendosje) dhe një lartësi kreshte. Toka përtej saj, larg lumit, shkëputet nga lumi ndërsa sipërfaqja e ujit është nën kreshtën: sipërfaqja, perimetri i lagur dhe përçueshmëria e saj lihen jashtë. Mbi kreshtën e gjithë prerja numërohet përsëri. Një digë qëndron jashtë brigut që mbron; një digë brenda brigjeve shënohet.
- Një **zonë e papërfillshme rrjedhjeje** mban ujë por nuk mbart rrjedhje (një xhep pas një argjine, ujë i vdekur pranë një qasjeje urash). Jepni dy zhvendosjet e saj dhe, nëse dëshironi, një nivel uji nën të cilin është e papërfillshme ({{ui:always}} kur është bosh): mbi atë nivel rrjedh si pjesa tjetër. Një që mbulon një pjesë të kanalit kryesor shënohet.
- Midis dy prerjeve, shtrirja e përmbytjes lë të thatë tokën pas një dige që kanë të dyja prerjet, ndërsa sipërfaqja e ujit atje është nën kreshtën (vija midis dy kreshtave është e drejtë).

## Llogaritni dhe lexoni rezultatet

Klikoni {{ui:Water surface profiles}}. Për profilin që zgjidhni, merrni:

- një **grafik** përgjatë lumit (rrjedha nga e majta në të djathtën): fundi i kanalit, brigjet, sipërfaqja e ujit, linja e energjisë dhe sipërfaqja kritike e ujit; prerjet e mbajtura në thellësi kritike rrethohen;
- një **tabelë** për çdo prerje: stacioni i lumit, rrjedhja, fundi i kanalit, sipërfaqja e ujit, sipërfaqja kritike e ujit, linja e energjisë, thellësia, shpejtësia në kanal dhe përgjithësisht, numri i Froude-it të kanalit, sipërfaqja e rrjedhjes, gjerësia e sipërme, rrjedha në çdo tejmbushje dhe në kanal, pjerrësia e energjisë dhe paralajmërimet;
- **paralajmërime** me fjalë të thjeshta, për shembull një prerje e vendosur në thellësi kritike, ujë mbi skajet e një prerjeje, ose një ndryshim i madh i përçueshmërisë midis dy prerjeve (shtoni prerje ndërmjet).

{{ui:Table (CSV)}}, {{ui:Report}} (tekst i thjeshtë me metodën, kufijtë dhe çdo tabelë) dhe {{ui:Plot (SVG)}} ruhen në shkarkimet tuaja. Çdo njëra mban rreshtin e shqyrtimit.

Shenjoni {{ui:Show the flood extent}} te **Veti** për të hijezuar zonën e lagur në plan për profilin e zgjedhur, me vijën e ujit të vizatuar aty ku thellësia është zero. Midis prerjeve sipërfaqja e ujit është e nivelit përgjatë lumit dhe ndryshon në mënyrë lineare me stacionin e lumit. Toka pas një dige mbetet e thatë ndërsa uji është nën kreshtën e saj. Toka tjetër e ulët brenda korridorit të lumit që uji nuk mund ta arrijë (pas një argjine rruge, për shembull) hijezohet akoma: kontrolloni atë.

## Në vizatim dhe te Problemet

Vijat e lumit shkojnë në plan, PDF dhe DWG në shtresat e tyre: **C-WATR-CNTR** (boshti), **C-WATR-SCTN** (çdo vijë prerjeje, me stacionin e lumit të saj) dhe **C-WATR-FLOD** (vija e ujit të shtrirjes së përmbytjes, kur {{ui:Show the flood extent}} është shënuar për një profil). Paralajmërimet e lumit (një prerje në thellësi kritike, ujë mbi skajet e prerjes, një ndryshim përçueshmërie që kërkon më shumë prerje, një bilanc energjie që nuk u mbyll, një digë brenda brigjeve) shkojnë gjithashtu te paneli **Problemet**, për lumin dhe të vendosura te prerja nga vjen.

## Si llogaritet

- Energjia midis dy prerjeve: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Përçueshmëria me nënndarje: çdo tejmbushje ndahet aty ku ndryshon n-ja e saj, K = Σ (1/n)·A·R^(2/3) (1.486/n në njësi amerikane); kanali është një copë e vetme, me një n të përbërë kur ndryshon n-ja e tij. α del nga mënyra si ndahet përçueshmëria.
- Pjerrësia e fërkimit me përçueshmëri mesatare, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², mbi gjatësinë e segmentit të peshuar me rrjedhjen.
- Koeficienti i ngushtimit kur rrjedha përshpejtohet poshtë, zgjerimi kur ngadalësohet.
- Thellësia kritike = energjia specifike më e vogël. Çdo nivel uji zgjidhet në një kllapa, kështu që nuk kalon kurrë në anën e gabuar të kritikes; kur nuk ka përgjigje, vendoset në thellësi kritike dhe shënohet.

Programi është kontrolluar me thellësinë normale të Manning-ut, thellësinë kritike në një kanal drejtkëndësh dhe shembullin e mbrapështimit të Chow-t (*Open-Channel Hydraulics*, 1959, kapitulli 10), të integruar në mënyrë të pavarur. E njëjta metodë përdoret nga programet e zakonshme 1D të lumenjve, kështu që një llogaritje me dorë ose shënimet e një studenti kalojnë pa problem.

## Tombinatët dhe urat

Te **Veti** e lumit, nën **Culverts and bridges**, {{ui:Add a culvert}} ose {{ui:Add a bridge}} vendos një të tillë midis dy prerjeve (çdo segment mban të paktën dy prerje). Profili poshtë tij nuk ndryshon; sipërfaqja e ujit pak mbi të vjen nga struktura dhe profili vazhdon lart nga aty. **Results** shton një tabelë për çdo strukturë: ujin poshtë, nivelin e ujit lart, cili kontroll mbizotëron, rrjedhjen përmes hapjes dhe rrjedhjen mbi rrugën ose kalimin. Vetëm për rrjedhje nënkritike.

- **Culvert** (kuti ose rreth, një ose më shumë cilindra të barabartë). Kontrolli në hyrje është rrjedhje si pragje ndërsa hyrja është e lirë dhe rrjedhje si orific kur mbytet, e përzier midis një lartësie lart prej një deri në një e gjysmë herë ngritjen. Kontrolli në dalje është ekuilibri i energjisë: humbja në hyrje, fërkimi dhe koka e shpejtësisë në dalje, mbi më të lartën ndërmjet ujit poshtë dhe mesit të thellësisë kritike dhe kurorës, pa rënien përgjatë cilindrit. Niveli lart është më i madhi nga të dy. Shenjoni **Water can go over the road** dhe rrjedhja si pragje e rrugës ndahet me cilindrat.
- **Bridge.** Hapja është prerja nën urë, e prerë te mbështetëset, me çdo shtyllë si një zonë që nuk mban rrjedhje. Sipërfaqja e ujit në hapje vjen nga prerja poshtë (koeficienti i zgjerimit), dhe ajo sipër nga hapja (koeficienti i ngushtimit). Nëse hapja nuk mund të kalojë rrjedhjen me atë ujë poshtë, ajo punon në thellësi kritike dhe ura shënohet si e mbyllur. Nëse uji arrin pjesën e ulët të trarit, rrjedhja është me presion (tip portë kur ujët poshtë është nën trarin e ulët, i mbytur mbi të), dhe uji mbi kalim shton rrjedhjen si pragje; niveli lart është ai ku ato shuma japin rrjedhjen.

Koeficientët (shkarkimi, humbja në hyrje, pragu) janë vlera parazgjedhje me numra të rrumbullakët. Ndryshojini për projektin tuaj. Ata nuk janë grafikët e montuar që printojnë manualet e projektimit të tombinatëve, prandaj merreni nivelin lart të një tombinati pranë kufirit të tij si një vlerësim. Uji mbi një rrugë ose kalim, një hyrje e mbytur, një hapje e mbyllur dhe rrjedhja e shpejtë në një cilindër tregohen në **Problemet**.

## Rrjedhje e paqëndrueshme

{{ui:Unsteady flow…}} te **Veti** e lumit e kalon një hidrogram përmbytjeje përgjatë prerjeve. Shkruani hyrjen si orë dhe rrjedhje, një çift për rresht, pjerrësinë e poshtme (thellësia normale) dhe sa kohë të ekzekutohet. Ai niset nga sipërfaqja e qëndrueshme e ujit në rrjedhjen e parë dhe zgjidh ekuacionet e plota njëdimensionale (skema implicite me katër pika, e peshuar 0.6 në kohë). Merrni nivelin dhe rrjedhjen maksimale të ujit në çdo prerje me orën kur ndodh secila, një grafik të rrjedhjes në dy skajet dhe kontrollin e vëllimit (hyrja, dalja dhe ndryshimi i ruajtur). Kontrollohet që rrjedhja e qëndrueshme të mbetet e qëndrueshme, një hap në hyrje të përfundojë në profilin e qëndrueshëm të rrjedhjes së re, vëllimi të mbyllet, dhe shpejtësia e valës së përmbytjes krahasohet me valën kinematike. Rrjedhje nënkritike, një segment, pa rrjedhje anësore, dhe pa tombinatë ose ura brenda ekzekutimit.

## Bashkimet

Segmente që bashkojnë rrjedhjen në një dalje: rrjedhjet mblidhen, dhe sipërfaqja e ujit në fillim të segmentit poshtë çohet deri në skajet e segmenteve që bashkohen me të (e njëjta sipërfaqe uji në bashkim, metoda e thjeshtë: pa kënd, pa moment, kështu që i përshtatet numrave të ulët të Froude-it). Modeli dhe testet janë në vend (`river-structures.js`); një panel për bashkimin e dy lumenjve në plan nuk është ndërtuar ende.

## Ende nuk është ndërtuar

Pragje dhe porta si struktura të veçanta, një panel për bashkimet, struktura brenda një ekzekutimi të paqëndrueshëm, dhe rrjedhje superkritike e paqëndrueshme. Një ekzekutim me regjim të përzier shënon një kërcim hidraulik midis dy prerjeve, por nuk e vendos.

**Ku bashkohen lumenjtë.** Te Veti e një lumi, "Flows into" emëron lumin me të cilin bashkohet. Lumenjtë që bashkohen zgjidhen së bashku: lumi ku ata rrjedhin mban shumën e rrjedhjeve të tyre, dhe secili prej tyre përfundon te sipërfaqja e ujit të prerjes së parë të atij lumi (metoda e sipërfaqes së barabartë të ujit; lë jashtë këndin dhe momentin e rrjedhjeve). Për të bashkuar një lum kryesor dhe një përrua, vizatoni një lum të shkurtër poshtë bashkimit dhe lëreni që të dy të rrjedhin në të. Rezultatet tregojnë një tabelë bashkimi. Parazgjedhjet në këto rezultate (ngushtimi 0.1, zgjerimi 0.3, kanal me një copë dhe rugozitet të përbërë, regjimi i përzier sipas forcës specifike) mbeten derisa një inxhinier t'i shqyrtojë, dhe Rezultatet e thonë këtë.
