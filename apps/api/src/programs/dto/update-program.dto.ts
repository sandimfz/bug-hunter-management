import { IsString, IsOptional, IsEnum } from "class-validator"

export class UpdateProgramDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsEnum(["hackerone", "bugcrowd", "private", "other"])
  platform?: "hackerone" | "bugcrowd" | "private" | "other"

  @IsOptional()
  @IsEnum(["active", "paused", "completed"])
  status?: "active" | "paused" | "completed"

  @IsOptional()
  @IsString()
  scopeNotes?: string
}
