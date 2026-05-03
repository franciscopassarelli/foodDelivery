import React, { createContext, useContext, useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { getUserProfile, updateUserProfile } from '@/lib/firebase/users';

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  zipCode: string;
  instructions?: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: number;
  type: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface User {
  id: string;
  uid: string; 
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'delivery';
  phone?: string;
  address?: string;
  photoURL?: string;
  addresses?: Address[];
  paymentMethods?: PaymentMethod[];
  stats?: {
    total: number;
    completed: number;
    cancelled: number;
    favorite: string;
  };
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  updatePaymentMethod: (id: number, method: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (id: number) => void;
  updateUser: (newData: Partial<User>) => void;

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const storedUser = localStorage.getItem('foodDeliveryUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

const saveUser = (userData: User, persist = false) => {
  setUser(userData);
  localStorage.setItem('foodDeliveryUser', JSON.stringify(userData));

  if (persist) {
    updateUserProfile(userData.id, userData);
  }
};

const updateUser = (newData: Partial<User>) => {
  if (!user) return;

  const { role, ...safeData } = newData; // ❌ eliminás role

  const updatedUser = { ...user, ...safeData };

  saveUser(updatedUser);
};



  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const uid = credentials.user.uid;
      const profile = await getUserProfile(uid);

      if (profile) {
        const userData = { ...profile, id: uid, uid } as User;
        saveUser(userData);
        return userData;
      }

      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const credentials = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const uid = credentials.user.uid;

      const newUser: User = {
        id: uid,
        uid, // ✅ correcto
        name: userData.name,
        email: userData.email,
        role: 'customer',
        phone: userData.phone,
        address: userData.address,
        addresses: userData.address
          ? [
              {
                id: '1',
                name: 'Casa',
                street: userData.address,
                city: 'Buenos Aires',
                zipCode: '1000',
                isDefault: true,
              },
            ]
          : [],
        paymentMethods: [],
      };

      await updateUserProfile(uid, newUser);
      saveUser(newUser);
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = () => {
  signOut(auth);
  setUser(null);

  localStorage.removeItem('foodDeliveryUser');
  localStorage.removeItem(`foodDeliveryCart_${user?.id}`);
};

  // DIRECCIONES
  const addAddress = (newAddress: Omit<Address, 'id'>) => {
    if (!user) return;

    const address: Address = {
      ...newAddress,
      id: Date.now().toString(),
      isDefault: user.addresses?.length === 0 || newAddress.isDefault,
    };

    const updatedAddresses = user.addresses ? [...user.addresses] : [];

    if (address.isDefault) {
      updatedAddresses.forEach((addr) => (addr.isDefault = false));
    }

    updatedAddresses.push(address);
    const updatedUser = { ...user, addresses: updatedAddresses };
    saveUser(updatedUser);
  };

  const updateAddress = (id: string, addressUpdate: Partial<Address>) => {
    if (!user?.addresses) return;

    const updatedAddresses = user.addresses.map((addr) => {
      if (addr.id === id) {
        const updated = { ...addr, ...addressUpdate };
        if (updated.isDefault) {
          user.addresses.forEach((a) => {
            if (a.id !== id) a.isDefault = false;
          });
        }
        return updated;
      }
      return addr;
    });

    const updatedUser = { ...user, addresses: updatedAddresses };
    saveUser(updatedUser);
  };

  const deleteAddress = (id: string) => {
    if (!user?.addresses) return;

    const addressToDelete = user.addresses.find((addr) => addr.id === id);
    const updatedAddresses = user.addresses.filter((addr) => addr.id !== id);

    if (addressToDelete?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    const updatedUser = { ...user, addresses: updatedAddresses };
    saveUser(updatedUser);
  };

  const setDefaultAddress = (id: string) => {
    if (!user?.addresses) return;

    const updatedAddresses = user.addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }));

    const updatedUser = { ...user, addresses: updatedAddresses };
    saveUser(updatedUser);
  };

  // MÉTODOS DE PAGO
  const addPaymentMethod = (newMethod: Omit<PaymentMethod, 'id'>) => {
    if (!user) return;

    const newEntry: PaymentMethod = {
      ...newMethod,
      id: Date.now(),
    };

    const updatedMethods = user.paymentMethods ? [...user.paymentMethods] : [];

    if (newEntry.isDefault) {
      updatedMethods.forEach((m) => (m.isDefault = false));
    }

    updatedMethods.push(newEntry);
    const updatedUser = { ...user, paymentMethods: updatedMethods };
    saveUser(updatedUser);
  };

  const updatePaymentMethod = (id: number, updates: Partial<PaymentMethod>) => {
    if (!user?.paymentMethods) return;

    const updatedMethods = user.paymentMethods.map((method) => {
      if (method.id === id) {
        const updated = { ...method, ...updates };
        if (updated.isDefault) {
          user.paymentMethods.forEach((m) => {
            if (m.id !== id) m.isDefault = false;
          });
        }
        return updated;
      }
      return method;
    });

    const updatedUser = { ...user, paymentMethods: updatedMethods };
    saveUser(updatedUser);
  };

  const deletePaymentMethod = (id: number) => {
    if (!user?.paymentMethods) return;

    const methodToDelete = user.paymentMethods.find((m) => m.id === id);
    const updatedMethods = user.paymentMethods.filter((m) => m.id !== id);

    if (methodToDelete?.isDefault && updatedMethods.length > 0) {
      updatedMethods[0].isDefault = true;
    }

    const updatedUser = { ...user, paymentMethods: updatedMethods };
    saveUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
