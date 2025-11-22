import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

export async function GET() {
  try {
    // Check if required environment variables are set
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required environment variables',
          missing: missingVars,
          message: `Please set the following environment variables: ${missingVars.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const result = await initDatabase();
    return NextResponse.json({
      message: 'Database initialized successfully',
      tables: ['users', 'maintenance_logs'],
      admin: {
        created: result.adminCreated,
        email: result.adminEmail,
        password: result.adminPassword,
        message: result.adminCreated 
          ? 'Admin user created successfully. You can now login.'
          : 'Admin user already exists.',
      },
    });
  } catch (error: any) {
    console.error('Init DB error:', error);
    
    // Extract more detailed error information
    const errorMessage = error?.message || 'Unknown error occurred';
    const errorCode = error?.code || 'UNKNOWN_ERROR';
    
    // Provide helpful error messages based on error type
    let userFriendlyMessage = 'Failed to initialize database';
    
    if (errorCode === 'ECONNREFUSED') {
      userFriendlyMessage = 'Cannot connect to database. Please check DB_HOST and DB_PORT.';
    } else if (errorCode === 'ER_ACCESS_DENIED_ERROR' || errorCode === 'ER_NOT_SUPPORTED_AUTH_MODE') {
      userFriendlyMessage = 'Database access denied. Please check DB_USER and DB_PASSWORD.';
    } else if (errorCode === 'ER_BAD_DB_ERROR') {
      userFriendlyMessage = 'Database does not exist. Please create the database first.';
    } else if (error?.message?.includes('Unknown database')) {
      userFriendlyMessage = 'Database does not exist. Please create the database first.';
    }

    return NextResponse.json(
      {
        error: userFriendlyMessage,
        details: errorMessage,
        code: errorCode,
      },
      { status: 500 }
    );
  }
}

