import { IsInt, IsString, IsOptional, IsEnum, IsArray, IsObject } from "class-validator"

export class CreateAssetDto {
  @IsInt()
  programId!: number

  @IsEnum(["domain", "subdomain", "endpoint", "api", "ip"])
  type!: "domain" | "subdomain" | "endpoint" | "api" | "ip"

  @IsString()
  value!: string

  @IsOptional()
  @IsEnum(["active", "dead", "unchecked", "flagged"])
  status?: "active" | "dead" | "unchecked" | "flagged"

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @IsString()
  notes?: string

  // Endpoint detail fields
  @IsOptional()
  @IsString()
  method?: string

  @IsOptional()
  @IsObject()
  requestHeaders?: Record<string, string>

  @IsOptional()
  @IsString()
  requestBody?: string

  @IsOptional()
  @IsInt()
  responseStatus?: number

  @IsOptional()
  @IsObject()
  responseHeaders?: Record<string, string>

  @IsOptional()
  @IsString()
  responseBody?: string

  @IsOptional()
  @IsString()
  contentType?: string
}
