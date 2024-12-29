import { createHmac, randomBytes } from "crypto";
import { prismaClient } from "../lib/db";
import JWT from "jsonwebtoken";

const JWT_SECRET = "mysecretkey";
export interface CreateUserPayload {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface UserTokenPayload {
  email: string;
  password: string;
}

class UserService {
  public static createUser(payload: CreateUserPayload) {
    const { firstName, lastName, email, password } = payload;
    const salt = randomBytes(32).toString("hex");
    const hashedPassword = UserService.generateHash(salt, password);
    return prismaClient.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        salt,
      },
    });
  }

  private static generateHash(salt: string, password: string) {
    return createHmac("sha256", salt).update(password).digest("hex");
  }

  private static async getUserByEmail(email: string) {
    return prismaClient.user.findUnique({ where: { email } });
  }

  public static decodedToken(token: string) {
    return JWT.verify(token, JWT_SECRET);
  }

  public static async getUserByID(id: string) {
    return prismaClient.user.findUnique({ where: { id } });
  }

  public static async getUserToken(payload: UserTokenPayload) {
    const { email, password } = payload;
    const user = await UserService.getUserByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }
    const salt = user.salt;
    const hashedPassword = UserService.generateHash(salt, password);

    if (hashedPassword !== user.password) {
      throw new Error("Invalid password");
    }

    // get token
    const token = JWT.sign(
      {
        email: user.email,
        id: user.id,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return token;
  }
}

export default UserService;
