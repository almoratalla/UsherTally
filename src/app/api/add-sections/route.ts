import { initAdmin } from "@/utils/firebaseAdmin";
import { createLayout, removeUndefined } from "@/utils/functions";
import { getFirestore } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
});

interface AddSectionsData {
    id: number;
    name: string;
    count: number;
    projectName: string;
    lastModified: Date;
    capacity?: number;
    layout?: number[][];
}

export async function POST(req: NextRequest, res: NextResponse) {
    await initAdmin();
    const data: AddSectionsData[] = await req.json();

    try {
        const firestore = getFirestore();
        const sections = firestore.collection("sections");

        // Batch addition of sections
        const batch = firestore.batch();

        // Add each section in the data array to Firestore
        data.forEach(({ id, name, count, projectName, capacity, layout }) => {
            const docRef = sections.doc(); // Generate a new document reference
            const perfectSquare = Math.ceil(Math.sqrt(capacity || 0));
            const defaultLayout = layout ?? createLayout(capacity ?? 0);

            const batchData = removeUndefined({
                id,
                name,
                count,
                projectName,
                capacity,
                rowsCount: perfectSquare,
                columnsCount: perfectSquare,
                layout: JSON.stringify(defaultLayout),
            });
            batch.set(docRef, batchData);
        });

        // Commit the batch write
        await batch.commit();

        // Trigger the Pusher event for each section
        data.forEach(({ id, name, lastModified, capacity, layout }) => {
            const perfectSquare = Math.ceil(Math.sqrt(capacity || 0));
            const defaultLayout = layout ?? createLayout(capacity ?? 0);
            pusher.trigger(
                "counter-channel",
                "section-added",
                removeUndefined({
                    id,
                    name,
                    lastModified,
                    capacity,
                    rowsCount: perfectSquare,
                    columnsCount: perfectSquare,
                    layout: JSON.stringify(defaultLayout),
                })
            );
        });

        return NextResponse.json(
            { message: "Sections added successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Failed to add sections", error },
            { status: 500 }
        );
    }
}
