// import { db } from "@/utils/firebase";
// import {
//     collection,
//     doc,
//     getDocs,
//     query,
//     updateDoc,
//     where,
// } from "firebase/firestore";
import { initAdmin } from "@/utils/firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher";

// Interface for a counter section
interface Section {
    id: number;
    count: number;
    name: string;
}

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
});

interface PusherData {
    count: number;
}

export async function POST(req: NextRequest, res: NextResponse) {
    await initAdmin();
    const data = await req.json();
    const { id, count } = data;

    try {
        const firestore = getFirestore();
        const snapshot = await firestore.collection("sections").get();

        // Update Firestore document
        // const sectionsRef = collection(db, "sections");
        // const snapshot = await getDocs(sectionsRef);
        const docId = snapshot.docs.find((d) => d.data().id === id)?.id;
        if (!docId) throw "No doc Id";
        await firestore.collection("sections").doc(docId).update({ count });
        // const docRef = doc(db, "sections", docId);
        // await updateDoc(docRef, { count });
        // update

        // Trigger a Pusher event
        await pusher.trigger("counter-channel", "count-updated", {
            id,
            count,
        });

        return Response.json({ message: "Count updated" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return Response.json(
            { message: "Failed to update count", error },
            { status: 500 }
        );
    }
}

// export async function GET() {
//     await initAdmin();
//     const sectionsRef = collection(db, "sections");
//     console.log(sectionsRef);
//     const snapshot = await getDocs(sectionsRef);
//     const sectionsData: Section[] = snapshot.docs.map((doc) => ({
//         id: doc.data().id,
//         count: doc.data().count,
//         name: doc.data().name,
//     }));
//     try {

//     } catch (error) {

//     }
// }
