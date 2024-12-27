import { ProfileFormValues } from "@/app/components/settings/ProfileSettingsForm";
import {
  FirestorePreferences,
  FirestoreUser,
  iActiveUser,
} from "@/app/lib/definitions";
import { initAdmin } from "@/utils/firebaseAdmin";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export const convertActiveUserToFireStoreUser = (
  activeUser: iActiveUser,
): FirestoreUser => {
  try {
    const returnFireStoreUser = Object.create(null);
    if (activeUser.birthdate) {
      returnFireStoreUser.birthdate = Timestamp.fromDate(activeUser.birthdate);
    }
    if (activeUser.lastLoginDate) {
      returnFireStoreUser.lastLoginDate = Timestamp.fromDate(
        activeUser.lastLoginDate,
      );
    }
    if (activeUser.usernameLastModified) {
      returnFireStoreUser.usernameLastModified = Timestamp.fromDate(
        activeUser.usernameLastModified,
      );
    }
    return {
      ...activeUser,
      ...returnFireStoreUser,
    };
  } catch (error) {
    return activeUser as unknown as FirestoreUser;
  }
};

export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.json();

  await initAdmin();
  try {
    const { id, payload, preferences } = data as {
      id: string;
      payload: Partial<iActiveUser>;
      preferences?: Partial<FirestorePreferences>;
    };
    const firestore = getFirestore();
    const usersSnapshot = await firestore.collection("users").get();
    const preferencesSnapshot = await firestore.collection("preferences").get();
    // const usersDocs = snapshot.docs.map((doc) => ({
    //     ...doc.data(),
    // }));
    // const users = (usersDocs as FirestoreUser[]).map((doc) => {
    //     return {
    //         ...doc,
    //         birthdate: doc.birthdate.toDate(),
    //         lastLoginDate: doc.lastLoginDate.toDate(),
    //         usernameLastModified: doc.usernameLastModified.toDate(),
    //     };
    // });
    const userDocId = usersSnapshot.docs.find((d) => d.data().uuid === id)?.id;
    if (!userDocId) throw "No doc Id";

    const preferenceDocId = preferencesSnapshot.docs.find(
      (d) => d.data().uuid === id,
    )?.id;
    if (!preferenceDocId) {
      await firestore.collection("preferences").add({
        uuid: id,
        language: preferences?.language ?? "en",
        theme: preferences?.theme ?? "light",
        updateMs: preferences?.updateMs ?? 3000,
      });
    } else {
      await firestore
        .collection("preferences")
        .doc(preferenceDocId)
        .update(preferences as unknown as Record<string, unknown>);
    }

    if (payload) {
      const fireStoreUserUpdate = convertActiveUserToFireStoreUser(
        payload as unknown as iActiveUser,
      );
      await firestore
        .collection("users")
        .doc(userDocId)
        .update(fireStoreUserUpdate as unknown as Record<string, unknown>);
    }

    return Response.json({ data: { payload, preferences } }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Failed to update settings", error },
      { status: 500 },
    );
  }
}
