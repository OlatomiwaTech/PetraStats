"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createMatch(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const seasonId = formData.get("seasonId") as string;
  const homeTeamId = formData.get("homeTeamId") as string;
  const awayTeamId = formData.get("awayTeamId") as string;
  const matchDateStr = formData.get("matchDate") as string;

  if (!seasonId || !homeTeamId || !awayTeamId || !matchDateStr) {
    throw new Error("Missing required match fields");
  }

  if (homeTeamId === awayTeamId) {
    throw new Error("Home and Away team cannot be the same");
  }

  await prisma.match.create({
    data: {
      seasonId,
      homeTeamId,
      awayTeamId,
      matchDate: new Date(matchDateStr),
      status: "SCHEDULED",
    },
  });

  revalidatePath("/admin/matches");
}

export async function deleteMatch(matchId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.match.delete({
    where: { id: matchId },
  });

  revalidatePath("/admin/matches");
}
