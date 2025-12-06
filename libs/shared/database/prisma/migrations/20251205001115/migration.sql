/*
  Warnings:

  - The values [HOD,STAFF,STUDENT,ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'ADMIN_STAFF', 'HR', 'RECRUITER', 'ORG_ADMIN', 'ORG_STAFF', 'ORG_STUDENT', 'ORG_EMPLOYEE', 'ORG_HEAD', 'ORG_MANAGEMENT', 'PRINCIPAL');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;
