import express from 'express'
import router from './routes/productRoutes.js'
import cors from 'cors'
import path, {dirname} from 'path';
import { fileURLToPath } from 'url';
import cartRoutes from './routes/cartRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import bestSellerRoutes from './routes/bestSellerRoutes.js'

const app = express()
const PORT = process.env.PORT || 5000

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Middleware
app.use(express.json())
app.use(cors())

// Serve images from the images folder
app.use('/images', express.static(path.join(__dirname, 'images')));

// ✅ Use product routes
app.use('/api/products', router);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', orderRouter);
app.use('/api/bestseller', bestSellerRoutes)

app.listen(PORT, () => {
    console.log(`Server has started on port: ${PORT}`)
})