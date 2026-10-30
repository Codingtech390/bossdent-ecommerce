"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface PincodeInfo {
  pincode: string;
  city: string;
  state: string;
  deliveryDays: number;
  codAvailable: boolean;
  freeShippingEligible: boolean;
}

interface PincodeContextType {
  currentPincode: PincodeInfo;
  isModalOpen: boolean;
  openPincodeModal: () => void;
  closePincodeModal: () => void;
  setPincode: (code: string) => Promise<{ success: boolean; message?: string }>;
}

const DEFAULT_PINCODE: PincodeInfo = {
  pincode: "110001",
  city: "New Delhi",
  state: "Delhi",
  deliveryDays: 2,
  codAvailable: true,
  freeShippingEligible: true,
};

// Recognized major dental hubs
const PINCODE_MAP: Record<string, Partial<PincodeInfo>> = {
  "110001": { city: "New Delhi", state: "Delhi", deliveryDays: 1, codAvailable: true },
  "110020": { city: "Okhla, New Delhi", state: "Delhi", deliveryDays: 1, codAvailable: true },
  "201301": { city: "Noida", state: "Uttar Pradesh", deliveryDays: 1, codAvailable: true },
  "400001": { city: "Mumbai", state: "Maharashtra", deliveryDays: 2, codAvailable: true },
  "560001": { city: "Bengaluru", state: "Karnataka", deliveryDays: 2, codAvailable: true },
  "600001": { city: "Chennai", state: "Tamil Nadu", deliveryDays: 3, codAvailable: true },
  "700001": { city: "Kolkata", state: "West Bengal", deliveryDays: 3, codAvailable: true },
  "500001": { city: "Hyderabad", state: "Telangana", deliveryDays: 2, codAvailable: true },
  "380001": { city: "Ahmedabad", state: "Gujarat", deliveryDays: 2, codAvailable: true },
  "160017": { city: "Chandigarh", state: "Chandigarh", deliveryDays: 2, codAvailable: true },
};

const PincodeContext = createContext<PincodeContextType>({
  currentPincode: DEFAULT_PINCODE,
  isModalOpen: false,
  openPincodeModal: () => {},
  closePincodeModal: () => {},
  setPincode: async () => ({ success: false }),
});

export function PincodeProvider({ children }: { children: React.ReactNode }) {
  const [currentPincode, setCurrentPincodeState] = useState<PincodeInfo>(DEFAULT_PINCODE);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dk_selected_pincode");
      if (saved) {
        setCurrentPincodeState(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const openPincodeModal = () => setIsModalOpen(true);
  const closePincodeModal = () => setIsModalOpen(false);

  const setPincode = async (code: string) => {
    const clean = code.trim();
    if (!/^\d{6}$/.test(clean)) {
      return { success: false, message: "Please enter a valid 6-digit Indian PIN code" };
    }

    const hub = PINCODE_MAP[clean] || {
      city: "Standard Clinic Zone",
      state: "India",
      deliveryDays: 3,
      codAvailable: true,
    };

    const newInfo: PincodeInfo = {
      pincode: clean,
      city: hub.city || "Clinic Area",
      state: hub.state || "India",
      deliveryDays: hub.deliveryDays || 3,
      codAvailable: hub.codAvailable ?? true,
      freeShippingEligible: true,
    };

    setCurrentPincodeState(newInfo);
    try {
      localStorage.setItem("dk_selected_pincode", JSON.stringify(newInfo));
    } catch {
      // ignore
    }

    setIsModalOpen(false);
    return { success: true };
  };

  return (
    <PincodeContext.Provider
      value={{
        currentPincode,
        isModalOpen,
        openPincodeModal,
        closePincodeModal,
        setPincode,
      }}
    >
      {children}
    </PincodeContext.Provider>
  );
}

export const usePincode = () => useContext(PincodeContext);
