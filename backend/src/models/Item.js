const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    // Keep original id for compatibility with existing frontend
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      index: true, // Index for efficient category filtering
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    // Custom toJSON to maintain API compatibility
    toJSON: {
      transform: function (doc, ret) {
        // Remove MongoDB specific fields from API responses
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
  }
);

// Add text index for search functionality
ItemSchema.index(
  {
    name: 'text',
    category: 'text',
  },
  {
    weights: {
      name: 2, // Name matches are more important
      category: 1,
    },
  }
);

// Static method to get the next available ID
ItemSchema.statics.getNextId = async function () {
  const lastItem = await this.findOne({}, {}, { sort: { id: -1 } });
  return lastItem ? lastItem.id + 1 : 1;
};

// Instance method to validate price
ItemSchema.methods.validatePrice = function () {
  return this.price >= 0;
};

module.exports = mongoose.model('Item', ItemSchema);
