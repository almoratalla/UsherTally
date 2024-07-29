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
    const { id, name } = data;
    console.log("hello", data);

    // Trigger an event to notify all clients of the new section
    await pusher.trigger("counter-channel", "section-renamed", {
        id,
        name,
    });

    return Response.json({ message: "Section renamed successfully" });

    //   res.setHeader('Allow', ['POST']);
    //   res.status(405).end(`Method ${req.method} Not Allowed`);
}
