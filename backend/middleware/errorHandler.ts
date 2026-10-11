import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "./HttpError";

export function notFoundHandler(_req: Request, res: Response) {
    res.status(404).json({
        error: "Recurso no encontrado",
    });
}

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    // Error de validacion
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: "Datos inválidos",
            details: err.flatten(),
        });
    }

    // Errores HTTP 
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({
            error: err.message,
            ...(err.details ? { details: err.details } : {}),
        });
    }

    // Prisma: violación de restricción única -> 409
    if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2002"
    ) {
        return res.status(409).json({
            error: "El registro ya existe (violación de restricción única)",
        });
    }

    // Prisma: registro no encontrado en operación (update/delete) -> 404
    if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2025"
    ) {
        return res.status(404).json({
            error: "Recurso no encontrado",
        });
    }

    console.error("Error inesperado:", err);
        return res.status(500).json({
            error: "Error interno del servidor",
        });
    }