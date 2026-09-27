import prisma from '../lib/prisma.js';

export const getSeasons = async () => {
  return await prisma.season.findMany({
    orderBy: { startDate: 'desc' },
  });
};

export const getSeasonById = async (id: string) => {
  return await prisma.season.findUnique({
    where: { id },
  });
};

export const createSeason = async (data: { name: string; startDate: Date; endDate: Date; isCurrent: boolean }) => {
  return await prisma.season.create({
    data,
  });
};
