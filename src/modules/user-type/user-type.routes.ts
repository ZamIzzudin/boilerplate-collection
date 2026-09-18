import { Router } from "express";
import { authenticate } from "@/common/middleware/authenticate";
import { validate } from "@/common/middleware/validate";
import { ok, okRecords } from "@/common/http/response";
import {
  listUserTypeQuerySchema,
  roleSchema,
  updateRoleSchema,
} from "./user-type.schema";
import { userTypeService } from "./user-type.service";

export const userTypeRouter = Router();
export const roleRouter = Router();

userTypeRouter.get(
  "/",
  validate(listUserTypeQuerySchema, "query"),
  async (req, res, next) => {
    try {
      const query = (req.validQuery ?? req.query) as unknown as Parameters<
        typeof userTypeService.list
      >[0];
      const result = await userTypeService.list(query);
      return okRecords(res, result.records, {
        has_next: result.has_next,
        records_total: result.records_total,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Role CRUD aliases (/roles) backed by the user_type resource.
roleRouter.use(authenticate);

roleRouter.post("/", validate(roleSchema), async (req, res, next) => {
  try {
    const created = await userTypeService.create(req.body);
    return ok(res, created, "Role berhasil dibuat");
  } catch (error) {
    next(error);
  }
});

roleRouter.put("/:id", validate(updateRoleSchema), async (req, res, next) => {
  try {
    const updated = await userTypeService.update(Number(req.params.id), req.body);
    return ok(res, updated, "Role berhasil diperbarui");
  } catch (error) {
    next(error);
  }
});

roleRouter.delete("/:id", async (req, res, next) => {
  try {
    const result = await userTypeService.remove(Number(req.params.id));
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
