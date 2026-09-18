import { Router } from "express";
import { authenticate } from "@/common/middleware/authenticate";
import { validate } from "@/common/middleware/validate";
import { ok, paginatedRecords } from "@/common/http/response";
import {
  createActionSchema,
  listActionQuerySchema,
  updateActionSchema,
} from "./action.schema";
import { actionService } from "./action.service";

export const actionRouter = Router();

actionRouter.use(authenticate);

actionRouter.get(
  "/",
  validate(listActionQuerySchema, "query"),
  async (req, res, next) => {
    try {
      const query = (req.validQuery ?? req.query) as unknown as Parameters<
        typeof actionService.list
      >[0];
      const result = await actionService.list(query);
      return paginatedRecords(
        res,
        result.records,
        result.records_total,
        query.limit,
      );
    } catch (error) {
      next(error);
    }
  },
);

actionRouter.post("/", validate(createActionSchema), async (req, res, next) => {
  try {
    const created = await actionService.create(req.body);
    return ok(res, created, "Action berhasil dibuat");
  } catch (error) {
    next(error);
  }
});

actionRouter.put(
  "/:action_code",
  validate(updateActionSchema),
  async (req, res, next) => {
    try {
      const updated = await actionService.update(
        String(req.params.action_code),
        req.body,
      );
      return ok(res, updated, "Action berhasil diperbarui");
    } catch (error) {
      next(error);
    }
  },
);

actionRouter.delete("/:action_code", async (req, res, next) => {
  try {
    const result = await actionService.remove(req.params.action_code);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
