---
title: "Cimilada mustaqbalka: daadka, kulaylka iyo dab-baadiyaha 2050 iyo 2080"
summary: Cinwaanka ilaa goobta, kor u qaad heerka daadka goobta cimilada mustaqbalka, qiimee khatarta dab-baadiyaha, oo u beddel faylka cimilada, hadda iyo mustaqbalka oo is barbar ah, xirmada xogta cimilada (SSP2-4.5 iyo SSP5-8.5, 2050 iyo 2080).
keywords: cimilada, isbeddelka cimilada, mustaqbal, 2050, 2080, ssp, cmip6, sanad, heerka badda, daad, base flood elevation, bfe, fema, kulul, faylka cimilada, epw, morph, dab-baadiye, wildfire, bushfire
from: b0d2ee38
---

Xogta cimilada waxay ka timaadaa **xirmo xog** (data pack), ma aha barnaamijka. Shid add-on-ka {{ui:Climate futures}} ee Dejinta › Kordhin, ama soo rar faylka xirmada xogta aad leedahay block-ka {{ui:Climate future}}.

:::warning
Xirmada ku timid add-on-ka waa **tusaale**: saddex meelood (Denver, Miami, Johannesburg), hal moodel cimilo, shan sano ku jira 20 sano kasta. Waxaa loogu talagalay inaad isku daydo qalabka, **ma loo isticmaalo naqshadeyn**. Xirmo buuxda waxaa lagu dhisaa `tools/climate/build-pack.mjs` iyada oo laga soo qaadayo xogta NASA NEX-GDDP-CMIP6.
:::

## Meesha ay ku taal

Dusha › Dheeraad › Cinwaanka ilaa goobta. Dejji barta, ku dar lakabyada (lakabka daadka FEMA wuxuu siinayaa base flood elevation) oo riix badhanka akhrinta goobta. Hoosta safafka goobta waxaa ku yaal block-ka {{ui:Climate future}}: dooro **Scenario** (SSP2-4.5 ama SSP5-8.5) iyo **Year** (2050 = 2041-2060, 2080 = 2071-2090, labaduba waxay ka hadlayaan 1995-2014). Meesha xirmada ugu dhow barta ayaa la isticmaalaa, ama tii aad doorato; haddii ay ka fog tahay mid kasta, isbeddelka celceliska caalamiga ah ayaa la isticmaalaa, bannaanku wuu sheegaa.

## Heerka daadka naqshadeynta

Heerka hadda waa base flood elevation ee FEMA marka lakabka daadku uu leeyahay (feet, NAVD 88), haddii kale qor kaaga. Dooro nooca daadka (xeebta, webiga ama roobka xoogga leh, ama labaduba), qoto dheerka daadka goobta qaybta roobka, iyo freeboard haddii aad doonto. {{ui:Raise the flood level}} wuxuu muujinayaa heerka hadda iyo kan mustaqbalka oo is barbar ah, qaybaha heerka badda iyo roobka, iyo mala-awaalka: heerka badda oo dhan ayaa lagu daraa heerka xeebta; socodka webiga wuxuu u kordhaa hal-hal la mid ah roobka maalinta ugu qoyan badanaa, qoto dheerkuna wuxuu raacaa socodka oo wuxuu noqonayaa awoodda 0.6 (Manning, wadi ballaaran); qaybaha waa la isku daraa.

:::warning
Waa tirtir-baadhis isbeddelka, ma aha daraasad daad. Heerka naqshadeynta ee daadka waa kan hay'adda ama injineerkaaga.
:::

## Khatarta dab-baadiyaha (tirtir-baadhis oo keliya)

Dhirta ugu dhow, jiifka kor loo raaco iyo masaafadu waxay siinayaan qaab ka bilaabmaysa aad u yar ilaa aad u xun, hadda iyo mustaqbalka (mustaqbalka waxa uu ku dhufanayaa isbeddelka xisaabta dab-cimilo ee xirmada). **Tirtir-baadhis keliya:** cabbir nala lahaa si loo ogaado in goobtu u baahan tahay qiimeyn dab-baadiye oo sax ah; ma aha qiimo xeer.

## Kulaylka: faylka cimilada mustaqbalka

Dooro fayl `.epw` oo maanta ah, kadibna {{ui:Make the future weather file}}: waxaa lagu beddelaa habka wareejinta iyo fidinta la daabacay (Belcher, Hacker iyo Powell 2005), kulaylka waa la barbardhigaa (celceliska iyo heerkulka ugu kulul, heerkulka naqshadeynta, saacadaha ka sarreeya 30 °C iyo 35 °C, degree-days). {{ui:Save the future weather file}} wuxuu kaydiyaa faylka Environment panel-ka, hubinta tamarta BimCraft ama qalabkaaga.

## Meesha tirooyinka ka imanayaan

NASA NEX-GDDP-CMIP6 (wax soo saarka moodelka CMIP6 ee hoos loo dhigay, CC BY 4.0 moodel kasta) ee heerkulka, qoyaanka, qorraxda, roobka iyo cimilada dabka; celceliska caalamiga ah ee IPCC AR6 ee kor u kaca heerka badda, marka xirmadu aanay lahayn tirooyin maxalli ah. Bannaanku wuxuu muujinayaa ilaha xirmada, liisanskeeda iyo taariikhdeeda.
