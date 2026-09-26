"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { EventType, MatchStatus } from "@prisma/client";

export async function addMatchEvent(matchId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const type = formData.get("type") as EventType;
  const minute = parseInt(formData.get("minute") as string, 10);
  const playerId = formData.get("playerId") as string;
  const assistPlayerId = (formData.get("assistPlayerId") as string) || null;

  if (!type || isNaN(minute) || !playerId) {
    throw new Error("Invalid event data");
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    throw new Error("Player not found");
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    throw new Error("Match not found");
  }

  await prisma.matchEvent.create({
    data: {
      matchId,
      type,
      minute,
      playerId,
      assistPlayerId: type === EventType.GOAL ? assistPlayerId : null,
    },
  });

  if (type === EventType.GOAL) {
    if (player.teamId === match.homeTeamId) {
      await prisma.match.update({
        where: { id: matchId },
        data: { homeScore: { increment: 1 } },
      });
    } else if (player.teamId === match.awayTeamId) {
      await prisma.match.update({
        where: { id: matchId },
        data: { awayScore: { increment: 1 } },
      });
    }
  }

  revalidatePath(`/admin/matches/${matchId}/events`);
  revalidatePath(`/admin/matches`);
  revalidatePath(`/leaderboard`);
}

export async function deleteMatchEvent(eventId: string, matchId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const event = await prisma.matchEvent.findUnique({
    where: { id: eventId },
    include: { player: true },
  });

  if (!event) return;

  if (event.type === EventType.GOAL) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (match) {
      if (event.player.teamId === match.homeTeamId) {
        await prisma.match.update({
          where: { id: matchId },
          data: { homeScore: { decrement: 1 } },
        });
      } else if (event.player.teamId === match.awayTeamId) {
        await prisma.match.update({
          where: { id: matchId },
          data: { awayScore: { decrement: 1 } },
        });
      }
    }
  }

  await prisma.matchEvent.delete({ where: { id: eventId } });

  revalidatePath(`/admin/matches/${matchId}/events`);
  revalidatePath(`/admin/matches`);
  revalidatePath(`/leaderboard`);
}

export async function updateGoalkeeperStats(matchId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const playerId = formData.get("playerId") as string;
  const saves = parseInt(formData.get("saves") as string, 10);
  const goalsConceded = parseInt(formData.get("goalsConceded") as string, 10);
  const cleanSheet = formData.get("cleanSheet") === "true";

  if (!playerId || isNaN(saves) || isNaN(goalsConceded)) {
    throw new Error("Invalid goalkeeper stats data");
  }

  await prisma.goalkeeperStats.upsert({
    where: {
      matchId_playerId: { matchId, playerId },
    },
    update: {
      saves,
      goalsConceded,
      cleanSheet,
    },
    create: {
      matchId,
      playerId,
      saves,
      goalsConceded,
      cleanSheet,
    },
  });

  revalidatePath(`/admin/matches/${matchId}/events`);
  revalidatePath(`/leaderboard`);
}

export async function updateMatchStatus(matchId: string, status: MatchStatus) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { status },
  });

  revalidatePath(`/admin/matches/${matchId}/events`);
  revalidatePath(`/admin/matches`);
  revalidatePath(`/leaderboard`);
}
