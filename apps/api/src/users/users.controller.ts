import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from "@nestjs/common"
import { UsersService } from "./users.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getMe(@Request() req: { user: { id: number } }) {
    return this.usersService.findOne(req.user.id)
  }

  @Put("me")
  updateMe(
    @Request() req: { user: { id: number } },
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.id, dto)
  }
}
