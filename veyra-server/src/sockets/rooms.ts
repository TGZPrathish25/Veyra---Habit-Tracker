/** Socket.IO room management: user and challenge rooms. */

export function getUserRoom(userId: string): string {
  return `user:${userId}`;
}

export function getChallengeRoom(challengeId: string): string {
  return `challenge:${challengeId}`;
}
