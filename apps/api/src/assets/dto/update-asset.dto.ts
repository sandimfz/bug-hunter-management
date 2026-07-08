import { IsString, IsOptional, IsEnum, IsArray, IsInt, IsObject } from "class-validator"

export class UpdateAssetDto {
  @IsOptional()
  @IsEnum(["domain", "subdomain", "endpoint", "api", "ip"])
  type?: "domain" | "subdomain" | "endpoint" | "api" | "ip"

  @IsOptional()
  @IsString()
  value?: string

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
