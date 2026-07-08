import { PipeTransform, BadRequestException } from "@nestjs/common"
import { ZodSchema, ZodError } from "zod"

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value)
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.flatten().fieldErrors as Record<string, string[]>
        const messages = Object.entries(fieldErrors)
          .map(([field, errs]) => `${field}: ${errs?.join(", ")}`)
          .join("; ")
        throw new BadRequestException(messages)
      }
      throw new BadRequestException("Validation failed")
    }
  }
}
