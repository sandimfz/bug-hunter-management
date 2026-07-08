import { IsString, IsOptional, IsEnum, IsNumber } from "class-validator"

export class UpdateFindingDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsEnum(["critical", "high", "medium", "low", "info"])
  severity?: "critical" | "high" | "medium" | "low" | "info"

  @IsOptional()
  @IsEnum(["draft", "submitted", "triaged", "accepted", "rejected", "paid"])
  status?: "draft" | "submitted" | "triaged" | "accepted" | "rejected" | "paid"

  @IsOptional()
  @IsString()
  poc?: string

  @IsOptional()
  @IsNumber()
  rewardAmount?: number
}
