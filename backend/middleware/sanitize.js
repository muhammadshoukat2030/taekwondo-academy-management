/**
 * Input Sanitization & Validation Middleware for Al Murtaza Shah Taekwondo API
 * Prevents XSS, NoSQL Injection, Malformed payloads, and strips hazardous HTML.
 */

// Recursive sanitization of strings within objects and arrays
const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    // Strip hazardous HTML tags and JavaScript protocols
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:[^"']*/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val !== null && typeof val === 'object') {
    const cleanObj = {};
    for (const [key, value] of Object.entries(val)) {
      // Prevent NoSQL key injection ($gt, $ne, __proto__)
      if (key.startsWith('$') || key === '__proto__' || key === 'constructor') {
        continue;
      }
      cleanObj[key] = sanitizeValue(value);
    }
    return cleanObj;
  }
  return val;
};

export const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params);
  }
  next();
};

// Helper for escaping regex search terms to prevent ReDoS / SyntaxError crashes
export const escapeRegex = (str = '') => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
};

// Helper for validating phone numbers (flexible for mobile, landline, or test numbers)
export const isValidPakPhone = (phone = '') => {
  if (!phone) return false;
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 7;
};

// Helper for validating CNIC / Form-B (flexible for varying digit formats)
export const isValidCNIC = (cnic = '') => {
  if (!cnic) return true; // Optional field
  const digits = cnic.replace(/[^0-9]/g, '');
  return digits.length >= 5;
};
