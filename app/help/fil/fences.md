---
title: Mga bakod
summary: Bakod sa kahabaan ng linya, alignment, parcel o pad: mga poste, riles, panel o pickets, gate, raked o stepped sa lupa, schedule, mga simbolo sa plano at IFC elements. Available din sa assistant.
keywords: bakod, poste, riles, panels, pickets, gate, raked, stepped, lupa, schedule, ifc, railing, hangganan
from: c0e7b84a
---

Gumawa ng bakod sa kahabaan ng feature line, alignment, parcel o pad, na ang mga poste at gate ay awtomatikong nakalagay para sa iyo.

## Gumawa ng bakod

1. Pumili ng linya, parcel o pad.
2. Buksan ang **Surface, More, Fences...**
3. Piliin ang style (panels, rails o pickets), raked o stepped, ang height, ang post spacing at ang gate width, saka **Fence along selection**, o **With a gate** para maglagay ng gate sa gitna ng pinakamahabang tuwid na bahagi.

Inilalagay ang mga poste sa mga dulo, sa bawat corner (vertex na lumiliko ng 20 degrees o higit pa), sa magkabilang gilid ng bawat gate, at sa pantay na bays sa pagitan, na walang lalampas sa spacing. Sumusunod ang **Raked** na panels sa lupa sa pagitan ng kanilang mga poste. Nananatiling pantay ang **Stepped** na panels at tumatalon sa mga poste; ang pinakamalawak na agwat sa ilalim ng panel ay nasa poste nitong pababa ang lupa, at nagbababala ang window kapag lumampas ang agwat sa limit, o kapag tumataas ang lupa sa loob ng panel. Ang mga gate na 6 feet (1.8 m) pataas ay may dalawang dahon; ipinapakita ng plano ang mga dahon na bukas kasama ang kanilang swing.

## Schedule at mga output

Ipinapakita ng bawat bakod ang haba nito, mga poste ayon sa uri, panels, gates at steps, kasama ang **CSV** schedule ng mga poste, panels, rails, pickets at gates. May fence layers ang plano (C-FENC, C-FENC-POST, C-FENC-GATE) para sa PDF, DXF at DWG. Ang IFC export ay naglalaman ng mga poste (IfcMember, post), panels (IfcRailing, user defined fence panel), rails (IfcMember) at gates (IfcDoor, gate), isang system bawat bakod.

## Mula sa assistant

Gumagawa ang `fence_build` ng bakod (points o pinangalanang linya, parcel o pad, gates ayon sa station), at inilalista ng `fence_list` ang mga bakod kasama ang kanilang schedule.

## Hindi pa ginagawa

Ang mga panimulang sukat ay karaniwang pagpipilian, hindi code. Ang mga uri mula sa Library ay dala lamang bilang pangalan. Dapat nasa iisang tuwid na bahagi ang mga gate. Wala pa ang tool na ito sa BimCraft.
