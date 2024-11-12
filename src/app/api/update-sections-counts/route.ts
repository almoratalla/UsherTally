import { Section, SectionStore } from "@/app/lib/definitions";
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
  const updates: SectionStore[] = await req.json();

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json(
      { message: "Invalid or empty ID array provided" },
      { status: 400 },
    );
  }

  try {
    const firestore = getFirestore();
    const snapshot = await firestore.collection("sections").get();

    // Batch update of sections
    const batch = firestore.batch();

    for (let index = 0; index < updates.length; index++) {
      const update = updates[index];
      const docId = snapshot.docs.find((d) => d.data().id === update.id)?.id;
      if (!docId) continue;
      batch.update(firestore.collection("sections").doc(docId), {
        count: update.count,
        lastModified: new Date(),
        capacity: update.capacity,
        layout: update.layout,
      });
    }

    await batch.commit();

    // Trigger a Pusher event
    updates.forEach((update) => {
      pusher.trigger("counter-channel", "count-updated", {
        id: update.id,
        count: update.count,
        capacity: update.capacity,
        layout: JSON.parse(update.layout),
      });
    });

    return Response.json({ message: "Count updated" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { message: "Failed to update count", error },
      { status: 500 },
    );
  }
}
