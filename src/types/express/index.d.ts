import { Request } from "express";
import { RequestUser } from "../../common/resources/requestHelpers/requestUser";

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}
