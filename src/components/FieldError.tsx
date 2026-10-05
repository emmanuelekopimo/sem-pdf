export function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p id={id} className="field-error" role="alert">
      {messages[0]}
    </p>
  );
}
