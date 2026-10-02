/** Express type augmentation — adds req.user and req.firebaseUid. */

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string; // Veyra database user ID
        firebaseUid: string;
        email: string;
        username?: string | null;
        name?: string | null;
        timezone: string;
        xp: number;
        level: number;
      };
      firebaseUid?: string;
    }
  }
}

export {};
