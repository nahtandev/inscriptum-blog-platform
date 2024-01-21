export type Obj = {
  [key: string]: any;
};

export interface RefreshTokenPayload {
  userPublicId: string;
  lastRefreshTokenId: string;
}
