import { db } from "@/utils/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
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
  const data = await req.json();
  const { id, count } = data;

  try {
    // Update Firestore document
    const sectionsRef = collection(db, "sections");
    const snapshot = await getDocs(sectionsRef);
    const docId = snapshot.docs.find((d) => d.data().id === id)?.id;
    if (!docId) throw "No doc Id";
    const docRef = doc(db, "sections", docId);
    await updateDoc(docRef, { count });

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
      { status: 500 },
    );
  }
}
