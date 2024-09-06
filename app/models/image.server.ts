import type { User, Image } from "@prisma/client";

import { prisma } from "~/db.server";

export function getImage({
  id,
  userId,
}: Pick<Image, "id"> & {
  userId: User["id"];
}) {
  return prisma.image.findFirst({
    select: { id: true, originalUrl: true, bgRemovedUrl: true },
    where: { id, userId },
  });
}

export function getImageListItems({ userId }: { userId: User["id"] }) {
  return prisma.image.findMany({
    where: { userId },
    select: { id: true, originalUrl: true, bgRemovedUrl: true },
    // orderBy: { updatedAt: "desc" },
  });
}

export function createImage({
  originalUrl,
  userId,
}: Pick<Image, "originalUrl"> & {
  userId: User["id"];
}) {
  return prisma.image.create({
    data: {
      originalUrl,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function updateImageBgRemoved({
  id,
  bgRemovedUrl,
  userId,
}: Pick<Image, "id" | "bgRemovedUrl"> & {
  userId: User["id"];
}) {
  return prisma.image.updateMany({
    where: { id, userId },
    data: { bgRemovedUrl },
  });
}

export function deleteImage({
  id,
  userId,
}: Pick<Image, "id"> & { userId: User["id"] }) {
  return prisma.image.deleteMany({
    where: { id, userId },
  });
}