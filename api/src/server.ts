
import fs from 'fs';
import path from 'path';
import app from './app';
import { query } from './db/index';

const PORT = process.env.PORT || 3000;

// Initialize DB Start
const initDb = async () => {
    try {
        const schemaPath = path.join(__dirname, 'db', 'schema.sql');
        // Check if file exists, if we are in dist vs src
        const resolvedPath = fs.existsSync(schemaPath)
            ? schemaPath
            : path.join(__dirname, '..', 'src', 'db', 'schema.sql'); 

        if (fs.existsSync(resolvedPath)) {
            const schema = fs.readFileSync(resolvedPath, 'utf-8');
            await query(schema);
            console.log('Database initialized successfully');
        } else {
            console.warn('Schema file not found, skipping initialization');
        }
    } catch (err) {
        console.error('Failed to initialize database:', err);
    }
};
// Initialize DB End

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
