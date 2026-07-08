import { IsEmail, IsString, IsOptional, IsEnum } from "class-validator"

export class CreateUserDto {
  @IsEmail()
  email!: string

  @IsString()
  name!: string

  @IsString()
  passwordHash!: string

  @IsOptional()
  @IsEnum(["free", "pro", "team"])
  plan?: "free" | "pro" | "team"
}
