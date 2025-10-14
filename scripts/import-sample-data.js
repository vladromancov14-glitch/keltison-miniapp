#!/usr/bin/env node

// Import sample data from JSON file
const fs = require('fs');
const path = require('path');
const db = require('../config/database');
require('dotenv').config();

async function importSampleData() {
    try {
        console.log('📥 Starting sample data import...');
        
        // Connect to database
        await db.connect();
        
        // Read sample data
        const sampleDataPath = path.join(__dirname, '../database/keltison_sample_import.json');
        const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));
        
        // Import brands
        if (sampleData.brands && sampleData.brands.length > 0) {
            console.log('🏷️ Importing brands...');
            for (const brand of sampleData.brands) {
                try {
                    await db.query(
                        'INSERT INTO brands (name, logo_url, website) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
                        [brand.name, brand.logo_url, brand.website]
                    );
                } catch (error) {
                    console.log(`Brand ${brand.name} already exists or error:`, error.message);
                }
            }
        }
        
        // Import models
        if (sampleData.models && sampleData.models.length > 0) {
            console.log('📱 Importing models...');
            for (const model of sampleData.models) {
                try {
                    await db.query(
                        'INSERT INTO models (brand_id, category_id, name, description, image_url) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
                        [model.brand_id, model.category_id, model.name, model.description, model.image_url]
                    );
                } catch (error) {
                    console.log(`Model ${model.name} already exists or error:`, error.message);
                }
            }
        }
        
        // Import problems
        if (sampleData.problems && sampleData.problems.length > 0) {
            console.log('⚠️ Importing problems...');
            for (const problem of sampleData.problems) {
                try {
                    await db.query(
                        'INSERT INTO problems (category_id, name, description, severity) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
                        [problem.category_id, problem.name, problem.description, problem.severity]
                    );
                } catch (error) {
                    console.log(`Problem ${problem.name} already exists or error:`, error.message);
                }
            }
        }
        
        // Import instructions
        if (sampleData.instructions && sampleData.instructions.length > 0) {
            console.log('📋 Importing instructions...');
            for (const instruction of sampleData.instructions) {
                try {
                    await db.query(
                        `INSERT INTO instructions (
                            model_id, problem_id, title, description, difficulty, estimated_time,
                            tools_required, parts_required, cost_estimate, is_pro_pretent, 
                            steps, images, videos
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
                        ON CONFLICT DO NOTHING`,
                        [
                            instruction.model_id, instruction.problem_id, instruction.title,
                            instruction.description, instruction.difficulty, instruction.estimated_time,
                            instruction.tools_required || [], instruction.parts_required || [],
                            instruction.cost_estimate, instruction.is_pro_pretent || false,
                            JSON.stringify(instruction.steps || []), instruction.images || [],
                            instruction.videos || []
                        ]
                    );
                } catch (error) {
                    console.log(`Instruction ${instruction.title} already exists or error:`, error.message);
                }
            }
        }
        
        // Import partners
        if (sampleData.partners && sampleData.partners.length > 0) {
            console.log('🤝 Importing partners...');
            for (const partner of sampleData.partners) {
                try {
                    await db.query(
                        'INSERT INTO partners (name, website, logo_url, description, is_active) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO NOTHING',
                        [partner.name, partner.website, partner.logo_url, partner.description, partner.is_active !== false]
                    );
                } catch (error) {
                    console.log(`Partner ${partner.name} already exists or error:`, error.message);
                }
            }
        }
        
        console.log('✅ Sample data import completed!');
        
    } catch (error) {
        console.error('❌ Error importing sample data:', error);
        process.exit(1);
    } finally {
        await db.close();
    }
}

// Run import if called directly
if (require.main === module) {
    importSampleData();
}

module.exports = importSampleData;
