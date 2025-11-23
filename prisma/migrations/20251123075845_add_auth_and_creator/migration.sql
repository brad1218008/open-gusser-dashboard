-- CreateEnum
CREATE TYPE "CompetitionStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MapType" AS ENUM ('Moving', 'NoMove', 'NMPZ', 'Standard');

-- CreateTable
CREATE TABLE "Users" (
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Players" (
    "player_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Players_pkey" PRIMARY KEY ("player_id")
);

-- CreateTable
CREATE TABLE "Competitions" (
    "competition_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CompetitionStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creator_id" TEXT,

    CONSTRAINT "Competitions_pkey" PRIMARY KEY ("competition_id")
);

-- CreateTable
CREATE TABLE "CompetitionPlayers" (
    "comp_player_id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,

    CONSTRAINT "CompetitionPlayers_pkey" PRIMARY KEY ("comp_player_id")
);

-- CreateTable
CREATE TABLE "Rounds" (
    "round_id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "round_number" INTEGER NOT NULL,
    "game_count" INTEGER NOT NULL DEFAULT 1,
    "map_name" TEXT NOT NULL,
    "map_type" "MapType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rounds_pkey" PRIMARY KEY ("round_id")
);

-- CreateTable
CREATE TABLE "Scores" (
    "score_id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "comp_player_id" TEXT NOT NULL,
    "input_total_score" INTEGER NOT NULL,
    "game_index" INTEGER NOT NULL DEFAULT 1,
    "calculated_game_score" INTEGER,
    "is_rejoin" BOOLEAN NOT NULL DEFAULT false,
    "entry_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scores_pkey" PRIMARY KEY ("score_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Players_name_key" ON "Players"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionPlayers_competition_id_player_id_key" ON "CompetitionPlayers"("competition_id", "player_id");

-- AddForeignKey
ALTER TABLE "Competitions" ADD CONSTRAINT "Competitions_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionPlayers" ADD CONSTRAINT "CompetitionPlayers_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competitions"("competition_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionPlayers" ADD CONSTRAINT "CompetitionPlayers_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Players"("player_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rounds" ADD CONSTRAINT "Rounds_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competitions"("competition_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scores" ADD CONSTRAINT "Scores_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "Rounds"("round_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scores" ADD CONSTRAINT "Scores_comp_player_id_fkey" FOREIGN KEY ("comp_player_id") REFERENCES "CompetitionPlayers"("comp_player_id") ON DELETE RESTRICT ON UPDATE CASCADE;
