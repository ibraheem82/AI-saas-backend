import { Request, Response, NextFunction } from 'express';
interface CustomError extends Error {
    statusCode?: number;
}
export declare const errorHandler: (err: CustomError, _req: Request, res: Response, _next: NextFunction) => void;
export {};
//# sourceMappingURL=errorMiddleware.d.ts.map