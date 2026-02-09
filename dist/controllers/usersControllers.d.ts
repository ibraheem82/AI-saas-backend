interface RegisterBody {
    username: string;
    email: string;
    password: string;
}
interface LoginBody {
    email: string;
    password: string;
}
export declare const register: import("express").RequestHandler<object, object, RegisterBody, import("qs").ParsedQs, Record<string, any>>;
export declare const login: import("express").RequestHandler<object, any, LoginBody, import("qs").ParsedQs, Record<string, any>>;
export declare const logout: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const userProfile: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const checkAuth: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export {};
//# sourceMappingURL=usersControllers.d.ts.map