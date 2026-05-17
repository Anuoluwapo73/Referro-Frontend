import { create } from 'zustand';

interface UIState {
    isSidebarOpen: boolean;
    isModalOpen: boolean;
    modalContent: React.ReactNode | null;
    toggleSidebar: () => void;
    openSidebar: () => void;
    closeSidebar: () => void;
    openModal: (content: React.ReactNode) => void;
    closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isSidebarOpen: false,
    isModalOpen: false,
    modalContent: null,

    toggleSidebar: () =>
        set((state) => ({
            isSidebarOpen: !state.isSidebarOpen,
        })),

    openSidebar: () =>
        set({
            isSidebarOpen: true,
        }),

    closeSidebar: () =>
        set({
            isSidebarOpen: false,
        }),

    openModal: (content) =>
        set({
            isModalOpen: true,
            modalContent: content,
        }),

    closeModal: () =>
        set({
            isModalOpen: false,
            modalContent: null,
        }),
}));

// Optimized selectors for component access
export const selectIsSidebarOpen = (state: UIState) => state.isSidebarOpen;
export const selectIsModalOpen = (state: UIState) => state.isModalOpen;
export const selectModalContent = (state: UIState) => state.modalContent;
