import { JwtModuleOptions } from "@nestjs/jwt";
import { registerAs } from "@nestjs/config";


export default registerAs("jwt", (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET,
    signOptions: {
        expiresIn: "1d"
    }
}),)