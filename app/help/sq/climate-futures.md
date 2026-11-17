---
title: "Klima e ardhme: përmbytje, nxehtësi dhe zjarr pyjesh 2050 dhe 2080"
summary: Te Adresa te vendi, ngri nivelin e përmbytjes së vendit për një klimë të ardhme, vlerëso ekspozimin ndaj zjarrit pyjor dhe transformo një skedar moti, paraqit krah për krah të ardhmen, nga një paketë të dhënash klimatike (SSP2-4.5 dhe SSP5-8.5, 2050 dhe 2080).
keywords: klimë, ndryshim klimatik, e ardhme, 2050, 2080, ssp, cmip6, skenar, nivel deti, përmbytje, kota bazë e përmbytjes, bfe, fema, nxehtësi, skedar moti, epw, morph, zjarr pyjesh, zjarr shkurreje
from: b0d2ee38
---

Shifrat klimatike vijnë nga një **paketë të dhënash**, jo nga aplikacioni. Ndiz shtojcën {{ui:Klimat e ardhme}} te Cilësimet › Shtojca, ose ngarko një skedar paketë të vetin te blloku {{ui:Klima e ardhme}}.

:::warning
Paketa që vjen me shtojcën është një **mostër**: tre vende (Denver, Miami, Johannesburg), një model klime, pesë vjet në çdo periudhë 20-vjeçare. Është aty për të provuar veglat, **jo për projektim**. Një paketë e plotë ndërtohet me `tools/climate/build-pack.mjs` nga të dhënat NEX-GDDP-CMIP6 të NASA.
:::

## Ku është

Sipërfaqe › Më › Adresa te vendi. Vendos pikën, shto shtresat (një shtresë përmbytjeje FEMA jep kotën bazë të përmbytjes) dhe shtyp butonin që lexon vendin. Nën rreshtat e vendit është blloku {{ui:Klima e ardhme}}: zgjidh një **Skenari** (SSP2-4.5 ose SSP5-8.5) dhe një **Vitin** (2050 = 2041-2060, 2080 = 2071-2090, të dyja krahasuar me 1995-2014). Përdoret vendi i paketës më të afërt me pikën, ose ai që zgjedh ti; larg çdo vendi, përdoren ndryshimet mesatare globale dhe paneli e thotë këtë.

## Kota e projektimit të përmbytjes

Kota aktuale është kota bazë e përmbytjes e FEMA kur shtresa e përmbytjes e kishte një (në këmbë, NAVD 88), përndryshe shkruaj tënden. Zgjidh llojin e përmbytjes (bregdetare, lumore ose shi i fortë, ose të dyja), thellësinë e përmbytjes në vend për pjesën e shiut, dhe një bord të lirë nëse dëshiron. {{ui:Ngri nivelin e përmbytjes}} shfaq krah për krah nivelin aktual dhe të ardhshëm, pjesët e nivelit të detit dhe të shiut, dhe supozimet: i gjithë rritja e nivelit të detit shtohet te një nivel bregdetar; rrjedha e lumit rritet një me një me shiun e ditës më të lagësht, dhe thellësia ndjek rrjedhën në fuqinë 0.6 (Manning, kanal i gjerë); pjesët mblidhen.

:::warning
Një pasqyrim i ndryshimit, jo një studim përmbytjeje. Kota e projektimit të përmbytjes është e autoritetit ose e inxhinierit tënd.
:::

## Ekspozimi ndaj zjarrit pyjor (vetëm pasqyrim)

Bimësia më e afërt, pjerrësia lart nga ajo dhe distanca japin një brez nga shumë i ulët deri në ekstrem, të tanishëm dhe të ardhshëm (e ardhmja shumëzohet me ndryshimin e paketës në indeksin e motit të zjarrit). **Vetëm pasqyrim:** shkalla jonë relative për të thënë nëse një vend ka nevojë për një vlerësim të duhur të rrezikut nga zjarri; jo një vlerësim kodi.

## Nxehtësia: një skedar moti i ardhshëm

Zgjidh një skedar `.epw` të sotëm dhe {{ui:Bëj skedarin e motit të ardhshëm}}: transformohet me metodën e publikuar të zhvendosjes dhe shtrirjes (Belcher, Hacker dhe Powell 2005), dhe nxehtësia krahasohet (temperatura mesatare dhe më e nxehta, temperaturat projektuese, orët mbi 30 °C dhe 35 °C, shkallë-ditë). {{ui:Ruaj skedarin e motit të ardhshëm}} e ruan për panelin e Mjedisit, për kontrollin e energjisë të BimCraft ose për veglat e tua.

## Nga vijnë shifrat

NASA NEX-GDDP-CMIP6 (dalje e modeleve CMIP6 e zvogëluar në shkallë, CC BY 4.0 për model) për temperaturën, lagështinë, diellin, shiun dhe motin e zjarrit; mesatarja globale e IPCC AR6 për rritjen e nivelit të detit, përveç kur paketa mban shifra vendore. Paneli tregon burimin, licencën dhe datën e paketës.
