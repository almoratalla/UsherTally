// import { db } from "@/utils/firebase";
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
  const data = await req.json();
  const { sectionId, rows, columns, seats } = data;

  try {
    // Trigger a Pusher event
    await pusher.trigger("seat-map-channel", "seat-map-updated", {
      sectionId,
      rows,
      columns,
      seats,
    });

    return Response.json({ message: "Section added" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { message: "Failed to add section", error },
      { status: 500 },
    );
  }
}
