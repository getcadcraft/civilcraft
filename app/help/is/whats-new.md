---
title: Nýtt í 0.8 og 0.8.1
summary: CivilCraft 0.8 bætir við Láttu rigna (stormkeyrsla yfir mótun þinni), jarðvinnujöfnun, leit að bestu leið, varnartjarnir, framvindu eftir mælingum, innflutning heimilisfangs á lóð sem geymir lóðina í verkefninu, og glugga fyrir jarðveg og halla, gatnamót og merkingar, jöfnun mælinga, opnar námur, radíótengingar og brautarskiptar. 0.8.1 lagar hvernig DWG-skrár eru lesnar.
keywords: nýtt, hvað er nýtt, útgáfuskýringar, breytingaskrá, breytingar, 0.8, 0.8.1, útgáfa, nýir eiginleikar, rigning, stormur, pollur, yfirfall, jarðvinna, jöfnun, flutningur, besta leið, minnsti kostnaður, veglína, varnartjörn, frárennslisop, tæming, frípláss, framvinda, mæling, dróni, haugur, heimilisfang á lóð, lóð, jarðvegur, flóð, hallastöðugleiki, Bishop, setning, gatnamót, merkingar, skilti, sjónlengd, minnstu kvaðrata, mælilína, opin náma, blokkarlíkan, radíótenging, Fresnel, skiptir, krossgangur, tungumál, vandamál, Live, dwg
from: b0932cf0
---

Þetta er það sem breyttist í CivilCraft 0.8 (2026-11-01) og 0.8.1 (2026-11-02), miðað við 0.7. Stærstu nýju hlutarnir eru verkfæri sem prófa mótun þína og svæðið (rigning, jarðvinna, leiðir, tjarnir, framvinda) og sex reiknigluggar fyrir land, vegi, mælingar, námur, tengingar og járnbrautir.

## Nýtt

### Prófaðu mótunina þína

- **Láttu rigna.** {{ui:Láttu rigna…}} (undir {{ui:Yfirborð}}) lætur storm falla á mótaða landið. Þú sérð vatnið renna af pöllunum, safnast í tjarnir í lægðunum og flæða yfir tjarnir sem eru of litlar. Keyrslan er hreyfð og gefur rúmmálin, hámarksútrennsli og CSV-skrá yfir sérhverja tjörn. Sjálfgefin fruma er gróf svo fyrsta skoðun sé skjót; fínni fruma er hægari. Tjarnir sem flæða yfir birtast einnig á Vandamálaspjaldinu.
- **Jarðvinnujöfnun.** {{ui:Jarðvinnujöfnun…}} hækkar eða lækkar pall þar til skurður er jafn fyllingu, og sýnir flutningatöfluna á milli þeirra.
- **Besta leið.** {{ui:Besta leið…}}: veldu upphaf og endi, og CivilCraft finnur ódýrustu leiðina yfir landið sem heldur sig innan halla- og bogamarka þinna, og býr síðan til veglínu úr henni.
- **Varnartjarnir.** {{ui:Varnartjarnir…}} reiknar vatnshæð og geymslurúm út frá landinu þínu, tekur við útrennslistækjum (op, yfirfall, V-skorið yfirfall, neyðarrás), keyrir storm í gegnum tjörnina og athugar hámarkið sem er haldið eftir, tæmingartímann og frípláss.
- **Framvinda eftir mælingum.** {{ui:Framvinda eftir mælingum…}} ber saman dróna- eða skannayfirborð frá mismunandi dagsetningum við landið eins og það var og við hönnunina: hlutfall lokið miðað við rúmmál, svæði sem er of grafið og of fyllt, haugar, og hvenær verkinu lýkur á þessum hraða (merkt sem áætlun).

### Þekktu svæðið

- **Heimilisfang á lóð.** {{ui:Heimilisfang á lóð…}} raðar saman opnum gögnum um lóð, byggingu, skipulag, jarðveg, flóð og landslag á einn stað. Þú getur geymt lóðina í verkefnaskránni: innslegna heimilisfangið, hverja uppsprettu með deginum sem þú sóttir hana og leyfi hennar, og það sem kom til baka. Opnaðu verkefnið aftur eða deildu því og lóðin er enn þar, án þess að nokkuð sé sótt aftur. Þú getur líka vistað hana sem lóðaskrá eða sent hana til BimCraft. Sjá [Heimilisfang á lóð](topic:address-to-site).

### Land, vegir, mælingar, námur, tengingar og járnbrautir

- **Jarðvegur og hallar.** {{ui:Jarðvegur og hallar…}} teiknar jarðvegssniðið milli borhola sem þú slærð inn. Aðferð Bishops leitar síðan að þeim hring á landinu þínu sem er mikilvægastur, með grunnvatnsborði, ofhleðslu og jarðskjálftastuðli; setning undirstöðu fær þjöppun, tafarlausa setningu og tímaþátt.
- **Gatnamót og merkingar.** {{ui:Gatnamót og merkingar…}} setur saman greinar með kantbogum (einn radíus á hverja grein, eða þriggja miðja boga), útsýnislengd fyrir hönnunarhraðann, athugun á sjónþríhyrningum, gangbrautum, stöðvunarlínum, merkingum og skiltum með skiltalista. Þau eru teiknuð á grunnmyndina og vistuð sem .dxf með nefndum lögum.
- **Jöfnun mælinga.** {{ui:Jöfnun mælinga…}} keyrir jöfnun eftir minnstu kvaðrötum á mælilínu eða neti: jöfnuð hnit, villusporbauga, kí-kvaðrat-prófið og merki á mælingu sem passar ekki. Frjáls net, lokun mælilínu með áttavitaaðferðinni og RW5, GSI, JobXML eða CSV vettvangsskrár eru innifalin, og jöfnuðu punktarnir vistast sem CSV.
- **Opnar námur.** {{ui:Opnar námur…}} breytir borsýnum í blokkarlíkan og endanlegu námunni innan halla þíns, með afgangshlutfallinu, töflu eftir þrepum og gæða- og tonnaferli. Innfelldar námur eftir tekjustuðli og framleiðsluáætlun með afvaxtaðu sjóðstreymi eru einnig til staðar.
- **Radíótengingar.** {{ui:Radíótengingar…}} athugar sjónlínu yfir landið þitt með bungu jarðar, fyrsta Fresnel-svæðinu, tengiáætlun, dofnunarsvigrúmi og útfalli vegna fjölbrautarbólgu, og gefur það mastur hæð sem myndi hreinsa leiðina. Það reiknar einnig ljósleiðaratapsáætlanir, magn leiða og vind á turni.
- **Brautarskiptar.** {{ui:Brautarskiptar…}} býr til skipti út frá tungunúmeri þeirra, krossgöngur milli samsíða spora og byggingarmál sem hallar eftir hæðarhalla og breikkar í boga. Skiptin getur staðsett sig á stöð veglínu.

Sjá [Jarðvegur, gatnamót, jöfnun mælinga, námur, radíótengingar og brautarskiptar](topic:soils-roads-survey-mines-links).

## Í öllum forritum

- **Tungumál.** 54 tungumál, tíu þeirra ný. Tungumál önnur en enska eru vélrænar drög þangað til móðurmálsmaður hefur lesið þau. Hjálparefni er enn að mestu á ensku.
- **Línur tækjastikunnar.** {{ui:Stillingar}} › {{ui:Almennt}} › {{ui:Línur tækjastikunnar}}: Vefja (eins og áður), 2 línur eða 1 lína. Borði CivilCraft sýnir mest notaða verkfærið stórt, þau næstu smá, og hin á bak við örina á heiti hópsins.
- **Inntakstæki.** Snertiflötur, penni, þrívíddarmús, stýri og MIDI geta stjórnað forritunum.
- **Vandamál.** Vandamálaspjald sem varar í öllum forritum, með athugunum sem lesa reglugerðarpakka.
- **Live.** Sýn á hver er hvar í Live-lotu.
- **Viðbætur.** Listi yfir viðbætur, með lýsingarviðbótum.
- **Tengdu gervigreindina þína.** Sérhver aðstoðarmaður sem þú tengir getur stjórnað verkfærum CivilCraft. Honum fylgir athugasemd um að tenging með einum smelli innan CadCraft Studio og hýsti tengillinn séu ekki tilbúin enn. Sjá [Láttu gervigreindaraðstoðarmann vinna með svæðið þitt](topic:assistants).

## Lagað í 0.8.1

- **DWG-flokkahlutinn.** Hann var lesinn sem röng gerð (GitHub cadcraft#5). Lagað í CivilCraft ásamt CadCraft, BimCraft, ModelCraft og TakeoffCraft.
- **Skipt um tungumál meðan forritið keyrir.** CadCraft Studio og pakkaðar útgáfur geta skipt um tungumál meðan þær keyra. Áður var aðeins enska í boði. Ekki enn prófað á öllum stýrikerfum: láttu okkur vita ef tungumálið breytist ekki.

## Ekki komið í þessa útgáfu enn

- **Þetta eru reiknihjálpartæki.** Sérhver niðurstaða í nýju gluggunum þarfnast yfirferðar verkfræðings. Styrkur jarðvegs byggir á dæmigerðum gildum fyrir jarðvegsflokkinn, og glugginn segir það.
- **Láttu rigna.** Keyrsla á sýnishornssvæðinu getur tekið meira en tvær mínútur í vafranum með fínni frumu. Hún var prófuð á handdæmum og V-laga vatnasvæði, en ekki enn á raunverulegu mótuðu svæði.
- **Heimilisfang á lóð.** Hún les opnar gagnaskrár sem þú kemur með, og var aðeins prófuð á eigin skrám okkar. Tré eru ekki uppspretta. Að sækja uppsprettur fyrir þig bíður eftir persónuverndarorðalagi.
- **Framvinda eftir mælingum.** Aðeins prófuð á tilbúnum mælingum. Framvinda á blöðum og merkingum (MarkupCraft) og skönnun á móti líkani (BimCraft) eru ekki smíðuð.
- **Jarðvegur og hallar.** Aðeins hringlaga yfirborð: engin leit að kíl- eða blokkaflötum og engin togsprunga.
- **Gatnamót.** Einn radíus á hverja grein, engar beygjuferlar vörubíla, og þau fara ekki enn inn í vegarbeltið.
- **Vettvangsskrár.** Lesararnir voru skrifaðir eftir opinberum lýsingum á sniðum og prófaðir á skrám sem við bjuggum til. Raunverulegra skrár frá mælitækjum er óskað eftir.
- **Tengingar og járnbrautir.** Radíótengingar: aðeins tap í frjálsu rými og fjölbrautarbólga (ekkert regnfall eða loftnetsmynstur), og enginn járnbrautarstaðall: sérhvert járnbrautarmörk er bráðabirgðagildi, með drögum að tölum sem enginn járnbrautarverkfræðingur hefur yfirfarið.
- **Windows og macOS.** 0.8 er ekki kóðaundirritað. Windows getur varað við, og macOS biður um hægri smell og síðan Opna.

Allt annað er í [Ekki smíðað enn](topic:not-built-yet). Fyrir fyrri útgáfuna, sjá [Nýtt í 0.7](topic:whats-new-0-7).
