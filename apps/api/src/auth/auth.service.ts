import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcryptjs"
import { UsersService } from "../users/users.service"
import { WorkspacesService } from "../workspaces/workspaces.service"

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly workspacesService: WorkspacesService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, name: string, password: string) {
    const existing = await this.usersService.findByEmail(email)
    if (existing) throw new ConflictException("Email already registered")
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await this.usersService.create({ email, name, passwordHash })
    await this.workspacesService.create({
      name: `${name}'s Workspace`,
      ownerId: user.id,
    })
    const token = this.signToken(user.id, user.email)
    return { user: this.sanitizeUser(user), token }
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) throw new UnauthorizedException("Invalid credentials")
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new UnauthorizedException("Invalid credentials")
    const token = this.signToken(user.id, user.email)
    return { user: this.sanitizeUser(user), token }
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findOne(userId)
    return this.sanitizeUser(user)
  }

  async updateProfile(userId: number, data: { name?: string }) {
    const user = await this.usersService.update(userId, data)
    return this.sanitizeUser(user)
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findOne(userId)
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) throw new UnauthorizedException("Current password is incorrect")
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await this.usersService.update(userId, { passwordHash })
    return { message: "Password updated successfully" }
  }

  private signToken(userId: number, email: string): string {
    return this.jwtService.sign({ sub: userId, email })
  }

  private sanitizeUser(user: { id: number; email: string; name: string; plan: string; passwordHash: string; createdAt: Date; updatedAt: Date }) {
    const { passwordHash: _, ...safe } = user
    return safe
  }
}
