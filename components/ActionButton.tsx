import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  // FIX: Add 'danger' to the variant prop type to support more button styles.
  variant?: 'primary' | 'secondary' | 'danger';
}

const ActionButton: React.FC<ActionButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  // FIX: Use the variant prop directly to apply the corresponding CSS class. This is more scalable than the previous ternary operator.
  const finalClassName = `action-button ${variant} ${className}`;

  return (
    <button
      className={finalClassName}
      {...props}
    >
      {children}
    </button>
  );
};

export default ActionButton;
