import { Router } from "express";
import { authenticate } from "@/common/middleware/authenticate";
import { validate } from "@/common/middleware/validate";
import { okRecords } from "@/common/http/response";
import { updatePrivilegeSchema } from "./privilege.schema";
import { privilegeService } from "./privilege.service";

export const privilegeRouter = Router();

privilegeRouter.use(authenticate);

privilegeRouter.get("/by-user-type/:userTypeId", async (req, res, next) => {
  try {
    const records = await privilegeService.listByUserType(
      Number(req.params.userTypeId),
    );
    return okRecords(res, records);
  } catch (error) {
    next(error);
  }
});

privilegeRouter.post("/", validate(updatePrivilegeSchema), async (req, res, next) => {
  try {
    const result = await privilegeService.updateMatrix(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
