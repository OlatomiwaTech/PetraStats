"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createSeason(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const isCurrent = formData.get("isCurrent") === "true";

  if (!name || !startDateStr || !endDateStr) {
    throw new Error("Missing required fields");
  }

  if (isCurrent) {
    await prisma.season.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });
  }

  await prisma.season.create({
    data: {
      name,
      startDate: new Date(startDateStr),
      endDate: new Date(endDateStr),
      isCurrent,
    },
  });

  revalidatePath("/admin/seasons");
}

export async function deleteSeason(seasonId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.season.delete({
    where: { id: seasonId },
  });

  revalidatePath("/admin/seasons");
}
