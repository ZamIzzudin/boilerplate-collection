import { Router } from "express";
import { authenticate } from "@/common/middleware/authenticate";
import { validate } from "@/common/middleware/validate";
import { ok, paginatedRecords } from "@/common/http/response";
import {
  createMenuSchema,
  listMenuQuerySchema,
  updateMenuSchema,
} from "./menu.schema";
import { menuService } from "./menu.service";

export const menuRouter = Router();

menuRouter.use(authenticate);

menuRouter.get(
  "/",
  validate(listMenuQuerySchema, "query"),
  async (req, res, next) => {
    try {
      const query = (req.validQuery ?? req.query) as unknown as Parameters<
        typeof menuService.list
      >[0];
      const result = await menuService.list(query);
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

menuRouter.post("/", validate(createMenuSchema), async (req, res, next) => {
  try {
    const created = await menuService.create(req.body);
    return ok(res, created, "Menu berhasil dibuat");
  } catch (error) {
    next(error);
  }
});

menuRouter.put(
  "/:menu_code",
  validate(updateMenuSchema),
  async (req, res, next) => {
    try {
      const updated = await menuService.update(String(req.params.menu_code), req.body);
      return ok(res, updated, "Menu berhasil diperbarui");
    } catch (error) {
      next(error);
    }
  },
);

menuRouter.delete("/:menu_code", async (req, res, next) => {
  try {
    const result = await menuService.remove(req.params.menu_code);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
