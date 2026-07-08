import { Injectable, NotFoundException } from "@nestjs/common"
import { eq } from "drizzle-orm"
import { DatabaseService } from "../database/database.service"
import { users } from "../database/schema"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.db.select().from(users)
  }

  async findOne(id: number) {
    const [user] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.id, id))
    if (!user) throw new NotFoundException(`User #${id} not found`)
    return user
  }

  async findByEmail(email: string) {
    const [user] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.email, email))
    return user ?? null
  }

  async create(dto: CreateUserDto) {
    const [user] = await this.db.db
      .insert(users)
      .values(dto)
      .returning()
    return user
  }

  async update(id: number, dto: UpdateUserDto) {
    const [user] = await this.db.db
      .update(users)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    if (!user) throw new NotFoundException(`User #${id} not found`)
    return user
  }

  async remove(id: number) {
    const [user] = await this.db.db
      .delete(users)
      .where(eq(users.id, id))
      .returning()
    if (!user) throw new NotFoundException(`User #${id} not found`)
    return user
  }
}
