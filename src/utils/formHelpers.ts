import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FieldErrors } from 'react-hook-form';

/**
 * Get error message from React Hook Form field errors
 */
export const getErrorMessage = (
    errors: FieldErrors,
    fieldName: string
): string | undefined => {
    const error = errors[fieldName];
    return error?.message as string | undefined;
};

/**
 * Check if a field has an error
 */
export const hasError = (errors: FieldErrors, fieldName: string): boolean => {
    return !!errors[fieldName];
};

/**
 * Get all error messages from form errors
 */
export const getAllErrorMessages = (errors: FieldErrors): string[] => {
    return Object.values(errors)
        .map((error) => error?.message as string)
        .filter(Boolean);
};

/**
 * Create a resolver for React Hook Form from a Zod schema
 */
export const createResolver = <T extends z.ZodType<any, any>>(schema: T) => {
    return zodResolver(schema);
};

/**
 * Validate a single field value against a schema
 */
export const validateField = <T>(
    schema: z.ZodType<T>,
    value: unknown
): { success: boolean; error?: string } => {
    try {
        schema.parse(value);
        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.errors[0]?.message || 'Validation failed',
            };
        }
        return { success: false, error: 'Validation failed' };
    }
};

/**
 * Transform API errors to React Hook Form format
 */
export const transformApiErrors = (
    apiErrors: Record<string, string | string[]>
): Record<string, { message: string }> => {
    const formErrors: Record<string, { message: string }> = {};

    Object.entries(apiErrors).forEach(([field, error]) => {
        formErrors[field] = {
            message: Array.isArray(error) ? error[0] : error,
        };
    });

    return formErrors;
};

/**
 * Format form data for API submission
 * Removes empty strings and undefined values
 */
export const formatFormData = <T extends Record<string, any>>(
    data: T
): Partial<T> => {
    const formatted: Partial<T> = {};

    Object.entries(data).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
            formatted[key as keyof T] = value;
        }
    });

    return formatted;
};

/**
 * Check if form is dirty (has unsaved changes)
 */
export const isFormDirty = (
    dirtyFields: Record<string, boolean>
): boolean => {
    return Object.keys(dirtyFields).length > 0;
};
