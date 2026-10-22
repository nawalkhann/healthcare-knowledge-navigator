// Topic pages: short, cited summaries of what current guidelines say.
// Every point must be traceable to a listed source. Review dates are shown on the page.

export type TopicSource = { label: string; url: string };
export type Topic = {
  slug: string;
  title: string; // page H1 and <title>, under 60 characters
  description: string; // meta description, under 155 characters
  keywords: string[];
  reviewed: string; // ISO date the summary was checked against its sources
  summary: string;
  sections: { heading: string; points: string[] }[];
  faq: { question: string; answer: string }[];
  sources: TopicSource[];
  askExample: string;
};

export const topics: Topic[] = [
  {
    slug: "hypertension-first-line-treatment",
    title: "First-line treatment for hypertension in adults",
    description:
      "When to start drug treatment for hypertension, which drug classes are first line, and the blood pressure targets in the WHO 2021 guideline.",
    keywords: ["hypertension first-line treatment", "WHO hypertension guideline", "antihypertensive drug classes", "blood pressure target"],
    reviewed: "2026-10-22",
    summary:
      "The WHO 2021 guideline recommends starting drug treatment at a confirmed blood pressure of 140/90 mmHg or higher, using any of three first-line drug classes, and suggests starting with a single-pill combination.",
    sections: [
      {
        heading: "When to start drug treatment",
        points: [
          "Start drug treatment for confirmed hypertension with systolic BP of 140 mmHg or more, or diastolic BP of 90 mmHg or more (strong recommendation).",
          "Treat people with existing cardiovascular disease when systolic BP is 130 to 139 mmHg (strong recommendation).",
          "Treatment is suggested at systolic BP 130 to 139 mmHg for people without cardiovascular disease who have high cardiovascular risk, diabetes or chronic kidney disease (conditional recommendation).",
        ],
      },
      {
        heading: "First-line drug classes",
        points: [
          "Any of these three classes can be used first line: thiazide or thiazide-like diuretics, ACE inhibitors or angiotensin receptor blockers, and long-acting dihydropyridine calcium channel blockers (strong recommendation).",
          "Initial combination therapy is suggested, preferably as a single-pill combination to improve adherence (conditional recommendation).",
        ],
      },
      {
        heading: "Targets and follow-up",
        points: [
          "Target below 140/90 mmHg in people without comorbidities (strong recommendation).",
          "Target systolic BP below 130 mmHg in people with known cardiovascular disease (strong), and consider it for other high-risk patients (conditional).",
          "Follow up monthly after starting or changing treatment until the target is reached, then every 3 to 6 months (conditional).",
        ],
      },
    ],
    faq: [
      {
        question: "What is the first-line drug for hypertension?",
        answer:
          "The WHO 2021 guideline lists three equally acceptable first-line classes: thiazide or thiazide-like diuretics, ACE inhibitors or ARBs, and long-acting dihydropyridine calcium channel blockers.",
      },
      {
        question: "Should hypertension treatment start with one drug or two?",
        answer: "WHO suggests starting with a combination of two first-line drugs, preferably in a single pill, to improve adherence.",
      },
    ],
    sources: [
      { label: "WHO. Guideline for the pharmacological treatment of hypertension in adults, 2021", url: "https://www.who.int/publications/i/item/9789240033986" },
      { label: "WHO 2021 guideline executive summary (NCBI Bookshelf)", url: "https://www.ncbi.nlm.nih.gov/books/NBK573629/" },
    ],
    askExample: "What is the first-line drug treatment for hypertension in adults?",
  },
  {
    slug: "uncomplicated-cystitis-treatment-women",
    title: "Treating uncomplicated cystitis in women",
    description:
      "First-line antibiotics and durations for acute uncomplicated cystitis in women, and why fluoroquinolones are not first line, per IDSA/ESCMID guidance.",
    keywords: ["uncomplicated cystitis treatment", "UTI antibiotics women", "nitrofurantoin 5 days", "IDSA UTI guideline"],
    reviewed: "2026-10-22",
    summary:
      "IDSA/ESCMID guidance lists nitrofurantoin for 5 days, trimethoprim-sulfamethoxazole for 3 days, single-dose fosfomycin, or pivmecillinam where available as first-line options for uncomplicated cystitis in women.",
    sections: [
      {
        heading: "First-line options",
        points: [
          "Nitrofurantoin for 5 days.",
          "Trimethoprim-sulfamethoxazole for 3 days.",
          "Fosfomycin as a single dose.",
          "Pivmecillinam for 3 to 7 days, where available.",
        ],
      },
      {
        heading: "Agents to reserve",
        points: [
          "Fluoroquinolones are highly effective but are not first line for cystitis, because of collateral damage such as selection of resistant organisms.",
          "Other oral beta-lactams are less effective and should be used only when the preferred agents are not suitable; amoxicillin or ampicillin should not be used empirically.",
        ],
      },
      {
        heading: "Diagnosis and bacteriuria",
        points: [
          "In healthy, non-pregnant, premenopausal women with classic symptoms, uncomplicated UTI can often be diagnosed from history and examination alone (CDC).",
          "Asymptomatic bacteriuria generally does not need treatment, except in specific circumstances such as pregnancy (CDC).",
        ],
      },
    ],
    faq: [
      {
        question: "How long should nitrofurantoin be given for cystitis?",
        answer: "IDSA/ESCMID guidance recommends a 5-day course of nitrofurantoin for acute uncomplicated cystitis in women.",
      },
      {
        question: "Should asymptomatic bacteriuria be treated?",
        answer: "Generally no. CDC notes it does not usually need treatment except in specific circumstances, such as pregnancy.",
      },
    ],
    sources: [
      {
        label: "Gupta K, et al. IDSA/ESCMID guidelines for acute uncomplicated cystitis and pyelonephritis in women. Clin Infect Dis. 2011;52(5):e103-e120 (summary)",
        url: "https://www.the-hospitalist.org/hospitalist/article/125290/guidelines-treatment-uncomplicated-cystitis-and-pyelonephritis-healthy",
      },
      { label: "CDC. Clinical overview of urinary tract infections", url: "https://www.cdc.gov/uti/hcp/clinical-overview/index.html" },
    ],
    askExample: "What is the first-line antibiotic for uncomplicated cystitis in women?",
  },
  {
    slug: "community-acquired-pneumonia-outpatient-antibiotics",
    title: "Outpatient antibiotics for community-acquired pneumonia",
    description:
      "Empiric outpatient antibiotics for community-acquired pneumonia in adults and the minimum treatment duration, from the 2019 ATS/IDSA guideline.",
    keywords: ["community-acquired pneumonia antibiotics", "CAP treatment duration", "ATS IDSA pneumonia guideline", "outpatient pneumonia treatment"],
    reviewed: "2026-10-22",
    summary:
      "The 2019 ATS/IDSA guideline recommends amoxicillin, doxycycline or (with caveats) a macrolide for healthy outpatients, broader regimens for people with comorbidities, and at least 5 days of treatment.",
    sections: [
      {
        heading: "Healthy adults without comorbidities",
        points: [
          "Amoxicillin, doxycycline, or a macrolide (azithromycin or clarithromycin) as monotherapy.",
          "Use a macrolide only where local pneumococcal macrolide resistance is below 25%.",
        ],
      },
      {
        heading: "Adults with comorbidities",
        points: [
          "A respiratory fluoroquinolone alone (levofloxacin, moxifloxacin or gemifloxacin), or",
          "Amoxicillin-clavulanate or a cephalosporin, combined with a macrolide or doxycycline.",
        ],
      },
      {
        heading: "Duration",
        points: [
          "Treat for at least 5 days and until the patient is clinically stable (normal vital signs, able to eat, normal mental status).",
          "Treat suspected or proven MRSA or Pseudomonas aeruginosa pneumonia for 7 days.",
        ],
      },
    ],
    faq: [
      {
        question: "How long should antibiotics be given for community-acquired pneumonia?",
        answer: "At least 5 days and until clinical stability, per the 2019 ATS/IDSA guideline. Most patients are stable within 48 to 72 hours.",
      },
    ],
    sources: [
      {
        label: "Metlay JP, et al. Diagnosis and treatment of adults with community-acquired pneumonia. Am J Respir Crit Care Med. 2019;200(7):e45-e67 (summary)",
        url: "https://www.uspharmacist.com/article/updated-clinical-practice-guidelines-for-communityacquired-pneumonia",
      },
    ],
    askExample: "How long should antibiotics be given for community-acquired pneumonia?",
  },
  {
    slug: "sepsis-initial-management",
    title: "Initial management of sepsis and septic shock",
    description:
      "Antibiotic timing, fluids, vasopressors, blood pressure target and steroids in adult sepsis, from the Surviving Sepsis Campaign 2021 guidelines.",
    keywords: ["sepsis management guidelines", "Surviving Sepsis Campaign 2021", "sepsis antibiotics within 1 hour", "septic shock vasopressor"],
    reviewed: "2026-10-22",
    summary:
      "The Surviving Sepsis Campaign 2021 guidelines recommend antimicrobials within 1 hour when shock or sepsis is likely, at least 30 mL/kg of crystalloid for hypoperfusion, norepinephrine first line, and a MAP target of 65 mmHg.",
    sections: [
      {
        heading: "Antimicrobial timing",
        points: [
          "Septic shock or high likelihood of sepsis: give antimicrobials immediately, ideally within 1 hour of recognition (strong recommendation).",
          "Possible sepsis without shock: assess rapidly and, if infection remains likely, give antimicrobials within 3 hours (weak recommendation).",
        ],
      },
      {
        heading: "Fluids and vasopressors",
        points: [
          "For sepsis-induced hypoperfusion or septic shock, give at least 30 mL/kg of IV crystalloid within the first 3 hours (weak recommendation); crystalloids are first-line fluids (strong).",
          "Norepinephrine is the first-line vasopressor (strong recommendation).",
          "Aim for an initial mean arterial pressure of 65 mmHg in septic shock (strong recommendation).",
        ],
      },
      {
        heading: "Steroids and screening",
        points: [
          "IV corticosteroids are suggested for septic shock with an ongoing vasopressor requirement (weak recommendation).",
          "Do not use qSOFA alone as a screening tool, compared with SIRS, NEWS or MEWS (strong recommendation).",
        ],
      },
    ],
    faq: [
      {
        question: "How quickly should antibiotics be given in sepsis?",
        answer:
          "Within 1 hour of recognition for septic shock or probable sepsis, and within 3 hours for possible sepsis without shock if infection remains likely.",
      },
      {
        question: "What is the first-line vasopressor in septic shock?",
        answer: "Norepinephrine, per the Surviving Sepsis Campaign 2021 guidelines.",
      },
    ],
    sources: [
      {
        label: "Evans L, et al. Surviving Sepsis Campaign: international guidelines for management of sepsis and septic shock 2021. Crit Care Med. 2021;49(11):e1063-e1143",
        url: "https://sccm.org/sepsisguidelines",
      },
      { label: "CDC. Caring for patients with sepsis", url: "https://www.cdc.gov/sepsis/hcp/clinical-care/index.html" },
    ],
    askExample: "How quickly should antibiotics be given in sepsis?",
  },
  {
    slug: "heart-failure-reduced-ejection-fraction-medications",
    title: "Medications for heart failure with reduced ejection fraction",
    description:
      "The four drug classes of guideline-directed therapy for HFrEF and where SGLT2 inhibitors fit, from the 2022 AHA/ACC/HFSA heart failure guideline.",
    keywords: ["HFrEF medications", "guideline-directed medical therapy heart failure", "SGLT2 inhibitors heart failure", "AHA ACC heart failure guideline"],
    reviewed: "2026-10-22",
    summary:
      "The 2022 AHA/ACC/HFSA guideline defines guideline-directed medical therapy for HFrEF as four drug classes, with an ARNi preferred for renin-angiotensin inhibition and SGLT2 inhibitors given a Class 1 recommendation.",
    sections: [
      {
        heading: "The four drug classes for HFrEF",
        points: [
          "Renin-angiotensin system inhibition: an ARNi is recommended first (Class 1), or an ACE inhibitor or ARB.",
          "An evidence-based beta blocker.",
          "A mineralocorticoid receptor antagonist.",
          "An SGLT2 inhibitor, recommended in symptomatic chronic HFrEF to reduce hospitalisation and cardiovascular death, with or without type 2 diabetes (Class 1).",
        ],
      },
      {
        heading: "Mildly reduced and preserved ejection fraction",
        points: ["SGLT2 inhibitors can be beneficial in HFmrEF and HFpEF (Class 2a)."],
      },
    ],
    faq: [
      {
        question: "What are the four pillars of HFrEF therapy?",
        answer:
          "Renin-angiotensin inhibition (preferably an ARNi), a beta blocker, a mineralocorticoid receptor antagonist and an SGLT2 inhibitor.",
      },
    ],
    sources: [
      {
        label: "ACC. 2022 AHA/ACC/HFSA Heart Failure Guideline: key perspectives",
        url: "https://www.acc.org/latest-in-cardiology/ten-points-to-remember/2022/03/29/19/53/2022-aha-acc-hfsa-heart-failure-guideline-gl-hf",
      },
    ],
    askExample: "Which medications reduce mortality in heart failure with reduced ejection fraction?",
  },
];

export const getTopic = (slug: string) => topics.find((t) => t.slug === slug);
