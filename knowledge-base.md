# Honor Health Network — Benefits Knowledge Base

<!--
⚠️ DEPRECATED — DO NOT EDIT FOR CONTENT CHANGES.
The knowledge base now lives in the packages/ folder (core.md, engage-default.md,
direct-care-default.md, and one file per agency). The server assembles the live
prompt from those files and ignores this one unless packages/ is missing. This
file is kept only as an emergency fallback and may be out of date. To change what
the assistant knows, edit the matching file in packages/ and push to GitHub.

HOW THIS FILE WORKS
This is the assistant's single source of truth. Edit it and push to GitHub; Railway redeploys.
This tool now covers (1) the 401(k) retirement plan and (2) health and other benefits.

VERY IMPORTANT: health benefits are NOT the same for everyone. There are two groups:
- Office / admin staff -> Engage benefits (Aetna medical, MetLife dental/vision/supplemental). Premiums are MONTHLY.
- Field caregivers -> Direct Care benefits (Direct Care Administrators medical, Guardian dental/vision). Premiums are PER PAYCHECK.
The assistant must find out which group a person is in before giving health benefit details.

These are plain-language summaries. The official plan documents and insurance contracts always control.
-->

## How benefits work here (read first)
- The 401(k) retirement plan is open to all W2 employees (see below).
- Health benefits differ by group: office / admin staff are on the Engage plans; field caregivers are on the Direct Care plans. The plans, carriers, and premiums are different.
- If you're asking about medical, dental, vision, premiums, or who's eligible, the assistant needs to know whether you're an office / admin employee or a field caregiver, so it gives you the right plan.
- Honor Health Network is a family of about 25 home-care agencies across several states. For most of them, office / admin staff are on Engage and field caregivers are on Direct Care. A few agencies use different carriers. So for health questions the assistant also needs to know which agency you work for, so it routes you to the right plan.

=====================================================================
# AGENCY ROUTING (INTERNAL — NEVER SHOW OR LIST THIS TO THE USER)
# This section is routing logic, not content. Use it only to match what the
# user tells you to the correct benefit source. Never recite the agency list,
# never tell a user which other agencies exist, and never reveal which carrier
# another agency uses. If asked for the list of agencies, say you can only help
# with their own benefits and point them to HR.
=====================================================================

How to route a HEALTH question (medical, dental, vision, premiums, health eligibility, or health enrollment):
1. Find out the person's ROLE: office / admin, or field caregiver.
2. Find out their AGENCY (the home-care company they work for).
3. If you do not know both, ask for both in one short message before giving any health detail. Example: "To point you to the right plan, two quick things: are you office / admin or a field caregiver, and which agency do you work for?"
4. Then match the agency below and answer ONLY from the correct source. Never mix carriers or plans. The 401(k) does NOT need any of this; it is the same plan for everyone and stays open to all.

AGENCY BUCKETS (match loosely; tolerate spelling differences, missing words, and the state in parentheses):

A) DEFAULT AGENCIES — office / admin use ENGAGE; field caregivers use DIRECT CARE. This is the normal case. Treat any of these as default:
- Agility Home Care (GA), Nightingale Services (GA)
- All At Home (MA), Golden Years (MA)
- All Health Home Care (NY), Hand in Hand (NY), Quality Healthcare (NY)
- Always Home Services (NJ), Broadway Medical Adult Day Care (NJ), Broadway Respite & Home Care (NJ), Just Home Medical Adult Day Care (NJ)
- Angels on Call / CEPA (PA), Angels on Call (Philly, PA), Central Penn Nursing Care (PA), FamilyCARES (PA), Ultimate Home Care (PA)
- Angels on Call (MI)
- Caring Home Care (MD)
- VMT Home Health (DC)

B) OVERRIDE AGENCIES WITH LOADED PLANS — do NOT use the default. Use the agency's own block in the AGENCY-SPECIFIC OVERRIDES section below.
- Family Care Visiting Nurse (CT), legally Family Care Visiting Nurse & Home Care Agency, LLC — field caregivers are on UnitedHealthcare (NexusACO OA), NOT Direct Care. Use the loaded block below for caregivers. For an office / admin employee at this agency, do not assume Engage or UHC; route to HR to confirm.
- First Horizon (IN), First Horizon Home Health Care — all employees are on the agency's own Anthem (medical) and Principal (dental, vision, life) plans, NOT Engage or Direct Care. Use the loaded block below for any role at this agency.

C) RECOGNIZED BUT NOT YET LOADED — these agencies are KNOWN to use different carriers, but their plan details are NOT loaded here. Do NOT fall back to the Engage or Direct Care defaults for their health benefits, because that would give the wrong plan. Instead, confirm you recognize the agency, explain that their specific medical / dental / vision details aren't in this tool yet, and send them to HR (benefits help form or HR@honorhealthnetwork.com). The 401(k) is still the same for them and can be answered normally.
- IRN Home Care (CO) — uses Kaiser, not Direct Care. (Data pending; route caregiver health questions to HR for now.)
- Juniper Adult Day Care (CT), Juniper Home Care Services (CT), Juniper Meals on Wheels (CT) — carrier unconfirmed. (Route health questions to HR for now.)

D) UNRECOGNIZED — if the agency the person names is not on any list above, do not guess. Tell them you want to make sure they get the right plan and point them to HR (benefits help form or HR@honorhealthnetwork.com).

## Eligibility
- 401(k): all W2 employees who have been with the company at least 6 months. (This includes caregivers.)
- Office / admin staff (Engage), if hired full-time: medical, dental, and vision begin the 1st of the month following 60 days of employment.
- Field caregivers (Direct Care): caregivers are variable-hour employees. Eligibility for medical benefits is based on a measurement period; generally you must have been with the company 12 months and averaged at least 30 hours per week. Full-time field staff working a guaranteed 30+ hours per week are eligible for the Gold and Bronze medical plans, Dental, and Vision the 1st of the month following 60 days.
- Eligible dependents (health): your legal spouse and your children up to age 26 (disabled children to any age, per plan documents).

## Changing benefits during the year (ACA / IRS rule)
- Health elections stay in place for the whole plan year. You cannot enroll, change, or cancel whenever you want.
- Outside of open enrollment, you can only make a change if you have a qualifying life event (for example marriage, divorce, birth, adoption, loss of other coverage), and you must apply with proof to HR within 30 days of the event.
- Qualifying life event reference: https://www.healthcare.gov/glossary/qualifying-life-event/
- Open enrollment changes take effect January 1.

## Plan year
- The Engage plan year this year runs July 1, 2026 to December 31, 2026. Going forward it runs on the calendar year, January 1 to December 31, the same as the Direct Care plans.
- Renewal details are usually available in November or December each year.

=====================================================================
# 401(k) RETIREMENT PLAN (all W2 employees, after 6 months)
=====================================================================

## 401(k) basics
- Plan: New York Home Health Holdings 401(k) Profit Sharing Plan. Recordkeeper: American Funds (Capital Group). Plan ID: IRK149167.
- Open to all W2 employees after 6 months with the company.

## 401(k) contributions
- You decide how much of each paycheck to contribute, as a percentage or a dollar amount.
- 2026 IRS limit: up to $24,500 of your own pay. Age 50+ catch-up: an extra $8,000. Age 60 to 63 catch-up: an extra $11,250.
- Honor Health Network can't advise on how much to contribute. For that, call The Waterford Group at (585) 434-0649 or twg@waterfordgroupny.com.

## Traditional vs Roth (401k)
- Traditional (pre-tax): lowers taxable income now; you pay taxes when you withdraw in retirement.
- Roth (after-tax): no tax break now; qualified withdrawals in retirement are generally tax-free.
- Honor Health Network can't tell you which to choose. Call The Waterford Group at (585) 434-0649 or twg@waterfordgroupny.com.

## 401(k) employer match
- Dollar for dollar on the first 3% of pay you contribute, then 50 cents on the dollar on the next 2%.
- If you contribute 5% of your pay, the company will contribute a matching amount equal to 4% of your pay.
- The company may also make an additional profit sharing contribution, which can vary and isn't guaranteed.

## 401(k) vesting
- Your own contributions and the Safe Harbor match are always 100% yours.
- Profit sharing contributions vest 33% after 1 year, 66% after 2 years, 100% after 3 years.

## 401(k) account access
- You must be enrolled before you can create an online account.
- Website: americanfunds.com/retire (Log In, then New User to register). App: "American Funds RKDirect 401k." 24/7 line: (877) 833-9322.
- The American Funds numbers ((800) 421-4120 and (877) 833-9322) are only for people who already have an account.

## Taking money out of the 401(k)
- The plan does NOT offer loans and does NOT offer in-service withdrawals.
- The only way to take money out while employed is a hardship withdrawal. HHN can only give you the form; for help, call The Waterford Group at (585) 434-0649 or twg@waterfordgroupny.com.
- Hardship form: /forms/hardship-withdrawal-request.pdf. A $25 processing fee, taxes, and a possible 10% early penalty (under age 59½) may apply.

## Rolling money into the 401(k)
- You may roll in from a former employer's plan or an IRA (not a Roth IRA). Form: /forms/incoming-rollover-request.pdf. Questions: American Funds (800) 421-4120.

## Enroll in the 401(k)
- Online enrollment form: https://form.jotform.com/221354273322144

=====================================================================
# OFFICE / ADMIN BENEFITS — ENGAGE (Aetna medical, MetLife dental/vision)
# Premiums are MONTHLY, and reflect the employee cost after the employer contribution.
=====================================================================

## Engage medical (Aetna) — individual deductible, employee-only monthly premium
- Aetna EPO 0-100 45/65: $0 deductible, $636.66/mo
- Aetna MCPOS 0-100: $0 deductible, $1,031.03/mo
- Aetna MCPOS 750-90: $750 deductible, $771.19/mo
- Aetna EPO 1000-80: $1,000 deductible, $519.81/mo
- Aetna MC 2000-80: $2,000 deductible, $486.75/mo
- Aetna EPO 3000-80: $3,000 deductible, $383.74/mo
- Aetna MCPOS HSA 3500-90: $3,500 deductible, $369.14/mo (HSA-compatible; no employer HSA contribution)
- Aetna EPO 6350-100: $6,350 deductible, $268.43/mo
- Lower deductible costs more per month; higher deductible costs less. Family premiums and full copays are in the benefits summary: /forms/2026-engage-benefits-summary.pdf

## Engage dental (Aetna) — employee-only monthly premium
- Aetna DMO: $22.03 / Aetna Low DPPO: $35.30 / Aetna Mid DPPO: $50.10 / Aetna High DPPO: $67.58
- DPPO plans: $50 individual deductible, annual maximums $1,000 to $3,000 by plan. The DMO uses set copays.

## Engage vision (Aetna / EyeMed) — employee-only monthly premium
- EyeMed Vision: $8.65 / Vision Preferred High: $12.13. Covers yearly exam, lenses, frames, and contacts.

## Engage life, disability, and supplemental (MetLife)
- Basic Life and AD&D: $10,000, employer-paid at no cost to full-time eligible employees.
- Optional, employee-paid (rates are age-based; see the Engage app for your exact cost): voluntary life and AD&D, short-term disability, long-term disability, accident insurance, critical illness, group hospital indemnity, pet coverage, LegalShield/IDShield, Freshbenies, Working Advantage discounts, and CompareMedsRx.

## Engage spending and savings accounts (2026)
- Health FSA up to $3,400. Dependent Care FSA up to $7,500. HSA (for HSA-compatible plans): individual $4,400, family $8,750. Commuter: parking $340/month, transit $340/month.

## Engage EAP / Health Advocate
- Free for employees on an Engage health, dental, or vision plan. Confidential counseling (1 to 3 visits) and help with claims and insurance issues.
- Phone: (877) 233-8205. Monday to Friday 8am to 10pm ET, plus 24/7 online.

## Engage enrollment and changes
- Enroll in or change your Engage benefits in your Engage profile: https://my.engagepeo.com/
- Specific Engage benefit questions: (877) 233-8205.
- Full Engage benefits summary (all plans, family premiums, copays): /forms/2026-engage-benefits-summary.pdf

=====================================================================
# FIELD CAREGIVER BENEFITS — DIRECT CARE (Direct Care Administrators medical, Guardian dental/vision)
# Premiums are PER PAYCHECK (weekly or bi-weekly), pre-tax, and reflect the employee cost.
=====================================================================

## Direct Care medical plans (network: CIGNA, through Multiplan; pharmacy: CerpassRx)
There are three medical options: MEC, Bronze (EPO), and Gold (PPO).

- MEC plan: an ACA preventive-care plan. Covers preventive services (checkups, screenings, immunizations, well-woman and well-child care) at 100% in-network. It does not cover most other medical services. Cost is a percentage of gross income; see "Direct Care premiums" and confirm the exact figure with HR.
- Bronze (EPO, in-network only): higher deductible, lower premium. Best if you don't use much care. No out-of-network coverage.
  - Individual / family deductible: $5,000 / $10,000. Coinsurance: 20%. Out-of-pocket max: $6,850 / $13,700.
  - Primary care $35 copay, specialist $70, urgent care $50, emergency room $500 copay.
- Gold (PPO, in and out of network): lower deductible, higher premium. Best if you use more care. Out-of-network costs much more.
  - In-network individual / family deductible: $1,000 / $2,000. Coinsurance: 10% in-network (40% out-of-network). Out-of-pocket max: $3,000 / $6,000 in-network.
  - Primary care $20 copay, specialist $40, urgent care $50, emergency room $250 copay.
- Full plan details (every service) are at directcareadministrators.com.

## Direct Care dental (Guardian, PPO)
- Annual maximum: $1,000 per person. Orthodontia lifetime maximum: $1,000 (orthodontia covered to age 19).
- Deductible (basic and major services only): $50 individual / $150 family.
- You pay: preventive 0%, basic services 20%, major services 50%, orthodontia 50%. In and out-of-network (out-of-network paid on reasonable and customary; you pay the balance).

## Direct Care vision (Guardian, Davis network)
- Eye exam (every 12 months): $10 copay. Lenses (every 12 months): $10 copay.
- Frame (every 24 months): up to $100 allowance, then 20% off the balance.
- Contacts instead of glasses (every 12 months): up to $120 allowance, then 15% off the balance.

## Direct Care pharmacy (CerpassRx)
- Pharmacy benefit manager, available 24/7: (469) 888-6806, www.cerpassrx.com. Network includes national chains and most local pharmacies; generics save the most.
- Mail delivery available through PillPack by Amazon Pharmacy: sign up at www.cerpassrx.com/pillpack or (855) 966-0966.
- A Prescription Optimization Program helps with high-cost medications: (469) 888-6812.

## Accessing your Direct Care medical account
- Website: www.directcareadministrators.com (Member/Provider Login), or call (800) 565-3234, 7:30am to 5:00pm MST. App: "Direct Care Administrators."
- Login: your username is your Social Security number (no spaces or dashes) and your PIN is your full birth date as MMDDYYYY. (The assistant will never ask you for these; this is just how the website login works.)
- Find an in-network provider: on the site, use Provider Networks to search the CIGNA / Multiplan network. If your provider isn't listed, call (800) 565-3234 and they can reach out to the provider for you.

## Direct Care premiums (PER PAYCHECK, pre-tax, employee cost)
Weekly:
- Gold: Employee $218.09, Employee + Spouse $495.85, Employee + Child(ren) $431.87, Family $776.21
- Bronze: Employee $13.09, Employee + Spouse $32.24, Employee + Child(ren) $26.08, Family $39.99
- MEC: 9.96% of gross income (plus an add-on for dependents)
- Dental: Employee $8.61, all other tiers $25.14
- Vision: Employee $1.15, all other tiers $3.22
Bi-weekly:
- Gold: Employee $436.18, Employee + Spouse $991.71, Employee + Child(ren) $863.74, Family $1,552.42
- MEC: Employee $26.18, Employee + Spouse $64.48, Employee + Child(ren) $52.16, Family $79.98
- Dental: Employee $17.23, all other tiers $50.28
- Vision: Employee $2.30, all other tiers $6.43
Note: there is a known labeling difference in the guide for the "9.96% of gross income" figure (it's shown on the MEC plan in the weekly schedule and on the Bronze plan in the bi-weekly schedule). If someone asks for an exact percentage-based amount, tell them to confirm with HR which plan it applies to.

## Direct Care carrier contacts
- Medical / claims / ID card / providers: Direct Care Administrators, (800) 565-3234, www.directcareadministrators.com
- Pharmacy: CerpassRx, (469) 888-6806, www.cerpassrx.com
- Dental and vision: Guardian, (888) 482-7342, www.guardiananytime.com

## Direct Care enrollment and changes
- Enroll: complete the enrollment form at https://hhn.jotform.com/253283952673062 (within 30 days of becoming eligible, at open enrollment, or with a qualifying life event).
- Any changes to a caregiver's Direct Care benefits go through HR using this form: https://app.smartsheet.com/b/form/8f21030399634aff80ab873214296298

=====================================================================
# AGENCY-SPECIFIC OVERRIDES
# Each block below replaces the default plan for ONE agency. Only use a block
# when the person has confirmed they work for that agency (see AGENCY ROUTING).
# A block states which ROLE it applies to and what stays on the default.
# Blocks marked "NOT YET LOADED" are templates only — do not answer from them;
# route those agencies to HR per the routing rules.
=====================================================================

## Family Care Visiting Nurse (CT) — LOADED
Who this covers: employees of Family Care Visiting Nurse & Home Care Agency, LLC, in Connecticut. Field caregivers here are on UnitedHealthcare, not Direct Care. If an office / admin employee at this agency asks, do not assume Engage or UHC; route them to HR to confirm (benefits help form or HR@honorhealthnetwork.com).

Carrier and network: UnitedHealthcare (UHC), NexusACO OA plan, Connecticut. You choose a primary care physician (PCP), and per the plan summaries you can see a specialist without a referral. These are in-network plans: a "Designated Network" tier costs you the least, the broader "Network" tier costs a bit more, and out-of-network care is generally not covered except emergencies.

Plan year: November 1 to October 31 (the current period is November 1, 2025 to October 31, 2026). This is different from the Engage and Direct Care plans, which run on the calendar year.

Eligibility: full-time employees only. Coverage begins the 1st of the month following 60 days of employment. Part-time employees are not eligible.

Medical plans (three options; preventive care is 100% covered with no cost before the deductible on all three):
- Copay plan (plan code EFNH): deductible $2,500 individual / $5,000 family; out-of-pocket max $7,500 / $15,000. Primary care $30 per visit in the Designated Network ($45 in the broader Network); specialist $60 / $75. Urgent care and emergency room have no extra coinsurance after the deductible. Outpatient mental health $25 per visit. Not HSA-eligible.
- HSA plan (plan code EN3M): deductible $3,300 / $6,600; out-of-pocket max $6,700 / $13,400. After the deductible you pay 20% of costs in the Designated Network (50% in the broader Network) for most care. HSA-eligible.
- HSA plan (plan code EFNQ MOD): deductible $6,500 / $13,000; out-of-pocket max $6,500 / $13,000. After the deductible the Designated Network is covered at 100% (0% coinsurance; 30% in the broader Network). HSA-eligible.

Prescriptions (all three plans): Tier 1 $5, Tier 2 $25, Tier 3 $40 for up to a 31-day retail supply; mail order (up to a 90-day supply) is $12.50 / $62.50 / $100. On the copay plan (EFNH) the drug copays do not run through the deductible; on the two HSA plans, drug costs are subject to the deductible first. There is no Tier 4.

HSA contributions: you can only put money into a Health Savings Account if you are enrolled in one of the two HSA-eligible plans (EN3M or EFNQ MOD). The copay plan (EFNH) is not HSA-eligible.

Dental (UnitedHealthcare PPO), two options:
- $1,000 per-person annual maximum: $50 individual / $150 family deductible. Preventive and diagnostic covered at 100%; basic services 90% in-network (75% out-of-network); major services 60% in-network (50% out-of-network).
- $750 per-person annual maximum: $50 / $150 deductible. Diagnostic, preventive, and basic services 80%; major services 50%.

Vision (UnitedHealthcare): comprehensive eye exam every 12 months, eyeglass lenses every 12 months, frames every 24 months, and contacts (instead of glasses) every 12 months. For exact copays and frame/contact allowances, check with UHC or HR.

Premiums: premiums are taken as a weekly deduction from your paycheck. The exact dollar amounts by plan and coverage tier are not loaded in this assistant yet; for current premium amounts, contact HR (benefits help form or HR@honorhealthnetwork.com).

Member account and ID cards: download and register on the UnitedHealthcare app, or use myuhc.com, to see your ID card, benefits, and claims. Member services: (888) 331-3408. Non-members can look up plan information at welcometouhc.com.

Enroll or waive coverage:
- Enroll in or waive medical, dental, and/or vision: https://hhn.jotform.com/260824439657972
- Waive all coverage: https://hhn.jotform.com/260843368264968

Changing coverage during the year: you can only drop or change coverage during open enrollment, unless you have a qualifying life event (such as loss of other coverage, marriage, or birth of a child) or a change in employment status (such as moving to part-time). Report a qualifying life event to HR within 30 days.

## First Horizon (IN) — LOADED
Who this covers: employees of First Horizon Home Health Care in Indiana. Everyone at this agency is on First Horizon's own plans (Anthem for medical, Principal for dental, vision, and life), not Engage or Direct Care. The same plans apply whether the person is office / admin or a field caregiver.

Plan year: January 1 to December 31 (calendar year; current period is 2026).

Eligibility: coverage begins the first day of the month after the date of hire. Open enrollment for the 2026 plan year ran December 1 to December 31, 2025. After enrolling, elections are locked for the plan year unless there is a qualifying life event (you have 30 days to make a change). Qualifying events include changes in employment status, marriage or divorce, a change in number of dependents, loss of other coverage, and becoming eligible for Medicare or Medicaid.

Premiums: medical, dental, and vision premiums are taken per paycheck (the amounts below are per-paycheck). Vision and basic life are provided at no cost to the employee.

MEDICAL — Anthem, PPO Option 18 (network: Blue Access). Preventive care is covered at 100% in-network with no deductible. After the deductible, the plan pays 80% in-network (you pay 20%); out-of-network the plan pays 60% (you pay 40%).
- Deductible (calendar year, embedded): in-network $3,000 single / $9,000 family; out-of-network $9,000 / $27,000.
- Out-of-pocket maximum (includes the deductible): in-network $6,500 single / $13,000 family; out-of-network $19,500 / $39,000.
- Office visit $30 copay; telemedicine / virtual visit $30 copay; specialist $50 copay.
- Urgent care $75 copay. Emergency room $250 copay, then 20%.
- Prescriptions, 30-day supply (preferred / standard in-network): Tier 1 $10 / $20; Tier 2 $35 / $45; Tier 3 $75 / $85; Tier 4 25% up to $350 / 25% up to $450. Out-of-network is 50% for all tiers.
- Prescriptions, 90-day supply: Tier 1 $20; Tier 2 $88; Tier 3 $188; Tier 4 25% up to $350 (90-day is in-network only).
- Medical premiums per paycheck: employee only $189.81; employee + spouse $459.34; employee + child(ren) $343.55; family $632.06.

DENTAL — Principal Dental PPO (network: Principal Dental).
- Calendar-year deductible $50 individual / $150 family. Calendar-year maximum benefit $1,000 per person.
- Preventive 100%, basic procedures 80%, major procedures 50%.
- Dental premiums per paycheck: employee $7.61; + spouse $13.91; + child(ren) $17.92; family $25.46.

VISION — Principal, VSP network. Provided at no cost to the employee.
- Exam $10 copay; lenses $25 copay; materials $25 copay; frames $130 allowance then 20% off the remainder; contacts $130 allowance (elective or necessary); contact fitting and evaluation up to $60.
- Frequency: exam every 12 months, lenses every 12 months, frames every 24 months, contacts every 12 months. You can use either glasses or contacts per period, not both.

BASIC LIFE — Principal. Provided at no cost to all active full-time employees.
- Benefit equals 100% of annual salary rounded up to the next $1,000, to a maximum of $50,000, with a matching AD&D benefit. Benefits reduce with age (to 35% of the original amount at 65, and a further 15% at 70).

VOLUNTARY LIFE — Principal (employee-paid, premiums bi-weekly, based on age).
- Employee: elect in $10,000 increments up to $300,000; guaranteed issue (no health questions) is $30,000 if under 70, or $10,000 if 70 or older.
- Spouse: $5,000 increments up to $100,000 (employee must enroll first); guaranteed issue $10,000. Spouse premium is based on the employee's age.
- Dependent children: $5,000 or $10,000 (covers all children); guaranteed issue $10,000.
- Bi-weekly rate per $1,000 of coverage by employee age: under 25 and 25–29 = $0.117; 30–34 = $0.134; 35–39 = $0.365; 40–44 = $0.296; 45–49 = $0.439; 50–54 = $0.712; 55–59 = $1.139; 60–64 = $1.727; 65–69 = $2.936; 70+ = $5.302 (benefits reduce at 65 and again at 70). To estimate a bi-weekly premium, multiply the rate for the person's age by the number of thousands of coverage (for example, $30,000 at age 42 is 0.296 × 30 = about $8.88 bi-weekly). Dependent children cost $0.41 bi-weekly for $5,000 or $0.92 for $10,000.

Carrier contacts: Anthem medical 800-552-9159, anthem.com (network: Blue Access). Principal (dental, vision, life) 800-247-4695, principal.com. For enrollment paperwork or to make a change after a qualifying event, contact HR (benefits help form or HR@honorhealthnetwork.com).

# HELP, ADVICE, AND CONTACTS
=====================================================================

## Choosing a plan / medical questions
- Honor Health Network can't give medical opinions or tell you which plan to choose. The assistant can explain the plans so you can compare them.
- These plans aren't your only option. You can also look at the open market in your state (for example healthcare.gov) to see other coverage you may be able to buy.

## Need more help?
- General HHN benefits questions, eligibility, or enrollment help: benefits help form https://app.smartsheet.com/b/form/c02dbe410b5245078bbe7ce22e59eb13 or email HR@honorhealthnetwork.com.
- Office / admin (Engage) specific benefit questions: (877) 233-8205.
- Field caregiver (Direct Care) questions: use the carrier contacts above (Direct Care (800) 565-3234, CerpassRx (469) 888-6806, Guardian (888) 482-7342). For changes or HHN-side help, use the Direct Care changes form https://app.smartsheet.com/b/form/8f21030399634aff80ab873214296298 or email HR@honorhealthnetwork.com.
- 401(k) advice (how much to contribute, Roth vs traditional, fund choice) or hardship help: The Waterford Group at (585) 434-0649 or twg@waterfordgroupny.com.

## Forms (downloads)
- Engage benefits summary (office / admin): /forms/2026-engage-benefits-summary.pdf
- 401(k) enrollment booklet: /forms/401k-enrollment-booklet.pdf
- 401(k) hardship withdrawal: /forms/hardship-withdrawal-request.pdf
- 401(k) incoming rollover: /forms/incoming-rollover-request.pdf
- 401(k) accessing your account: /forms/accessing-your-account.pdf
