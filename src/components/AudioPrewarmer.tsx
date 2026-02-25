"use client";

import { useSound } from "@/hooks/useSound";

export default function AudioPrewarmer() {
  // Calling useSound at the root ensures the global unlock listener
  // is active the moment the user interacts with ANY part of the app.
  useSound(true);
  return null;
}
