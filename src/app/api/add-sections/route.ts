import { initAdmin } from "@/utils/firebaseAdmin";
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
    data.forEach(({ id, name, count, projectName, capacity }) => {
      const docRef = sections.doc(); // Generate a new document reference
      batch.set(docRef, { id, name, count, projectName, capacity });
    });

    // Commit the batch write
    await batch.commit();

    // Trigger the Pusher event for each section
    data.forEach(({ id, name, lastModified, capacity }) => {
      pusher.trigger("counter-channel", "section-added", {
        id,
        name,
        lastModified,
        capacity,
      });
    });

    return NextResponse.json(
      { message: "Sections added successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to add sections", error },
      { status: 500 },
    );
  }
}
