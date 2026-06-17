import { Server, type ServerOptions, type Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';

let io: Server | undefined;

export const initSocket = (server: HttpServer, configs: Partial<ServerOptions> = {}) => {
    io = new Server(server, configs);
    return io;
};

export const getIo = () => {
    if (!io) {
        throw new Error('No such socket');
    }

    return io;
};

export type { Socket };
