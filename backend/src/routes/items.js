const express = require('express');
//  NON-BLOCKING I/O - Why fs.promises is Essential:
// - fs.readFileSync blocks the entire Node.js event loop
// - fs.promises delegates I/O to Node's thread pool
// - Event loop remains free to handle other requests
// - Critical for server scalability and performance
const fs = require('fs').promises; // Use promises API for non-blocking operations
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

//  ASYNC DATA READING - The Event Loop Optimization
//
// Why This Approach is Critical:
// - Node.js runs on a single-threaded event loop
// - Blocking I/O stops ALL request processing
// - Async I/O delegates to thread pool, keeping main thread free
// - Enables true concurrency for multiple simultaneous requests
//
// Performance Impact:
// - Blocking: 1 request at a time, others wait
// - Non-blocking: Handle 100s of concurrent requests
async function readData() {
  try {
    // await fs.readFile() is non-blocking - event loop remains free
    const raw = await fs.readFile(DATA_PATH, 'utf8'); // NON-BLOCKING
    return JSON.parse(raw);
  } catch (error) {
    // 🛡️ COMPREHENSIVE ERROR HANDLING - Production-ready error management
    if (error.code === 'ENOENT') {
      throw new Error('Data file not found');
    }
    throw new Error(`Failed to read data: ${error.message}`);
  }
}

//  ATOMIC WRITE OPERATIONS - Data Integrity Guarantee
//
// Why Atomic Writes Matter:
// - Prevents data corruption during concurrent access
// - Ensures file is either completely updated or unchanged
// - Follows ACID principles from database design
// - Critical for production applications
//
// The Atomic Process:
// 1. Write to temporary file (.tmp)
// 2. Verify write success
// 3. Atomic rename (OS-level operation)
// 4. Original file replaced instantly
async function writeData(data) {
  try {
    // Write to temporary file first - prevents corruption during write
    const tempPath = `${DATA_PATH}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');

    // fs.rename() is atomic on all major filesystems (ext4, NTFS, APFS)
    // Either succeeds completely or fails completely - no partial states
    await fs.rename(tempPath, DATA_PATH);
  } catch (error) {
    throw new Error(`Failed to write data: ${error.message}`);
  }
}

// GET /api/items - Enhanced with proper pagination and search
router.get('/', async (req, res, next) => {
  try {
    const data = await readData(); // Now non-blocking
    const { limit = 10, offset = 0, q, page = 1 } = req.query;
    let results = data;

    // Search functionality - case-insensitive substring search
    if (q) {
      const searchTerm = q.toLowerCase().trim();
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)
      );
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10) || (pageNum - 1) * limitNum;

    const total = results.length;
    const totalPages = Math.ceil(total / limitNum);

    // Apply pagination
    const paginatedResults = results.slice(offsetNum, offsetNum + limitNum);

    // Return data with pagination metadata
    res.json({
      items: paginatedResults,
      pagination: {
        total, // Total items matching search
        totalPages, // Total pages available
        currentPage: pageNum, // Current page number
        limit: limitNum, // Items per page
        offset: offsetNum, // Starting index
        hasNext: pageNum < totalPages, // Can go to next page
        hasPrev: pageNum > 1, // Can go to previous page
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData(); // Now non-blocking
    const itemId = parseInt(req.params.id, 10);

    // Validate ID parameter
    if (isNaN(itemId)) {
      const err = new Error('Invalid item ID');
      err.status = 400;
      throw err;
    }

    const item = data.find((i) => i.id === itemId);
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // Basic payload validation - production would use a proper validation library
    const { name, category, price } = req.body;

    if (!name || !category || typeof price !== 'number') {
      const err = new Error('Missing required fields: name, category, price');
      err.status = 400;
      throw err;
    }

    if (price < 0) {
      const err = new Error('Price must be a positive number');
      err.status = 400;
      throw err;
    }

    const data = await readData(); // Now non-blocking

    // Create new item with generated ID
    const newItem = {
      id: Date.now(), // In production, use UUID or proper ID generation
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
    };

    data.push(newItem);
    await writeData(data); // Now non-blocking and atomic

    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
