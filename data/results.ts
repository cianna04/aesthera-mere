import type { StaticImageData } from "next/image";
import ultraBefore from "@/public/images/results/photos/ultraformer-01-before.webp";
import ultraAfter from "@/public/images/results/photos/ultraformer-01-after.webp";
import ultraFollowUp from "@/public/images/results/photos/ultraformer-01-follow-up.webp";
import ultraFrontBefore from "@/public/images/results/photos/ultraformer-02-before.webp";
import ultraFrontAfter from "@/public/images/results/photos/ultraformer-02-after.webp";
import ultraRightBefore from "@/public/images/results/photos/ultraformer-right-before.webp";
import ultraRightAfter from "@/public/images/results/photos/ultraformer-right-after.webp";
import ultraLeftBefore from "@/public/images/results/photos/ultraformer-left-before.webp";
import ultraLeftAfter from "@/public/images/results/photos/ultraformer-left-after.webp";
import foreheadBefore from "@/public/images/results/photos/botox-forehead-before.webp";
import foreheadAfter from "@/public/images/results/photos/botox-forehead-after.webp";
import frownBefore from "@/public/images/results/photos/botox-frown-before.webp";
import frownAfter from "@/public/images/results/photos/botox-frown-after.webp";
import peelBefore from "@/public/images/results/photos/body-peel-before.webp";
import peelAfter from "@/public/images/results/photos/body-peel-after.webp";
import noseBefore from "@/public/images/results/photos/nose-thread-before.webp";
import noseAfter from "@/public/images/results/photos/nose-thread-after.webp";
import juvelookBefore from "@/public/images/results/photos/juvelook-before.webp";
import juvelookAfter from "@/public/images/results/photos/juvelook-after.webp";
import namicaBefore from "@/public/images/results/photos/aptos-namica-before.webp";
import namicaAfter from "@/public/images/results/photos/aptos-namica-after.webp";
import evsBefore from "@/public/images/results/photos/aptos-evs-before.webp";
import evsAfter from "@/public/images/results/photos/aptos-evs-after.webp";

export const resultsSource = "https://www.canva.com/design/DAHbd0CCIT8/fpu1wCdH52TcnZ8J5yXveg/edit";

export type ResultPhoto = {
  before: StaticImageData;
  after: StaticImageData;
  view: string;
  layout?: "stacked";
};
export type TreatmentResult = {
  id: string;
  title: string;
  photos: ResultPhoto[];
  sourcePages: number[];
  labelEvidence: string;
  referenceOnly?: boolean;
};

// Individual photo files downloaded from the COPY, not page screenshots.
// Processing is limited to orientation, separating existing photo montages,
// resizing, and compression. Original source files are retained outside Git.
// Preserve source-provided privacy blurs; do not infer treatments from appearance.
export const treatmentResults: TreatmentResult[] = [
  {
    id: "ultraformer-01", title: "Ultraformer MPT", sourcePages: [48, 49, 53, 54, 55],
    labelEvidence: "Pages 48–49 and 53/55 explicitly say ‘of Ultraformer MPT’.",
    photos: [
      { before: ultraBefore, after: ultraAfter, view: "Front comparison" },
      { before: ultraBefore, after: ultraFollowUp, view: "Additional front comparison" },
    ],
  },
  {
    id: "ultraformer-02", title: "Ultraformer MPT", sourcePages: [74, 75, 78, 79],
    labelEvidence: "Pages 74 and 78 explicitly name Ultraformer MPT; 75/79 are the matching side views.",
    photos: [
      { before: ultraFrontBefore, after: ultraFrontAfter, view: "Front view" },
      { before: ultraRightBefore, after: ultraRightAfter, view: "Right angled view" },
      { before: ultraLeftBefore, after: ultraLeftAfter, view: "Left angled view" },
    ],
  },
  {
    id: "botox-forehead", title: "Botox", sourcePages: [92, 97],
    labelEvidence: "The Botox source sequence 91–98 includes these forehead comparisons. Original montage has AFTER above BEFORE, so its halves are assigned accordingly.",
    photos: [{ before: foreheadBefore, after: foreheadAfter, view: "Forehead", layout: "stacked" }],
  },
  {
    id: "botox-frown", title: "Botox", sourcePages: [93, 96],
    labelEvidence: "Pages 93 and 96 explicitly say ‘Botox can help with’ next to these photos.",
    photos: [{ before: frownBefore, after: frownAfter, view: "Frown lines", layout: "stacked" }],
  },
  {
    id: "body-peel", title: "Thera Korean Body Peel", sourcePages: [151, 156],
    labelEvidence: "Exact treatment name printed on pages 151 and 156. Do not assume it is interchangeable with a differently named treatment-menu item.",
    photos: [{ before: peelBefore, after: peelAfter, view: "Back skin" }],
  },
  {
    id: "nose-thread", title: "Nose Thread Lift", sourcePages: [232, 246, 251],
    labelEvidence: "Page 232 describes a ‘thread lift’ for the ‘nose bridge’ and ‘tip’; 246/251 reuse the same photo pair.",
    photos: [{ before: noseBefore, after: noseAfter, view: "Side profile" }],
  },
  {
    id: "juvelook", title: "Juvelook", sourcePages: [165],
    labelEvidence: "Page 165 explicitly says ‘Book your Juvelook consultation’ below this pair.",
    photos: [{ before: juvelookBefore, after: juvelookAfter, view: "Front view" }],
  },
  {
    id: "aptos-namica", title: "APTOS Namica", sourcePages: [234], referenceOnly: true,
    labelEvidence: "Original photo asset explicitly says APTOS NAMICA and carries another clinic’s logo. Reference imagery, not confirmed Aesthera patient results.",
    photos: [{ before: namicaBefore, after: namicaAfter, view: "Angled view" }],
  },
  {
    id: "aptos-evs", title: "APTOS EVs", sourcePages: [235], referenceOnly: true,
    labelEvidence: "Original photo asset explicitly says APTOS EVS and carries another clinic’s logo. Reference imagery, not confirmed Aesthera patient results.",
    photos: [{ before: evsBefore, after: evsAfter, view: "Angled view" }],
  },
];
