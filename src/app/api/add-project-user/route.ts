import { initAdmin } from "@/utils/firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { arrayUnion } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    await initAdmin();
    const data: {
      projectId: string;
      uid: string;
      name: string;
      email: string;
      role: "Admin" | "Moderator" | "Member";
    } = await req.json();

    const firestore = getFirestore();
    const usersSnapshot = await firestore.collection("users").get();

    const userDoc = usersSnapshot.docs.find((d) => d.data().uuid === data.uid);
    if (!userDoc?.id) throw "No user for doc Id";

    const projects = firestore.collection("projects");
    const projectsSnapshot = await projects.get();

    const projectDoc = projectsSnapshot.docs.find(
      (d) => d.data().projectId === data.projectId,
    );
    if (!projectDoc?.id) throw "No project for doc Id";

    const projectMembers: {
      uid: string;
      name: string;
      email: string;
      role: "Admin" | "Moderator" | "Member";
    }[] = projectsSnapshot.docs
      .map((doc) => ({ members: doc.data().members }))
      .map((d) => d.members);

    if (!projectMembers.find((d) => d.uid === data.uid)) {
      await projects.doc(projectDoc.id).update({
        members: [
          {
            uid: data.uid,
            name: data.name,
            email: data.email,
            role: data.role,
          },
        ],
      });
    } else {
      await projects.doc(projectDoc.id).update({
        members: [
          projectMembers.map((d) =>
            d.uid === data.uid
              ? {
                  uid: data.uid,
                  name: data.name,
                  email: data.email,
                  role: data.role,
                }
              : d,
          ),
        ],
      });
    }

    const rolesAndPerms = await firestore.collection("rolesAndPerms").get();
    const roleDoc = rolesAndPerms.docs.find((d) => d.data().uid === data.uid);
    if (!roleDoc?.id) {
      await firestore.collection("rolesAndPerms").add({
        email: data.email,
        uid: userDoc.id,
        projectMapping: {
          projectId: data.projectId,
          role: data.role,
          permissions: { all: true },
        },
      });
    } else {
      const projectMap: {
        projectId: string;
        role: string;
        permissions: Record<string, boolean>;
      } = roleDoc
        .data()
        ?.projectMapping.find(
          (p: {
            projectId: string;
            role: string;
            permissions: Record<string, boolean>;
          }) => p.projectId === data.projectId,
        );
      if (!projectMap) {
        await firestore
          .collection("rolesAndPerms")
          .doc(roleDoc.id)
          .update({
            projectMapping: arrayUnion({
              projectId: data.projectId,
              role: data.role,
              permissions: { all: true },
            }),
          });
      } else {
        await firestore
          .collection("rolesAndPerms")
          .doc(roleDoc.id)
          .update(
            roleDoc
              .data()
              ?.projectMapping.map(
                (p: {
                  projectId: string;
                  role: string;
                  permissions: Record<string, boolean>;
                }) =>
                  p.projectId === data.projectId
                    ? {
                        projectId: data.projectId,
                        role: data.role,
                        permissions: { all: true },
                      }
                    : p,
              ),
          );
      }
    }

    return Response.json({ message: "User added to project" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { message: "Failed to add user to project" },
      { status: 500 },
    );
  }
}
