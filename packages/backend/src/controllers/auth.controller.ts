import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { env } from "../env.js";
import { DomainError } from "../errors.js";
import { createRefreshToken, isRefreshTokenExpired } from "../global/helper.js";

function signAccessToken(userId: number): string {
  return jwt.sign({ id: userId }, env.SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRATION,
  });
}

export const authController = {
  async signup(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    const existing = await db
      .selectFrom("users")
      .select("id")
      .where("username", "=", username)
      .executeTakeFirst();
    if (existing) {
      throw new DomainError(
        `Username ${username} is exist, please choose another username`,
      );
    }

    const created = await db
      .insertInto("users")
      .values({ username, password: bcrypt.hashSync(password, 8) })
      .returning(["id", "username"])
      .executeTakeFirstOrThrow();

    res.json(created);
  },

  async signin(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    const user = await db
      .selectFrom("users")
      .selectAll()
      .where("username", "=", username)
      .executeTakeFirst();

    if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
      res
        .status(401)
        .json({ accessToken: null, message: "Invalid Password or Username!" });
      return;
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = await createRefreshToken(user.id);

    res.json({
      id: user.id,
      username: user.username,
      accessToken,
      refreshToken,
    });
  },

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken: requestToken } = req.body;

    const user = await db
      .selectFrom("users")
      .selectAll()
      .where("refresh_token", "=", requestToken)
      .executeTakeFirst();

    if (!user) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (isRefreshTokenExpired(user.expiry_date)) {
      await db
        .updateTable("users")
        .set({ refresh_token: null, expiry_date: null })
        .where("id", "=", user.id)
        .execute();
      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    res.status(200).json({
      accessToken: signAccessToken(user.id),
      refreshToken: user.refresh_token,
    });
  },

  async logout(_req: Request, res: Response): Promise<void> {
    res.json({ message: "done" });
  },
};
