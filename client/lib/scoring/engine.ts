import { LeaderboardEntry } from "@/models/LeaderboardEntry";
import { Tournament } from "@/models/Tournament";
import { ResultSubmission } from "@/models/ResultSubmission";

export interface ScoreCalculationResult {
  teamName: string;
  placement: number;
  placementPoints: number;
  eliminations: number;
  eliminationPoints: number;
  totalPoints: number;
}

export function calculatePoints(
  placement: number,
  eliminations: number,
  scoringRules?: {
    placementPoints?: Map<string, number> | Record<string, number>;
    eliminationPoints?: number;
  }
): { placementPoints: number; eliminationPoints: number; totalPoints: number } {
  const defaultPlacementPoints: Record<string, number> = {
    "1": 15,
    "2": 12,
    "3": 10,
    "4": 8,
    "5": 6,
    "6": 4,
    "7": 2,
    "8": 1,
    "9": 1,
    "10": 1,
  };

  const killMultiplier = scoringRules?.eliminationPoints ?? 1.0;
  let placementPts = 0;

  if (scoringRules?.placementPoints) {
    if (scoringRules.placementPoints instanceof Map) {
      placementPts = scoringRules.placementPoints.get(String(placement)) ?? 0;
    } else {
      placementPts = (scoringRules.placementPoints as Record<string, number>)[String(placement)] ?? 0;
    }
  } else {
    placementPts = defaultPlacementPoints[String(placement)] ?? 0;
  }

  const elimPts = eliminations * killMultiplier;
  const total = placementPts + elimPts;

  return {
    placementPoints: placementPts,
    eliminationPoints: elimPts,
    totalPoints: total,
  };
}

export async function recalculateTournamentLeaderboard(tournamentId: string) {
  try {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return;

    // Fetch all approved result submissions for this tournament
    const approvedResults = await ResultSubmission.find({
      tournament: tournamentId,
      status: "approved",
    });

    if (!approvedResults || approvedResults.length === 0) return;

    // Group scores by teamName
    const teamTotals = new Map<
      string,
      {
        teamName: string;
        bestPlacement: number;
        placementPoints: number;
        eliminations: number;
        eliminationPoints: number;
        totalPoints: number;
      }
    >();

    for (const res of approvedResults) {
      const calc = calculatePoints(res.placement, res.eliminations, tournament.scoringRules);

      const existing = teamTotals.get(res.teamName) || {
        teamName: res.teamName,
        bestPlacement: res.placement,
        placementPoints: 0,
        eliminations: 0,
        eliminationPoints: 0,
        totalPoints: 0,
      };

      existing.placementPoints += calc.placementPoints;
      existing.eliminations += res.eliminations;
      existing.eliminationPoints += calc.eliminationPoints;
      existing.totalPoints += calc.totalPoints;
      existing.bestPlacement = Math.min(existing.bestPlacement, res.placement);

      teamTotals.set(res.teamName, existing);
    }

    // Sort teams by:
    // 1. Total Points descending
    // 2. Highest Placement Points
    // 3. Total Eliminations
    // 4. Best Placement (lower is better, e.g. 1st beats 2nd)
    const sorted = Array.from(teamTotals.values()).sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.placementPoints !== a.placementPoints) return b.placementPoints - a.placementPoints;
      if (b.eliminations !== a.eliminations) return b.eliminations - a.eliminations;
      return a.bestPlacement - b.bestPlacement;
    });

    // Clear existing overall entries and write new ones
    await LeaderboardEntry.deleteMany({ tournament: tournamentId, match: { $exists: false } });

    const entriesToInsert = sorted.map((team, index) => ({
      tournament: tournamentId,
      teamName: team.teamName,
      placement: team.bestPlacement,
      placementPoints: team.placementPoints,
      eliminationPoints: team.eliminationPoints,
      totalPoints: team.totalPoints,
      rank: index + 1,
    }));

    if (entriesToInsert.length > 0) {
      await LeaderboardEntry.insertMany(entriesToInsert);
    }

    return entriesToInsert;
  } catch (error) {
    console.error("[Scoring Engine] Leaderboard recalculation failed:", error);
    return null;
  }
}
