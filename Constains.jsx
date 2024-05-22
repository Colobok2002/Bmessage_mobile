import { useEffect, useRef } from "react";

// export const ApiUrl = "http://localhost:8080"
export const ApiUrl = "https://evil-paths-sneeze.loca.lt"



export function useDebouncedFunction(func, delay, cleanUp = false) {
    const timeoutRef = useRef();
    const resultRef = useRef();
    const resolveRef = useRef();

    function clearTimer() {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
    }

    useEffect(() => (cleanUp ? clearTimer : undefined), [cleanUp]);

    return (...args) => {
        clearTimer();
        return new Promise((resolve, reject) => {
            resolveRef.current = resolve;
            timeoutRef.current = setTimeout(async () => {
                try {
                    const result = await func(...args);
                    resolve(result);
                    resultRef.current = result;
                } catch (error) {
                    reject(error);
                }
            }, delay);
        });
    };
}



export function formatDateTime(dateTimeString) {
    const dateTime = new Date(dateTimeString);
    const now = new Date();

    const isToday = dateTime.toDateString() === now.toDateString();
    const hours = dateTime.getHours().toString().padStart(2, '0');
    const minutes = dateTime.getMinutes().toString().padStart(2, '0');
    const day = dateTime.getDate().toString().padStart(2, '0');
    const month = (dateTime.getMonth() + 1).toString().padStart(2, '0');
    const formattedDate = `${day}:${month}`;
    const formattedTime = `${hours}:${minutes}`;
    return isToday ? formattedTime : `${formattedDate} ${formattedTime}`;
}

export function createWebSocketConnection({ socketUrl }) {

    return new Promise((resolve, reject) => {
        const socket = new WebSocket(`${ApiUrl.includes("127.0.0.1") ? "ws" : "wss"}://${ApiUrl.split('//')[1]}${socketUrl}`);

        socket.onopen = () => {
            resolve(socket);
        };

        socket.onclose = (event) => {
            reject(new Error(`WebSocket closed with code ${event.code}`));
        };

        socket.onerror = (error) => {
            reject(error);
        };
    });
}
