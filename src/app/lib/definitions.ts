import { Timestamp } from "firebase-admin/firestore";
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

export interface FirestoreUser {
  uuid: string; // Firebase Auth UUID
  username: string;
  firstName: string;
  lastName: string;
  birthdate: Timestamp;
  type: "basic" | "premium";
  description: string;
  email: string;
  lastLoginDate: Timestamp;
  usernameLastModified: Timestamp;
}

export interface iActiveUser
  extends Omit<
    FirestoreUser,
    "birthdate" | "lastLoginDate" | "usernameLastModified"
  > {
  birthdate: Date;
  lastLoginDate: Date;
  usernameLastModified: Date;
}

// No dates added here, can be used by both client and server
export interface FirestorePreferences {
  language: string;
  theme: string;
  updateMs: number;
  uuid: string;
}
