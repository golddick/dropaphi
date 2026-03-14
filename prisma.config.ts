




// prisma.config.ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'
import path from 'node:path'

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    // Use DIRECT_URL in development for migrations & runtime
    // Use DATABASE_URL in production for runtime
    url: process.env.NODE_ENV === 'production'
      ? env('DATABASE_URL')
      : env('DIRECT_URL'),


  },

})

