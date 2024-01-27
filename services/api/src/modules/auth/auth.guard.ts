import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ApiConf } from "src/app-context/context-type";
import {
  AccessTokenPayload,
  JwtTokenDecoded,
  RequestWithPayload,
} from "src/types/common-types";
import { extractTokenFromHeader } from "./auth.helper";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithPayload>();
    const accessToken = extractTokenFromHeader(request);
    const { jwtBlackList } =
      this.configService.get<ApiConf>("apiConf").jwtConfig;

    const invalidAccessTokenException = () => {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        success: false,
        code: "INVALID_ACCESS_TOKEN",
        message: "The access token provided has invalid",
      });
    };

    if (!accessToken) return invalidAccessTokenException();

    try {
      const {
        payload: { id, groups, jti },
      } = await this.jwtService.verifyAsync<
        JwtTokenDecoded<AccessTokenPayload>
      >(accessToken, { complete: true });

      const isBlacklisted = await jwtBlackList.tokenIsBlackListed(jti);
      if (isBlacklisted) return invalidAccessTokenException();

      request.user = {
        id,
        groups,
      };
    } catch (error) {
      return invalidAccessTokenException();
    }
    return true;
  }
}
