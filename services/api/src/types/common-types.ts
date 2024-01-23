export type Obj = {
  [key: string]: any;
};

export interface RefreshTokenPayload {
  userPublicId: string;
  lastRefreshTokenId: string;
}

export interface EncodedRefreshTokenPayload {
  subtoken: string;
}

export interface AccessTokenPayload {
  id: string;
  groups: string[];
}

export interface JwtTokenDecoded<TPayload = any> {
  header: Obj;
  signature: Obj;
  payload: TPayload;
}