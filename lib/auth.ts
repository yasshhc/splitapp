import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
  const name = `${clerkUser?.firstName ?? ""} ${clerkUser?.lastName ?? ""}`.trim();

  // Try to find user by clerkId first
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (user) {
    return user;
  }

  // If not found by clerkId, try to find by email and link the clerkId
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUserByEmail) {
    // Update existing user to link their clerkId
    return prisma.user.update({
      where: { email },
      data: { clerkId: userId },
    });
  }

  // Create new user if neither clerkId nor email exists
  return prisma.user.create({
    data: { clerkId: userId, email, name },
  });
}
