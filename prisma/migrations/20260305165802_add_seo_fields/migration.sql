-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "bannerImage" TEXT,
ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT;
