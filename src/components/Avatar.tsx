import { createAvatar } from "@dicebear/core";
import { initials } from "@dicebear/collection";

/** Initials avatar generated locally with DiceBear (no network request). */
export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const uri = createAvatar(initials, {
    seed: name,
    backgroundColor: ["c00000", "065fd4", "2ba640", "7b3fe4", "e86a10", "00897b"],
    fontWeight: 500,
    radius: 50,
  }).toDataUri();
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="avatar" src={uri} width={size} height={size} alt={`${name} avatar`} />;
}
