import { FirestoreUser } from "@/app/lib/definitions";
import { initAdmin } from "@/utils/firebaseAdmin";
import { getAuth, UserRecord } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

const createNewUser = (data: UserRecord) => {
    return {
        uuid: data.uid,
        username: data.displayName,
        firstName: data.displayName?.split(" ")[0],
        lastName: data.displayName?.split(" ")[1],
        birthdate: Timestamp.fromDate(new Date()),
        type: "basic",
        description: "",
        email: data.email,
        lastLoginDate: Timestamp.fromDate(new Date()),
        usernameLastModified: Timestamp.fromDate(new Date()),
    } as FirestoreUser;
};

export async function GET(req: NextRequest, res: NextResponse) {
    const uid = req.headers.get("x-tally-id");
    await initAdmin();
    try {
        if (!uid) throw "No uid";
        const data = await getAuth().getUser(uid);
        const firestore = getFirestore();
        const snapshot = firestore.collection("users");
        const users = await snapshot.get();
        const docId = users.docs.find((d) => d.data().uuid === data.uid);
        const newUser = createNewUser(data);
        if (!docId) {
            await snapshot.add(newUser);
        }
        return Response.json(
            {
                uid: data.uid,
                user: docId ?? {
                    ...newUser,
                    birthdate: newUser.birthdate.toDate(),
                    lastLoginDate: newUser.lastLoginDate.toDate(),
                    usernameLastModified: newUser.usernameLastModified.toDate(),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return Response.json(
            { message: "Failed to check auth", error },
            { status: 500 }
        );
    }
}
