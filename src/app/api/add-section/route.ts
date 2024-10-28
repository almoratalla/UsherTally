import { db } from "@/utils/firebase";
import { initAdmin } from "@/utils/firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { addDoc, collection } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
});

interface AddSectionData {
    id: number;
}

export async function POST(req: NextRequest, res: NextResponse) {
    await initAdmin();
    const data = await req.json();
    const { id, name } = data;

    try {
        const firestore = getFirestore();
        const sections = await firestore.collection("sections");

        // Add a new section to Firestore
        await sections.add({ id, name, count: 0 });

        // Trigger an event to notify all clients of the new section
        pusher.trigger("counter-channel", "section-added", { id, name });

        return Response.json({ message: "Section added" }, { status: 200 });
    } catch (error) {
        return Response.json(
            { message: "Failed to add section", error },
            { status: 500 }
        );
    }
}
