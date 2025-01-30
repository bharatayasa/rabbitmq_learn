import { Client } from "pg";

export const client = new Client({
    host    : "localhost",
    port    : 5432,
    user    : "postgres",
    password: "root",
    database: "regenesis_admin_2",
});

export const initializeDB = async () => {
    try {
        await client.connect();
        console.log("Database connected!");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};
