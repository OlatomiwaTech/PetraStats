"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createPlayer(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const number = parseInt(formData.get("number") as string, 10);
  const position = formData.get("position") as string;
  const teamId = formData.get("teamId") as string;
  const isGoalkeeper = formData.get("isGoalkeeper") === "true";

  if (!name || isNaN(number) || !position || !teamId) {
    throw new Error("Invalid player data");
  }

  await prisma.player.create({
    data: {
      name,
      number,
      position,
      teamId,
      isGoalkeeper,
    },
  });

  revalidatePath("/admin/players");
}

export async function deletePlayer(playerId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.player.delete({
    where: { id: playerId },
  });

  revalidatePath("/admin/players");
}
