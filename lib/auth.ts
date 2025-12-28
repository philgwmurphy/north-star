import { auth, currentUser } from "@clerk/nextjs/server";

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return { userId };
}

export async function getUser() {
  const user = await currentUser();
  return user;
}

export async function getUserId() {
  const { userId } = await auth();
  return userId;
}
