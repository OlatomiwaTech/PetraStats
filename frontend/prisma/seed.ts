import { PrismaClient, Role, EventType, MatchStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User", "Season", "Team", "TeamSeason", "Player", "Match", "MatchEvent", "GoalkeeperStats" CASCADE;`);

  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@petrastats.com",
      name: "Petra Admin",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const season = await prisma.season.create({
    data: {
      name: "Petra League 2025",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-06-30"),
      isCurrent: true,
    },
  });

  const teamA = await prisma.team.create({
    data: { name: "Petra Lions FC" },
  });

  const teamB = await prisma.team.create({
    data: { name: "Petra Eagles FC" },
  });

  await prisma.teamSeason.createMany({
    data: [
      { teamId: teamA.id, seasonId: season.id },
      { teamId: teamB.id, seasonId: season.id },
    ],
  });

  const p1 = await prisma.player.create({
    data: { name: "Ahmad Hassan", number: 10, position: "Forward", teamId: teamA.id },
  });
  const p2 = await prisma.player.create({
    data: { name: "Omar Tariq", number: 8, position: "Midfielder", teamId: teamA.id },
  });
  const gkA = await prisma.player.create({
    data: { name: "Kareem Zein", number: 1, position: "Goalkeeper", teamId: teamA.id, isGoalkeeper: true },
  });

  const p3 = await prisma.player.create({
    data: { name: "Sami Nader", number: 9, position: "Forward", teamId: teamB.id },
  });
  const gkB = await prisma.player.create({
    data: { name: "Zaid Salem", number: 1, position: "Goalkeeper", teamId: teamB.id, isGoalkeeper: true },
  });

  const match = await prisma.match.create({
    data: {
      seasonId: season.id,
      homeTeamId: teamA.id,
      awayTeamId: teamB.id,
      homeScore: 2,
      awayScore: 1,
      matchDate: new Date("2025-02-15T18:00:00Z"),
      status: MatchStatus.COMPLETED,
    },
  });

  await prisma.matchEvent.createMany({
    data: [
      { matchId: match.id, type: EventType.GOAL, minute: 14, playerId: p1.id, assistPlayerId: p2.id },
      { matchId: match.id, type: EventType.GOAL, minute: 40, playerId: p3.id },
      { matchId: match.id, type: EventType.GOAL, minute: 78, playerId: p2.id, assistPlayerId: p1.id },
      { matchId: match.id, type: EventType.YELLOW_CARD, minute: 82, playerId: p3.id },
    ],
  });

  await prisma.goalkeeperStats.createMany({
    data: [
      { matchId: match.id, playerId: gkA.id, saves: 4, goalsConceded: 1, cleanSheet: false },
      { matchId: match.id, playerId: gkB.id, saves: 6, goalsConceded: 2, cleanSheet: false },
    ],
  });

  console.log("Database seeded successfully. Admin created:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
