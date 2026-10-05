import type { SeedDoc } from "./types";

export const law: SeedDoc[] = [
  {
    title: "Nigerian Constitutional Law Overview",
    filename: "constitutional-law-overview.pdf",
    collection: "Law",
    author: "Faculty of Law, University of Lagos",
    daysAgo: 55,
    sections: [
      [
        "The 1999 Constitution",
        `The Constitution of the Federal Republic of Nigeria 1999, as amended, is the supreme law of the country. Any law that conflicts with it is void to the extent of the conflict. It sets up a federal system with a federal government, state governments and local governments.

Powers are divided into the exclusive legislative list, on which only the National Assembly can make laws, and the concurrent list, on which both the National Assembly and state Houses of Assembly can legislate.`,
      ],
      [
        "Separation of powers",
        `The legislature makes laws, the executive carries them out and the judiciary interprets them. Each arm checks the others. The President can veto bills, the National Assembly can override a veto with a two thirds majority, and the courts can declare actions unconstitutional.

Judges enjoy security of tenure so that they can decide cases without fear of losing their jobs for ruling against the government.`,
      ],
      [
        "Fundamental human rights",
        `Chapter Four guarantees rights including the right to life, dignity, personal liberty, fair hearing, private and family life, freedom of thought and religion, freedom of expression, peaceful assembly and freedom of movement.

A person whose rights have been or are likely to be breached can apply to a High Court for enforcement under the Fundamental Rights Enforcement Procedure Rules. Courts have awarded damages against police officers for unlawful detention.`,
      ],
      [
        "Fundamental objectives",
        `Chapter Two sets out fundamental objectives and directive principles of state policy, such as free education where practicable, adequate medical facilities and a clean environment.

Section 6(6)(c) makes these objectives non justiciable, meaning citizens cannot generally sue the government to enforce them. However, courts have held that they become enforceable when the National Assembly passes a specific law on the subject.`,
      ],
    ],
  },
  {
    title: "Law of Contract Study Notes",
    filename: "law-of-contract-notes.pdf",
    collection: "Law",
    author: "Barr. Uchenna Nwosu, Nnamdi Azikiwe University",
    daysAgo: 38,
    sections: [
      [
        "Formation of a contract",
        `A valid contract requires an offer, an acceptance of that exact offer, consideration, an intention to create legal relations and capacity of the parties. An advertisement is usually an invitation to treat, not an offer, so a shop can refuse to sell at a mistakenly displayed price.

Acceptance must be communicated to the person making the offer. Silence is not acceptance. Under the postal rule, a letter of acceptance takes effect when it is posted, not when it arrives.`,
      ],
      [
        "Consideration",
        `Consideration is something of value that each party gives in exchange for the other's promise. It need not be adequate but must be sufficient in law. Paying N1,000 for a car can be valid consideration if both parties agree, because courts do not judge whether a bargain was wise.

A promise to do something you are already legally bound to do is generally not good consideration.`,
      ],
      [
        "Terms and breach",
        `Conditions are essential terms; breaching a condition allows the innocent party to end the contract and claim damages. Warranties are less important terms; breaching a warranty allows only a claim for damages.

When a tenant fails to pay rent or a contractor abandons a building project, the other party can sue for breach of contract. Damages aim to put the innocent party in the position they would have been in if the contract had been performed.`,
      ],
      [
        "Vitiating factors",
        `A contract may be void or voidable because of misrepresentation, mistake, duress or undue influence. A buyer who was induced to purchase land by a false statement that the land had a certificate of occupancy can ask the court to set the contract aside.

Contracts for illegal purposes are void and will not be enforced by the courts.`,
      ],
    ],
  },
  {
    title: "Tenancy and Landlord Rights in Lagos",
    filename: "tenancy-landlord-lagos.pdf",
    collection: "Law",
    author: "Legal aid leaflet, Lagos State Ministry of Justice",
    daysAgo: 23,
    sections: [
      [
        "The tenancy agreement",
        `A tenancy agreement should state the rent in Naira, the duration, who pays for repairs and service charges, and how either party can end the tenancy. Always get a written agreement and a receipt for every payment.

Under the Lagos State Tenancy Law, it is unlawful for a landlord to demand more than one year's rent in advance from a sitting tenant, or more than one year's rent from a new tenant for a monthly tenancy.`,
      ],
      [
        "Notice to quit",
        `A landlord must serve a proper notice to quit before recovering possession. The length depends on the type of tenancy: one week for a weekly tenancy, one month for a monthly tenancy and six months for a yearly tenancy.

After the notice expires, the landlord must serve a notice of intention to recover possession, usually seven days, and then go to court. Locking out a tenant, removing the roof or throwing out property without a court order is unlawful.`,
      ],
      [
        "Disputes and help",
        `Tenants and landlords can resolve many disputes at the Lagos Multi Door Courthouse through mediation, which is faster and cheaper than full court proceedings.

People who cannot afford a lawyer can approach the Office of the Public Defender or the Legal Aid Council for free assistance.`,
      ],
    ],
  },
  {
    title: "Introduction to Criminal Procedure",
    filename: "criminal-procedure-intro.pdf",
    collection: "Law",
    author: "Nigerian Law School revision notes",
    daysAgo: 8,
    sections: [
      [
        "Arrest and detention",
        `The Administration of Criminal Justice Act 2015 governs criminal procedure in federal courts and has been adopted by most states. A person arrested must be told the reason for the arrest and must be treated humanely.

A suspect must be brought before a court within a reasonable time, generally within twenty four hours where a court is within forty kilometres, or forty eight hours otherwise. Arresting a relative in place of a wanted suspect is prohibited.`,
      ],
      [
        "Bail",
        `Bail allows a defendant to remain free while awaiting trial, on conditions such as sureties or reporting to the police. The presumption of innocence means bail should not be refused simply as punishment.

For serious offences such as murder, bail is granted only in exceptional circumstances. Courts consider the risk that the defendant will flee, interfere with witnesses or commit another offence.`,
      ],
      [
        "Trial",
        `The prosecution must prove the guilt of the defendant beyond reasonable doubt. The defendant has the right to a lawyer, to be present at the trial, to call witnesses and to cross examine prosecution witnesses.

Plea bargaining is permitted under the Act, allowing a defendant to plead guilty to a lesser offence in exchange for a lighter sentence, subject to the court's approval.`,
      ],
    ],
  },
];

export const engineering: SeedDoc[] = [
  {
    title: "Solar Power Systems Design",
    filename: "solar-power-systems-design.pdf",
    collection: "Engineering",
    author: "Department of Electrical Engineering, University of Nigeria Nsukka",
    daysAgo: 50,
    sections: [
      [
        "Sizing the load",
        `Start by listing every appliance, its power rating in watts and the hours it runs each day. A small shop in Enugu with six LED bulbs, a fan, a laptop and a fridge might use about four kilowatt hours per day.

Multiply power by hours to get daily energy use in watt hours, then add about twenty five percent for losses in cables, the inverter and the batteries.`,
      ],
      [
        "Choosing panels",
        `Nigeria receives roughly four to six peak sun hours per day, with higher values in the north. Divide the daily energy requirement by the peak sun hours to find the required panel capacity.

Mount panels facing south at an angle close to the site's latitude, about seven degrees in Lagos and twelve degrees in Kano. Keep panels clean, because harmattan dust can cut output significantly.`,
      ],
      [
        "Batteries and inverters",
        `Batteries store energy for use at night and during cloudy days. Lithium iron phosphate batteries cost more than lead acid batteries but last many more cycles and can be discharged more deeply.

The inverter converts direct current from the batteries to alternating current for household appliances. Choose an inverter rated above the highest combined load that will run at the same time, including the starting surge of motors in fridges and pumps.`,
      ],
      [
        "Costs and savings",
        `A small home system can cost several hundred thousand Naira to a few million Naira, depending on size and battery type. The main saving comes from buying less petrol or diesel for generators, whose prices rose sharply after subsidy removal.

Mini grids powered by solar now supply rural communities that are far from the national grid, with customers paying through prepaid meters.`,
      ],
    ],
  },
  {
    title: "Concrete Technology and Building Failures",
    filename: "concrete-building-failures.pdf",
    collection: "Engineering",
    author: "Nigerian Society of Engineers, Lagos branch",
    daysAgo: 34,
    sections: [
      [
        "Concrete basics",
        `Concrete is a mixture of cement, fine aggregate, coarse aggregate and water. A common nominal mix for structural work is one part cement, two parts sand and four parts granite, with just enough water to make it workable.

Too much water makes concrete easier to place but greatly reduces its strength. Concrete must be cured by keeping it moist for at least seven days so that the cement can hydrate properly.`,
      ],
      [
        "Why buildings collapse",
        `Building collapses in Lagos and other cities are usually caused by a combination of poor quality materials, inadequate design, use of unqualified builders, lack of supervision and adding extra floors without approval.

Using sand with too much silt or clay, reducing the number or size of reinforcement bars, and removing formwork too early all weaken structures.`,
      ],
      [
        "Testing and control",
        `Slump tests on site check the workability of fresh concrete. Cube tests, in which concrete samples are crushed after seven and twenty eight days, confirm that the concrete reaches the specified strength.

Regulators such as the Lagos State Building Control Agency require approved drawings, registered professionals and stage inspections. Owners who cut corners to save money risk lives and heavy penalties.`,
      ],
    ],
  },
  {
    title: "Road Transport and Traffic Engineering",
    filename: "traffic-engineering.pdf",
    collection: "Engineering",
    author: "Department of Civil Engineering, Ahmadu Bello University",
    daysAgo: 16,
    sections: [
      [
        "Traffic flow",
        `Traffic flow is described by three related quantities: flow, the number of vehicles passing a point per hour; density, the number of vehicles per kilometre; and speed. As density rises, speed falls, and beyond a critical density flow collapses into a traffic jam.

Many Nigerian cities experience long jams because road capacity has not kept pace with the growth in vehicles, and because of poorly managed junctions, roadside trading and broken down vehicles.`,
      ],
      [
        "Junction design",
        `Roundabouts work well when traffic volumes are moderate and evenly balanced. Signalised junctions with properly timed traffic lights handle heavier flows. Flyovers and interchanges separate conflicting movements but are expensive.

Simple measures such as clear lane markings, pedestrian crossings, removal of illegal parking and enforcement by traffic officers can significantly improve flow at low cost.`,
      ],
      [
        "Public transport",
        `Bus rapid transit systems, such as the BRT corridors in Lagos, move many more people per lane than private cars. Rail lines such as the Lagos Blue Line and the Abuja light rail further reduce road congestion.

Integrating buses, rail and ferries with a single payment card makes public transport more attractive and reduces the number of private cars on the road.`,
      ],
    ],
  },
  {
    title: "Electric Motors and Drives",
    filename: "electric-motors-drives.pdf",
    collection: "Engineering",
    author: "Mechanical and Electrical Workshop Manual, Yaba College of Technology",
    daysAgo: 3,
    sections: [
      [
        "Induction motors",
        `The three phase induction motor is the most common motor in industry because it is simple, rugged and cheap. A rotating magnetic field in the stator induces current in the rotor, and the interaction produces torque.

The rotor always turns slightly slower than the rotating field. This difference, called slip, is usually a few percent at full load.`,
      ],
      [
        "Starting methods",
        `Starting a large motor directly on line draws a current several times its rated current, which can cause voltage dips that affect other equipment. Star delta starters and soft starters reduce the starting current.

Variable frequency drives control motor speed by changing the supply frequency. They save a great deal of energy on pumps and fans that do not need to run at full speed all the time.`,
      ],
      [
        "Maintenance",
        `Keep motors clean and well ventilated, because overheating is the main cause of insulation failure. Check bearings for noise and vibration, and lubricate them according to the manufacturer's schedule.

Measure insulation resistance periodically with a megger. Falling readings warn of moisture or contamination before the motor fails completely.`,
      ],
    ],
  },
];
