import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';

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
    console.log('hello', data)

    pusher.trigger('counter-channel', 'count-updated', {
        id,
        count,
    });

    return Response.json({ message: 'Count updated' });

//   res.setHeader('Allow', ['POST']);
//   res.status(405).end(`Method ${req.method} Not Allowed`);
}