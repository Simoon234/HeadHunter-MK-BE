import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const ObjectPerson = createParamDecorator(
  (data, context: ExecutionContext) => {
    return context.switchToHttp().getRequest().user;
  }
);
