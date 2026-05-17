import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import Input from '../common/Input';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  registration?: UseFormRegisterReturn;
}

/**
 * FormField component that wraps Input with React Hook Form integration
 * Provides label, input, and error display in a single component
 */
const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, registration, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        label={label}
        error={error}
        helperText={helperText}
        {...registration}
        {...props}
      />
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
