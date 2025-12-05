"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { createSystem, defaultConfig } from "@chakra-ui/react";
import { ReactNode } from "react";

const system = createSystem(defaultConfig);

export function Providers({ children }: { children: ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}

export default Providers;

