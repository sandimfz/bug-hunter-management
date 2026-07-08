import { IsInt, IsString, IsOptional, IsEnum, IsArray, ArrayMinSize } from "class-validator"

export class BulkImportAssetDto {
  @IsInt()
  programId!: number

  @IsEnum(["domain", "subdomain", "endpoint", "api", "ip"])
  type!: "domain" | "subdomain" | "endpoint" | "api" | "ip"

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  values!: string[]

  @IsOptional()
  @IsEnum(["active", "dead", "unchecked", "flagged"])
  status?: "active" | "dead" | "unchecked" | "flagged"

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}
