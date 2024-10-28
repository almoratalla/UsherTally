import { initAdmin } from "@/utils/firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher";

// Interface for a counter section

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
});

export async function POST(req: NextRequest, res: NextResponse) {
    await initAdmin();
    const data = await req.json();
    const { id, count } = data;

    try {
        const firestore = getFirestore();
        const snapshot = await firestore.collection("sections").get();

        // Update Firestore document
        const docId = snapshot.docs.find((d) => d.data().id === id)?.id;
        if (!docId) throw "No doc Id";
        await firestore.collection("sections").doc(docId).update({ count });

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
