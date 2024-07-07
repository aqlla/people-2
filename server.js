import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

switch (process.env.ENVIRONMENT) {
    case "development":
        const app = express();
        const port = process.env.PORT || 3000;
        const _filename = fileURLToPath(import.meta.url);
        const _dirname = path.dirname(_filename);
        
        app.use('/js', express.static(path.join(_dirname, 'js')));
        app.use('/dist', express.static(path.join(_dirname, 'dist')));
        app.use('/styles', express.static(path.join(_dirname, 'styles')));

        app.get('/', (req, res) => {
            res.sendFile(path.join(_dirname, '/index.html'));
        });

        app.get('/test.js', (req, res) => {
            res.sendFile(path.join(_dirname, '/test.js'));
        });

        app.listen(port);
}
