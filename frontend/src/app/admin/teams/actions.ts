"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createTeam(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const seasonId = formData.get("seasonId") as string;

  if (!name) {
    throw new Error("Team name is required");
  }

  const team = await prisma.team.create({
    data: {
      name,
      logoUrl: logoUrl || null,
    },
  });

  if (seasonId) {
    await prisma.teamSeason.create({
      data: {
        teamId: team.id,
        seasonId,
      },
    });
  }

  revalidatePath("/admin/teams");
}

export async function deleteTeam(teamId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.team.delete({
    where: { id: teamId },
  });

  revalidatePath("/admin/teams");
}
