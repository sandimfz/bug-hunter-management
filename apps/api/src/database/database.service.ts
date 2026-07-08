import { Injectable, OnModuleDestroy } from "@nestjs/common"
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { relations } from "./schema"

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly client: postgres.Sql
  readonly db: PostgresJsDatabase<typeof relations>

  constructor() {
    this.client = postgres(process.env.DATABASE_URL!)
    this.db = drizzle({ client: this.client, relations })
  }

  async onModuleDestroy() {
    await this.client.end()
  }
}
