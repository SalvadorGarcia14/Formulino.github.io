const SAVE_KEY = "formulino_save_v1";

export const loadGameData = () => {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.error("Error al cargar la partida guardada:", e);
        return null;
    }
};

export const saveGameData = (state) => {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch(error) {
        console.error("Error al persistir la partida:", error);
    }
};

export const clearGameData = () => {
    try {
        localStorage.removeItem(SAVE_KEY);
    } catch(error) {
        console.error("Error al borrar la partida guardada:", error);
    }   
};


