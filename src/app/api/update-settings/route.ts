import { FirestoreUser } from "@/app/lib/definitions";
import { initAdmin } from "@/utils/firebaseAdmin";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.json();

  await initAdmin();
  try {
    const { id, payload } = data;
    const firestore = getFirestore();
    const snapshot = await firestore.collection("users").get();
    const usersDocs = snapshot.docs.map((doc) => ({
      ...doc.data(),
    }));
    const users = (usersDocs as FirestoreUser[]).map((doc) => {
      return {
        ...doc,
        birthdate: doc.birthdate.toDate(),
        lastLoginDate: doc.lastLoginDate.toDate(),
        usernameLastModified: doc.usernameLastModified.toDate(),
      };
    });
    return Response.json({ data: users }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Failed to update settings", error },
      { status: 500 },
    );
  }
}
