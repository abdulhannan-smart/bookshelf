import { Router, Request, Response, NextFunction } from "express";
import * as usersService from "../services/usersService";
import { CreateUserInput, UpdateUserInput } from "@bookshelf/shared";

const router = Router();

// GET /api/users/:id/activity — declared before /:id for clarity, though
// Express disambiguates by segment count.
router.get(
  "/:id/activity",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await usersService.getActivity(req.params.id);
      res.json({ success: true, data: activity });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/users/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.findUser(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// POST /api/users
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = req.body as CreateUserInput;
    const user = await usersService.addUser(input);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = req.body as UpdateUserInput;
    const user = await usersService.editUser(req.params.id, input);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

export default router;
