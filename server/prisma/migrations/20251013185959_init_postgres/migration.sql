-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MENTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserAvailability" AS ENUM ('ONLINE', 'BUSY', 'LEARNING', 'OFFLINE');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'EXPERT');

-- CreateEnum
CREATE TYPE "SkillVisibility" AS ENUM ('PUBLIC', 'FOLLOWERS', 'SUBSCRIBERS', 'PRIVATE');

-- CreateEnum
CREATE TYPE "SessionMode" AS ENUM ('ONLINE', 'IN_PERSON', 'HYBRID');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MentorshipStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MentorshipSessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "MentorshipType" AS ENUM ('ONE_TO_ONE', 'GROUP', 'BOOTCAMP');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_FOLLOWER', 'SESSION_REQUEST', 'SESSION_RESPONSE', 'PROJECT_UPDATE', 'NEW_REVIEW', 'SKILL_MATCH', 'CREDIT_RECEIVED', 'MILESTONE_DUE', 'PROMOTION');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('EARNED', 'SPENT', 'REFUNDED', 'BONUS', 'WITHDRAWAL', 'DEPOSIT');

-- CreateEnum
CREATE TYPE "WalletReason" AS ENUM ('SESSION_PAYOUT', 'SESSION_SPEND', 'PROJECT_PAYOUT', 'PROJECT_DEPOSIT', 'BONUS', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "ForumCategory" AS ENUM ('TECHNICAL', 'CREATIVE', 'SOFT_SKILLS', 'LANGUAGES', 'FREELANCE', 'GENERAL', 'STARTUPS');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('GITHUB', 'LINKEDIN', 'TWITTER', 'PORTFOLIO', 'OTHER', 'BEHANCE', 'DRIBBBLE');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('TOP_MENTOR', 'RISING_TALENT', 'RELIABLE_COLLABORATOR', 'SKILL_MASTER', 'COMMUNITY_LEADER', 'INNOVATOR');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM', 'VERIFIED', 'ELITE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "AuthTokenType" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET', 'MAGIC_LOGIN');

-- CreateEnum
CREATE TYPE "DigestFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ThreadRole" AS ENUM ('MEMBER', 'OWNER', 'MODERATOR');

-- CreateEnum
CREATE TYPE "TagKind" AS ENUM ('SKILL', 'PROJECT', 'FORUM');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "college" TEXT,
    "bio" TEXT,
    "headline" TEXT,
    "timezone" VARCHAR(64),
    "profileImg" TEXT,
    "heroImage" TEXT,
    "skillcoins" INTEGER NOT NULL DEFAULT 0,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "availability" "UserAvailability" NOT NULL DEFAULT 'ONLINE',
    "statusMessage" VARCHAR(140),
    "googleId" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "lastActiveAt" TIMESTAMP(3),
    "searchPreferences" JSONB,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "refreshToken" VARCHAR(512) NOT NULL,
    "userAgent" VARCHAR(255),
    "ipAddress" VARCHAR(64),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "AuthTokenType" NOT NULL,
    "tokenHash" VARCHAR(512) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" "SkillLevel" NOT NULL,
    "description" TEXT NOT NULL,
    "sessionMode" "SessionMode" NOT NULL DEFAULT 'ONLINE',
    "visibility" "SkillVisibility" NOT NULL DEFAULT 'PUBLIC',
    "location" VARCHAR(120),
    "deliveryModes" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "searchVector" tsvector,
    "teacherId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillRequest" (
    "id" UUID NOT NULL,
    "requesterId" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "preferredSlot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mentorship" (
    "id" UUID NOT NULL,
    "mentorId" UUID NOT NULL,
    "learnerId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "mentorshipType" "MentorshipType" NOT NULL DEFAULT 'ONE_TO_ONE',
    "status" "MentorshipStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "meetingLink" VARCHAR(255),
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mentorship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorshipSession" (
    "id" UUID NOT NULL,
    "mentorshipId" UUID NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "durationMins" INTEGER NOT NULL,
    "status" "MentorshipSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "meetingUrl" VARCHAR(255),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorshipSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "posterId" UUID NOT NULL,
    "budgetMin" DOUBLE PRECISION NOT NULL,
    "budgetMax" DOUBLE PRECISION NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'OPEN',
    "location" VARCHAR(120),
    "remoteFriendly" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "searchVector" tsvector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMilestone" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMessage" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectApplication" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "proposal" TEXT NOT NULL,
    "bidAmount" DOUBLE PRECISION NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "followerId" UUID NOT NULL,
    "followingId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" UUID NOT NULL,
    "subscriberId" UUID NOT NULL,
    "subscribedToId" UUID NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'PREMIUM',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renewedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "reviewerId" UUID NOT NULL,
    "reviewedId" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageThread" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastMessage" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreadParticipant" (
    "id" UUID NOT NULL,
    "threadId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "ThreadRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "muted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ThreadParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "threadId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "readBy" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "content" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "inApp" BOOLEAN NOT NULL DEFAULT true,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "push" BOOLEAN NOT NULL DEFAULT false,
    "digestFrequency" "DigestFrequency" NOT NULL DEFAULT 'DAILY',
    "quietHours" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "referenceId" VARCHAR(120),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletEntry" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "change" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "reason" "WalletReason" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumPost" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "ForumCategory" NOT NULL,
    "tags" TEXT[],
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumComment" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "TagKind" NOT NULL DEFAULT 'SKILL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "platform" "Platform" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "BadgeType" NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerifiedSkill" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "skillName" TEXT NOT NULL,
    "authority" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerifiedSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillMatch" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "matchUserId" UUID NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reasons" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SkillToTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_SkillToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LearningSkills" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_LearningSkills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RequiredSkills" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_RequiredSkills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_college_idx" ON "User"("college");

-- CreateIndex
CREATE INDEX "User_lastActiveAt_idx" ON "User"("lastActiveAt");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_userId_refreshToken_key" ON "UserSession"("userId", "refreshToken");

-- CreateIndex
CREATE INDEX "AuthToken_userId_type_idx" ON "AuthToken"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_type_tokenHash_key" ON "AuthToken"("type", "tokenHash");

-- CreateIndex
CREATE INDEX "Skill_category_idx" ON "Skill"("category");

-- CreateIndex
CREATE INDEX "Skill_teacherId_idx" ON "Skill"("teacherId");

-- CreateIndex
CREATE INDEX "Skill_featured_idx" ON "Skill"("featured");

-- CreateIndex
CREATE INDEX "SkillRequest_requesterId_idx" ON "SkillRequest"("requesterId");

-- CreateIndex
CREATE INDEX "SkillRequest_teacherId_idx" ON "SkillRequest"("teacherId");

-- CreateIndex
CREATE INDEX "SkillRequest_skillId_idx" ON "SkillRequest"("skillId");

-- CreateIndex
CREATE INDEX "SkillRequest_status_idx" ON "SkillRequest"("status");

-- CreateIndex
CREATE INDEX "Mentorship_mentorId_idx" ON "Mentorship"("mentorId");

-- CreateIndex
CREATE INDEX "Mentorship_learnerId_idx" ON "Mentorship"("learnerId");

-- CreateIndex
CREATE INDEX "Mentorship_skillId_idx" ON "Mentorship"("skillId");

-- CreateIndex
CREATE INDEX "Mentorship_status_idx" ON "Mentorship"("status");

-- CreateIndex
CREATE INDEX "MentorshipSession_mentorshipId_idx" ON "MentorshipSession"("mentorshipId");

-- CreateIndex
CREATE INDEX "MentorshipSession_scheduledFor_idx" ON "MentorshipSession"("scheduledFor");

-- CreateIndex
CREATE INDEX "Project_posterId_idx" ON "Project"("posterId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_remoteFriendly_idx" ON "Project"("remoteFriendly");

-- CreateIndex
CREATE INDEX "ProjectMilestone_projectId_idx" ON "ProjectMilestone"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMessage_projectId_idx" ON "ProjectMessage"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMessage_senderId_idx" ON "ProjectMessage"("senderId");

-- CreateIndex
CREATE INDEX "ProjectApplication_projectId_idx" ON "ProjectApplication"("projectId");

-- CreateIndex
CREATE INDEX "ProjectApplication_applicantId_idx" ON "ProjectApplication"("applicantId");

-- CreateIndex
CREATE INDEX "ProjectApplication_status_idx" ON "ProjectApplication"("status");

-- CreateIndex
CREATE INDEX "Follow_followerId_idx" ON "Follow"("followerId");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriberId_subscribedToId_key" ON "Subscription"("subscriberId", "subscribedToId");

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

-- CreateIndex
CREATE INDEX "Review_reviewedId_idx" ON "Review"("reviewedId");

-- CreateIndex
CREATE INDEX "ThreadParticipant_userId_idx" ON "ThreadParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ThreadParticipant_threadId_userId_key" ON "ThreadParticipant"("threadId", "userId");

-- CreateIndex
CREATE INDEX "Message_threadId_idx" ON "Message"("threadId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "WalletEntry_userId_idx" ON "WalletEntry"("userId");

-- CreateIndex
CREATE INDEX "WalletEntry_createdAt_idx" ON "WalletEntry"("createdAt");

-- CreateIndex
CREATE INDEX "ForumPost_authorId_idx" ON "ForumPost"("authorId");

-- CreateIndex
CREATE INDEX "ForumPost_category_idx" ON "ForumPost"("category");

-- CreateIndex
CREATE INDEX "ForumPost_createdAt_idx" ON "ForumPost"("createdAt");

-- CreateIndex
CREATE INDEX "ForumComment_postId_idx" ON "ForumComment"("postId");

-- CreateIndex
CREATE INDEX "ForumComment_authorId_idx" ON "ForumComment"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "SocialLink_userId_idx" ON "SocialLink"("userId");

-- CreateIndex
CREATE INDEX "Badge_userId_idx" ON "Badge"("userId");

-- CreateIndex
CREATE INDEX "VerifiedSkill_userId_idx" ON "VerifiedSkill"("userId");

-- CreateIndex
CREATE INDEX "SkillMatch_score_idx" ON "SkillMatch"("score");

-- CreateIndex
CREATE UNIQUE INDEX "SkillMatch_userId_matchUserId_key" ON "SkillMatch"("userId", "matchUserId");

-- CreateIndex
CREATE INDEX "_SkillToTag_B_index" ON "_SkillToTag"("B");

-- CreateIndex
CREATE INDEX "_LearningSkills_B_index" ON "_LearningSkills"("B");

-- CreateIndex
CREATE INDEX "_RequiredSkills_B_index" ON "_RequiredSkills"("B");

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillRequest" ADD CONSTRAINT "SkillRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillRequest" ADD CONSTRAINT "SkillRequest_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillRequest" ADD CONSTRAINT "SkillRequest_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipSession" ADD CONSTRAINT "MentorshipSession_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMessage" ADD CONSTRAINT "ProjectMessage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMessage" ADD CONSTRAINT "ProjectMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectApplication" ADD CONSTRAINT "ProjectApplication_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectApplication" ADD CONSTRAINT "ProjectApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_subscribedToId_fkey" FOREIGN KEY ("subscribedToId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewedId_fkey" FOREIGN KEY ("reviewedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadParticipant" ADD CONSTRAINT "ThreadParticipant_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadParticipant" ADD CONSTRAINT "ThreadParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletEntry" ADD CONSTRAINT "WalletEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifiedSkill" ADD CONSTRAINT "VerifiedSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillMatch" ADD CONSTRAINT "SkillMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillMatch" ADD CONSTRAINT "SkillMatch_matchUserId_fkey" FOREIGN KEY ("matchUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SkillToTag" ADD CONSTRAINT "_SkillToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SkillToTag" ADD CONSTRAINT "_SkillToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LearningSkills" ADD CONSTRAINT "_LearningSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LearningSkills" ADD CONSTRAINT "_LearningSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequiredSkills" ADD CONSTRAINT "_RequiredSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequiredSkills" ADD CONSTRAINT "_RequiredSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
