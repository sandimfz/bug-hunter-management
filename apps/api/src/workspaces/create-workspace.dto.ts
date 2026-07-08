import { IsInt, IsString } from "class-validator"

export class CreateWorkspaceDto {
  @IsString()
  name!: string

  @IsInt()
  ownerId!: number
}
