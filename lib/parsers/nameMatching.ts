import type { Agent } from "@/types";

interface NameMatchResult {
  matched: boolean;
  agentId?: number;
  confidence: number;
  suggestions?: { id: number; name: string }[];
}

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

// Normalize name for comparison
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ');     // Normalize whitespace
}

// Convert "Last, First" to "First Last"
function reverseNameFormat(name: string): string {
  if (name.includes(',')) {
    const parts = name.split(',').map(p => p.trim());
    return `${parts[1]} ${parts[0]}`;
  }
  return name;
}

// Extract first and last names
function extractFirstLast(name: string): { first: string; last: string } {
  const parts = name.trim().split(' ').filter(p => p.length > 0);
  return {
    first: parts[0] || '',
    last: parts[parts.length - 1] || '',
  };
}

// Common nickname mappings
const nicknameMap: Record<string, string[]> = {
  'michael': ['mike', 'mick', 'mikey'],
  'robert': ['rob', 'bob', 'bobby', 'robbie'],
  'william': ['will', 'bill', 'billy', 'willie'],
  'richard': ['rick', 'dick', 'rich', 'richie'],
  'james': ['jim', 'jimmy', 'jamie'],
  'jennifer': ['jen', 'jenny', 'jenn'],
  'elizabeth': ['liz', 'beth', 'betty', 'eliza'],
  'thomas': ['tom', 'tommy'],
  'christopher': ['chris'],
  'daniel': ['dan', 'danny'],
  'matthew': ['matt', 'matty'],
  'anthony': ['tony'],
  'joseph': ['joe', 'joey'],
  'samuel': ['sam', 'sammy'],
  'benjamin': ['ben', 'benny'],
  'alexander': ['alex'],
  'nicholas': ['nick'],
};

// Check if two names are nickname variants
function areNicknameVariants(name1: string, name2: string): boolean {
  const n1 = name1.toLowerCase();
  const n2 = name2.toLowerCase();

  for (const [formal, nicknames] of Object.entries(nicknameMap)) {
    const allVariants = [formal, ...nicknames];
    if (allVariants.includes(n1) && allVariants.includes(n2)) {
      return true;
    }
  }

  return false;
}

export function matchAgentName(
  inputName: string,
  agents: { id: number; name: string }[]
): NameMatchResult {
  const normalized = normalizeName(inputName);
  const reversed = normalizeName(reverseNameFormat(inputName));
  
  // 1. Try exact match (case-insensitive)
  for (const agent of agents) {
    const agentNormalized = normalizeName(agent.name);
    if (agentNormalized === normalized || agentNormalized === reversed) {
      return {
        matched: true,
        agentId: agent.id,
        confidence: 100,
      };
    }
  }

  // 2. Try fuzzy matching with Levenshtein distance
  const candidates: Array<{ agent: { id: number; name: string }; distance: number }> = [];

  for (const agent of agents) {
    const agentNormalized = normalizeName(agent.name);
    const distance = Math.min(
      levenshteinDistance(normalized, agentNormalized),
      levenshteinDistance(reversed, agentNormalized)
    );

    if (distance <= 2) {
      candidates.push({ agent, distance });
    }
  }

  // Sort by distance (closest first)
  candidates.sort((a, b) => a.distance - b.distance);

  // 3. Check nickname variants
  const inputParts = extractFirstLast(inputName);
  
  for (const agent of agents) {
    const agentParts = extractFirstLast(agent.name);
    
    // Check if first names are nickname variants and last names match
    if (
      areNicknameVariants(inputParts.first, agentParts.first) &&
      normalizeName(inputParts.last) === normalizeName(agentParts.last)
    ) {
      return {
        matched: true,
        agentId: agent.id,
        confidence: 95,
      };
    }
  }

  // 4. Return best fuzzy match or suggestions
  if (candidates.length > 0) {
    const best = candidates[0];
    const confidence = Math.max(0, 100 - (best.distance * 25)); // 2 distance = 50% confidence

    if (confidence >= 70) {
      return {
        matched: true,
        agentId: best.agent.id,
        confidence,
      };
    } else {
      // Return as suggestions if confidence is too low
      return {
        matched: false,
        confidence,
        suggestions: candidates.slice(0, 3).map(c => c.agent),
      };
    }
  }

  // No match found
  return {
    matched: false,
    confidence: 0,
    suggestions: [],
  };
}

// Batch match multiple names
export function batchMatchAgentNames(
  inputNames: string[],
  agents: { id: number; name: string }[]
): Map<string, NameMatchResult> {
  const results = new Map<string, NameMatchResult>();

  for (const name of inputNames) {
    results.set(name, matchAgentName(name, agents));
  }

  return results;
}

