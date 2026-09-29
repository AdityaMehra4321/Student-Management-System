import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import { User, UserRole, StudentProfile, TeacherProfile, StaffProfile } from './types.js';

const JWT_SECRET = process.env.APP_SECRET || 'sms-dev-secret-key-388274917';

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
  staffProfile?: StaffProfile;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Generate simple tamper-proof signed token
export function createToken(user: User): string {
  const payload = {
    userId: user.id,
    role: user.role,
    username: user.username,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifyToken(token: string): { userId: string; role: UserRole; username: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(body).digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token missing. Please sign in.',
    });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      error: 'InvalidToken',
      message: 'Session has expired or token is invalid. Please sign in again.',
    });
  }

  const data = db.getRaw();
  const user = data.users.find(u => u.id === payload.userId);
  if (!user) {
    return res.status(401).json({
      error: 'UserNotFound',
      message: 'Account associated with token was not found.',
    });
  }

  // Attach profiles
  const student = data.students.find(s => s.userId === user.id);
  const teacher = data.teachers.find(t => t.userId === user.id);
  const staff = data.staff.find(st => st.userId === user.id);

  req.user = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    name: user.name,
    studentProfile: student,
    teacherProfile: teacher,
    staffProfile: staff,
  };

  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Record failed security access in audit log
      db.logAudit(
        req.user.id,
        req.user.name,
        req.user.role,
        'SECURITY_ACCESS_DENIED',
        'SYSTEM',
        req.path,
        `Forbidden attempt to access ${req.method} ${req.path}. Required: [${allowedRoles.join(', ')}], User had: ${req.user.role}`,
        req.ip || '127.0.0.1'
      );

      return res.status(403).json({
        error: 'Forbidden',
        message: `Backend security policy: Access denied. Only roles [${allowedRoles.join(', ')}] are permitted to perform this action. Your current role is '${req.user.role}'.`,
        requiredRoles: allowedRoles,
        currentRole: req.user.role,
      });
    }

    next();
  };
}
