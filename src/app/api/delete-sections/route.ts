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

export async function DELETE(req: NextRequest, res: NextResponse) {
  await initAdmin();
  const ids: number[] = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { message: "Invalid or empty ID array provided" },
      { status: 400 },
    );
  }

  try {
    const firestore = getFirestore();
    const snapshot = await firestore.collection("sections").get();

    // Batch deletion of sections
    const batch = firestore.batch();

    // Delete each section by ID
    for (let index = 0; index < ids.length; index++) {
      const id = ids[index];
      const docId = snapshot.docs.find((d) => d.data().id === id)?.id;
      if (!docId) continue;
      batch.delete(firestore.collection("sections").doc(docId));
    }

    // Commit the batch delete
    await batch.commit();

    // Trigger the Pusher event for each deleted section ID
    ids.forEach((id) => {
      pusher.trigger("counter-channel", "section-deleted", {
        id: id,
      });
    });

    return NextResponse.json(
      { message: "Sections deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete sections", error },
      { status: 500 },
    );
  }
}
