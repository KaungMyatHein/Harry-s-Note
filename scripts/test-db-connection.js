const { PrismaClient } = require('@prisma/client')

// Simple database configuration for testing
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

function getDatabaseUrl() {
  if (isProduction && process.env.SUPABASE_DATABASE_URL) {
    return process.env.SUPABASE_DATABASE_URL
  }
  return process.env.DATABASE_URL || "file:./dev.db"
}

const dbConfig = {
  environment: process.env.NODE_ENV,
  isDevelopment,
  isProduction,
  databaseUrl: getDatabaseUrl(),
  hasSupabaseConfig: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
}

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  console.log('Environment:', dbConfig.environment)
  console.log('Database URL:', dbConfig.databaseUrl)
  console.log('Has Supabase Config:', dbConfig.hasSupabaseConfig)
  console.log('---')

  const prisma = new PrismaClient()

  try {
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')

    // Test a simple query
    const userCount = await prisma.user.count()
    console.log(`📊 Current user count: ${userCount}`)

    // Test table existence by trying to query each model
    const models = ['account', 'session', 'user', 'verificationToken', 'readingSession', 'note']
    
    for (const model of models) {
      try {
        const count = await prisma[model].count()
        console.log(`✅ ${model} table: ${count} records`)
      } catch (error) {
        console.log(`❌ ${model} table: Error - ${error.message}`)
      }
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Database connection closed')
  }
}

testDatabaseConnection()
  .then(() => {
    console.log('✅ Database test completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Database test failed:', error)
    process.exit(1)
  })