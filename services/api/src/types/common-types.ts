import { Request } from "express";

export type Obj = {
  [key: string]: any;
};

export interface RefreshTokenPayload {
  userPublicId: string;
  lastRefreshTokenId: string;
}

export interface EncodedRefreshTokenPayload extends JwtDefaultPayload {
  subtoken: string;
}

export interface AccessTokenPayload extends JwtDefaultPayload {
  id: string;
  groups: string[];
}

export interface JwtTokenDecoded<TPayload> {
  header: Obj;
  signature: Obj;
  payload: TPayload;
}

export interface JwtDefaultPayload {
  iat: number;
  exp: number;
  aud: string[];
  iss: string;
  jti: string;
}

export interface RequestWithPayload extends Request {
  user: {
    id: string;
    groups: string[];
  };
}
