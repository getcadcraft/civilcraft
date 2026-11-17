---
title: အခြား civil software မှ ပြောင်းလာခြင်း
summary: ရင်းနှီးသော civil ဒီဇိုင်းလုပ်ငန်းစဉ်များသည် CivilCraft သို့ ဘယ်လို ကိုက်ညီသလဲ၊ ပထမနာရီအတွင်း အတွေ့အကြုံရှိသူများကို ထိခိုက်စေသော ကွာခြားချက်များ။
keywords: switching, migrate, familiar, differences, workflow, commands, mapping, cogo, corridor, grading, pipe network, styles, command line
from: feae37d6
---

Civil 3D ကို သုံးဖူးလျှင် CivilCraft ရှိ အယူအဆများကို သင်သိပြီးဖြစ်သည်: point များနှင့် point group များ၊ breakline နှင့် boundary ပါသော TIN surface များ၊ PI ဖြင့် alignment များ၊ PVI ဖြင့် profile များ၊ corridor အဖြစ် ဆွဲထားသော assembly များ၊ grading to daylight၊ gravity pipe network များ၊ LandXML။ ကွာခြားချက်မှာ ၎င်းတို့ပတ်လည် အားလုံးဖြစ်သည်: drawing ဖိုင် မရှိပါ၊ command line မရှိပါ (မည်သည့် {{ui:Drafting classic}} menu style ကို မရွေးလျှင်)၊ style များ မရှိ၊ Prospector မရှိ၊ settings dialog များ မရှိပါ။ CivilCraft သည် browser ထဲရှိ သေးငယ်ပြီး အာရုံစိုက်သော ကိရိယာတစ်ခုဖြစ်ပြီး ဤဗားရှင်းတွင် civil package အပြည့်ၾကီး လုပ်သည့်အရာ၏ အစိတ်အပိုင်းသာ လုပ်သည်။ ဤစာမျက်နှာသည် သင်သိသည်များကို ဤတွင် ဘာရှိသလဲ ဆက်စပ်ပေးသည်။

:::tip
Civil 3D ၏ ribbon ကို နှစ်သက်လျှင် **Settings** › **CivilCraft** › **Menus, keys and mouse** တွင် {{ui:Civil ribbon}} menu style ကို ရွေးပါ: Home၊ Surfaces၊ Modify၊ Geolocation၊ View နှင့် Output tab များ၊ အလယ်ခလုတ်က pan လုပ်ပြီး {{key:Shift}} နှင့် အလယ်ခလုတ်က 3D view ကို orbit လုပ်သည်။ Command ရိုက်ထည့်လျှင် {{ui:Drafting classic}} က command line (ALIGNMENT, PAD, PROFILE, ZOOM …) ကို ထည့်သည်။ [Menus, keys and mouse](topic:menus-keys-and-mouse) ကို ကြည့်ပါ။
:::

## လုပ်ငန်းစဉ် မြေပုံ

| သင်လုပ်ချင်သည် | ရင်းနှီးသော နည်းလမ်း | CivilCraft တွင် |
|---|---|---|
| Survey point များ သွင်းခြင်း | Point file format ဖြင့် point သွင်းခြင်း | {{ui:Open}}၊ ထို့နောက် **Import points** တွင် column အစီအစဉ်ကို စစ်ပါ ([Import survey points](topic:import-points)) |
| Point များ စီခြင်း | Point group များ၊ ဖော်ပြချက် key များ | Description ၏ ပထမစကားလုံးဖြင့် အလိုအလျောက် group များ; description key မရှိ |
| Point ကို ပြင်ခြင်း | Point editor၊ grip များ | Click ပြီး Properties တွင် ရိုက်ပါ၊ သို့မဟုတ် drag လုပ်ပါ ([Edit a survey point](topic:edit-points)) |
| မြေပြင် ဆောက်ခြင်း | Surface ဖန်တီး၊ point group များကို ဒေတာအဖြစ် ထည့် | အလိုအလျောက်: input ပြောင်းတိုင်း surface ပြန်ဆောက်သည် |
| Breakline ထည့်ခြင်း | Polyline သို့မဟုတ် feature line မှ breakline ထည့် | Point group ကို {{ui:Breakline}} သို့ သတ်မှတ်ပါ၊ သို့မဟုတ် {{ui:Breakline}} ကိရိယာ ({{key:B}}) ဖြင့် point များကို click ပါ |
| Surface ကို ဖြတ်ခြင်း | Outer boundary၊ hide boundary၊ triangle အရှည်အမြင့်ဆုံး | {{ui:Boundary}} ({{key:O}}၊ outer သာ) နှင့် **Longest outside edge** |
| Contour ပြခြင်း | Surface style | ဘယ်ဘက် panel ရှိ **Display**: interval၊ major every၊ label များ၊ bands၊ slope arrow များ |
| Centerline ဖွဲ့ခြင်း | Alignment ဖန်တီးကိရိယာများ၊ curve နှင့် spiral ဆက်တင်များ | {{ui:Alignment}} ({{key:A}}): PI များကို click၊ {{key:Enter}}; ရေဒီယပ်နှင့် spiral အရှည်များကို PI table တွင် |
| Profile view ဖန်တီးခြင်း | Profile view wizard၊ bands | {{ui:Profile}} ({{key:R}}): plan အောက်တွင် profile view တစ်ခု၊ အမြဲ ကိုက်ညီ |
| Grade ဒီဇိုင်းလုပ်ခြင်း | Profile layout ကိရိယာများ | {{ui:Start from the ground}}၊ {{ui:Add PVIs}} ({{key:I}})၊ PVI များကို drag၊ **Curve L** ကို ရိုက် |
| လမ်းဆောက်ခြင်း | Assembly၊ subassembly၊ corridor၊ target၊ region | Alignment အောက်ရှိ **Sweep an assembly along the design profile** ကို အမှန်ခြစ်; ဘက်တစ်ဖက်စီတွင် လမ်းသွား၊ ပခုံး နှင့် side slope၊ သို့မဟုတ် ဘက်တစ်ဖက်စီ အစိတ်အပိုင်းများ (gutter၊ curb၊ sidewalk …) |
| Pad ကို grade လုပ်ခြင်း | Feature line၊ grading group၊ grading criteria | {{ui:Pad}} ({{key:G}}): cut နှင့် fill slope များ daylight သို့ ရောက်သော ညီညာသော pad |
| Earthwork တွက်ခြင်း | Volume surface၊ volume dashboard | ညာဘက် panel ရှိ **Earthwork**၊ grid နည်းလမ်း၊ တိုက်ရိုက် update |
| Storm သို့မဟုတ် sanitary ဖွဲ့ခြင်း | Parts list၊ rule များပါသော pipe network | {{ui:Pipes}} ({{key:P}}): downstream structure များကို click; သင်သတ်မှတ်သော rule သုံးခု; အလိုအလျောက် invert |
| အခြားသူများနှင့် ဖလှယ်ခြင်း | LandXML import နှင့် export | LandXML ဖိုင်ကို {{ui:Open}}; export လုပ်ရန် {{ui:LandXML}} ([Exchange LandXML](topic:landxml)) |
| Linework ကို CAD သို့ ပို့ခြင်း | DWG သို့ export | {{ui:DWG}} (2000 မှ 2018 ဖော်မတ်) သို့မဟုတ် {{ui:DXF}} (R12) |
| Plot | Layout၊ viewport၊ sheet set | {{ui:PDF}}: ရွေးထားသော စကေးဖြင့် plan ၏ landscape စာရွက်တစ်ရွက်; plan နှင့် profile စာရွက်များနှင့် section စာရွက်များကို PDF အဖြစ် |
| ဖိုင်များကြား အလုပ်မျှဝေခြင်း | Data shortcut၊ reference | မရနိုင်ပါ: ဖိုင်တစ်ခုလျှင် ပရောဂျက်တစ်ခု |
| Undo | Undo | {{key:Mod+Z}} နှင့် {{key:Mod+Y}}၊ ၂၀၀ အဆင့်; display ဆက်တင်များသည် undo အဆင့် မဟုတ်ပါ |

## လူများ ချော်ရန်လွယ်သော ကွာခြားချက်များ

**Command line မရှိပါ** {{ui:Drafting classic}} menu style ကို မရွေးလျှင်။ ကိရိယာများသည် toolbar ခလုတ်များနှင့် အက္ခရာတစ်လုံးချင်းစီ: {{key:A}} alignment၊ {{key:G}} pad၊ {{key:P}} pipe၊ {{key:B}} breakline၊ {{key:O}} boundary၊ {{key:R}} profile၊ {{key:I}} add PVI၊ {{key:V}} select၊ {{key:F}} fit။ အခြား menu style များတွင် command အမည် ရိုက်လျှင် ဘာမှ မဖြစ်ပါ။ [Keys and mouse](topic:keyboard) ကို ကြည့်ပါ။

**Enter ဖြင့် ပြီးဆုံးသည်; double-click က အန္တရာယ်ရှိသည်။** နောက်ဆုံး point ကို တစ်ကြိမ် click ပြီးမှ {{key:Enter}} ကို နှိပ်ပါ။ ဤ build တွင် double-click လည်း ပြီးဆုံးသော်လည်း double-click လုပ်ထားသော point ကို ချန်လှပ်သွားသည်။ Right-click သည် ပြီးဆုံးခြင်း သို့မဟုတ် ပြန်လုပ်ခြင်း မလုပ်ပါ; ၎င်းနှင့် drag လုပ်ပါက pan သာလုပ်သည်။

**အရာအားလုံး အမြဲ dynamic ဖြစ်သည်။** Point group၊ ရေဒီယပ်၊ PVI သို့မဟုတ် pad slope တစ်ခုကို ပြောင်းလျှင် surface၊ contour၊ corridor၊ daylight လိုင်းများနှင့် volume များ ချက်ချင်း update ဖြစ်သည်။ ပြန်ဆောက်စရာ မရှိပြီး သက်တမ်းကုန်သည့်အရာ မရှိပါ။

**ဘာမျှ drawing object မဟုတ်ပါ။** Plan သည် ဒီဇိုင်း၏ view ဖြစ်ပြီး CAD command ဖြင့် ပြင်နိုင်သော drawing မဟုတ်ပါ။ သင့်ကိုယ်ပိုင် မျဉ်း သို့မဟုတ် စာသား ထည့်၍မရ၊ လေယာ၏ အရောင် မပြောင်းနိုင်၊ အရာတစ်ခုခုကို explode မလုပ်နိုင်ပါ။ DXF သို့ export လုပ်ပြီး drawing ကို CAD ပရိုဂရမ်တွင် ပြီးအောင် လုပ်ပါ။

**Style မရှိပါ။** အရောင်များ၊ မျဉ်းအထူများ၊ label အရွယ်အစားများနှင့် လေယာအမည်များသည် ပုံသေ ဖြစ်သည် ([Plan layers](topic:plan-layers) ကို ကြည့်ပါ)။ App bar ရှိ Paper နှင့် Model က ဖော့ခ်ပိုင်းနှင့် မှောင်သော မျက်နှာပြင်ကို ပြောင်းသည်။

**တစ်မျိုးတစ်ခုစီ တစ်ခု။** ရှိပြီးသား မြေပြင် surface တစ်ခု၊ grade ပြီးသော ရလဒ်တစ်ခု၊ pipe network တစ်ခုလျှင် ပရောဂျက်တစ်ခု။ Alignment နှင့် pad အများအပြား ရနိုင်သည်။

**ယူနစ်များသည် label များဖြစ်သည်။** {{ui:US feet}} သို့မဟုတ် {{ui:Metres}} ကို ရွေးခြင်းသည် ဘာကိုမျှ မပြောင်းပါ။ Drawing စကေး မရှိပါ။ Coordinate system သည် ရွေးချယ်စရာဖြစ်ပြီး {{ui:Coordinates}} အောက်တွင် သတ်မှတ်နိုင်သော်လည်း ဘာမျှ ရွေ့မသွားပါ၊ ဂဏန်းများက ဘာကို ဆိုလိုသည်ကိုသာ ပြောသည် ([Set the project's coordinate system](topic:coordinate-systems) ကို ကြည့်ပါ)။ LandXML သို့ ရေးသောအခါ feet များကို US survey feet အဖြစ် ယူသည်။

**Breakline group များသည် point နံပါတ်အစဉ်လိုက် ချိတ်ဆက်သည်။** {{ui:Breakline}} သို့ သတ်မှတ်ထားသော group သည် ၎င်း၏ point အားလုံးကို နံပါတ်အစဉ်လိုက် မျဉ်းတစ်ခုအဖြစ် ဖြစ်စေသည်။ ကုဒ်တူ (flowline နှစ်ခုစလုံး "FL" ဟု ကုဒ်ပေးထားလျှင်) က zig-zag မျဉ်းတစ်ခု ဖြစ်စေသည်; ၎င်းတို့ကို လက်ဖြင့် ဆွဲပါ။

**Station များသည် တူသော်လည်း မီတာများ ကွဲပြားသည်။** Feet သည် 100 ft station (12+34.56) သုံးသည်; မီတာသည် 1000 m station (1+234.567) သုံးသည်။

**Mac တွင် ဖျက်ခြင်း။** Mac ၏ delete ဟု အမည်ပေးထားသော key သည် browser အတွက် Backspace ဖြစ်သည်။ ရွေးထားသည်ကို ဖျက်ရန် Fn နှင့် delete၊ သို့မဟုတ် {{ui:Delete}} ခလုတ်ကို သုံးပါ။

**ဖိုင်များသည် download များ ဖြစ်သည်။** {{ui:Save}} သည် `.civilcraft.json` ဖိုင်ကို နှိပ်တိုင်း download လုပ်သည်; "ဖွင့်ထားသော ဖိုင်ပေါ် သိမ်းခြင်း" မရှိပါ။ မသိမ်းရသေးသော အလုပ်၏ ပြန်ယူရန်မိတ္တူကို ဤ browser တွင် ထားသည် ([Recover unsaved work](common:recover))။ Point ဖိုင်ဖွင့်ခြင်းသည် မေးမြန်းခြင်းမရှိဘဲ point များကို အစားထိုးသည်။ [Files you can open, save and export](topic:files) ကို ကြည့်ပါ။

**စည်းမျဉ်းများသည် သင့်ကိုယ်ပိုင်ဖြစ်သည်။** Pipe network rule များနှင့် corridor assembly သည် စံနှုန်းမဟုတ်သော placeholder တန်ဖိုးများဖြင့် စတင်သည်။ မည်သည့် စစ်ဆေးမှုကိုမဆို ယုံမီ သင့်ကိုယ်ပိုင် သတ်မှတ်ပါ။

**Volume များသည် grid အခြေပြုဖြစ်သည်။** Cut နှင့် fill သည် မျက်နှာပြင်နှစ်ခုကြား fine grid မှ ထွက်သည်၊ daylight လိုင်းများအတွင်း၊ swell သို့မဟုတ် shrink မပါ။ ၎င်းတို့သည် TIN-to-TIN volume နှင့် နီးစပ်သော်လည်း အတူတူ မဟုတ်ပါ။

## မပါသေးသည်များ

Clothoid မဟုတ်သော spiral များ၊ လမ်းတလျှောက် ပြောင်းလဲသော assembly များ၊ စောင်းသော pad များ၊ inlet capacity နှင့် detention၊ parts catalog များ၊ profile ထဲရှိ pipe များ၊ parcel layout နှင့် lot size သတ်မှတ်ခြင်း၊ least-squares adjustment နှင့် survey database များ၊ DWG ဖွင့်ခြင်း နှင့် အခြားများ။ အပြည့်စာရင်းကို ယနေ့ အစားထိုးနည်းများနှင့်အတူ [Not built yet](topic:not-built-yet) တွင် ဖော်ပြထားသည်။
