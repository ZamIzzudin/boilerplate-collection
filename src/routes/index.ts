import { Router } from "express";
import { authRouter, userAuthRouter } from "@/modules/auth/auth.routes";
import { userRouter } from "@/modules/user/user.routes";
import { roleRouter, userTypeRouter } from "@/modules/user-type/user-type.routes";
import { actionRouter } from "@/modules/action/action.routes";
import { menuRouter } from "@/modules/menu/menu.routes";
import { privilegeRouter } from "@/modules/privilege/privilege.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/user", userAuthRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/user-type", userTypeRouter);
apiRouter.use("/roles", roleRouter);
apiRouter.use("/action", actionRouter);
apiRouter.use("/menu", menuRouter);
apiRouter.use("/privilege", privilegeRouter);
