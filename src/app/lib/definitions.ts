import { DocumentData } from "firebase/firestore";

export interface Section {
    id: number;
    count: number;
    name: string;
    projectName: string;
    lastModified: Date;
    capacity?: number;
    layout?: number[][];
}

export interface SectionStore extends Omit<Section, "layout"> {
    layout: string;
}

type SectionCountRecord = Record<string, number>;
export type ProjectSectionCountsRecord = Record<string, SectionCountRecord>;

export interface iTrackUpdates extends DocumentData {
    day: number;
    counts: ProjectSectionCountsRecord;
}
