type FieldErrorTextProps = {
  id: string;
  message?: string;
};

export function FieldErrorText({ id, message }: FieldErrorTextProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-sm text-destructive" id={id}>
      {message}
    </p>
  );
}
