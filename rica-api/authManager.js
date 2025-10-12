/**
 * User Authentication and Account Management
 * 
 * This module handles user registration, login, and account management
 * using PostgreSQL as the primary authentication database
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import crypto from 'crypto';

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'rica_auth',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

class AuthManager {
  constructor() {
    this.initializeDatabase();
  }

  /**
   * Initialize authentication database tables
   */
  async initializeDatabase() {
    try {
      // Create users table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          avatar_url TEXT,
          is_active BOOLEAN DEFAULT true,
          is_verified BOOLEAN DEFAULT false,
          verification_token VARCHAR(255),
          reset_token VARCHAR(255),
          reset_token_expires TIMESTAMP,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create user_sessions table for session management
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          session_token VARCHAR(255) UNIQUE NOT NULL,
          device_info JSONB,
          ip_address INET,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create user_profiles table for extended user data
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          subscription_tier VARCHAR(50) DEFAULT 'pay-as-you-go',
          credits_remaining DECIMAL(10,2) DEFAULT 0,
          max_credits DECIMAL(10,2) DEFAULT 10,
          tenant_id VARCHAR(255),
          preferences JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('Authentication database initialized successfully');
    } catch (error) {
      console.error('Error initializing authentication database:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async registerUser(email, password, firstName, lastName) {
    try {
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Create user
      const result = await pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, verification_token)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, first_name, last_name, created_at
      `, [email, passwordHash, firstName, lastName, verificationToken]);

      const user = result.rows[0];

      // Create user profile
      await pool.query(`
        INSERT INTO user_profiles (user_id, subscription_tier, credits_remaining)
        VALUES ($1, 'pay-as-you-go', 10)
      `, [user.id]);

      // TODO: Send verification email
      console.log(`Verification email should be sent to ${email} with token: ${verificationToken}`);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          createdAt: user.created_at
        },
        message: 'User registered successfully. Please check your email for verification.'
      };
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Authenticate user login
   */
  async loginUser(email, password) {
    try {
      // Get user with password hash
      const result = await pool.query(`
        SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.is_active, u.is_verified,
               up.subscription_tier, up.credits_remaining, up.tenant_id
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.email = $1
      `, [email]);

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0];

      // Check if user is active
      if (!user.is_active) {
        throw new Error('Account is disabled');
      }

      // Check if user is verified
      if (!user.is_verified) {
        throw new Error('Please verify your email before logging in');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          subscriptionTier: user.subscription_tier
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Update last login
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Create session record
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await pool.query(`
        INSERT INTO user_sessions (user_id, session_token, expires_at)
        VALUES ($1, $2, $3)
      `, [user.id, sessionToken, expiresAt]);

      return {
        success: true,
        token,
        sessionToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          subscriptionTier: user.subscription_tier,
          creditsRemaining: parseFloat(user.credits_remaining),
          tenantId: user.tenant_id
        }
      };
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  /**
   * Verify user email
   */
  async verifyEmail(token) {
    try {
      const result = await pool.query(
        'UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1',
        [token]
      );

      if (result.rowCount === 0) {
        throw new Error('Invalid verification token');
      }

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const result = await pool.query(`
        SELECT u.id, u.email, u.first_name, u.last_name, u.last_login,
               up.subscription_tier, up.credits_remaining, up.tenant_id, up.preferences
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = $1
      `, [userId]);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return { success: true, user: result.rows[0] };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Update user credits
   */
  async updateUserCredits(userId, creditsToAdd) {
    try {
      await pool.query(
        'UPDATE user_profiles SET credits_remaining = credits_remaining + $1 WHERE user_id = $2',
        [creditsToAdd, userId]
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating user credits:', error);
      throw error;
    }
  }

  /**
   * Validate session token
   */
  async validateSession(sessionToken) {
    try {
      const result = await pool.query(`
        SELECT u.id, u.email, u.first_name, u.last_name, us.expires_at
        FROM user_sessions us
        JOIN users u ON us.user_id = u.id
        WHERE us.session_token = $1 AND us.expires_at > CURRENT_TIMESTAMP
      `, [sessionToken]);

      if (result.rows.length === 0) {
        return { valid: false };
      }

      return { valid: true, user: result.rows[0] };
    } catch (error) {
      console.error('Error validating session:', error);
      return { valid: false };
    }
  }

  /**
   * Logout user (invalidate session)
   */
  async logoutUser(sessionToken) {
    try {
      await pool.query(
        'DELETE FROM user_sessions WHERE session_token = $1',
        [sessionToken]
      );

      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }
}

export default new AuthManager();
