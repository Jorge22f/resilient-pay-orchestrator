import app from './app.js';
import { connectRedis } from './config/redis.js';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    try {
        await connectRedis();
        console.log('✅ Connected to Redis');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Startup failed:', err);
        process.exit(1);
    }
}

bootstrap();