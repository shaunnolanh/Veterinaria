"use client";

import { createContext, useContext, useState } from "react";

interface CarritoContextType {
  carritoAbierto: boolean;
  setCarritoAbierto: (value: boolean) => void;
}

const CarritoContext = createContext<CarritoContextType>({
  carritoAbierto: false,
  setCarritoAbierto: () => {},
});

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  return (
    <CarritoContext.Provider value={{ carritoAbierto, setCarritoAbierto }}>
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => useContext(CarritoContext);