#!/usr/bin/env ts-node


import { MongoClient } from 'mongodb';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '..', '.env') });

interface AdminUser {
    name: string;
    email: string;
    password: string;
    roles: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

async function seedAdmin() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/angular-leaf-api';
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

    console.log('🌱 Starting admin user seeding...\n');

    let client: MongoClient;

    try {

        console.log('📡 Connecting to MongoDB...');
        client = await MongoClient.connect(mongoUri);
        const db = client.db();
        console.log('✅ Connected to MongoDB\n');

        const existingAdmin = await db.collection('users').findOne({ email: 'admin@example.com' });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('📧 Email: admin@example.com');
            console.log('\n💡 If you need to reset the password, delete the user first or use a different email.\n');
            await client.close();
            return;
        }

        // Create admin user
        console.log('🔐 Hashing password...');
        const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
        if (!adminPassword) {
            console.error("Error: DEFAULT_ADMIN_PASSWORD must be set in the .env file");
            await client.close();
            process.exit(1);
        }
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
        console.log('✅ Password hashed\n');

        const adminUser: AdminUser = {
            name: 'System Administrator',
            email: 'admin@example.com',
            password: hashedPassword,
            roles: ['admin'],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        console.log('💾 Inserting admin user...');
        await db.collection('users').insertOne(adminUser);
        console.log('✅ Admin user created successfully!\n');

        // Display credentials
        console.log('═══════════════════════════════════════════');
        console.log('🎉 ADMIN USER CREATED SUCCESSFULLY');
        console.log('═══════════════════════════════════════════');
        console.log('📧 Email:    admin@example.com');
        console.log('🔑 Password: [Set via DEFAULT_ADMIN_PASSWORD in .env]');
        console.log('👤 Role:     admin');
        console.log('═══════════════════════════════════════════\n');

        console.log('⚠️  IMPORTANT: Change this password immediately after first login!\n');
        console.log('🚀 You can now login using these credentials.\n');

        // Close connection
        await client.close();
        console.log('✅ Disconnected from MongoDB\n');

        process.exit(0);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error seeding admin user:', errorMessage);
        console.error('   1. Make sure MongoDB is running');
        console.error('   2. Check MONGODB_URI in .env file');
        console.error('   3. Verify database connection settings\n');

        if (client) {
            await client.close();
        }

        process.exit(1);
    }
}

seedAdmin();