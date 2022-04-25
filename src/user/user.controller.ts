/* eslint-disable prettier/prettier */
import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { User } from "@prisma/client";
import { Request } from "express";
import { GetUser } from "../auth/decorator/getUser.decorator";
import { JwtGuard } from "../auth/guard";

@UseGuards(JwtGuard)
@Controller('user')

export class UserController {
    @Get('me')
    getMe(@GetUser() user:User) {
        return user
    }
}