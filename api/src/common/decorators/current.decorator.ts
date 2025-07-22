import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { MyUserProfile } from "../../auth/auth.service";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as MyUserProfile;
  }
);
