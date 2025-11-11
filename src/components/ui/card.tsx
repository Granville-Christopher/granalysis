import React from "react";

export const Card: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  return (
    <div className={`p-4 rounded shadow bg-white ${className || ""}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="mb-2 font-bold">{children}</div>;

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <h3 className="text-lg font-semibold">{children}</h3>;

export const CardContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div>{children}</div>;
