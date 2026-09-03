export interface AcademyProgramme {
  slug: string;
  code: string;
  title: string;
  summary: string;
  audience: string;
  focus: string[];
  outcomes: string[];
  practical: string;
  modules: string[];
  prerequisites: string;
  format: string;
  status: "concept";
}

export const PROGRAMMES: AcademyProgramme[] = [
  {
    slug: "high-voltage-safety-ev-systems",
    code: "ACD-HV-01",
    title: "High-Voltage Safety & EV Systems",
    summary: "Build a disciplined foundation for understanding EV and hybrid systems, their hazards, and the checks that come before intervention.",
    audience: "Technicians and workshop professionals developing EV and hybrid capability.",
    focus: ["HV hazards and isolation", "Battery architecture and BMS", "Charging and thermal systems", "Inverter and converter fundamentals"],
    outcomes: ["Recognise high-voltage hazards", "Follow a controlled diagnostic sequence", "Explain the main EV system blocks", "Document findings and limits of proof"],
    practical: "Workshop-led exercises connect system theory to controlled inspection and diagnostic practice.",
    modules: ["Safety and energy control", "Battery and BMS architecture", "Contactors, interlocks and insulation", "Charging, inverter and thermal systems", "Hybrid system overview", "Emergency response principles"],
    prerequisites: "Technical experience is recommended. DMECH will confirm entry requirements for each cohort.",
    format: "Practical technical programme with guided workshop learning.",
    status: "concept",
  },
  {
    slug: "diagnostic-method",
    code: "ACD-DX-02",
    title: "Diagnostic Method",
    summary: "Learn a repeatable method for moving from a customer symptom to evidence, a repair scope, and a verified result.",
    audience: "Technicians, apprentices, and workshop professionals who want a more structured diagnostic method.",
    focus: ["Customer intake", "Codes and live data", "Mechanical and electrical testing", "Evidence-based reporting"],
    outcomes: ["Choose the right diagnostic instrument", "Test to eliminate possibilities", "Write findings another technician can follow", "Quote from evidence and state what is not proven"],
    practical: "Learners work through guided fault-finding exercises and practise reporting what the evidence actually supports.",
    modules: ["Structured intake", "Scan data and freeze frames", "Test selection", "Mechanical and electrical tests", "Findings and quoting", "Verification and handover"],
    prerequisites: "Suitable for technicians and serious entrants; final cohort requirements are to be confirmed by DMECH.",
    format: "Workshop-first diagnostic method programme.",
    status: "concept",
  },
  {
    slug: "combustion-overhaul-practical",
    code: "ACD-OH-03",
    title: "Combustion Overhaul Practical",
    summary: "A practical route through pre-strip diagnosis, measurement, specification, controlled assembly, and documented first start.",
    audience: "Technicians with a foundation in combustion systems who want structured overhaul practice.",
    focus: ["Pre-strip diagnosis", "Measurement and specification", "Assembly and torque", "First start and handover"],
    outcomes: ["Plan an overhaul from evidence", "Separate reuse, machining, and replacement decisions", "Apply measurement and torque discipline", "Record the work and verify the result"],
    practical: "The programme uses supervised practical work to connect teardown, inspection, assembly, and verification.",
    modules: ["Pre-strip assessment", "Removal and inspection", "Measurement decisions", "Head, timing and lubrication", "Assembly and torque", "Cooling, first start and run-in"],
    prerequisites: "Prior combustion-system experience is recommended; DMECH will confirm suitability before enrollment.",
    format: "Supervised practical workshop programme.",
    status: "concept",
  },
];

export function getProgramme(slug: string) {
  return PROGRAMMES.find((programme) => programme.slug === slug);
}
