# DMECH IMPORT CALCULATOR — BUSINESS RULE CONFIRMATION & DATA INTAKE QUESTIONNAIRE

**Purpose:** This questionnaire will help DMECH confirm the business rules, rates, datasets, examples, and source documents required before the new Import Calculator is designed or implemented.

Please answer every **REQUIRED** question before development begins. Where a question does not apply, please write **Not applicable** rather than leaving it blank.

## How to Complete This Questionnaire

- **REQUIRED:** Must be answered before development can safely begin.
- **IMPORTANT:** Strongly recommended for an accurate and maintainable calculator.
- **OPTIONAL:** Can be supplied after the first approved version.
- Where the current application is mentioned, it describes existing behavior only. It is not presented as an approved DMECH rule.

# 1. Vehicle Identification & Classification

### Questions

| Priority | Question | DMECH answer / notes |
|---|---|---|
| REQUIRED | What information identifies a vehicle for import calculation: make, model, year, variant, tariff code, or another identifier? | all |
| REQUIRED | What does “vehicle year” mean for DMECH: model year, manufacturing year, registration year, first-use year, or another date? | model year |
| REQUIRED | Is the manufacturer make required for determining the applicable rule? | i think so, decide |
| REQUIRED | Is the model name required, or is an official model/code used? | model name |
| REQUIRED | Can the same model and year have multiple variants with different treatment? | i think so, decide |
| REQUIRED | Does vehicle category affect import duty or any other charge? Please provide the official category list. | i trust your decision, get that |
| REQUIRED | Does body type affect import duty or any other charge? Please provide the official body-type list, if one exists. | yes, i think so, things like suv, sedan and the like, decide |
| REQUIRED | Does vehicle class or tariff class affect import duty? Please explain the difference between vehicle class and body type. | decide |
| IMPORTANT | Does engine size or engine capacity in CC affect duty, tax, levy, or any other cost? | not really, but decide |
| IMPORTANT | Does fuel type affect any charge? | yes i think so, decide |
| REQUIRED | How does DMECH define new and used vehicles? | different |
| IMPORTANT | Does country or region of origin affect calculation? | i think so, decide |
| OPTIONAL | Are transmission, drivetrain, trim, battery range, emissions, or other vehicle details needed for future use? | i dont think so, but decide### Classification definitions requested

Please provide the official meaning and approved values for each term used by DMECH.

| Term | DMECH definition | Approved values/list | Used for calculation, display, or both? |
|---|---|---|---|
| Make | | | |
| Model | | | |
| Model year | | | |
| Manufacturing year | | | |
| Variant / trim | | | |
| Vehicle category | | | |
| Body type | | | |
| Vehicle class | | | |
| Engine capacity | | | |
| Fuel type | | | |
| New | | | |
| Used | | | |
| Source country/region | | | |

# 2. Import Duty Rules

This is the highest-priority section. The new requirement states that duty should be determined by the vehicle’s applicable year/model rule rather than simply by the customer’s purchase price.

## Questions for DMECH

| Priority | Question | DMECH answer / notes |
|---|---|---|
| REQUIRED | Is duty determined by make + model + year? | |
| REQUIRED | Is duty determined by model + year without make? | |
| REQUIRED | Is vehicle category, body type, vehicle class, or tariff class also required? | |
| REQUIRED | Is duty determined using an official HS/tariff classification? | |
| REQUIRED | Does customs value determine the duty amount even when the duty rule is selected by year/model? | |
| REQUIRED | Does the same model/year always use the same duty rule when all other relevant conditions are the same? | |
| REQUIRED | What does a duty rule represent: a fixed amount, percentage, tariff band, customs-value calculation, or another method? | |
| REQUIRED | Can one model/year have multiple duty rules? If yes, what determines which one applies? | |
| REQUIRED | Does duty vary by variant, engine, fuel type, body type, condition, source country, or port? | |
| REQUIRED | Are there minimum, maximum, reference, or customs-assessed values relevant to duty? | |
| REQUIRED | Can customs override a declared purchase price or reference value? | |
| IMPORTANT | Do duty rules change annually or when a new policy takes effect? | |
| IMPORTANT | Are special or luxury classifications used? | |
| IMPORTANT | Are certificates or approvals required for any duty treatment? | |
| REQUIRED | What should happen when no approved duty rule exists for a selected vehicle? | |

## Duty rule data requested

Please complete this table for the initial vehicle/rule dataset or attach an existing approved file.

| Make | Model | Model Year | Variant | Fuel Type | Engine CC | Vehicle Category | Body Type | Vehicle/Duty Class | Duty Rule / Rate | Duty Type | Calculation Basis | Customs Value | Effective From | Effective To | Source | Notes |
|---|---|---:|---|---|---:|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | | | | | | |
| | | | | | | | | | | | | | | | | | |
| | | | | | | | | | | | | | | | | |

# 3. Customs / Assessable Value

Please distinguish the following three concepts in DMECH’s business process:

- **Purchase Price:** What the customer paid or expects to pay for the vehicle.
- **Customs / Assessable Value:** The value used to assess customs charges.
- **Landed Cost:** The total estimated cost of obtaining the vehicle in Nigeria.

## Questions

| Priority | Question | DMECH answer / notes |
|---|---|---|
| REQUIRED | What determines customs or assessable value? | |
| REQUIRED | Is customs value based on actual purchase price? | |
| REQUIRED | Is there a customs reference-value table? | |
| REQUIRED | Is the value based on make, model, year, VIN, variant, or another factor? | |
| REQUIRED | Is customs value fixed, periodically updated, or calculated? | |
| REQUIRED | Who maintains or approves customs values? | |
| REQUIRED | Can staff override a customs value? | |
| IMPORTANT | Are overrides recorded with a reason and approver? | |
| REQUIRED | Is customs value held in USD, NGN, or another currency? | |
| REQUIRED | Is duty a percentage of customs value, a fixed amount, or another calculation? | |
| REQUIRED | Can customs-assessed value differ from the customer’s purchase price? | |
| IMPORTANT | Does shipping or insurance form part of the assessable value? | |

# 4. Taxes & Government Charges

The current application contains the charges below. The current rates are implementation values only and are not being presented as approved DMECH rules. Please confirm, replace, or reject each one.

| Charge | Currently in application? | Current application behavior | Official DMECH rule known? | What DMECH must provide |
|---|---|---|---|---|
| Import Duty | Yes | Non-EV duty currently uses a 20% rate applied to CIF | No | Approved classification, rate/amount, basis, exceptions, source |
| Import Levy | Yes | Used currently uses 5%; new currently uses 10% | No | Approved rates, basis, condition definitions, source |
| VAT | Yes | Currently 7.5% of CIF plus the subtotal, with EV exemption behavior | No | Rate, basis, exemptions, thresholds, source |
| NAC | Yes | Currently 2% of CIF | No | Applicability, rate, basis, source |
| CISS | Yes | Currently 1% of purchase cost converted to NGN | No | Correct rate, basis, applicability, source |
| ETLS | Yes | Currently 0.5% of CIF | No | Applicability, rate, basis, source |
| Surcharge | Yes | Currently 7% of duty | No | Confirm whether it applies and how it is calculated |
| Green/environmental tax | Yes | Currently 0% for EV/small engine, 2% medium, 4% large | No | Official categories, rates, exemptions, source |
| Other government charges | Not identified completely | May be missing from current application | No | Complete approved list |

## Tax and levy rule table

Please complete one row for every government charge DMECH wants included.

| Charge name | Rate / amount | Fixed or percentage | Currency | Calculation basis | Depends on duty? | Depends on customs value/CIF? | Depends on vehicle characteristics? | Conditions | Exemptions | Minimum/maximum | Effective From | Effective To | Official source/document | Included in public estimate? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | | | |
| | | | | | | | | | | | | | | |
| | | | | | | | | | | | | | | |

# 5. New vs Used Vehicles

The current application uses a 5% levy for used vehicles and a 10% levy for new vehicles. These are confirmation requests, not approved rules.

| Priority | Question | DMECH answer / notes |
|---|---|---|
| REQUIRED | What makes a vehicle “new” for this calculation? | |
| REQUIRED | What makes a vehicle “used”? | |
| REQUIRED | Does new/used affect import duty? | |
| REQUIRED | Does new/used affect import levy? | |
| IMPORTANT | Does new/used affect customs value, VAT, green tax, shipping, or insurance? | |
| IMPORTANT | Does registration or previous use determine the condition? | |
| IMPORTANT | Are there age limits or special rules for used vehicles? | |
| REQUIRED | Please confirm, replace, or reject the current 5% used and 10% new levy behavior. | |

# 6. EV / Hybrid / Petrol / Diesel Rules

The current application identifies fuel types from its static catalog and contains special EV behavior. These rules require confirmation.

| Priority | Question | DMECH answer / notes |
|---|---|---|
| REQUIRED | Does petrol, diesel, hybrid, and electric classification affect duty? | |
| REQUIRED | Does fuel type affect VAT, levy, surcharge, or other charges? | |
| REQUIRED | Are fully electric vehicles treated differently from hybrids or plug-in hybrids? | |
| REQUIRED | Are extended-range EVs treated differently? | |
| REQUIRED | Are EV exemptions available? | |
| REQUIRED | Does an EV exemption require a certificate or approval? | |
| REQUIRED | Is there an EV value threshold? If yes, provide the approved threshold and source. | |
| IMPORTANT | Does engine size affect treatment for petrol, diesel, or hybrid vehicles? | |
| REQUIRED | Please confirm, replace, or reject the current EV duty/VAT exemption behavior. | |

# 7. Vehicle Year Rules

The current application displays a hard-coded twelve-year selection range. This is not an approved business rule.

| Priority | Question | DMECH answer / notes |
|---|---|---|
| REQUIRED | Which year definition should the calculator use? | |
| REQUIRED | What vehicle years are supported? | |
| REQUIRED | Are there minimum or maximum importable ages? | |
| REQUIRED | Are any years prohibited or restricted? | |
| REQUIRED | Does duty change by year or year band? | |
| IMPORTANT | Do taxes or fees change by year? | |
| IMPORTANT | Are older vehicles subject to different classifications? | |
| IMPORTANT | How should newly released models be added? | |
| IMPORTANT | How should discontinued models remain available for historical use? | |

# 8. Source Country / Shipping

The current application uses estimated regional shipping defaults:

- USA: $1,500
- Europe: $1,300
- China: $1,800

These are current application values only and require confirmation.

| Priority | Question | DMECH answer / notes |
|---|---|---|
| REQUIRED | Which source countries and export ports are supported? | |
| REQUIRED | Which Nigerian destination ports are supported? | |
| REQUIRED | Does source country affect duty, customs classification, taxes, or exemptions? | |
| REQUIRED | Does shipping vary by source country, port, route, or destination? | |
| REQUIRED | Does shipping vary by vehicle size or type? | |
| IMPORTANT | Does shipping method affect cost: RoRo, container, or another method? | |
| REQUIRED | Does shipping form part of customs or assessable value? | |
| IMPORTANT | Should customers enter shipping manually, select an estimate, or not edit it? | |
| IMPORTANT | Should staff maintain shipping rates? | |
| OPTIONAL | Should shipping eventually come from an external provider? | |

## Shipping rate table

| Source Country | Export Port | Destination Port | Vehicle Type/Size | Shipping Method | Rate | Currency | Valid From | Valid To | Includes Inland Transport? | Source/Provider | Customer Editable? |
|---|---|---|---|---|---:|---|---|---|---|---|---|
| | | | | | | | | | | | |
| | | | | | | | | | | | | |
| | | | | | | | | | | | | | |

# 9. Insurance

The current application uses insurance calculated as 0.5% of cost plus freight. This is not confirmed as DMECH policy.

| Priority | Question | DMECH answer / notes |
|---|---|---|
| REQUIRED | Is marine/import insurance mandatory? | |
| REQUIRED | What is the insurance rate or amount? | |
| REQUIRED | What is the calculation basis: purchase price, cost plus freight, customs value, or another value? | |
| REQUIRED | Is insurance included in CIF or customs value? | |
| IMPORTANT | Does insurance vary by vehicle value, route, vehicle type, or shipping method? | |
| IMPORTANT | Who supplies or approves the insurance rate? | |
| IMPORTANT | Should insurance appear as a separate customer-facing line item? | |
| REQUIRED | Please confirm, replace, or reject the current 0.5% behavior. | |

## Insurance rate table

| Coverage / Vehicle Type | Route | Rate / Amount | Fixed or Percentage | Calculation Basis | Currency | Effective From | Effective To | Source | Included in CIF? |
|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | |
| | | | | | | | | | | |

# 10. Clearing / Terminal / Port Charges

The current application uses a clearing fee of ₦350,000 and a terminal fee of ₦180,000. These values require DMECH confirmation.

| Priority | Question | DMECH answer / notes |
|---|---|---|
| REQUIRED | What clearing charges should be included? | |
| REQUIRED | What terminal charges should be included? | |
| REQUIRED | Are charges fixed or variable? | |
| REQUIRED | Do charges vary by Nigerian port? | |
| IMPORTANT | Do charges vary by vehicle type, size, value, or shipping method? | |
| IMPORTANT | Are storage, handling, documentation, inspection, or agent charges separate? | |
| REQUIRED | Should these charges appear in the public calculator? | |
| REQUIRED | Please confirm, replace, or reject the current ₦350,000 clearing and ₦180,000 terminal values. | |

## Port charge table

| Charge Name | Port | Vehicle Type/Size | Amount / Rate | Fixed or Percentage | Currency | Calculation Basis | Effective From | Effective To | Source | Public Estimate? |
|---|---|---|---:|---|---|---|---|---|---|---|
| | | | | | | | | | | |
| | | | | | | | | | | |
| | | | | | | | | | | | |

# 11. Auction & Pre-Shipment Costs

The current application includes estimates for auction and pre-shipment costs. DMECH must confirm whether these belong in the public calculator and provide actual schedules where available.

| Priority | Question | DMECH answer / notes |
|---|---|---|
| REQUIRED | Which auction platforms are supported? | |
| REQUIRED | Should auction costs be included in the public landed-cost estimate? | |
| REQUIRED | What buyer-fee schedule applies to DMECH’s account? | |
| IMPORTANT | Are bidding, virtual-bid, gate, title, environmental, storage, or inspection fees charged? | |
| REQUIRED | How is inland transport from auction yard to export port calculated? | |
| IMPORTANT | Do fees vary by auction platform, bid amount, title status, yard, or route? | |
| IMPORTANT | Are auction costs pass-through costs or DMECH charges? | |
| IMPORTANT | Should each fee be displayed separately? | |
| REQUIRED | What should happen when the actual auction costs are not known? | |

## Auction and sourcing fee table

| Platform | Fee Name | Amount / Rate | Fixed, Tiered, or Percentage | Calculation Basis | Currency | Conditions | Effective From | Effective To | Source | Public Estimate? |
|---|---|---:|---|---|---|---|---|---|---|---|
| | | | | | | | | | | |
| | | | | | | | | | | | |
| | | | | | | | | | | | |

# 12. DMECH Service Fee

The current application uses an 8% DMECH service fee based on CIF. A related `dmech_service_fee_pct` setting also exists in the current platform configuration. Neither should be treated as approved policy without confirmation.

| Priority | Question | DMECH answer / notes |
|---|---|---|
| REQUIRED | Is the DMECH service fee percentage-based or fixed? | |
| REQUIRED | What is the fee amount or percentage? | |
| REQUIRED | What is the calculation base: purchase price, customs value, CIF, landed cost, or another value? | |
| IMPORTANT | Is there a minimum or maximum fee? | |
| IMPORTANT | Does it vary by vehicle type, category, customer, source country, or service package? | |
| REQUIRED | Should it be displayed separately? | |
| REQUIRED | Is it included in the customer’s definition of landed cost? | |
| IMPORTANT | Can staff change it without a developer? | |
| REQUIRED | Please confirm, replace, or reject the current 8% of CIF behavior. | |

# 13. Exchange Rate

The current application reads `ngn_usd_rate` from its platform configuration and uses a fallback value of 1,580 when configuration is unavailable. This is current implementation behavior, not a confirmed DMECH rate policy.

| Priority | Question | DMECH answer / notes |
|---|---|---|
| REQUIRED | Which exchange rate should the calculator use? | |
| REQUIRED | Is it a DMECH internal rate, customs rate, CBN rate, bank rate, market rate, or another rate? | |
| REQUIRED | Who owns and approves the rate? | |
| REQUIRED | Is the rate entered manually or retrieved automatically? | |
| IMPORTANT | How often does the rate change? | |
| REQUIRED | Should different costs use different exchange rates? | |
| REQUIRED | Should historical calculations preserve the rate used at the time? | |
| IMPORTANT | Should customers see the exchange rate? | |
| REQUIRED | Please confirm the intended use of the existing `ngn_usd_rate` configuration. | |

# 14. Exemptions & Special Cases

Please identify only the exceptions DMECH actually supports and provide the source or approval requirement for each.

| Priority | Special case | Does it exist? | Eligibility conditions | Calculation effect | Required documents | Authority/source |
|---|---|---|---|---|---|---|
| REQUIRED | EV exemption | | | | | |
| REQUIRED | Hybrid treatment/exemption | | | | | |
| IMPORTANT | Diplomatic vehicle | | | | | |
| IMPORTANT | Government vehicle | | | | | |
| IMPORTANT | Commercial vehicle | | | | | |
| IMPORTANT | Truck | | | | | |
| IMPORTANT | Bus | | | | | |
| IMPORTANT | Luxury/high-value vehicle | | | | | |
| OPTIONAL | Disability-related exemption | | | | | |
| OPTIONAL | Returning-resident exemption | | | | | |
| IMPORTANT | Age-based exemption or restriction | | | | | |
| IMPORTANT | Special-purpose vehicle | | | | | |
| IMPORTANT | Temporary policy exemption | | | | | |
| REQUIRED | Certificate-dependent exemption | | | | | |
| IMPORTANT | DMECH-specific commercial rule | | | | | |

# 15. Landed Cost Definition

The calculator needs a precise definition of what is included in “landed cost.”

| Priority | Question | Included? | DMECH notes |
|---|---|---:|---|
| REQUIRED | Vehicle purchase/acquisition cost | | |
| REQUIRED | Auction buyer fee | | |
| REQUIRED | Other auction fees | | |
| REQUIRED | Shipping/freight | | |
| REQUIRED | Marine insurance | | |
| REQUIRED | Customs/assessable value component | | |
| REQUIRED | Import duty | | |
| REQUIRED | Import levy | | |
| REQUIRED | VAT | | |
| REQUIRED | NAC | | |
| REQUIRED | CISS | | |
| REQUIRED | ETLS | | |
| REQUIRED | Surcharge | | |
| REQUIRED | Green/environmental charge | | |
| REQUIRED | Clearing | | |
| REQUIRED | Terminal | | |
| IMPORTANT | Storage | | |
| IMPORTANT | Documentation | | |
| IMPORTANT | Inland transport in Nigeria | | |
| REQUIRED | DMECH service fee | | |
| IMPORTANT | Registration/licensing | | |
| REQUIRED | Other costs | | |

Please also define the difference between:

- **Estimated landed cost**
- **Exact DMECH quote**
- **Customs-only cost**
- **Customer payable total**

# 16. Historical / Effective-Dated Rules

Please confirm how the calculator should handle changes to duty, taxes, customs values, shipping, insurance, exchange rates, and fees.

| Priority | Question | DMECH answer / notes |
|---|---|---|
| REQUIRED | Can a duty rule change over time for the same vehicle/year? | |
| REQUIRED | Can tax or levy rates change over time? | |
| REQUIRED | Can customs reference values change over time? | |
| IMPORTANT | Can shipping, insurance, port charges, or auction fees change over time? | |
| REQUIRED | Should every rule have an effective start date? | |
| IMPORTANT | Should rules have an expiry date? | |
| IMPORTANT | Are historical rules needed? | |
| IMPORTANT | Can future rules be scheduled? | |
| REQUIRED | Which date determines the rule: quote date, purchase date, shipment date, or clearance date? | |
| REQUIRED | If a customer receives a quote and the rule changes later, should the old quote preserve the old result? | |
| IMPORTANT | Should each calculation preserve the rule version, exchange rate, fees, and inputs used? | |
| REQUIRED | Who approves a new rule version? | |

## Effective-dated rule table

| Rule/Data Item | Version/Reference | Effective From | Effective To | Status | Approved By | Source Document | Notes |
|---|---|---|---|---|---|---|---|
| | | | | | | | |
| | | | | | | | |
| | | | | | | | |

# 17. Vehicle Master Dataset

Please provide the broadest approved vehicle dataset available. The current application’s catalog is a limited reference list and should not be treated as the complete DMECH vehicle master.

## Vehicle master data requested

| Priority | Field | Required? | DMECH response / source |
|---|---|---:|---|
| REQUIRED | Make | Yes | |
| REQUIRED | Model | Yes | |
| REQUIRED | Model year | Yes | |
| IMPORTANT | Manufacturing year | Confirm relevance | |
| IMPORTANT | Variant/trim | Confirm relevance | |
| IMPORTANT | Body type | Confirm relevance | |
| REQUIRED | Vehicle category/class | Confirm official terminology | |
| IMPORTANT | Fuel type | Confirm approved values | |
| IMPORTANT | Engine capacity in CC | Confirm relevance | |
| IMPORTANT | Engine type | Confirm relevance | |
| IMPORTANT | Source country | Confirm relevance | |
| IMPORTANT | Source region | Confirm relevance | |
| REQUIRED | Duty/tariff class or rule reference | Confirm source | |
| IMPORTANT | Customs/reference value | Confirm source | |
| REQUIRED | Active/inactive status | Confirm maintenance rule | |
| IMPORTANT | Effective From/To | Confirm historical need | |
| IMPORTANT | Source and notes | Confirm documentation standard | |
| OPTIONAL | Transmission | | |
| OPTIONAL | Drivetrain | | |
| OPTIONAL | Battery range | | |
| OPTIONAL | Manufacturer or external model code | | |

## Model coverage questions

| Priority | Question | DMECH answer / notes |
|---|---|---|
| REQUIRED | Does “all models” mean every global make/model, every model commonly imported into Nigeria, or every model DMECH supports? | |
| REQUIRED | Does DMECH already have a spreadsheet, database, or catalog that can be supplied? | |
| REQUIRED | Who maintains the vehicle master list? | |
| IMPORTANT | How are newly released models added? | |
| IMPORTANT | How are discontinued models handled? | |
| IMPORTANT | How are regional aliases or different model names handled? | |
| REQUIRED | Are all listed vehicles expected to have an approved duty rule? | |

# 18. Missing / Unsupported Vehicles

| Priority | Question | DMECH answer / notes |
|---|---|---|
| REQUIRED | What should happen when a selected vehicle has no approved duty rule? | |
| REQUIRED | Should the calculator block the estimate, show a request-for-quote option, or use a manual staff process? | |
| IMPORTANT | Should unsupported makes/models be captured for later addition? | |
| IMPORTANT | Who reviews requests for missing vehicles? | |
| IMPORTANT | What information must a customer provide for a manual quote? | |
| REQUIRED | Should the calculator ever display an estimated result when the applicable rule is unknown? | |

# 19. Rule Ownership & Approval

Please identify the owner of every category of business data.

| Data/rule category | Owner | Can edit? | Must approve? | Approval role | Review frequency | Change log required? |
|---|---|---|---|---|---|---|
| Vehicle master list | | | | | | |
| Duty classification | | | | | | |
| Customs/reference values | | | | | | |
| Taxes and levies | | | | | | |
| Exemptions | | | | | | |
| Shipping rates | | | | | | |
| Insurance rates | | | | | | |
| Clearing/terminal charges | | | | | | |
| Auction fees | | | | | | |
| DMECH service fee | | | | | | |
| Exchange rate | | | | | | |
| Effective dates | | | | | | |

# 20. Real-World Calculation Examples

Please provide complete expected results for the following examples. These examples are essential for validating the future calculator.

## HIGH-PRIORITY: Toyota Highlander 2019

| Item | Purchase price: $5,000 | Purchase price: $20,000 |
|---|---:|---:|
| Make | Toyota | Toyota |
| Model | Highlander | Highlander |
| Model year | 2019 | 2019 |
| Variant | | |
| Fuel type | | |
| Engine CC | | |
| Vehicle category/class | | |
| Condition | | |
| Source country | | |
| Shipping | | |
| Customs/assessable value | | |
| Applicable duty rule | | |
| Duty rate/type | | |
| Duty amount | | |
| Other taxes/levies | | |
| Clearing/terminal charges | | |
| DMECH service fee | | |
| Total landed cost | | |
| Does purchase price affect duty? Explain. | | |
| Source/document reference | | |

Please also provide expected treatment for these comparisons:

| Test case | Vehicle/scenario | Expected duty rule/result | Explanation/source |
|---|---|---|---|
| Same model, different years | Toyota Highlander 2018 vs 2019 | | |
| Same year, different models | Toyota Highlander 2019 vs Toyota Camry 2019 | | |
| Same model/year, different variants | Petrol vs hybrid or different trim | | |
| Petrol vs hybrid | Same make/model/year | | |
| EV vs non-EV | Comparable make/model/year | | |
| Different engine sizes | Same make/model/year where possible | | |
| New vs used | Same make/model/year where possible | | |
| Different source countries | Same make/model/year | | |
| Boundary year | Oldest/newest supported year | | |
| Boundary price | Any value threshold | | |
| Missing model | Unsupported vehicle | | |
| Special exemption | Approved exemption example | | |
| Rule change | Same vehicle before/after policy change | | |

# DOCUMENTS / FILES REQUESTED FROM DMECH

Please provide the following documents where they exist. If a document does not exist, please mark it **Not available** and provide the best available source or explanation.

## Required or strongly recommended

- [ ] Current approved duty/tariff table
- [ ] Vehicle master list containing make, model, year, and available variants
- [ ] Customs valuation or reference-value table
- [ ] Official vehicle classification/category list
- [ ] Current tax and levy schedules
- [ ] Calculation basis for every government charge
- [ ] EV, hybrid, petrol, and diesel treatment rules
- [ ] New/used vehicle definitions and rules
- [ ] Exemption and special-case documentation
- [ ] Shipping rate schedule by route, port, and method
- [ ] Insurance rate schedule or insurer documentation
- [ ] Clearing charge schedule
- [ ] Terminal and port charge schedule
- [ ] Auction and pre-shipment fee schedules
- [ ] DMECH service-fee policy
- [ ] Exchange-rate policy
- [ ] Effective dates for current rules
- [ ] Historical rule schedules, where available
- [ ] Existing calculator spreadsheet
- [ ] Existing DMECH import-cost worksheet
- [ ] Sample customer quotes
- [ ] Sample customs/import documents
- [ ] Sample real-world customs declarations
- [ ] Customs-agent calculations or worksheets

## Source and ownership information

- [ ] Source document for each duty rule
- [ ] Source document for each tax/levy rate
- [ ] Source of each customs/reference value
- [ ] Owner of each dataset
- [ ] Approval process for changes
- [ ] Review/update frequency

# DECISIONS DMECH MUST MAKE

Before development, DMECH must decide and document:

1. What determines duty.
2. What determines customs/assessable value.
3. Whether purchase price affects customs value, taxes, fees, or only acquisition cost.
4. What “vehicle year” means.
5. What “vehicle category,” “body type,” “vehicle class,” and “tariff class” mean.
6. Whether variant, engine, fuel type, condition, or source country affects any charge.
7. What “landed cost” includes.
8. Which costs are public estimates and which belong only in an exact quote.
9. How missing vehicles are handled.
10. How multiple variants are handled.
11. How exemptions and special cases are approved.
12. Whether old quotes preserve their original rules and rates.
13. Who owns and approves changes to each rule.
14. Whether rule changes require effective dates and historical versions.

# BLOCKERS BEFORE DEVELOPMENT

Implementation should not safely begin until these items are confirmed:

- [ ] Duty classification method
- [ ] Customs/assessable value method
- [ ] Toyota Highlander 2019 test cases at $5,000 and $20,000
- [ ] Initial approved vehicle master dataset
- [ ] Tax and levy rules with calculation bases
- [ ] EV, hybrid, petrol, and diesel rules
- [ ] New/used definitions and effects
- [ ] DMECH service-fee rule
- [ ] Exchange-rate policy
- [ ] Landed-cost definition
- [ ] Missing-vehicle behavior
- [ ] Multiple-variant behavior
- [ ] Exemptions and special cases
- [ ] Effective-date/versioning policy
- [ ] Official or approved source for each rule
- [ ] Rule ownership and approval process

# FINAL NOTE

Once DMECH provides the requested information, the technical team will use the approved business rules and datasets to design the calculator architecture and implementation plan. No unverified assumptions will be treated as final business rules.

# FINAL REVIEW SECTIONS

## A. CONFIRMED REQUIREMENTS

- Import duty must not simply be calculated from the customer’s actual purchase price.
- The applicable duty rule must be determined from the vehicle’s approved year/model treatment, subject to the additional classification information DMECH confirms.
- A 2019 Toyota Highlander should receive the same applicable duty rule at $5,000 and $20,000 when all other relevant classification conditions are the same.
- The future calculator should support broader vehicle coverage than the current limited static catalog.
- Vehicle make, model, year, category, body type, and duty classification must not be assumed to mean the same thing.

## B. BUSINESS DECISIONS REQUIRED

DMECH must decide and document:

- the exact duty classification method
- the customs/assessable value method
- the meaning of vehicle year
- whether category, body type, vehicle class, variant, engine, fuel, condition, or source country affects any charge
- the treatment of the Highlander 2019 test cases
- the applicable taxes, levies, exemptions, and calculation bases
- the definition of landed cost
- the DMECH service-fee policy
- the exchange-rate policy
- the behavior for missing or ambiguous vehicles
- the treatment of multiple variants
- the handling of rule changes and old quotes
- who owns and approves each rule

## C. DATA/DOCUMENTS REQUIRED FROM DMECH

- Approved duty/tariff rules or tables
- Customs valuation/reference-value data
- Initial vehicle master list
- Vehicle classification and category definitions
- Tax and levy schedules
- EV, hybrid, petrol, diesel, and new/used rules
- Shipping rate schedule
- Insurance schedule
- Clearing, terminal, and port charge schedule
- Auction and pre-shipment fee schedule
- DMECH service-fee policy
- Exchange-rate policy
- Exemption documentation
- Historical rule schedules, where available
- Existing calculator spreadsheets or worksheets
- Sample customer quotes
- Sample customs/import documents
- Source and approval information for each rule

## D. TECHNICAL DECISIONS WE SHOULD NOT MAKE YET

Until the business information is approved, the technical team should not:

- choose the final duty formula
- decide whether customs value is purchase-price-based or reference-value-based
- decide the final vehicle database fields
- create duty-rule tables or migrations
- replace the current calculation engine
- create new calculation APIs
- decide which rates are authoritative
- implement EV, hybrid, luxury, age, or other exemptions
- decide the final public landed-cost presentation
- assume that current code rates are correct

## E. PROPOSED NEXT STEP

The next phase should be a DMECH business-rule confirmation and data-intake review. DMECH should complete this questionnaire, attach the requested source files, and provide the real-world calculation examples. The technical team can then convert the approved answers into a technical design without carrying unverified assumptions into implementation.
