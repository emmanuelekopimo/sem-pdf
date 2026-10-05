import { agriculture } from "./agriculture";
import { computerScience } from "./computer-science";
import { economics } from "./economics";
import { environment, general } from "./environment-general";
import { health } from "./health";
import { engineering, law } from "./law-engineering";
import type { SeedDoc } from "./types";

export type { SeedDoc };

export const DEMO_USER = { name: "Adaeze Okafor", email: "demo@sempdf.app", password: "demo1234" };
export const SECOND_USER = { name: "Tunde Bakare", email: "tunde@sempdf.app", password: "tunde1234" };

export const DEMO_DOCUMENTS: SeedDoc[] = [
  ...computerScience,
  ...agriculture,
  ...economics,
  ...health,
  ...law,
  ...engineering,
  ...environment,
  ...general,
];

/** Image-only uploads with no text layer: they show the "No text found" problem state. */
export const SCANNED_DOCUMENTS = [
  { title: "Scanned Lecture Handout Week 3", filename: "scan-lecture-handout-week3.pdf", collection: "Computer Science", pages: 2, daysAgo: 13 },
  { title: "Photographed Past Questions ECO 301", filename: "photo-past-questions-eco301.pdf", collection: "Economics", pages: 3, daysAgo: 0 },
];

/** Tunde only gets engineering material, which proves searches are scoped per user. */
export const SECOND_USER_DOCUMENTS: SeedDoc[] = engineering.slice(0, 2).map((d) => ({ ...d, daysAgo: d.daysAgo - 1 }));

/**
 * Saved searches for the demo user: [query, days ago, extra runs on later days].
 * Natural questions that rarely share exact words with the documents, so the
 * history shows what semantic matching finds that keyword search would miss.
 */
export const DEMO_SEARCHES: [string, number, number[]][] = [
  ["best time to plant corn", 51, [44, 20]],
  ["how do I stop my chickens from dying", 32, [3]],
  ["what should I do if someone is choking", 0, []],
  ["why is food so expensive in the market", 11, [2, 0]],
  ["can my landlord throw me out without notice", 22, [9]],
  ["how do computers talk to each other", 36, []],
  ["protecting myself from internet fraud", 5, [1]],
  ["mosquito bites and fever in children", 58, [41]],
  ["how to make money from catfish", 18, []],
  ["what makes a building fall down", 33, [12]],
  ["central bank raising interest rates to fight inflation", 56, [30, 6]],
  ["how to keep tomatoes fresh during transport", 3, []],
  ["sorting algorithms and searching quickly", 57, []],
  ["how does a neural network learn", 44, [14]],
  ["measuring how similar two sentences are", 43, [0]],
  ["rights of a person arrested by police", 7, []],
  ["solar panels for a small shop", 49, [25]],
  ["cheap healthy meals for students", 28, [10]],
  ["feeling anxious before exams", 14, [1]],
  ["clean drinking water in villages", 8, []],
  ["flooding along the Niger river", 46, []],
  ["trees to stop the desert spreading", 30, []],
  ["plastic bottles and recycling", 16, []],
  ["pollution from crude oil", 4, []],
  ["how to register for courses", 55, [40, 27]],
  ["writing a literature review", 25, []],
  ["starting a small business with little money", 10, [3]],
  ["keeping records for my shop", 23, []],
  ["loans for market women", 47, []],
  ["government borrowing and debt", 34, []],
  ["regression analysis assumptions", 1, []],
  ["avoiding deadlock in programs", 29, []],
  ["version control and teamwork", 20, []],
  ["presenting a final year project", 19, [2]],
  ["how to treat a burn", 0, []],
  ["vaccines for babies", 43, []],
  ["fertiliser for poor soil", 26, [5]],
  ["fall armyworm damage", 50, []],
  ["cassava disease with yellow leaves", 59, [37]],
  ["normalising database tables", 39, []],
  ["making database queries faster", 38, [13]],
  ["what is overfitting", 44, []],
  ["breach of contract remedies", 37, []],
  ["fundamental human rights in the constitution", 54, []],
  ["traffic jams in Lagos", 15, []],
  ["motor speed control to save energy", 2, []],
  ["concrete mix ratio", 33, []],
  ["weak naira and import prices", 52, [21]],
  ["digital lenders harassing borrowers", 46, []],
  ["value added tax sharing", 33, []],
  ["climate change effects on farmers", 45, []],
  ["gas flaring health effects", 4, []],
  ["hostel rules", 54, []],
  ["plagiarism penalties", 24, []],
  ["primary health centres lack staff", 42, []],
  ["polio eradication", 41, []],
  ["day old chicks temperature", 31, []],
  ["storing maize to avoid aflatoxin", 48, []],
  ["composting kitchen waste", 25, [16]],
  ["password tips", 6, []],
  ["public wifi safety", 5, []],
  ["bail conditions for serious offences", 7, []],
  ["batteries for solar inverters", 49, []],
  ["IP addresses running out", 35, []],
  ["memory paging and thrashing", 28, []],
  ["hash collisions", 56, []],
  ["shortest path on a road map", 53, []],
  ["unit tests versus end to end tests", 20, []],
  ["seasonal food price changes", 11, []],
  ["mediation for tenant disputes", 21, []],
  // Problem cases: nothing in the library is about these.
  ["premier league transfer news", 18, []],
  ["jollof rice recipe", 9, []],
  ["asdfgh", 27, []],
];

export const SECOND_USER_SEARCHES: [string, number, number[]][] = [
  ["sizing a solar system", 40, []],
  ["why do buildings collapse", 20, [4]],
];
