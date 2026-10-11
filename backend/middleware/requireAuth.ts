import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

const issuer = `${env.supabaseUrl}/auth/v1`;
const jose = import("jose");
const jwks = jose.then(({ createRemoteJWKSet }) =>
  createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`))
);

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.header("Authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    res.status(401).json({ error: "Se requiere un token de acceso válido" });
    return;
  }

  let joseModule: Awaited<typeof jose>;
  try {
    joseModule = await jose;
  } catch (error) {
    next(error);
    return;
  }

  try {
    await joseModule.jwtVerify(match[1], await jwks, {
      issuer,
      audience: env.supabaseJwtAudience,
    });
    next();
  } catch (error) {
    if (error instanceof joseModule.errors.JWKSTimeout) {
      res.status(503).json({ error: "No se pudo validar el token con Supabase" });
      return;
    }
    if (error instanceof joseModule.errors.JOSEError) {
      res.status(401).json({ error: "Token de acceso inválido o expirado" });
      return;
    }
    next(error);
  }
}
