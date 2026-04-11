const { z } = require('zod');

/**
 * validate(schema) — Express middleware factory for Zod request body validation.
 * Usage: router.post('/route', validate(mySchema), controller)
 */
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        return res.status(400).json({
            message: 'Validation failed',
            errors,
        });
    }
    req.body = result.data; // Use parsed/coerced data
    next();
};

// ─── Schemas ────────────────────────────────────────────────────────────────

const registerSchema = z.object({
    name: z
        .string({ required_error: 'Name is required' })
        .min(2, 'Name must be at least 2 characters')
        .max(60, 'Name cannot exceed 60 characters')
        .trim(),
    email: z
        .string({ required_error: 'Email is required' })
        .email('Please provide a valid email address')
        .toLowerCase(),
    password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    nationality: z.string().optional().default('Not Specified'),
    language: z.string().optional().default('English'),
});

const loginSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .email('Please provide a valid email address')
        .toLowerCase(),
    password: z
        .string({ required_error: 'Password is required' })
        .min(1, 'Password is required'),
});

const itinerarySchema = z.object({
    city: z
        .string({ required_error: 'City is required' })
        .min(2, 'City name must be at least 2 characters')
        .max(100, 'City name is too long')
        .trim(),
    days: z.coerce
        .number({ required_error: 'Number of days is required' })
        .int('Days must be a whole number')
        .min(1, 'Minimum 1 day')
        .max(30, 'Maximum 30 days'),
    budget: z
        .enum(['budget', 'medium', 'luxury'], {
            errorMap: () => ({ message: 'Budget must be budget, medium, or luxury' }),
        })
        .optional()
        .default('medium'),
    interests: z.string().optional().default('general'),
});

const chatSchema = z.object({
    message: z
        .string({ required_error: 'Message is required' })
        .min(1, 'Message cannot be empty')
        .max(2000, 'Message too long (max 2000 characters)'),
});

const translateSchema = z.object({
    text: z
        .string({ required_error: 'Text is required' })
        .min(1, 'Text cannot be empty')
        .max(5000, 'Text too long (max 5000 characters)'),
    lang: z.string().optional().default('Hindi'),
});

const companionRequestSchema = z.object({
    destination: z.string().min(2).max(100).trim(),
    startDate: z.string().datetime({ message: 'Invalid start date' }).optional().or(z.string().min(1)),
    endDate: z.string().optional(),
    travelStyle: z.enum(['backpacker', 'budget', 'comfort', 'luxury']).optional(),
    message: z.string().max(500).optional(),
});

module.exports = {
    validate,
    registerSchema,
    loginSchema,
    itinerarySchema,
    chatSchema,
    translateSchema,
    companionRequestSchema,
};
