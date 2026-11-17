---
title: မတည်ဆောက်ရသေးသော အရာများ
summary: ဤ CivilCraft build သည် ယခုအချိန်တွင် မလုပ်နိုင်သေးသည်များနှင့် ယနေ့ ၎င်းအစား ဘာလုပ်ရမည်ကို ဖော်ပြသည်။
keywords: ပျောက်နေခြင်း, ကန့်သတ်ချက်များ, roadmap, မရရှိနိုင်, spirals, widening, dwg, dxf, inlets, detention, cross sections, နောက်မှ လာမည်, limits
from: a2d970ef
---

CivilCraft သည် အစောပိုင်းဖြစ်သေးသည်။ ဤစာမျက်နှာသည် လက်ရှိ build မလုပ်နိုင်သည်များကို ဖော်ပြပြီး သင် ရှာမနေရအောင် ကူညီသည်။ ဤအရာများအတွက် ရက်စွဲ ကတိမပေးပါ။

## အမှတ်များ

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| အမှတ်ဖိုင်ဒုတိယခုကို ပထမဖိုင်သို့ ထည့်ခြင်း | ဖိုင်များကို စာသားတည်းဖြတ်ကိရိယာ သို့မဟုတ် spreadsheet ဖြင့် အရင် ပေါင်းပါ |
| အမှတ်စာသားဖိုင် ထုတ်ခြင်း | LandXML ထုတ်ပါ (အမှတ်များသည် CgPoint အဖြစ် ထွက်သည်)၊ GIS {{ui:Export}} ကို သုံးပါ (P၊ N၊ E၊ Z နှင့် D field ပါသော အမှတ်များ)၊ သို့မဟုတ် အမှတ်များကို spreadsheet သို့ {{ui:Copy}} လုပ်ပါ |
| အမှတ် label style များ၊ description key တစ်ခုစီအတွက် symbol များ၊ line code မှ curve (arc) များ၊ project များကြား မျှဝေရန် description key ဖိုင် | Label များသည် နံပါတ်၊ မြင့်မား‌မှုနှင့် description ကို ပြသည်၊ ဒါမှမဟုတ် ထိုထက်နည်းစွာ ([CivilCraft ဆက်တင်များ](topic:settings))၊ key များကို project ဖိုင်တွင် သိမ်းထားသည် |
| ယူနစ်ပြောင်းခြင်း | မတင်မီ ဖိုင်ကို ပြောင်းပါ; **Units** က label ကိုသာ ပြောင်းသည် |

## မြေပြင်

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| အမှတ်များမှ တည်ဆောက်ထားသော မျက်နှာပြင် တစ်ခုထက်ပို | မျက်နှာပြင်တစ်ခုစီအတွက် project တစ်ခု |
| (အတွင်းပိုင်း) နယ်နမိတ်များကို ဖုံးကွယ်ခြင်း | **Longest outside edge** သို့မဟုတ် အပြင်ဘက်နယ်နမိတ်ကို သုံးပါ |
| ဆွဲထားသော breakline တစ်ခုကို ရွေးခြင်း သို့မဟုတ် တည်းဖြတ်ခြင်း | {{key:Mod+Z}}၊ သို့မဟုတ် {{ui:Remove drawn breaklines}} ပြီး ပြန်ဆွဲပါ |
| LandXML မှ ဖတ်ထားသော မျက်နှာပြင်ကို တည်းဖြတ်ခြင်း (breakline၊ နယ်နမိတ်) | {{ui:Rebuild the surface from the points}} |
| elevation grid မှ ဖန်တီးထားသော မျက်နှာပြင်ကို တည်းဖြတ်ခြင်း | grid ကို အခြားရွေးချယ်မှုများဖြင့် ပြန်သွင်းပါ |
| coordinate system ပြောင်းသောအခါ LandXML မှ ဖတ်ထားသော မျက်နှာပြင်ကို ပြောင်းခြင်း | အရင် {{ui:Rebuild the surface from the points}} |
| အညွှန်းပါသော spot elevation နှင့် slope တန်ဖိုးများ | အခြေအနေဘားတွင် ဖတ်ပါ၊ သို့မဟုတ် Landscape လုပ်ငန်းနေရာရှိ **Slope analysis** ဖြင့် မျက်နှာပြင်ကို slope အလိုက် အရောင်ခြယ်ပါ ([Grading for landscape](topic:landscape-grading#grading-checks)) |

## အလိုင်းမန့်နှင့် ပရိုဖိုင်များ

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| clothoid မဟုတ်သော spiral များ; curve နှစ်ခုကြား spiral (compound transition) | curve အဆုံးရှိ clothoid spiral များ ရနိုင်သည်; အခြားများကို အမည်ပေးပြီး LandXML import တွင် ကျော်သည် |
| PI နှစ်ခုကြားတွင် PI ထည့်ခြင်း | အလိုင်းမန့်ကို ပြန်ဆွဲပါ၊ သို့မဟုတ် PI coordinate များကို ပြန်ရိုက်ပါ |
| ပစ္စည်းများမှ၊ offset များမှ၊ widening များမှ အလိုင်းမန့် | PI များဖြင့် ဆွဲပါ |
| အတိုင်းအတာ vertical curve အတွက် K ရိုက်ခြင်း | L ရိုက်ပါ (K ကို ပြသည်) |
| စက်ဝိုင်းနှင့် မညီသော vertical curve များ | symmetric parabolic curve များသာ |
| အလိုင်းမန့်တစ်ခုလျှင် design profile တစ်ခုထက်ပို | variant တစ်ခုလျှင် အလိုင်းမန့်တစ်ခု |
| ပရိုဖိုင်ကြည့်ခြင်းကို zoom လုပ်ခြင်း၊ ပရိုဖိုင်အောက်ရှိ profile band များ | ပရိုဖိုင် view သည် အလိုင်းမန့်တစ်ခုလုံးကို ကိုက်ညီစေသည်; [plan and profile sheet](topic:plan-profile-sheets) များအဖြစ် ပုံထုတ်ပါ |
| DWG သို့မဟုတ် LandXML ရှိ section များ | PDF အဖြစ် section sheet များ; ဧရိယာနှင့် ပမာဏ၏ {{ui:CSV}} |
| angle ဖြင့် sample line များ၊ သို့မဟုတ် လမ်းတလျှောက် အကျယ်မတူသော sample line များ | အလိုင်းမန့်တစ်ခုလုံးအတွက် ဘက်တစ်ဖက်စီ အကျယ်တစ်ခုစီ |

## Corridor များ

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| median၊ barrier နှင့် template များကို လှည့်သော superelevation | template များအဖြစ် ဆွဲပါ ([Corridor templates](topic:corridor-templates)); station အလိုက် template များက superelevation ကို မယူသေးပါ |
| ဒေသနှစ်ခု၏ template များကြား တဖြည်းဖြည်း ပြောင်းလဲခြင်း (transition၊ taper) | station တွင် template ကို ပြောင်းပါ၊ သို့မဟုတ် taper အဖြစ် ဆွဲထားသော feature line သို့ အမှတ်တစ်ခုကို width target ပေးပါ |
| edge ပတ်ပတ်လည် လှည့်ခြင်း၊ LandXML တွင် superelevation | Circular curve များတွင် superelevation က centerline ပတ်ပတ်လည် လှည့်သည်; feature line သို့ width target ဖြင့် လမ်းကြောင်းကို ကျယ်ပါ |
| side slope အတွက် target များ (line သို့ သို့မဟုတ် မျက်နှာပြင်သို့ daylight)၊ ကိုယ်ပိုင် corridor မျက်နှာပြင်များ | Target များက pavement နှင့် shoulder ဘောင်များကို ရွှေ့သည် ([Corridors](topic:corridor)); corridor ကို အဆိုပြုမျက်နှာပြင်ထဲသို့ grade လုပ်သည် |
| corridor များကို LandXML roadway အဖြစ် ထုတ်ခြင်း၊ IFC export တွင် အလိုင်းမန့်တစ်ခုပေါ် corridor ဒုတိယခု | အဆိုပြုမျက်နှာပြင်ကို ထုတ်သည် |
| အဆိုပြုမျက်နှာပြင်ကို ပြောင်းသော terrain template များ၊ 3D တွင် သို့မဟုတ် section များတွင် | ၎င်းတို့က layer တစ်ခုစီ၏ ဧရိယာနှင့် ပမာဏ ပေးသည် ([Terrain templates](topic:corridor-templates#terrain-templates)) |
| speed၊ tyre slip၊ steering time၊ steering trailer သို့မဟုတ် body clearance ပါသော swept path များ; စံ design vehicle စာကြည့်တိုက်; ယာဉ်ကို ဆွဲ၍ swept path ဆွဲခြင်း | feature line သို့မဟုတ် အလိုင်းမန့်တစ်လျှောက် အမြန်နှုန်းနိမ့် swept path များ၊ သင့်ကိုယ်ပိုင် ယာဉ်အရွယ်အစားများဖြင့် ([Vehicle swept paths](topic:swept-paths)) |

## Grading နှင့် ပမာဏများ

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| Bench များ၊ ဒီဇိုင်းထဲ grade လုပ်ထားသော ဖွင့်ထားသည့် feature line များ၊ အခြားနေရာမှ feature line သို့ grade လုပ်ခြင်း | feature line ကို ပိတ်ပါ ([Feature lines](topic:feature-lines))၊ သို့မဟုတ် ရှိပြီးသား မြေပြင်၏ breakline အဖြစ် သုံးပါ |
| feature line vertex ထည့်ခြင်း သို့မဟုတ် ဖယ်ရှားခြင်း | လိုင်းကို ပြန်ဆွဲပါ၊ သို့မဟုတ် ၎င်း၏ stepped offset ကို ဖန်တီးပါ |
| ဆွဲထားသော breakline များတွင် arc များ (စစ်တမ်းအမှတ်များမှတဆင့်)၊ feature line များတွင် spiral များ | arc ပါသော feature line ဆွဲပြီး ရှိပြီးသား မြေပြင်၏ breakline အဖြစ် သုံးပါ |
| အကွာအဝေး၊ elevation သို့မဟုတ် အခြား မျက်နှာပြင်သို့ grade လုပ်ခြင်း | ရှိပြီးသား မြေပြင်သို့သာ daylight |
| pad ထောင့် ထည့်ခြင်း သို့မဟုတ် ဖယ်ရှားခြင်း | pad ကို ဖျက်ပြီး ပြန်ဆွဲပါ |
| TIN-to-TIN (prism) ပမာဏများ၊ grid cell အရွယ်အစား ရွေးခြင်း | Grid နည်းလမ်း၊ cell အရွယ်အစားကို သင့်အတွက် ရွေးထားသည် |
| Swell နှင့် shrink၊ topsoil၊ pavement အထူ | Factor များကို ဖော်ပြထားသော ဂဏန်းများတွင် ကိုယ်တိုင် အသုံးချပါ |
| Free-haul နှင့် overhaul ကုန်ကျစရိတ်၊ မတူညီသော အလိုင်းမန့်များကြား သယ်ယူခြင်း၊ ပလန်ပေါ်တွင် ချထားသော borrow pit နှင့် waste site | balance point များ၊ ရွှေ့ထားသော ပမာဏများနှင့် ပျမ်းမျှ သယ်ယူအကွာအဝေးပါသော mass-haul diagram |

## Pipe network များ

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| project တစ်ခုတွင် network တစ်ခုထက်ပို | storm နှင့် sanitary အတွက် project သီးခြား |
| ရေပိုက်အဓိက: ရေအရည်အသွေးနှင့် အသက်အရွယ်၊ rule အခြေခံ ထိန်းချုပ်မှု၊ အခြား valve အမျိုးအစား (flow control၊ throttle၊ sustaining)၊ ပန့်ကို power ဖြင့်ပေးခြင်း၊ ဖိအားပေါ် မူတည်သော demand၊ Darcy–Weisbach ရွေးချယ်မှု၊ နံရံအထူနှင့် ဖိအားအတန်းပါသော pipe catalog။ ဖိအား network ၏ ကျန်အပိုင်းသည် lab တွင်ရှိသည်: [Water mains](topic:water-mains) | ထိုအရာများကို water distribution software တွင် စစ်ပါ; sanitary design flow များသည် [Sanitary design flows](topic:sanitary-design) တွင် ရှိသည် |
| အချိန်နှင့်အမျှ ညစ်ရေစီးဆင်းမှု (hydrograph၊ dynamic routing၊ storage၊ ပန့်၊ overflow) | [Sanitary design flows](topic:sanitary-design) က design sheet သုံးသော steady peak flow ကို ပေးသည် |
| Inlet capacity၊ gutter spread၊ detention routing၊ hydrograph၊ junction coefficient တစ်ခုထက်ပိုသော energy loss | အခြား software တွင် စစ်ပါ; flow၊ အရွယ်အစားနှင့် grade line များသည် [Storm drainage](topic:storm-drainage) တွင် ရှိသည် |
| PDF plot၊ DWG၊ DXF သို့မဟုတ် LandXML ထဲ catchment များ; မျက်နှာပြင်မှ catchment များ (watershed) | catchment များကို လက်ဖြင့် ဆွဲပါ; project ဖိုင်တွင် သိမ်းထားသည် |
| Pipe catalog များ၊ စက်ဝိုင်းမဟုတ်သော pipe များ၊ upright box သို့မဟုတ် cylinder မဟုတ်သော ဖွဲ့စည်းပုံများ (cone၊ step၊ benching)၊ library ရှိ drainage category | parameter မှ structure type များ ([Pipe network](topic:pipe-network)); diameter ပါသော pipe များ |
| profile view ရှိ pipe များ၊ မွေ့ကွေးသော pipe များ | ညာဘက် panel တွင် inverts နှင့် cover ကို ဖတ်ပါ |

## မြေကွက်များ

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| ဧရိယာ သို့မဟုတ် ရှေ့မျက်နှာစာဖြင့် မြေကွက်ခွဲခြင်း၊ ပတ်ပတ်လည်မျဉ်းများမှ မြေကွက်များ၊ right-of-way | မြေကွက်တစ်ခုစီကို ထောင့်များဖြင့် ဆွဲပါ၊ သို့မဟုတ် ၎င်း၏ calls ကို ရိုက်ထည့်ပါ |
| ပလန်ပေါ်ရှိ curve table နှင့် line table; လက်ဖြင့် ရွှေ့ထားသော label များ | အပိုင်းတိုင်းကို ၎င်းနှင့်အတူ label လုပ်ထားသည် |
| LandXML ထဲ မြေကွက်များ | မြေကွက်များကို project ဖိုင်တွင် သိမ်းပြီး PDF၊ DWG နှင့် DXF သို့ သွားသည် |

## Traverse များ

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| least-squares adjustment၊ transit rule၊ ထောင့်များကို အကွာအဝေးနှင့် အလေးချိန်ပေးခြင်း | compass rule |
| deflection angle၊ zenith angle နှင့် slope distance၊ trigonometric leveling ဖြင့် elevation | မှန်ကန်စွာ horizontal အကွာအဝေးနှင့် ထောင့်များ သို့မဟုတ် bearing အဖြစ် ပြန်လျှော့ပါ |
| Side shot များ၊ data collector မှ raw data ဖိုင်များ | အမှတ်များကို point file အဖြစ် သွင်းပါ |

## Staking

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| Offset stake (stake မှ နောက်သို့ ချိန်သတ်ထားသော reference အမှတ်များ)၊ catch point မှ slope stake | လိုအပ်သော offset များတွင် stake ထိုးပါ၊ shoulder ကျော်ပါ အပါအဝင် |
| Data collector ၏ ကိုယ်ပိုင် format သို့ stake တိုက်ရိုက်ပို့ခြင်း | CSV ကို data collector အများစု၏ office software တွင် ဖွင့်နိုင်သည် |
| Pipe၊ pad နှင့် parcel များကို stake လုပ်ခြင်း | အလိုင်းမန့်အနီးရှိ survey အမှတ်များ၊ သို့မဟုတ် parcel ၏ course များကို သုံးပါ |

## ဖိုင်များနှင့် output

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| DWG သို့မဟုတ် DXF မှ စာသား၊ hatch နှင့် dimension; paper space; ချိတ်ဆက်ထားသော ပုံဆွဲများ (xref); binary DXF | model space မှ linework ဖွင့်နိုင်သည် ([Open a DWG or DXF as linework](topic:open-dwg-dxf)); ချိတ်ဆက်ထားသော ပုံဆွဲများကို သီးခြား ဖွင့်ပါ |
| အမှတ်များစွာကို ဆွဲ၍ တစ်ပြိုင်နက် ရွှေ့ခြင်း | ဖြတ်၍ ကူးထည့်ပါ၊ သို့မဟုတ် တစ်ခုချင်းစီ တည်းဖြတ်ပါ |
| Portrait sheet များ၊ ကိုယ်ပိုင် title block များ၊ သင် စီစဉ်သော viewport များ၊ DWG တွင် plan နှင့် profile sheet များ | PDF တစ်ခုလျှင် landscape plan sheet တစ်ခု၊ သို့မဟုတ် အလိုင်းမန့်တလျှောက် plan နှင့် profile sheet များ (PDF) |
| မြင့်မား‌မှု band များနှင့် profile များကို ပုံထုတ်ခြင်း | Band များသည် screen ပေါ်တွင်သာ ရှိသည်; လိုအပ်ပါက screenshot ယူပါ |
| Layer အမည်များ၊ အရောင်များ သို့မဟုတ် label style များကို ပြောင်းခြင်း | DXF ထုတ်ပြီးနောက် CAD program တွင် ပြောင်းပါ |
| Cloud သိမ်းခြင်းနှင့် version history | `.civilcraft.json` ဖိုင်များကို သိမ်းပြီး backup လုပ်ပါ; project တစ်ခုကို အတူလုပ်ရန် CadCraft Studio တွင် live session ကို သုံးပါ ([Design one site together, live](topic:work-live)) |
| iPad နှင့် iPhone အတွက် CadCraft Studio၊ Google Play မှ | စက်ပေါ်ရှိ browser တွင် CivilCraft ကို သုံးပါ; Android တွင် CadCraft Studio ကို getcadcraft.com/download မှ APK ဖြင့် ထည့်ပါ |
| ဖိုင်များစွာကို တစ်ပြိုင်နက် ဖွင့်ခြင်း (point သို့မဟုတ် project) | ဖိုင်တစ်ခုချင်းစီ ဖွင့်ပါ (အတူတူ ပါသော GIS ဖိုင်များ၊ ဥပမာ shapefile ၏ အစိတ်အပိုင်းများ၊ အတူ ဖွင့်သည်) |

## Landscape

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| ထုတ်လုပ်သူများ၏ head နှင့် nozzle များ | Generic head များ၊ သို့မဟုတ် ဖိုင်မှ ကိုယ်ပိုင် head များ ထည့်ပါ; ထုတ်လုပ်သူ ဒေတာကို ခွင့်ပြုချက်ပေးသည့်အတိုင်း ထည့်သည် |
| drip line များအတွက် အမြင့်ဆုံး lateral အရှည်၊ အချိန်အလိုက် flow၊ ပန့်၊ loop pipe network | Drip run များကို ထုတ်လုပ်သူ ထုတ်ပြန်သော အရှည်တွင် ထားပါ; စစ်ဆေးမှုက branch network လိုအပ်သည် |
| concave freeform object ၏ တိကျသော outline; မြေအောက်ပမာဏ တိကျစွာ တိုင်းခြင်း | convex hull ကို grade လုပ်ပြီး မြေအောက်ပမာဏသည် ခန့်မှန်းချက်ဖြစ်သည် (Properties တွင် ပြောသည်) |
| BimCraft နှင့် ModelCraft ၏ ကိုယ်ပိုင် Place from library ရှိ အပင်များ | landscape IFC ထုတ်ပြီး BimCraft တွင် အဆောက်အအုံဘေးတွင် ဖွင့်ပါ |
| အသေးစိတ် အပင်မော်ဒယ်များ (အရွက်၊ ခက်ရင်း၊ ရာသီ) 3D view တွင်; freeform object နှင့် ရေပေးစနစ် 3D view တွင် | အပင်များကို အပင်စာရင်းမှ အရွယ်အစားတွင် ရိုးရှင်းသော ပုံသဏ္ဍာန်များအဖြစ် 3D တွင် ပြသည် ([View the site in 3D](topic:site-3d)); ModelCraft ၏ scatter က အပင်ပုံများ ဖန်တီးသည် |
| မျက်နှာပြင်ပေါ် grade လုပ်ထားသော အဆင့်ကို နောက်ကွယ်မှ ထိန်းထားသော hardscape နံရံများ | platform သို့မဟုတ် pad တွင် ဒေါင်လိုက်အနား ပေးပါ: ၎င်းတို့သည် မျက်နှာပြင်ပေါ် retaining wall များ ဖြစ်သည် ([Grading](topic:grading)) |
| ကိုယ်ပိုင် SVG symbol များတွင် transform၊ ကိုယ်ပိုင် GLB အပင်မော်ဒယ်များ၏ texture နှင့် အရောင်၊ compressed GLB geometry | ပုံဆွဲ program တွင် transform များကို အရင် flatten လုပ်ပါ; မော်ဒယ်များကို အပင်၏ အရောင်ဖြင့် ဆွဲသည်; GLB ကို compression မပါဘဲ ထုတ်ပါ ([Plant graphics](topic:plant-graphics)) |
| သင့် Library အကောင့်တွင် ထိန်းထားသော ကိုယ်ပိုင်အပင်စာရင်း (app တွင် တည်းဖြတ်ခြင်း) | project ၏ ကိုယ်ပိုင်စာရင်းကို Plant table တွင် တည်းဖြတ်ပြီး plants ဖိုင်အဖြစ် သိမ်းပါ |
| window မရှိသော AI assistant များအတွက် landscape tool များ (file server နှင့် command line) | CivilCraft window ဖွင့်ထားစဉ် အလုပ်လုပ်သည် ([Let an AI assistant work with your site](topic:assistants)) |

## လျှပ်စစ်လိုင်းများ

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| နိုင်ငံ၏ စံချိန်စံညွှန်း built in (load case၊ clearance၊ factor) | {{ui:Load cases and limits…}} တွင် သင့်စံ၏ တန်ဖိုးများကို သတ်မှတ်ပြီး သိမ်းပါ၊ သင့် library နှင့်အတူ pack အဖြစ် ပြန်သုံးရန်နှင့် မျှဝေရန် ([Packs](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| ဓာတ်ကြိုးမှ သစ်ပင်ခေါင်း သို့မဟုတ် လိုင်းဘေးရှိ နံရံသို့ ဘေးဘက် အကွာအဝေး | လိုင်းဖြတ်သော အပင်နှင့် နံရံများ အပေါ်ရှိ ဒေါင်လိုက် clearance ([Power-line checks](topic:power-line-checks#clearances)) |
| Conductor creep နှင့် ဝါယာကြိုးအသစ်၏ ဆန့်ခြင်း | stringing table ရှိ အပူချိန်များမှတဆင့် ထည့်သွင်းစဉ်းစားပါ |
| မြေအောက်ကေဘယ်များ၏ အပူ rating (ချထားပုံမှ current rating) | ကေဘယ် item တွင် supplier ၏ current rating ကို ရိုက်ထည့်ပါ |
| Short-circuit၊ protection နှင့် earthing လေ့လာမှုများ | သီးသန့် electrical program ကို သုံးပါ; CivilCraft က network ၏ အရှည်နှင့် ကေဘယ်များကို ပေးသည် |
| Member အလိုက် ဒီဇိုင်းထုတ်သော lattice tower များနှင့် မြေထဲရှိ stay anchor များ | Support များကို nominal load ဖြင့်၊ stay များကို rated load ဖြင့် စစ်သည် |
| `.DON` လေ့လာမှုဖိုင်ကို ဖတ်သော program တွင် စစ်ခြင်း | ထို program တွင် ဖိုင်ကို စစ်ပါ; စမ်းသပ်ရန် နမူနာတစ်ခု ပို့ပါ |
| 3D view နှင့် IFC ရှိ လျှပ်စစ်လိုင်းများ | ပလန်၊ လိုင်းပရိုဖိုင်၊ sheet များနှင့် GIS layer များ |
| window မရှိသော AI assistant များအတွက် လျှပ်စစ်လိုင်း tool များ | CivilCraft window ဖွင့်ထားစဉ် အလုပ်လုပ်သည် ([Let an AI assistant work with your site](topic:assistants)) |

## အဆောက်အအုံ ထုထည်များ

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| နိုင်ငံ သို့မဟုတ် မြို့တစ်မြို့၏ zoning code နှင့် စည်းမျဉ်းများ စာကြည့်တိုက် | သင့်ကိုယ်ပိုင် ဥပဒေမှ ကန့်သတ်ချက်များကို ရိုက်ထည့်ပါ ([Zoning limits](topic:zoning-limits)) |
| နံရံများပေါ် ကောင်းကင်အလင်း (facade daylight)၊ လေ | [Sun hours](topic:sun-hours) က တိုက်ရိုက်နေရောင်ကိုသာ ရေတွက်သည် |
| သစ်ပင်၊ အပင် သို့မဟုတ် mass အဖြစ် မဆွဲထားသော အရာများရဲ့ အရိပ် | ပတ်ဝန်းကျင်အဆောက်အအုံများကို mass အဖြစ် ဆွဲပါ |
| Mass ပေါ်ရှိ ခေါင်မိုးပုံသဏ္ဍာန်များ | ထိပ်ပြား mass များ |
| BimCraft တွင် mass ဖွံ့ဖြိုးစဉ် ပွင့်ပေါက်များ၊ ခေါင်မိုးနှင့် နံရံအမျိုးအစား | BimCraft က အထပ်တိုင်းနှင့် ကြမ်းပြင်တွင် ရိုးရိုး ပြင်ပနံရံများ ဆောက်သည်; ကျန်များကို ထိုနေရာတွင် ထည့်ပါ |

## GIS နှင့် coordinate system များ

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| File Geodatabase; KML style၊ icon၊ ground overlay နှင့် network link များ | အရင် GeoPackage၊ shapefile သို့မဟုတ် GeoJSON သို့ ပြောင်းပါ; KML placemark များကို style မပါဘဲ ဖတ်သည် |
| GIS feature များ သို့မဟုတ် ၎င်းတို့၏ attribute များကို တည်းဖြတ်ခြင်း | GIS program တွင် တည်းဖြတ်ပြီး ပြန်သွင်းပါ။ Analyze panel က layer အသစ် (buffer၊ overlay၊ join၊ selection) ဖန်တီးပြီး ဧရိယာနှင့် အလျား field များ ထည့်သည်၊ သို့သော် feature ကို နေရာတွင် မတည်းဖြတ်ပါ |
| Network နှင့် raster analysis၊ ဘက်တစ်ဖက် buffer နှင့် flat သို့မဟုတ် square အဆုံးပါသော buffer များ၊ attribute table တွင် row ထည့်/ဖျက်ခြင်းနှင့် field type ပြောင်းခြင်း၊ ကိုယ်ပိုင် class အရောင်များ၊ plot တွင် style legend | Select ဖြင့် feature ရွေးပြီး ၎င်းမှ layer ဖန်တီးပါ; flat အဆုံးကို မပေးပါ။ attribute ဖြင့် အရောင်ခြယ်ခြင်းနှင့် attribute table တို့ ရှိပြီးသား: [Style a layer by an attribute](topic:gis-symbology) နှင့် [Work with a layer's attribute table](topic:gis-table) ကို ကြည့်ပါ |
| Label style (အရွယ်အစား၊ နေရာချထားခြင်း) နှင့် တစ်ခုနှင့်တစ်ခု မထပ်အောင် label များ | Label များသည် အရွယ်အစားတစ်မျိုးဖြစ်ပြီး feature များ ထူထပ်သောနေရာတွင် ထပ်နိုင်သည် |
| Vertical datum နှင့် geoid model များ | Elevation များကို ဖိုင်က ပေးသည့်အတိုင်း သုံးသည်; vertical datum ကို ကိုယ်တိုင် စစ်ပါ |
| NAD27 မှ NAD83 အပြင် ဧရိယာအလိုက် အကြံပြုထားသော grid shift များ (OSTN15၊ အခြား datum များအတွက် NTv2 သည် ဖိုင်ထည့်သောအခါ အလုပ်လုပ်သည်)၊ grid များစွာ တစ်ပြိုင်နက်၊ vertical grid များ | သင့် datum အတွက် grid ဖိုင်ကို ကိုယ်တိုင် ထည့်ပါ; project တစ်ခုလျှင် grid တစ်ခု |
| DXF သို့မဟုတ် 3D export ရှိ map layer များ | Map layer များကို PDF plot သို့ ထည့်ပြီး DWG ဘေးတွင် ပုံအဖြစ် ထည့်သည် |
| sign-in၊ key သို့မဟုတ် token လိုအပ်သော map server များ | Public service များ၊ သို့မဟုတ် georeference ပါသော ပုံဖိုင်ကို သုံးပါ |
| မျက်နှာပြင်၊ ground model သို့မဟုတ် elevation-grid နှင့် LiDAR tool များမှ LAS သို့မဟုတ် LAZ ဖိုင် ရေးခြင်း | မျက်နှာပြင်များကို GeoTIFF elevation grid အဖြစ် ထုတ်ပါ။ [Point clouds](topic:point-clouds) add-on က သန့်စင်ထားသော cloud ကို LAS 1.4 သို့မဟုတ် LAZ အဖြစ် ရေးသည် |
| LiDAR intensity၊ အရောင်နှင့် return များ; band များစွာပါသော elevation grid များ; 200 MB ထက်ကြီးသော grid သို့မဟုတ် LiDAR ဖိုင်များ | LiDAR ကို class အလိုက်သာ စစ်ထုတ်သည်၊ grid များက ပထမ band ကို သုံးသည်; ကြီးသော ဖိုင်များကို အရင် tile များအဖြစ် ဖြတ်ပါ |

## Input

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| touch ဖြင့် box selection ({{key:Shift}} လိုအပ်သည်) | စစ်တမ်းအမှတ်တစ်ခုစီကို ကြာကြာနှိပ်ပြီး ထည့်ပါ |
| ဆွဲနေစဉ် ရိုက်ထည့်သော coordinate သို့မဟုတ် အကွာအဝေးများ | ခန့်မှန်းပြီး ဆွဲပါ၊ ထို့နောက် အလိုင်းမန့်၏ PI table တွင် တိကျသော PI coordinate များ ရိုက်ပါ |
| pad ထောင့်နှင့် ဖွဲ့စည်းပုံများအတွက် coordinate ရိုက်ခြင်း | ၎င်းတို့၏ grip များကို ဆွဲပါ; တိကျမှုအတွက် zoom ဝင်ပြီး အခြေအနေဘားရှိ E နှင့် N ကို ကြည့်ပါ |
| ပစ္စည်းများ (breakline အတွက် စစ်တမ်းအမှတ်မှလွဲ၍) တွင် snap လုပ်ခြင်း | zoom ဝင်ပြီး အခြေအနေဘားကို ကြည့်ပါ |

## 3D view

| မတည်ဆောက်ရသေးသော | ယနေ့ အစားထိုး |
|---|---|
| 3D view တွင် ဆွဲခြင်း သို့မဟုတ် တည်းဖြတ်ခြင်း | ပလန်တွင် ဆွဲပြီး တည်းဖြတ်ပါ; 3D view က တည်းဖြတ်မှုတိုင်းကို လိုက်ပါသည် |
| 3D တွင် နှိပ်ပြီး corridor feature line သို့မဟုတ် GIS feature များကို ရွေးခြင်း | ပလန်တွင် နှိပ်ပါ |
| ကြီးထားသော view သို့မဟုတ် ပေနှင့် ထုတ်ခြင်း | Export များသည် မီတာဖြင့် အတိုင်းအတာမှန် ဖြစ်သည်; [Export the site in 3D](topic:export-3d) ကို ကြည့်ပါ |
| GLB သို့မဟုတ် OBJ export များရှိ label များ၊ 3D တွင် label အရွယ်အစားနှင့် style | Label များသည် 3D view တွင်သာ ပြသည်၊ အရွယ်အစားတစ်မျိုး; [View the site in 3D](topic:site-3d) ကို ကြည့်ပါ |
| ဓာတ်ပုံများမှ texture၊ drive ကို video အဖြစ် မှတ်ခြင်း၊ site ပြင်ပမှ အရိပ်၊ 3D view တွင် နေရောင်နာရီများ | Map layer များကို မျက်နှာပြင်ပေါ် ချထားသည်; drive နှင့် နေ၏ အနေအထားကို တစ်ချိန်တည်း; [sun hours](topic:sun-hours) ကို နေ့ သို့မဟုတ် ရာသီအလိုက် ပလန်တွင် ကြည့်ပါ |
