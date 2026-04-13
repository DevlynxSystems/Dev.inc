/**
 * User Model (Mongoose)
 *
 * This file defines the MongoDB schema and model for application users using Mongoose.
 * It is responsible for structuring how user data is stored, validated, and retrieved
 * from the MongoDB "users" collection.
 *
 * -----------------------------
 * USER SCHEMA FIELDS
 * -----------------------------
 *
 * name (String, required)
 * - The full name of the user.
 * - Automatically trimmed of whitespace.
 *
 * email (String, required, unique)
 * - The user's email address.
 * - Must be unique across all users.
 * - Automatically converted to lowercase and trimmed.
 *
 * password (String, required)
 * - The user's password (should be stored as a hashed value).
 *
 * role (String, required)
 * - Defines user permissions in the system.
 * - Allowed values: "user", "admin"
 * - Defaults to "user"
 *
 * phone (String)
 * - Optional phone number.
 * - Defaults to an empty string.
 *
 * address (Object)
 * - Nested object containing user address information:
 *   - line1: Primary address line
 *   - line2: Secondary address line (apartment, unit, etc.)
 *   - city: City name
 *   - state: State or province
 *   - postalCode: ZIP or postal code
 *   - country: Country name
 * - All fields are optional and default to empty strings.
 *
 * -----------------------------
 * TIMESTAMPS
 * -----------------------------
 * - Automatically managed by Mongoose.
 * - Adds:
 *   - createdAt (Date when document was created)
 *   - updatedAt (Date when document was last updated)
 *
 * -----------------------------
 * MODEL EXPORT
 * -----------------------------
 * - Exports a Mongoose model named "User".
 * - This model provides an interface for CRUD operations such as:
 *   - User.create()
 *   - User.find()
 *   - User.findById()
 *   - User.updateOne()
 *   - User.deleteOne()
 *
 * Collection name in MongoDB: "users"
 */



const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['user', 'admin'], default: 'user' },
    phone: { type: String, trim: true, default: '' },
    address: {
      line1: { type: String, trim: true, default: '' },
      line2: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      postalCode: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

