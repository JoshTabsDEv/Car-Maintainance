import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [rows] = await pool.query(
      'SELECT * FROM maintenance_logs ORDER BY serviceDate DESC, createdAt DESC'
    ) as any[];

    return NextResponse.json(rows || []);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { carMake, carModel, serviceType, serviceDate, mileage, cost, notes } = body;

    if (!carMake || !carModel || !serviceType || !serviceDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'INSERT INTO maintenance_logs (carMake, carModel, serviceType, serviceDate, mileage, cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [carMake, carModel, serviceType, serviceDate, mileage || null, cost || null, notes || null]
    ) as any;

    return NextResponse.json(
      { id: (result as any).insertId, message: 'Maintenance log created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

