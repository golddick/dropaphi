
import { db } from './lib/db';

async function diagnose() {
  try {
    console.log('--- Database Diagnosis ---');
    
    // 1. Check current value for EMAIL
    const emailCost = await db.serviceCost.findUnique({
      where: { service: 'EMAIL' }
    });
    console.log('Current EMAIL record:', emailCost);

    if (emailCost) {
      // 2. Try to update to 0.05
      console.log('Attempting to update usageRate to 0.05...');
      const updated = await db.serviceCost.update({
        where: { service: 'EMAIL' },
        data: { usageRate: 0.05 }
      });
      console.log('Updated record (returned by Prisma):', updated);

      // 3. Fetch again to see if it persisted
      const refetched = await db.serviceCost.findUnique({
        where: { service: 'EMAIL' }
      });
      console.log('Refetched record from DB:', refetched);
      
      if (refetched?.usageRate === 0) {
        console.error('TRUNCATION DETECTED: 0.05 was saved as 0.');
      } else {
        console.log('SUCCESS: 0.05 was saved correctly.');
      }
    } else {
      console.log('EMAIL service not found. Creating it with usageRate 0.05...');
      const created = await db.serviceCost.create({
        data: {
          id: 'diag_' + Date.now(),
          service: 'EMAIL',
          cost: 50,
          usageRate: 0.05,
          minPurchase: 20,
          isActive: true
        }
      });
      console.log('Created record:', created);
    }

    // 4. Try to get column info (Postgres specific)
    try {
      const colInfo: any[] = await db.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'service_costs' AND column_name = 'usage_rate'
      `;
      console.log('Database Column Info:', colInfo);
    } catch (e) {
      console.log('Could not fetch column info (maybe not Postgres):', e);
    }

  } catch (error) {
    console.error('Diagnosis failed:', error);
  } finally {
    process.exit();
  }
}

diagnose();
