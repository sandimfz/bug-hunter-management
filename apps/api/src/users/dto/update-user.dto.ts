import { IsEmail, IsString, IsOptional, IsEnum } from "class-validator"

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  passwordHash?: string

  @IsOptional()
  @IsEnum(["free", "pro", "team"])
  plan?: "free" | "pro" | "team"
}
