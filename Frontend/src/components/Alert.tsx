// src/components/Alert.tsx
export const showAlert = (message: string) => {
    window.alert(message);
  };
  
  export const showConfirm = (message: string): boolean => {
    return window.confirm(message);
  };