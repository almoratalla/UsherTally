import { initAdmin } from "@/utils/firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
    const data = await req.json();

    try {
        await initAdmin();
        const firestore = getFirestore();
        const reports = firestore.collection("reports");
        await reports.add(data);
        return Response.json({ message: "Report submitted" }, { status: 200 });
    } catch (error) {
        return Response.json(
            { message: "Failed to submit report", error },
            { status: 500 }
        );
    }
}
