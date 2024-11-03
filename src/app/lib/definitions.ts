import { DocumentData } from "firebase/firestore";

export interface Section {
    id: number;
    count: number;
    name: string;
    projectName: string;
    lastModified: Date;
}

type SectionCountRecord = Record<string, number>;
export type ProjectSectionCountsRecord = Record<string, SectionCountRecord>;

export interface iTrackUpdates extends DocumentData {
    day: number;
    counts: ProjectSectionCountsRecord;
}
